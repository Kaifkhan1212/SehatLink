import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { Store, Package, TrendingUp } from 'lucide-react';
import '../patient/PatientHome.css';

const PharmacyHome = () => {
  const { pharmacies, medicines } = useAppContext();
  const navigate = useNavigate();

  // Mocking logged in pharmacy
  const currentPharmacy = pharmacies[0];
  
  const inStock = medicines.filter(m => m.inStock).length;
  const outOfStock = medicines.length - inStock;

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
            <p>High demand for Paracetamol and ORS this week.</p>
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
