#!/bin/bash
# ==============================================================================
# HDFS Setup & Data Ingestion Script for Solar Flare Project
# ==============================================================================
set -e

# 1. Environment Setup
export JAVA_HOME=${JAVA_HOME:-/usr/lib/jvm/java-11-openjdk-amd64}
export HADOOP_HOME=${HADOOP_HOME:-$HOME/hadoop}
export HADOOP_CONF_DIR=${HADOOP_CONF_DIR:-$HADOOP_HOME/etc/hadoop}
export PATH=$PATH:$HADOOP_HOME/bin:$HADOOP_HOME/sbin

echo "============================================================"
echo " Starting HDFS Setup & Ingestion for Solar Flare Project"
echo "============================================================"

# 2. Check if NameNode is already running
if ! $JAVA_HOME/bin/jps | grep -q "NameNode"; then
    echo "[+] Starting HDFS cluster daemons (NameNode, DataNode)..."
    $HADOOP_HOME/sbin/start-dfs.sh
    sleep 3
else
    echo "[+] HDFS daemons are already running."
fi

# 3. Check and leave Safe Mode if necessary
echo "[+] Ensuring HDFS is out of Safe Mode..."
hdfs dfsadmin -safemode leave || true

# 4. Create HDFS Project Directories
HDFS_TARGET_DIR="/solar_flare/data/features"
echo "[+] Creating HDFS directory structure: $HDFS_TARGET_DIR"
hdfs dfs -mkdir -p "$HDFS_TARGET_DIR"

# 5. Ingest Preprocessed Partition Parquet Files
LOCAL_DATA_DIR="/home/maaz/solar-flare-project/data/features"
echo "[+] Checking partitions in HDFS..."

for p in 1 2 3 4 5; do
    PART_FILE="partition${p}_final.parquet"
    if hdfs dfs -test -e "$HDFS_TARGET_DIR/$PART_FILE"; then
        echo "  [✓] Partition $p already present in HDFS."
    else
        echo "  [↑] Uploading Partition $p from $LOCAL_DATA_DIR/$PART_FILE to HDFS..."
        hdfs dfs -put "$LOCAL_DATA_DIR/$PART_FILE" "$HDFS_TARGET_DIR/"
    fi
done

# 6. Verification and Inspection
echo "============================================================"
echo " HDFS Verification & Disk Usage Summary"
echo "============================================================"
echo "HDFS Directory Listing:"
hdfs dfs -ls "$HDFS_TARGET_DIR"

echo ""
echo "HDFS Storage Footprint:"
hdfs dfs -du -h "$HDFS_TARGET_DIR"

echo "============================================================"
echo " HDFS Integration Completed & Verified!"
echo " Spark Base URI: hdfs://localhost:9000$HDFS_TARGET_DIR"
echo "============================================================"
