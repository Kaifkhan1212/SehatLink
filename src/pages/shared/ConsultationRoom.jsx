import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Activity, User, Edit, Camera } from 'lucide-react';
import '../patient/PatientHome.css';

const ConsultationRoom = () => {
  const { healthRecords, addPrescription } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { consultation, isDoctor } = location.state || {};

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [stream, setStream] = useState(null);

  // Prescription Form State (For Doctors Only)
  const [condition, setCondition] = useState('');
  const [meds, setMeds] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionSaved, setPrescriptionSaved] = useState(false);

  const localVideoRef = useRef(null);

  // Start webcam stream
  useEffect(() => {
    if (!consultation) return;

    let localStream = null;

    const startCamera = async () => {
      try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.error('Camera access denied or unavailable:', err);
      }
    };

    startCamera();

    // Call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => {
      clearInterval(timer);
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [consultation]);

  // Toggle audio mute
  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  // Toggle video on/off
  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  if (!consultation) {
    return (
      <div className="page-container">
        <Card>
          <h2>No active consultation found.</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  const patientHistory = healthRecords.filter(r => r.patientId === consultation.patientId);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  const handleEndCall = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate(-1);
  };

  const handlePrescribe = (e) => {
    e.preventDefault();
    if (condition || meds || notes) {
      const medicinesList = meds ? meds.split(',').map(m => m.trim()) : [];
      addPrescription(consultation.id, consultation.patientId, condition, medicinesList, notes);
      setPrescriptionSaved(true);
      setTimeout(() => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        navigate(-1);
      }, 2000);
    }
  };

  return (
    <div className="page-container" style={{ padding: '0 16px' }}>
      <header className="page-header" style={{ marginBottom: '16px' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity className={consultation.isEmergency ? "text-danger" : "text-primary"} /> 
          {consultation.isEmergency ? 'Emergency Video Call' : 'Video Consultation'}
        </h1>
        <p>Live Video Connection</p>
      </header>

      <div className={isDoctor ? "grid-2" : ""} style={{ gap: '24px' }}>
        
        {/* Left Side: Video Call UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Main Video Area */}
          <Card style={{ background: '#0f172a', color: 'white', textAlign: 'center', padding: '0', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
            
            {/* Remote Video (Doctor/Patient) - Placeholder since no WebRTC peer */}
            <div style={{
              width: '100%',
              minHeight: '400px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {/* Waiting for remote peer indicator */}
              <div style={{
                width: '100px', height: '100px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(255,255,255,0.15)',
                marginBottom: '16px'
              }}>
                <User size={48} color="rgba(255,255,255,0.4)" />
              </div>
              <h3 style={{ fontSize: '20px', marginBottom: '4px', color: 'rgba(255,255,255,0.9)' }}>
                {isDoctor ? consultation.patientName : `Dr. ${consultation.doctorName}`}
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>Waiting for peer to join...</p>

              {/* Local Video (Self - Picture-in-Picture style) */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '180px',
                height: '135px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.2)',
                background: '#000',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                {/* Always keep video element mounted so stream stays connected */}
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ 
                    width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)',
                    display: isVideoOff ? 'none' : 'block'
                  }}
                />
                {isVideoOff && (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: '#1e293b',
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '12px',
                    gap: '6px'
                  }}>
                    <VideoOff size={24} />
                    Camera Off
                  </div>
                )}
                <span style={{
                  position: 'absolute', bottom: '6px', left: '8px',
                  fontSize: '11px', color: 'white', background: 'rgba(0,0,0,0.6)',
                  padding: '2px 8px', borderRadius: '4px'
                }}>You</span>
              </div>
            </div>

            {/* Call Info Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '12px', gap: '12px', background: 'rgba(0,0,0,0.3)'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '14px', color: '#34d399', fontWeight: '600'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', animation: 'pulse 1.5s infinite' }}></span>
                Live
              </span>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>•</span>
              <span style={{ fontSize: '16px', color: 'white', fontWeight: '600', fontVariantNumeric: 'tabular-nums' }}>{formatTime(callDuration)}</span>
            </div>

            {/* Control Buttons */}
            <div style={{
              display: 'flex', justifyContent: 'center', gap: '16px',
              padding: '20px', background: '#111827'
            }}>
              {/* Mic Toggle */}
              <button 
                onClick={toggleMute}
                title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
                style={{ 
                  width: '72px', height: '72px', borderRadius: '50%', border: 'none', 
                  background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.12)', 
                  color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isMuted ? <MicOff size={32} /> : <Mic size={32} />}
              </button>

              {/* Video Toggle */}
              <button 
                onClick={toggleVideo}
                title={isVideoOff ? 'Turn On Camera' : 'Turn Off Camera'}
                style={{ 
                  width: '72px', height: '72px', borderRadius: '50%', border: 'none', 
                  background: isVideoOff ? '#ef4444' : 'rgba(255,255,255,0.12)', 
                  color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {isVideoOff ? <VideoOff size={32} /> : <Video size={32} />}
              </button>

              {/* End Call */}
              <button 
                onClick={handleEndCall}
                title="End Call"
                style={{ 
                  width: '72px', height: '72px', borderRadius: '50%', border: 'none', 
                  background: '#ef4444', color: 'white', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <PhoneOff size={32} />
              </button>
            </div>
          </Card>

          {isDoctor && (
             <Card>
               <h3 style={{ marginBottom: '12px' }}>Patient History Snapshot</h3>
               {patientHistory.length > 0 ? (
                 <ul style={{ paddingLeft: '20px' }}>
                   {patientHistory.slice(0, 3).map(rec => (
                     <li key={rec.id} style={{ marginBottom: '8px' }}>
                       <strong>{rec.condition}</strong> - {rec.notes}
                     </li>
                   ))}
                 </ul>
               ) : (
                 <p className="text-muted">No past records to show.</p>
               )}
             </Card>
          )}

        </div>

        {/* Right Side: Prescription Form (Doctors Only) */}
        {isDoctor && (
          <Card style={{ border: '2px solid var(--primary)', height: 'fit-content' }}>
            <h2 style={{ marginBottom: '16px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit size={24} /> Issue Prescription
            </h2>
            
            {prescriptionSaved ? (
               <div style={{ padding: '24px', textAlign: 'center', background: 'var(--success-light)', borderRadius: '8px', color: 'var(--success)' }}>
                 <h3>Prescription Saved Successfully!</h3>
                 <p>Closing call automatically...</p>
               </div>
            ) : (
              <form onSubmit={handlePrescribe} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <Input 
                    label="Diagnosis / Condition" 
                    placeholder="e.g., Viral Fever" 
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Medicines (comma separated)</label>
                  <textarea
                    value={meds}
                    onChange={(e) => setMeds(e.target.value)}
                    placeholder="e.g., Paracetamol 500mg, Amoxicillin"
                    rows="3"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Advice / Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Rest for 3 days."
                    rows="3"
                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px' }}
                  />
                </div>

                <Button type="submit" size="lg" fullWidth>Complete Consultation & Save</Button>
              </form>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default ConsultationRoom;
