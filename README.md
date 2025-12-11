# TransitCare

An intelligent platform for managing public transportation complaints. Features AI-driven prioritization, role-based access, and real-time tracking. Built with modern web technologies including React, Express.js, and MongoDB.

## Core Capabilities

- **Multi-role Authentication** via Clerk (Passengers, Transport Officers, Administrators)
- **Intelligent Prioritization** leveraging OpenAI for complaint analysis
- **Live Notifications** and status tracking
- **Business Intelligence** with detailed analytics and reports
- **Responsive User Interface** using TailwindCSS
- **Protected API** with JWT-based security
- **Data Storage** with MongoDB

## Technology Stack

### Client-Side
- React 18 (TypeScript)
- Vite (Development & Build)
- TailwindCSS (Styling)
- React Router (Client Navigation)
- Clerk (Identity Management)
- Lucide React (Icon Library)
- React Hook Form (Form Management)

### Server-Side
- Node.js + Express
- TypeScript
- Mongoose (MongoDB ODM)
- JWT Authentication
- OpenAI API
- REST Architecture

## System Requirements

- Node.js version 18 or higher
- MongoDB instance (cloud or local)
- OpenAI API credentials
- Clerk authentication setup

## Getting Started

### Step 1: Configure Environment Variables

```bash
cp .env.example .env
```

Update `.env` with your credentials:

```env
# Client Configuration
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_API_BASE_URL=http://localhost:3001/api

# Server Configuration
CLERK_SECRET_KEY=your_clerk_secret
MONGODB_URI=mongodb://localhost:27017/transitcare
OPENAI_API_KEY=your_openai_key
JWT_SECRET=your_jwt_key
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Launch Development Environment

```bash
npm run dev
```

Access the app at `http://localhost:5173`

## Application Architecture

```
src/
├── components/          # Modular UI elements
│   ├── ui/             # Primitive components (Card, Button, Input)
│   ├── layout/         # Page structure (Header, Layout wrapper)
│   ├── forms/          # Input-gathering components
│   └── complaints/     # Domain-specific components
├── pages/              # View templates
│   ├── passenger/      # Passenger workflows
│   └── admin/          # Administrator tools
├── lib/                # Shared utilities
├── types/              # TypeScript interfaces
└── App.tsx             # Root component
```

## User Types & Access Control

### Passenger Profile
- Self-registration capability
- File and monitor complaints
- View resolution progress
- Routes: `/passenger/*`

### Transport Officer Profile
- Admin-provisioned accounts
- Handle assigned complaints
- Update case status
- Routes: `/officer/*`

### Administrator Profile
- Complete platform control
- Manage user accounts
- View system metrics
- Routes: `/admin/*`

### Authorization Strategy

Clerk manages identity verification while the system applies role-based route guards and permission checks throughout the application.

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