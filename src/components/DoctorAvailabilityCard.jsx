import React, { useState } from 'react';
import Card from './ui/Card';
import Button from './ui/Button';
import { db } from '../config/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

const DoctorAvailabilityCard = ({ doctor, isEditable = false }) => {
  const [isAvailable, setIsAvailable] = useState(doctor.isAvailable !== false);
  const [nextAvailableSlot, setNextAvailableSlot] = useState(doctor.nextAvailableSlot || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (doctor.id) {
        const docRef = doc(db, 'doctors', doctor.id);
        await updateDoc(docRef, {
          isAvailable,
          nextAvailableSlot
        });
      }
    } catch (err) {
      console.error('Error updating availability', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card style={{ border: isAvailable ? '2px solid var(--success)' : '2px solid var(--border-color)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Dr. {doctor.name.replace('Dr. ', '')}</h3>
            <p className="text-sm text-muted">{doctor.specialization || doctor.specialty || 'General Physician'}</p>
          </div>
          <div>
            {isAvailable ? (
               <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <CheckCircle size={18} /> Available Now
               </span>
            ) : (
               <span style={{ color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <XCircle size={18} /> Busy
               </span>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', borderTop: '1px solid var(--border-color)', borderBottom: isEditable ? '1px solid var(--border-color)' : 'none' }}>
           <Clock size={16} className="text-primary"/>
           <strong>Next Slot:</strong> {nextAvailableSlot || (isAvailable ? 'Right now' : 'Not scheduled')}
        </div>

        {isEditable && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={isAvailable} 
                onChange={(e) => setIsAvailable(e.target.checked)} 
                style={{ width: '18px', height: '18px' }}
              />
              <span>I am currently available for consultations</span>
            </label>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label className="text-sm" style={{ fontWeight: 'bold' }}>Next Available Time (e.g. "4:30 PM"):</label>
              <input 
                type="text" 
                value={nextAvailableSlot}
                onChange={(e) => setNextAvailableSlot(e.target.value)}
                placeholder="e.g. 5:00 PM Tomorrow"
                style={{
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  width: '100%'
                }}
              />
            </div>
            
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Update Availability'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default DoctorAvailabilityCard;
