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

## Intelligent Complaint Analysis

OpenAI powers automatic complaint evaluation:

### Analysis Workflow

1. **Ingestion**: System receives complaint content, classification, and metadata
2. **Processing**: AI analyzes sentiment and urgency factors
3. **Classification**: System assigns priority (critical/standard/routine) and confidence metric
4. **Recording**: Decision captured in database for audit purposes

### Example AI Analysis Template

```
Evaluate this transportation complaint and determine priority:

Title: {title}
Details: {description}
Category: {category}
Timestamp: {date_time}

Scoring Criteria:
- Does this pose safety concerns?
- What's the scope of service impact?
- How many passengers are affected?
- How soon does this need resolution?

Return JSON format:
{
  "priority": "critical|standard|routine",
  "justification": "brief explanation",
  "emotion": -1 to 1,
  "certainty": 0 to 1
}
```

## API Reference (Backend Blueprint)

### Complaint Operations
- `GET /api/complaints` - Retrieve complaints with filtering
- `POST /api/complaints` - Submit new complaint
- `GET /api/complaints/:id` - Fetch complaint details
- `PUT /api/complaints/:id` - Modify complaint
- `POST /api/complaints/:id/prioritize` - Trigger AI analysis

### User Management
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/:id` - Modify user

### Statistics & Reports
- `GET /api/dashboard/stats` - Fetch dashboard metrics
- `GET /api/reports/:type` - Generate report by type

## Running Tests

### Client Tests
```bash
# Execute unit tests
npm run test

# Continuous testing
npm run test:watch

# Generate test coverage
npm run test:coverage
```

### Server Tests (Reference)
```bash
# Test API endpoints
npm run test:api

# End-to-end tests
npm run test:integration
```

## Deployment Guide

### Publishing Frontend

#### Via Vercel
```bash
npm run build
vercel --prod
```

#### Via Netlify
```bash
npm run build
# Upload dist/ directory to Netlify
```

### Publishing Backend (Reference)

#### Using Render
1. Link your GitHub repository
2. Configure environment variables in Render dashboard
3. Enable automatic deployments

#### Using Heroku
```bash
heroku create transitcare-api
heroku config:set NODE_ENV=production
git push heroku main
```

## Best Practices & Standards

### Code Quality
- Leverage TypeScript for compile-time safety
- Adopt React compositional patterns
- Use hooks for state and side effects
- Implement comprehensive error handling

### Component Design
- Keep component files under 250 lines
- Separate concerns into distinct modules
- Build reusable, focused components
- Organize by domain, not file extension

### State Strategy
- React hooks for component-level state
- Context API for shared state
- Evaluate Redux Toolkit for complex scenarios

## Observability & Metrics

### Performance Indicators
- Mean complaint resolution time
- User satisfaction ratings
- System uptime percentage
- AI prioritization effectiveness

### Event Tracking
- Comprehensive request/response logs
- Error capture and reporting
- User journey tracking
- Performance benchmarking

## Reference Documentation

- [React Official Guide](https://reactjs.org/docs/)
- [TailwindCSS Reference](https://tailwindcss.com/docs)
- [Clerk Integration Guide](https://clerk.com/docs)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [MongoDB Manual](https://docs.mongodb.com/)

## Contribution Process

1. Clone the repository and create a feature branch
2. Implement your changes with tests
3. Ensure all tests pass locally
4. Submit a pull request with a clear description

## Licensing

MIT License - See [LICENSE](LICENSE) for details

## Help & Contact

Need assistance?
- File an issue on GitHub
- Reach out to: support@transitcare.com
- Visit documentation: [https://docs.transitcare.com](https://docs.transitcare.com)

---

**TransitCare** — Revolutionizing public transport feedback systems through intelligent automation.