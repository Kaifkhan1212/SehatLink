import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import PharmacyHome from './PharmacyHome';
import Inventory from './Inventory';

const PharmacyDashboard = () => {
  return (
    <div className="dashboard pharmacy-dashboard">
      <Navbar />
      <div className="dashboard-content">
        <Routes>
          <Route path="/" element={<PharmacyHome />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </div>
    </div>
  );
};

export default PharmacyDashboard;
