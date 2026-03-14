import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Check, X, Package, Plus, Trash2 } from 'lucide-react';
import '../patient/PatientHome.css';

const Inventory = () => {
  const { medicines, pharmacies, updateMedicineStock, addMedicine, deleteMedicine } = useAppContext();
  const currentPharmacy = pharmacies[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedUses, setNewMedUses] = useState('');
  const [newMedPrice, setNewMedPrice] = useState('');

  const myMedicines = medicines.filter(m => m.pharmacyId === currentPharmacy.id);
  
  const filteredMedicines = myMedicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleStock = (id, currentStatus) => {
    updateMedicineStock(id, !currentStatus);
  };

  const handleAddMedicine = (e) => {
    e.preventDefault();
    if (newMedName.trim() && newMedPrice.trim()) {
      addMedicine(currentPharmacy.id, newMedName, newMedPrice, newMedUses);
      setNewMedName('');
      setNewMedUses('');
      setNewMedPrice('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Inventory Management</h1>
          <p>Update medicine availability so patients can view current stock.</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {showAddForm ? <X size={20} /> : <Plus size={20} />}
          {showAddForm ? 'Cancel' : 'Add New Medicine'}
        </Button>
      </header>

      {showAddForm && (
        <Card className="mb-lg" style={{ marginBottom: '24px', border: '2px solid var(--primary)' }}>
          <h2 style={{ marginBottom: '16px' }}>Add New Medicine</h2>
          <form onSubmit={handleAddMedicine} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <Input 
                label="Medicine Name" 
                placeholder="e.g., Aspirin 75mg" 
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 2 }}>
              <Input 
                label="Uses (Used For)" 
                placeholder="e.g., Pain relief, Fever" 
                value={newMedUses}
                onChange={(e) => setNewMedUses(e.target.value)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <Input 
                label="Price" 
                placeholder="e.g., ₹30" 
                value={newMedPrice}
                onChange={(e) => setNewMedPrice(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Save Medicine</Button>
          </form>
        </Card>
      )}

      <Card className="mb-lg" style={{ marginBottom: '24px' }}>
         <Input 
           label="Filter Medicines" 
           placeholder="Search your inventory..." 
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredMedicines.map(med => (
          <Card key={med.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: med.inStock ? 'var(--border-color)' : 'var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
               <div style={{ 
                 padding: '12px', 
                 borderRadius: '8px', 
                 backgroundColor: med.inStock ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' 
               }}>
                 <Package size={24} color={med.inStock ? 'var(--success)' : 'var(--danger)'} />
               </div>
               <div>
                 <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>{med.name}</h3>
                 <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '2px' }}>Used for: {med.uses || 'General Purpose'}</p>
                 <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Price: {med.price}</p>
               </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ 
                fontWeight: 'bold', 
                color: med.inStock ? 'var(--success)' : 'var(--danger)' 
              }}>
                {med.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              
              <Button 
                variant={med.inStock ? 'outline' : 'primary'}
                onClick={() => toggleStock(med.id, med.inStock)}
                style={{ 
                  backgroundColor: med.inStock ? 'transparent' : 'var(--success)',
                  color: med.inStock ? 'var(--danger)' : 'white',
                  borderColor: med.inStock ? 'var(--danger)' : 'transparent',
                  minWidth: '140px'
                }}
              >
                {med.inStock ? (
                  <><X size={18} /> Mark Out</>
                ) : (
                  <><Check size={18} /> Mark In Stock</>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this medicine?')) {
                    deleteMedicine(med.id);
                  }
                }}
                style={{
                  color: 'var(--danger)',
                  borderColor: 'var(--danger)',
                  padding: '8px 12px'
                }}
                title="Delete Medicine"
              >
                <Trash2 size={18} />
              </Button>
            </div>
          </Card>
        ))}
        {filteredMedicines.length === 0 && (
          <Card><p>No medicines found.</p></Card>
        )}
      </div>
    </div>
  );
};

export default Inventory;
