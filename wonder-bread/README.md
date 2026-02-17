# Wonder Bread - Affordable Bakery Platform

A modern e-commerce platform for Wonder Bread bakery, emphasizing affordability, quality, and customer satisfaction. Built with React and Flask.

## 🌟 Overview

Wonder Bread is a bakery MVP focused on providing high-quality bread at competitive prices. The platform features user authentication, order tracking, and a compelling marketing experience highlighting the value proposition of ₦1,000 vs ₦1,500 market prices.

## ✨ Features

### Customer Features
- **🎨 Dynamic Landing Page** - Animated bread-making visualization
- **🔐 Authentication** - Secure user registration and login with JWT
- **👤 User Profiles** - Manage personal information and preferences
- **🍞 Product Catalog** - Browse available bread products with detailed descriptions
- **🛒 Shopping Cart** - Add items, adjust quantities, and checkout
- **📦 Order Tracking** - Real-time 6-stage order status tracking
- **📱 Responsive Design** - Mobile-first approach for all devices
- **💰 Price Comparison** - Clear pricing that shows savings vs market prices

### Admin Features (Future)
- Order management
- Inventory tracking
- Customer analytics

## 🏗️ Architecture

```
wonder-bread/
├── api/
│   └── index.py                # Vercel serverless entry point
├── backend/
│   ├── app.py                  # Flask application
│   ├── init_db.py              # Database initialization
│   ├── test_app.py             # Backend tests
│   ├── requirements.txt        # Python dependencies
│   └── wonder_bread.db         # SQLite database (generated)
├── frontend/
│   ├── public/                 # Static assets
│   └── src/
│       ├── App.js              # Main application
│       ├── components/         # Reusable components
│       ├── pages/              # Page components
│       ├── context/            # React context providers
│       └── services/           # API client
├── vercel.json                 # Deployment configuration
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- pip
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python init_db.py
```

4. Start the Flask server:
```bash
python app.py
```

The backend API will be available at `http://localhost:5001`.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install Node dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000`.

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    items TEXT NOT NULL,  -- JSON string
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Addresses Table
```sql
CREATE TABLE addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT,
    is_default INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### Preferences Table
```sql
CREATE TABLE preferences (
    user_id INTEGER PRIMARY KEY,
    email_notifications INTEGER DEFAULT 1,
    sms_notifications INTEGER DEFAULT 1,
    promotional_offers INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user (protected)

### Profile Management
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)
- `GET /api/profile/addresses` - Get user addresses (protected)
- `POST /api/profile/addresses` - Add new address (protected)
- `PUT /api/profile/preferences` - Update preferences (protected)

### Menu
- `GET /api/menu` - Get all bread products

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get specific order (protected)

### Health Check
- `GET /api/health` - API health status

## 🎨 Design System

### Color Palette
- **Primary:** `#D4A373` (Golden Brown)
- **Secondary:** `#F5E6D3` (Cream)
- **Accent:** `#8B4513` (Rich Brown)
- **Background:** `#FFF9F0` (Light Cream)
- **Success:** `#4CAF50`
- **Error:** `#F44336`

### Typography
- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Headings: Bold, larger sizes
- Body: Regular weight, readable line-height

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest test_app.py -v
```

Tests cover:
- User registration and login
- Token authentication
- Protected routes
- Order creation and retrieval
- Profile updates

### Frontend Tests
```bash
cd frontend
npm test
```

## 🌐 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy from project root:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
```
JWT_SECRET_KEY=your-production-secret
```

### Environment Variables

**Backend (.env):**
```
JWT_SECRET_KEY=your-secret-key-here
FLASK_ENV=production
```

**Frontend (.env):**
```
REACT_APP_WONDER_BREAD_API_URL=https://your-api-domain.com/api
```

## 📊 Product Catalog

| Product | Price | Market Price | Weight | Description |
|---------|-------|--------------|--------|-------------|
| Large Loaf | ₦1,000 | ₦1,500 | 800g | Signature large loaf |
| Medium Loaf | ₦700 | ₦1,000 | 500g | Perfect for small families |
| Small Loaf | ₦500 | ₦700 | 300g | Individual serving |
| Sliced Bread (Large) | ₦1,000 | ₦1,500 | 800g | Pre-sliced, 20 slices |
| Sliced Bread (Small) | ₦600 | ₦850 | 400g | Pre-sliced, 12 slices |
| Whole Wheat Bread | ₦1,200 | ₦1,700 | 750g | Healthy whole grain |

## 🎯 Key Value Propositions

1. **Affordability** - Save ₦500 on large loaves
2. **Quality** - Fresh baked daily, stays soft 5+ days
3. **Convenience** - Order online, track delivery
4. **Trust** - Transparent pricing, no hidden fees

## 🔐 Security

- Passwords hashed with bcrypt
- JWT tokens for authentication
- Protected API routes
- CORS configuration for API security
- Input validation on all endpoints

## 🚧 Roadmap

- [ ] Payment integration (Paystack/Flutterwave)
- [ ] SMS notifications for orders
- [ ] Admin dashboard
- [ ] Delivery tracking with GPS
- [ ] Customer reviews and ratings
- [ ] Loyalty program
- [ ] Mobile apps (iOS/Android)

## 📝 License

MIT License

## 👨‍💻 Development

### Code Style
- Python: Follow PEP 8
- JavaScript: ESLint with React recommended rules
- CSS: BEM methodology for class names

### Git Workflow
- Feature branches for new features
- Pull requests for code review
- Semantic commit messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for Nigerian bread lovers
