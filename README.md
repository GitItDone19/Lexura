# Lexura

**An EU AI Act assessment and reporting workspace.** Lexura collects information about an AI system, applies a transparent set of classification rules, asks role and risk specific compliance questions, and generates a report from the assessment.

> Lexura is an educational decision-support tool. Its rule-based classification and generated report are not legal advice or a determination of compliance. Verify results with qualified counsel and the current EU AI Act.

![Lexura assessment flow: describe a system, examine its use, answer relevant safeguards, and review the result](public/images/readme/assessment-flow.svg)

## What it does

- Creates private, signed-in workspaces for assessments.
- Guides a user through system details, use-case risk signals, and a classification-specific questionnaire.
- Classifies the system with rule-based checks for prohibited, high-risk, GPAI, limited-risk, or minimal-risk categories.
- Requests an AI-generated compliance report using an optional RAG service, with Google Gemini as a fallback when the RAG request fails.
- Saves assessment answers and reports in PostgreSQL and provides a dashboard to revisit assessments.
- Renders reports as Markdown and uses the browser print dialog for saving or printing to PDF.

## How it works

![Lexura architecture: browser, Next.js application, PostgreSQL, Clerk, optional RAG API, and Gemini fallback](public/images/readme/architecture.svg)

1. **Sign in.** Clerk provides authentication. The server resolves the signed-in Clerk identity to a Lexura user record.
2. **Describe the AI system.** Step 1 collects system purpose, EU scope, technology, general-purpose model involvement, and provider/deployer role.
3. **Describe its use.** Step 2 collects sector, decisions influenced, affected people, product type, biometric processing, and sensitive capabilities.
4. **Classify and assess safeguards.** `src/lib/classification-logic.ts` checks EU scope, prohibited practices, high-risk use cases, GPAI involvement, and transparency-related limited-risk signals in that order. Step 3 presents questions based on the resulting class and role.
5. **Generate and save a report.** The report route builds a summary from the answers and requests the configured RAG endpoint. If that request fails, the route uses Gemini. The report is stored on the assessment and shown in the report page.

Assessment answers are stored as JSON fields (`step1Data`, `step2Data`, and `step3Data`) on the `Assessment` model. The model also has fields for classification, score, requirements, action plan, and report; not all of these fields are currently populated by the workflow.

## Current implementation

| Area | Implemented here |
| --- | --- |
| Web app | Next.js 14 App Router, React 18, TypeScript, Tailwind CSS |
| Authentication | Clerk middleware and server-side identity lookup |
| Data | Prisma ORM with PostgreSQL; schema includes `User` and `Assessment` |
| Classification | Local TypeScript decision rules in `src/lib/classification-logic.ts` |
| Report generation | Google Generative AI SDK (`gemini-2.5-flash`) with an optional RAG HTTP request first |
| RAG service | Not included in this checkout. The app expects a compatible service at `/query` (default `http://localhost:8000/query`). |
| PDF | Browser print dialog; there is no dedicated PDF generation service |

The Python dependencies, `dev:rag` script, and `Procfile` refer to `rag_api.py`, but that file is not present in the repository. The RAG service must therefore be supplied separately, or report generation will use Gemini as the fallback. The committed `eu_ai_act_index/` is a ChromaDB data directory; it does not provide the missing API implementation by itself.

## Run locally

### Requirements

- Node.js 18 or newer and npm
- A PostgreSQL database
- Clerk application keys
- A Google Gemini API key for report fallback
- Optional: a separately deployed RAG API compatible with `POST /query`

### Install

```bash
git clone <repository-url>
cd Lexura
npm install
```

Create `.env` in the repository root. `DIRECT_URL` is used by Prisma for direct database access. For a local PostgreSQL database, both database variables can use the same connection string; with Neon, use the provider's pooled and direct URLs as appropriate.

```dotenv
NEXT_PUBLIC_APP_NAME=Lexura
NEXT_PUBLIC_APP_DOMAIN=localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/signin
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_URL=/app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_URL=/app

# Optional, if you configure Clerk user webhooks.
CLERK_WEBHOOK_SECRET=whsec_...

GEMINI_API_KEY=...

# Optional. This must be the full POST endpoint, including /query.
NEXT_PUBLIC_RAG_API_URL=http://localhost:8000/query
```

The sign-in and sign-up paths above match the pages in `src/app/auth/`. The example file `.env.example` lists only a subset of runtime settings; in particular, Prisma also needs `DIRECT_URL`.

Generate the Prisma client and apply the schema to your database:

```bash
npx prisma generate
npx prisma db push
```

Start the web app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). To use RAG-backed reports, start or deploy the separate RAG service and point `NEXT_PUBLIC_RAG_API_URL` at its `/query` endpoint. Without a reachable RAG service, the report route attempts Gemini fallback; set a valid `GEMINI_API_KEY` for that path.

`npm run dev:rag` and `npm run dev:full` currently reference the missing `rag_api.py`; they will not start the RAG service from this checkout.

## Assessment and classification

The assessment flow gathers the following information:

| Step | Information collected |
| --- | --- |
| 1 · System | Intended purpose, EU impact, technology types, GPAI development or integration, and whether the user is provider, deployer, or both |
| 2 · Use case | Sector, decision impact, affected people, product type, biometric processing, and sensitive capabilities |
| 3 · Safeguards | Questions selected for the computed risk category and role, covering areas such as risk management, documentation, human oversight, transparency, or GPAI provider duties |

The classifier applies checks in this precedence: EU scope, prohibited practices, high-risk indicators, GPAI role, limited-risk transparency signals, then minimal risk. It uses the selected form values and hard-coded rules; it is not a complete or authoritative implementation of the EU AI Act. A user who indicates no EU impact can take a shortcut to a minimal-risk result.

Possible outputs include `PROHIBITED`, `HIGH_RISK_PROVIDER`, `HIGH_RISK_DEPLOYER`, `GPAI_PROVIDER`, `GPAI_DEPLOYER`, `LIMITED_RISK`, and `MINIMAL_RISK`. The role and category names reflect the application's current rules and do not substitute for legal analysis.

The report page can regenerate the report and uses the browser's print dialog (`window.print()`) for a PDF workflow. Report text is generated from submitted answers and external model/service responses; review it before relying on it.

## Repository map

```text
src/
  app/
    (marketing)/       Public landing page
    (main)/app/        Signed-in dashboard and assessment pages
    api/               Assessment, dashboard, report, RAG, and webhook routes
    auth/              Sign-in and sign-up pages
  lib/
    classification-logic.ts   Rule-based risk classification
    generate-brief-summary.ts Assessment-to-report prompt construction
    get-or-create-user.ts     Clerk identity to Prisma user lookup
    rag-client.ts             RAG request and Gemini fallback orchestration
  middleware.ts        Clerk route protection
prisma/
  schema.prisma        PostgreSQL data model
public/
  images/readme/       README diagrams
eu_ai_act_index/       ChromaDB data files (not the RAG API)
```

## API routes

Routes that read or change user assessments resolve the current user through Clerk and scope database queries to that user.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET`, `POST` | `/api/assessments` | List the current user's assessments or create one |
| `GET`, `PATCH`, `DELETE` | `/api/assessments/:id` | Read, update, or delete an owned assessment |
| `POST` | `/api/assessments/:id/step1` | Save system information |
| `POST` | `/api/assessments/:id/step2` | Save use-case information |
| `POST` | `/api/assessments/:id/step3` | Save safeguards or apply the EU-scope shortcut |
| `GET` | `/api/assessments/recent` | List recent assessments |
| `GET` | `/api/dashboard/stats` | Return dashboard counts and average saved score |
| `POST` | `/api/generate-report` | Generate report text from assessment data |
| `POST` | `/api/rag-query` | Proxy a question to `http://localhost:8000/query` |
| `POST` | `/api/webhooks/clerk` | Clerk webhook handler |

## Useful commands

```bash
npm run dev              # Next.js development server
npm run build            # Production build
npm run start            # Serve the production build
npm run lint             # Next.js ESLint command
npx prisma generate      # Generate Prisma client
npx prisma db push       # Apply schema to the configured database
npx prisma studio        # Open Prisma Studio
```

## Deployment notes

- Deploy the Next.js application to a Node-compatible host and configure all environment variables there.
- Provision PostgreSQL and set both `DATABASE_URL` and `DIRECT_URL` for the target provider.
- Configure Clerk's allowed redirect URLs to match the deployed `/auth/signin` and `/auth/signup` pages.
- Set `GEMINI_API_KEY` if the report route should use Gemini when RAG is unavailable.
- If using RAG, deploy its API separately and set `NEXT_PUBLIC_RAG_API_URL` to the complete `/query` endpoint. The API implementation is not included in this repository.
- The repository's `Procfile` starts `uvicorn rag_api:app`; that command requires the missing `rag_api.py` module and is not a complete deployment setup for this checkout.

See [NEON_SETUP.md](NEON_SETUP.md) for the existing Neon notes. The Prisma schema requires `DIRECT_URL`, so configure it even though that guide only shows `DATABASE_URL` in its first connection-string example.

## Contributing

Open an issue to discuss a change, then submit a pull request with a focused description. Keep documentation aligned with the behavior in the repository and avoid presenting generated results as legal determinations.

## License

Lexura is licensed under the MIT License. See [LICENSE](LICENSE).
