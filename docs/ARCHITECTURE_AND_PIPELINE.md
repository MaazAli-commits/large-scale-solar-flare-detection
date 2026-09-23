# Big Data System Architecture & Pipeline Specification
## Multi-Modal Solar Flare Prediction System (SWAN-SF + NOAA GOES)
**Course**: CSE412: Big Data Analytics  
**Authors (Group of 3)**: Mohammed Maaz Ali, Vidya, Roshan  

---

## 1. System Architecture Overview

The system is engineered as an enterprise-grade Big Data analytics architecture composed of four decoupled tiers: Distributed Storage, Distributed In-Memory Processing, Metadata/Warehouse Management, and Operational Inference & Evaluation.

![Multi-Modal Big Data Architecture & Pipeline](architecture_diagram.png)

### Interactive Architecture Topology

```mermaid
graph TD
    subgraph Storage_Tier["Tier 1: Distributed Storage (Apache Hadoop HDFS)"]
        Raw["Raw Data: 73,492 SWAN-SF TSVs + NOAA GOES-15 CSVs"]
        HDFS_Warehouse["HDFS Parquet Warehouse<br/>hdfs://localhost:9000/solar_flare/data/features/<br/>P1, P2, P3, P4, P5 (Snappy-compressed, 837,426 rows)"]
    end

    subgraph Compute_Tier["Tier 2: Distributed Processing (Apache Spark 3.5 / PySpark)"]
        Spark_Driver["Spark Driver Program (App Master)"]
        Spark_Exec1["Executor 1: Parallel Imputation & Scaling"]
        Spark_Exec2["Executor 2: Distributed Random Forest Tree Induction"]
        Spark_Driver --- Spark_Exec1
        Spark_Driver --- Spark_Exec2
    end

    subgraph Metastore_Tier["Tier 3: Metastore & Data Warehouse (Apache Hive 4.0)"]
        Hive_DB["Database: solar_flare"]
        Hive_T1["Table: model_experiments (33 benchmark runs)"]
        Hive_T2["Table: model_predictions (209,809 inferences)"]
        Hive_DB --> Hive_T1
        Hive_DB --> Hive_T2
    end

    subgraph Operational_Tier["Tier 4: Operational Space Weather Inference"]
        P4_Tuning["P4 Validation: Operational FPR <= 10% / <= 5% Ceiling"]
        P5_Test["P5 Untouched Test Evaluation (Zero Temporal Leakage)"]
        SQL_Audit["Spark SQL Auditing & Interactive Notebook (ML_Training.ipynb)"]
    end

    Raw --> HDFS_Warehouse
    HDFS_Warehouse --> Spark_Driver
    Spark_Exec1 --> Hive_DB
    Spark_Exec2 --> Hive_DB
    Hive_DB --> Operational_Tier
```

---

## 2. Ingestion & Temporal Alignment Pipeline

A fundamental challenge in time-series space weather forecasting is preventing **future-data leakage** when joining point-in-time active-region magnetograms with continuous satellite irradiance fluxes.

```mermaid
sequenceDiagram
    autonumber
    participant SWAN as SDO/HMI SWAN-SF (12-min Cadence)
    participant GOES as NOAA GOES-15 (1-min Irradiance)
    participant Align as Temporal AS-OF Joiner
    participant Rolling as Rolling Window Engine
    participant HDFS as Hadoop HDFS Parquet

    SWAN->>Align: Transmit active region observation at timestamp T
    GOES->>Rolling: Continuous X-ray flux (xrsa, xrsb)
    Rolling->>Rolling: Calculate 1h derivative, 12h mean, 24h peak strictly over past (T - dt)
    Rolling->>Align: Provide precomputed coronal thermal features
    Align->>Align: Match SWAN timestamp T to closest historical GOES timestamp <= T (Max tolerance 5m)
    Align->>HDFS: Write 49-feature unified columnar record (Snappy Parquet)
```

---

## 3. Chronological Multi-Partition Splitting (Zero Leakage)

To guarantee true operational validity across the 11-year solar cycle, we enforce a strict chronological partition protocol across the 5 benchmark datasets:

```mermaid
gantt
    title Solar Cycle Chronological Partitioning Timeline
    dateFormat YYYY-MM
    axisFormat %Y-%m

    section Training Split (518,803 Samples)
    Partition 1 (Solar Ascent)        :done, p1, 2010-05, 2011-12
    Partition 2 (Solar Ascent)        :done, p2, 2012-01, 2013-05
    Partition 3 (Solar Maximum)       :done, p3, 2013-06, 2014-07

    section Validation Split (108,814 Samples)
    Partition 4 (Solar Max & Tuning)  :active, p4, 2014-08, 2015-09

    section Untouched Test Split (209,809 Samples)
    Partition 5 (Solar Decline/Min)   :crit, p5, 2015-10, 2018-12
```

* **Training Set (`P1–P3`)**: 518,803 samples used exclusively for tree construction. Imputation medians and scaling parameters are computed strictly from `P1–P3`.
* **Validation Set (`P4`)**: 108,814 samples used exclusively for threshold selection under operational $\text{FPR} \le 10\%$ and $\le 5\%$ ceilings.
* **Untouched Test Set (`P5`)**: 209,809 samples evaluated strictly out-of-sample with frozen thresholds.

---

## 4. Comprehensive Big Data Tool Justifications

A major requirement of CSE412 is providing rigorous architectural justification for every component in the Big Data stack:

### 4.1 Apache Hadoop HDFS vs. Local POSIX Filesystem / NFS
* **Block-Level Fault Tolerance**: HDFS automatically fragments files into 128 MB blocks with configurable replication across cluster nodes. A disk failure does not interrupt active MapReduce or Spark jobs.
* **Data Locality for Spark**: Apache Spark schedules task execution on the exact physical cluster worker hosting the specific HDFS block (`PROCESS_LOCAL` / `NODE_LOCAL`), eliminating heavy network shuffle bottlenecks.
* **Scalability**: Unlike local filesystems bounded by single-machine storage, HDFS scales linearly to petabytes across commodity nodes.

### 4.2 Apache Spark 3.5 & PySpark MLlib vs. Scikit-Learn
* **In-Memory Distributed Resilient Distributed Datasets (RDDs)**: Scikit-learn requires all training data to fit in single-node RAM and computes sequentially. Spark MLlib parallelizes feature evaluation across multiple worker cores, processing over 500,000 multi-feature training rows in minutes.
* **Distributed Bagging**: Spark's `RandomForestClassifier` trains ensemble decision trees in parallel across executors by broadcasting feature subsets and aggregating tree statistics using `DTStatsAggregator`.
* **Integrated ETL and Modeling**: PySpark unifies distributed SQL transformations (`Imputer`, `VectorAssembler`, `StandardScaler`) with ML predictors in a single Directed Acyclic Graph (DAG).

### 4.3 Apache Hive 4.0 Metastore vs. Traditional Relational RDBMS (PostgreSQL/MySQL)
* **Schema-on-Read over Data Warehouse**: Traditional RDBMS requires loading data into proprietary relational tables. Apache Hive creates a virtual SQL metastore directly over the existing HDFS Parquet files without copying or duplicating data.
* **Decoupled Storage and Compute**: Compute engines (Spark SQL, Hive CLI, Presto) can query the same underlying Parquet warehouse concurrently without storage contention.
* **Auditability**: Machine learning experiment parameters (`num_trees`, `max_depth`, `weight_ratio`, `decision_threshold`) and confusion matrices (`tp`, `fp`, `tn`, `fn`) are cataloged permanently for governance.

### 4.4 Apache Parquet + Snappy Compression vs. CSV / TSV
* **Columnar Storage & Projection Pruning**: SWAN-SF raw TSVs contain 44 magnetic features plus metadata. When Spark executes feature selection, Parquet only reads the specific requested feature byte columns from disk, skipping unused columns completely.
* **High-Efficiency Compression**: Snappy block compression reduces the on-disk footprint by >75% compared to raw text files while maintaining ultra-fast decompression speeds suited for CPU-bound machine learning.
* **Predicate Pushdown**: Parquet file metadata stores min/max statistics for every row group, allowing Spark to skip entire blocks during partition filtering.

### 4.5 Class Weighting vs. Resampling (SMOTE / Undersampling) in Big Data
* **Memory & Storage Overhead**: Synthetic oversampling techniques (SMOTE) artificially inflate dataset size by generating millions of synthetic vectors, causing severe JVM garbage collection pauses and memory bloat on large clusters.
* **Preserving Natural Physics**: Undersampling deletes over 90% of non-flare active region observations, destroying the natural background distribution and risking high false alarm rates during deployment.
* **Instance Weighting Advantage**: Incorporating a 13.17:1 cost-sensitive weight into the tree split impurity metric directly penalizes missed flares without altering the true underlying data distribution.
