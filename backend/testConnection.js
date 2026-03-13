import { db } from './firebaseConfig.js';

async function testFirebaseConnection() {
  console.log('Starting Firebase connection test...');
  
  try {
    const testCollection = db.collection('test_connection');
    const docData = {
      message: 'Hello from Firebase Admin SDK!',
      status: 'Connection successful',
      timestamp: new Date().toISOString(),
    };

    // Write a document to the "test_connection" collection
    const docRef = await testCollection.add(docData);
    console.log(`Successfully wrote document to 'test_connection' collection. ID: ${docRef.id}`);

    // Read the document back to verify
    const docSnapshot = await docRef.get();
    if (docSnapshot.exists) {
      console.log('Successfully retrieved the document. Data:');
      console.log(docSnapshot.data());
    } else {
      console.error('Document was written but could not be read back.');
    }
  } catch (error) {
    console.error('Failed to connect to Firebase or perform database operations:');
    console.error(error);
  } finally {
    // Exit script
    process.exit(0);
  }
}

testFirebaseConnection();
