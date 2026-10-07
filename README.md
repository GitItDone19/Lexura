# Lexura - EU AI Act Compliance Platform

A comprehensive web application designed to help organizations assess and achieve compliance with the European Union's AI Act. Lexura provides an intelligent, step-by-step assessment process that evaluates AI systems, classifies their risk levels, and generates detailed compliance reports.

## Overview

Lexura streamlines EU AI Act compliance by combining a structured assessment framework with AI-powered analysis. The platform guides organizations through risk classification, identifies compliance gaps, and delivers actionable recommendations tailored to their specific AI systems.

## Key Features

- **Multi-Step Assessment Workflow**: Structured three-step process to evaluate AI systems comprehensively
- **Intelligent Risk Classification**: Automated classification into Unacceptable, High-Risk, Limited Risk, or Minimal Risk categories
- **AI-Powered Report Generation**: Uses Google Gemini and RAG technology to generate detailed compliance reports
- **Real-Time Compliance Analysis**: Instant gap analysis against EU AI Act requirements
- **User Authentication**: Secure authentication powered by Clerk with support for email, Google, and Apple sign-in
- **Role-Based Access**: Support for both client and admin user roles
- **Dashboard Analytics**: Visual overview of assessments and compliance status
- **PDF Export**: Download compliance reports for documentation and stakeholder review

## Technology Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Animation library
- **React Hook Form**: Form state management
- **Zod**: Schema validation

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Primary database (Neon)
- **Clerk**: Authentication and user management

### AI & Machine Learning
- **Google Gemini API**: AI report generation
- **Python RAG System**: Retrieval-augmented generation for EU AI Act knowledge
- **ChromaDB**: Vector database for document embeddings
- **Sentence Transformers**: Text embeddings
- **FastAPI**: Python API server for RAG queries

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Python 3.9 or higher
- PostgreSQL database (or Neon account)
- Clerk account for authentication
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lexura.git
cd lexura
```

2. Install Node.js dependencies:
```bash
npm install
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:

Create a `.env` file based on `.env.example`:

```env
# Application
NEXT_PUBLIC_APP_NAME=Lexura
NEXT_PUBLIC_APP_DOMAIN=http://localhost:3000

# Database (Neon)
DATABASE_URL=your_postgresql_connection_string
DIRECT_URL=your_postgresql_direct_connection_string

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL=/app

# AI Report Generation
GEMINI_API_KEY=your_gemini_api_key

# RAG API (optional)
NEXT_PUBLIC_RAG_API_URL=http://localhost:8000
```

5. Set up the database:

Follow the instructions in `NEON_SETUP.md` to configure your Neon PostgreSQL database.

```bash
npx prisma generate
npx prisma db push
```

6. Start the development servers:

For the full application with RAG support:
```bash
npm run dev:full
```

Or start services individually:
```bash
# Terminal 1: Next.js app
npm run dev

# Terminal 2: Python RAG API
npm run dev:rag
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
lexura/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Main application layout
│   │   │   └── app/           # Protected app routes
│   │   ├── (marketing)/       # Public marketing pages
│   │   ├── api/               # API routes
│   │   │   ├── assessments/   # Assessment CRUD operations
│   │   │   ├── generate-report/ # AI report generation
│   │   │   ├── rag-query/     # RAG system queries
│   │   │   └── webhooks/      # Clerk webhooks
│   │   └── auth/              # Authentication pages
│   ├── components/            # React components
│   │   ├── auth/             # Authentication components
│   │   ├── global/           # Shared components
│   │   └── ui/               # UI primitives
│   ├── constants/            # Application constants
│   ├── functions/            # Utility functions
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Core logic and clients
│   │   ├── rag-client.ts    # RAG API client
│   │   └── generate-brief-summary.ts # Summary generation
│   ├── schema/              # Zod validation schemas
│   └── styles/              # Global styles
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── eu_ai_act_index/         # ChromaDB vector store
├── scripts/                 # Build and deployment scripts
└── requirements.txt         # Python dependencies
```

## Database Schema

The application uses PostgreSQL with the following main models:

- **User**: User accounts with Clerk integration
- **Assessment**: AI system assessments with multi-step data
  - Step 1: System information
  - Step 2: Use case details
  - Step 3: Compliance status
  - Generated reports and classifications

## API Endpoints

### Assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/:id` - Get assessment details
- `PATCH /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment
- `GET /api/assessments/recent` - Get recent assessments

### Reports
- `POST /api/generate-report` - Generate AI compliance report
- `POST /api/rag-query` - Query RAG system for EU AI Act information

### User
- `GET /api/user` - Get current user data
- `POST /api/webhooks/clerk` - Clerk user sync webhook

## Assessment Process

### Step 1: System Information
- System name and description
- Technology type classification
- Ownership and organizational role
- EU market scope
- General purpose AI identification

### Step 2: Use Case Analysis
- Sector and industry context
- Decision impact level
- Affected persons and stakeholders
- Product type categorization
- Biometric processing detection
- Sensitive capabilities assessment

### Step 3: Compliance Status
- Risk management system evaluation
- Data governance and documentation
- Bias testing and fairness measures
- Technical documentation completeness
- Logging and traceability
- User instructions and transparency
- Human oversight mechanisms
- Override capabilities
- Accuracy and security measures

## Risk Classification Levels

1. **Unacceptable Risk**: Prohibited AI systems under EU AI Act
2. **High Risk**: Requires strict compliance measures and documentation
3. **Limited Risk**: Transparency obligations apply
4. **Minimal Risk**: Minimal or no regulatory requirements

## RAG System

The platform includes a Python-based RAG system that provides enhanced compliance guidance by retrieving relevant sections from the EU AI Act documentation:

- **Vector Database**: ChromaDB for efficient similarity search
- **Embeddings**: Sentence Transformers for semantic understanding
- **FastAPI Server**: RESTful API for RAG queries
- **Fallback**: Google Gemini for cases where RAG is unavailable

## Authentication

User authentication is handled by Clerk with support for:
- Email verification (magic link)
- Google OAuth
- Apple OAuth
- Role-based access control (Client, Admin)

## Development Commands

```bash
# Development
npm run dev              # Start Next.js dev server
npm run dev:rag          # Start Python RAG API
npm run dev:full         # Start both servers concurrently

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Push schema changes
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create and apply migrations

# Build
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
```

## Deployment

### Vercel (Recommended for Next.js)
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Database
Use Neon for serverless PostgreSQL with automatic scaling and connection pooling.

### Python RAG API
Deploy the RAG API separately:
- Railway
- Render
- AWS Lambda with Docker
- Google Cloud Run

Update `NEXT_PUBLIC_RAG_API_URL` to point to your deployed RAG service.

## Environment Variables

See `.env.example` for all required environment variables. Key configurations:

- Database connection strings (Neon)
- Clerk authentication keys
- Google Gemini API key
- RAG API URL (for production)

## Contributing

We welcome contributions to improve Lexura. Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes with clear commit messages
4. Write or update tests as needed
5. Submit a pull request

## Security

- All user data is encrypted at rest
- Authentication tokens are securely managed by Clerk
- API keys are stored as environment variables
- Database connections use SSL
- Input validation with Zod schemas
- CORS policies enforced on API routes

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- EU AI Act official documentation
- Google Gemini for AI capabilities
- Clerk for authentication infrastructure
- Neon for serverless PostgreSQL
- The open-source community for excellent tools and libraries

## Support

For questions, issues, or feature requests, please open an issue on GitHub or contact our team.

## Roadmap

- Multi-language support for international compliance
- Enhanced analytics dashboard
- Automated compliance monitoring
- Integration with document management systems
- API access for enterprise customers
- Mobile application
- Compliance template library
- Team collaboration features

---

Built with care to help organizations navigate EU AI Act compliance confidently.
