# Phase 2 Data Ingestion Walkthrough

## Summary of Accomplishments

We successfully completed the initial data ingestion step for the Large-Scale Solar Flare Forecasting project. The raw Multivariate Time Series SWAN-SF data (Partition 1) has been transformed and compressed for Big Data processing.

### What was changed:
1. **Removed Garbage Files**: We cleaned the `data/raw/partition1` directory by removing thousands of useless `:Zone.Identifier` files that were interfering with Hadoop's Path parsing.
2. **PySpark Ingestion Job (`src/jobs/ingest_swansf.py`)**: 
   - We created a PySpark job that reads the local TSV files.
   - It properly assigns `label = 1` to all M/X class flares derived from the `FL/` directory.
   - It properly assigns `label = 0` to all B/C/FQ instances derived from the `NF/` directory.
   - It unions the dataframes and writes the output locally to Parquet format.
3. **Data Compression**: We converted 73,492 separate TSV files into a unified dataset stored in `data/processed/partition1.parquet/`, heavily optimizing read times for future feature engineering.

## Validation Results

We executed a PySpark verification script directly against the generated Parquet files. Here are the results:

| Metric | Result |
|--------|--------|
| **Total Rows Processed** | 4,409,520 |
| **Label 0 (Negative) Count** | 4,334,280 |
| **Label 1 (Positive) Count** | 75,240 |
| **Class Distribution (Positive %)** | ~1.7% |

> [!TIP]
> The successful ingestion yields over 4.4 million time-series rows. The class imbalance matches the expected 1.7% target exactly, confirming our labels mapped correctly.

## Next Steps

With Partition 1 successfully ingested and optimized in Parquet format, we are ready to move on to Phase 3:
- Using Spark Window functions to extract rolling statistics (12h rolling mean, standard deviation, and slope) on the magnetic features.
- Integrating and joining the GOES Coronal Flux dataset if needed (though SWAN-SF already has label alignments, GOES background values might still be beneficial as features).

## Phase 3: Feature Engineering

### What was changed:
1. **Fixed Ingestion for Identifiers**: We uncovered a technical flaw where PySpark ignored filenames during ingestion, stripping the vital `HARPNUM` active region identifiers. We modified `src/jobs/ingest_swansf.py` to extract `HARPNUM` from `input_file_name()` via a regex mapping and quickly regenerated the base dataset.
2. **Rolling Window Engineering**: We implemented `src/jobs/feature_engineering.py`. This script applies a PySpark `Window` grouped by `HARPNUM` and ordered by `Timestamp` to calculate robust 12-hour rolling statistics (mean, standard deviation, and slope approximation) for key magnetic features like `USFLUX` and `R_VALUE`.
3. **Persistence**: The augmented dataset is now persistently saved in the project repository as `data/features/partition1_features.parquet`.

### Validation Results
We executed `verify_features.py` against active region `HARPNUM = 1235`. The PySpark output confirms that the rolling window calculations exactly match a 12-hour (60-interval) trailing aggregation, with slope correctly estimating the 12-hour delta and null standard deviations safely applying where historical data is insufficient.