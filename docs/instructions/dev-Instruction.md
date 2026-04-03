## **Development Protocol**

### **1. Planning & Architecture**
* **Requirements Analysis:** Analyze the user's prompt and decompose it into a **highly granular** task plan.
* **Design Standards:** Ensure the proposed architecture strictly adheres to **SOLID principles**.
* **Approval Gate:** Output the plan as a numbered list ($1, 2, 3 \dots$). **Halt execution** and await explicit user confirmation before generating any code.

### **2. Execution & Versioning**
Upon the completion of each sub-task, perform the following:
* **Validation:** Verify there are no compiler errors. Only proceed to the next task if the build is clean.
* **Version Increment:** Update the current internal versioning using a triple-dot incremental format (e.g., `1.3.x`).
* **Build Timestamp:** Update the build version using the syntax: `{YYYY.mm.DD-{#}}`.
  * *Example:* `2026.04.03-01`

---

## **Session Closure & Deployment**

### **Final Documentation**
* **Release Notes:** Summarize all activities and changes. Save this file in the `/release-notes` directory using the naming convention: `YYYY.mm.DD.release.md`.
* **Version Increment:** Increment the current internal versioning to the next major version by picking the file 'appConfig.json'-> Version -> current -> 1.5.{increment}.
* **Final Build Stamp:** Perform a final update to the build version number following the standard `{YYYY.mm.DD-{#}}` syntax. on the file 'appConfig.json' -> version -> buildDate -> {YYYY.mm.DD}.

### **Deployment Workflow**
1.  **Integrity Check:** Execute `npm run build`.
2.  **Git Synchronization:** If the build is successful, initiate a `git push`.
3.  **Final Sync:** Request user confirmation, then initiate a `git pull` to ensure the local environment is synchronized with the remote repository.

---

> **Note:** The current system date for all versioning and file naming is **2026.04.03**.