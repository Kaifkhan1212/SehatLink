import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Store, MapPin, Phone, Search, CheckCircle, XCircle } from 'lucide-react';
import './PatientHome.css';

const PharmacyLocator = () => {
  const { pharmacies, medicines } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter medicines based on search
  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Find Medicines & Pharmacies</h1>
        <p>Check availability of medicines at nearby village dispensaries.</p>
      </header>

      <Card className="mb-lg" style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <Input 
              label="Search Medicine" 
              placeholder="e.g., Paracetamol, ORS..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
          </div>
        </div>
      </Card>

      <div className="grid-2">
        {/* Pharmacies List */}
        <div>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Store size={24} /> Nearby Pharmacies
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pharmacies.map(pharm => (
              <Card key={pharm.id}>
                <h3>{pharm.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', color: 'var(--text-muted)' }}>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={18} /> {pharm.location}
                  </p>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={18} /> {pharm.phone}
                  </p>
                </div>
                <Button variant="outline" fullWidth style={{ marginTop: '16px' }}>Get Directions</Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Medicine Results */}
        <div>
          <h2 style={{ marginBottom: '16px' }}>Medicine Availability</h2>
          {searchTerm ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredMedicines.length > 0 ? (
                filteredMedicines.map(med => {
                  const pharm = pharmacies.find(p => p.id === med.pharmacyId);
                  
                  return (
                    <Card key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {med.name} 
                        </h3>
                        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Price: {med.price}</p>
                        
                        {pharm && (
                          <div style={{ marginTop: '8px', padding: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', display: 'inline-block' }}>
                            <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{pharm.name}</p>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <MapPin size={12} /> {pharm.location}
                            </p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: med.inStock ? 'var(--success)' : 'var(--danger)' }}>
                         {med.inStock ? (
                           <><CheckCircle size={20} /> In Stock</>
                         ) : (
                           <><XCircle size={20} /> Out of Stock</>
                         )}
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card><p>No medicines found matching your search.</p></Card>
              )}
            </div>
          ) : (
            <Card style={{ textAlign: 'center', padding: '32px' }}>
               <Search size={48} color="var(--border-color)" style={{ margin: '0 auto 16px' }} />
               <p style={{ color: 'var(--text-muted)', fontSize: '18px' }}>Type a medicine name to check availability.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyLocator;
