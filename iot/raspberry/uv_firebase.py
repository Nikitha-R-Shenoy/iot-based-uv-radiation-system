

import time
import board
import busio
import firebase_admin
from firebase_admin import credentials, db
from adafruit_ads1x15.ads1115 import ADS1115
from adafruit_ads1x15.analog_in import AnalogIn

# ---------------------------
# Firebase Setup
# ---------------------------
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    "databaseURL": "https://mini-project-754ff-default-rtdb.firebaseio.com/"   
})

# ---------------------------
# ADS1115 Setup
# ---------------------------
i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS1115(i2c)
ads.gain = 1   # 0–4.096V

# ML8511 connected to ADS1115 A1
uv_channel = AnalogIn(ads, ADS1115.P1)

# ---------------------------
# UV Conversion Logic
# ---------------------------
# From ML8511 datasheet:
# 0.99V  → 0 mW/cm²
# 2.80V  → ~15 mW/cm²
def uv_mwcm2(voltage):
    v_min = 0.99
    v_max = 2.80
    uv_max = 15.0

    if voltage <= v_min:
        return 0.0

    return (voltage - v_min) * (uv_max / (v_max - v_min))


print("Reading ML8511 UV Sensor and sending data to Firebase...")
time.sleep(1)

# ---------------------------
# Main Loop
# ---------------------------
while True:
    # Read sensor
    uv_voltage = uv_channel.voltage
    uv_intensity = uv_mwcm2(uv_voltage)

    # Prepare data to send
    data = {
        "uv_intensity_mW_cm2": uv_intensity,
        "voltage": uv_voltage,
        "timestamp": int(time.time())
    }

    # Send to Firebase
    db.reference("uvData").push(data)

    # Print locally
    print(f"Sent: Voltage={uv_voltage:.4f} V | UV={uv_intensity:.3f} mW/cm²")

    time.sleep(1)
