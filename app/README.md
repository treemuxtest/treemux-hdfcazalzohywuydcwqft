# ReliefCanvas

ReliefCanvas is an AI operations chief for disaster responders. Feed it messy field notes—locations, constraints, and assets already staged—and it synthesizes multi-phase playbooks, stress-tests against Sphere/WHO best practices, and shares audit results through a lightweight mission feed. The experience is tuned for hackathon juries: high-fidelity UI, fast iteration, and production-ready deployment on Vercel.

## Highlights

- **AI mission composer** – Structured generation powered by OpenAI `gpt-4.1-mini` via the Vercel AI SDK to produce phased timelines, supply stacks, and intel signals.
- **Best-practice radar** – Local dataset of critical WASH/medical/logistics standards scored against each plan with gap visualizations.
- **Shared mission feed** – Minimal API endpoint + local storage persistence to broadcast recent synths across devices for demos.
- **Shadcn + Tailwind v4 UX** – Neon mission-control aesthetic with responsive layout, tabs, and progress visualizations.

## Quickstart

```bash
cd app
cp .env.example .env.local   # add your OPENAI_API_KEY
bun install
bun run dev
```

Open http://localhost:3000 to access the planner. Update `.env.local` anytime the API key changes; the server will hot-reload.

## Scripts

| Command          | Description                              |
| ---------------- | ---------------------------------------- |
| `bun run dev`    | Start Next.js with Turbopack             |
| `bun run lint`   | ESLint via the default Next.js config    |
| `bun run build`  | Create a production build (CI friendly)  |
| `bun run start`  | Serve the production build               |

## Architecture Notes

- **App Router** in `src/app` with a single page that renders the `MissionPlanner` client component.
- **Server action** `src/app/actions/generate-plan.ts` orchestrates AI calls and audits.
- **API route** `src/app/api/history/route.ts` stores the shared mission feed in memory for demos.
- **UI kit** lives under `src/components/ui/` via shadcn, while planner-specific UI sits in `src/components/mission-planner.tsx`.
- **Best-practice data** resides in `src/data/best-practices.ts` for easy extension.

## Deployment

The repo is configured for Vercel:

- `vercel.json` + `next.config.ts` loosen iframe protections for expo kiosks.
- `treemux-report` already triggered preview deployments per step; run `vercel --prod` from `/workspace/app` for manual releases if needed.

## Environment Variables

| Variable         | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `OPENAI_API_KEY` | Required for mission synthesis (server). |

Anthropic and OpenRouter keys are available in the event environment if you want to extend the pipeline with additional providers.
