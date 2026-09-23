# Hive Integration Guide & Architecture
## Solar Flare Prediction Project (Big Data Architecture)

This document details the Hive data warehouse integration that completes the **HDFS → Spark → MLlib → Hive** enterprise pipeline.

---

## 1. Storage Location & Database Architecture

* **Database**: `solar_flare`
* **HDFS Physical Location**: `hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/`
* **Storage Format**: Apache Parquet (Snappy-compressed, columnar storage for high-speed analytical queries)

---

## 2. Generic Hive Schema Design

The tables are designed generically to accommodate any future machine learning models (e.g., Random Forest, XGBoost, GBDT), feature subsets (e.g., `SWAN+GOES`, `SWAN-only`, `GOES-only`), and dataset splits without requiring schema migrations.

### Table 1: `solar_flare.model_experiments`
Stores aggregate evaluation metrics and hyperparameters for every experiment run.

```sql
CREATE TABLE IF NOT EXISTS solar_flare.model_experiments (
    experiment_id STRING,
    model_family STRING,         -- e.g. 'RandomForest', 'XGBoost', 'LogisticRegression'
    feature_set STRING,          -- e.g. 'SWAN+GOES', 'SWAN-only', 'GOES-only'
    train_split STRING,          -- e.g. 'P1-P3'
    eval_split STRING,           -- e.g. 'P4_val', 'P5_test'
    is_weighted BOOLEAN,         -- True if class weighting applied
    weight_ratio DOUBLE,         -- Ratio of negative to positive weight
    decision_threshold DOUBLE,   -- Decision boundary (e.g. 0.15, 0.45, 0.50)
    num_trees INT,               -- Hyperparameters
    max_depth INT,
    tss DOUBLE,                  -- True Skill Statistic (TPR - FPR)
    tpr DOUBLE,                  -- Recall / Hit Rate
    fpr DOUBLE,                  -- False Alarm Rate
    precision DOUBLE,            -- Precision
    f1_score DOUBLE,             -- F1 Score
    tp BIGINT,                   -- Confusion Matrix Values
    fp BIGINT,
    tn BIGINT,
    fn BIGINT,
    total_samples BIGINT,        -- Evaluation sample size
    created_at TIMESTAMP         -- Ingestion timestamp
)
STORED AS PARQUET;
```

---

### Table 2: `solar_flare.model_predictions`
Stores granular, event-level inferences with active region IDs and timestamps for space weather forecasting validation.

```sql
CREATE TABLE IF NOT EXISTS solar_flare.model_predictions (
    Timestamp TIMESTAMP,         -- Observation timestamp
    HARPNUM INT,                 -- Solar Active Region number
    actual_label INT,            -- Ground truth (1 = Flare, 0 = No-Flare)
    flare_prob DOUBLE,           -- Predicted probability of solar flare
    predicted_label INT,         -- Binary decision based on tuned threshold
    model_family STRING,         -- Model identifier ('RandomForest')
    feature_set STRING,          -- Feature set ('SWAN+GOES')
    eval_split STRING,           -- Split ('P5_test')
    decision_threshold DOUBLE,   -- Applied threshold (0.45)
    is_weighted BOOLEAN          -- Class-weighted flag
)
STORED AS PARQUET;
```

---

## 3. Verified Hive Query Outputs

### Query 1: Benchmark Experiments Table (`model_experiments`)
```sql
SELECT experiment_id, model_family, feature_set, is_weighted, decision_threshold, 
       round(tss, 4) as tss, round(tpr, 4) as recall, round(fpr, 4) as fpr, round(f1_score, 4) as f1 
FROM solar_flare.model_experiments;
```

**Real Execution Output:**
```text
+------------------------+------------+-----------+-----------+------------------+------+------+------+------+
|experiment_id           |model_family|feature_set|is_weighted|decision_threshold|tss   |recall|fpr   |f1    |
+------------------------+------------+-----------+-----------+------------------+------+------+------+------+
|RF_SWAN_GOES_P5_UNW_0.50|RandomForest|SWAN+GOES  |false      |0.5               |0.175 |0.1789|0.004 |0.2812|
|RF_SWAN_GOES_P5_UNW_0.15|RandomForest|SWAN+GOES  |false      |0.15              |0.5224|0.5864|0.064 |0.378 |
|RF_SWAN_GOES_P5_WT_0.50 |RandomForest|SWAN+GOES  |true       |0.5               |0.5444|0.6062|0.0618|0.395 |
|RF_SWAN_GOES_P5_WT_0.45 |RandomForest|SWAN+GOES  |true       |0.45              |0.5753|0.6484|0.0731|0.3837|
+------------------------+------------+-----------+-----------+------------------+------+------+------+------+
```

---

### Query 2: Sample Predictions Table (`model_predictions`)
```sql
SELECT Timestamp, HARPNUM, actual_label, round(flare_prob, 4) as flare_prob, predicted_label, model_family, feature_set
FROM solar_flare.model_predictions
WHERE actual_label = 1
LIMIT 5;
```

**Real Execution Output:**
```text
+-------------------+-------+------------+----------+---------------+------------+-----------+
|Timestamp          |HARPNUM|actual_label|flare_prob|predicted_label|model_family|feature_set|
+-------------------+-------+------------+----------+---------------+------------+-----------+
|2015-04-07 06:00:00|10201  |1           |0.2442    |0              |RandomForest|SWAN+GOES  |
|2015-04-07 06:12:00|10201  |1           |0.2419    |0              |RandomForest|SWAN+GOES  |
|2015-04-07 13:00:00|10201  |1           |0.1841    |0              |RandomForest|SWAN+GOES  |
|2015-04-07 13:48:00|10201  |1           |0.175     |0              |RandomForest|SWAN+GOES  |
|2015-04-07 14:48:00|10201  |1           |0.2382    |0              |RandomForest|SWAN+GOES  |
+-------------------+-------+------------+----------+---------------+------------+-----------+
```

---

## 4. HDFS Storage Verification

```bash
hdfs dfs -du -h /user/hive/warehouse/solar_flare.db
```

**Real Execution Output:**
```text
22.9 K  68.6 K  /user/hive/warehouse/solar_flare.db/model_experiments
2.7 M   8.1 M   /user/hive/warehouse/solar_flare.db/model_predictions
```
