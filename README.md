# Digital Certificate Verification Portal
**MERN Stack College Final Project Presentation**

A modern, elegant, and fully functional full-stack web application designed for HR compliance departments and organizational auditing to authenticate employee certificates, detect fraudulent credentials, and maintain an immutable forensic verification audit trail.

---

## 🌟 Key Features

1. **Unified Enterprise Authentication (RBAC)**:
   - One single professional login page for all users (No role dropdowns, no mock credentials exposed on the UI).
   - Automatic backend role identification redirecting employees to the **Employee Portal** and HR to the **HR Dashboard**.
   - Strict server-side route guards (HTTP 401 Unauthorized, HTTP 403 Forbidden).

2. **Employee Portal**:
   - Personalized dashboard with real-time statistics (Total Submitted, Pending Verification, Verified Authentic, Flagged as Fake).
   - Secure certificate submission form supporting PDF, JPG, JPEG, and PNG files (Max 15 MB).
   - Private submission history (Employees can only view their own submissions; Employee 1 cannot see Employee 2's documents).
   - Immediate visibility of HR scan results and discrepancies.

3. **HR Administrator Dashboard & Scanner**:
   - Comprehensive overview of all submissions received from both employees.
   - Dedicated **Certificate Verification Scanner** supporting both submitted queue items and standalone direct file uploads.
   - Real-time animated scanning progress indicator.
   - Deep forensic analysis:
     - Binary file format & cryptographic SHA-256 integrity hash.
     - Text & token extraction (Certificate ID, Recipient Name, Issuing Institution, Program, Issue Date).
     - Cross-referencing against the controlled Institutional Demonstration Registry.
     - Recipient Identity Integrity check (detects identity swaps & tampered credentials).
     - Issuing Authority Accreditation validation.
     - Anti-tamper forensic watermark detection.
     - Numerical confidence score (0–100%).
     - Official Verdict: `VERIFIED AS AUTHENTIC`, `FLAGGED AS POTENTIALLY FAKE`, or `VERIFICATION INCONCLUSIVE`.
   - HR Review & Sign-Off: Ability to record official review notes and finalize decisions.
   - Downloadable official **Forensic Verification Audit Report (PDF)**.

4. **Demonstration Test Certificates**:
   - Downloadable directly from the portal via the **Demo Test Certificates** button in the header.
   - **Sample Certificate A (Original)**: `DEMO-CERT-1001`, Recipient: *Arjun Kumar*, Issuer: *Example Technical Institute* → Verifies as **VERIFIED AS AUTHENTIC** (100% Score).
   - **Sample Certificate B (Altered)**: `DEMO-CERT-2002`, Recipient: *Priya Sharma*, Issuer: *Example Technical Institute* (Registered Recipient on file is *Vikram Malhotra*) → Verifies as **FLAGGED AS POTENTIALLY FAKE** (45% Score, Recipient Mismatch flagged).

---

## 👥 Demo User Credentials

All users log in through the **same unified login page** (`/`):

| Role | Username | Password | Assigned Name | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Employee 1** | `employee1` | `Emp@12345` | Arjun Kumar | Software Engineering |
| **Employee 2** | `employee2` | `Emp@12345` | Priya Sharma | Cybersecurity Operations |
| **HR Administrator** | `hradmin` | `HR@12345` | Sarah Jenkins | Human Resources & Talent Compliance |

---

## 🛠️ Technology Stack (MERN)

- **MongoDB / Mongoose**: Database connectivity (`mongodb://127.0.0.1:27017/certverify`) with persistent atomic JSON storage fallback so the application works seamlessly in any evaluation environment.
- **Express.js & Node.js**: High-performance RESTful API with MVC architecture, Multer file processing, and bcrypt password hashing.
- **React.js & Vite**: Modern Single Page Application (SPA) with enterprise dark mode, glassmorphism, responsive cards, and micro-animations.
- **PDFKit & pdf-parse**: Real-time vector PDF certificate generation and text stream extraction.
- **JSON Web Tokens (JWT)**: Cryptographically signed bearer tokens with 8-hour session lifetime.

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Install Dependencies
Run from the root directory:
```bash
npm run install:all
```
*(Or install individually: `cd server && npm install`, then `cd ../client && npm install`)*

### 3. Start the Application

Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd server
npm start
```
*Backend runs at: `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs at: `http://localhost:5173` (or `http://localhost:5174`)*

---

## 📋 Step-by-Step College Demonstration Scenario

Follow these exact steps during your college project presentation:

1. **Unified Login**:
   - Open `http://localhost:5173` (or `http://localhost:5174`).
   - Notice the enterprise login screen: clean, minimal, no prefilled credentials, no role selector.
2. **Download Demo Test Certificates**:
   - Click the **Demo Test Certificates** button in the top navigation header.
   - Click **Download PDF** for both **Sample Certificate A (Original)** and **Sample Certificate B (Altered)**.
3. **Log in as Employee 1**:
   - Username: `employee1` | Password: `Emp@12345`.
   - Automatically redirected to the **Employee Portal** for *Arjun Kumar*.
4. **Upload Sample Certificate A**:
   - Click **+ Upload Certificate**.
   - Select the downloaded `Sample_Certificate_A_Original.pdf`.
   - Title: `Certified Web Specialist`, Type: `Web Development`, Issuer: `Example Technical Institute`, ID: `DEMO-CERT-1001`.
   - Click **Submit Certificate**.
   - Confirm it appears in Employee 1's submission history with status `Pending Verification`.
5. **Log out**:
   - Click the **Logout** button in the top right.
6. **Log in as HR Administrator**:
   - Username: `hradmin` | Password: `HR@12345`.
   - Automatically redirected to the **HR Dashboard**.
   - View the received submission count and recent submissions.
7. **Verify Certificate A in Scanner**:
   - Navigate to the **Certificate Verification (Scanner)** tab.
   - Select Employee 1's submission (`[DEMO-CERT-1001] Arjun Kumar`).
   - Review the document preview.
   - Click **Scan Certificate**.
   - Watch the animated laser scan sweep.
   - Result: **VERIFIED AS AUTHENTIC** (100% Confidence Score, all 6 forensic checks passed, confetti celebration).
   - Click **Confirm & Synchronize Verification Status**.
   - Click **Download PDF Report** to view the generated forensic audit certificate report.
8. **Log out and log in as Employee 2**:
   - Username: `employee2` | Password: `Emp@12345`.
   - Redirected to Employee 2's portal (*Priya Sharma*).
   - Notice Employee 2 cannot see Employee 1's certificates (Strict data isolation).
9. **Upload Sample Certificate B (Altered)**:
   - Click **+ Upload Certificate**.
   - Select `Sample_Certificate_B_Altered.pdf`.
   - Title: `Cybersecurity Fundamentals Credential`, Type: `Cybersecurity Fundamentals`, Issuer: `Example Technical Institute`, ID: `DEMO-CERT-2002`.
   - Click **Submit Certificate**.
10. **Log out and log in as HR Administrator again**:
    - Select Employee 2's submission in the Scanner.
    - Click **Scan Certificate**.
    - Result: **FLAGGED AS POTENTIALLY FAKE** (45% Confidence Score).
    - Discrepancy clearly explained: *Certificate recipient states "Priya Sharma", but official institutional registry records confirm Certificate ID DEMO-CERT-2002 was issued to "Vikram Malhotra"*.
    - Click **Confirm & Synchronize Verification Status**.
11. **Verify Live Employee Update**:
    - Log back in as Employee 2 (`employee2`).
    - The submission status immediately shows **Flagged as Potentially Fake** with the full discrepancy explanation and report download link.
12. **Verify Role Security**:
    - Note that neither employee can navigate to `/api/verification/scan` or access HR-only operations (403 Forbidden).

---

## 🔒 Security & Academic Syllabus Coverage (CO5 Topics)

- **Connect (Sessions 37–39)**: Full REST API integration with Fetch API, JSON serialization, proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `500 Internal Server Error`), CORS configuration, dynamic UI state updates without full page reloads.
- **Protect (Sessions 40–42)**: bcrypt password hashing with salt rounds, JWT bearer tokens, authentication middleware (`authenticateToken`), authorization middleware (`requireRole`), strict Role-Based Access Control (RBAC).
- **Enhance (Sessions 43–45)**: Asynchronous `async`/`await` pipeline, Single Page Application (SPA), MVC backend folder structure, file upload validation (mime type, extension, size limits), sanitization, prevention of parameter tampering, audit logging.

---

## 📄 License
MIT License - Built for College Final Project Presentation.
