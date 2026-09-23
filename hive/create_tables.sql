-- ==============================================================================
-- Solar Flare Prediction Project: Hive Database & Table DDL
-- Storage Architecture: HDFS -> Spark -> MLlib -> Hive
-- Warehouse Path: hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/
-- ==============================================================================

-- 1. Create and select Database
CREATE DATABASE IF NOT EXISTS solar_flare
COMMENT 'Solar Flare Prediction Model Benchmark & Inference Warehouse'
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db';

USE solar_flare;

-- 2. Model Experiments & Evaluation Metrics Table
-- Designed generically to support any model family (RF, XGBoost, etc.) and feature subset (SWAN+GOES, SWAN-only, GOES-only)
CREATE TABLE IF NOT EXISTS solar_flare.model_experiments (
    experiment_id STRING COMMENT 'Unique run identifier (e.g., RF_SWAN_GOES_P5_WT_0.45)',
    model_family STRING COMMENT 'Model architecture family: RandomForest, XGBoost, GBDT, etc.',
    feature_set STRING COMMENT 'Input feature subset: SWAN+GOES, SWAN-only, GOES-only',
    train_split STRING COMMENT 'Training partitions: P1-P3',
    eval_split STRING COMMENT 'Evaluation partition: P4_val, P5_test',
    is_weighted BOOLEAN COMMENT 'Whether class imbalance weighting was applied',
    weight_ratio DOUBLE COMMENT 'Weight applied to minority flare class',
    decision_threshold DOUBLE COMMENT 'Applied classification probability threshold',
    num_trees INT COMMENT 'Ensemble tree count',
    max_depth INT COMMENT 'Maximum tree depth',
    tss DOUBLE COMMENT 'True Skill Statistic (TPR - FPR)',
    tpr DOUBLE COMMENT 'True Positive Rate / Recall / Flare Hit Rate',
    fpr DOUBLE COMMENT 'False Positive Rate / False Alarm Rate',
    precision DOUBLE COMMENT 'Positive Predictive Value',
    f1_score DOUBLE COMMENT 'Harmonic mean of precision and recall',
    tp BIGINT COMMENT 'Count of True Positives (Correctly identified flares)',
    fp BIGINT COMMENT 'Count of False Positives (False alarms)',
    tn BIGINT COMMENT 'Count of True Negatives (Correctly identified quiet periods)',
    fn BIGINT COMMENT 'Count of False Negatives (Missed flares)',
    total_samples BIGINT COMMENT 'Total events evaluated in split',
    created_at TIMESTAMP COMMENT 'Experiment registration timestamp'
)
STORED AS PARQUET
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/model_experiments';

-- 3. Granular Event Inferences & Predictions Table
-- Stores observation-level probabilities and classifications
CREATE TABLE IF NOT EXISTS solar_flare.model_predictions (
    Timestamp TIMESTAMP COMMENT 'Observation timestamp (12-minute Cadence)',
    HARPNUM INT COMMENT 'NOAA Solar Active Region ID',
    actual_label INT COMMENT 'Ground truth class: 1 (Flare >= M-class), 0 (Quiet/No-Flare)',
    flare_prob DOUBLE COMMENT 'Model predicted flare probability [0.0 - 1.0]',
    predicted_label INT COMMENT 'Predicted class under calibrated decision threshold',
    model_family STRING COMMENT 'Model identifier: RandomForest',
    feature_set STRING COMMENT 'Input feature set: SWAN+GOES',
    eval_split STRING COMMENT 'Partition evaluated: P5_test',
    decision_threshold DOUBLE COMMENT 'Decision threshold applied (0.45)',
    is_weighted BOOLEAN COMMENT 'Flag indicating if weighted model was used'
)
STORED AS PARQUET
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/model_predictions';
