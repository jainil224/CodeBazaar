# CodeBazaar 🚀

CodeBazaar is a premium, production-ready digital marketplace for source code templates and boilerplates. It features an interactive live-preview details overlay, a dedicated code playground sandbox workspace, a secure Firebase Auth suite, real-time Firestore transaction recording, and a Razorpay live payment gateway.

---

## 🛠️ Technology Stack

- **Frontend Core**: React 19 + TypeScript
- **Styling**: Tailwind CSS + Framer Motion (for physics-based smooth transitions and glassmorphism layouts)
- **Backend / BaaS**: Firebase Suite (Authentication + Firestore Database)
- **Payment Gateway**: Razorpay Checkout SDK (Live-ready integration)
- **Build Utilities**: Vite 8 + PostCSS

---

## ✨ Features Built

### 1. 🔐 Multi-Provider Authentication Suite
- **Email/Password Sign Up & Sign In**: Custom authentication handler with robust client validation.
- **Google OAuth Integration**: Built-in Google Sign-in popup support.
- **COOP Headers Fix**: Fully configured Vite dev server headers (`Cross-Origin-Opener-Policy: same-origin-allow-popups`) to eliminate popup blocker conflicts.
- **Decoupled User Creation**: Seperated auth flow from database creation so failures in Firestore permission writes do not halt user logins.

### 2. 💳 Razorpay Payment Integration
- High-integrity checkout flow leveraging Razorpay checkout script loaders.
- Real-time transaction persistence recording payment IDs to Firestore upon successful gateway callbacks.
- Sleek **Payment Success Modal** showing transaction details, payment ID, and one-click copy helper.

### 3. 🖼️ Screenshot Explorer Detail View
- macOS-style browser window mockup representing preview screens.
- **Interactive Thumbnails Grid**: Clicking thumbnails dynamically switches the primary viewport display.
- Technical details cards displaying tech stack specifications, system requirements, and escrow delivery banners.

### 4. 💻 Live Workspace Sandbox Playground
- Opens a complete **Code Workspace** in a new browser tab (`?project=...`).
- **File Explorer tree-view**: Lets developers traverse file directories.
- **Syntax Code Viewer**: Renders read-only source files with line-number gutter counters.
- **Responsive Viewport Switchers**: Resize mockups into Desktop, Tablet, and Mobile views dynamically.

---

## 📂 Codebase Structure

```bash
CodeBazaar/
├── public/                 # Static assets (logos, favicon)
├── src/
│   ├── assets/             # Vector graphics and UI media
│   ├── components/
│   │   ├── AdminDashboard.tsx      # Admin transactions logs panel
│   │   ├── AuroraAuth.tsx          # Multi-provider Auth modal
│   │   ├── FAQ.tsx                 # Accordion UI section
│   │   ├── FeaturedProjects.tsx    # Project templates catalog grid
│   │   ├── Footer.tsx              # Marketplace footer links
│   │   ├── Hero.tsx                # Main banner & navigation links
│   │   ├── HowItWorks.tsx          # Stepwise buyer workflow guide
│   │   ├── PaymentSuccessModal.tsx # Post-checkout congratulations panel
│   │   ├── ProjectPlayground.tsx   # Code editor & viewport playground
│   │   ├── ProjectPreviewModal.tsx # Double-column templates details panel
│   │   └── WhatWeDeliver.tsx       # Core platform guarantees
│   ├── utils/
│   │   ├── downloadHelper.ts       # Mock ZIP source downloader
│   │   └── razorpayLoader.ts       # Razorpay checkout script installer
│   ├── firebase.ts         # Firebase initialization configuration
│   ├── App.tsx             # Main page app router and auth hooks
│   └── main.tsx            # DOM initialization entrypoint
├── firestore.rules         # Security rules configuration
├── package.json            # Dependency maps
└── vite.config.ts          # Build configuration & COOP server headers
```

---

## ⚙️ Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_... # Or rzp_test_... for sandbox mode
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## 🛡️ Firestore Security Rules Configuration

To enable safe data writing, update your rules inside the **Firebase Console → Firestore Database → Rules** tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Each user can read/write only their own document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Authenticated users can write purchases; only admins can list records
    match /transactions/{txId} {
      allow create: if request.auth != null;
      allow list, get: if request.auth != null 
        && request.auth.token.email == 'admin@codebazaar.com';
      allow update, delete: if false;
    }
  }
}
```
