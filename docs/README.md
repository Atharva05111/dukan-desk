# Dukan Desk — Planning Docs

Based on the reference screenshots you shared (Vyapar's "Table" app: Home dashboard, Add
Staff, Print KOT, Items grid with categories/prices), extended to also cover **retail**
shops, **AI menu scanning**, and a **RAG-powered business assistant**.

Read in this order:

1. **01-requirements.md** — what the app must do (functional + non-functional requirements).
2. **02-brain.md** — the product thinking: why this app, feature priorities, the business-terms glossary the AI assistant needs to understand.
3. **03-architecture.md** — tech stack (React Native + NestJS + PostgreSQL/pgvector + Gemini), service breakdown, data model.
4. **04-flow-diagrams.md** — Mermaid diagrams for onboarding, AI menu scan, stock entry, billing (restaurant vs retail), the RAG assistant, and P&L calculation.

## Suggested build order
1. Auth + business setup + basic Catalog CRUD.
2. Manual stock entry (qty/unit/price) + stock ledger.
3. Billing core (restaurant KOT flow + retail cart flow).
4. Reports (sales, top items) + P&L engine.
5. AI Menu Scan (Gemini Vision).
6. RAG Business Assistant on top of the now-existing sales/stock/expense data.
