import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import { Stethoscope, Calendar, FileText, Pill, AlertTriangle, Search, BookOpen, Clock, UserCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './PatientHome.css';

const PatientHome = () => {
  const { t } = useTranslation();
  const { currentUser, healthRecords, consultations, doctors, createEmergencyConsultation } = useAppContext();
  const navigate = useNavigate();

  const userRecords = healthRecords.filter(r => r.patientId === currentUser.id);
  
  const handleEmergency = () => {
    const confirmMsg = "Are you sure you want to request an EMERGENCY consultation? Doctors will be alerted immediately.";
    if (window.confirm(confirmMsg)) {
      const symptoms = window.prompt("Please briefly describe your emergency symptoms (optional):", "Severe pain / Difficulty breathing");
      createEmergencyConsultation(currentUser.id, symptoms || undefined);
      alert("Emergency appointment created. Please wait for a doctor to connect.");
    }
  };

  // Get upcoming consultations
  const myConsultations = consultations.filter(c => c.patientId === currentUser.id);
  const upcomingConsultations = myConsultations.filter(c => c.status === 'Pending' || c.status === 'Approved');

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{t('welcomePrefix')}{currentUser.name}</h1>
        <p>{t('dashboardOverview')}</p>
      </header>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'stretch' }}>
        {/* Left Column: Action Cards */}
        <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Card onClick={() => navigate('/patient-dashboard/symptom-checker')} className="action-card bg-primary-light" style={{ margin: 0 }}>
            <Stethoscope size={48} className="text-primary" />
            <div className="action-text">
              <h3>{t('checkSymptomsAction')}</h3>
              <p>{t('checkSymptomsDesc')}</p>
            </div>
          </Card>

          <Card onClick={() => navigate('/patient-dashboard/bookings')} className="action-card bg-secondary-light" style={{ margin: 0 }}>
            <Calendar size={48} className="text-secondary" />
            <div className="action-text">
              <h3>{t('bookDoctorAction')}</h3>
              <p>{t('bookDoctorDesc')}</p>
            </div>
          </Card>
          
          <Card onClick={() => navigate('/patient-dashboard/medicine-search')} className="action-card bg-success-light" style={{ margin: 0 }}>
            <Search size={48} className="text-success" />
            <div className="action-text">
              <h3>{t('findMedicinesAction')}</h3>
              <p>{t('findMedicinesDesc')}</p>
            </div>
          </Card>
        </div>

        {/* Right Column: Doctor Image Placeholder */}
        <div style={{ flex: '1 1 35%', minWidth: '300px' }}>
          <Card style={{ height: '100%', margin: 0, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              height: '100%', 
              minHeight: '300px',
              backgroundImage: 'url("https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop")',
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0, 
                background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
                padding: '32px 24px 24px',
                color: 'white'
              }}>
                <h3 style={{ margin: 0, fontSize: '24px' }}>Expert Care, Anytime</h3>
                <p style={{ margin: '8px 0 0', opacity: 0.9 }}>Connect with qualified professionals from the comfort of your home.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="section mt-lg">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={24} className="text-primary" /> Available Doctors
        </h2>
        {doctors.length > 0 ? (
          <div style={{ 
            display: 'flex', gap: '20px', marginTop: '16px',
            overflowX: 'auto', paddingBottom: '12px',
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch'
          }}>
            {doctors.map((doc, index) => {
              const avatarPhotos = [
                'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=300&auto=format&fit=crop',
              ];
              return (
                <div 
                  key={doc.id}
                  style={{
                    background: 'white', borderRadius: '16px', overflow: 'hidden',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease', cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    minWidth: '270px', maxWidth: '300px', flexShrink: 0,
                    scrollSnapAlign: 'start'
                  }}
                  onClick={() => navigate('/patient-dashboard/bookings')}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.12)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'; }}
                >
                  {/* Doctor Photo */}
                  <div style={{
                    height: '200px',
                    backgroundImage: `url("${avatarPhotos[index % avatarPhotos.length]}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                    position: 'relative'
                  }}>
                    <span style={{
                      position: 'absolute', top: '12px', right: '12px',
                      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase',
                      padding: '4px 12px', borderRadius: '20px',
                      background: doc.available !== false ? '#059669' : '#ef4444',
                      color: 'white', letterSpacing: '0.5px'
                    }}>
                      {doc.available !== false ? '● Available' : '● Unavailable'}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px' }}>Dr. {doc.name}</h3>
                    <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '14px' }}>
                      {doc.specialization || doc.specialty || 'General Physician'}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px', color: '#9ca3af' }}>
                      <span>🎓 {doc.experience || '5+ Yrs'}</span>
                      <span>⭐ {doc.rating || '4.8'}</span>
                    </div>

                    <button style={{
                      width: '100%', padding: '10px',
                      background: 'linear-gradient(135deg, #059669, #047857)',
                      color: 'white', border: 'none', borderRadius: '8px',
                      fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                      transition: 'opacity 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      Book Appointment →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Card style={{ marginTop: '16px' }}>
            <p>No doctors registered yet.</p>
          </Card>
        )}
      </div>

      <div className="section mt-lg">
        <button 
          onClick={handleEmergency}
          style={{ width: '100%', padding: '24px', background: 'var(--danger)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.3)' }}
        >
          <AlertTriangle size={36} />
          {t('emergencyBtn')}
        </button>
      </div>

      <div className="section mt-lg">
        <h2>{t('healthSummaryTitle')}</h2>
        <Card style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
           <FileText size={32} className="text-primary" />
           <div style={{ flex: 1 }}>
             <h4>{t('recentHistoryTitle')}</h4>
             <p className="text-sm text-muted">
               {userRecords.length > 0 ? `${t('latestPrefix')}${userRecords[0].condition}${t('onText')}${new Date(userRecords[0].date).toLocaleDateString()}` : t('noRecentRecords')}
             </p>
           </div>
           <button 
             onClick={() => navigate('/patient-dashboard/records')}
             style={{ padding: '8px 16px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
             {t('viewAllBtn')}
           </button>
        </Card>
      </div>

      {/* Health Articles Section */}
      <div className="section mt-lg" style={{ marginBottom: '32px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <BookOpen size={24} className="text-secondary" /> Health Articles & Tips
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <Card 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '16px' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => window.open('https://en.wikipedia.org/wiki/Cardiovascular_disease', '_blank')}
          >
            <div style={{ height: '160px', borderRadius: '8px', marginBottom: '12px', background: 'url("https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500&auto=format&fit=crop") center/cover' }}></div>
            <h4 style={{ marginBottom: '8px' }}>5 Ways to Maintain Heart Health in Rural Areas</h4>
            <p className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 5 min read</p>
          </Card>
          <Card 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '16px' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => window.open('https://en.wikipedia.org/wiki/Allergic_rhinitis', '_blank')}
          >
            <div style={{ height: '160px', borderRadius: '8px', marginBottom: '12px', background: 'url("https://images.unsplash.com/photo-1584362917165-526a968579e8?w=500&auto=format&fit=crop") center/cover' }}></div>
            <h4 style={{ marginBottom: '8px' }}>Understanding Seasonal Allergies and Remedies</h4>
            <p className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 4 min read</p>
          </Card>
          <Card 
            style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: '16px' }} 
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'} 
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            onClick={() => window.open('https://en.wikipedia.org/wiki/Hand_washing', '_blank')}
          >
            <div style={{ height: '160px', borderRadius: '8px', marginBottom: '12px', background: 'url("https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=500&auto=format&fit=crop") center/cover' }}></div>
            <h4 style={{ marginBottom: '8px' }}>Importance of Hand Hygiene: A Complete Guide</h4>
            <p className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> 6 min read</p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientHome;
