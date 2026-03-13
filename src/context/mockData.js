export const mockPatients = [
  { id: 'p1', name: 'Ramesh Kumar', age: 45, phone: '9876543210' }
];

export const mockDoctors = [
  { id: 'd1', name: 'Dr. Sarah Sharma', specialization: 'General Physician', available: true },
  { id: 'd2', name: 'Dr. Amit Patel', specialization: 'Pediatrician', available: true }
];

export const mockPharmacies = [
  { id: 'ph1', name: 'Village Care Pharmacy', location: 'Main Street, Village Center', phone: '9876543211' },
  { id: 'ph2', name: 'HealthPlus Meds', location: 'Near Panchayat Office', phone: '9876543212' }
];

export const mockMedicines = [
  { id: 'm1', pharmacyId: 'ph1', name: 'Paracetamol 500mg', inStock: true, price: '₹20' },
  { id: 'm2', pharmacyId: 'ph1', name: 'Amoxicillin 250mg', inStock: true, price: '₹45' },
  { id: 'm3', pharmacyId: 'ph2', name: 'Cough Syrup 100ml', inStock: false, price: '₹85' },
  { id: 'm4', pharmacyId: 'ph2', name: 'ORS Powder', inStock: true, price: '₹15' }
];

export const initialConsultations = [
  { id: 'c1', patientId: 'p1', patientName: 'Ramesh Kumar', doctorId: 'd1', doctorName: 'Dr. Sarah Sharma', date: '2026-03-13', status: 'Pending', symptoms: 'Fever, Cough' }
];

export const initialPrescriptions = [
  { id: 'pr1', consultationId: 'c0', patientId: 'p1', date: '2026-03-10', medicines: ['Paracetamol 500mg', 'ORS Powder'], notes: 'Rest for 3 days.' }
];

export const initialHealthRecords = [
  { id: 'r1', patientId: 'p1', date: '2026-02-15', condition: 'Viral Fever', notes: 'Recovered completely.' }
];

export const initialMessages = [];

