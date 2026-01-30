# 🤖 EU AI Act Compliance Platform

A comprehensive web application for assessing and ensuring compliance with the EU AI Act regulations. This platform helps organizations evaluate their AI systems, classify risk levels, and generate detailed compliance reports.

## 🌟 Features

- **Multi-Step Assessment Wizard**: Guided questionnaire to evaluate AI systems
- **Automated Risk Classification**: Intelligent classification into Prohibited, High-Risk, Limited Risk, or Minimal Risk categories
- **AI-Powered Compliance Reports**: Generate detailed compliance reports using Gemini AI
- **User Dashboard**: Track all assessments and their compliance status
- **Real-time Analytics**: Monitor assessment statistics and trends
- **Secure Authentication**: User management with Clerk
- **Database Persistence**: Store assessments and reports with Prisma + PostgreSQL

## 🎯 Assessment Flow

1. **Step 1 - Basic Information**: System details, technology type, EU scope
2. **Step 2 - Context & Impact**: Sector, decision impact, affected persons
3. **Step 3 - Compliance Questions**: Risk management, documentation, oversight (for high-risk systems)
4. **Report Generation**: AI-generated compliance report with specific EU AI Act requirements

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI, Radix UI
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: Clerk
- **AI Integration**: Google Gemini AI
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/eu-ai-act-compliance.git
cd eu-ai-act-compliance
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables in a `.env.local` file:
```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/signin"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"
CLERK_WEBHOOK_SECRET="your-webhook-secret"

# Google Gemini AI
GEMINI_API_KEY="your-gemini-api-key"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

The platform uses Prisma with PostgreSQL and includes:
- **User**: User accounts synced with Clerk
- **Assessment**: AI system assessments with classification
- **Step data**: Detailed responses for each assessment step

## 🔐 Authentication Setup

This project uses Clerk for authentication. You'll need to:
1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Set up a webhook endpoint for user synchronization
3. Configure the webhook URL in Clerk dashboard: `/api/webhooks/clerk`

See [CLERK_WEBHOOK_SETUP.md](CLERK_WEBHOOK_SETUP.md) for detailed instructions.

## 🤖 AI Report Generation

The platform uses Google Gemini AI to generate compliance reports:
- Analyzes user responses from all assessment steps
- Provides specific EU AI Act article references
- Generates actionable compliance recommendations
- Includes risk-specific requirements and obligations

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Railway
- Render
- AWS
- Google Cloud

## 📁 Project Structure

```
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── src/
│   ├── app/            # Next.js app router pages
│   │   ├── (main)/    # Protected routes
│   │   ├── (marketing)/ # Public marketing pages
│   │   └── api/       # API routes
│   ├── components/     # React components
│   ├── lib/           # Utility functions and logic
│   ├── hooks/         # Custom React hooks
│   └── styles/        # Global styles
└── ...
```

## 🧪 Testing Example

To test the platform with a high-risk AI system:

**System**: TalentScreen AI  
**Description**: AI-powered recruitment system that screens CVs and ranks candidates  
**Sector**: Employment  
**Decision Impact**: Hiring, recruitment  
**Expected Classification**: High-Risk

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Built with ❤️ for EU AI Act compliance
