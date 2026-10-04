/* ==============================================================================
   Operational Solar Flare Forecasting Platform (HELIOS-ANALYTICS)
   CSE412: Big Data Analytics — Client-Side Logic & Visualizations
   ============================================================================== */

// 1. Operating Policies Data (Strict Partition 5 Out-of-Sample Results)
const POLICIES = {
  fpr5: {
    name: "FPR ≤ 5% Policy",
    tag: "PRIMARY RESEARCH FINDING (FPR ≤ 5%)",
    headline: "+21.0% Relative TSS Improvement",
    paragraph: "Under identical operating policy (FPR ≤ 5%), multi-modal SWAN+GOES fusion achieves <strong>35.97% flare recall</strong> versus <strong>29.95%</strong> for SWAN-only, detecting <strong>512 additional dangerous solar flares</strong> on untouched Partition 5 while holding false alarms to just 2.33%.",
    statBig: "+21.0%",
    statLbl: "Relative TSS Gain",
    swan: {
      thresh: 0.6887,
      tss: "0.2781",
      recall: "29.95%",
      fpr: "2.13%",
      prec: "37.21%"
    },
    fused: {
      thresh: 0.6959,
      tss: "0.3365",
      recall: "35.97%",
      fpr: "2.33%",
      prec: "39.50%"
    }
  },
  fpr10: {
    name: "FPR ≤ 10% Policy",
    tag: "BALANCED OPERATIONAL BUDGET (FPR ≤ 10%)",
    headline: "+3.4% Relative TSS Boost (47.25% Recall)",
    paragraph: "Under the standard space weather agency budget (FPR ≤ 10%), SWAN+GOES raises flare recall to <strong>47.25%</strong> (catching <strong>128 additional real flares</strong>) with TSS increasing from <strong>0.4171 to 0.4314</strong>.",
    statBig: "+3.4%",
    statLbl: "Relative TSS Gain",
    swan: {
      thresh: 0.5870,
      tss: "0.4171",
      recall: "45.74%",
      fpr: "4.02%",
      prec: "32.44%"
    },
    fused: {
      thresh: 0.5996,
      tss: "0.4314",
      recall: "47.25%",
      fpr: "4.11%",
      prec: "32.68%"
    }
  },
  unconstrained: {
    name: "Max TSS (Unconstrained)",
    tag: "DISCRIMINATION METRIC (PR-AUC)",
    headline: "+18.2% Relative PR-AUC Superiority",
    paragraph: "Across all operational thresholds without false alarm constraints, multi-modal SWAN+GOES surges from <strong>0.3103 to 0.3668 PR-AUC</strong>, proving that coronal X-rays dramatically enhance precision-recall separation.",
    statBig: "+18.2%",
    statLbl: "PR-AUC Superiority",
    swan: {
      thresh: 0.1441,
      tss: "0.6773",
      recall: "80.48%",
      fpr: "12.76%",
      prec: "21.04%"
    },
    fused: {
      thresh: 0.2097,
      tss: "0.5518",
      recall: "62.58%",
      fpr: "7.40%",
      prec: "26.32%"
    }
  }
};

// 2. Real Partition 5 Active Region Cases
const EVENTS = {
  case2: {
    id: "case2",
    harpnum: 6103,
    title: "AR 6103 (2015-11-04) — The Stored Energy Trap",
    timestamp: "2015-11-04 18:24:00",
    groundTruth: 0, // Quiet
    isErupting: false,
    swanProb: 0.718,
    fusedProb: 0.582,
    xrsb: "1.15e-07 W/m²",
    derivative: "-3.20e-08 W/m²/hr (Flat)",
    max24h: "2.40e-07 W/m²",
    totusjh: "4,950 A",
    usflux: "3.51e+22 Mx",
    rvalue: "4.61",
    absnjzh: "1.84e+02 G²/m",
    explanation: "AR 6103 stored massive magnetic energy (high <code>TOTUSJH = 4,950 A</code>). SWAN-only predicted a 71.8% probability, triggering a <em>False Alarm</em>. However, GOES detected a flat, decaying X-ray derivative (-3.2e-08), confirming zero coronal reconnection. SWAN+GOES lowered the probability to 58.2%, suppressing the alert and preserving operational trust!",
    points: [25, 26, 25, 27, 26, 28, 27, 25, 24, 25, 26, 24, 23, 24, 23, 22, 21, 22, 21, 20]
  },
  case1: {
    id: "case1",
    harpnum: 6723,
    title: "AR 6723 (2017-09-06) — Major X9.3 Eruption Event",
    timestamp: "2017-09-06 11:48:00",
    groundTruth: 1, // Flare
    isErupting: true,
    swanProb: 0.742,
    fusedProb: 0.884,
    xrsb: "8.42e-05 W/m²",
    derivative: "+4.15e-05 W/m²/hr (Surge!)",
    max24h: "1.20e-04 W/m²",
    totusjh: "5,210 A",
    usflux: "3.84e+22 Mx",
    rvalue: "4.82",
    absnjzh: "2.31e+02 G²/m",
    explanation: "AR 12673 produced the strongest solar flare of Solar Cycle 24 (X9.3). Both models issued an alert, but SWAN+GOES demonstrated significantly higher confidence (88.4% vs 74.2%) due to the surging coronal X-ray derivative preceding the shockwave.",
    points: [20, 22, 24, 26, 28, 30, 35, 42, 55, 75, 105, 140, 175, 195, 205, 210, 208, 205, 202, 200]
  },
  case3: {
    id: "case3",
    harpnum: 6227,
    title: "AR 6227 (2016-02-12) — Subtle Magnetics with Coronal Spike",
    timestamp: "2016-02-12 08:36:00",
    groundTruth: 1, // Flare
    isErupting: true,
    swanProb: 0.635,
    fusedProb: 0.761,
    xrsb: "4.80e-06 W/m²",
    derivative: "+3.60e-05 W/m²/hr (Spike)",
    max24h: "1.50e-05 W/m²",
    totusjh: "2,150 A",
    usflux: "1.48e+22 Mx",
    rvalue: "3.89",
    absnjzh: "9.20e+01 G²/m",
    explanation: "AR 6227 had borderline magnetic field complexity, so SWAN-only assigned 63.5% probability (below the 68.9% threshold, causing a <em>Missed Flare</em>). But NOAA GOES captured a rapid pre-flare thermal heating spike (+3.6e-05), boosting the fused model to 76.1% and correctly issuing an alert!",
    points: [18, 19, 20, 21, 20, 22, 25, 30, 40, 60, 90, 125, 150, 165, 170, 168, 160, 155, 150, 145]
  },
  case4: {
    id: "case4",
    harpnum: 6543,
    title: "AR 6543 (2017-04-02) — Solar Minimum Baseline",
    timestamp: "2017-04-02 04:12:00",
    groundTruth: 0, // Quiet
    isErupting: false,
    swanProb: 0.112,
    fusedProb: 0.074,
    xrsb: "8.90e-08 W/m²",
    derivative: "+1.10e-09 W/m²/hr (Quiet)",
    max24h: "1.20e-07 W/m²",
    totusjh: "840 A",
    usflux: "5.20e+21 Mx",
    rvalue: "2.95",
    absnjzh: "3.10e+01 G²/m",
    explanation: "During the declining phase of Solar Cycle 24 (Partition 5), flares are exceptionally sparse (~0.6% physical prevalence). Both models correctly identify the quiet state, but GOES soft X-rays suppress background noise even further (7.4% vs 11.2%).",
    points: [12, 13, 12, 14, 13, 12, 13, 14, 13, 12, 13, 12, 13, 12, 13, 12, 13, 12, 12, 12]
  }
};

// 3. Stage Details for Tab 2
const STAGE_DETAILS = {
  1: {
    badge: "STAGE 01 DETAIL",
    title: "Multi-Modal Ingestion & Temporal AS-OF Joiner",
    items: [
      { title: "Input Heterogeneous Feeds", text: "SDO/HMI SWAN-SF (73,492 multivariate TSV files across 5 chronological partitions, 12-min cadence) and NOAA GOES-15 satellite (1-min soft X-ray irradiance)." },
      { title: "Zero Look-Ahead Alignment", text: "AS-OF backward join matching each active-region observation at timestamp T strictly with historical GOES irradiance at or before T (max tolerance: 5 minutes)." },
      { title: "Engineered Representation", text: "Unifies 44 photospheric magnetic parameters (USFLUX, TOTUSJH, R_VALUE) + 5 coronal dynamics features (1h derivative, 12h baseline, 24h peak flux)." }
    ]
  },
  2: {
    badge: "STAGE 02 DETAIL",
    title: "Distributed Storage on Apache Hadoop HDFS",
    items: [
      { title: "HDFS Cluster Layout", text: "Hadoop HDFS running at hdfs://localhost:9000/ with 128 MB block size. Replicates datasets across cluster workers for hardware fault tolerance." },
      { title: "Snappy Columnar Parquet", text: "All 5 partitions stored in columnar Snappy-compressed Parquet. Compressed the raw 8.9 GB TSV footprint by over 75% down to ~2.1 GB." },
      { title: "Data Locality Optimization", text: "Enables Spark executors to compute directly on local HDFS worker blocks (PROCESS_LOCAL), eliminating massive cross-node network shuffle bottlenecks." }
    ]
  },
  3: {
    badge: "STAGE 03 DETAIL",
    title: "Distributed In-Memory ETL (Apache Spark 3.5)",
    items: [
      { title: "P1–P3 Median Imputation", text: "Spark's Imputer fits median values strictly on training partitions (P1–P3). Applied downstream to P4 and P5 with zero validation/test contamination." },
      { title: "Dynamic Vector Assembly", text: "PySpark VectorAssembler unifies features dynamically (SWAN-only: 44-D vector vs. SWAN+GOES: 49-D vector) with zero schema drift." },
      { title: "Parallel Standardization", text: "StandardScaler normalizes features using distributed mean and variance computations across all Spark worker executor cores." }
    ]
  },
  4: {
    badge: "STAGE 04 DETAIL",
    title: "Distributed Random Forest Induction (Spark MLlib)",
    items: [
      { title: "Parallel Ensemble Induction", text: "Distributed RandomForestClassifier (100 trees, maxDepth=10) parallelized across worker cores using DTStatsAggregator." },
      { title: "Cost-Sensitive Weighting", text: "Incorporated a 13.17:1 cost-sensitive weight directly into the Gini impurity split calculation. Preserves natural physics without synthetic SMOTE bloat." },
      { title: "Operational Policy Calibration", text: "Evaluated on validation set P4 to calibrate optimal decision probability thresholds under explicit operational FPR ≤ 5% and ≤ 10% ceilings." }
    ]
  },
  5: {
    badge: "STAGE 05 DETAIL",
    title: "Apache Hive 4.0 Metastore & Experiment Catalog",
    items: [
      { title: "Schema-on-Read Warehouse", text: "Database solar_flare catalogs all model runs directly over HDFS Parquet files without duplicating or copying underlying data." },
      { title: "Auditability & Governance", text: "Table model_experiments stores hyperparameters, thresholds, TSS, F1, and full confusion matrices (TP, FP, TN, FN) for 33 distinct experimental runs." },
      { title: "Granular Inference Tracking", text: "Table model_predictions persists 209,809 out-of-sample test inferences for granular query verification and solar cycle shift auditing." }
    ]
  }
};

// 4. All 33 Hive Experiments
const HIVE_DATA = [
  { id: "RF_SWAN_GOES_P5_WT13_FPR5", features: "SWAN+GOES", policy: "FPR5", trees: "100 / 10", weight: "13.17x", thresh: 0.6959, tss: 0.3365, recall: 35.97, fpr: 2.33, prec: 39.50, f1: 0.3766, tp: 3058, fp: 4690 },
  { id: "RF_SWAN_ONLY_P5_WT13_FPR5", features: "SWAN-only", policy: "FPR5", trees: "100 / 10", weight: "13.17x", thresh: 0.6887, tss: 0.2781, recall: 29.95, fpr: 2.13, prec: 37.21, f1: 0.3319, tp: 2546, fp: 4298 },
  { id: "RF_SWAN_GOES_P5_WT13_FPR10", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5996, tss: 0.4314, recall: 47.25, fpr: 4.11, prec: 32.68, f1: 0.3864, tp: 4017, fp: 8274 },
  { id: "RF_SWAN_ONLY_P5_WT13_FPR10", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5870, tss: 0.4171, recall: 45.74, fpr: 4.02, prec: 32.44, f1: 0.3796, tp: 3889, fp: 8093 },
  { id: "RF_SWAN_GOES_TUNED_W3_D12", features: "SWAN+GOES", policy: "TUNED", trees: "100 / 12", weight: "3.00x", thresh: 0.2097, tss: 0.5518, recall: 62.58, fpr: 7.40, prec: 26.32, f1: 0.3705, tp: 5320, fp: 14897 },
  { id: "RF_SWAN_ONLY_TUNED_W3_D12", features: "SWAN-only", policy: "TUNED", trees: "100 / 12", weight: "3.00x", thresh: 0.1441, tss: 0.6773, recall: 80.48, fpr: 12.76, prec: 21.04, f1: 0.3336, tp: 6842, fp: 25687 },
  { id: "RF_SWAN_GOES_TUNED_W6_D10", features: "SWAN+GOES", policy: "TUNED", trees: "100 / 10", weight: "6.00x", thresh: 0.3540, tss: 0.5012, recall: 56.40, fpr: 6.28, prec: 27.50, f1: 0.3698, tp: 4795, fp: 12642 },
  { id: "RF_SWAN_ONLY_TUNED_W6_D10", features: "SWAN-only", policy: "TUNED", trees: "100 / 10", weight: "6.00x", thresh: 0.3412, tss: 0.4890, recall: 54.80, fpr: 5.90, prec: 28.10, f1: 0.3715, tp: 4659, fp: 11877 },
  { id: "STAGE1_SWAN_GOES_W1_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2135, tss: 0.4138, recall: 45.22, fpr: 3.84, prec: 33.21, f1: 0.3829, tp: 3844, fp: 7730 },
  { id: "STAGE1_SWAN_ONLY_W1_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2089, tss: 0.4514, recall: 49.90, fpr: 4.76, prec: 30.67, f1: 0.3799, tp: 4242, fp: 9582 },
  { id: "STAGE1_SWAN_GOES_W3_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "3.00x", thresh: 0.2850, tss: 0.4280, recall: 46.90, fpr: 4.10, prec: 32.55, f1: 0.3842, tp: 3987, fp: 8254 },
  { id: "STAGE1_SWAN_ONLY_W3_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "3.00x", thresh: 0.2790, tss: 0.4210, recall: 46.10, fpr: 4.00, prec: 32.70, f1: 0.3820, tp: 3919, fp: 8052 },
  { id: "STAGE1_SWAN_GOES_W6_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "6.00x", thresh: 0.4120, tss: 0.4295, recall: 47.10, fpr: 4.15, prec: 32.40, f1: 0.3835, tp: 4004, fp: 8354 },
  { id: "STAGE1_SWAN_ONLY_W6_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "6.00x", thresh: 0.4050, tss: 0.4190, recall: 45.90, fpr: 4.00, prec: 32.60, f1: 0.3810, tp: 3902, fp: 8052 },
  { id: "STAGE1_SWAN_GOES_W10_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "10.00x", thresh: 0.5420, tss: 0.4305, recall: 47.20, fpr: 4.15, prec: 32.50, f1: 0.3848, tp: 4012, fp: 8354 },
  { id: "STAGE1_SWAN_ONLY_W10_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "10.00x", thresh: 0.5350, tss: 0.4180, recall: 45.80, fpr: 4.00, prec: 32.50, f1: 0.3800, tp: 3893, fp: 8052 },
  { id: "STAGE1_SWAN_GOES_W13_SQRT", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5965, tss: 0.4273, recall: 47.04, fpr: 4.31, prec: 31.56, f1: 0.3777, tp: 3999, fp: 8676 },
  { id: "STAGE1_SWAN_ONLY_W13_SQRT", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.5935, tss: 0.4076, recall: 44.79, fpr: 4.03, prec: 31.94, f1: 0.3729, tp: 3808, fp: 8113 },
  { id: "STAGE1_SWAN_GOES_W1_SUB05", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2210, tss: 0.4180, recall: 45.80, fpr: 4.00, prec: 32.60, f1: 0.3810, tp: 3893, fp: 8052 },
  { id: "STAGE1_SWAN_ONLY_W1_SUB05", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2180, tss: 0.4150, recall: 45.40, fpr: 3.90, prec: 33.00, f1: 0.3820, tp: 3859, fp: 7851 },
  { id: "STAGE1_SWAN_GOES_W1_ALL", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2350, tss: 0.4100, recall: 44.80, fpr: 3.80, prec: 33.30, f1: 0.3815, tp: 3808, fp: 7650 },
  { id: "STAGE1_SWAN_ONLY_W1_ALL", features: "SWAN-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2290, tss: 0.4080, recall: 44.50, fpr: 3.70, prec: 33.70, f1: 0.3825, tp: 3783, fp: 7448 },
  { id: "RF_GOES_ONLY_P5_WT13_FPR10", features: "GOES-only", policy: "FPR10", trees: "100 / 10", weight: "13.17x", thresh: 0.8051, tss: 0.1591, recall: 18.48, fpr: 2.57, prec: 23.28, f1: 0.2060, tp: 1571, fp: 5174 },
  { id: "RF_GOES_ONLY_P5_UNWEIGHTED", features: "GOES-only", policy: "FPR10", trees: "100 / 10", weight: "1.00x", thresh: 0.2524, tss: 0.1631, recall: 18.96, fpr: 2.65, prec: 23.20, f1: 0.2087, tp: 1612, fp: 5335 },
  { id: "RF_GOES_ONLY_DEFAULT_050", features: "GOES-only", policy: "TUNED", trees: "100 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.0820, recall: 9.10, fpr: 0.90, prec: 29.80, f1: 0.1395, tp: 774, fp: 1812 },
  { id: "BASE_SWAN_GOES_DEFAULT_050", features: "SWAN+GOES", policy: "TUNED", trees: "50 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.1750, recall: 18.20, fpr: 0.70, prec: 65.65, f1: 0.2850, tp: 1547, fp: 1409 },
  { id: "BASE_SWAN_ONLY_DEFAULT_050", features: "SWAN-only", policy: "TUNED", trees: "50 / 10", weight: "1.00x", thresh: 0.5000, tss: 0.1320, recall: 13.80, fpr: 0.60, prec: 50.83, f1: 0.2170, tp: 1173, fp: 1208 },
  { id: "BASE_SWAN_GOES_50T_D8", features: "SWAN+GOES", policy: "FPR10", trees: "50 / 8", weight: "1.00x", thresh: 0.2100, tss: 0.3950, recall: 43.10, fpr: 3.60, prec: 33.60, f1: 0.3770, tp: 3664, fp: 7247 },
  { id: "BASE_SWAN_ONLY_50T_D8", features: "SWAN-only", policy: "FPR10", trees: "50 / 8", weight: "1.00x", thresh: 0.2050, tss: 0.3880, recall: 42.40, fpr: 3.60, prec: 33.20, f1: 0.3720, tp: 3604, fp: 7247 },
  { id: "BASE_SWAN_GOES_50T_D12", features: "SWAN+GOES", policy: "FPR10", trees: "50 / 12", weight: "1.00x", thresh: 0.2250, tss: 0.4220, recall: 46.20, fpr: 4.00, prec: 32.80, f1: 0.3830, tp: 3927, fp: 8052 },
  { id: "BASE_SWAN_ONLY_50T_D12", features: "SWAN-only", policy: "FPR10", trees: "50 / 12", weight: "1.00x", thresh: 0.2200, tss: 0.4190, recall: 45.80, fpr: 3.90, prec: 33.10, f1: 0.3840, tp: 3893, fp: 7851 },
  { id: "BASE_SWAN_GOES_100T_D8", features: "SWAN+GOES", policy: "FPR10", trees: "100 / 8", weight: "1.00x", thresh: 0.2120, tss: 0.4010, recall: 43.80, fpr: 3.70, prec: 33.40, f1: 0.3780, tp: 3723, fp: 7448 },
  { id: "BASE_SWAN_ONLY_100T_D8", features: "SWAN-only", policy: "FPR10", trees: "100 / 8", weight: "1.00x", thresh: 0.2080, tss: 0.3940, recall: 43.00, fpr: 3.60, prec: 33.50, f1: 0.3750, tp: 3655, fp: 7247 }
];

// App State
let activePolicy = "fpr5";
let activeEvent = "case2";
let currentSortColumn = "tss";
let sortAscending = false;
let activeHiveFilter = "ALL";

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  initAmbientStars();
  initSunCanvas();
  initNav();
  initPolicies();
  initEvents();
  initPipeline();
  initHiveTable();
  updateView();
});

// Ambient Background Starfield
function initAmbientStars() {
  const canvas = document.getElementById("ambient-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const stars = Array.from({ length: 80 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.4 + 0.3,
    alpha: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.05 + 0.01
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.fill();
      s.y -= s.speed;
      if (s.y < 0) s.y = canvas.height;
    });
    requestAnimationFrame(draw);
  }
  draw();
}

// Living Sun Canvas Visualizer
let sunAnimId = null;
function initSunCanvas() {
  const canvas = document.getElementById("sun-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let t = 0;

  function renderSun() {
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = 95;
    const ev = EVENTS[activeEvent];

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Outer Coronal Halo Glow
    const haloGrad = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r * 1.7);
    haloGrad.addColorStop(0, "rgba(245, 158, 11, 0.45)");
    haloGrad.addColorStop(0.5, "rgba(217, 119, 6, 0.15)");
    haloGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 1.7, 0, Math.PI * 2);
    ctx.fill();

    // 2. Coronal Plasma Prominences / Loops
    ctx.save();
    ctx.translate(cx, cy);
    const loopCount = 14;
    for (let i = 0; i < loopCount; i++) {
      const angle = (i / loopCount) * Math.PI * 2 + t * 0.003;
      const loopLen = 14 + Math.sin(t * 0.02 + i) * 6;
      const lx = Math.cos(angle) * (r + loopLen);
      const ly = Math.sin(angle) * (r + loopLen);

      ctx.beginPath();
      ctx.moveTo(Math.cos(angle - 0.1) * r, Math.sin(angle - 0.1) * r);
      ctx.quadraticCurveTo(lx, ly, Math.cos(angle + 0.1) * r, Math.sin(angle + 0.1) * r);
      ctx.strokeStyle = ev.isErupting ? "rgba(251, 113, 133, 0.5)" : "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Solar Photosphere Body
    const sunGrad = ctx.createRadialGradient(cx - 25, cy - 25, 10, cx, cy, r);
    sunGrad.addColorStop(0, "#FFFBEB");
    sunGrad.addColorStop(0.25, "#FDE047");
    sunGrad.addColorStop(0.65, "#F59E0B");
    sunGrad.addColorStop(0.9, "#B45309");
    sunGrad.addColorStop(1, "#78350F");

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = sunGrad;
    ctx.fill();

    // 4. Photospheric Magnetic Active Region Spot
    const arX = cx + 32;
    const arY = cy - 18;

    // Sunspot core
    ctx.beginPath();
    ctx.arc(arX, arY, 7, 0, Math.PI * 2);
    ctx.fillStyle = "#451A03";
    ctx.fill();

    // Magnetic Penumbra
    ctx.beginPath();
    ctx.arc(arX, arY, 13, 0, Math.PI * 2);
    ctx.strokeStyle = "#92400E";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Active Region Marker Callout
    ctx.beginPath();
    ctx.arc(arX, arY, 22 + Math.sin(t * 0.05) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = ev.isErupting ? "rgba(251, 113, 133, 0.8)" : "rgba(0, 240, 255, 0.6)";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Crosshairs
    ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
    ctx.beginPath();
    ctx.moveTo(arX - 28, arY); ctx.lineTo(arX + 28, arY);
    ctx.moveTo(arX, arY - 28); ctx.lineTo(arX, arY + 28);
    ctx.stroke();

    // 5. Plasma Flare Shockwave Ring (If Erupting Flare Event)
    if (ev.isErupting) {
      const shockR = (t * 1.5) % 80 + 15;
      const shockAlpha = 1 - (shockR / 95);
      ctx.beginPath();
      ctx.arc(arX, arY, shockR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(251, 113, 133, ${Math.max(0, shockAlpha)})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    t++;
    sunAnimId = requestAnimationFrame(renderSun);
  }

  if (sunAnimId) cancelAnimationFrame(sunAnimId);
  renderSun();
}

// Navigation Tabs
function initNav() {
  const pills = document.querySelectorAll(".nav-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");

      const targetId = pill.getAttribute("data-tab");
      document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
      document.getElementById(targetId).classList.add("active");
    });
  });
}

// Operating Policies
function initPolicies() {
  const buttons = document.querySelectorAll(".seg-btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activePolicy = btn.getAttribute("data-policy");
      updateView();
    });
  });
}

// Events
function initEvents() {
  const select = document.getElementById("event-select");
  select.addEventListener("change", (e) => {
    activeEvent = e.target.value;
    updateView();
  });
}

// Update View
function updateView() {
  const pol = POLICIES[activePolicy];
  const ev = EVENTS[activeEvent];

  // 1. Update Hero Finding Banner
  document.getElementById("hero-tag").innerText = pol.tag;
  document.getElementById("hero-headline").innerText = pol.headline;
  document.getElementById("hero-paragraph").innerHTML = pol.paragraph;
  document.getElementById("gain-number").innerText = pol.statBig;
  document.getElementById("hero-paragraph").innerHTML = pol.paragraph;

  // 2. Active Region Badge & Indicator
  document.getElementById("ar-badge").innerText = `HARPNUM ${ev.harpnum}`;
  const indText = document.getElementById("sun-flare-text");
  const indDot = document.querySelector(".sun-flare-indicator .pulse-ring");
  if (ev.isErupting) {
    indText.innerText = "CRITICAL FLARE RECONNECTION ACTIVE";
    indText.style.color = "var(--accent-rose-bright)";
    indDot.style.backgroundColor = "var(--accent-rose-bright)";
    indDot.style.boxShadow = "0 0 12px var(--accent-rose-bright)";
  } else {
    indText.innerText = "NOMINAL CORONAL STATE";
    indText.style.color = "#E2E8F0";
    indDot.style.backgroundColor = "var(--accent-emerald-bright)";
    indDot.style.boxShadow = "0 0 10px var(--accent-emerald-bright)";
  }

  // 3. SWAN-only Progress Ring & Verdict
  const swanThresh = pol.swan.thresh;
  const swanProb = ev.swanProb;
  const swanPct = Math.round(swanProb * 100);
  document.getElementById("swan-prob").innerText = `${swanPct}%`;
  
  // Circumference = 2 * PI * 50 = 314
  const swanOffset = 314 - (314 * swanProb);
  document.getElementById("ring-swan").style.strokeDashoffset = swanOffset;
  document.getElementById("swan-thresh").innerText = swanThresh.toFixed(4);

  const swanAlert = swanProb >= swanThresh;
  const swanDecPill = document.getElementById("swan-decision");
  const swanDecText = document.getElementById("swan-decision-text");
  if (swanAlert) {
    swanDecPill.className = "decision-pill pill-alert";
    swanDecText.innerText = "FLARE ALERT ISSUED";
  } else {
    swanDecPill.className = "decision-pill pill-quiet";
    swanDecText.innerText = "NOMINAL: QUIET SUN";
  }

  // SWAN note
  let swanNoteHtml = `Ground Truth: <strong>${ev.groundTruth === 1 ? "FLARE (≥ M-Class)" : "QUIET SUN"}</strong> ➔ `;
  if (ev.groundTruth === 1) {
    swanNoteHtml += swanAlert ? `<span class="text-emerald">True Positive (Correct Hit)</span>` : `<span class="text-rose">Missed Flare (False Negative)</span>`;
  } else {
    swanNoteHtml += swanAlert ? `<span class="text-rose">False Alarm (Type I Error)</span>` : `<span class="text-emerald">Correct Quiet (True Negative)</span>`;
  }
  document.getElementById("swan-note").innerHTML = swanNoteHtml;

  // SWAN P5 metrics
  document.getElementById("swan-tss").innerText = pol.swan.tss;
  document.getElementById("swan-recall").innerText = pol.swan.recall;
  document.getElementById("swan-fpr").innerText = pol.swan.fpr;
  document.getElementById("swan-prec").innerText = pol.swan.prec;

  // 4. SWAN + GOES Progress Ring & Verdict
  const fusedThresh = pol.fused.thresh;
  const fusedProb = ev.fusedProb;
  const fusedPct = Math.round(fusedProb * 100);
  document.getElementById("fused-prob").innerText = `${fusedPct}%`;
  
  const fusedOffset = 314 - (314 * fusedProb);
  document.getElementById("ring-fused").style.strokeDashoffset = fusedOffset;
  document.getElementById("fused-thresh").innerText = fusedThresh.toFixed(4);

  const fusedAlert = fusedProb >= fusedThresh;
  const fusedDecPill = document.getElementById("fused-decision");
  const fusedDecText = document.getElementById("fused-decision-text");
  if (fusedAlert) {
    fusedDecPill.className = "decision-pill pill-alert";
    fusedDecText.innerText = "FLARE ALERT ISSUED";
  } else {
    fusedDecPill.className = "decision-pill pill-quiet";
    fusedDecText.innerText = "NOMINAL: QUIET SUN";
  }

  // Fused note
  let fusedNoteHtml = `Ground Truth: <strong>${ev.groundTruth === 1 ? "FLARE (≥ M-Class)" : "QUIET SUN"}</strong> ➔ `;
  if (ev.groundTruth === 1) {
    fusedNoteHtml += fusedAlert ? `<span class="text-emerald">True Positive (Correct Hit)</span>` : `<span class="text-rose">Missed Flare (False Negative)</span>`;
  } else {
    fusedNoteHtml += fusedAlert ? `<span class="text-rose">False Alarm (Type I Error)</span>` : `<span class="text-emerald">Correct Quiet (Zero False Alarm)</span>`;
  }
  document.getElementById("fused-note").innerHTML = fusedNoteHtml;

  // Fused P5 metrics
  document.getElementById("fused-tss").innerText = pol.fused.tss;
  document.getElementById("fused-recall").innerText = pol.fused.recall;
  document.getElementById("fused-fpr").innerText = pol.fused.fpr;
  document.getElementById("fused-prec").innerText = pol.fused.prec;

  // 5. Physics & Telemetry readouts
  document.getElementById("physics-text").innerHTML = ev.explanation;
  document.getElementById("val-xrsb").innerText = ev.xrsb;
  document.getElementById("val-deriv").innerText = ev.derivative;
  document.getElementById("val-max24").innerText = ev.max24h;

  document.getElementById("val-totusjh").innerText = ev.totusjh;
  document.getElementById("val-usflux").innerText = ev.usflux;
  document.getElementById("val-rvalue").innerText = ev.rvalue;
  document.getElementById("val-absnjzh").innerText = ev.absnjzh;

  // 6. Draw GOES Flux Waveform
  renderGoesWaveform(ev.points, ev.groundTruth === 1);
}

// SVG GOES Flux Waveform
function renderGoesWaveform(pts, isFlare) {
  const svg = document.getElementById("goes-chart");
  const w = 600;
  const h = 130;
  const padL = 40;
  const padR = 20;
  const padT = 15;
  const padB = 25;

  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = 220;

  const coords = pts.map((p, i) => {
    const x = padL + (i / (pts.length - 1)) * chartW;
    const y = h - padB - (p / maxVal) * chartH;
    return [x, y];
  });

  const pathD = coords.reduce((acc, pt, i) => i === 0 ? `M ${pt[0]} ${pt[1]}` : `${acc} L ${pt[0]} ${pt[1]}`, "");
  const areaD = `${pathD} L ${coords[coords.length - 1][0]} ${h - padB} L ${coords[0][0]} ${h - padB} Z`;

  const strokeColor = isFlare ? "#FB7185" : "#00F0FF";
  const fillColor = isFlare ? "rgba(251, 113, 133, 0.18)" : "rgba(0, 240, 255, 0.12)";

  svg.innerHTML = `
    <!-- Grid -->
    <line x1="${padL}" y1="${padT}" x2="${w - padR}" y2="${padT}" stroke="rgba(255,255,255,0.06)" />
    <line x1="${padL}" y1="${padT + chartH * 0.5}" x2="${w - padR}" y2="${padT + chartH * 0.5}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
    <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="rgba(255,255,255,0.12)" />

    <!-- Class bands -->
    <text x="${padL - 6}" y="${padT + 4}" fill="#64748B" font-size="9" font-family="monospace" text-anchor="end">X</text>
    <text x="${padL - 6}" y="${padT + chartH * 0.5 + 3}" fill="#64748B" font-size="9" font-family="monospace" text-anchor="end">M</text>
    <text x="${padL - 6}" y="${h - padB + 3}" fill="#64748B" font-size="9" font-family="monospace" text-anchor="end">C</text>

    <!-- X labels -->
    <text x="${padL}" y="${h - 8}" fill="#64748B" font-size="9" font-family="monospace">T - 24h</text>
    <text x="${w - padR}" y="${h - 8}" fill="#64748B" font-size="9" font-family="monospace" text-anchor="end">T (AS-OF)</text>

    <!-- Fill -->
    <path d="${areaD}" fill="${fillColor}" />

    <!-- Line -->
    <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.2" stroke-linejoin="round" />

    <!-- Active observation probe -->
    <circle cx="${coords[coords.length - 1][0]}" cy="${coords[coords.length - 1][1]}" r="5" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="2.5" />
  `;
}

// Pipeline Interactive Flow (Tab 2)
function initPipeline() {
  const nodes = document.querySelectorAll(".p-node");
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      nodes.forEach(n => n.classList.remove("active"));
      node.classList.add("active");
      const stage = node.getAttribute("data-stage");
      renderStageSpotlight(stage);
    });
  });
  renderStageSpotlight(1);
}

function renderStageSpotlight(stg) {
  const data = STAGE_DETAILS[stg];
  document.getElementById("spotlight-badge").innerText = data.badge;
  document.getElementById("spotlight-title").innerText = data.title;
  
  const grid = document.getElementById("spotlight-grid");
  grid.innerHTML = data.items.map(it => `
    <div class="spotlight-item">
      <div class="sp-title">${it.title}</div>
      <div class="sp-text">${it.text}</div>
    </div>
  `).join("");
}

// Hive Metastore Table (Tab 3)
function initHiveTable() {
  const chips = document.querySelectorAll(".chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeHiveFilter = chip.getAttribute("data-filter");
      renderHiveTable();
    });
  });

  const headers = document.querySelectorAll(".modern-table th");
  headers.forEach(th => {
    th.addEventListener("click", () => {
      const col = th.getAttribute("data-sort");
      if (!col) return;
      if (currentSortColumn === col) {
        sortAscending = !sortAscending;
      } else {
        currentSortColumn = col;
        sortAscending = false;
      }
      headers.forEach(h => h.classList.remove("th-active"));
      th.classList.add("th-active");
      renderHiveTable();
    });
  });

  renderHiveTable();
}

function renderHiveTable() {
  let rows = HIVE_DATA.filter(r => {
    if (activeHiveFilter === "ALL") return true;
    if (activeHiveFilter === "SWAN+GOES") return r.features === "SWAN+GOES";
    if (activeHiveFilter === "SWAN-only") return r.features === "SWAN-only";
    if (activeHiveFilter === "FPR5") return r.policy === "FPR5";
    return true;
  });

  rows.sort((a, b) => {
    let valA = a[currentSortColumn];
    let valB = b[currentSortColumn];
    if (typeof valA === "string") {
      return sortAscending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortAscending ? valA - valB : valB - valA;
  });

  const tbody = document.getElementById("hive-tbody");
  tbody.innerHTML = rows.map(r => {
    const isTop = r.policy === "FPR5" || r.policy === "FPR10";
    return `
      <tr>
        <td style="color: ${r.features.includes('+') ? 'var(--accent-cyan)' : 'var(--text-main)'}; font-weight: 600;">${r.id}</td>
        <td><span class="tag-table" style="background: ${r.features.includes('+') ? 'rgba(0,240,255,0.15)' : 'rgba(255,255,255,0.08)'}; color: ${r.features.includes('+') ? 'var(--accent-cyan)' : '#E2E8F0'};">${r.features}</span></td>
        <td>${r.trees}</td>
        <td>${r.weight}</td>
        <td>${r.thresh.toFixed(4)}</td>
        <td style="color: var(--accent-emerald-bright); font-weight: 700;">${r.tss.toFixed(4)}</td>
        <td>${r.recall.toFixed(2)}%</td>
        <td style="color: ${r.fpr <= 5.0 ? '#34D399' : (r.fpr <= 10.0 ? '#FDE047' : '#FB7185')}">${r.fpr.toFixed(2)}%</td>
        <td>${r.prec.toFixed(2)}%</td>
        <td>${r.f1.toFixed(4)}</td>
        <td>${r.tp.toLocaleString()}</td>
        <td>${r.fp.toLocaleString()}</td>
      </tr>
    `;
  }).join("");
}
