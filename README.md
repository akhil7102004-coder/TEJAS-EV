# 🚍⚡ TEJAS – Transport Electrification and Journey Analytics System

### KSRTC EV Transition Decision Support System

TEJAS (Transport Electrification and Journey Analytics System) is a data-driven decision-support platform designed to analyse and support the transition from diesel to electric buses across the Kerala State Road Transport Corporation (KSRTC) network.

The platform combines data analysis, machine learning, visualization, economic analysis, environmental assessment, and web application development to provide insights for EV transition planning at the depot level.

> **Note:** TEJAS is a project/prototype developed for analytical and educational purposes. It is not an official KSRTC system.

---

## 🎯 Project Objective

The primary objective of TEJAS is to explore how data science and machine learning can support informed decisions regarding electric bus adoption.

The system analyses operational, demand, terrain, energy, economic, and environmental indicators to identify depots or scenarios where EV transition may be more suitable.

The project focuses on questions such as:

- Which depots show stronger potential for EV transition?
- How do passenger demand and operational intensity vary across depots?
- What are the estimated energy requirements for electric buses?
- What could be the potential operating-cost impact of electrification?
- How do terrain and operational characteristics influence EV suitability?
- Which scenarios can be classified as EV Suitable, Conditional, or Diesel Preferred?

---

## 📊 Dataset

TEJAS uses real-world KSRTC operational and demand data compiled from publicly available sources.

### Dataset Coverage

| Metric | Coverage |
|---|---:|
| KSRTC Depots | **92** |
| Monthly Observations | **5,520** |
| Districts | **14** |
| Observation Type | Monthly depot-level data |

The dataset was prepared and transformed for analytical and machine-learning purposes.

### Key Features

The final machine-learning feature set includes:

- Buses Allocated
- Schedules Allocated
- Passengers
- Estimated Diesel Litres
- Estimated CO₂ (Tonnes)
- Effective KM
- Estimated EV Energy (MWh)
- Passengers per Bus
- Passengers per Schedule
- Diesel Litres per Bus
- Diesel Litres per Schedule
- CO₂ per Bus (Tonnes)
- Terrain Score

---

## 📈 Main Modules

### 1. 🚍 Depot Electrification Command Dashboard

Provides a consolidated view of the KSRTC depot network, including:

- Depot-level operational indicators
- EV transition priorities
- Passenger demand
- Environmental indicators
- Economic indicators
- Depot comparisons

### 2. 📊 Operational & Demand Analysis

Analyses operational and demand-related indicators such as:

- Buses allocated
- Schedules allocated
- Passenger volume
- Effective kilometres
- Operational intensity
- Passenger demand
- Terrain classification

These indicators help understand differences in operational characteristics between depots.

### 3. 🤖 EV Transition Priority Prediction

TEJAS incorporates a tuned Decision Tree Classifier to classify scenarios into three categories:

- **EV Suitable**
- **Conditional**
- **Diesel Preferred**

The model uses operational, efficiency, environmental, and terrain-related features to support the classification process.

### 4. 💰 Economic & OPEX Analysis

The platform estimates the potential economic impact of electrification by comparing:

- Estimated diesel operating costs
- Estimated EV operating costs
- Potential operating-cost savings
- Monthly impact
- Annualized impact
- Different electrification scenarios

These values are analytical estimates based on the assumptions used in the project.

### 5. ⚡ Energy & Charging Infrastructure Planning

TEJAS provides depot-level energy profiles to help analyse:

- Estimated EV energy requirements
- Depot energy demand
- Charging-related planning indicators
- Differences in energy requirements across depots

### 6. 🗺️ Route & Depot Analysis

The platform also provides analytical views for examining:

- Depot-level patterns
- Route-level characteristics
- Operational differences
- Potential EV transition considerations

---

## 🧠 Machine Learning

### Model

**Tuned Decision Tree Classifier**

### Configuration

- Criterion: **Entropy**
- Maximum Depth: **6**
- Classification Type: Multi-class
- Target Classes:
  - EV Suitable
  - Conditional
  - Diesel Preferred

### Current Deployed Performance

| Metric | Result |
|---|---:|
| Holdout Accuracy | **92.37%** |
| Macro F1 Score | **92.32%** |

The model is intended as a decision-support component, not as a replacement for operational, financial, engineering, or policy-level decision-making.

---

## 🔄 Data Science Workflow

The project follows an end-to-end data science workflow:

```text
Data Collection
      ↓
Data Cleaning & Preparation
      ↓
Exploratory Data Analysis
      ↓
Feature Engineering
      ↓
Feature Selection
      ↓
Machine Learning
      ↓
Model Evaluation
      ↓
Impact Analysis
      ↓
Visualization & Dashboard
      ↓
Web Application
      ↓
Deployment
🏗️ System Architecture
                TEJAS Web Application
                         │
                         ▼
              ┌─────────────────────┐
              │   React + Vite      │
              │     Frontend        │
              └──────────┬──────────┘
                         │
                         │ REST API
                         ▼
              ┌─────────────────────┐
              │       Flask         │
              │       Backend       │
              └──────────┬──────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │ Decision Tree Model │
              │    Scikit-learn     │
              └─────────────────────┘
Deployment
Frontend: Vercel
Backend: Render
Source Code: GitHub
Machine Learning: Scikit-learn
🛠️ Technology Stack
Programming & Data Science
Python
Pandas
NumPy
Scikit-learn
Joblib
Visualization & Analytics
Power BI
Matplotlib
Seaborn
Web Development
React
Vite
JavaScript
Tailwind CSS
Recharts
Backend
Flask
Flask-CORS
REST API
Gunicorn
Development & Deployment
Git
GitHub
Vercel
Render
📁 Project Structure
TEJAS-EV/
│
├── backend/
│   └── app.py
│
├── data/
│   ├── raw/
│   └── processed/
│
├── models/
│   ├── tejas_ev_features.json
│   ├── tejas_ev_priority_decision_tree.pkl
│   └── tejas_ev_priority_decision_tree_corrected.pkl
│
├── notebooks/
│   ├── IMPACT_ANALYSIS.ipynb
│   ├── ML_MODEL.ipynb
│   ├── REVIEW1.ipynb
│   ├── REVIEW2.ipynb
│   └── ROUTE_ANALYSIS.ipynb
│
├── outputs/
│   ├── FINAL_92_DEPOT_ANALYSIS.csv
│   ├── FINAL_TOP_10_EV_DEPOTS.csv
│   └── top10_depots.csv
│
├── src/
│
├── tejas/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
└── README.md
🚀 Running the Project Locally
1. Clone the Repository
git clone https://github.com/akhil7102004-coder/TEJAS-EV.git
cd TEJAS-EV
2. Backend Setup

Create a Python virtual environment:

python -m venv .venv
Windows
.venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run the Flask backend:

python backend/app.py

The backend will run locally on:

http://127.0.0.1:5000

Health check:

http://127.0.0.1:5000/api/health
3. Frontend Setup

Open another terminal:

cd tejas

Install dependencies:

npm install

Start the development server:

npm run dev

The frontend will normally be available at:

http://localhost:5173
🌐 Live Application

🚀 Live Website:

https://tejas-ev.vercel.app

💻 Source Code

🔗 GitHub Repository:

https://github.com/akhil7102004-coder/TEJAS-EV

📌 Important Notes
Dataset

The project dataset consists of real-world KSRTC-related operational and demand information compiled from publicly available sources. It was prepared and structured for the analytical objectives of this project.

Machine Learning Labels

The EV transition categories are project-defined analytical labels used for modelling and decision-support purposes. They should not be interpreted as official KSRTC electrification decisions.

Impact Estimates

OPEX, energy, diesel consumption, and CO₂ estimates are based on the assumptions and calculations implemented within the project. They represent analytical estimates rather than actual financial or operational outcomes.

Decision Support

TEJAS is a decision-support prototype intended to demonstrate how data analytics and machine learning can contribute to EV transition planning. Actual fleet electrification decisions would require detailed engineering, financial, operational, infrastructure, regulatory, and policy assessments.

🎓 Academic Context

This project was developed as part of the:

Certified Specialist in Data Science and Analytics
ICT Academy of Kerala

The project provided practical exposure to applying data science techniques to a real-world transportation and sustainability problem.

👥 Project Team
Akhil A
Sreethi S
Asna Raliya
Aswathy Jain
🌱 Project Vision

TEJAS aims to demonstrate how data, analytics, and machine learning can be brought together to support more informed decisions around:

Public Transportation → Operational Efficiency → EV Adoption → Economic Impact → Environmental Sustainability

⭐ Acknowledgement

Developed as part of the Certified Specialist in Data Science and Analytics program at ICT Academy of Kerala.

🚍⚡ TEJAS
From operational data to actionable insights for sustainable transportation.
