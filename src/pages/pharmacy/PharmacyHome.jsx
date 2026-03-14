import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { Store, Package, TrendingUp } from 'lucide-react';
import '../patient/PatientHome.css';

const PharmacyHome = () => {
  const { pharmacies, medicines, prescriptions } = useAppContext();
  const navigate = useNavigate();

  // Mocking logged in pharmacy
  const currentPharmacy = pharmacies[0] || { name: 'Pharmacy' };
  
  const inStock = medicines.filter(m => m.inStock).length;
  const outOfStock = medicines.length - inStock;

  // Calculate local demand from actual prescriptions
  const getLocalDemandMessage = () => {
    if (!prescriptions || prescriptions.length === 0) return "Monitoring local prescription trends...";
    
    const medCounts = {};
    prescriptions.forEach(p => {
      if (p.medicines && Array.isArray(p.medicines)) {
        p.medicines.forEach(med => {
          // Normalize to lowercase to group properly, but try to keep capitalized for display
          const normalized = med.trim();
          if (normalized) {
            medCounts[normalized] = (medCounts[normalized] || 0) + 1;
          }
        });
      }
    });

    const sortedMeds = Object.entries(medCounts)
       .sort((a, b) => b[1] - a[1])
       .map(entry => entry[0]);

    if (sortedMeds.length === 0) return "Monitoring local prescription trends...";
    
    const topMeds = sortedMeds.slice(0, 2);
    if (topMeds.length === 1) {
      return `High demand for ${topMeds[0]} based on recent prescriptions.`;
    } else {
      return `High demand for ${topMeds[0]} and ${topMeds[1]} based on recent prescriptions.`;
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Welcome, {currentPharmacy.name}</h1>
        <p>Manage your medicine inventory and view local demand.</p>
      </header>

      <div className="grid-2 mb-lg">
        <Card onClick={() => navigate('/pharmacy-dashboard/inventory')} className="action-card bg-primary-light">
          <Package size={48} className="text-primary" />
          <div className="action-text">
            <h3>Inventory Status</h3>
            <p>{inStock} items in stock, {outOfStock} items out of stock.</p>
          </div>
        </Card>

        <Card className="action-card bg-secondary-light">
          <TrendingUp size={48} className="text-secondary" />
          <div className="action-text">
            <h3>Local Demand</h3>
            <p>{getLocalDemandMessage()}</p>
          </div>
        </Card>
      </div>
      
      <div className="section mt-lg">
         <h2>Quick Restock Alerts</h2>
         {outOfStock > 0 ? (
           <Card style={{ marginTop: '16px', borderLeft: '4px solid var(--danger)' }}>
             <h3 style={{ color: 'var(--danger)' }}>Action Required</h3>
             <p>You have {outOfStock} medicines out of stock. Please head to the Inventory page to update their availability once restocked.</p>
           </Card>
         ) : (
           <Card style={{ marginTop: '16px', borderLeft: '4px solid var(--success)' }}>
             <h3 style={{ color: 'var(--success)' }}>All Good!</h3>
             <p>All essential medicines are currently marked as in-stock.</p>
           </Card>
         )}
      </div>
    </div>
  );
};

export default PharmacyHome;
