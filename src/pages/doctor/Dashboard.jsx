import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import DoctorHome from './DoctorHome';
import Consultations from './Consultations';
import Prescriptions from './Prescriptions';
import { useAppContext } from '../../context/AppContext';

const DoctorHealthRecordView = lazy(() => import('./DoctorHealthRecordView'));
const ConsultationRoom = lazy(() => import('../shared/ConsultationRoom'));

const DoctorDashboard = () => {
  // In a real app we'd authenticate the doctor here
  return (
    <div className="dashboard doctor-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <Suspense fallback={<div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<DoctorHome />} />
            <Route path="/consultations" element={<Consultations />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/records-search" element={<DoctorHealthRecordView />} />
            <Route path="/consultation" element={<ConsultationRoom />} />
          </Routes>
        </Suspense>
      </div>
    </div>
  );
};

export default DoctorDashboard;
