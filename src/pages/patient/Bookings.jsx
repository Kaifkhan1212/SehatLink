import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import Card from '../../components/ui/Card';
import DoctorAvailabilityCard from '../../components/DoctorAvailabilityCard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import ChatInterface from '../../components/ui/ChatInterface';
import { Video, Calendar, User, Clock, MessageSquare, X, CreditCard, ShieldCheck, Star } from 'lucide-react';
import './PatientHome.css'; // Reusing layout styles

const Bookings = () => {
  const navigate = useNavigate();
  const { doctors, consultations, currentUser, bookConsultation, deleteConsultation, rateDoctor, updateConsultationStatus } = useAppContext();
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [date, setDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const myConsultations = consultations.filter(c => c.patientId === currentUser.id);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !date || !symptoms) return;

    setIsProcessingPayment(true);

    const res = await loadRazorpayScript();
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      setIsProcessingPayment(false);
      return;
    }

    try {
      const result = await fetch('http://localhost:3001/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 250 }),
      });

      if (!result.ok) {
        throw new Error('Network response was not ok');
      }

      const order = await result.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'SehatLink Clinic',
        description: 'Consultation Fee',
        order_id: order.id,
        handler: function (response) {
          bookConsultation(selectedDoctor, date, symptoms, 'Pending');
          setIsProcessingPayment(false);
          setShowSuccess(true);
          setDate('');
          setSymptoms('');
          setSelectedDoctor(null);
          setTimeout(() => setShowSuccess(false), 4000);
        },
        prefill: {
          name: currentUser?.name || 'Patient',
          email: currentUser?.email || 'patient@example.com',
          contact: currentUser?.phone || '',
        },
        theme: {
          color: '#0ea5e9',
        },
        modal: {
          ondismiss: function () {
            setIsProcessingPayment(false);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Error initiating payment');
      setIsProcessingPayment(false);
    }
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

            <Button type="submit" size="lg" fullWidth disabled={isProcessingPayment}>
              {isProcessingPayment ? 'Processing...' : 'Request Consultation (₹250)'}
            </Button>
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
                      <User size={20} className="text-primary"/> {consult.doctorName || 'Waiting for Doctor...'}
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
                  
                  {(consult.status === 'Approved' || consult.status === 'Completed') && (
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                       {consult.status === 'Approved' && (
                         <Button 
                           variant="secondary" 
                           fullWidth 
                           style={{ display: 'flex', justifyContent: 'center' }}
                           onClick={() => navigate('/patient-dashboard/consultation', { state: { consultation: consult, isDoctor: false } })}
                         >
                           <Video size={18} /> Join Video Call
                         </Button>
                       )}
                       <Button 
                         variant={activeChatId === consult.id ? "primary" : "outline"} 
                         fullWidth 
                         style={{ display: 'flex', justifyContent: 'center' }}
                         onClick={() => setActiveChatId(activeChatId === consult.id ? null : consult.id)}
                       >
                         {activeChatId === consult.id ? <><X size={18}/> Close Chat</> : <><MessageSquare size={18} /> {consult.status === 'Completed' ? 'View Chat History' : 'Start Text Chat (Low Data)'}</>}
                       </Button>
                       
                       {activeChatId === consult.id && (
                         <div style={{ marginTop: '8px', marginBottom: '8px' }}>
                           <ChatInterface consultationId={consult.id} currentUserId={currentUser.id} />
                         </div>
                       )}
                     </div>
                  )}

                  {(consult.status === 'Pending' || consult.status === 'Approved') && (
                    <div style={{ marginTop: '12px' }}>
                      <Button 
                        variant="outline" 
                        fullWidth 
                        style={{ display: 'flex', justifyContent: 'center', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        onClick={() => {
                          if(window.confirm('Are you sure you want to cancel this appointment?')){
                            deleteConsultation(consult.id);
                          }
                        }}
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  )}

                  {(consult.status === 'Completed' && !consult.isRated) && (
                    <div style={{ marginTop: '16px', padding: '12px', backgroundColor: 'var(--bg-color)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>Rate Your Experience</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[...Array(5)].map((_, index) => {
                          const ratingValue = index + 1;
                          return (
                            <button
                              key={ratingValue}
                              type="button"
                              onClick={() => {
                                rateDoctor(consult.doctorId, ratingValue);
                                updateConsultationStatus(consult.id, 'Completed', { isRated: true });
                                alert('Thank you for your rating!');
                              }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              <Star size={24} fill="var(--text-muted)" color="var(--text-muted)" onMouseOver={(e) => {e.currentTarget.setAttribute('fill', '#f59e0b');e.currentTarget.setAttribute('color', '#f59e0b')}} onMouseOut={(e) => {e.currentTarget.setAttribute('fill', 'var(--text-muted)');e.currentTarget.setAttribute('color', 'var(--text-muted)')}} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {(consult.status === 'Completed' && consult.isRated) && (
                    <div style={{ marginTop: '12px' }}>
                      <span style={{ fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ShieldCheck size={16} /> Rating Submitted
                      </span>
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
