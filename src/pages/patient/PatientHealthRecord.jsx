import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { User, Activity, Pill, AlertCircle, Download, WifiOff, Edit3, Save, X, CheckCircle } from 'lucide-react';
import { jsPDF } from 'jspdf';
import './PatientHome.css';

const PatientHealthRecord = () => {
  const { currentUser, healthRecords, prescriptions, consultations, isOffline, updateUserProfile } = useAppContext();
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    age: currentUser.age || '',
    bloodGroup: currentUser.bloodGroup || '',
    allergies: currentUser.allergies || '',
    chronicDiseases: currentUser.chronicDiseases || ''
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Keep edit form in sync with currentUser data
  React.useEffect(() => {
    setEditData({
      age: currentUser.age || '',
      bloodGroup: currentUser.bloodGroup || '',
      allergies: currentUser.allergies || '',
      chronicDiseases: currentUser.chronicDiseases || ''
    });
  }, [currentUser]);

  const userRecords = healthRecords.filter(r => r.patientId === currentUser.id);
  const userPrescriptions = prescriptions.filter(p => p.patientId === currentUser.id);

  const handleSave = async () => {
    await updateUserProfile(currentUser.id, editData);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // --- Header ---
    doc.setFillColor(5, 150, 105);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('SehatLink', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Patient Health Record', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 35);

    y = 55;

    // --- Patient Profile ---
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Patient Profile', 14, y);
    y += 10;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const profileData = [
      ['Name', currentUser.name || 'N/A'],
      ['Blood Group', currentUser.bloodGroup || 'Not provided'],
      ['Age', currentUser.age?.toString() || 'Not provided'],
      ['Allergies', currentUser.allergies || 'None recorded'],
      ['Chronic Diseases', currentUser.chronicDiseases || 'None recorded'],
    ];

    profileData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(value, 65, y);
      y += 8;
    });

    y += 8;

    // --- Prescriptions ---
    doc.setTextColor(5, 150, 105);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Past Prescriptions', 14, y);
    y += 10;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);

    if (userPrescriptions.length > 0) {
      userPrescriptions.forEach((pres, index) => {
        if (y > 260) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. Date: ${new Date(pres.date).toLocaleDateString()}`, 14, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`   Condition: ${pres.condition || 'N/A'}`, 14, y);
        y += 7;

        if (pres.medicines && pres.medicines.length > 0) {
          doc.text(`   Medicines: ${pres.medicines.join(', ')}`, 14, y);
          y += 7;
        }

        if (pres.notes) {
          doc.text(`   Notes: ${pres.notes}`, 14, y);
          y += 7;
        }
        y += 4;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No prescriptions found.', 14, y);
      y += 10;
    }

    y += 6;

    // --- Medical History ---
    if (y > 240) { doc.addPage(); y = 20; }

    doc.setTextColor(5, 150, 105);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Medical History', 14, y);
    y += 10;

    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);

    if (userRecords.length > 0) {
      userRecords.forEach((record, index) => {
        if (y > 260) { doc.addPage(); y = 20; }

        doc.setFont('helvetica', 'bold');
        doc.text(`${index + 1}. ${record.condition}`, 14, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`   Date: ${new Date(record.date).toLocaleDateString()}`, 14, y);
        y += 7;
        if (record.notes) {
          doc.text(`   Notes: ${record.notes}`, 14, y);
          y += 7;
        }
        y += 4;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No past medical records found.', 14, y);
    }

    // --- Footer ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('SehatLink — Connecting Care, Anywhere', 14, 290);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, 290);
    }

    doc.save(`SehatLink_Health_Record_${currentUser.name || 'Patient'}.pdf`);
  };

  return (
    <div className="page-container">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1>Health Records</h1>
          <p>Your complete medical profile.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setIsEditing(!isEditing)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: 'white', color: 'var(--primary)',
              border: '2px solid var(--primary)', borderRadius: '10px', cursor: 'pointer',
              fontSize: '15px', fontWeight: '600', transition: 'all 0.2s ease'
            }}
          >
            {isEditing ? <><X size={18} /> Cancel</> : <><Edit3 size={18} /> Edit Profile</>}
          </button>
          <button
            onClick={downloadPDF}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: 'var(--primary)', color: 'white',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontSize: '15px', fontWeight: '600',
              boxShadow: '0 2px 8px rgba(5,150,105,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Download size={18} /> Download PDF
          </button>
        </div>
      </header>

      {saveSuccess && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '14px 20px', marginBottom: '20px',
          background: 'var(--success)', color: 'white',
          borderRadius: '10px', fontWeight: '600', fontSize: '14px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          <CheckCircle size={18} />
          Profile updated successfully!
        </div>
      )}

      {isOffline && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '14px 20px', marginBottom: '20px',
          background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
          color: '#78350f', borderRadius: '10px',
          fontWeight: '600', fontSize: '14px',
          boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)'
        }}>
          <WifiOff size={20} />
          You are offline — viewing locally cached health records. Data will sync automatically when you reconnect.
        </div>
      )}

      {/* Patient Profile Details */}
      <Card style={{ marginBottom: '24px', background: isEditing ? 'white' : 'var(--primary)', color: isEditing ? 'var(--text-main)' : 'white', border: isEditing ? '2px solid var(--primary)' : 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <User size={40} color={isEditing ? 'var(--primary)' : 'white'} />
          <h2 style={{ margin: 0 }}>{currentUser.name}</h2>
        </div>
        
        {isEditing ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Input 
                label="Age" 
                type="number"
                value={editData.age} 
                onChange={(e) => setEditData({...editData, age: e.target.value})} 
                placeholder="Enter your age"
              />
              <Input 
                label="Blood Group" 
                value={editData.bloodGroup} 
                onChange={(e) => setEditData({...editData, bloodGroup: e.target.value})} 
                placeholder="e.g., A+, O-, etc."
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Allergies</label>
                <textarea 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }}
                  value={editData.allergies} 
                  onChange={(e) => setEditData({...editData, allergies: e.target.value})}
                  placeholder="List any allergies (e.g., Peanut, Latex)"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>Chronic Diseases</label>
                <textarea 
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }}
                  value={editData.chronicDiseases} 
                  onChange={(e) => setEditData({...editData, chronicDiseases: e.target.value})}
                  placeholder="List any chronic conditions (e.g., Diabetes, Asthma)"
                />
              </div>
            </div>
            <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button onClick={handleSave} style={{ minWidth: '150px' }}>
                <Save size={18} style={{ marginRight: '8px' }} /> Save Profile
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ opacity: 0.9 }}>Blood Group:</strong> 
                <span style={{ marginLeft: '8px', fontWeight: '600' }}>{currentUser.bloodGroup || 'Not provided'}</span>
              </div>
              <div>
                <strong style={{ opacity: 0.9 }}>Age:</strong> 
                <span style={{ marginLeft: '8px', fontWeight: '600' }}>{currentUser.age || 'Not provided'}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <strong style={{ opacity: 0.9 }}>Allergies:</strong> 
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{currentUser.allergies || 'None recorded'}</p>
              </div>
              <div>
                <strong style={{ opacity: 0.9 }}>Chronic Diseases:</strong> 
                <p style={{ margin: '4px 0 0 0', fontWeight: '500' }}>{currentUser.chronicDiseases || 'None recorded'}</p>
              </div>
            </div>
          </div>
        )}
      </Card>

      <div className="grid-2">
        {/* Past Prescriptions */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Pill className="text-secondary" /> Past Prescriptions
          </h2>
          {userPrescriptions.length > 0 ? (
            userPrescriptions.map(pres => {
              const consult = consultations?.find(c => c.id === pres.consultationId);
              const doctorName = consult?.doctorName || 'Unknown Doctor';
              return (
              <Card key={pres.id} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong>Date: {new Date(pres.date).toLocaleDateString()}</strong>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>By: {doctorName}</span>
                </div>
                <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
                  <strong>Medicines:</strong>
                  <ul style={{ margin: '8px 0 0 20px' }}>
                    {pres.medicines.map((med, idx) => (
                      <li key={idx}>{med}</li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })
          ) : (
            <Card><p>No prescriptions found.</p></Card>
          )}
        </div>

        {/* Medical History */}
        <div>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Activity className="text-primary" /> Medical History
          </h2>
          {userRecords.length > 0 ? (
            userRecords.map(record => (
              <Card key={record.id} style={{ marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '18px' }}>{record.condition}</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString()}</span>
                </div>
                {record.doctorName && (
                  <div style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                    By: {record.doctorName}
                  </div>
                )}
                <p>{record.notes}</p>
              </Card>
            ))
          ) : (
            <Card><p>No past medical records found.</p></Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHealthRecord;
