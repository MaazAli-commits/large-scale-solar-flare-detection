import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# High resolution, 16:9 widescreen canvas
fig = plt.figure(figsize=(16, 8.5), dpi=300, facecolor="#0B0F19")
ax = fig.add_axes([0, 0, 1, 1], facecolor="#0B0F19")
ax.set_xlim(0, 1600)
ax.set_ylim(0, 850)
ax.axis("off")

# Title and Subtitle
ax.text(800, 805, "Operational Solar Flare Forecasting Pipeline", 
        fontsize=24, fontweight="bold", color="#F8FAFC", ha="center", va="center", fontfamily="sans-serif")
ax.text(800, 775, "End-to-End Distributed Big Data Architecture | CSE412: Big Data Analytics", 
        fontsize=13, color="#94A3B8", ha="center", va="center", fontfamily="sans-serif")

# Helper function to draw sleek cards
def draw_card(ax, x, y, w, h, bg_color, border_color, step_num, step_title, header_color):
    # Shadow
    shadow = patches.FancyBboxPatch((x+4, y-4), w, h, boxstyle="round,pad=0,rounding_size=12",
                                   facecolor="#020617", edgecolor="none", alpha=0.6, zorder=1)
    ax.add_patch(shadow)
    # Main card
    card = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0,rounding_size=12",
                                 facecolor=bg_color, edgecolor=border_color, linewidth=2.0, zorder=2)
    ax.add_patch(card)
    # Header badge
    badge_w = 46
    badge_h = 24
    badge = patches.FancyBboxPatch((x + 14, y + h - 38), badge_w, badge_h, boxstyle="round,pad=0,rounding_size=6",
                                  facecolor=border_color, edgecolor="none", zorder=3)
    ax.add_patch(badge)
    ax.text(x + 14 + badge_w/2, y + h - 26, step_num, fontsize=11, fontweight="bold", 
            color="#0B0F19", ha="center", va="center", zorder=4)
    # Title
    ax.text(x + 70, y + h - 26, step_title, fontsize=13, fontweight="bold", 
            color=header_color, ha="left", va="center", zorder=4)
    # Header divider line
    ax.plot([x + 14, x + w - 14], [y + h - 50, y + h - 50], color=border_color, alpha=0.4, linewidth=1.2, zorder=3)

# Helper to draw bold connecting arrows
def draw_flow_arrow(ax, x1, y1, x2, y2, color="#38BDF8"):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>,head_width=0.6,head_length=0.9",
                                color=color, lw=3.0, shrinkA=0, shrinkB=0), zorder=10)

# Card dimensions
card_w = 265
card_h = 420
card_y = 290
gap = 42
start_x = 55

# 1. INGESTION CARD
x1 = start_x
draw_card(ax, x1, card_y, card_w, card_h, "#131C31", "#FB923C", "01", "INGESTION", "#FED7AA")
# Content lines
ax.text(x1 + 18, card_y + 335, "SDO/HMI SWAN-SF", fontsize=11.5, fontweight="bold", color="#FDBA74")
ax.text(x1 + 18, card_y + 312, "• 73,492 Multivariate TSVs", fontsize=10, color="#CBD5E1")
ax.text(x1 + 18, card_y + 292, "• 44 Photospheric Features", fontsize=10, color="#CBD5E1")
ax.text(x1 + 18, card_y + 272, "• 12-min Cadence (P1 - P5)", fontsize=10, color="#CBD5E1")

ax.text(x1 + 18, card_y + 230, "NOAA GOES-15 Satellite", fontsize=11.5, fontweight="bold", color="#FDBA74")
ax.text(x1 + 18, card_y + 207, "• Continuous X-ray Flux", fontsize=10, color="#CBD5E1")
ax.text(x1 + 18, card_y + 187, "• 1h Derivative & 24h Peak", fontsize=10, color="#CBD5E1")
ax.text(x1 + 18, card_y + 167, "• 5 Coronal Features", fontsize=10, color="#CBD5E1")

ax.text(x1 + 18, card_y + 125, "AS-OF Temporal Join", fontsize=11.5, fontweight="bold", color="#FDBA74")
ax.text(x1 + 18, card_y + 102, "• Point-in-time Alignment", fontsize=10, color="#CBD5E1")
ax.text(x1 + 18, card_y + 82, "• Zero Future Leakage", fontsize=10, color="#CBD5E1")

# Arrow 1 -> 2
draw_flow_arrow(ax, x1 + card_w + 6, card_y + card_h/2, x1 + card_w + gap - 6, card_y + card_h/2, "#FB923C")

# 2. HDFS STORAGE CARD
x2 = x1 + card_w + gap
draw_card(ax, x2, card_y, card_w, card_h, "#131C31", "#FACC15", "02", "STORAGE", "#FEF08A")
ax.text(x2 + 18, card_y + 335, "Apache Hadoop HDFS", fontsize=11.5, fontweight="bold", color="#FDE047")
ax.text(x2 + 18, card_y + 312, "• Port 9000 Cluster", fontsize=10, color="#CBD5E1")
ax.text(x2 + 18, card_y + 292, "• 128 MB Block Size", fontsize=10, color="#CBD5E1")
ax.text(x2 + 18, card_y + 272, "• Data Locality Scheduling", fontsize=10, color="#CBD5E1")

ax.text(x2 + 18, card_y + 230, "Parquet Warehouse", fontsize=11.5, fontweight="bold", color="#FDE047")
ax.text(x2 + 18, card_y + 207, "• 837,426 Unified Rows", fontsize=10, color="#CBD5E1")
ax.text(x2 + 18, card_y + 187, "• 49 Feature Columns", fontsize=10, color="#CBD5E1")
ax.text(x2 + 18, card_y + 167, "• Snappy Compressed", fontsize=10, color="#CBD5E1")

ax.text(x2 + 18, card_y + 125, "5 Benchmark Splits", fontsize=11.5, fontweight="bold", color="#FDE047")
ax.text(x2 + 18, card_y + 102, "• Chronological Order", fontsize=10, color="#CBD5E1")
ax.text(x2 + 18, card_y + 82, "• >75% Footprint Reduction", fontsize=10, color="#CBD5E1")

# Arrow 2 -> 3
draw_flow_arrow(ax, x2 + card_w + 6, card_y + card_h/2, x2 + card_w + gap - 6, card_y + card_h/2, "#FACC15")

# 3. SPARK ETL CARD
x3 = x2 + card_w + gap
draw_card(ax, x3, card_y, card_w, card_h, "#131C31", "#38BDF8", "03", "SPARK ETL", "#BAE6FD")
ax.text(x3 + 18, card_y + 335, "Apache Spark 3.5", fontsize=11.5, fontweight="bold", color="#7DD3FC")
ax.text(x3 + 18, card_y + 312, "• In-Memory DataFrames", fontsize=10, color="#CBD5E1")
ax.text(x3 + 18, card_y + 292, "• Distributed RDD DAGs", fontsize=10, color="#CBD5E1")
ax.text(x3 + 18, card_y + 272, "• Multi-Worker Parallelism", fontsize=10, color="#CBD5E1")

ax.text(x3 + 18, card_y + 230, "Feature Pipelines", fontsize=11.5, fontweight="bold", color="#7DD3FC")
ax.text(x3 + 18, card_y + 207, "• Median Imputer (P1-P3)", fontsize=10, color="#CBD5E1")
ax.text(x3 + 18, card_y + 187, "• VectorAssembler (49-D)", fontsize=10, color="#CBD5E1")
ax.text(x3 + 18, card_y + 167, "• StandardScaler (Z-Score)", fontsize=10, color="#CBD5E1")

ax.text(x3 + 18, card_y + 125, "Solar Partitioning", fontsize=11.5, fontweight="bold", color="#7DD3FC")
ax.text(x3 + 18, card_y + 102, "• Train: P1-P3 (518k rows)", fontsize=10, color="#CBD5E1")
ax.text(x3 + 18, card_y + 82, "• Test: P5 (209k rows)", fontsize=10, color="#CBD5E1")

# Arrow 3 -> 4
draw_flow_arrow(ax, x3 + card_w + 6, card_y + card_h/2, x3 + card_w + gap - 6, card_y + card_h/2, "#38BDF8")

# 4. SPARK MLLIB CARD
x4 = x3 + card_w + gap
draw_card(ax, x4, card_y, card_w, card_h, "#131C31", "#C084FC", "04", "SPARK ML", "#E9D5FF")
ax.text(x4 + 18, card_y + 335, "Distributed RF", fontsize=11.5, fontweight="bold", color="#D8B4FE")
ax.text(x4 + 18, card_y + 312, "• Spark MLlib Random Forest", fontsize=10, color="#CBD5E1")
ax.text(x4 + 18, card_y + 292, "• 100 Trees | Depth 10", fontsize=10, color="#CBD5E1")
ax.text(x4 + 18, card_y + 272, "• DTStatsAggregator", fontsize=10, color="#CBD5E1")

ax.text(x4 + 18, card_y + 230, "Imbalance Handling", fontsize=11.5, fontweight="bold", color="#D8B4FE")
ax.text(x4 + 18, card_y + 207, "• 13.17 : 1 Cost Weight", fontsize=10, color="#CBD5E1")
ax.text(x4 + 18, card_y + 187, "• Natural Physics Preserved", fontsize=10, color="#CBD5E1")
ax.text(x4 + 18, card_y + 167, "• Zero Synthetic Bloat", fontsize=10, color="#CBD5E1")

ax.text(x4 + 18, card_y + 125, "Threshold Search", fontsize=11.5, fontweight="bold", color="#D8B4FE")
ax.text(x4 + 18, card_y + 102, "• Calibrated on P4 Valid", fontsize=10, color="#CBD5E1")
ax.text(x4 + 18, card_y + 82, "• Max TSS under FPR Budget", fontsize=10, color="#CBD5E1")

# Arrow 4 -> 5
draw_flow_arrow(ax, x4 + card_w + 6, card_y + card_h/2, x4 + card_w + gap - 6, card_y + card_h/2, "#C084FC")

# 5. OPERATIONAL OUTPUT CARD
x5 = x4 + card_w + gap
draw_card(ax, x5, card_y, card_w, card_h, "#131C31", "#FB7185", "05", "FORECAST", "#FFE4E6")
ax.text(x5 + 18, card_y + 335, "Operational Alert", fontsize=11.5, fontweight="bold", color="#FDA4AF")
ax.text(x5 + 18, card_y + 312, "• 24h Early Flare Warning", fontsize=10, color="#CBD5E1")
ax.text(x5 + 18, card_y + 292, "• M- & X-Class Flares", fontsize=10, color="#CBD5E1")
ax.text(x5 + 18, card_y + 272, "• Satellite & Grid Alerting", fontsize=10, color="#CBD5E1")

ax.text(x5 + 18, card_y + 230, "Strict FPR <= 5%", fontsize=11.5, fontweight="bold", color="#FDA4AF")
ax.text(x5 + 18, card_y + 207, "• SWAN+GOES: TSS = 0.3365", fontsize=10, fontweight="bold", color="#4ADE80")
ax.text(x5 + 18, card_y + 187, "• SWAN-Only: TSS = 0.2781", fontsize=10, color="#94A3B8")
ax.text(x5 + 18, card_y + 167, "• +21.0% Relative Gain", fontsize=10, fontweight="bold", color="#FACC15")

ax.text(x5 + 18, card_y + 125, "Key Impact", fontsize=11.5, fontweight="bold", color="#FDA4AF")
ax.text(x5 + 18, card_y + 102, "• 512 More Flares Caught", fontsize=10, fontweight="bold", color="#4ADE80")
ax.text(x5 + 18, card_y + 82, "• Holds FPR to 2.33%", fontsize=10, color="#CBD5E1")

# BOTTOM WIDE CARD: APACHE HIVE METASTORE
hive_x = x2
hive_w = x5 + card_w - x2
hive_h = 135
hive_y = 75

# Shadow
shadow_hive = patches.FancyBboxPatch((hive_x+4, hive_y-4), hive_w, hive_h, boxstyle="round,pad=0,rounding_size=12",
                                     facecolor="#020617", edgecolor="none", alpha=0.6, zorder=1)
ax.add_patch(shadow_hive)
# Main card
card_hive = patches.FancyBboxPatch((hive_x, hive_y), hive_w, hive_h, boxstyle="round,pad=0,rounding_size=12",
                                  facecolor="#0F241D", edgecolor="#34D399", linewidth=2.0, zorder=2)
ax.add_patch(card_hive)

# Hive Header
badge_hive = patches.FancyBboxPatch((hive_x + 18, hive_y + hive_h - 36), 52, 24, boxstyle="round,pad=0,rounding_size=6",
                                    facecolor="#34D399", edgecolor="none", zorder=3)
ax.add_patch(badge_hive)
ax.text(hive_x + 18 + 26, hive_y + hive_h - 24, "HIVE", fontsize=10.5, fontweight="bold", 
        color="#0B0F19", ha="center", va="center", zorder=4)
ax.text(hive_x + 80, hive_y + hive_h - 24, "APACHE HIVE 4.0 METASTORE & EXPERIMENT AUDIT LAYER", 
        fontsize=13, fontweight="bold", color="#A7F3D0", ha="left", va="center", zorder=4)

# 3 Columns inside Hive card
# Col 1: Database
ax.text(hive_x + 25, hive_y + 70, "Schema-on-Read Metastore", fontsize=11, fontweight="bold", color="#6EE7B7")
ax.text(hive_x + 25, hive_y + 48, "• Database: solar_flare", fontsize=9.5, color="#CBD5E1")
ax.text(hive_x + 25, hive_y + 28, "• Decoupled Storage & Compute", fontsize=9.5, color="#CBD5E1")

# Col 2: model_experiments table
ax.text(hive_x + 360, hive_y + 70, "Table: model_experiments", fontsize=11, fontweight="bold", color="#6EE7B7")
ax.text(hive_x + 360, hive_y + 48, "• 33 cataloged benchmark runs", fontsize=9.5, color="#CBD5E1")
ax.text(hive_x + 360, hive_y + 28, "• Hyperparameters, TSS, F1, PR-AUC", fontsize=9.5, color="#CBD5E1")

# Col 3: model_predictions table
ax.text(hive_x + 720, hive_y + 70, "Table: model_predictions", fontsize=11, fontweight="bold", color="#6EE7B7")
ax.text(hive_x + 720, hive_y + 48, "• 209,809 P5 test inferences", fontsize=9.5, color="#CBD5E1")
ax.text(hive_x + 720, hive_y + 28, "• Full probability distributions", fontsize=9.5, color="#CBD5E1")

# Vertical Arrows connecting ML & Storage to Hive
# Spark ML (Card 4) down to Hive
draw_flow_arrow(ax, x4 + card_w/2, card_y - 4, x4 + card_w/2, hive_y + hive_h + 4, "#34D399")
ax.text(x4 + card_w/2 + 10, (card_y + hive_y + hive_h)/2, "Catalog Experiments", fontsize=9, color="#6EE7B7", va="center")

# Storage (Card 2) down to Hive
draw_flow_arrow(ax, x2 + card_w/2, card_y - 4, x2 + card_w/2, hive_y + hive_h + 4, "#34D399")
ax.text(x2 + card_w/2 + 10, (card_y + hive_y + hive_h)/2, "External Tables", fontsize=9, color="#6EE7B7", va="center")

plt.savefig("/home/maaz/solar-flare-project/docs/architecture_diagram.png", dpi=300, facecolor=fig.get_facecolor(), edgecolor="none", bbox_inches="tight")
plt.savefig("/home/maaz/solar-flare-project/docs/architecture_diagram.svg", facecolor=fig.get_facecolor(), edgecolor="none", bbox_inches="tight")
plt.savefig("/home/maaz/solar-flare-project/architecture_diagram.png", dpi=300, facecolor=fig.get_facecolor(), edgecolor="none", bbox_inches="tight")
plt.savefig("/home/maaz/solar-flare-project/architecture_diagram.svg", facecolor=fig.get_facecolor(), edgecolor="none", bbox_inches="tight")

print("SUCCESS: Clean flowchart diagram generated")
