# 🏥 AtherCare MedAI — Intelligent Healthcare Platform

<div align="center">

![AtherCare MedAI](https://img.shields.io/badge/AtherCare-MedAI-blue?style=for-the-badge&logo=heart&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Backend-000000?style=for-the-badge&logo=flask&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EfficientNet-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)

**A unified AI-powered healthcare platform that brings hospital discovery, skin disease detection, blood report analysis, and intelligent health chatbot into one seamless experience.**

</div>

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Frontend Setup](#frontend-setup)
  - [Backend Setup](#backend-setup)
- [API Endpoints](#api-endpoints)
- [Environment Variables](#environment-variables)
- [Screenshots](#screenshots)
- [Disclaimer](#disclaimer)

---

## 🩺 About the Project

**AtherCare MedAI** (formerly MediConnect AI) is a full-stack intelligent healthcare web application designed to simplify and accelerate healthcare access. It empowers users with AI-driven tools to understand their health, find nearby hospitals, and get instant medical guidance — all from a single platform.

The platform combines a modern **React + TypeScript** frontend with a **Python Flask** backend powered by deep learning models and LLM-based chatbot capabilities.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | User Sign Up / Login with session management |
| 📊 **Dashboard** | Personalized health overview and quick access to all features |
| 🔬 **AI Skin Scanner** | Upload skin images → EfficientNet-B3 model detects 16 skin conditions |
| 🩸 **Blood Report Analyzer** | Upload PDF/image blood reports → AI extracts and explains results with recommendations |
| 🤖 **Health Chatbot** | Real-time AI chatbot powered by OpenRouter (GPT-3.5-turbo) for health queries |
| 🏥 **Emergency Navigation** | Find nearby hospitals using OpenStreetMap / Nominatim API |
| 👤 **User Profile & Stats** | View and manage personal health statistics |

### 🔬 Supported Skin Conditions (AI Detection)
`Acne` · `Bullous` · `Candidiasis` · `Drug Eruption` · `Infestations & Bites` · `Lichen` · `Lupus` · `Moles` · `Rosacea` · `Seborrheic Keratoses` · `Sun/Sunlight Damage` · `Unknown/Normal` · `Vascular Tumors` · `Vasculitis` · `Vitiligo` · `Warts`

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Framework |
| TypeScript | 5.x | Type Safety |
| Vite | 5.x | Build Tool & Dev Server |
| Tailwind CSS | 3.x | Styling |
| shadcn/ui | Latest | UI Component Library |
| React Router DOM | 6.x | Client-side Routing |
| React Hook Form + Zod | Latest | Form Validation |
| Recharts | 2.x | Data Visualization |
| React Leaflet | 4.x | Interactive Maps |
| TanStack Query | 5.x | Data Fetching & Caching |
| Lucide React | Latest | Icons |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.10+ | Runtime |
| Flask | Latest | Web Framework |
| PyTorch | Latest | Deep Learning |
| EfficientNet-PyTorch | Latest | Skin Disease Model |
| Pillow (PIL) | Latest | Image Processing |
| pdfplumber / pytesseract | Latest | PDF & OCR for blood reports |
| OpenRouter API | GPT-3.5-turbo | AI Chatbot |
| Nominatim (OpenStreetMap) | - | Hospital Location Search |
| Flask-CORS | Latest | Cross-Origin Support |
| python-dotenv | Latest | Environment Config |

---

## 📁 Project Structure

```
AtherCare-MedAI/
├── 📁 backend/                    # Python Flask Backend
│   ├── app.py                     # Main Flask application & API routes
│   ├── blood_report_analyzer.py   # Blood report OCR + parsing logic
│   ├── predict.py                 # Standalone skin disease prediction script
│   ├── modeltrainingfile.py       # EfficientNet-B3 model training code
│   ├── best_model.pth             # Trained PyTorch model weights
│   ├── .env.example               # Environment variable template
│   └── blood_Report_Sample1_parsed.json  # Sample parsed blood report
│
├── 📁 src/                        # React Frontend Source
│   ├── 📁 components/
│   │   ├── Navbar.tsx             # Navigation bar
│   │   ├── FeatureCard.tsx        # Feature display card
│   │   └── 📁 ui/                 # shadcn/ui component library
│   ├── 📁 pages/
│   │   ├── Index.tsx              # Landing / Home page
│   │   ├── Login.tsx              # Login page
│   │   ├── Signup.tsx             # Registration page
│   │   ├── Dashboard.tsx          # User dashboard
│   │   ├── AISkinScanner.tsx      # Skin disease detection page
│   │   ├── bloodanalyzer.tsx      # Blood report analysis page
│   │   ├── ChatbotSection.tsx     # AI health chatbot page
│   │   ├── EmergencyNavigation.tsx # Hospital finder page
│   │   ├── FeaturePage.tsx        # Features overview page
│   │   ├── Profile.tsx            # User profile page
│   │   ├── UserStats.tsx          # Health statistics page
│   │   └── NotFound.tsx           # 404 page
│   ├── 📁 hooks/                  # Custom React hooks
│   ├── 📁 lib/                    # Utility functions
│   ├── App.tsx                    # App routes configuration
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
│
├── index.html                     # HTML entry point
├── package.json                   # Frontend dependencies
├── vite.config.ts                 # Vite configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ and **npm** — [Download](https://nodejs.org/)
- **Python** 3.10+ — [Download](https://python.org/)
- **Git** — [Download](https://git-scm.com/)

### Clone the Repository

```sh
git clone https://github.com/navi-siddu-1103/AtherCare-MedAI.git
cd AtherCare-MedAI
```

---

### 🖥️ Frontend Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

> **Other commands:**
> ```sh
> npm run build      # Build for production
> npm run preview    # Preview production build
> npm run lint       # Run ESLint
> ```

---

### 🐍 Backend Setup

```sh
# Navigate to backend directory
cd backend

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors python-dotenv torch torchvision efficientnet-pytorch pillow pandas pdfplumber pytesseract requests

# Set up environment variables
copy .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Run the backend server
python app.py
```

The backend API will be available at **http://localhost:8000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Input |
|--------|----------|-------------|-------|
| `POST` | `/predict` | AI Skin Disease Detection | `multipart/form-data` with `file` (image) |
| `POST` | `/analyze` | Blood Report Analysis | `multipart/form-data` with `file` (PDF/image) |
| `POST` | `/get` | AI Health Chatbot | `JSON { "msg": "your question" }` |

### Example: Skin Disease Prediction
```sh
curl -X POST http://localhost:8000/predict \
  -F "file=@skin_image.jpg"
```

**Response:**
```json
{
  "prediction": "Acne",
  "info": {
    "disease": "Acne",
    "description": "...",
    "treatments": "...",
    "precautions": "..."
  },
  "disclaimer": "⚠️ These are AI-based suggestions for educational use only..."
}
```

### Example: Blood Report Analysis
```sh
curl -X POST http://localhost:8000/analyze \
  -F "file=@blood_report.pdf"
```

### Example: Chatbot
```sh
curl -X POST http://localhost:8000/get \
  -H "Content-Type: application/json" \
  -d '{"msg": "What are symptoms of diabetes?"}'
```

---

## 🔑 Environment Variables

Create a `.env` file inside the `backend/` directory based on `.env.example`:

```env
# OpenRouter API Key for AI Chatbot (https://openrouter.ai)
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

> ⚠️ **Never commit your `.env` file to version control.** It is already listed in `.gitignore`.

---

## ⚠️ Disclaimer

> This platform is intended **for educational and informational purposes only**. The AI-based predictions (skin disease detection, blood report analysis, chatbot responses) are **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified healthcare professional for any medical concerns.

---

## 👨‍💻 Author

**Naveen** — [GitHub @navi-siddu-1103](https://github.com/navi-siddu-1103)

---

<div align="center">
Made with ❤️ for better healthcare access
</div>
