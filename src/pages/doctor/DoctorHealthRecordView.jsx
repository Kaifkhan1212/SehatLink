import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { Search, User, FileText, Pill, Activity, Edit3, Save, X, CheckCircle } from 'lucide-react';
import '../patient/PatientHome.css';

const DoctorHealthRecordView = () => {
  const { patients, healthRecords, prescriptions, consultations, currentUser, updateHealthRecord, updatePrescription } = useAppContext();
  const [query, setQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Editing state
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editCondition, setEditCondition] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const [editingPrescriptionId, setEditingPrescriptionId] = useState(null);
  const [editMedicines, setEditMedicines] = useState('');
  const [editPresNotes, setEditPresNotes] = useState('');

  const [saveSuccess, setSaveSuccess] = useState(null);

  // Check if the current doctor has an appointment with this patient
  const isDoctorAssigned = (patientId) => {
    return consultations.some(
      c => c.patientId === patientId && c.doctorId === currentUser?.id
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Search by name (case-insensitive)
    const patientMatches = patients.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
    
    if (patientMatches.length > 0) {
      setSelectedPatient(patientMatches[0]);
    } else {
      setSelectedPatient('NOT_FOUND');
    }
    setEditingRecordId(null);
    setEditingPrescriptionId(null);
    setSaveSuccess(null);
  };

  const getPatientHistory = (patientId) => {
    return healthRecords.filter(r => r.patientId === patientId);
  };

  const getPatientPrescriptions = (patientId) => {
    return prescriptions.filter(p => p.patientId === patientId);
  };

  // Start editing a health record
  const startEditRecord = (record) => {
    setEditingRecordId(record.id);
    setEditCondition(record.condition || '');
    setEditNotes(record.notes || '');
    setEditingPrescriptionId(null);
  };

  const cancelEditRecord = () => {
    setEditingRecordId(null);
    setEditCondition('');
    setEditNotes('');
  };

  const saveEditRecord = async () => {
    await updateHealthRecord(editingRecordId, {
      condition: editCondition,
      notes: editNotes
    });
    setEditingRecordId(null);
    setSaveSuccess('record');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  // Start editing a prescription
  const startEditPrescription = (pres) => {
    setEditingPrescriptionId(pres.id);
    setEditMedicines(pres.medicines ? pres.medicines.join(', ') : '');
    setEditPresNotes(pres.notes || '');
    setEditingRecordId(null);
  };

  const cancelEditPrescription = () => {
    setEditingPrescriptionId(null);
    setEditMedicines('');
    setEditPresNotes('');
  };

  const saveEditPrescription = async () => {
    const medicinesList = editMedicines.split(',').map(m => m.trim()).filter(m => m);
    await updatePrescription(editingPrescriptionId, {
      medicines: medicinesList,
      notes: editPresNotes
    });
    setEditingPrescriptionId(null);
    setSaveSuccess('prescription');
    setTimeout(() => setSaveSuccess(null), 3000);
  };

  const assigned = selectedPatient && selectedPatient !== 'NOT_FOUND' ? isDoctorAssigned(selectedPatient.id) : false;

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Patient Records Tracker</h1>
        <p>Search, review, and edit patient medical history for your assigned patients.</p>
      </header>

      <Card style={{ marginBottom: '24px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <Input 
              placeholder="Search by Patient Name..." 
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

      {saveSuccess && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '14px 20px', marginBottom: '16px',
          background: 'var(--success)', color: 'white',
          borderRadius: '10px', fontWeight: '600', fontSize: '14px',
          animation: 'fadeInScroll 0.3s ease-out'
        }}>
          <CheckCircle size={18} />
          {saveSuccess === 'record' ? 'Health record updated successfully!' : 'Prescription updated successfully!'}
        </div>
      )}

      {selectedPatient === 'NOT_FOUND' && (
        <Card>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '18px' }}>
            No patient found with that name.
          </p>
        </Card>
      )}

      {selectedPatient && selectedPatient !== 'NOT_FOUND' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Patient Header */}
          <Card style={{ background: 'var(--primary)', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <User size={40} />
              <div>
                <h2 style={{ margin: 0 }}>{selectedPatient.name}</h2>
                {assigned ? (
                  <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '20px', marginTop: '6px', display: 'inline-block' }}>
                    ✅ Your Patient — Editing Enabled
                  </span>
                ) : (
                  <span style={{ fontSize: '13px', background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: '20px', marginTop: '6px', display: 'inline-block' }}>
                    🔒 View Only — Not your assigned patient
                  </span>
                )}
              </div>
            </div>
            
            <div className="grid-2" style={{ gap: '12px' }}>
              <div><strong>Age:</strong> {selectedPatient.age || 'N/A'}</div>
              <div><strong>Blood Group:</strong> {selectedPatient.bloodGroup || 'N/A'}</div>
              <div><strong>Allergies:</strong> {selectedPatient.allergies || 'None'}</div>
              <div><strong>Chronic Diseases:</strong> {selectedPatient.chronicDiseases || 'None'}</div>
            </div>
          </Card>

          <div className="grid-2">
            {/* Medical History */}
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Activity className="text-primary" /> Diagnosed Conditions
              </h2>
              {getPatientHistory(selectedPatient.id).length > 0 ? (
                getPatientHistory(selectedPatient.id).map(record => (
                  <Card key={record.id} style={{ marginBottom: '16px', borderLeft: '4px solid var(--primary)' }}>
                    {editingRecordId === record.id ? (
                      /* --- Editing Mode --- */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <Input 
                          label="Condition" 
                          value={editCondition}
                          onChange={(e) => setEditCondition(e.target.value)}
                        />
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Notes</label>
                          <textarea
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            rows="3"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '15px', resize: 'vertical' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button onClick={saveEditRecord} size="sm">
                            <Save size={16} style={{ marginRight: '4px' }} /> Save
                          </Button>
                          <Button onClick={cancelEditRecord} variant="outline" size="sm">
                            <X size={16} style={{ marginRight: '4px' }} /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* --- View Mode --- */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <strong style={{ fontSize: '18px' }}>{record.condition}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>{new Date(record.date).toLocaleDateString()}</span>
                            {assigned && (
                              <button 
                                onClick={() => startEditRecord(record)}
                                style={{ 
                                  background: 'var(--primary)', color: 'white', border: 'none', 
                                  borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                                  display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600'
                                }}
                              >
                                <Edit3 size={14} /> Edit
                              </button>
                            )}
                          </div>
                        </div>
                        <p>{record.notes}</p>
                      </>
                    )}
                  </Card>
                ))
              ) : (
                <Card><p>No records found.</p></Card>
              )}
            </div>

            {/* Prescriptions */}
            <div>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Pill className="text-secondary" /> Previous Prescriptions
              </h2>
              {getPatientPrescriptions(selectedPatient.id).length > 0 ? (
                getPatientPrescriptions(selectedPatient.id).map(pres => (
                  <Card key={pres.id} style={{ marginBottom: '16px' }}>
                    {editingPrescriptionId === pres.id ? (
                      /* --- Editing Mode --- */
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Medicines (comma separated)</label>
                          <textarea
                            value={editMedicines}
                            onChange={(e) => setEditMedicines(e.target.value)}
                            rows="3"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '15px' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Notes</label>
                          <textarea
                            value={editPresNotes}
                            onChange={(e) => setEditPresNotes(e.target.value)}
                            rows="2"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '15px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <Button onClick={saveEditPrescription} size="sm">
                            <Save size={16} style={{ marginRight: '4px' }} /> Save
                          </Button>
                          <Button onClick={cancelEditPrescription} variant="outline" size="sm">
                            <X size={16} style={{ marginRight: '4px' }} /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      /* --- View Mode --- */
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                          <div><strong>Date:</strong> {new Date(pres.date).toLocaleDateString()}</div>
                          {assigned && (
                            <button 
                              onClick={() => startEditPrescription(pres)}
                              style={{ 
                                background: 'var(--secondary, #6366f1)', color: 'white', border: 'none', 
                                borderRadius: '6px', padding: '6px 12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600'
                              }}
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                          )}
                        </div>
                        <div style={{ background: 'var(--bg-color)', padding: '12px', borderRadius: '8px' }}>
                          <strong>Medicines:</strong>
                          <ul style={{ margin: '8px 0 0 20px' }}>
                            {pres.medicines.map((med, idx) => (
                              <li key={idx}>{med}</li>
                            ))}
                          </ul>
                          {pres.notes && <p style={{ marginTop: '8px', color: 'var(--text-muted)' }}><strong>Notes:</strong> {pres.notes}</p>}
                        </div>
                      </>
                    )}
                  </Card>
                ))
              ) : (
                <Card><p>No prescriptions found.</p></Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorHealthRecordView;
