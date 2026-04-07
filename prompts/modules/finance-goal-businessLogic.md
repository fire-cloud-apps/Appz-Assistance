### **Portfolio JSON Import & Relationship Preservation**

Design and implement a JSON import/export mechanism for a portfolio management system with the following requirements:

#### **1. Input Source**

* The system receives portfolio data periodically (e.g., every 2 months or quarterly) in JSON format.
* Each JSON file contains a list of portfolio records with the following structure:

```json
[
  {
    "AMCName": "string",
    "Scheme": "string",
    "Type": "string",
    "Folio": "string",
    "InvestorName": "string",
    "UnitBal": number,
    "NAVDate": "string (date)",
    "CurrentValue": number,
    "CostValue": number,
    "Appreciation": number,
    "WtgAvg": number,
    "Annualised XIRR": number
  }
]
```

---

#### **2. Unique Identification Logic**

* A portfolio record must be uniquely identified using the combination of:

    * `AMCName`
    * `Scheme`
    * `Type`
    * `Folio`
    * `InvestorName`

* This composite key must be used to:

    * Prevent duplicate portfolio entries
    * Identify existing records during updates

---

#### **3. Import Behavior (Upsert Logic)**

When a new JSON file is uploaded:

* **If a matching portfolio exists (based on composite key):**

    * Update only the portfolio-related fields:

        * `UnitBal`, `NAVDate`, `CurrentValue`, `CostValue`, `Appreciation`, `WtgAvg`, `Annualised XIRR`
    * Do NOT modify or break existing relationships:

        * Investor ↔ Portfolio
        * Portfolio ↔ SIP
        * Portfolio ↔ Goals

* **If no matching portfolio exists:**

    * Create a new portfolio record
    * Associate it with the corresponding investor (create investor if not exists)
    * Do NOT attach any SIPs or Goals by default

---

#### **4. Relationship Preservation**

* Existing relationships must remain intact across imports:

    * Investor ↔ Portfolio
    * Portfolio ↔ SIP
    * Portfolio ↔ Goals

* The import process must be **non-destructive**:

    * No deletion or reassignment of relationships
    * Only portfolio data fields are updated

---

#### **5. Export Behavior**

* The system should support exporting portfolio data back into JSON format
* Exported JSON must:

    * Maintain the same schema structure
    * Preserve logical linkage (via identifiers such as InvestorName, Folio, etc.)
    * Ensure consistency for future re-imports

---

#### **6. Additional Constraints**

* Manual creation and management of Investors, Portfolios, SIPs, and Goals should remain unaffected
* The import process should act as a synchronization/update layer, not a replacement mechanism
* Ensure idempotency:

    * Re-importing the same JSON should not create duplicates or alter relationships

---

#### **Goal**

Build a robust, idempotent JSON import/export system that:

* Uses composite keys for identity
* Updates only necessary portfolio fields
* Preserves all existing relationships
* Supports incremental data updates over time

