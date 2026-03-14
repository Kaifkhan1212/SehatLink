# SehatLink - Platform Workflow & User Journey

This document explains the core workflows and how the three main roles (Patient, Doctor, Pharmacist) interact within the SehatLink ecosystem.

## 1. The Consultation Workflow
**From Booking to Health Record**

1. **Patient Discovery**: A patient logs in and views the "Patient Dashboard". They browse the horizontal carousel of available doctors (General Physicians, Pediatricians, etc.).
2. **Booking**: The patient selects a doctor, chooses a date, enters their symptoms, and clicks "Confirm Booking".
3. **Doctor Review**: The doctor logs into the "Doctor Dashboard" and sees the new `Pending` appointment.
4. **Approval**: The doctor reviews the patient's medical history/allergies and clicks "Approve" (or "Decline"). 
5. **Connecting**: Once `Approved`, both the Patient and Doctor dashboards update instantly. The Patient can now see the Doctor's name and gain access to the **Join Video Call** and **Start Text Chat** buttons.
6. **Consultation**: The doctor and patient conduct the appointment via chat or video. 
7. **Prescription**: The doctor clicks "Add Medical Notes & Complete". They fill out the diagnosis, prescribe medicines, and add notes.
8. **Completion**: Submitting the prescription automatically marks the consultation as `Completed`. The active video call button is removed, but the "View Chat History" remains accessible.
9. **Records**: The prescription and doctor's notes are permanently added to the patient's "Past Prescriptions" and "Medical History" tabs for future reference.

## 2. The Emergency SOS Workflow
**Immediate Care Routing**

1. **Emergency Trigger**: A patient clicks the red "Emergency SOS" button.
2. **Global Broadcast**: An appointment is created with `doctorId` set to `null` and marked as `isEmergency: true`. It appears on the Patient dashboard as "Waiting for Doctor...".
3. **Doctor Alert**: The emergency request pops up on the dashboards of all available doctors as a high-priority alert.
4. **Claiming**: The first available doctor to click "Approve" permanently assigns themselves to that emergency appointment.
5. **Connection**: The patient's dashboard instantly updates with the claiming doctor's name, and the standard consultation flow (call, chat, prescribe) begins immediately.

## 3. The Pharmacy & Inventory Workflow
**Managing Local Stock and Demand**

1. **Inventory Management**: A pharmacist logs into the "Pharmacy Portal". They can add new medicines (setting name, price, and "Used For" indications).
2. **Stock Toggling**: As real-world stock fluctuates, the pharmacist toggles items "In Stock" or "Out of Stock". They can also permanently delete discontinued items.
3. **Dynamic Local Demand**: The pharmacist dashboard constantly analyzes recent prescriptions written by doctors in the platform. It algorithmically determines which medicines are most frequently prescribed and displays alerts (e.g., "High demand for Paracetamol and ORS this week") to help pharmacists anticipate restock needs.
4. **Patient Search**: Patients can use the "Medicine Search" on their dashboard to find out which local pharmacies have their prescribed medicines currently in-stock.

## Data Persistence & Offline Capabilities
*   **Real-time Sync**: Actions like sending a chat message or approving an appointment use `onSnapshot` to instantly push UI updates to all connected clients without needing a page refresh.
*   **Offline Mode**: Critical data (like the patient's Health Records and Prescriptions) are seamlessly cached to `localStorage`. If a patient attempts to view their records while disconnected from the internet, SehatLink loads the local cache and displays a yellow warning banner so they still have access to their critical medical data.
