# SehatLink — Connecting Care, Anywhere 🩺

SehatLink is a premium TeleHealth platform designed to bridge the gap between rural patients and specialized medical care. It features a robust, offline-capable architecture and a professional medical aesthetic tailored for high-stakes healthcare environments.

## ✨ Key Features

### 📡 Offline-First Health Records
*   **Real-time Synchronization**: Powered by Firebase Firestore `onSnapshot` for instant data updates across all devices.
*   **Local Caching**: Uses `localStorage` to ensure patient health records and prescriptions are accessible even without an active internet connection.
*   **Offline Indicators**: Visual banners alert users when they are viewing cached data or when their connection is lost.

### 🏥 Advanced Consultation Flow
*   **Emergency SOS**: A dedicated emergency button that prompts for symptoms and alerts doctors immediately.
*   **Role-Based Dashboards**: Customized experiences for Patients (Discovery/Booking) and Doctors (Management/Consultation).
*   **Integrated Communication**: Real-time text chat (for low bandwidth) and integrated Video/Audio call controls.
*   **Interactive Doctor Discovery**: A flashcard-style, horizontally scrollable carousel for patients to discover available specialists.

### 📝 Medical Record Management
*   **Health Profile Customization**: Patients can securely manage their Age, Blood Group, Allergies, and Chronic Conditions.
*   **Doctor-Managed Prescriptions**: Doctors can add medical notes, prescribe medicines, and attach physical prescription photos. Doctors' names are persisted with the prescriptions they write.
*   **Chat History Persistence**: Conversations saved natively and viewable even after a consultation has been marked "Completed."
*   **Automated PDF Reports**: High-quality, branded PDF generation for health records including patient profiles and medical history using `jsPDF`.

### 💊 Pharmacy Portal
*   **Inventory Tracking**: Pharmacists can add new medicines (including price and what it is `Used For`), update stock status, and permanently delete unavailable medicines.
*   **Dynamic Local Demand**: Advanced analytics algorithm that continuously calculates and displays the most highly sought-after medicines in the region based on a rolling history of doctors' prescriptions.

### 🎨 Premium Medical Aesthetics
*   **Professional UI**: A custom-designed theme featuring a subtle stethoscope SVG background pattern and ambient medical blurs.
*   **Modern Navbar**: A sophisticated, animated navigation bar with intuitive role-based links and interactive logout buttons.

## 🛠️ Technology Stack
*   **Frontend**: [React.js](https://reactjs.org/) & [Vite](https://vitejs.dev/)
*   **Database**: [Google Firebase Firestore](https://firebase.google.com/docs/firestore)
*   **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) (Email/Google)
*   **Styling**: Vanilla CSS (Premium Custom Design) & [Lucide Icons](https://lucide.dev/)
*   **Utilities**: [jsPDF](https://github.com/parallax/jsPDF) (PDF Generation), [React Router](https://reactrouter.com/) (Navigation)

## 🚀 Getting Started

### Prerequisites
*   Node.js (v16.x or higher)
*   npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-link>
   cd SehatLink
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Setup Environment Variables:
   Create a `.env` file in the root directory and add your Firebase configurations:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_FIREBASE_AUTH_DOMAIN=your_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 📱 Mobile Responsiveness
SehatLink is fully responsive, optimized for both desktop browsers and mobile devices, ensuring that users in rural areas can access care on any hardware they have available.

## ⚠️ Troubleshooting

### AI Service (403/404/429 Errors)
*   **Model Name**: Ensure you are using `gemini-2.5-flash`.
*   **429 Error (Too Many Requests)**: You have reached the free tier limit of the Gemini API. Wait about 1-2 minutes before sending another message.
*   **API Key**: Verify your `VITE_GEMINI_API_KEY` in `.env` is valid and active in the [Google AI Studio](https://aistudio.google.com/).
*   **Ad-blockers**: Some ad-blockers block requests to `generativelanguage.googleapis.com`. Disable them for this site.

### Firebase Connection Issues
*   **ERR_BLOCKED_BY_CLIENT**: Usually caused by ad-blockers (uBlock, AdBlock, Brave Shield). Disable them for the site.
*   **Offline Access**: If you see an offline banner, you are viewing cached data. Check your internet connection to sync new data.

