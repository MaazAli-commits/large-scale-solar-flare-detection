import argparse
import time
from pyspark.sql import SparkSession
import pyspark.sql.functions as F
from pyspark.ml.feature import VectorAssembler, Imputer
from pyspark.ml.classification import RandomForestClassifier
from pyspark.ml.evaluation import MulticlassClassificationEvaluator, BinaryClassificationEvaluator

def main():
    print("Starting ML Training Pipeline (Phase 4)...")
    spark = SparkSession.builder \
        .appName("SWAN-GOES-Training") \
        .config("spark.driver.memory", "8g") \
        .config("spark.executor.memory", "8g") \
        .getOrCreate()
        
    start_time = time.time()
    
    # 1. Load Data
    input_path = "file:///home/maaz/solar-flare-project/data/features/partition1_final.parquet"
    print(f"Reading data from {input_path}")
    df = spark.read.parquet(input_path)
    
    # 2. Target Variable is already 'label' (0 or 1). Cast to Double for MLlib.
    df = df.withColumn("label", F.col("label").cast("double"))
    
    # Identify feature columns (Exclude metadata, targets, and strings)
    # We deliberately retain historical counts like MFLARE as they represent the observation window past, not the target future.
    exclude_cols = ["Timestamp", "label", "filename", "BFLARE_LABEL", "CFLARE_LABEL", "MFLARE_LABEL", 
                    "XFLARE_LABEL", "BFLARE_LABEL_LOC", "CFLARE_LABEL_LOC", "MFLARE_LABEL_LOC", 
                    "XFLARE_LABEL_LOC", "XR_QUAL", "IS_TMFI", "match_pos", "xrsa_quality", "xrsb_quality",
                    "ts_seconds", "HARPNUM"]
                    
    feature_cols = [c.name for c in df.schema.fields if c.name not in exclude_cols and c.dataType.typeName() in ["double", "integer", "float", "long"]]
    
    print(f"Selected {len(feature_cols)} features for training.")
    
    # 3. Class Balancing Weights
    print("Calculating class weights...")
    total_count = df.count()
    pos_count = df.filter(F.col("label") == 1.0).count()
    neg_count = total_count - pos_count
    
    print(f"Total: {total_count}, Pos: {pos_count}, Neg: {neg_count}")
    
    weight_0 = total_count / (2.0 * neg_count)
    weight_1 = total_count / (2.0 * pos_count)
    print(f"Class Weights -> Label 0: {weight_0:.4f}, Label 1: {weight_1:.4f}")
    
    df_weighted = df.withColumn("class_weight", F.when(F.col("label") == 1.0, weight_1).otherwise(weight_0))
    
    # 4. Chronological Split (Leakage-Safe)
    print("Performing chronological train/test split (80/20)...")
    # approxQuantile returns a list. We take the 80th percentile of ts_seconds.
    quantiles = df_weighted.approxQuantile("ts_seconds", [0.8], 0.01)
    split_ts = quantiles[0]
    print(f"Chronological split threshold (ts_seconds): {split_ts}")
    
    train_df = df_weighted.filter(F.col("ts_seconds") <= split_ts)
    test_df = df_weighted.filter(F.col("ts_seconds") > split_ts)
    print(f"Train size: {train_df.count()}, Test size: {test_df.count()}")
    
    # 5. Handle Nulls using Median Imputation (Fit ONLY on Train!)
    print("Imputing missing values (fitting only on train set)...")
    imputer = Imputer(inputCols=feature_cols, outputCols=[c + "_imputed" for c in feature_cols]).setStrategy("median")
    imputer_model = imputer.fit(train_df)
    
    train_df = imputer_model.transform(train_df)
    test_df = imputer_model.transform(test_df)
    
    imputed_feature_cols = [c + "_imputed" for c in feature_cols]
    
    # 6. Vectorization
    print("Assembling feature vectors...")
    assembler = VectorAssembler(inputCols=imputed_feature_cols, outputCol="features")
    train_df = assembler.transform(train_df)
    test_df = assembler.transform(test_df)
    
    # Cache to speed up training and evaluation
    train_df.cache()
    test_df.cache()
    
    evaluator_f1 = MulticlassClassificationEvaluator(labelCol="label", predictionCol="prediction", metricName="f1")
    evaluator_pr = BinaryClassificationEvaluator(labelCol="label", rawPredictionCol="rawPrediction", metricName="areaUnderPR")
    evaluator_roc = BinaryClassificationEvaluator(labelCol="label", rawPredictionCol="rawPrediction", metricName="areaUnderROC")
    
    def evaluate_model(predictions, name):
        f1 = evaluator_f1.evaluate(predictions)
        pr_auc = evaluator_pr.evaluate(predictions)
        roc_auc = evaluator_roc.evaluate(predictions)
        
        tp = predictions.filter((F.col("label") == 1.0) & (F.col("prediction") == 1.0)).count()
        tn = predictions.filter((F.col("label") == 0.0) & (F.col("prediction") == 0.0)).count()
        fp = predictions.filter((F.col("label") == 0.0) & (F.col("prediction") == 1.0)).count()
        fn = predictions.filter((F.col("label") == 1.0) & (F.col("prediction") == 0.0)).count()
        
        tpr = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        fpr = fp / (fp + tn) if (fp + tn) > 0 else 0.0
        tss = tpr - fpr
        
        print(f"--- TEST SET RESULTS ({name}) ---")
        print(f"F1 Score: {f1:.4f}")
        print(f"PR-AUC:   {pr_auc:.4f}")
        print(f"ROC-AUC:  {roc_auc:.4f}")
        print(f"TSS:      {tss:.4f} (TPR: {tpr:.4f}, FPR: {fpr:.4f})")
        print(f"Confusion Matrix: TP={tp}, TN={tn}, FP={fp}, FN={fn}")
        return f1, tss
    
    # 7. Training (Weighted)
    print("Training Random Forest Classifier (Weighted)...")
    rf_weighted = RandomForestClassifier(labelCol="label", featuresCol="features", weightCol="class_weight", numTrees=100, maxDepth=10, seed=42)
    rf_model_w = rf_weighted.fit(train_df)
    predictions_w = rf_model_w.transform(test_df)
    predictions_w.cache()
    evaluate_model(predictions_w, "WEIGHTED")
    
    # 8. Training (Unweighted)
    print("Training Random Forest Classifier (Unweighted)...")
    rf_unweighted = RandomForestClassifier(labelCol="label", featuresCol="features", numTrees=100, maxDepth=10, seed=42)
    rf_model_un = rf_unweighted.fit(train_df)
    predictions_un = rf_model_un.transform(test_df)
    predictions_un.cache()
    evaluate_model(predictions_un, "UNWEIGHTED")
    
    # 9. Persistence
    model_out = "file:///home/maaz/solar-flare-project/models/flare_rf_model"
    print(f"Saving BEST model to {model_out} (Saving Weighted for now)")
    rf_model_w.write().overwrite().save(model_out)
    
    print(f"Training completed in {time.time() - start_time:.2f} seconds.")
    spark.stop()

if __name__ == "__main__":
    main()
