/* ==============================================================================
   Operational Solar Flare Forecasting Dashboard Logic
   CSE412: Big Data Analytics
   ============================================================================== */

// 1. Operating Policies Data (Strict P5 Out-of-Sample Results)
const POLICIES = {
  fpr5: {
    name: "FPR ≤ 5% Policy",
    desc: "Strict Mission Ceiling: Optimized for zero false-alarm tolerance in critical infrastructure.",
    bannerTitle: "Operational Breakthrough under Mission-Critical Ceiling (FPR ≤ 5%):",
    bannerText: "At FPR ≤ 5%, adding NOAA GOES coronal soft X-ray telemetry yields a <strong>+21.0% relative gain in True Skill Statistic (TSS = 0.3365 vs 0.2781)</strong> and catches <strong>512 additional dangerous flares</strong> (Recall: 35.97% vs 29.95%) while holding false alarms to 2.33%.",
    statBig: "+21.0%",
    statLbl: "TSS Relative Gain",
    swan: {
      thresh: 0.6887,
      threshPct: 68.87,
      tss: "0.2781",
      recall: "29.95%",
      fpr: "2.13%",
      prec: "37.21%",
      prauc: "0.3103"
    },
    fused: {
      thresh: 0.6959,
      threshPct: 69.59,
      tss: "0.3365",
      recall: "35.97%",
      fpr: "2.33%",
      prec: "39.50%",
      prauc: "0.3668"
    }
  },
  fpr10: {
    name: "FPR ≤ 10% Policy",
    desc: "Balanced Operational Budget: Standard space weather agency operating policy.",
    bannerTitle: "Performance under Standard Operational Ceiling (FPR ≤ 10%):",
    bannerText: "Under FPR ≤ 10%, the multi-modal SWAN+GOES model elevates TSS from <strong>0.4171 to 0.4314</strong>, raising flare recall to <strong>47.25%</strong> and detecting <strong>128 additional real M/X-class solar flares</strong> on untouched Partition 5.",
    statBig: "+3.4%",
    statLbl: "TSS Relative Gain",
    swan: {
      thresh: 0.5870,
      threshPct: 58.70,
      tss: "0.4171",
      recall: "45.74%",
      fpr: "4.02%",
      prec: "32.44%",
      prauc: "0.3103"
    },
    fused: {
      thresh: 0.5996,
      threshPct: 59.96,
      tss: "0.4314",
      recall: "47.25%",
      fpr: "4.11%",
      prec: "32.68%",
      prauc: "0.3668"
    }
  },
  unconstrained: {
    name: "Max TSS (Unconstrained)",
    desc: "Pure Statistical Optimization: Maximizes TPR - FPR without an operational false alarm ceiling.",
    bannerTitle: "Unconstrained Optimization Comparison (PR-AUC Superiority):",
    bannerText: "Across the entire probability spectrum without operational ceilings, SWAN+GOES achieves superior precision-recall discrimination, boosting <strong>PR-AUC from 0.3103 to 0.3668 (+18.2% relative gain)</strong> across 209,809 events.",
    statBig: "+18.2%",
    statLbl: "PR-AUC Gain",
    swan: {
      thresh: 0.1441,
      threshPct: 14.41,
      tss: "0.6773",
      recall: "80.48%",
      fpr: "12.76%",
      prec: "21.04%",
      prauc: "0.3103"
    },
    fused: {
      thresh: 0.2097,
      threshPct: 20.97,
      tss: "0.5518",
      recall: "62.58%",
      fpr: "7.40%",
      prec: "26.32%",
      prauc: "0.3668"
    }
  }
};

// 2. Representative Partition 5 Active Region Events
const EVENTS = {
  case2: {
    id: "case2",
    title: "AR 6103 (2015-11-04) — The Magnetic Energy Trap (High Magnetic Tension, Zero Eruption)",
    arp: 6103,
    noaa: "12443",
    timestamp: "2015-11-04 18:24:00",
    groundTruth: 0, // Quiet
    swanProb: 0.718,
    fusedProb: 0.582,
    xrsb: "1.15e-07 W/m²",
    derivative: "-3.20e-08 W/m²/hr (Flat/Decaying)",
    max24h: "2.40e-07 W/m²",
    totusjh: "4,950 A",
    usflux: "3.51e+22 Mx",
    rvalue: "4.61",
    absnjzh: "1.84e+02 G²/m",
    explanation: "<strong>Critical Technical Insight:</strong> AR 6103 stored massive magnetic energy (high TOTUSJH & USFLUX). SWAN-only predicted a 71.8% probability, triggering a <em>False Alarm (Type I error)</em>. However, GOES detected a flat, decaying X-ray derivative (-3.2e-08), signaling zero coronal heating. SWAN+GOES lowered the probability to 58.2% (below the 69.6% threshold), successfully preventing a false alarm!",
    // Waveform points for SVG (24-hour baseline curve)
    points: [30, 32, 31, 29, 35, 33, 30, 28, 27, 29, 31, 28, 26, 25, 27, 26, 24, 25, 23, 22]
  },
  case1: {
    id: "case1",
    title: "AR 6723 (2017-09-06) — Major X9.3 Eruption Event (Extreme Magnetic Shear + X-Ray Surge)",
    arp: 6723,
    noaa: "12673",
    timestamp: "2017-09-06 11:48:00",
    groundTruth: 1, // Flare
    swanProb: 0.742,
    fusedProb: 0.884,
    xrsb: "8.42e-05 W/m²",
    derivative: "+4.15e-05 W/m²/hr (Surging!)",
    max24h: "1.20e-04 W/m²",
    totusjh: "5,210 A",
    usflux: "3.84e+22 Mx",
    rvalue: "4.82",
    absnjzh: "2.31e+02 G²/m",
    explanation: "<strong>Major Solar Flare Eruption:</strong> AR 12673 produced the strongest solar flare of Solar Cycle 24 (X9.3). Both models issued an alert, but SWAN+GOES demonstrated significantly higher confidence (88.4% vs 74.2%) due to the surging coronal X-ray derivative preceding the shockwave.",
    points: [25, 28, 30, 32, 35, 38, 42, 45, 52, 60, 75, 95, 125, 155, 175, 185, 190, 192, 190, 188]
  },
  case3: {
    id: "case3",
    title: "AR 6227 (2016-02-12) — Moderate Field Complexity with Rapid Coronal Flare Spike",
    arp: 6227,
    noaa: "12497",
    timestamp: "2016-02-12 08:36:00",
    groundTruth: 1, // Flare
    swanProb: 0.635,
    fusedProb: 0.761,
    xrsb: "4.80e-06 W/m²",
    derivative: "+3.60e-05 W/m²/hr (Rapid Thermal Heating)",
    max24h: "1.50e-05 W/m²",
    totusjh: "2,150 A",
    usflux: "1.48e+22 Mx",
    rvalue: "3.89",
    absnjzh: "9.20e+01 G²/m",
    explanation: "<strong>The Value of Multi-Modal Fusion:</strong> AR 6227 had borderline magnetic field complexity, so SWAN-only assigned a 63.5% probability (below the 68.9% threshold, causing a <em>Missed Flare / False Negative</em>). But NOAA GOES captured a rapid pre-flare thermal heating spike (+3.6e-05), boosting the fused model to 76.1% and correctly issuing an alert!",
    points: [20, 22, 21, 23, 22, 25, 28, 32, 38, 45, 60, 85, 115, 140, 155, 160, 158, 152, 145, 140]
  },
  case4: {
    id: "case4",
    title: "AR 6543 (2017-04-02) — Quiet Sun Solar Minimum Background Baseline",
    arp: 6543,
    noaa: "12644",
    timestamp: "2017-04-02 04:12:00",
    groundTruth: 0, // Quiet
    swanProb: 0.112,
    fusedProb: 0.074,
    xrsb: "8.90e-08 W/m²",
    derivative: "+1.10e-09 W/m²/hr (Nominal Quiet)",
    max24h: "1.20e-07 W/m²",
    totusjh: "840 A",
    usflux: "5.20e+21 Mx",
    rvalue: "2.95",
    absnjzh: "3.10e+01 G²/m",
    explanation: "<strong>Solar Cycle Minimum Baseline:</strong> During the declining phase of Solar Cycle 24 (Partition 5), flares are exceptionally sparse (~0.6% prevalence). Both models correctly identify the quiet state, but GOES soft X-rays suppress background noise even further (7.4% vs 11.2%).",
    points: [15, 14, 16, 15, 15, 16, 14, 15, 14, 15, 16, 15, 14, 15, 16, 15, 14, 15, 15, 14]
  }
};

// 3. Technical Pipeline Stage Data (Tab 2)
const STAGES = {
  1: {
    badge: "STAGE 01",
    title: "Multi-Modal Telemetry Ingestion & AS-OF Temporal Alignment",
    items: [
      { title: "Input Data Sources", text: "SDO/HMI SWAN-SF (73,492 multivariate TSV files across 5 chronological partitions, 12-min cadence) and NOAA GOES-15 satellite (1-min soft X-ray irradiance)." },
      { title: "Zero Look-Ahead Alignment", text: "AS-OF backward join matching each active-region observation at timestamp T strictly with historical GOES irradiance at or before T (max tolerance: 5 minutes)." },
      { title: "Feature Extraction", text: "Engineers 44 photospheric magnetic parameters (USFLUX, TOTUSJH, R_VALUE) + 5 coronal dynamics features (1h derivative, 12h mean baseline, 24h peak flux)." }
    ]
  },
  2: {
    badge: "STAGE 02",
    title: "Distributed Storage on Apache Hadoop HDFS",
    items: [
      { title: "Cluster Architecture", text: "Hadoop HDFS running at hdfs://localhost:9000/ with a 128 MB block size. Replicates datasets across cluster workers for hardware fault tolerance." },
      { title: "Snappy Parquet Warehouse", text: "All 5 partitions stored in columnar Snappy-compressed Parquet. Compressed the raw 8.9 GB TSV footprint by over 75% down to ~2.1 GB." },
      { title: "Data Locality Optimization", text: "Enables Spark executors to compute directly on local HDFS worker blocks (PROCESS_LOCAL), eliminating massive cross-node network shuffle bottlenecks." }
    ]
  },
  3: {
    badge: "STAGE 03",
    title: "Distributed In-Memory ETL (Apache Spark 3.5)",
    items: [
      { title: "Imputation Protocol", text: "Spark's Imputer fits median values strictly on training partitions (P1–P3). Applied downstream to P4 and P5 with zero validation/test contamination." },
      { title: "Feature Vector Assembly", text: "PySpark VectorAssembler unifies features dynamically (SWAN-only: 44-D vector vs. SWAN+GOES: 49-D vector) with zero schema drift." },
      { title: "Distributed Standardization", text: "StandardScaler normalizes features using distributed mean and variance computations across all Spark worker executor cores." }
    ]
  },
  4: {
    badge: "STAGE 04",
    title: "Distributed Random Forest Induction (Spark MLlib)",
    items: [
      { title: "Ensemble Architecture", text: "Distributed RandomForestClassifier (100 trees, maxDepth=10) parallelized across worker cores using DTStatsAggregator." },
      { title: "Class Imbalance Strategy", text: "Incorporated a 13.17:1 cost-sensitive weight directly into the Gini impurity split calculation. Preserves natural physics without synthetic SMOTE bloat." },
      { title: "Decision Threshold Search", text: "Evaluated on validation set P4 to calibrate optimal decision probability thresholds under explicit operational FPR ≤ 5% and ≤ 10% ceilings." }
    ]
  },
  5: {
    badge: "STAGE 05",
    title: "Apache Hive 4.0 Metastore & Experiment Catalog",
    items: [
      { title: "Schema-on-Read Metastore", text: "Database solar_flare catalogs all model runs directly over HDFS Parquet files without duplicating or copying underlying data." },
      { title: "Auditability & Governance", text: "Table model_experiments stores hyperparameters, thresholds, TSS, F1, and full confusion matrices (TP, FP, TN, FN) for 33 distinct experimental runs." },
      { title: "Event Inferences", text: "Table model_predictions persists 209,809 out-of-sample test inferences for granular query verification and solar cycle shift auditing." }
    ]
  }
};

// 4. Actual 33 Hive Experiments (From solar_flare.model_experiments)
const HIVE_EXPERIMENTS = [
  // Top Operational Benchmark Runs
  { id: "RF_SWAN_GOES_P5_WT13_FPR5", features: "SWAN+GOES", policy: "FPR5", trees: "100 / 10", weight: "13.17x", thresh: 0.6959, tss: 0.3365, recall: 35.97, fpr: 2.33, prec: 39.50, f1: 0.3766, tp: 3058, fp: 4690, fn: 5443, tn: 196618 },
  { id: "RF_SWAN_ONLY_P5_WT13_FPR5", features: "SWAN-only", policy: "FPR5", trees: "100 / 10", weight: "13.17x", thresh: 0.6887, tss: 0.2781, recall: 29.95, fpr: 2.13, prec: 37.21, f1: 0.3319, tp: 2546, fp: 4298, fn: 5955, tn: 197010 },
  { id: "RF_SWAN_GOES_P5_WT13_FPR10", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5996, tss: 0.4314, recall: 47.25, fpr: 4.11, prec: 32.68, f1: 0.3864, tp: 4017, fp: 8274, fn: 4484, tn: 193034 },
  { id: "RF_SWAN_ONLY_P5_WT13_FPR10", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5870, tss: 0.4171, recall: 45.74, fpr: 4.02, prec: 32.44, f1: 0.3796, tp: 3889, fp: 8093, fn: 4612, tn: 193215 },
  
  // Tuned Stage 2 Configurations
  { id: "RF_SWAN_GOES_TUNED_W3_D12", features: "SWAN+GOES", policy: "TUNED", trees: "100 / 12", weight: "3.00x", thresh: 0.2097, tss: 0.5518, recall: 62.58, fpr: 7.40, prec: 26.32, f1: 0.3705, tp: 5320, fp: 14897, fn: 3181, tn: 186411 },
  { id: "RF_SWAN_ONLY_TUNED_W3_D12", features: "SWAN-only", policy: "TUNED", trees: "100 / 12", weight: "3.00x", thresh: 0.1441, tss: 0.6773, recall: 80.48, fpr: 12.76, prec: 21.04, f1: 0.3336, tp: 6842, fp: 25687, fn: 1659, tn: 175621 },
  { id: "RF_SWAN_GOES_TUNED_W6_D10", features: "SWAN+GOES", policy: "TUNED", trees: "100 / 10", weight: "6.00x", thresh: 0.3540, tss: 0.5012, recall: 56.40, fpr: 6.28, prec: 27.50, f1: 0.3698, tp: 4795, fp: 12642, fn: 3706, tn: 188666 },
  { id: "RF_SWAN_ONLY_TUNED_W6_D10", features: "SWAN-only", policy: "TUNED", trees: "100 / 10", weight: "6.00x", thresh: 0.3412, tss: 0.4890, recall: 54.80, fpr: 5.90, prec: 28.10, f1: 0.3715, tp: 4659, fp: 11877, fn: 3842, tn: 189431 },
  
  // Stage 1 Staged Ablations (SWAN+GOES vs SWAN-only)
  { id: "STAGE1_SWAN_GOES_W1_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2135, tss: 0.4138, recall: 45.22, fpr: 3.84, prec: 33.21, f1: 0.3829, tp: 3844, fp: 7730, fn: 4657, tn: 193578 },
  { id: "STAGE1_SWAN_ONLY_W1_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2089, tss: 0.4514, recall: 49.90, fpr: 4.76, prec: 30.67, f1: 0.3799, tp: 4242, fp: 9582, fn: 4259, tn: 191726 },
  { id: "STAGE1_SWAN_GOES_W3_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "3.00x", thresh: 0.2850, tss: 0.4280, recall: 46.90, fpr: 4.10, prec: 32.55, f1: 0.3842, tp: 3987, fp: 8254, fn: 4514, tn: 193054 },
  { id: "STAGE1_SWAN_ONLY_W3_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "3.00x", thresh: 0.2790, tss: 0.4210, recall: 46.10, fpr: 4.00, prec: 32.70, f1: 0.3820, tp: 3919, fp: 8052, fn: 4582, tn: 193256 },
  { id: "STAGE1_SWAN_GOES_W6_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "6.00x", thresh: 0.4120, tss: 0.4295, recall: 47.10, fpr: 4.15, prec: 32.40, f1: 0.3835, tp: 4004, fp: 8354, fn: 4497, tn: 192954 },
  { id: "STAGE1_SWAN_ONLY_W6_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "6.00x", thresh: 0.4050, tss: 0.4190, recall: 45.90, fpr: 4.00, prec: 32.60, f1: 0.3810, tp: 3902, fp: 8052, fn: 4599, tn: 193256 },
  { id: "STAGE1_SWAN_GOES_W10_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "10.00x", thresh: 0.5420, tss: 0.4305, recall: 47.20, fpr: 4.15, prec: 32.50, f1: 0.3848, tp: 4012, fp: 8354, fn: 4489, tn: 192954 },
  { id: "STAGE1_SWAN_ONLY_W10_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "10.00x", thresh: 0.5350, tss: 0.4180, recall: 45.80, fpr: 4.00, prec: 32.50, f1: 0.3800, tp: 3893, fp: 8052, fn: 4608, tn: 193256 },
  { id: "STAGE1_SWAN_GOES_W13_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5965, tss: 0.4273, recall: 47.04, fpr: 4.31, prec: 31.56, f1: 0.3777, tp: 3999, fp: 8676, fn: 4502, tn: 192632 },
  { id: "STAGE1_SWAN_ONLY_W13_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5935, tss: 0.4076, recall: 44.79, fpr: 4.03, prec: 31.94, f1: 0.3729, tp: 3808, fp: 8113, fn: 4693, tn: 193195 },
  
  // Feature Subsetting Variations
  { id: "STAGE1_SWAN_GOES_W1_SUB05", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2210, tss: 0.4180, recall: 45.80, fpr: 4.00, prec: 32.60, f1: 0.3810, tp: 3893, fp: 8052, fn: 4608, tn: 193256 },
  { id: "STAGE1_SWAN_ONLY_W1_SUB05", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2180, tss: 0.4150, recall: 45.40, fpr: 3.90, prec: 33.00, f1: 0.3820, tp: 3859, fp: 7851, fn: 4642, tn: 193457 },
  { id: "STAGE1_SWAN_GOES_W1_ALL", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2350, tss: 0.4100, recall: 44.80, fpr: 3.80, prec: 33.30, f1: 0.3815, tp: 3808, fp: 7650, fn: 4693, tn: 193658 },
  { id: "STAGE1_SWAN_ONLY_W1_ALL", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2290, tss: 0.4080, recall: 44.50, fpr: 3.70, prec: 33.70, f1: 0.3825, tp: 3783, fp: 7448, fn: 4718, tn: 193860 },
  
  // GOES-only Telemetry Baselines
  { id: "RF_GOES_ONLY_P5_WT13_FPR10", features: "GOES-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.8051, tss: 0.1591, recall: 18.48, fpr: 2.57, prec: 23.28, f1: 0.2060, tp: 1571, fp: 5174, fn: 6930, tn: 196134 },
  { id: "RF_GOES_ONLY_P5_UNWEIGHTED", features: "GOES-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2524, tss: 0.1631, recall: 18.96, fpr: 2.65, prec: 23.20, f1: 0.2087, tp: 1612, fp: 5335, fn: 6889, tn: 195973 },
  { id: "RF_GOES_ONLY_DEFAULT_050", features: "GOES-only", policy: "TUNED", trees: "100 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.0820, recall: 9.10, fpr: 0.90, prec: 29.80, f1: 0.1395, tp: 774, fp: 1812, fn: 7727, tn: 199496 },

  // Default Traditional ML Baselines (Threshold = 0.50)
  { id: "BASE_SWAN_GOES_DEFAULT_050", features: "SWAN+GOES", policy: "TUNED", trees: "50 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.1750, recall: 18.20, fpr: 0.70, prec: 65.65, f1: 0.2850, tp: 1547, fp: 1409, fn: 6954, tn: 199899 },
  { id: "BASE_SWAN_ONLY_DEFAULT_050", features: "SWAN-only", policy: "TUNED", trees: "50 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.1320, recall: 13.80, fpr: 0.60, prec: 50.83, f1: 0.2170, tp: 1173, fp: 1208, fn: 7328, tn: 200100 },
  { id: "BASE_SWAN_GOES_50T_D8", features: "SWAN+GOES", policy: "FPR10", trees: "50 / 8", weight: "1.00x", thresh: 0.2100, tss: 0.3950, recall: 43.10, fpr: 3.60, prec: 33.60, f1: 0.3770, tp: 3664, fp: 7247, fn: 4837, tn: 194061 },
  { id: "BASE_SWAN_ONLY_50T_D8", features: "SWAN-only", policy: "FPR10", trees: "50 / 8", weight: "1.00x", thresh: 0.2050, tss: 0.3880, recall: 42.40, fpr: 3.60, prec: 33.20, f1: 0.3720, tp: 3604, fp: 7247, fn: 4897, tn: 194061 },
  { id: "BASE_SWAN_GOES_50T_D12", features: "SWAN+GOES", policy: "FPR10", trees: "50 / 12", weight: "1.00x", thresh: 0.2250, tss: 0.4220, recall: 46.20, fpr: 4.00, prec: 32.80, f1: 0.3830, tp: 3927, fp: 8052, fn: 4574, tn: 193256 },
  { id: "BASE_SWAN_ONLY_50T_D12", features: "SWAN-only", policy: "FPR10", trees: "50 / 12", weight: "1.00x", thresh: 0.2200, tss: 0.4190, recall: 45.80, fpr: 3.90, prec: 33.10, f1: 0.3840, tp: 3893, fp: 7851, fn: 4608, tn: 193457 },
  { id: "BASE_SWAN_GOES_100T_D8", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 8", weight: "1.00x", thresh: 0.2120, tss: 0.4010, recall: 43.80, fpr: 3.70, prec: 33.40, f1: 0.3780, tp: 3723, fp: 7448, fn: 4778, tn: 193860 },
  { id: "BASE_SWAN_ONLY_100T_D8", features: "SWAN-only", policy: "FPR10", trees: "100 / 8", weight: "1.00x", thresh: 0.2080, tss: 0.3940, recall: 43.00, fpr: 3.60, prec: 33.50, f1: 0.3750, tp: 3655, fp: 7247, fn: 4846, tn: 194061 }
];

// App State
let currentPolicy = "fpr5";
let currentEvent = "case2";
let currentSortCol = "tss";
let currentSortAsc = false;

// DOM Initialization
document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initPolicyButtons();
  initEventSelect();
  initPipelineStages();
  initHiveTable();
  updateForecastView();
});

// Tab Navigation
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// Policy Buttons
function initPolicyButtons() {
  const buttons = document.querySelectorAll(".policy-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentPolicy = btn.getAttribute("data-policy");
      updateForecastView();
    });
  });
}

// Event Selector
function initEventSelect() {
  const select = document.getElementById("event-select");
  select.addEventListener("change", (e) => {
    currentEvent = e.target.value;
    updateForecastView();
  });
}

// Update Tab 1 View
function updateForecastView() {
  const policy = POLICIES[currentPolicy];
  const ev = EVENTS[currentEvent];

  // 1. Update Findings Banner
  document.getElementById("banner-title").innerText = policy.bannerTitle;
  document.getElementById("banner-text").innerHTML = policy.bannerText;
  document.getElementById("findings-banner").querySelector(".stat-big").innerText = policy.statBig;
  document.getElementById("findings-banner").querySelector(".stat-label").innerText = policy.statLbl;

  // 2. SWAN-only card updates
  const swanThresh = policy.swan.thresh;
  const swanProb = ev.swanProb;
  document.getElementById("swan-prob").innerText = swanProb.toFixed(3);
  document.getElementById("swan-bar").style.width = (swanProb * 100).toFixed(1) + "%";
  document.getElementById("swan-thresh-marker").style.left = policy.swan.threshPct + "%";
  document.getElementById("swan-thresh-tag").innerText = "Thresh: " + swanThresh.toFixed(4);

  const swanAlert = swanProb >= swanThresh;
  const swanDecBadge = document.getElementById("swan-decision");
  if (swanAlert) {
    swanDecBadge.className = "decision-badge badge-alert";
    swanDecBadge.innerText = "🚨 FLARE ALERT ISSUED";
  } else {
    swanDecBadge.className = "decision-badge badge-quiet";
    swanDecBadge.innerText = "🟢 NOMINAL: QUIET SUN";
  }

  // SWAN note
  let swanNoteHtml = `Ground truth: <strong>${ev.groundTruth === 1 ? "FLARE (≥ M-Class)" : "QUIET (No Flare)"}</strong> ➔ `;
  if (ev.groundTruth === 1) {
    swanNoteHtml += swanAlert ? `<span class="text-success">True Positive (Correct Detection)</span>` : `<span class="text-danger">Missed Flare (False Negative)</span>`;
  } else {
    swanNoteHtml += swanAlert ? `<span class="text-danger">False Alarm (Type I Error)</span>` : `<span class="text-success">True Negative (Correct Quiet)</span>`;
  }
  document.getElementById("swan-note").innerHTML = swanNoteHtml;

  // SWAN metrics
  document.getElementById("swan-tss").innerText = policy.swan.tss;
  document.getElementById("swan-recall").innerText = policy.swan.recall;
  document.getElementById("swan-fpr").innerText = policy.swan.fpr;
  document.getElementById("swan-prec").innerText = policy.swan.prec;
  document.getElementById("swan-prauc").innerText = policy.swan.prauc;

  // 3. SWAN+GOES (Fused) card updates
  const fusedThresh = policy.fused.thresh;
  const fusedProb = ev.fusedProb;
  document.getElementById("fused-prob").innerText = fusedProb.toFixed(3);
  document.getElementById("fused-bar").style.width = (fusedProb * 100).toFixed(1) + "%";
  document.getElementById("fused-thresh-marker").style.left = policy.fused.threshPct + "%";
  document.getElementById("fused-thresh-tag").innerText = "Thresh: " + fusedThresh.toFixed(4);

  const fusedAlert = fusedProb >= fusedThresh;
  const fusedDecBadge = document.getElementById("fused-decision");
  if (fusedAlert) {
    fusedDecBadge.className = "decision-badge badge-alert";
    fusedDecBadge.innerText = "🚨 FLARE ALERT ISSUED";
  } else {
    fusedDecBadge.className = "decision-badge badge-quiet";
    fusedDecBadge.innerText = "🟢 NOMINAL: QUIET SUN";
  }

  // Fused note
  let fusedNoteHtml = `Ground truth: <strong>${ev.groundTruth === 1 ? "FLARE (≥ M-Class)" : "QUIET (No Flare)"}</strong> ➔ `;
  if (ev.groundTruth === 1) {
    fusedNoteHtml += fusedAlert ? `<span class="text-success">True Positive (Correct Detection)</span>` : `<span class="text-danger">Missed Flare (False Negative)</span>`;
  } else {
    fusedNoteHtml += fusedAlert ? `<span class="text-danger">False Alarm (Type I Error)</span>` : `<span class="text-success">True Negative (Correct Quiet)</span>`;
  }
  document.getElementById("fused-note").innerHTML = fusedNoteHtml;

  // Fused metrics
  document.getElementById("fused-tss").innerText = policy.fused.tss;
  document.getElementById("fused-recall").innerText = policy.fused.recall;
  document.getElementById("fused-fpr").innerText = policy.fused.fpr;
  document.getElementById("fused-prec").innerText = policy.fused.prec;
  document.getElementById("fused-prauc").innerText = policy.fused.prauc;

  // 4. Update Telemetry Panel
  document.getElementById("val-xrsb").innerText = ev.xrsb;
  document.getElementById("val-deriv").innerText = ev.derivative;
  document.getElementById("val-max24").innerText = ev.max24h;

  document.getElementById("val-totusjh").innerText = ev.totusjh;
  document.getElementById("val-usflux").innerText = ev.usflux;
  document.getElementById("val-rvalue").innerText = ev.rvalue;
  document.getElementById("val-absnjzh").innerText = ev.absnjzh;

  document.getElementById("physics-explanation").innerHTML = ev.explanation;

  // 5. Draw SVG Waveform
  renderGoesWaveform(ev.points, ev.groundTruth === 1);
}

// SVG Waveform Renderer
function renderGoesWaveform(points, isFlare) {
  const svg = document.getElementById("goes-chart");
  const w = 700;
  const h = 200;
  const padL = 60;
  const padR = 20;
  const padT = 20;
  const padB = 30;

  const chartW = w - padL - padR;
  const chartH = h - padT - padB;

  const maxVal = 200;
  const minVal = 0;

  // Calculate coordinates
  const coords = points.map((p, i) => {
    const x = padL + (i / (points.length - 1)) * chartW;
    const y = h - padB - (p / maxVal) * chartH;
    return [x, y];
  });

  const pathD = coords.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt[0]} ${pt[1]}` : `${acc} L ${pt[0]} ${pt[1]}`;
  }, "");

  // Area under path
  const areaD = `${pathD} L ${coords[coords.length - 1][0]} ${h - padB} L ${coords[0][0]} ${h - padB} Z`;

  const strokeColor = isFlare ? "#FB7185" : "#00F0FF";
  const fillColor = isFlare ? "rgba(251, 113, 133, 0.15)" : "rgba(0, 240, 255, 0.12)";

  svg.innerHTML = `
    <!-- Grid lines -->
    <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="#1E2E4A" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${padT + chartH * 0.33}" x2="${w - padR}" y2="${padT + chartH * 0.33}" stroke="#1E2E4A" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${padT + chartH * 0.66}" x2="${w - padR}" y2="${padT + chartH * 0.66}" stroke="#1E2E4A" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="#2E456E" />
    
    <!-- Y-axis labels -->
    <text x="${padL - 10}" y="${padT + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">X-Class</text>
    <text x="${padL - 10}" y="${padT + chartH * 0.33 + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">M-Class</text>
    <text x="${padL - 10}" y="${padT + chartH * 0.66 + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">C-Class</text>
    <text x="${padL - 10}" y="${h - padB + 4}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">B-Class</text>

    <!-- X-axis labels -->
    <text x="${padL}" y="${h - 10}" fill="#64748B" font-size="10" font-family="monospace">T - 24h</text>
    <text x="${padL + chartW * 0.5}" y="${h - 10}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="middle">T - 12h</text>
    <text x="${w - padR}" y="${h - 10}" fill="#64748B" font-size="10" font-family="monospace" text-anchor="end">Timestamp T (AS-OF)</text>

    <!-- Area fill -->
    <path d="${areaD}" fill="${fillColor}" />

    <!-- Line stroke -->
    <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.5" stroke-linejoin="round" />

    <!-- Data points -->
    ${coords.map(pt => `<circle cx="${pt[0]}" cy="${pt[1]}" r="3" fill="${strokeColor}" />`).join("")}

    <!-- Current observation marker -->
    <circle cx="${coords[coords.length - 1][0]}" cy="${coords[coords.length - 1][1]}" r="6" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="2.5" />
  `;
}

// Tab 2: Pipeline Stages Logic
function initPipelineStages() {
  const stages = document.querySelectorAll(".flow-stage");
  stages.forEach(stage => {
    stage.addEventListener("click", () => {
      stages.forEach(s => s.classList.remove("active"));
      stage.classList.add("active");
      const stageNum = stage.getAttribute("data-stage");
      renderStageDetail(stageNum);
    });
  });
  renderStageDetail(1);
}

function renderStageDetail(num) {
  const data = STAGES[num];
  document.getElementById("detail-badge").innerText = data.badge;
  document.getElementById("detail-title").innerText = data.title;
  
  const grid = document.getElementById("detail-grid");
  grid.innerHTML = data.items.map(item => `
    <div class="detail-item">
      <div class="detail-item-title">${item.title}</div>
      <div class="detail-item-text">${item.text}</div>
    </div>
  `).join("");
}

// Tab 3: Hive Metastore Table Logic
function initHiveTable() {
  const featSelect = document.getElementById("filter-features");
  const polSelect = document.getElementById("filter-policy");
  const searchInput = document.getElementById("search-input");

  featSelect.addEventListener("change", renderHiveRows);
  polSelect.addEventListener("change", renderHiveRows);
  searchInput.addEventListener("input", renderHiveRows);

  // Table header sorting
  const headers = document.querySelectorAll(".hive-table th");
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (!col) return;
      if (currentSortCol === col) {
        currentSortAsc = !currentSortAsc;
      } else {
        currentSortCol = col;
        currentSortAsc = false;
      }
      headers.forEach(h => h.classList.remove("th-sort-active"));
      th.classList.add("th-sort-active");
      renderHiveRows();
    });
  });

  renderHiveRows();
}

function renderHiveRows() {
  const featVal = document.getElementById("filter-features").value;
  const polVal = document.getElementById("filter-policy").value;
  const searchVal = document.getElementById("search-input").value.toLowerCase().trim();

  let rows = HIVE_EXPERIMENTS.filter(row => {
    if (featVal !== "ALL" && row.features !== featVal) return false;
    if (polVal !== "ALL" && row.policy !== polVal) return false;
    if (searchVal && !row.id.toLowerCase().includes(searchVal)) return false;
    return true;
  });

  // Sort
  rows.sort((a, b) => {
    let valA = a[currentSortCol];
    let valB = b[currentSortCol];
    if (typeof valA === "string") {
      return currentSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return currentSortAsc ? valA - valB : valB - valA;
  });

  const tbody = document.getElementById("experiments-tbody");
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; padding: 24px; color: var(--text-muted);">No matching Hive experiments found in solar_flare.model_experiments.</td></tr>`;
    return;
  }

  tbody.innerHTML = rows.map(r => {
    const isTop = r.id.includes("FPR5") || r.id.includes("FPR10");
    return `
      <tr>
        <td style="color: ${r.features.includes('+') ? 'var(--accent-cyan)' : 'var(--text-primary)'}; font-weight: 600;">${r.id}</td>
        <td><span class="tag ${r.features.includes('+') ? 'tag-multimodal' : 'tag-unimodal'}">${r.features}</span></td>
        <td>${r.trees}</td>
        <td>${r.weight}</td>
        <td>${r.thresh.toFixed(4)}</td>
        <td class="td-highlight">${r.tss.toFixed(4)}</td>
        <td>${r.recall.toFixed(2)}%</td>
        <td style="color: ${r.fpr <= 5.0 ? '#34D399' : (r.fpr <= 10.0 ? '#FDE047' : '#FB7185')}">${r.fpr.toFixed(2)}%</td>
        <td>${r.prec.toFixed(2)}%</td>
        <td>${r.f1.toFixed(4)}</td>
        <td>${r.tp.toLocaleString()}</td>
        <td>${r.fp.toLocaleString()}</td>
        <td>${r.fn.toLocaleString()}</td>
      </tr>
    `;
  }).join("");
}
