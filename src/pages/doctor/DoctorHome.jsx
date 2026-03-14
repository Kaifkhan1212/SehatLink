import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import DoctorAvailabilityCard from '../../components/DoctorAvailabilityCard';
import { Users, FileText, CheckCircle, Clock, Settings } from 'lucide-react';
import Button from '../../components/ui/Button';
import '../patient/PatientHome.css'; // Reuse layout styles

const DoctorHome = () => {
  const { doctors, consultations, prescriptions, currentUser, updateUserProfile } = useAppContext();
  const navigate = useNavigate();
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    photoUrl: currentUser?.photoUrl || '',
    experience: currentUser?.experience || '10+ Yrs',
    rating: currentUser?.rating || '4.9'
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Prioritize real logged-in doctor's specific Firestore data
  const dbDoctor = doctors.find(d => d.id === currentUser?.id);
  const currentDoctor = currentUser ? { ...currentUser, ...(dbDoctor || {}) } : null;

  if (!currentDoctor) return <div className="page-container">Loading...</div>;

  const myConsultations = consultations.filter(c => c.doctorId === currentDoctor.id || (c.isEmergency && c.status === 'Pending'));
  const pendingConsultations = myConsultations.filter(c => c.status === 'Pending' || c.status === 'Approved');

  const myPrescriptions = prescriptions.filter(p => {
    const consult = consultations.find(c => c.id === p.consultationId);
    return consult && consult.doctorId === currentDoctor.id;
  });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      if (currentDoctor.id) {
        await updateUserProfile(currentDoctor.id, profileData);
        alert('Profile updated successfully!');
        setIsEditingProfile(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Welcome, {currentDoctor.name}</h1>
        <p>Overview of your appointments and patient records.</p>
      </header>

      <div style={{ marginBottom: '24px' }}>
        <DoctorAvailabilityCard doctor={currentDoctor} isEditable={true} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <Settings size={24} className="text-primary" /> Profile Settings
            </h2>
            <Button variant="outline" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              {isEditingProfile ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
          
          {isEditingProfile && (
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Photo URL</label>
                <input 
                  type="url" 
                  value={profileData.photoUrl}
                  onChange={e => setProfileData({...profileData, photoUrl: e.target.value})}
                  placeholder="https://example.com/my-photo.jpg"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
                <small className="text-muted">Direct link to an image. Leave blank to use default.</small>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Experience</label>
                  <input 
                    type="text" 
                    value={profileData.experience}
                    onChange={e => setProfileData({...profileData, experience: e.target.value})}
                    placeholder="e.g. 5+ Yrs"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>Star Rating</label>
                  <input 
                    type="number" 
                    step="0.1"
                    min="1"
                    max="5"
                    value={profileData.rating}
                    onChange={e => setProfileData({...profileData, rating: e.target.value})}
                    placeholder="e.g. 4.8"
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
              
              <Button type="submit" disabled={isSavingProfile}>
                {isSavingProfile ? 'Saving...' : 'Save Profile Details'}
              </Button>
            </form>
          )}
        </Card>
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
