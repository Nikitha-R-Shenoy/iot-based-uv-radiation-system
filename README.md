# IoT-Based UV Radiation Monitoring System

## Overview

This project implements a compact IoT solution to monitor indoor UV radiation levels in real time. A Raspberry Pi, integrated with a UV sensor and an ADC converter, captures radiation data and transmits it to a Firebase Realtime Database via HTTP. The data is then visualized on a live dashboard for remote access and monitoring.

## System Workflow

* UV sensor measures radiation intensity
* ADC converts analog signals to digital data
* Raspberry Pi processes and sends data via HTTP
* Firebase updates the real-time dashboard

## Technologies Used

* **Hardware:** Raspberry Pi 3B+, UV Sensor - ML8511 , ADC Converter - ADS1115 
* **Software:** Python, Firebase Realtime Database, HTTP Protocol

## Key Features

* Real-time UV monitoring
* Cloud-based data storage
* Live dashboard visualization
* Simple and scalable architecture

## Applications

Suitable for smart environments and safety monitoring systems.

## Future Scope

Enhancements may include multi-sensor integration and historical data analysis.

## License

Developed for academic purposes.
