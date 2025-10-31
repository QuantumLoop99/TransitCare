# TransitCare - Public Transport Complaint Management System

A comprehensive web application for managing public transport complaints with AI-powered prioritization, built with React, Node.js, and MongoDB.

## 🚀 Features

- **Role-based Authentication** with Clerk (Passengers, Officers, Admins)
- **AI-powered Complaint Prioritization** using OpenAI
- **Real-time Updates** and notifications
- **Comprehensive Analytics** and reporting
- **Mobile-responsive Design** with TailwindCSS
- **Secure API** with JWT authentication
- **MongoDB** for data persistence

## 🛠 Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- TailwindCSS for styling
- React Router for navigation
- Clerk for authentication
- Lucide React for icons
- React Hook Form for form handling

### Backend (Reference Architecture)
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for internal authentication
- OpenAI API integration
- RESTful API design

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)
- OpenAI API key
- Clerk account (for authentication)

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment variables:

```bash
cp .env.example .env
```

Fill in your environment variables in `.env`:

```env
# Frontend
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:3001/api

# Backend (for reference)
CLERK_SECRET_KEY=your_clerk_secret_key
MONGODB_URI=mongodb://localhost:27017/transitcare
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Card, Button, etc.)
│   ├── layout/         # Layout components (Header, Layout)
│   ├── forms/          # Form components
│   └── complaints/     # Complaint-specific components
├── pages/              # Page components
│   ├── passenger/      # Passenger-specific pages
│   └── admin/          # Admin-specific pages
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🔐 Authentication & Roles

### User Roles

1. **Passengers**
   - Register themselves
   - Submit complaints
   - Track complaint status
   - Access: `/passenger/*`

2. **Transport Officers**
   - Created by admin
   - Assigned complaints
   - Update complaint status
   - Access: `/officer/*`

3. **Administrators**
   - Full system access
   - User management
   - System analytics
   - Access: `/admin/*`

### Authentication Flow

- Uses Clerk for user authentication
- Role-based routing and access control
- Separate login portals for different user types

## 🤖 AI Integration

The system uses OpenAI for automatic complaint prioritization:

### Prioritization Process

1. **Input**: Complaint text, category, and metadata
2. **AI Analysis**: Sentiment analysis and urgency detection  
3. **Output**: Priority level (high/medium/low) and confidence score
4. **Storage**: AI decision stored for audit trail

### Sample AI Prompt Template

```
Analyze this public transport complaint and determine its priority level:

Title: {complaint_title}
Description: {complaint_description}
Category: {category}
Date: {date_time}

Consider factors like:
- Safety implications
- Service disruption impact
- Number of affected passengers
- Urgency of resolution needed

Respond with JSON:
{
  "priority": "high|medium|low",
  "reasoning": "explanation",
  "sentiment": -1 to 1,
  "confidence": 0 to 1
}
```

## 📊 API Endpoints (Reference)

### Complaints
- `GET /api/complaints` - List complaints (with filters)
- `POST /api/complaints` - Create new complaint
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint
- `POST /api/complaints/:id/prioritize` - AI prioritization

### Users
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Update user

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/reports/:type` - Generate reports

## 🧪 Testing

### Frontend Testing
```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Backend Testing (Reference)
```bash
# Run API tests
npm run test:api

# Run integration tests
npm run test:integration
```

## 🚀 Deployment

### Frontend Deployment

#### Vercel
```bash
npm run build
vercel --prod
```

#### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Backend Deployment (Reference)

#### Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy with automatic builds

#### Heroku
```bash
heroku create transitcare-api
heroku config:set NODE_ENV=production
git push heroku main
```

## 📝 Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow React best practices
- Use functional components with hooks
- Implement proper error handling

### File Organization
- Keep components under 200 lines
- Use proper separation of concerns
- Create reusable UI components
- Organize by feature, not file type

### State Management
- Use React hooks for local state
- Context API for global state
- Consider Redux Toolkit for complex state

## 🔍 Monitoring & Analytics

### Key Metrics
- Complaint resolution time
- User satisfaction scores
- System performance metrics
- AI prioritization accuracy

### Logging
- API request/response logging
- Error tracking and reporting
- User activity monitoring
- Performance metrics

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Email: support@transitcare.com
- Documentation: [https://docs.transitcare.com](https://docs.transitcare.com)

---

**TransitCare** - Transforming public transport complaint management with AI-powered solutions.