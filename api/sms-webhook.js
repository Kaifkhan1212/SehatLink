import twilio from 'twilio';
import { db } from './_firebaseConfig.js';

export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const incomingMsg = req.body.Body || '';
    const sender = req.body.From || 'Unknown';
    
    console.log(`Received SMS from ${sender}: ${incomingMsg}`);
    
    let symptom = incomingMsg;
    // Attempt parse structure "CONSULT [SYMPTOM]"
    if (incomingMsg.toUpperCase().startsWith('CONSULT ')) {
      symptom = incomingMsg.substring(8).trim();
    }
    
    const appointmentDoc = {
      patientName: 'SMS User',
      symptom: symptom,
      status: 'pending',
      source: 'sms',
      phoneNumber: sender,
      createdAt: new Date()
    };
    
    await db.collection('appointments').add(appointmentDoc);
    
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(`Your consultation request for "${symptom}" has been received. A doctor will review it shortly.`);
    
    res.setHeader('Content-Type', 'text/xml');
    return res.status(200).send(twiml.toString());
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    return res.status(500).send('Internal Server Error');
  }
}
