# Flow Diagrams

## 1. Onboarding & Business Setup

```mermaid
flowchart TD
    A[Download app] --> B[Sign up: phone + OTP]
    B --> C[Enter business name & type\nRestaurant / Cafe / Retail]
    C --> D{Add another outlet?}
    D -- Yes --> E[Add outlet details]
    E --> D
    D -- No --> F[Choose modules:\nTable/KOT if Restaurant/Cafe\nBarcode/SKU if Retail]
    F --> G[Invite staff + assign roles]
    G --> H[Land on Home dashboard]
```

## 2. AI Menu Scan Flow

```mermaid
flowchart TD
    A[Owner taps 'Scan Menu'] --> B[Capture/upload photo of menu card]
    B --> C[Upload image to S3]
    C --> D[Backend calls Gemini Vision\nwith structured-extraction prompt]
    D --> E[Gemini returns draft items:\nname, price, category]
    E --> F[App shows editable review list]
    F --> G{Owner edits/removes items?}
    G -- Yes --> F
    G -- No, looks good --> H[Confirm & Save]
    H --> I[Bulk insert into Catalog]
    I --> J[Items now available for billing]
```

## 3. Manual Stock Entry Flow

```mermaid
flowchart TD
    A[Owner taps 'Add Stock'] --> B[Select stock item, e.g. Mutton\nor create new]
    B --> C[Enter quantity + unit\ne.g. 10 kg]
    C --> D[Enter rate per unit\ne.g. ₹650/kg]
    D --> E[Auto-calc total cost = qty × rate\n= ₹6,500]
    E --> F{Confirm}
    F -- Save --> G[Create STOCK_TRANSACTION type=in]
    G --> H[Update STOCK_ITEM.current_qty\n& avg_cost_per_unit]
    H --> I[Re-check low-stock threshold\nfor all items]
```

## 4. Billing Flow (Restaurant/Cafe vs Retail)

```mermaid
flowchart TD
    Start[Tap '+' Quick Add] --> Type{Business type}
    Type -- Restaurant/Cafe --> R1[Select table or Takeaway]
    R1 --> R2[Add menu items to order]
    R2 --> R3[Send KOT to kitchen printer]
    R3 --> R4{More items / hold?}
    R4 -- Hold --> R3
    R4 -- Ready to bill --> R5[Generate bill, apply discount]
    R5 --> R6[Collect payment: cash/UPI/card]
    R6 --> R7[Order status: Closed]

    Type -- Retail --> T1[Scan barcode or search item]
    T1 --> T2[Add to cart]
    T2 --> T3{More items?}
    T3 -- Yes --> T1
    T3 -- No --> T4[Generate bill]
    T4 --> T5[Collect payment]
    T5 --> T6[Order status: Closed]

    R7 --> Deduct[Deduct raw-material stock\nvia recipe/BOM, if configured]
    T6 --> Deduct
    Deduct --> End[Order feeds into Reports & P&L]
```

## 5. RAG Business Assistant Flow

```mermaid
sequenceDiagram
    participant Owner
    participant App as Mobile App
    participant API as RAG Assistant Service
    participant Vec as pgvector (business-scoped)
    participant PL as P&L Engine
    participant Gemini as Gemini (Text)

    Owner->>App: "What's my profit this month?"
    App->>API: POST /assistant/query
    API->>API: Embed the question
    API->>Vec: Similarity search (filter: business_id)
    Vec-->>API: Relevant sales/expense summaries
    API->>PL: Compute Revenue, COGS, Expenses, Net Profit\n(for detected date range)
    PL-->>API: Structured numbers
    API->>Gemini: Prompt = question + retrieved context + computed numbers\n("answer only from this data, cite the period")
    Gemini-->>API: Natural-language answer
    API-->>App: Answer + period + key numbers
    App-->>Owner: Shows chat reply
```

## 6. Profit & Loss Calculation Flow

```mermaid
flowchart TD
    A[Select date range] --> B[Revenue = SUM order totals in range]
    A --> C[COGS = SUM stock consumed at cost\nvia recipe or purchase-cost fallback]
    A --> D[Operating Expenses = SUM logged expenses in range]
    B --> E[Gross Profit = Revenue - COGS]
    C --> E
    E --> F[Net Profit = Gross Profit - Operating Expenses]
    D --> F
    F --> G[Shown in Reports UI\nAND used by RAG Assistant\nsingle source of truth]
```
