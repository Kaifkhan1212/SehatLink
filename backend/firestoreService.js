import { db } from './firebaseConfig.js';

/**
 * Patient Record Functions
 */

export const createPatientRecord = async (patientData) => {
  try {
    const docRef = await db.collection('patients').add({
      ...patientData,
      createdAt: new Date().toISOString()
    });
    console.log(`Successfully created patient record with ID: ${docRef.id}`);
    return { id: docRef.id, ...patientData };
  } catch (error) {
    console.error('Error creating patient record:', error);
    throw new Error('Failed to create patient record');
  }
};

export const getPatientRecords = async (patientId = null) => {
  try {
    if (patientId) {
      const doc = await db.collection('patients').doc(patientId).get();
      if (!doc.exists) {
        throw new Error('Patient not found');
      }
      return { id: doc.id, ...doc.data() };
    } else {
      const snapshot = await db.collection('patients').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error('Error retrieving patient record(s):', error);
    throw new Error('Failed to retrieve patient record(s)');
  }
};

/**
 * Consultation/Appointment Functions
 */

export const storeConsultationData = async (consultationData) => {
  try {
    const docRef = await db.collection('appointments').add({
      ...consultationData,
      createdAt: new Date().toISOString()
    });
    console.log(`Successfully stored consultation with ID: ${docRef.id}`);
    return { id: docRef.id, ...consultationData };
  } catch (error) {
    console.error('Error storing consultation data:', error);
    throw new Error('Failed to store consultation data');
  }
};

/**
 * Prescription Functions
 */

export const storePrescription = async (prescriptionData) => {
  try {
    const docRef = await db.collection('prescriptions').add({
      ...prescriptionData,
      createdAt: new Date().toISOString()
    });
    console.log(`Successfully stored prescription with ID: ${docRef.id}`);
    return { id: docRef.id, ...prescriptionData };
  } catch (error) {
    console.error('Error storing prescription:', error);
    throw new Error('Failed to store prescription');
  }
};

/**
 * Pharmacy & Medicine Functions
 */

export const updatePharmacyMedicineStock = async (medicineId, updateData) => {
  try {
    const medRef = db.collection('medicines').doc(medicineId);
    await medRef.update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    console.log(`Successfully updated medicine stock for ID: ${medicineId}`);
    return true;
  } catch (error) {
    console.error('Error updating medicine stock:', error);
    throw new Error('Failed to update medicine stock');
  }
};

export const createMedicineEntry = async (medicineData) => {
   try {
     const docRef = await db.collection('medicines').add({
       ...medicineData,
       createdAt: new Date().toISOString()
     });
     console.log(`Successfully created medicine entry with ID: ${docRef.id}`);
     return { id: docRef.id, ...medicineData };
   } catch (error) {
     console.error('Error creating medicine entry:', error);
     throw new Error('Failed to create medicine entry');
   }
 };
