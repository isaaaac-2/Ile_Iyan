# Multi-Application Repository

This repository contains two independent food service applications designed for the Nigerian market.

## 📁 Projects

### 1. [Ile Iyan](./ile-iyan/) - Nigerian Restaurant Application
A web application for ordering pounded yam (Ìyán) with authentic Nigerian soups.

**Key Features:**
- 🎤 Voice-powered ordering assistant with Text-to-Speech
- 🍲 10+ traditional soup varieties (Egusi, Efo Riro, Ogbono, etc.)
- 🥘 Soup combinations with special pricing
- 🗣️ Browser-native speech recognition
- 📱 Mobile-responsive design

**[View Ile Iyan Documentation →](./ile-iyan/README.md)**

### 2. [Wonder Bread](./wonder-bread/) - Affordable Bakery Platform
An e-commerce platform for a bakery emphasizing affordability and quality.

**Key Features:**
- 🔐 User authentication and profile management
- 🍞 Bread menu with competitive pricing (₦1000 vs ₦1500 market price)
- 📦 Order tracking with 6-stage delivery status
- 💳 Shopping cart and checkout
- 🎨 Animated landing page with bread-making visualization
- 📱 Mobile-first responsive design

**[View Wonder Bread Documentation →](./wonder-bread/README.md)**

## 🚀 Quick Start

Each application can be run independently. Navigate to the respective folder and follow its README.

### Running Ile Iyan

```bash
# Backend (runs on port 5000)
cd ile-iyan/backend
pip install -r requirements.txt
python app.py

# Frontend
cd ile-iyan/frontend
npm install
npm start
```

### Running Wonder Bread

```bash
# Backend (runs on port 5001)
cd wonder-bread/backend
pip install -r requirements.txt
python init_db.py  # Initialize database
python app.py

# Frontend
cd wonder-bread/frontend
npm install
npm start
```

### Running Both Applications Simultaneously

Both applications can run at the same time:
- **Ile Iyan Backend:** `http://localhost:5000`
- **Wonder Bread Backend:** `http://localhost:5001`
- **Ile Iyan Frontend:** `http://localhost:3000`
- **Wonder Bread Frontend:** `http://localhost:3001` (change port with PORT=3001)

## 📦 Deployment

Each application has its own deployment configuration and can be hosted separately:

- **Ile Iyan:** Deploy from `ile-iyan/` directory
- **Wonder Bread:** Deploy from `wonder-bread/` directory

Both applications are configured for Vercel deployment with their respective `vercel.json` files.

## 🏗️ Repository Structure

```
isaaaac-2/Ile_Iyan/
├── README.md (this file)
├── .gitignore
│
├── ile-iyan/                    # Ile Iyan restaurant app
│   ├── README.md
│   ├── vercel.json
│   ├── .gitignore
│   ├── api/
│   ├── backend/
│   └── frontend/
│
└── wonder-bread/                # Wonder Bread bakery app
    ├── README.md
    ├── vercel.json
    ├── .gitignore
    ├── api/
    ├── backend/
    └── frontend/
```

## 🛠️ Technology Stack

### Ile Iyan
- **Frontend:** React.js
- **Backend:** Python, Flask
- **TTS Engine:** gTTS (Google Text-to-Speech)
- **Speech Recognition:** Web Speech API

### Wonder Bread
- **Frontend:** React.js
- **Backend:** Python, Flask
- **Authentication:** JWT (JSON Web Tokens)
- **Database:** SQLite
- **Styling:** Custom CSS with animations

## 📝 Development

### Testing

```bash
# Ile Iyan tests
cd ile-iyan/backend
python -m pytest test_app.py -v

# Wonder Bread tests
cd wonder-bread/backend
python -m pytest test_app.py -v
```

### Environment Variables

Each application may require environment variables. Create `.env` files in the respective backend directories:

**Wonder Bread Backend (.env):**
```
JWT_SECRET_KEY=your-secret-key-here
```

## 📄 License

MIT License - See individual project directories for more details.

## 👥 Contributing

Each application is independent. When contributing:
1. Make changes only to the relevant application directory
2. Test thoroughly before submitting
3. Follow the existing code style
4. Update documentation as needed

## 🤝 Support

For issues or questions:
- Ile Iyan: See [ile-iyan/README.md](./ile-iyan/README.md)
- Wonder Bread: See [wonder-bread/README.md](./wonder-bread/README.md)
