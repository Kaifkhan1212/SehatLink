import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, onSnapshot, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import {
  mockPatients, mockDoctors, mockPharmacies, mockMedicines,
  initialConsultations, initialPrescriptions, initialHealthRecords,
  initialMessages
} from './mockData';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Base State (Start with mocked data so the UI doesn't break if Firestore is empty)
  const [patients, setPatients] = useState(mockPatients);
  const [doctors, setDoctors] = useState(mockDoctors);
  const [users, setUsers] = useState([]);
  const [pharmacies, setPharmacies] = useState(mockPharmacies);
  const [medicines, setMedicines] = useState(mockMedicines);

  // Dynamic State — initialize from localStorage cache if available for offline access
  const [consultations, setConsultations] = useState(initialConsultations);
  const [prescriptions, setPrescriptions] = useState(() => {
    try {
      const cached = localStorage.getItem('sehatlink_prescriptions');
      return cached ? JSON.parse(cached) : initialPrescriptions;
    } catch { return initialPrescriptions; }
  });
  const [healthRecords, setHealthRecords] = useState(() => {
    try {
      const cached = localStorage.getItem('sehatlink_healthRecords');
      return cached ? JSON.parse(cached) : initialHealthRecords;
    } catch { return initialHealthRecords; }
  });
  const [messages, setMessages] = useState(initialMessages || []);
  const [symptomChecks, setSymptomChecks] = useState([]);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Real authenticated user tracking
  const { currentUser: authUser, userData } = useAuth();

  // We construct a mock profile for the DB structure based on authUser 
  // and prioritize the custom 'name' we save in Firestore/Auth during registration.
  const currentUser = authUser ? {
    id: authUser.uid,
    name: userData?.name || authUser.displayName || 'TeleHealth User',
    email: authUser.email,
    age: userData?.age || 'N/A',
    bloodGroup: userData?.bloodGroup || 'N/A',
    allergies: userData?.allergies || 'None recorded',
    chronicDiseases: userData?.chronicDiseases || 'None recorded',
    role: userData?.role || 'patient'
  } : null;

  // Online/offline detection
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Cache currentUser profile to localStorage for offline access
  useEffect(() => {
    if (currentUser) {
      try {
        localStorage.setItem('sehatlink_currentUser', JSON.stringify(currentUser));
      } catch (e) { console.warn('Failed to cache user profile', e); }
    }
  }, [currentUser]);

  // Set up Firebase Real-Time Listeners
  useEffect(() => {
    const unsubPatients = onSnapshot(collection(db, 'patients'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setPatients(data);
    });

    const unsubDoctors = onSnapshot(collection(db, 'doctors'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setDoctors(data);
    });

    const unsubPharmacies = onSnapshot(collection(db, 'pharmacies'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setPharmacies(data);
    });

    const unsubMedicines = onSnapshot(collection(db, 'medicines'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) setMedicines(data);
    });

    const unsubAppointments = onSnapshot(collection(db, 'appointments'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Override initial mock data with Firestore data if it exists
      setConsultations(data);
    });

    const unsubPrescriptions = onSnapshot(collection(db, 'prescriptions'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPrescriptions(data);
      // Cache to localStorage for offline access
      try { localStorage.setItem('sehatlink_prescriptions', JSON.stringify(data)); } catch (e) {}
    });

    const unsubHistory = onSnapshot(collection(db, 'healthRecords'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHealthRecords(data);
      // Cache to localStorage for offline access
      try { localStorage.setItem('sehatlink_healthRecords', JSON.stringify(data)); } catch (e) {}
    });

    const unsubSymptomChecks = onSnapshot(collection(db, 'symptom_checks'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSymptomChecks(data);
    });

    const unsubMessages = onSnapshot(collection(db, 'messages'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort messages by timestamp
      data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setMessages(data);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });

    return () => {
      unsubPatients();
      unsubDoctors();
      unsubPharmacies();
      unsubMedicines();
      unsubAppointments();
      unsubPrescriptions();
      unsubHistory();
      unsubSymptomChecks();
      unsubMessages();
      unsubUsers();
    };
  }, []);

  // Actions Using Firebase

  const bookConsultation = async (doctorId, date, symptoms) => {
    const doctor = doctors.find(d => d.id === doctorId);
    const newConsultation = {
      patientId: currentUser.id,
      patientName: currentUser.name,
      doctorId: doctor ? doctor.id : doctorId,
      doctorName: doctor ? doctor.name : 'Unknown Doctor',
      date,
      status: 'Pending',
      symptoms,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'appointments'), newConsultation);
    } catch (error) {
      console.error('Error booking consultation: ', error);
    }
  };

  const updateConsultationStatus = async (id, status, extraFields = {}) => {
    // Check if the id is a temporary mock identifier or a firestore document id
    if (id.startsWith('c') && isNaN(parseInt(id.slice(1)))) {
      // local update for mock data
      setConsultations(consultations.map(c => c.id === id ? { ...c, status, ...extraFields } : c));
      return;
    }
    try {
      const docRef = doc(db, 'appointments', id);
      await updateDoc(docRef, { status, updatedAt: new Date().toISOString(), ...extraFields });
    } catch (error) {
      console.error('Error updating consultation status: ', error);
    }
  };

  const addPrescription = async (consultationId, patientId, condition, medicinesList, notes) => {
    const dateStr = new Date().toISOString().split('T')[0];

    const newPrescription = {
      consultationId,
      patientId,
      date: dateStr,
      medicines: medicinesList,
      notes,
      createdAt: new Date().toISOString()
    };

    const newHealthRecord = {
      patientId,
      date: dateStr,
      condition: condition || 'General Consultation',
      notes: notes,
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'prescriptions'), newPrescription);
      await addDoc(collection(db, 'healthRecords'), newHealthRecord);

      if (consultationId) {
        await updateConsultationStatus(consultationId, 'Completed');
      }
    } catch (error) {
      console.error('Error adding prescription: ', error);
    }
  };

  const updateMedicineStock = async (id, inStock) => {
    if (id.startsWith('m') && isNaN(parseInt(id.slice(1)))) {
      // local update for mock data
      setMedicines(medicines.map(m => m.id === id ? { ...m, inStock } : m));
      return;
    }
    try {
      const docRef = doc(db, 'medicines', id);
      await updateDoc(docRef, { inStock, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error updating medicine stock: ', error);
    }
  };

  const addMedicine = async (pharmacyId, name, price) => {
    const newMedicine = {
      pharmacyId,
      name,
      price,
      inStock: true,
      createdAt: new Date().toISOString()
    };
    try {
      await addDoc(collection(db, 'medicines'), newMedicine);
    } catch (error) {
      console.error('Error adding medicine: ', error);
    }
  };

  const sendMessage = async (consultationId, senderId, senderName, text) => {
    const newMessage = {
      consultationId,
      senderId,
      senderName,
      text,
      timestamp: new Date().toISOString(),
    };
    // Local optimistic update
    setMessages([...messages, { id: `msg-temp-${Date.now()}`, ...newMessage }]);
    
    try {
      await addDoc(collection(db, 'messages'), newMessage);
    } catch (error) {
      console.error('Error sending message: ', error);
    }
  };

  const saveSymptomCheck = async (symptomData) => {
    try {
      await addDoc(collection(db, 'symptom_checks'), {
        ...symptomData,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving symptom check: ', error);
    }
  };

  const createEmergencyConsultation = async (patientId, symptoms = 'Emergency request — immediate assistance needed.') => {
    const newEmergency = {
      patientId,
      patientName: currentUser?.name || 'Emergency Patient',
      date: new Date().toISOString().split('T')[0],
      symptoms,
      doctorId: null,
      status: 'Pending',
      isEmergency: true,
      createdAt: serverTimestamp()
    };
    try {
      await addDoc(collection(db, 'appointments'), newEmergency);
    } catch (error) {
      console.error('Error creating emergency consultation: ', error);
    }
  };

  const updateHealthRecord = async (recordId, updatedFields) => {
    try {
      const docRef = doc(db, 'healthRecords', recordId);
      await updateDoc(docRef, { ...updatedFields, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error updating health record:', error);
      // Fallback: update locally for mock data
      setHealthRecords(prev => prev.map(r => r.id === recordId ? { ...r, ...updatedFields } : r));
    }
  };

  const updatePrescription = async (prescriptionId, updatedFields) => {
    try {
      const docRef = doc(db, 'prescriptions', prescriptionId);
      await updateDoc(docRef, { ...updatedFields, updatedAt: new Date().toISOString() });
    } catch (error) {
      console.error('Error updating prescription:', error);
      setPrescriptions(prev => prev.map(p => p.id === prescriptionId ? { ...p, ...updatedFields } : p));
    }
  };

  const updateUserProfile = async (userId, updatedFields) => {
    try {
      // 1. Update primary users collection
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { ...updatedFields, updatedAt: new Date().toISOString() });

      // 2. Sync with role-specific collection (patients or doctors)
      const role = currentUser?.role;
      const dataToSync = { ...updatedFields, updatedAt: new Date().toISOString() };
      
      if (role === 'patient') {
        const patientRef = doc(db, 'patients', userId);
        await setDoc(patientRef, dataToSync, { merge: true });
      } else if (role === 'doctor') {
        const doctorRef = doc(db, 'doctors', userId);
        await setDoc(doctorRef, dataToSync, { merge: true });
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
    }
  };

  return (
    <AppContext.Provider value={{
      patients, doctors, pharmacies, medicines, currentUser, isOffline, users,
      consultations, prescriptions, healthRecords, messages, symptomChecks,
      bookConsultation, updateConsultationStatus, addPrescription, updateMedicineStock, addMedicine, sendMessage,
      saveSymptomCheck, createEmergencyConsultation, updateHealthRecord, updatePrescription, updateUserProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
