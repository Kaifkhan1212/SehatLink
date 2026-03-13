import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import DoctorAvailabilityCard from '../../components/DoctorAvailabilityCard';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import '../patient/PatientHome.css'; // Reuse layout styles

const DoctorHome = () => {
  const { doctors, consultations, prescriptions, currentUser } = useAppContext();
  const navigate = useNavigate();

  // Prioritize real logged-in doctor, fallback to mock data
  const defaultDoc = (doctors && doctors.length > 0) ? doctors[0] : { id: 'd1', name: 'Dr. Sarah Sharma' };
  const currentDoctor = currentUser ? { ...defaultDoc, ...currentUser } : defaultDoc;

  if (!currentDoctor) return <div className="page-container">Loading...</div>;

  const myConsultations = consultations.filter(c => c.doctorId === currentDoctor.id || (c.isEmergency && c.status === 'Pending'));
  const pendingConsultations = myConsultations.filter(c => c.status === 'Pending' || c.status === 'Approved');

  const myPrescriptions = prescriptions.filter(p => {
    const consult = consultations.find(c => c.id === p.consultationId);
    return consult && consult.doctorId === currentDoctor.id;
  });

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Welcome, {currentDoctor.name}</h1>
        <p>Overview of your appointments and patient records.</p>
      </header>

      <div style={{ marginBottom: '24px' }}>
        <DoctorAvailabilityCard doctor={currentDoctor} isEditable={true} />
      </div>

      <div className="grid-2 mb-lg">
        <Card onClick={() => navigate('/doctor-dashboard/consultations')} className="action-card bg-primary-light">
          <Users size={48} className="text-primary" />
          <div className="action-text">
            <h3>{pendingConsultations.length} Active Consultations</h3>
            <p>View and manage patient requests.</p>
          </div>
        </Card>

        <Card onClick={() => navigate('/doctor-dashboard/prescriptions')} className="action-card bg-secondary-light">
          <FileText size={48} className="text-secondary" />
          <div className="action-text">
            <h3>{myPrescriptions.length} Prescriptions Issued</h3>
            <p>Review past prescriptions and notes.</p>
          </div>
        </Card>
      </div>

      <div className="section mt-lg">
        <h2>Today's Schedule</h2>
        {pendingConsultations.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            {pendingConsultations.map(consult => (
              <Card key={consult.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', fontSize: '20px', color: 'var(--text-muted)'
                  }}>
                    {(consult.patientName || 'E').charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '18px' }}>{consult.patientName || 'Emergency Patient'}</h4>
                    <p className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {new Date(consult.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div>
                  {consult.status === 'Pending' ? (
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>Pending Approval</span>
                  ) : (
                    <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle size={18} /> Approved
                    </span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card style={{ marginTop: '16px' }}>
            <p>No appointments pending for today.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DoctorHome;
