import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ChatInterface from '../../components/ui/ChatInterface';
import { User, Calendar, Phone, Edit, Check, X, MessageSquare, Upload, File, FileText, AlertTriangle } from 'lucide-react';
import '../patient/PatientHome.css';

const Consultations = () => {
  const navigate = useNavigate();
  const { users, patients, doctors, consultations, updateConsultationStatus, addPrescription, healthRecords, prescriptions, currentUser } = useAppContext();
  
  // Prioritize real logged-in doctor, fallback to mock data
  const defaultDoc = (doctors && doctors.length > 0) ? doctors[0] : { id: 'd1', name: 'Dr. Sarah Sharma' };
  const currentDoctor = currentUser ? { ...defaultDoc, ...currentUser } : defaultDoc;

  if (!currentDoctor) return <div className="page-container">Loading...</div>;

  const myConsultations = consultations.filter(c => c.doctorId === currentDoctor.id || (c.isEmergency && c.status === 'Pending'));

  const [activeTab, setActiveTab] = useState('pending');
  const [prescriptionForm, setPrescriptionForm] = useState(null);
  const [viewingPatientId, setViewingPatientId] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);

  // Prescription State
  const [condition, setCondition] = useState('');
  const [meds, setMeds] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const pending = myConsultations.filter(c => c.status === 'Pending');
  const approved = myConsultations.filter(c => c.status === 'Approved');
  const completed = myConsultations.filter(c => c.status === 'Completed');

  const getList = () => {
    if (activeTab === 'pending') return pending;
    if (activeTab === 'approved') return approved;
    return completed;
  };

  const handlePrescribe = (e) => {
    e.preventDefault();
    if (prescriptionForm && (condition || meds || notes || uploadedFile)) {
      const medicinesList = meds ? meds.split(',').map(m => m.trim()) : [];

      // In a real app, uploadedFile would be sent to a server. Here we mock it.
      const fileNoteString = uploadedFile ? `[Uploaded Prescription File: ${uploadedFile.name}] ` : '';

      addPrescription(prescriptionForm.id, prescriptionForm.patientId, condition, medicinesList, fileNoteString + notes);

      setPrescriptionForm(null);
      setCondition('');
      setMeds('');
      setNotes('');
      setUploadedFile(null);
      setActiveTab('completed');
    }
  };

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const togglePatientHistory = (patientId) => {
    if (viewingPatientId === patientId) {
      setViewingPatientId(null);
    } else {
      setViewingPatientId(patientId);
    }
  };

  const getPatientHistory = (patientId) => {
    const pHistory = healthRecords.filter(r => r.patientId === patientId);
    const pPrescriptions = prescriptions.filter(p => p.patientId === patientId);
    // Find patient in global users first, fallback to specific lists
    const patientProfile = users.find(u => u.id === patientId) || patients.find(p => p.id === patientId) || doctors.find(d => d.id === patientId);
    return { records: pHistory, prescriptions: pPrescriptions, profile: patientProfile };
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Consultation Management</h1>
        <p>Review patient requests and manage active video calls.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '2px solid var(--border-color)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveTab('pending')}
          style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: activeTab === 'pending' ? 'bold' : 'normal', color: activeTab === 'pending' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          Pending ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: activeTab === 'approved' ? 'bold' : 'normal', color: activeTab === 'approved' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          Approved ({approved.length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{ background: 'none', border: 'none', fontSize: '18px', fontWeight: activeTab === 'completed' ? 'bold' : 'normal', color: activeTab === 'completed' ? 'var(--primary)' : 'var(--text-muted)' }}
        >
          Completed ({completed.length})
        </button>
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {getList().length > 0 ? (
            getList().map(consult => (
              <Card key={consult.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: consult.isEmergency ? 'var(--danger)' : 'inherit' }}>
                    <User size={20} className={consult.isEmergency ? "text-danger" : "text-secondary"} />
                    {consult.patientName || 'Emergency Patient'}
                    {consult.isEmergency && <span style={{ background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', marginLeft: '8px', display: 'flex', alignItems: 'center' }}><AlertTriangle size={12} style={{ marginRight: '4px' }} />EMERGENCY</span>}
                  </h3>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    {consult.date ? new Date(consult.date).toLocaleDateString() : (consult.createdAt?.toDate ? consult.createdAt.toDate().toLocaleDateString() : 'Today')}
                  </span>
                </div>
                <div style={{ backgroundColor: 'var(--bg-color)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>Reported Symptoms:</p>
                  <p>{consult.symptoms}</p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => togglePatientHistory(consult.patientId)}
                  style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FileText size={16} /> {viewingPatientId === consult.patientId ? 'Hide Patient History' : 'View Patient History'}
                </Button>

                {viewingPatientId === consult.patientId && (
                  <div style={{ backgroundColor: 'rgba(5, 150, 105, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                    {/* Patient Profile Summary */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid rgba(5, 150, 105, 0.1)' }}>
                      <div><strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>BLOOD GROUP</strong><div style={{ fontWeight: 'bold' }}>{getPatientHistory(consult.patientId).profile?.bloodGroup || 'N/A'}</div></div>
                      <div><strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>AGE</strong><div style={{ fontWeight: 'bold' }}>{getPatientHistory(consult.patientId).profile?.age || 'N/A'}</div></div>
                      <div><strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ALLERGIES</strong><div style={{ fontWeight: 'bold', fontSize: '13px' }}>{getPatientHistory(consult.patientId).profile?.allergies || 'None'}</div></div>
                      <div><strong style={{ fontSize: '12px', color: 'var(--text-muted)' }}>CHRONIC</strong><div style={{ fontWeight: 'bold', fontSize: '13px' }}>{getPatientHistory(consult.patientId).profile?.chronicDiseases || 'None'}</div></div>
                    </div>

                    <h4 style={{ marginBottom: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Patient Medical History</h4>
                    {getPatientHistory(consult.patientId).records.length > 0 ? (
                      <ul style={{ paddingLeft: '20px', fontSize: '14px', marginBottom: '12px' }}>
                        {getPatientHistory(consult.patientId).records.map(rec => (
                          <li key={rec.id}>{new Date(rec.date).toLocaleDateString()}: {rec.condition} - {rec.notes}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>No recorded history.</p>
                    )}

                    <h4 style={{ marginBottom: '8px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>Past Prescriptions</h4>
                    {getPatientHistory(consult.patientId).prescriptions.length > 0 ? (
                      <ul style={{ paddingLeft: '20px', fontSize: '14px' }}>
                        {getPatientHistory(consult.patientId).prescriptions.map(p => (
                          <li key={p.id}>{new Date(p.date).toLocaleDateString()}: {p.medicines.join(', ')}</li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>No past prescriptions.</p>
                    )}
                  </div>
                )}

                {/* Actions based on status */}
                {consult.status === 'Pending' && (
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button onClick={() => updateConsultationStatus(consult.id, 'Approved', { doctorId: currentDoctor.id, doctorName: currentDoctor.name })} fullWidth style={{ backgroundColor: 'var(--success)' }}>
                      <Check size={18} /> Approve
                    </Button>
                    <Button onClick={() => updateConsultationStatus(consult.id, 'Cancelled')} variant="outline" fullWidth style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                      <X size={18} /> Decline
                    </Button>
                  </div>
                )}

                {consult.status === 'Approved' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Button onClick={() => navigate('/doctor-dashboard/consultation', { state: { consultation: consult, isDoctor: true } })} fullWidth style={{ flex: '1 1 45%', backgroundColor: 'var(--secondary)' }}>
                        <Phone size={18} /> Start Audio Call
                      </Button>
                      <Button
                        variant={activeChatId === consult.id ? "primary" : "outline"}
                        fullWidth
                        style={{ flex: '1 1 45%' }}
                        onClick={() => setActiveChatId(activeChatId === consult.id ? null : consult.id)}
                      >
                        <MessageSquare size={18} /> {activeChatId === consult.id ? 'Close Chat' : 'Text Chat (Low Bandwidth)'}
                      </Button>
                    </div>

                    {activeChatId === consult.id && (
                      <div style={{ marginTop: '16px', marginBottom: '8px' }}>
                        <ChatInterface consultationId={consult.id} currentUserId={currentDoctor.id} />
                      </div>
                    )}

                    <Button onClick={() => setPrescriptionForm(consult)} fullWidth>
                      <Edit size={18} /> Add Medical Notes & Complete
                    </Button>
                  </div>
                )}
              </Card>
            ))
          ) : (
            <Card><p>No {activeTab} consultations found.</p></Card>
          )}
        </div>

        {/* Dynamic Prescription Side Panel */}
        {prescriptionForm && (
          <Card style={{ border: '2px solid var(--primary)' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit size={24} /> Add Medical Notes & Prescribe
            </h2>
            <p style={{ marginBottom: '16px', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '8px' }}>
              <strong>Patient:</strong> {prescriptionForm.patientName}<br />
              <strong>Symptoms:</strong> {prescriptionForm.symptoms}
            </p>

            <form onSubmit={handlePrescribe} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <Input
                  label="Diagnosis / Condition"
                  placeholder="e.g., Viral Fever, Hypertension"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Medicines (optional, comma separated)</label>
                <textarea
                  value={meds}
                  onChange={(e) => setMeds(e.target.value)}
                  placeholder="e.g., Paracetamol 500mg, Amoxicillin"
                  rows="2"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Upload Prescription File (optional)</label>
                <div
                  style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => fileInputRef.current.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  {uploadedFile ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--success)' }}>
                      <File size={20} /> <span>{uploadedFile.name}</span>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Upload size={24} style={{ marginBottom: '8px' }} /><br />
                      Click to upload a PDF or Image prescription
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Medical Notes & Advice</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Patient diagnosed with viral fever. Advised bed rest for 3 days."
                  rows="4"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <Button type="button" variant="outline" onClick={() => { setPrescriptionForm(null); setUploadedFile(null); }} fullWidth>Cancel</Button>
                <Button type="submit" disabled={!condition && !meds && !notes && !uploadedFile} fullWidth>Save & Complete</Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Consultations;
