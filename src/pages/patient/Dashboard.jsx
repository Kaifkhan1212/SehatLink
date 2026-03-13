import React, { Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import PatientHome from './PatientHome';
import { useAppContext } from '../../context/AppContext';

const PatientSymptomChecker = lazy(() => import('./PatientSymptomChecker'));
const Bookings = lazy(() => import('./Bookings'));
const PharmacyLocator = lazy(() => import('./PharmacyLocator'));
const PatientHealthRecord = lazy(() => import('./PatientHealthRecord'));
const MedicineSearch = lazy(() => import('./MedicineSearch'));
const ConsultationRoom = lazy(() => import('../shared/ConsultationRoom'));
const HealthChatbot = lazy(() => import('./HealthChatbot'));

const PatientDashboard = () => {
  const { currentUser } = useAppContext();

  // If no user context, we would normally show login here. 
  // For this mock, we assume patient is always logged in.

  return (
    <div className="dashboard patient-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<PatientHome />} />
            <Route path="/symptom-checker" element={<PatientSymptomChecker />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/pharmacies" element={<PharmacyLocator />} />
            <Route path="/records" element={<PatientHealthRecord />} />
            <Route path="/medicine-search" element={<MedicineSearch />} />
            <Route path="/consultation" element={<ConsultationRoom />} />
            <Route path="/health-assistant" element={<HealthChatbot />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default PatientDashboard;
