# brain.md — Product Thinking

## 1. Vision
A single app that lets a small business owner (restaurant, cafe, or retail shop) run their
**entire daily operation** — billing, stock, staff, and money — and lets them simply *ask*
their business questions in plain language instead of digging through reports.

## 2. Why this beats a plain "Table/Vyapar clone"
| Vyapar's "Table" app | This app |
|---|---|
| Menu created manually, item by item | Point camera at a paper menu → AI fills it in |
| Reports = charts/numbers you must interpret yourself | Ask "why was profit low in July?" and get a plain-language answer grounded in your data |
| Restaurant-first | Restaurant, cafe, **and retail** in one app (shared billing/inventory core, different UI modules) |
| Stock tracked in generic units | Stock entry mirrors how owners actually think: "10 kg mutton at ₹650/kg" |

## 3. Core Pillars
1. **Fast billing** — the thing used 100+ times/day must never feel slow, even offline.
2. **Stock that matches real purchasing behavior** — weight/volume/count + price, not forced into "units."
3. **AI as a shortcut, not a gimmick** — menu scanning removes tedious data entry; RAG assistant removes the need to read reports to get an answer.
4. **One data model, multiple front-ends** — restaurant (tables/KOT) and retail (barcode/SKU) share the same order → inventory → P&L pipeline underneath.

## 4. Feature Brainstorm (MoSCoW)

**Must have (v1)**
- Auth, business/outlet setup, roles
- Menu/catalog CRUD + AI menu scan (Gemini Vision)
- Manual stock-in with qty+unit+price, stock ledger, low-stock alerts
- Billing (restaurant: table/KOT; retail: cart/barcode)
- Reports: sales, top items, stock valuation
- P&L engine (revenue, COGS, expenses, net profit)
- RAG assistant for at least: sales, profit/loss, top items, stock spend

**Should have (v1.x)**
- Recipe/BOM linking (so selling 1 "Mutton Fry" auto-deducts 200g raw mutton from stock)
- Expense tracker UI
- Multi-outlet consolidated reports
- Wastage/expiry tracking

**Could have (v2)**
- Online ordering / QR-code table ordering for customers
- Customer loyalty/CRM
- Supplier management & purchase orders
- WhatsApp bill sharing, WhatsApp-based RAG assistant

**Won't have (v1)**
- Full double-entry accounting
- Payroll

## 5. Business Terms the Owner Will Ask About (glossary the RAG assistant must know)
- **Revenue / Sales** — total money from bills in a period.
- **COGS (Cost of Goods Sold)** — cost of raw material/stock consumed to generate that revenue.
- **Gross Profit** = Revenue − COGS. **Gross Margin %** = Gross Profit / Revenue.
- **Operating Expenses** — rent, salaries, electricity, misc. (not tied to a specific sale).
- **Net Profit** = Gross Profit − Operating Expenses.
- **Stock Valuation** — current value of unsold stock at cost price.
- **Wastage %** — quantity/value of stock lost to spoilage/wastage vs. total purchased.
- **Average Transaction Value (ATV)** — Revenue ÷ number of bills.
- **Inventory Turnover** — how fast stock is used/sold and replenished.
- **Footfall / Order count** — number of bills/orders in a period.
The P&L engine and RAG assistant both need to compute/explain every one of these, since the
owner may ask for the number *or* ask "what does X mean for my shop."

## 6. Open Questions / Risks
- Recipe/BOM mapping (item → raw materials consumed) needs owner setup effort — should be optional, with COGS falling back to a simpler "purchase cost this period" estimate if not configured.
- Gemini Vision accuracy on handwritten/regional-language menus — needs a mandatory human review/edit step before saving, never auto-publish blindly.
- Offline billing + AI assistant (which needs connectivity) — assistant should clearly degrade to "needs internet" rather than blocking core billing.
- Multi-tenant data isolation must be airtight before RAG is added — the assistant must only ever retrieve the asking owner's own data.

## 7. Monetization (future, not v1 build)
- Freemium: free for single outlet with basic billing; subscription for multi-outlet, AI scan, and RAG assistant.
