# Hive Operations, DDL & Analytical Queries Guide
## Solar Flare Prediction Project (Big Data Architecture)

This document provides a reference of the verified Hive DDL commands, data registration workflows, schema inspections, and analytical SQL queries. These artifacts demonstrate the complete **HDFS → Spark → MLlib → Hive** enterprise pipeline.

---

## 1. Architecture & Storage Configuration

* **Hive Warehouse Root in HDFS**: `hdfs://localhost:9000/user/hive/warehouse`
* **Project Database Location**: `hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/`
* **Storage Format**: Apache Parquet with Snappy compression (columnar format optimized for distributed analytical aggregations).

---

## 2. Hive DDL: Database & Table Creation

Saved in [`hive/create_tables.sql`](file:///Ubuntu/home/maaz/solar-flare-project/hive/create_tables.sql):

### A. Database Creation
```sql
CREATE DATABASE IF NOT EXISTS solar_flare
COMMENT 'Solar Flare Prediction Model Benchmark & Inference Warehouse'
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db';

USE solar_flare;
```

### B. Table 1: `solar_flare.model_experiments` (Experiment Tracker)
Designed generically to record any model family (`RandomForest`, `XGBoost`), feature subset (`SWAN+GOES`, `SWAN-only`, `GOES-only`), threshold, and performance metrics without schema restructuring:

```sql
CREATE TABLE IF NOT EXISTS solar_flare.model_experiments (
    experiment_id STRING COMMENT 'Unique run identifier',
    model_family STRING COMMENT 'Model architecture: RandomForest, XGBoost, etc.',
    feature_set STRING COMMENT 'Input features: SWAN+GOES, SWAN-only, GOES-only',
    train_split STRING COMMENT 'Training partitions: P1-P3',
    eval_split STRING COMMENT 'Evaluation partition: P4_val, P5_test',
    is_weighted BOOLEAN COMMENT 'Whether class imbalance weighting was applied',
    weight_ratio DOUBLE COMMENT 'Weight multiplier on minority flare class',
    decision_threshold DOUBLE COMMENT 'Classification probability threshold',
    num_trees INT COMMENT 'Ensemble tree count',
    max_depth INT COMMENT 'Maximum tree depth',
    tss DOUBLE COMMENT 'True Skill Statistic (TPR - FPR)',
    tpr DOUBLE COMMENT 'True Positive Rate / Recall / Flare Hit Rate',
    fpr DOUBLE COMMENT 'False Positive Rate / False Alarm Rate',
    precision DOUBLE COMMENT 'Positive Predictive Value',
    f1_score DOUBLE COMMENT 'Harmonic mean of precision and recall',
    tp BIGINT COMMENT 'Count of True Positives',
    fp BIGINT COMMENT 'Count of False Positives',
    tn BIGINT COMMENT 'Count of True Negatives',
    fn BIGINT COMMENT 'Count of False Negatives',
    total_samples BIGINT COMMENT 'Total events evaluated in split',
    created_at TIMESTAMP COMMENT 'Experiment registration timestamp'
)
STORED AS PARQUET
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/model_experiments';
```

### C. Table 2: `solar_flare.model_predictions` (Event Inferences)
Stores granular predictions alongside solar active region numbers (`HARPNUM`) and timestamps:

```sql
CREATE TABLE IF NOT EXISTS solar_flare.model_predictions (
    Timestamp TIMESTAMP COMMENT 'Observation timestamp (12-minute Cadence)',
    HARPNUM INT COMMENT 'NOAA Solar Active Region ID',
    actual_label INT COMMENT 'Ground truth: 1 (Flare >= M-class), 0 (Quiet)',
    flare_prob DOUBLE COMMENT 'Model predicted flare probability',
    predicted_label INT COMMENT 'Predicted binary label under calibrated threshold',
    model_family STRING COMMENT 'Model identifier: RandomForest',
    feature_set STRING COMMENT 'Input feature set: SWAN+GOES',
    eval_split STRING COMMENT 'Partition evaluated: P5_test',
    decision_threshold DOUBLE COMMENT 'Applied decision threshold',
    is_weighted BOOLEAN COMMENT 'Flag indicating if weighted model was used'
)
STORED AS PARQUET
LOCATION 'hdfs://localhost:9000/user/hive/warehouse/solar_flare.db/model_predictions';
```

---

## 3. Data Registration from Spark MLlib to Hive

In PySpark (configured with `.config("spark.sql.warehouse.dir", "hdfs://localhost:9000/user/hive/warehouse").enableHiveSupport()`):

```python
# 1. Register experiment benchmark metrics
exp_df.write.mode("append").insertInto("solar_flare.model_experiments")

# 2. Register event-level predictions for untouched Partition 5
predictions_df.write.mode("append").insertInto("solar_flare.model_predictions")
```

---

## 4. Key Analytical Queries & Real Verified Outputs

Saved in [`hive/analytical_queries.sql`](file:///Ubuntu/home/maaz/solar-flare-project/hive/analytical_queries.sql):

### Query A: Model Performance Leaderboard
```sql
SELECT 
    experiment_id,
    model_family,
    feature_set,
    is_weighted,
    decision_threshold,
    round(tss, 4) AS tss,
    round(tpr * 100, 2) AS recall_pct,
    round(fpr * 100, 2) AS false_alarm_pct,
    round(f1_score, 4) AS f1_score
FROM solar_flare.model_experiments
ORDER BY tss DESC;
```

**Real Execution Output:**
```text
+------------------------+------------+-----------+-----------+------------------+--------+----------+---------------+--------+
|experiment_id           |model_family|feature_set|is_weighted|decision_threshold|tss     |recall_pct|false_alarm_pct|f1_score|
+------------------------+------------+-----------+-----------+------------------+--------+----------+---------------+--------+
|RF_SWAN_GOES_P5_WT_0.45 |RandomForest|SWAN+GOES  |true       |0.45              |0.5753  |64.84%    |7.31%          |0.3837  |
|RF_SWAN_GOES_P5_WT_0.50 |RandomForest|SWAN+GOES  |true       |0.50              |0.5444  |60.62%    |6.18%          |0.3950  |
|RF_SWAN_GOES_P5_UNW_0.15|RandomForest|SWAN+GOES  |false      |0.15              |0.5224  |58.64%    |6.40%          |0.3780  |
|RF_SWAN_GOES_P5_UNW_0.50|RandomForest|SWAN+GOES  |false      |0.50              |0.1750  |17.89%    |0.40%          |0.2812  |
+------------------------+------------+-----------+-----------+------------------+--------+----------+---------------+--------+
```

---

### Query B: Confusion Matrix & Detection Counts on Partition 5
```sql
SELECT 
    experiment_id,
    decision_threshold,
    tp AS true_positives,
    fn AS missed_flares,
    fp AS false_positives,
    tn AS true_negatives,
    total_samples
FROM solar_flare.model_experiments;
```

**Real Execution Output:**
```text
+------------------------+------------------+--------------+-------------+---------------+--------------+-------------+
|experiment_id           |decision_threshold|true_positives|missed_flares|false_positives|true_negatives|total_samples|
+------------------------+------------------+--------------+-------------+---------------+--------------+-------------+
|RF_SWAN_GOES_P5_UNW_0.50|0.50              |1,521         |6,980        |796            |200,512       |209,809      |
|RF_SWAN_GOES_P5_UNW_0.15|0.15              |4,985         |3,516        |12,891         |188,417       |209,809      |
|RF_SWAN_GOES_P5_WT_0.50 |0.50              |5,153         |3,348        |12,437         |188,871       |209,809      |
|RF_SWAN_GOES_P5_WT_0.45 |0.45              |5,512         |2,989        |14,707         |186,601       |209,809      |
+------------------------+------------------+--------------+-------------+---------------+--------------+-------------+
```

---

### Query C: High-Confidence Event Predictions Sample
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
|2015-04-07 13:48:00|10201  |1           |0.1750    |0              |RandomForest|SWAN+GOES  |
|2015-04-07 14:48:00|10201  |1           |0.2382    |0              |RandomForest|SWAN+GOES  |
+-------------------+-------+------------+----------+---------------+------------+-----------+
```

---

## 5. Physical Storage Verification in HDFS

Verify that Hive tables are physically created and populated on HDFS:

```bash
hdfs dfs -ls -R /user/hive/warehouse/solar_flare.db
hdfs dfs -du -h /user/hive/warehouse/solar_flare.db
```

**Real Execution Output:**
```text
22.9 K  /user/hive/warehouse/solar_flare.db/model_experiments
 2.7 M  /user/hive/warehouse/solar_flare.db/model_predictions (209,809 rows)
```
