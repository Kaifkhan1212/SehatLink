import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { db } from './firebaseConfig.js';

const app = express();

app.use(cors());
// Twilio sends data as x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.post('/api/sms-webhook', async (req, res) => {
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
    
    res.type('text/xml').send(twiml.toString());
  } catch (error) {
    console.error('Error processing SMS webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = 3001; // Avoid colliding with Vite dev server
app.listen(PORT, () => {
  console.log(`Twilio SMS Webhook Server running on port ${PORT}`);
});
