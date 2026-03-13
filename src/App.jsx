import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Footer from './components/layout/Footer';

const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PatientDashboard = lazy(() => import('./pages/patient/Dashboard'));
const DoctorDashboard = lazy(() => import('./pages/doctor/Dashboard'));
const PharmacyDashboard = lazy(() => import('./pages/pharmacy/Dashboard'));

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-container">
            <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px' }}>Loading...</div>}>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Default redirect to login */}
                <Route path="/" element={<Navigate to="/login" />} />

                {/* Protected Dashboards */}
                <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
                  <Route path="/patient-dashboard/*" element={<PatientDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                  <Route path="/doctor-dashboard/*" element={<DoctorDashboard />} />
                </Route>

                <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
                  <Route path="/pharmacy-dashboard/*" element={<PharmacyDashboard />} />
                </Route>
              </Routes>
            </Suspense>
            <Footer />
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
