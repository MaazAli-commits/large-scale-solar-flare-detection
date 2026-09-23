# Large-Scale Solar Flare Forecasting Using Distributed Machine Learning

## Phase 3: Feature Engineering Plan

### Background
In Phase 2, we successfully ingested the raw TSV files for Partition 1, labeled them, and saved them as a unified Parquet dataset (`/home/maaz/solar-flare-project/data/processed/partition1.parquet`). 

The next phase (Phase 3) is Feature Engineering. We will process this time-series data using PySpark Window functions to generate rolling temporal features.

### User Review Required

> [!IMPORTANT]
> The GOES Coronal data has not been ingested yet. According to the original plan, we need GOES features: "24h rolling max flux, 12h background mean, and 1h flux derivative". 
> 
> However, I suggest we first implement the feature engineering script exclusively for the **Magnetic Features** (SWAN-SF) to validate the rolling window logic. Once verified, we can ingest the GOES data and join it. Please review this approach.

### Proposed Changes

#### [NEW] `src/jobs/feature_engineering.py`
A PySpark script that will:
1. Load the `partition1.parquet` dataset.
2. Define a PySpark `Window` partitioned by `HARPNUM` (the unique active region identifier) and ordered by `Timestamp`.
3. Apply rolling window aggregations over the past 12 hours (since our data is in 12-minute intervals, 12 hours = 60 rows):
   - **12h Rolling Mean** of `USFLUX` and `R_VALUE`
   - **12h Standard Deviation** of `USFLUX` and `R_VALUE`
   - **Slope (Derivative)** of `USFLUX` and `R_VALUE` over the last 12 hours.
4. Save the enriched dataset to `/home/maaz/solar-flare-project/data/features/partition1_features.parquet`.

## Verification Plan
1. We will execute `spark-submit src/jobs/feature_engineering.py`.
2. We will write a verification script to inspect a single `HARPNUM` to ensure the rolling means and standard deviations were calculated correctly without data leakage (no lookahead).
3. The resulting feature parquet file will be saved directly in the project repository structure.
