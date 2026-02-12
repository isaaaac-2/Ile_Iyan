# Ilé Ìyán — The Home of Pounded Yam 🍲

A modern web application for ordering pounded yam (Ìyán) with a variety of authentic Nigerian soups. Features a voice-powered ordering assistant with Text-to-Speech (TTS) support.

## Features

- **Rich Soup Menu** — 10+ authentic Nigerian soups (Egusi, Efo Riro, Ogbono, Ewedu, Gbegiri, Afang, and more)
- **Soup Combinations** — Mix and match soups for unique flavor profiles (e.g., the classic Ewedu + Gbegiri "Abula" combo)
- **Voice Ordering Bot** — AI-powered assistant that guides you through the ordering process hands-free using TTS
- **Text-to-Speech** — Toggle TTS on/off; the bot reads responses aloud using gTTS
- **Speech Recognition** — Speak your order using the browser's speech recognition API
- **Combo Discounts** — Special pricing on popular soup combinations
- **Customizable Orders** — Choose proteins, portion sizes, and quantities

## Tech Stack

- **Frontend**: React.js
- **Backend**: Python / Flask
- **TTS Engine**: gTTS (Google Text-to-Speech)
- **Speech Input**: Web Speech API (browser-native)

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API server runs at `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The app opens at `http://localhost:3000`.

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest test_app.py -v

# Frontend tests
cd frontend
npm test
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/menu` | Full menu (soups, proteins, portions, combos) |
| GET | `/api/menu/soups` | Available soups |
| GET | `/api/menu/proteins` | Protein options |
| POST | `/api/order` | Create an order |
| GET | `/api/order/:id` | Get order by ID |
| POST | `/api/tts` | Convert text to speech audio |
| GET | `/api/bot/greeting` | Bot greeting message |
| POST | `/api/bot/process` | Process bot conversation |

## Voice Ordering

The TTS bot is the core feature. It can:
1. Greet and guide users through the menu
2. Understand soup and protein selections from natural language
3. Read responses aloud (toggleable TTS)
4. Accept voice input via microphone
5. Build and place orders automatically

Toggle TTS on/off in the bot interface to choose between voice and text-only interaction.