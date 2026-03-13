import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import DoctorAvailabilityCard from '../../components/DoctorAvailabilityCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ChatInterface from '../../components/ui/ChatInterface';
import { Video, Calendar, User, Clock, MessageSquare, X, CreditCard, ShieldCheck } from 'lucide-react';
import './PatientHome.css'; // Reusing layout styles

const Bookings = () => {
  const navigate = useNavigate();
  const { doctors, consultations, currentUser, bookConsultation } = useAppContext();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const myConsultations = consultations.filter(c => c.patientId === currentUser.id);

  const handleBooking = (e) => {
    e.preventDefault();
    if (selectedDoctor && date && symptoms) {
      setShowPaymentModal(true);
    }
  };

  const confirmPaymentAndBook = () => {
    setIsProcessingPayment(true);
    
    // Simulate payment processing delay (1.5 seconds)
    setTimeout(() => {
      bookConsultation(selectedDoctor, date, symptoms);
      setShowPaymentModal(false);
      setIsProcessingPayment(false);
      setShowSuccess(true);
      setDate('');
      setSymptoms('');
      setSelectedDoctor(null);
      setTimeout(() => setShowSuccess(false), 4000);
    }, 1500);
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Book Doctor Consultation</h1>
        <p>Connect with a doctor via video call or at the local clinic.</p>
      </header>

      {showSuccess && (
        <div style={{ padding: '16px', background: 'var(--success)', color: 'white', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} /> Payment successful! Consultation booked. The doctor will review your request shortly.
        </div>
      )}

      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
              <CreditCard size={24} className="text-secondary" /> Secure Checkout
            </h2>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '8px' }}>Consultation Fee</p>
              <h3 style={{ fontSize: '24px', color: 'var(--text-main)' }}>₹250</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <Input label="Card Number" placeholder="XXXX XXXX XXXX XXXX" maxLength={16} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input label="Expiry (MM/YY)" placeholder="MM/YY" maxLength={5} />
                <Input label="CVV" placeholder="123" type="password" maxLength={3} />
              </div>
              <Input label="Cardholder Name" placeholder="Full Name" />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="outline" fullWidth onClick={() => setShowPaymentModal(false)} disabled={isProcessingPayment}>Cancel</Button>
              <Button fullWidth onClick={confirmPaymentAndBook} disabled={isProcessingPayment}>
                {isProcessingPayment ? 'Processing...' : 'Pay ₹250'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {/* Booking Form */}
        <Card>
          <h2 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={24} /> New Appointment
          </h2>
          <form onSubmit={handleBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Doctor</label>
              <select 
                value={selectedDoctor || ''} 
                onChange={(e) => setSelectedDoctor(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px' }}
                required
              >
                <option value="" disabled>Choose a doctor...</option>
                {doctors.map(doc => (
                  <option key={doc.id} value={doc.id}>{doc.name} - {doc.specialization || doc.specialty || 'General Physician'}</option>
                ))}
              </select>
            </div>
            
            {selectedDoctor && (
              <DoctorAvailabilityCard doctor={doctors.find(d => d.id === selectedDoctor)} isEditable={false} />
            )}
            
            <Input 
              label="Preferred Date" 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
              min={new Date().toISOString().split('T')[0]}
            />
            
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Reason for visit / Symptoms</label>
              <textarea
                 value={symptoms}
                 onChange={(e) => setSymptoms(e.target.value)}
                 required
                 rows="3"
                 style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid var(--border-color)', fontSize: '16px', resize: 'vertical' }}
              />
            </div>

            <Button type="submit" size="lg" fullWidth>Request Consultation</Button>
          </form>
        </Card>

        {/* Existing Consultations */}
        <div>
          <h2 style={{ marginBottom: '16px' }}>Your Appointments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myConsultations.length > 0 ? (
              myConsultations.map(consult => (
                <Card key={consult.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <User size={20} className="text-primary"/> {consult.doctorName}
                    </h3>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '14px', 
                      fontWeight: '600',
                      backgroundColor: consult.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: consult.status === 'Completed' ? 'var(--success)' : '#d97706'
                    }}>
                      {consult.status}
                    </span>
                  </div>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}>
                    <Clock size={16} /> {new Date(consult.date).toLocaleDateString()}
                  </p>
                  <p style={{ marginTop: '8px', fontSize: '14px' }}><strong>Reason:</strong> {consult.symptoms}</p>
                  
                  {consult.status === 'Approved' && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                       <Button 
                         variant="secondary" 
                         fullWidth 
                         style={{ display: 'flex', justifyContent: 'center' }}
                         onClick={() => navigate('/patient-dashboard/consultation', { state: { consultation: consult, isDoctor: false } })}
                       >
                         <Video size={18} /> Join Video Call
                       </Button>
                       <Button 
                         variant={activeChatId === consult.id ? "primary" : "outline"} 
                         fullWidth 
                         style={{ display: 'flex', justifyContent: 'center' }}
                         onClick={() => setActiveChatId(activeChatId === consult.id ? null : consult.id)}
                       >
                         {activeChatId === consult.id ? <><X size={18}/> Close Chat</> : <><MessageSquare size={18} /> Start Text Chat (Low Data)</>}
                       </Button>
                       
                       {activeChatId === consult.id && (
                         <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                           <ChatInterface consultationId={consult.id} currentUserId={currentUser.id} />
                         </div>
                       )}
                     </div>
                  )}
                </Card>
              ))
            ) : (
              <Card><p>No appointments scheduled.</p></Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bookings;
