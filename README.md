<p align="center">
<img width="313" height="67" alt="logo hexoo" src="https://github.com/user-attachments/assets/85a2a61a-e4eb-4f35-8589-336a85bf1314" />
</p>


<p align="center">
  A modern social platform designed for seamless content sharing and community interaction.
</p>

---

## Overview

Hexoo is a web-based application that allows users to create posts, engage with others through likes and comments, and manage their personal profiles. The project focuses on providing a clean user interface and a secure environment, featuring built-in moderation tools and security measures such as rate limiting and content assessment.

## Technical Stack

The project is built using a modern full-stack architecture:

* **Frontend**: Next.js 16, React 19, Tailwind CSS 4
* **State Management**: Redux Toolkit & React Redux
* **Backend Services**: Firebase (Authentication, Firestore, Storage) & Firebase Admin SDK
* **Security & Moderation**: OpenAI API (Content Moderation), Google reCAPTCHA v3
* **Data Validation**: Zod
* **API Communication**: Axios

## Getting Started

### Prerequisites

* Node.js (latest LTS version)
* npm (comes with Node.js)
* A Firebase Project created in the Firebase Console

### Installation and Setup

1.  **Clone the repository**:
    ```bash
    git clone [https://github.com/your-username/hexoo.git](https://github.com/your-username/hexoo.git)
    cd hexoo
    ```

2.  **Install dependencies**:
    This will install all necessary packages, including Firebase and OpenAI SDKs:
    ```bash
    npm install
    ```

3.  **Firebase CLI (Optional)**:
    If you need to manage Firebase resources via terminal, install the Firebase CLI globally:
    ```bash
    npm install -g firebase-tools
    ```

### Environment Configuration

Before running the application, you must configure your Firebase credentials. Create a `.env.local` file in the root directory and fill it with your data based on the provided template:

```env
# Firebase Public Configuration
NEXT_PUBLIC_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Configuration (Server-side)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_admin_email
FIREBASE_PRIVATE_KEY=your_private_key

# Security and Services
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_site_key
RECAPTCHA_SECRET_KEY=your_secret_key
OPENAI_API_KEY=your_openai_api_key
