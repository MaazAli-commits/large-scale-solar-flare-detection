-- ==============================================================================
-- Solar Flare Prediction Project: Analytical & Verification Hive Queries
-- Demonstration queries for presentation & model inspection
-- ==============================================================================

USE solar_flare;

-- ------------------------------------------------------------------------------
-- 1. Metadata & Schema Verification
-- ------------------------------------------------------------------------------

-- List all tables in solar_flare database
SHOW TABLES IN solar_flare;

-- Inspect physical table storage, SerDe, and HDFS location
DESCRIBE FORMATTED solar_flare.model_experiments;
DESCRIBE FORMATTED solar_flare.model_predictions;


-- ------------------------------------------------------------------------------
-- 2. Model Performance Leaderboard (Ranked by TSS)
-- Compares Baseline vs. Decision-Threshold Tuned vs. Class-Weighted Models on P5
-- ------------------------------------------------------------------------------
SELECT 
    experiment_id,
    model_family,
    feature_set,
    is_weighted,
    decision_threshold,
    round(tss, 4) AS tss,
    round(tpr * 100, 2) AS recall_pct,
    round(fpr * 100, 2) AS false_alarm_pct,
    round(precision * 100, 2) AS precision_pct,
    round(f1_score, 4) AS f1_score
FROM solar_flare.model_experiments
ORDER BY tss DESC;


-- ------------------------------------------------------------------------------
-- 3. Confusion Matrix Breakdown & Flare Counts
-- Demonstrates the increase in detected flares (TP) across configurations
-- ------------------------------------------------------------------------------
SELECT 
    experiment_id,
    decision_threshold,
    tp AS true_positives,
    fn AS missed_flares,
    fp AS false_positives,
    tn AS true_negatives,
    total_samples
FROM solar_flare.model_experiments;


-- ------------------------------------------------------------------------------
-- 4. High-Confidence Flare Detections (Top Probabilities)
-- Displays events predicted with highest flare certainty
-- ------------------------------------------------------------------------------
SELECT 
    Timestamp,
    HARPNUM AS active_region,
    actual_label,
    predicted_label,
    round(flare_prob, 4) AS flare_probability,
    model_family,
    feature_set
FROM solar_flare.model_predictions
WHERE actual_label = 1 AND predicted_label = 1
ORDER BY flare_prob DESC
LIMIT 10;


-- ------------------------------------------------------------------------------
-- 5. Active Region (HARPNUM) Risk Aggregation
-- Aggregates flare activity by solar active region to detect flaring complexes
-- ------------------------------------------------------------------------------
SELECT 
    HARPNUM AS active_region,
    COUNT(*) AS total_observations,
    SUM(actual_label) AS actual_flares,
    SUM(predicted_label) AS predicted_flares,
    round(AVG(flare_prob), 4) AS avg_flare_risk
FROM solar_flare.model_predictions
GROUP BY HARPNUM
HAVING SUM(actual_label) > 10
ORDER BY actual_flares DESC
LIMIT 10;


-- ------------------------------------------------------------------------------
-- 6. Overall Row Count Verification
-- ------------------------------------------------------------------------------
SELECT 'model_experiments' AS table_name, COUNT(*) AS total_rows FROM solar_flare.model_experiments
UNION ALL
SELECT 'model_predictions' AS table_name, COUNT(*) AS total_rows FROM solar_flare.model_predictions;
