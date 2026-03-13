import React from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { FileText, Calendar, Activity, Pill, User, Phone, MapPin, Clock } from 'lucide-react';
import './PatientHome.css';

const HealthRecords = () => {
  const { currentUser, healthRecords, prescriptions, consultations } = useAppContext();

  const userRecords = healthRecords.filter(r => r.patientId === currentUser.id);
  const userPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);
  const pastConsultations = consultations.filter(c => c.patientId === currentUser.id && c.status === 'Completed');

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Digital Health Records</h1>
        <p>Your complete medical history and digital prescriptions.</p>
      </header>

      {/* Personal Details Profile Card */}
      <Card style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', color: 'white' }}>
        <div style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%' }}>
          <User size={48} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{currentUser.name}</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', opacity: 0.9 }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><strong>Age:</strong> {currentUser.age || 'N/A'}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Phone size={16}/> {currentUser.phone}</p>
          </div>
        </div>
      </Card>

      <div className="grid-2">
        {/* Prescriptions Section */}
        <div>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Pill size={24} className="text-secondary" /> Recent Prescriptions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {userPrescriptions.length > 0 ? (
              userPrescriptions.map(pres => {
                const consult = consultations.find(c => c.id === pres.consultationId);
                const doctorName = consult ? consult.doctorName : 'Unknown Doctor';

                return (
                  <Card key={pres.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '18px' }}>{doctorName}</h3>
                      <span style={{ color: 'var(--text-muted)' }}>{new Date(pres.date).toLocaleDateString()}</span>
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
                      <p style={{ fontWeight: '600', marginBottom: '4px' }}>Medicines:</p>
                      <ul style={{ paddingLeft: '20px', marginBottom: '8px' }}>
                        {pres.medicines.map((med, idx) => (
                          <li key={idx}>{med}</li>
                        ))}
                      </ul>
                      {pres.notes && (
                        <>
                          <p style={{ fontWeight: '600', marginBottom: '4px', marginTop: '12px' }}>Doctor's Advice:</p>
                          <p>{pres.notes}</p>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card><p>No prescriptions found.</p></Card>
            )}
          </div>
        </div>

        {/* Medical History Section */}
        <div>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={24} className="text-primary" /> Diagnosed Conditions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
            {userRecords.length > 0 ? (
              userRecords.map(record => (
                <Card key={record.id} style={{ borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Activity size={18} className="text-danger" /> {record.condition}
                    </h3>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>{record.notes}</p>
                </Card>
              ))
            ) : (
              <Card><p>No past medical records found.</p></Card>
            )}
          </div>

          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} className="text-dark" /> Past Consultations
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pastConsultations.length > 0 ? (
              pastConsultations.map(consult => (
                <Card key={consult.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '18px' }}>{consult.doctorName}</h3>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                      <Clock size={14} /> {new Date(consult.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}><strong>Reported:</strong> {consult.symptoms}</p>
                </Card>
              ))
            ) : (
              <Card><p>No past consultations found.</p></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthRecords;
