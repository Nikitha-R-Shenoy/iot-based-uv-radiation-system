# IoT-Based UV Radiation Monitoring System

## 📌 Overview

This project implements a complete **IoT pipeline** to monitor UV radiation in real time using a hardware sensor, Raspberry Pi, and cloud database.

The system collects analog data from a UV sensor, converts it to digital values, processes it using Python, and sends it to Firebase Realtime Database for live monitoring and visualization.

---

## System Architecture

```
ML8511 UV Sensor
        ↓
ADS1115 (Analog-to-Digital Converter)
        ↓
Raspberry Pi (Python Script)
        ↓
Firebase Realtime Database
        ↓
Frontend Dashboard (Graph Visualization)
```

---

## Hardware Components

* ML8511 UV Sensor
* ADS1115 ADC Module
* Raspberry Pi
* Connecting wires

---

## Software Requirements

* Python 3
* Firebase Realtime Database
* Required Libraries:

  * firebase-admin
  * adafruit-circuitpython-ads1x15
  * adafruit-blinka

---

## Setup Instructions

### 1. Create Virtual Environment (Recommended)

```bash
python3 -m venv pi-env
source pi-env/bin/activate
```

---

###  2. Install Required Libraries

```bash
pip install -r requirements.txt
```

Or manually:

```bash
pip install firebase-admin adafruit-circuitpython-ads1x15 adafruit-blinka
```

---

###  3. Enable I2C on Raspberry Pi

```bash
sudo raspi-config
```

* Go to: **Interfacing Options → I2C → Enable**

---

### 4. Firebase Setup

1. Go to Firebase Console
2. Create a new project
3. Enable **Realtime Database**
4. Go to:

   * Project Settings → Service Accounts
   * Click **Generate Private Key**
5. Download the JSON file

👉 Rename it to:

```
serviceAccountKey.json
```

---

### 5. Transfer File to Raspberry Pi (Using WinSCP)

* Use WinSCP to connect to Raspberry Pi
* Transfer `serviceAccountKey.json` from your system to the project folder

---

### 6. Configure Firebase in Code

```python
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://your-project-id-default-rtdb.firebaseio.com/"
})
```

---

## Running the Project

```bash
python3 uv_firebase.py
```

You should see:

```
Reading ML8511 UV Sensor and sending data to Firebase...
Sent: Voltage=1.0035 V | UV=0.112 mW/cm²
Sent: Voltage=1.0035 V | UV=0.112 mW/cm²
```

---

## Data Visualization

* Data is stored in Firebase Realtime Database
* Can be visualized as:

  * Graphs (Frontend dashboard)
  * Real-time updates

Example:

* Left side → Firebase data stream
* Right side → Visual graph representation

---

## Data Flow Explanation

1. Sensor detects UV radiation
2. ADS1115 converts analog → digital
3. Raspberry Pi reads voltage
4. Python converts voltage → UV intensity
5. Data sent to Firebase via HTTP
6. Frontend reads Firebase and displays graph

---

## Key Features

* Real-time UV monitoring
* Hardware + Cloud integration
* Continuous data streaming
* Scalable IoT architecture
* Firebase-based live updates

---

## Learning Outcomes

* Interfacing sensors with Raspberry Pi
* Using ADC (ADS1115) for analog signals
* Cloud integration using Firebase
* Real-time data streaming
* Secure handling of credentials
* End-to-end IoT system design

---

## Future Improvements

* Add alert system for high UV levels
* Store historical data for analysis
* Integrate with mobile/web dashboard
* Use MQTT instead of HTTP for efficiency

---

## Contribution

Added hardware integration module including:

* Sensor data acquisition
* Firebase connectivity
* Real-time data transmission

---
