---

# **Portfolio Excel Import & Relationship Preservation Specification**

## **1. Input Source (Excel-Based)**

* The system receives portfolio data periodically (e.g., bi-monthly, quarterly) in **Excel format (.xlsx)**.
* The Excel file follows a structure similar to **CAS (Consolidated Account Statement – Detailed)**.

### **1.1 File Characteristics**

* File type: `.xlsx`
* Contains:

  * **Header section** (Investor metadata)
  * **Transaction/Portfolio table section** (scheme-level holdings)

---

### **1.2 Header Section (Metadata Extraction)**

The following fields must be extracted (if present):

| Field Name      | Source (Excel Label) |
| --------------- | -------------------- |
| InvestorName    | Name                 |
| MobileNumber    | Mobile Number        |
| Email           | Email                |
| PAN             | PAN                  |
| StatementPeriod | From Date / To Date  |

> These values are typically present in the **top rows before tabular data**.

---

### **1.3 Portfolio Table Section (Normalized Structure)**

The tabular section must be parsed into the following normalized structure:

| System Field    | Excel Mapping (CAS)                   |
| --------------- | ------------------------------------- |
| AMCName         | Derived from Scheme / AMC grouping    |
| Scheme          | Scheme Name column                    |
| Type            | Derived (e.g., Direct/Growth/Regular) |
| Folio           | Folio Number                          |
| InvestorName    | From header                           |
| UnitBal         | Unit Balance                          |
| NAVDate         | NAV Date                              |
| CurrentValue    | Current Value                         |
| CostValue       | Invested Amount / Cost                |
| Appreciation    | Gain/Loss                             |
| WtgAvg          | Weighted Avg NAV (if available)       |
| Annualised XIRR | XIRR (if available)                   |

> Since CAS files are semi-structured, parsing must:

* Skip empty rows
* Detect table start dynamically
* Handle merged cells and repeated AMC headers

---

## **2. Unique Identification Logic**

Each portfolio record is uniquely identified using the composite key:

* `AMCName`
* `Scheme`
* `Type`
* `Folio`
* `InvestorName`

### **Purpose**

This composite key is used to:

* Prevent duplicate entries
* Identify records for updates (upsert)
* Maintain referential integrity

---

## **3. Import Behavior (Upsert Logic)**

### **3.1 Processing Flow**

1. Upload Excel file
2. Extract:

  * Investor metadata
  * Portfolio rows
3. Normalize into system structure
4. Apply upsert logic

---

### **3.2 Upsert Rules**

#### **Case 1: Existing Portfolio Found (Match on Composite Key)**

* Update ONLY the following fields:

  * `UnitBal`
  * `NAVDate`
  * `CurrentValue`
  * `CostValue`
  * `Appreciation`
  * `WtgAvg`
  * `Annualised XIRR`

* DO NOT modify:

  * Investor mapping
  * SIP associations
  * Goal associations

---

#### **Case 2: New Portfolio (No Match Found)**

* Create new portfolio record

* Link to Investor:

  * If Investor exists → reuse
  * If not → create new Investor using header data

* Do NOT:

  * Attach SIPs
  * Attach Goals

---

## **4. Relationship Preservation**

The import process must be **strictly non-destructive**.

### **4.1 Relationships to Preserve**

* Investor ↔ Portfolio
* Portfolio ↔ SIP
* Portfolio ↔ Goals

### **4.2 Rules**

* No deletions
* No reassignment
* No overwriting relationships
* Only portfolio metrics are updated

---

## **5. Export Behavior (Excel-Based)**

### **5.1 Export Format**

* Export must generate an **Excel file (.xlsx)** compatible with re-import
* Structure should resemble normalized CAS-like format

---

### **5.2 Export Requirements**

* Include columns:

  * AMCName
  * Scheme
  * Type
  * Folio
  * InvestorName
  * UnitBal
  * NAVDate
  * CurrentValue
  * CostValue
  * Appreciation
  * WtgAvg
  * Annualised XIRR

* Ensure:

  * Consistent schema
  * Clean tabular structure (no merged cells)
  * Deterministic ordering (for idempotency)

---

## **6. Idempotency Guarantee**

The system must ensure:

* Re-importing the same Excel file:

  * Does NOT create duplicates
  * Does NOT modify relationships
  * Only reaffirms existing values

---

## **7. Parsing & Validation Rules**

### **7.1 Parsing Rules**

* Detect table start dynamically (ignore header noise)
* Handle:

  * Blank rows
  * AMC grouping rows
  * Multi-line scheme names
* Normalize:

  * Dates → ISO format
  * Numbers → decimal

---

### **7.2 Validation Rules**

* Mandatory fields:

  * Scheme
  * Folio
  * InvestorName

* Reject or log:

  * Invalid numeric values
  * Missing identifiers
  * Corrupt rows

---

## **8. Additional Constraints**

* Manual operations remain unaffected:

  * Investor creation
  * Portfolio creation
  * SIP & Goal management

* Import acts as:

  * **Synchronization layer**, NOT source of truth override

---

## **9. Recommended Internal Architecture**

### **9.1 Processing Pipeline**

```
Excel Upload
   ↓
Header Parser (Investor Info)
   ↓
Table Extractor (Row Detection)
   ↓
Normalizer (Map → Domain Model)
   ↓
Deduplication (Composite Key)
   ↓
Upsert Engine
   ↓
Persistence Layer (IndexedDB / SQLite)
```

---

## **10. Key Design Principles**

* Idempotent processing
* Non-destructive updates
* Composite-key-based identity
* Loose coupling with relationships
* CAS-format tolerance (semi-structured parsing)

---
