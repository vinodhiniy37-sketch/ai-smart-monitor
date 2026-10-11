# Dataset Documentation: AI Smart Monitoring System

## 1. Overview & Dataset Source

* **Dataset Name**: Cryptojacking Attack Timeseries Dataset
* **Kaggle Source URL**: [https://www.kaggle.com/datasets/keshanijayasinghe/cryptojacking-attack-timeseries-dataset](https://www.kaggle.com/datasets/keshanijayasinghe/cryptojacking-attack-timeseries-dataset)
* **Author / Reference**: Keshani Jayasinghe (`keshanijayasinghe`)
* **Licence**: CC0: Public Domain
* **Local Processed File Path**: `backend/ml/data/kaggle_server_metrics.csv`
* **Original Telemetry Source**: Real Linux cloud server instances monitored continuously via `glances` (an open-source system monitoring daemon built on Python's `psutil`).

---

## 2. File Specifications & Data Integrity

* **Total Records (Rows)**: 11,000
* **Total Columns**: 6 (5 feature columns + 1 ground truth classification label)
* **File Size**: ~273.4 KB (279,988 bytes)
* **Missing Values (Nulls / NaNs)**: 0 (completely clean across all features)
* **Duplicate Rows**: 9,217 rows share identical rounded numerical states (characteristic of steady-state/idle server time series).
* **Sampling Methodology**: Sampled from the disjoint 70% Train Pool of the raw Kaggle dataset:
  * 10,000 normal baseline records (`is_anomaly_ground_truth = 0`, 90.91%)
  * 1,000 anomalous attack records (`is_anomaly_ground_truth = 1`, 9.09%)
  * Representative contamination level: ~9.09%

---

## 3. Feature Descriptions & Preprocessing Mappings

| Feature Name | Kaggle Raw Column | Physical Meaning | Unit | Telemetry Range | Live `psutil` Mapping |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`cpu_usage`** | `cpu_total` | Total non-idle CPU percentage ($100 - \text{idle}$) | % (0.0 - 100.0) | 5.2% – 100.0% | `psutil.cpu_percent(interval=0.1)` |
| **`memory_usage`** | `mem_percent` | Virtual RAM utilization percentage | % (0.0 - 100.0) | 11.5% – 90.3% | `psutil.virtual_memory().percent` |
| **`disk_usage`** | `fs_/_percent` | Root partition storage fullness | % (0.0 - 100.0) | 23.6% – 96.9% | `psutil.disk_usage(root_path).percent` |
| **`network_sent`** | `network_lo_tx` | Outbound loopback transmission rate | bytes / second | 0.0 – 144.0 B/s | Loopback $\frac{\Delta \text{bytes}}{\Delta t}$ via `psutil.net_io_counters(pernic=True)` |
| **`running_processes`** | `processcount_total` | Active operating system tasks | Integer count | 89 – 123 PIDs | `len(psutil.pids())` |
| **`is_anomaly_ground_truth`** | Dataset origin file | Binary classification label | 0 (Normal), 1 (Anomaly) | 0 or 1 | Ground truth label for offline validation |

### Preprocessing Steps Applied
1. **Extraction**: Columns were mapped 1:1 from the raw glances logs (`cpu_total`, `mem_percent`, `fs_/_percent`, `network_lo_tx`, and `processcount_total`).
2. **Bounds Enforcement**: Percentages were clipped to $[0.0, 100.0]$, and network transmission was clipped to non-negative floats.
3. **Partitioning**: A strict 70% Train / 30% Test split was established using fixed random seed `42`.
4. **Lightweight Artifact Creation**: 11,000 records were drawn from the 70% Train Pool to train the Cloud VM model, while the remaining 30% Test Pool was preserved as the independent held-out evaluation set (`held_out_test_metrics.csv`, 12,000 rows).

---

## 4. Distinction Between Kaggle Data and Environment Profiles

1. **`cloud_vm` Model (`isolation_forest.pkl`)**:
   * **Data Source**: 100% Real Kaggle Telemetry (`kaggle_server_metrics.csv`).
   * **Domain**: Dedicated Linux virtual machines.
   * **Independent Validation**: Evaluated against real held-out Kaggle telemetry (`held_out_test_metrics.csv`).
2. **`cloud_container` Model (`isolation_forest_container.pkl`)**:
   * **Data Source**: Statistically generated domain profile.
   * **Domain**: Isolated container namespaces (Render, Docker, Kubernetes) where active PIDs are low ($\le 20$) and base RAM is 45–78%.
   * **Validation Set**: Separate disjoint seed dataset (`held_out_container_metrics.csv`, `seed=999`).
3. **`workstation` Model (`isolation_forest_workstation.pkl`)**:
   * **Data Source**: Statistically generated domain profile.
   * **Domain**: Developer host operating systems (Windows 11, macOS) with 180–290 background PIDs.
   * **Validation Set**: Separate disjoint seed dataset (`held_out_workstation_metrics.csv`, `seed=999`).

---

## 5. Known Limitations

* **Domain Shift**: The raw Kaggle telemetry was recorded on a dedicated Linux VM with 89–123 processes and ~18% idle RAM. It cannot be applied directly to lightweight Docker containers (3 PIDs) or Windows desktops (250 PIDs) without environment calibration.
* **Network Interface Scope**: The Kaggle dataset recorded only loopback traffic (`network_lo_*`). Real live deployments measure loopback rate for the ML model while reporting system-wide cumulative network counters for human dashboard inspection.
* **Steady-State Duplicates**: Steady-state server idle metrics produce duplicate rows across time-series snapshots; this is normal physical behavior rather than synthetic distortion.
