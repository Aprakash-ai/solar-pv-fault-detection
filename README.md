# ☀️ Solar PV Fault Detection System

A Machine Learning-based system for detecting and classifying faults in Solar Photovoltaic (PV) systems using electrical and environmental operating measurements.

## 📌 Project Overview

Solar photovoltaic systems can experience different operating faults such as short circuits, open circuits, degradation, and shadowing. Early identification of these conditions can help improve monitoring, maintenance, and overall system reliability.

This project aims to develop an end-to-end Machine Learning-based Solar PV Fault Detection System that analyzes PV operating measurements and automatically classifies the system condition.

The project combines:

- Machine Learning
- Feature Engineering
- Exploratory Data Analysis
- Model Comparison
- Hyperparameter Optimization
- Explainable AI
- REST API
- React Frontend
- Firebase Authentication & Database

The Machine Learning pipeline is the core of the system, while React and Firebase provide the application and deployment layer.

---

## 🎯 Problem Statement

Develop a supervised Machine Learning system capable of detecting and classifying different operating conditions and faults in Solar PV systems using electrical and environmental measurements.

The system will compare multiple Machine Learning algorithms, identify the best-performing model, explain its predictions, and integrate the final model into a web-based diagnostic platform.

---

## 🎯 Objectives

- Analyze real-world Solar PV operational data.
- Perform comprehensive Exploratory Data Analysis.
- Clean and preprocess the dataset.
- Engineer physically meaningful features.
- Handle class imbalance appropriately.
- Compare multiple Machine Learning algorithms.
- Perform cross-validation and hyperparameter tuning.
- Evaluate models using appropriate classification metrics.
- Analyze class-wise fault detection performance.
- Apply Explainable AI techniques such as SHAP.
- Develop a reusable ML inference pipeline.
- Expose the ML model through a REST API.
- Build a React-based user interface.
- Implement authentication using Firebase.
- Store prediction history using Firebase Firestore.

---

## ⚙️ ML Models

The project will evaluate multiple Machine Learning algorithms, including:

- Logistic Regression
- K-Nearest Neighbors (KNN)
- Decision Tree
- Support Vector Machine (SVM)
- Random Forest
- Gradient Boosting
- XGBoost

The final model will be selected based on overall performance, with particular emphasis on Macro-F1, class-wise recall, and confusion-matrix behaviour.

---

## 📊 Dataset

The project uses a labelled Solar PV fault dataset containing electrical and environmental measurements from a grid-connected photovoltaic system.

### Main Features

- DC Voltage – PV String 1
- DC Voltage – PV String 2
- DC Current – PV String 1
- DC Current – PV String 2
- Solar Irradiance
- PV/Module Temperature

### Target

The target variable represents the operating condition/fault class of the PV system.

Expected classes include:

- Normal Operation
- Short Circuit
- Degradation
- Open Circuit
- Shadowing

The original raw dataset will be kept separately from processed data.

---

## 🧠 Machine Learning Workflow

```text
Dataset Acquisition
        ↓
Data Understanding
        ↓
Data Cleaning
        ↓
Exploratory Data Analysis
        ↓
Feature Engineering
        ↓
Train/Test Strategy
        ↓
Preprocessing
        ↓
Class Imbalance Handling
        ↓
Baseline Model
        ↓
Multiple ML Models
        ↓
Cross Validation
        ↓
Hyperparameter Tuning
        ↓
Final Evaluation
        ↓
Explainable AI
        ↓
Final ML Pipeline
        ↓
FastAPI
        ↓
React + Firebase Application