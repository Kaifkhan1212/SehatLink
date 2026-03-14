import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { FileText, Calendar } from 'lucide-react';
import '../patient/PatientHome.css';

const Prescriptions = () => {
  const { doctors, consultations, prescriptions, currentUser } = useAppContext();
  
  // Prioritize real logged-in doctor's specific Firestore data
  const dbDoctor = doctors.find(d => d.id === currentUser?.id);
  const currentDoctor = currentUser ? { ...currentUser, ...(dbDoctor || {}) } : null;

  if (!currentDoctor) return <div className="page-container">Loading...</div>;
  
  const myPrescriptions = prescriptions.filter(p => {
     const consult = consultations.find(c => c.id === p.consultationId);
     return consult && consult.doctorId === currentDoctor.id;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Prescription History</h1>
        <p>Review all prescriptions you have issued to patients.</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {myPrescriptions.length > 0 ? (
          myPrescriptions.map(pres => {
            const consult = consultations.find(c => c.id === pres.consultationId);
            const patientName = consult ? consult.patientName : 'Unknown Patient';

            return (
              <Card key={pres.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
                  <h3 style={{ fontSize: '20px' }}>Patient: {patientName}</h3>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                    <Calendar size={18} /> {new Date(pres.date).toLocaleDateString()}
                  </span>
                </div>
                
                <div>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: 'var(--primary)' }}>
                    <FileText size={18} /> Prescribed Medicines:
                  </h4>
                  <ul style={{ paddingLeft: '24px', marginBottom: '16px', lineHeight: '1.6' }}>
                    {pres.medicines.map((med, idx) => (
                      <li key={idx} style={{ fontSize: '16px', fontWeight: '500' }}>{med}</li>
                    ))}
                  </ul>
                  
                  {pres.notes && (
                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 'bold' }}>Advice to Patient:</p>
                      <p style={{ fontSize: '16px', marginTop: '4px' }}>{pres.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        ) : (
          <Card>
            <p style={{ fontSize: '18px', textAlign: 'center', padding: '24px' }}>You have not issued any prescriptions yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
