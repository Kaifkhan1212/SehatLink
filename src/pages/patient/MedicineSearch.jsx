import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Search, CheckCircle, XCircle, MapPin } from 'lucide-react';
import './PatientHome.css';

const MedicineSearch = () => {
  const { medicines, pharmacies } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const matchedMedicines = medicines.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase())
    );

    const enrichedResults = matchedMedicines.map(med => {
      const pharmacy = pharmacies.find(p => p.id === med.pharmacyId);
      return {
        ...med,
        pharmacyName: pharmacy ? pharmacy.name : 'Unknown Pharmacy'
      };
    });

    setResults(enrichedResults);
    setHasSearched(true);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Medicine Search</h1>
        <p>Check if a medicine is in stock at nearby pharmacies.</p>
      </header>

      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Enter medicine name (e.g., Paracetamol)" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ fontSize: '18px', padding: '16px' }}
            />
          </div>
          <Button type="submit" size="lg" style={{ minWidth: '120px' }}>
            <Search size={24} style={{ marginRight: '8px' }} /> Search
          </Button>
        </form>
      </Card>

      {hasSearched && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '20px' }}>Results for "{query}"</h2>
          {results.length > 0 ? (
            results.map((result, idx) => (
              <Card key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{result.name}</h3>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <MapPin size={18} /> {result.pharmacyName}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {result.inStock ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)', fontSize: '18px', fontWeight: 'bold' }}>
                      <CheckCircle size={24} /> In Stock
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontSize: '18px', fontWeight: 'bold' }}>
                      <XCircle size={24} /> Out of Stock
                    </div>
                  )}
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <p style={{ fontSize: '18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No medicines found. Please try a different name.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;
