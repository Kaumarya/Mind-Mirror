# MindMirror AI

AI-powered mental wellness companion with real-time emotion detection through facial analysis and supportive chat interactions.

![MindMirror Banner](https://img.shields.io/badge/MindMirror%20AI-Mental%20Wellness%20AI-blue?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-green?style=flat&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-teal?style=flat&logo=fastapi)
![Lightweight](https://img.shields.io/badge/No%20TensorFlow-lightweight-brightgreen?style=flat)

## Features

- **AI Chat Support**: Keyword-based mental health responses for anxiety, depression, stress, and more
- **Real-time Emotion Detection**: Lightweight mock emotion detection (no ML libraries required)
- **Session Analytics**: Live statistics including session duration, frames analyzed, and dominant emotion
- **Voice Analysis**: Placeholder structure for future voice emotion detection
- **Responsive UI**: Clean, accessible interface with light/dark mode support

## Project Structure

```
Mind-Mirror-Prototype/
├── mindmirror-frontend/          # Frontend (HTML, CSS, JS)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── config.js                  # API URL configuration
├── api/                          # Backend API (Vercel Serverless)
│   ├── index.py                   # FastAPI backend
│   └── requirements.txt           # Python dependencies
├── mirrormind-backend/            # Local dev backend (copy of api/)
│   ├── backend.py
│   ├── requirements.txt
│   └── dependencies.txt
├── vercel.json                  # Vercel deployment config
├── package.json                 # NPM metadata
├── .gitignore                   # Git exclusions
└── README.md                    # This file
```

## Quick Start

### Backend

```bash
cd api

# Install dependencies
python -m pip install -r requirements.txt

# Run backend locally
python index.py
```

Backend runs on `http://localhost:8000`

(Or use `cd mirrormind-backend && python backend.py` - same files)

### Frontend

```bash
cd mindmirror-frontend

# Serve with Python
python -m http.server 8080

# Or simply open index.html in browser
```

Frontend runs on `http://localhost:8080`

## 🚀 Live Demo

**Deployed on Vercel:** [https://mind-mirror-ai.vercel.app](https://mind-mirror-ai.vercel.app)

## Deployment (Vercel - Both Frontend + Backend)

This project is configured for **full-stack deployment** on Vercel (frontend + backend together):

### One-Click Deploy

1. **Push code to GitHub**
2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repo `Kaumarya/Mind-Mirror-AI`
3. **Deploy**
   - Framework Preset: **Other**
   - Vercel automatically detects the configuration
   - Frontend served from `mindmirror-frontend/`
   - Backend API served from `api/index.py` at `/api/*`

Your app will be live at `https://mind-mirror-ai.vercel.app`

### Local Development

```bash
# Backend
python api/index.py

# Frontend (separate terminal)
cd mindmirror-frontend
python -m http.server 8080
```

**Note**: HTTPS required for webcam access in production. Vercel provides this automatically.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | AI chat responses |
| `/api/emotion/analyze_frame` | POST | Analyze image frame for emotions |
| `/api/emotion/stats` | GET | Session emotion statistics |
| `/api/voice/analyze` | POST | Voice analysis (placeholder) |
| `/api/video/feed` | GET | MJPEG video stream (legacy) |

## Technologies

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Font Awesome icons
- Google Fonts (Inter, Poppins)

**Backend:**
- Python 3.10+
- FastAPI
- Mangum (AWS Lambda/Vercel adapter)
- Lightweight mock emotion detection (no ML libraries required)

## Emotion Categories Detected

- 😊 Happy
- 😢 Sad
- 😠 Angry
- 😨 Fear
- 😲 Surprise
- 🤢 Disgust
- 😐 Neutral

## Browser Requirements

- Modern browser with webcam support
- HTTPS or localhost for camera access
- Chrome, Firefox, Safari, Edge (latest versions)

## License

MIT License - feel free to use and modify.

## Disclaimer

MindMirror is a wellness tool and not a replacement for professional mental health care. If you're experiencing severe mental health issues, please consult a licensed professional.

---

Made with 💙 for mental wellness
