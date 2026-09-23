# Project Proposal: Multi-Modal Big Data Pipeline for Operational Solar Flare Forecasting
## Integration of SDO/HMI Active-Region Magnetograms (SWAN-SF) & NOAA GOES Solar X-Ray Flux
**Course**: CSE412: Big Data Analytics  
**Academic Term**: Fall 2026  
**Team Members (Group of 3)**:
* **Mohammed Maaz Ali**
* **Vidya**
* **Roshan**

---

## 1. Executive Summary & Problem Motivation

Solar flares are violent eruptions in the Sun's atmosphere caused by the sudden release of magnetic energy stored in active regions. High-energy X-rays and Extreme Ultraviolet (EUV) radiation emitted during $\ge$ M-class flares ionize Earth's upper atmosphere within 8 minutes of eruption, inducing severe consequences for modern technological infrastructure:
* **High-Frequency (HF) Radio Communication Blackouts**: Disruption of trans-polar aviation routes and maritime navigation.
* **Satellite Operations**: Increased atmospheric drag, surface charging, and sensor degradation in Low Earth Orbit (LEO).
* **Electrical Power Grids**: Geomagnetically induced currents (GICs) that can saturate power transformers and cause widespread grid instability.

### The Scientific Challenge
Operational space weather agencies (such as NOAA's Space Weather Prediction Center) require reliable 24-hour advance warning of major solar flares. Historically, predictive models have relied almost exclusively on photospheric magnetic field parameters extracted from SDO/HMI magnetograms (SWAN-SF). 

However, **magnetic complexity alone acts as an energy reservoir, not an eruption trigger**. Active regions can store immense free magnetic energy for days without erupting. Conversely, whole-disk soft X-ray background flux from NOAA GOES satellites tracks pre-flare thermal brightenings and localized coronal reconnection. 

### Core Project Hypothesis
> Fusing high-cadence coronal X-ray flux dynamics (NOAA GOES) with photospheric magnetic field parameters (SDO/HMI SWAN-SF) within a distributed Big Data architecture will significantly reduce false alarms and increase operational flare forecasting accuracy across the solar cycle.

---

## 2. Multi-Modal Datasets & Ingestion Strategy

This project integrates two primary space weather datasets totaling over 837,000 multi-variate records:

### 2.1 Primary Dataset: SDO/HMI SWAN-SF
* **Source**: Solar Dynamics Observatory / Helioseismic and Magnetic Imager (SDO/HMI), distributed via Harvard Dataverse.
* **Nature**: Multivariate time-series of solar active regions sampled at a 12-minute cadence across 5 chronologically ordered partitions (`Partition 1` through `Partition 5`).
* **Features (44 Parameters)**: Photospheric magnetic field summaries including Total Unsigned Vertical Current (`TOTUSJH`), Unsigned Magnetic Flux (`USFLUX`), Maximum Shear Angle, and Area of Active Region.
* **Target Label**: Binary classification of whether an M- or X-class flare occurs within the upcoming 24 hours (`1 = Flare \ge M1.0`, `0 = Quiet/No-Flare`).

### 2.2 Secondary Dataset: NOAA GOES-15 Solar X-Ray Flux
* **Source**: NOAA National Centers for Environmental Information (NCEI).
* **Nature**: High-cadence (1-minute) full-disk soft X-ray irradiance measured in two spectral bands:
  * `xrsa`: Short channel (0.05 – 0.4 nm)
  * `xrsb`: Long channel (0.1 – 0.8 nm)
* **Engineered Features (5 Parameters)**:
  * 1-hour rate of change / derivative (`goes_xrsb_1h_derivative`)
  * 12-hour trailing rolling mean (`goes_xrsb_mean_12h`)
  * 24-hour trailing rolling peak flux (`goes_xrsb_max_24h`)
  * Raw calibrated background flux (`xrsa`, `xrsb`)

---

## 3. Big Data System Architecture & Tool Justifications

Given the dataset size (~8.9 GB raw TSVs) and continuous time-series joins, traditional single-node Python/Pandas workflows suffer from out-of-memory crashes and prohibitive training runtimes. We employ a 4-tier distributed Big Data architecture:

```mermaid
graph LR
    A[Raw SWAN-SF & GOES Data] --> B[Apache Hadoop HDFS]
    B --> C[Apache Spark MLlib]
    C --> D[Apache Hive Metastore]
    D --> E[Spark SQL & Analytics]
```

### 3.1 Distributed Storage: Apache Hadoop HDFS
* **Role**: Centralized distributed file system storing partitioned Parquet files at `hdfs://localhost:9000/solar_flare/data/features/`.
* **Justification**: HDFS provides block-level fault tolerance, parallel split reading for Spark executors, and high-throughput streaming reads for large Parquet files.

### 3.2 Distributed Compute: Apache Spark 3.5 & PySpark MLlib
* **Role**: In-memory distributed data processing, rolling window temporal joins, median imputation, and ensemble training.
* **Justification**: Spark's DAG execution engine and in-memory RDD/DataFrame caching allow iterative Random Forest tree building across 500,000+ training records in minutes, scaling far beyond single-core scikit-learn.

### 3.3 Storage Format: Apache Parquet + Snappy Compression
* **Role**: Columnar storage format for all feature partitions.
* **Justification**: Reduces storage footprint by >75% compared to raw CSV/TSV, enables columnar projection pruning (only loading the 49 needed features), and supports predicate pushdown.

### 3.4 Data Warehouse & Metastore: Apache Hive 4.0
* **Role**: Schema-on-read metastore cataloging experiment benchmark runs (`solar_flare.model_experiments`) and event-level test predictions (`solar_flare.model_predictions`).
* **Justification**: Decouples metadata from compute, enabling standardized SQL auditing across all model versions.

---

## 4. Machine Learning Formulation & Methodological Rigor

### 4.1 Strict Chronological Splitting (Zero Temporal Leakage)
Random K-fold cross-validation in solar flare forecasting creates severe data leakage because adjacent 12-minute magnetograms from the same active region bleed across folds. We enforce a **strict chronological partition protocol**:
* **Training Set**: Partitions 1, 2, and 3 (`P1–P3`): **518,803 samples**
* **Validation Set**: Partition 4 (`P4`): **108,814 samples** (Hyperparameter search and threshold calibration)
* **Untouched Test Set**: Partition 5 (`P5`): **209,809 samples** (Blind out-of-sample evaluation)

### 4.2 Handling Class Imbalance
Major solar flares account for only ~4–5% of physical observations (~13.17:1 negative-to-positive ratio). We implement instance class weighting within the Spark MLlib loss function to penalize missed flares.

### 4.3 Evaluation Metrics
* **True Skill Statistic (TSS = TPR − FPR)**: The gold standard space weather benchmark, invariant to class imbalance base rates.
* **Precision-Recall Area (PR-AUC)**: Measures operational precision across all threshold levels under heavy class imbalance.
* **Flare Recall (TPR)**, **False Alarm Rate (FPR)**, **Precision**, and **F1-Score**.

---

## 5. Project Milestones & Work Distribution

| Phase | Milestone Description | Target Timeline | Primary Lead |
| :--- | :--- | :---: | :--- |
| **Phase 1** | Cluster Setup (Hadoop HDFS, Spark, Hive configuration in WSL2) | Week 1–2 | **Maaz** |
| **Phase 2** | Raw Ingestion: SDO/HMI SWAN-SF TSVs + NOAA GOES-15 CSVs | Week 3 | **Maaz** |
| **Phase 3** | GOES Feature Engineering (1h deriv, 12h mean, 24h peak) & AS-OF Alignment | Week 4 | **Vidya** |
| **Phase 4** | Parquet Generation & HDFS Storage across all 5 partitions | Week 5 | **Maaz** |
| **Phase 5** | Spark MLlib Pipeline (Median Imputer, StandardScaler, RandomForest) | Week 6 | **Maaz** |
| **Phase 6** | Feature Ablation Study (SWAN+GOES vs. SWAN-only vs. GOES-only) | Week 7 | **Vidya** |
| **Phase 7** | Staged Hyperparameter Tuning & Operational Threshold Calibration (FPR $\le$ 10%) | Week 8 | **Roshan** |
| **Phase 8** | Hive Metastore Integration & Analytical SQL Benchmark Tables | Week 9 | **Maaz** |
| **Phase 9** | Final Technical Report, Jupyter Notebook Polish & Presentation Walkthrough | Week 10 | **All (Maaz, Vidya, Roshan)** |

### Specific Team Member Responsibilities:
* **Mohammed Maaz Ali**: Architecture design, Hadoop HDFS integration, AS-OF temporal alignment pipeline, PySpark MLlib training implementation, and Hive database integration.
* **Vidya**: GOES soft X-ray feature extraction, temporal derivative formulation, data quality validation, and feature ablation experimental protocol.
* **Roshan**: Hyperparameter grid search design, operational threshold optimization formulation ($\text{FPR} \le 10\%$ & $\le 5\%$), and project documentation.

---

## 6. Expected Deliverables

1. **HDFS Storage Repository**: 5 Parquet partitions persistently hosted in Hadoop HDFS.
2. **PySpark MLlib Pipelines**: Reusable, parameterized Python scripts in `src/jobs/`.
3. **Hive Analytics Metastore**: Cataloged database `solar_flare` with complete confusion matrices.
4. **Reproducible Jupyter Notebook**: `ML_Training.ipynb` demonstrating the end-to-end workflow.
5. **Academic Research Report**: 6–10 page formal paper detailing methodology, results, and solar physics findings.
6. **Live Presentation & Walkthrough Guide**: Step-by-step 10-minute demo script for evaluation.
