/* ==============================================================================
   HELIOS — Solar Flare Forecast Observatory
   CSE412: Big Data Analytics — Client-Side Logic & Visualizations
   ============================================================================== */

// ── 1. Operating Policies Data (Strict Partition 5 Out-of-Sample Results) ──
const POLICIES = {
  fpr5: {
    name: "FPR ≤ 5% — High-Reliability Policy",
    tag: "PRIMARY RESEARCH FINDING · FPR ≤ 5% (HIGH-RELIABILITY POLICY)",
    headline: "+21.0% Relative TSS Improvement",
    paragraph: "Under identical operational policy (FPR ≤ 5%), multi-modal SWAN+GOES fusion achieves <strong>35.97% flare recall</strong> versus <strong>29.95%</strong> for SWAN-only, detecting <strong>512 additional dangerous solar flares</strong> on untouched Partition 5 while holding false alarms to just 2.33%.",
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
    name: "FPR ≤ 10% — Balanced Policy",
    tag: "BALANCED OPERATIONAL BUDGET · FPR ≤ 10%",
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
    name: "Max TSS — Unconstrained",
    tag: "DISCRIMINATION METRIC · PR-AUC",
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

// ── 2. Real Partition 5 Active Region Case Studies ──
const EVENTS = {
  case3: {
    id: "case3",
    harpnum: 6227,
    name: "AR 6227",
    coords: "N13 E18",
    magClass: "βγ Borderline",
    title: "AR 6227 (2016-02-12 08:36 UTC) — Rescued Flare",
    timestamp: "2016-02-12 08:36:00 UTC",
    groundTruth: 1, // M/X Flare
    groundTruthLabel: "M/X-CLASS FLARE (M1.0)",
    isErupting: true,
    swanProb: 0.6350,
    fusedProb: 0.7610,
    xrsb: "4.80e-06 W/m² (C4.8)",
    derivative: "+3.60e-05 W/m²/hr (Surging)",
    max24h: "1.50e-05 W/m²",
    totusjh: "2,150 A",
    usflux: "1.48e+22 Mx",
    rvalue: "3.89",
    absnjzh: "9.20e+01 G²/m",
    explanation: "AR 6227 exhibited borderline photospheric magnetic field complexity (<code>R_VALUE = 3.89</code>). Under the calibrated High-Reliability Policy (FPR ≤ 5%, threshold <code>0.6887</code>), the unimodal SWAN model assigned a 63.50% probability, staying below threshold and producing a <em>Missed Flare (False Negative)</em>. However, NOAA GOES soft X-ray irradiance captured a rapid pre-flare thermal heating surge (+3.60e-05 W/m²/hr), elevating the multi-modal confidence to 76.10% (exceeding the <code>0.6959</code> threshold) and successfully rescuing the operational flare alert!",
    points: [18, 19, 20, 21, 20, 22, 25, 30, 40, 60, 90, 125, 150, 165, 170, 168, 160, 155, 150, 145]
  },
  case2: {
    id: "case2",
    harpnum: 6103,
    name: "AR 6103",
    coords: "N08 W24",
    magClass: "βγδ Complex",
    title: "AR 6103 (2015-11-04 18:24 UTC) — Suppressed False Alarm",
    timestamp: "2015-11-04 18:24:00 UTC",
    groundTruth: 0, // Quiet Sun
    groundTruthLabel: "QUIET SUN",
    isErupting: false,
    swanProb: 0.7180,
    fusedProb: 0.5820,
    xrsb: "1.15e-07 W/m² (B1.1)",
    derivative: "-3.20e-08 W/m²/hr (Flat / Decaying)",
    max24h: "2.40e-07 W/m²",
    totusjh: "4,950 A",
    usflux: "3.51e+22 Mx",
    rvalue: "4.61",
    absnjzh: "1.84e+02 G²/m",
    explanation: "AR 6103 stored massive photospheric magnetic energy (<code>TOTUSJH = 4,950 A</code>). SWAN-only predicted a 71.8% probability, triggering a disruptive <em>False Alarm (Type I Error)</em>. However, GOES soft X-ray irradiance showed a flat/decaying profile (-3.20e-08 W/m²/hr), indicating a lack of strong short-term X-ray evidence of increasing flare activity. Multi-modal SWAN+GOES lowered the probability to 58.2% (below the <code>0.6959</code> threshold), suppressing the alert and preventing an operational false alarm.",
    points: [25, 26, 25, 27, 26, 28, 27, 25, 24, 25, 26, 24, 23, 24, 23, 22, 21, 22, 21, 20]
  }
};

// ── 3. Distributed Pipeline Stages (Tab 2) ──
const STAGE_DETAILS = {
  1: {
    badge: "STAGE 01 DETAIL",
    title: "Multi-Modal Ingestion & Temporal AS-OF Joiner",
    items: [
      { title: "Temporal AS-OF Joiner", text: "Joins NOAA GOES-15 1-minute coronal irradiance with SDO/HMI active regions strictly at or before observation timestamp T (zero lookahead bias)." },
      { title: "High-Throughput Parsing", text: "Ingests 8.9 GB of compressed multi-variate solar time-series, mapping 837,426 rows across 5 chronological partitions." },
      { title: "Validation & Schema Guard", text: "Verifies 44 photospheric magnetic features and 5 temporal X-ray indicators, pruning corrupted or missing sensor packets." }
    ]
  },
  2: {
    badge: "STAGE 02 DETAIL",
    title: "Distributed Storage: Apache Hadoop HDFS 3.3.6",
    items: [
      { title: "128 MB Block Splitting", text: "Eliminates single-disk I/O bottlenecks by chunking time-series across data nodes for parallel cluster reads." },
      { title: "Fault-Tolerant Replication", text: "Maintains replica sets across nodes, preventing pipeline failure during multi-hour Spark transformations." },
      { title: "Data Locality Optimization", text: "Enables Spark executors to read blocks from local memory/disk without saturating cluster network switches." }
    ]
  },
  3: {
    badge: "STAGE 03 DETAIL",
    title: "Distributed Feature Engineering: Apache Spark 3.5.0",
    items: [
      { title: "Rolling Window Derivations", text: "Computes 1h, 6h, 12h, and 24h past X-ray irradiance flux peaks and derivatives with zero future leakage." },
      { title: "VectorAssembler Pipeline", text: "Compiles 49 numerical features into compressed Spark ML DenseVectors directly in distributed memory." },
      { title: "Class Imbalance Weighting", text: "Calculates dynamic sample weights (e.g. 13.17x) to handle the extreme 1:13.17 flare rarity without under-sampling." }
    ]
  },
  4: {
    badge: "STAGE 04 DETAIL",
    title: "Distributed Model Training: Spark MLlib Random Forest",
    items: [
      { title: "Distributed Node Splitting", text: "Executors compute feature histogram statistics in parallel using DTStatsAggregator across hundreds of worker cores." },
      { title: "Deep Ensemble Scaling", text: "Trains ensembles of 100 deep trees across 518k training samples in minutes, outperforming single-node scikit-learn." },
      { title: "Strict Chronological Split", text: "Trained on Partitions 1–4 (Solar Cycle 24 rise) and strictly evaluated on untouched Partition 5 (Solar Cycle 24 declining)." }
    ]
  },
  5: {
    badge: "STAGE 05 DETAIL",
    title: "Experiment Warehouse: Apache Hive 4.0 Metastore",
    items: [
      { title: "Schema-on-Read Catalog", text: "Database solar_flare catalogs all model runs directly over HDFS Parquet files without duplicating data." },
      { title: "Auditability & Governance", text: "Table model_experiments stores hyperparameters, thresholds, TSS, F1, and full confusion matrices for 33 distinct experimental runs." },
      { title: "Granular Inference Tracking", text: "Table model_predictions persists 209,809 out-of-sample test inferences for query verification and solar cycle shift auditing." }
    ]
  }
};

// ── 4. Complete 33 Hive Experiments Catalog (Tab 3) ──
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

// ── App State (Default: Rescued Flare on FPR <= 5%) ──
let activePolicy = "fpr5";
let activeEvent = "case3"; // AR 6227 Rescued Flare
let currentSortColumn = "tss";
let sortAscending = false;
let activeHiveFilter = "ALL";

// ── Application Initialization ──
document.addEventListener("DOMContentLoaded", () => {
  initHeroVideo();
  initStarfield();
  initTabs();
  initPolicies();
  initModelToggle();
  initEvents();
  initPipeline();
  initHiveTable();
  updateView();
});

// ── SDO Hero Video Controller ──
function initHeroVideo() {
  const video = document.getElementById("sdo-video");
  if (!video) return;
  video.addEventListener("timeupdate", () => {
    if (video.currentTime < 27) {
      video.playbackRate = 2.5; // 27s plays in ~16 seconds
    } else {
      video.playbackRate = 0.5; // 8s stretches to 16 seconds
    }
  });
}

// ── Cosmic Background Starfield ──
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  const starCount = 90;
  const stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.3 + 0.3,
    alpha: Math.random() * 0.7 + 0.2,
    baseAlpha: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.08 + 0.02,
    twinkleFreq: Math.random() * 0.02 + 0.005
  }));

  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frame++;

    stars.forEach(s => {
      s.alpha = s.baseAlpha + Math.sin(frame * s.twinkleFreq) * 0.2;
      const alphaClamped = Math.max(0.1, Math.min(1, s.alpha));

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alphaClamped})`;
      ctx.fill();

      s.y -= s.speed;
      if (s.y < 0) {
        s.y = canvas.height;
        s.x = Math.random() * canvas.width;
      }
    });

    requestAnimationFrame(draw);
  }
  draw();
}

// ── Navigation Tabs ──
function initTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => {
        t.classList.remove("active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");

      const targetId = tab.getAttribute("data-tab");
      document.querySelectorAll(".panel").forEach(p => {
        p.style.display = "none";
      });

      const activePanel = document.getElementById(`panel-${targetId}`);
      if (activePanel) {
        activePanel.style.display = "block";
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  });
}

// ── Operating Policies Toggles ──
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

// ── Model Architecture View Toggle ──
function initModelToggle() {
  const buttons = document.querySelectorAll("#model-toggle-control .seg-btn");
  const compSection = document.querySelector(".comparison-section");
  if (!compSection) return;

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const mode = btn.getAttribute("data-model");

      compSection.classList.remove("view-swan", "view-fused");
      if (mode === "swan") {
        compSection.classList.add("view-swan");
      } else if (mode === "fused") {
        compSection.classList.add("view-fused");
      }
    });
  });
}

// ── Active Region Case Selector ──
function initEvents() {
  const select = document.getElementById("event-select");
  if (!select) return;
  select.addEventListener("change", (e) => {
    activeEvent = e.target.value;
    updateView();
  });
}

// ── Main Reactive View Updater ──
function updateView() {
  const pol = POLICIES[activePolicy];
  const ev = EVENTS[activeEvent];
  if (!pol || !ev) return;

  // 1. Update Key Research Finding Banner
  const tagEl = document.getElementById("finding-tag");
  const headEl = document.getElementById("finding-headline");
  const bodyEl = document.getElementById("finding-body");
  const statNum = document.getElementById("stat-number");
  const statLbl = document.getElementById("stat-label");

  if (tagEl) tagEl.innerText = pol.tag;
  if (headEl) headEl.innerText = pol.headline;
  if (bodyEl) bodyEl.innerHTML = pol.paragraph;
  if (statNum) statNum.innerText = pol.statBig;
  if (statLbl) statLbl.innerText = pol.statLbl;

  // 2. Update Live Telemetry HUD Overlay
  const hudArName = document.getElementById("hud-ar-name");
  const hudTime = document.getElementById("hud-time");
  const hudCoords = document.getElementById("hud-coords");
  const hudMag = document.getElementById("hud-magclass");
  const hudCoronal = document.getElementById("hud-coronal");

  if (hudArName) hudArName.innerText = ev.name;
  if (hudTime) hudTime.innerText = ev.timestamp;
  if (hudCoords) hudCoords.innerText = ev.coords;
  if (hudMag) hudMag.innerText = ev.magClass;
  if (hudCoronal) {
    hudCoronal.innerText = ev.groundTruthLabel;
    hudCoronal.style.color = ev.groundTruth === 1 ? "var(--rose)" : "var(--emerald)";
  }

  // 3. Update SWAN-only Progress Ring & Verdict
  const swanThresh = pol.swan.thresh;
  const swanProb = ev.swanProb;
  const swanPct = Math.round(swanProb * 100);
  const swanProbEl = document.getElementById("swan-prob");
  if (swanProbEl) swanProbEl.innerText = `${swanPct}%`;

  const swanRing = document.getElementById("ring-swan");
  if (swanRing) {
    const swanOffset = 327 - (327 * swanProb);
    swanRing.style.strokeDashoffset = swanOffset;
  }

  const swanThreshEl = document.getElementById("swan-thresh");
  if (swanThreshEl) swanThreshEl.innerText = swanThresh.toFixed(4);

  const swanAlert = swanProb >= swanThresh;
  const swanDec = document.getElementById("swan-decision");
  const swanDecText = document.getElementById("swan-decision-text");

  if (swanDec && swanDecText) {
    if (ev.groundTruth === 1) {
      if (swanAlert) {
        swanDec.className = "verdict-pill pill-nominal";
        swanDecText.innerText = "FLARE ALERT ISSUED";
      } else {
        swanDec.className = "verdict-pill pill-alert";
        swanDecText.innerText = "PREDICTED QUIET (MISSED FLARE)";
      }
    } else {
      if (swanAlert) {
        swanDec.className = "verdict-pill pill-alert";
        swanDecText.innerText = "FLARE ALERT (FALSE ALARM)";
      } else {
        swanDec.className = "verdict-pill pill-nominal";
        swanDecText.innerText = "NOMINAL: QUIET SUN";
      }
    }
  }

  const swanNote = document.getElementById("swan-note");
  if (swanNote) {
    let swanNoteHtml = `Ground Truth: <strong>${ev.groundTruth === 1 ? "M/X FLARE" : "QUIET SUN"}</strong> ➔ `;
    if (ev.groundTruth === 1) {
      swanNoteHtml += swanAlert ? `<span class="c-emerald">True Positive (Correct Hit) ✅</span>` : `<span class="c-rose">Missed Flare (False Negative) ❌</span>`;
    } else {
      swanNoteHtml += swanAlert ? `<span class="c-rose">False Alarm (Type I Error) ❌</span>` : `<span class="c-emerald">Correct Quiet (True Negative) ✅</span>`;
    }
    swanNote.innerHTML = swanNoteHtml;
  }

  const swanTss = document.getElementById("swan-tss");
  const swanRecall = document.getElementById("swan-recall");
  const swanFpr = document.getElementById("swan-fpr");
  const swanPrec = document.getElementById("swan-prec");

  if (swanTss) swanTss.innerText = pol.swan.tss;
  if (swanRecall) swanRecall.innerText = pol.swan.recall;
  if (swanFpr) swanFpr.innerText = pol.swan.fpr;
  if (swanPrec) swanPrec.innerText = pol.swan.prec;

  // 4. Update SWAN + NOAA GOES (Fused) Progress Ring & Verdict
  const fusedThresh = pol.fused.thresh;
  const fusedProb = ev.fusedProb;
  const fusedPct = Math.round(fusedProb * 100);
  const fusedProbEl = document.getElementById("fused-prob");
  if (fusedProbEl) fusedProbEl.innerText = `${fusedPct}%`;

  const fusedRing = document.getElementById("ring-fused");
  if (fusedRing) {
    const fusedOffset = 327 - (327 * fusedProb);
    fusedRing.style.strokeDashoffset = fusedOffset;
  }

  const fusedThreshEl = document.getElementById("fused-thresh");
  if (fusedThreshEl) fusedThreshEl.innerText = fusedThresh.toFixed(4);

  const fusedAlert = fusedProb >= fusedThresh;
  const fusedDec = document.getElementById("fused-decision");
  const fusedDecText = document.getElementById("fused-decision-text");

  if (fusedDec && fusedDecText) {
    if (ev.groundTruth === 1) {
      if (fusedAlert) {
        fusedDec.className = "verdict-pill pill-nominal";
        fusedDecText.innerText = "FLARE ALERT ISSUED (RESCUED)";
      } else {
        fusedDec.className = "verdict-pill pill-alert";
        fusedDecText.innerText = "PREDICTED QUIET (MISSED FLARE)";
      }
    } else {
      if (fusedAlert) {
        fusedDec.className = "verdict-pill pill-alert";
        fusedDecText.innerText = "FLARE ALERT (FALSE ALARM)";
      } else {
        fusedDec.className = "verdict-pill pill-nominal";
        fusedDecText.innerText = "NOMINAL: QUIET SUN (SUPPRESSED)";
      }
    }
  }

  const fusedNote = document.getElementById("fused-note");
  if (fusedNote) {
    let fusedNoteHtml = `Ground Truth: <strong>${ev.groundTruth === 1 ? "M/X FLARE" : "QUIET SUN"}</strong> ➔ `;
    if (ev.groundTruth === 1) {
      fusedNoteHtml += fusedAlert ? `<span class="c-emerald">True Positive (Flare Rescued) ✅</span>` : `<span class="c-rose">Missed Flare (False Negative) ❌</span>`;
    } else {
      fusedNoteHtml += fusedAlert ? `<span class="c-rose">False Alarm (Type I Error) ❌</span>` : `<span class="c-emerald">Correct Quiet (Zero False Alarm) ✅</span>`;
    }
    fusedNote.innerHTML = fusedNoteHtml;
  }

  const fusedTss = document.getElementById("fused-tss");
  const fusedRecall = document.getElementById("fused-recall");
  const fusedFpr = document.getElementById("fused-fpr");
  const fusedPrec = document.getElementById("fused-prec");

  if (fusedTss) fusedTss.innerText = pol.fused.tss;
  if (fusedRecall) fusedRecall.innerText = pol.fused.recall;
  if (fusedFpr) fusedFpr.innerText = pol.fused.fpr;
  if (fusedPrec) fusedPrec.innerText = pol.fused.prec;

  // 5. Update Telemetry Readouts & Physical Parameters
  const valXrsb = document.getElementById("val-xrsb");
  const valDeriv = document.getElementById("val-deriv");
  const valMax24 = document.getElementById("val-max24");

  if (valXrsb) valXrsb.innerText = ev.xrsb;
  if (valDeriv) valDeriv.innerText = ev.derivative;
  if (valMax24) valMax24.innerText = ev.max24h;

  const physicsEl = document.getElementById("physics-text");
  if (physicsEl) physicsEl.innerHTML = ev.explanation;

  const valTotusjh = document.getElementById("val-totusjh");
  const valUsflux = document.getElementById("val-usflux");
  const valRvalue = document.getElementById("val-rvalue");
  const valAbsnjzh = document.getElementById("val-absnjzh");

  if (valTotusjh) valTotusjh.innerText = ev.totusjh;
  if (valUsflux) valUsflux.innerText = ev.usflux;
  if (valRvalue) valRvalue.innerText = ev.rvalue;
  if (valAbsnjzh) valAbsnjzh.innerText = ev.absnjzh;

  // 6. Draw High-Fidelity NOAA GOES Waveform
  renderGoesWaveform(ev.points, ev.groundTruth === 1);
}

// ── High-Fidelity SVG GOES Soft X-Ray Waveform ──
function renderGoesWaveform(pts, isFlare) {
  const svg = document.getElementById("goes-chart");
  if (!svg) return;

  const w = 900;
  const h = 220;
  const padL = 60;
  const padR = 40;
  const padT = 25;
  const padB = 35;

  const chartW = w - padL - padR;
  const chartH = h - padT - padB;
  const maxVal = 220;

  const coords = pts.map((p, i) => {
    const x = padL + (i / (pts.length - 1)) * chartW;
    const y = h - padB - (p / maxVal) * chartH;
    return [x, y];
  });

  let pathD = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 >= coords.length ? coords.length - 1 : i + 2];

    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;

    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2[0]} ${p2[1]}`;
  }

  const lastPt = coords[coords.length - 1];
  const areaD = `${pathD} L ${lastPt[0]} ${h - padB} L ${coords[0][0]} ${h - padB} Z`;

  const strokeColor = isFlare ? "#FB7185" : "#22D3EE";
  const gradStart = isFlare ? "rgba(251, 113, 133, 0.28)" : "rgba(34, 211, 238, 0.25)";
  const gradEnd = isFlare ? "rgba(251, 113, 133, 0.0)" : "rgba(34, 211, 238, 0.0)";

  const yX = h - padB - (180 / maxVal) * chartH;
  const yM = h - padB - (120 / maxVal) * chartH;
  const yC = h - padB - (60 / maxVal) * chartH;

  svg.innerHTML = `
    <defs>
      <linearGradient id="goesAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${gradStart}" />
        <stop offset="100%" stop-color="${gradEnd}" />
      </linearGradient>
      <filter id="glowWave" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>

    <!-- Background Grid Lines & Flare Class Indicators -->
    <line x1="${padL}" y1="${yX}" x2="${w - padR}" y2="${yX}" stroke="rgba(251, 113, 133, 0.2)" stroke-dasharray="4,4" />
    <text x="${padL - 10}" y="${yX + 4}" fill="#FB7185" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="end">X-CLASS</text>

    <line x1="${padL}" y1="${yM}" x2="${w - padR}" y2="${yM}" stroke="rgba(245, 158, 11, 0.2)" stroke-dasharray="4,4" />
    <text x="${padL - 10}" y="${yM + 4}" fill="#F59E0B" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="end">M-CLASS</text>

    <line x1="${padL}" y1="${yC}" x2="${w - padR}" y2="${yC}" stroke="rgba(34, 211, 238, 0.15)" stroke-dasharray="4,4" />
    <text x="${padL - 10}" y="${yC + 4}" fill="#64748B" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="600" text-anchor="end">C-CLASS</text>

    <!-- Baseline -->
    <line x1="${padL}" y1="${h - padB}" x2="${w - padR}" y2="${h - padB}" stroke="rgba(255, 255, 255, 0.12)" />

    <!-- X-Axis Time Ticks -->
    <text x="${padL}" y="${h - 10}" fill="#64748B" font-size="10" font-family="'JetBrains Mono', monospace">T − 24h</text>
    <text x="${padL + chartW * 0.25}" y="${h - 10}" fill="#64748B" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">T − 18h</text>
    <text x="${padL + chartW * 0.5}" y="${h - 10}" fill="#64748B" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">T − 12h</text>
    <text x="${padL + chartW * 0.75}" y="${h - 10}" fill="#64748B" font-size="10" font-family="'JetBrains Mono', monospace" text-anchor="middle">T − 6h</text>
    <text x="${w - padR}" y="${h - 10}" fill="${strokeColor}" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="700" text-anchor="end">T = 0h (AS-OF)</text>

    <!-- Area Fill -->
    <path d="${areaD}" fill="url(#goesAreaGrad)" />

    <!-- Smooth Curve Stroke -->
    <path d="${pathD}" fill="none" stroke="${strokeColor}" stroke-width="2.6" stroke-linecap="round" filter="url(#glowWave)" />

    <!-- AS-OF Observation Cursor Line -->
    <line x1="${lastPt[0]}" y1="${padT}" x2="${lastPt[0]}" y2="${h - padB}" stroke="${strokeColor}" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.75" />

    <!-- Data Points -->
    ${coords.map(pt => `<circle cx="${pt[0]}" cy="${pt[1]}" r="2" fill="${strokeColor}" opacity="0.6" />`).join("")}

    <!-- Active Probe Pulse Ring -->
    <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="9" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.5">
      <animate attributeName="r" values="6;16;6" dur="2s" repeatCount="indefinite" />
      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
    </circle>
    <circle cx="${lastPt[0]}" cy="${lastPt[1]}" r="5" fill="#FFFFFF" stroke="${strokeColor}" stroke-width="2.5" />
  `;
}

// ── Interactive Pipeline Spotlight (Tab 2) ──
function initPipeline() {
  const nodes = document.querySelectorAll(".flow-node");
  nodes.forEach(node => {
    node.addEventListener("click", () => {
      nodes.forEach(n => n.classList.remove("active"));
      node.classList.add("active");
      const stage = parseInt(node.getAttribute("data-stage"), 10);
      renderStageSpotlight(stage);
    });
  });
  renderStageSpotlight(1);
}

function renderStageSpotlight(stg) {
  const data = STAGE_DETAILS[stg];
  if (!data) return;

  const badgeEl = document.getElementById("sd-badge");
  const titleEl = document.getElementById("sd-title");
  const itemsEl = document.getElementById("sd-items");

  if (badgeEl) badgeEl.innerText = data.badge;
  if (titleEl) titleEl.innerText = data.title;

  if (itemsEl) {
    itemsEl.innerHTML = data.items.map(it => `
      <div class="sd-item">
        <div class="sd-item-title">${it.title}</div>
        <div class="sd-item-text">${it.text}</div>
      </div>
    `).join("");
  }
}

// ── Hive Metastore Table (Tab 3) ──
function initHiveTable() {
  const chips = document.querySelectorAll(".hf-chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      activeHiveFilter = chip.getAttribute("data-filter");
      renderHiveTable();
    });
  });

  const headers = document.querySelectorAll(".hive-table th");
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
  if (!tbody) return;

  tbody.innerHTML = rows.map(r => {
    const isPrimary = r.id === "RF_SWAN_GOES_P5_WT13_FPR5";
    const bgRow = isPrimary ? "background: rgba(34, 211, 238, 0.05);" : "";

    return `
      <tr style="${bgRow}">
        <td style="color: ${r.features.includes('+') ? 'var(--cyan)' : 'var(--text)'}; font-weight: 600;">
          ${r.id} ${isPrimary ? '<span style="color: var(--cyan); font-size: 10px; margin-left: 4px;">★ BEST</span>' : ''}
        </td>
        <td>
          <span class="tag-feat" style="background: ${r.features.includes('+') ? 'var(--cyan-dim)' : 'rgba(255,255,255,0.06)'}; color: ${r.features.includes('+') ? 'var(--cyan)' : 'var(--text-2)'};">
            ${r.features}
          </span>
        </td>
        <td>${r.trees}</td>
        <td>${r.weight}</td>
        <td>${r.thresh.toFixed(4)}</td>
        <td style="color: var(--emerald); font-weight: 700;">${r.tss.toFixed(4)}</td>
        <td>${r.recall.toFixed(2)}%</td>
        <td style="color: ${r.fpr <= 2.5 ? 'var(--emerald)' : (r.fpr <= 5.0 ? 'var(--cyan)' : (r.fpr <= 10.0 ? 'var(--amber)' : 'var(--rose)'))}">${r.fpr.toFixed(2)}%</td>
        <td>${r.prec.toFixed(2)}%</td>
        <td>${r.f1.toFixed(4)}</td>
        <td>${r.tp.toLocaleString()}</td>
        <td>${r.fp.toLocaleString()}</td>
      </tr>
    `;
  }).join("");
}
