# Ile Iyan - Voice-Controlled Food Ordering System

A fully voice-controlled web application for ordering Iyan (Pounded Yam) built with ReactJS and Python Flask. No clicking required - just speak and the system handles your order!

## Features

- 🎤 **Complete Voice Control**: Order food entirely through voice commands
- 🔊 **Text-to-Speech Feedback**: The system speaks back to guide you through the ordering process
- 🍚 **Single Food Item**: Specialized for Iyan (Pounded Yam)
- 💬 **Natural Conversation Flow**: Interactive voice dialog for a seamless ordering experience
- 🌐 **Full-Stack Application**: React frontend + Python Flask backend

## Technology Stack

- **Frontend**: ReactJS with Web Speech API
- **Backend**: Python Flask with CORS support
- **Voice Recognition**: Web Speech API (SpeechRecognition)
- **Text-to-Speech**: Web Speech API (SpeechSynthesis)

## Prerequisites

- Node.js (v14 or higher)
- Python 3.7 or higher
- Modern web browser (Chrome or Edge recommended for best speech recognition support)
- Microphone access

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask server:
```bash
python app.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will open automatically at `http://localhost:3000`

## Usage

1. **Start Both Servers**: Make sure both backend (port 5000) and frontend (port 3000) are running

2. **Enable Microphone**: Allow microphone access when prompted by your browser

3. **Voice Commands**:
   - Say **"Start order"** or **"Order"** to begin
   - State your name when asked
   - Say the number of plates you want (e.g., "one", "two", "three", or "5")
   - Say **"Confirm"** to place your order
   - Say **"Cancel"** to start over

4. **Example Flow**:
   ```
   System: "Welcome to Ile Iyan! Say 'start order' to begin."
   You: "Start order"
   System: "Great! What is your name?"
   You: "My name is John"
   System: "Nice to meet you John! How many plates of Iyan would you like?"
   You: "Two"
   System: "You want 2 plates of Iyan. Say 'confirm' to place your order."
   You: "Confirm"
   System: "Order confirmed! 2 plates of Iyan for John. Your order number is 1."
   ```

## Voice Commands Reference

| Command | Action |
|---------|--------|
| "Start order" / "Order" | Begin the ordering process |
| [Your Name] | Provide your name |
| "One" / "Two" / "1" / "2" | Specify quantity |
| "Confirm" / "Yes" | Confirm your order |
| "Cancel" / "No" | Cancel and restart |

## API Endpoints

### Backend API

- `GET /api/health` - Health check endpoint
- `POST /api/order` - Place a new order
  - Request body: `{ "customer_name": "string", "quantity": number }`
- `GET /api/orders` - Get all orders

## Browser Compatibility

The application works best on:
- ✅ Google Chrome (Recommended)
- ✅ Microsoft Edge
- ⚠️ Safari (Limited speech recognition support)
- ❌ Firefox (Limited Web Speech API support)

## Troubleshooting

**Issue**: Microphone not working
- **Solution**: Check browser permissions and ensure microphone is not being used by another application

**Issue**: "Speech recognition not supported"
- **Solution**: Use Chrome or Edge browser

**Issue**: "Cannot connect to server"
- **Solution**: Ensure the Flask backend is running on port 5000

**Issue**: Voice commands not recognized
- **Solution**: Speak clearly and wait for the system to finish speaking before responding

## Project Structure

```
Ile_Iyan/
├── backend/
│   ├── app.py                 # Flask application
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Styling
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Global styles
│   └── package.json          # Node dependencies
└── README.md                 # This file
```

## Development

The application uses:
- React Hooks (useState, useEffect, useRef, useCallback) for state management
- Web Speech API for voice recognition and synthesis
- Flask-CORS for handling cross-origin requests
- RESTful API architecture

**Note**: This is a development setup. For production deployment:
- Disable Flask debug mode
- Use a production WSGI server like Gunicorn
- Add proper error handling and logging
- Implement database persistence instead of in-memory storage
- Add security measures (HTTPS, authentication, rate limiting)

## Future Enhancements

- Order history tracking
- Multiple food items
- User authentication
- Payment integration
- Order status updates
- Multilingual support

## License

ISC

## Author

Created for voice-controlled food ordering experience
