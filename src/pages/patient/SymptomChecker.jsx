import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Activity, AlertTriangle, MessageSquare } from 'lucide-react';
import './PatientHome.css'; // Reusing common page styles

// AI API Integration
const callAI = async (symptoms) => {
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const baseUrl = import.meta.env.VITE_AI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    throw new Error('API Key is missing. Please set VITE_AI_API_KEY in your .env file.');
  }

  const prompt = `
You are a helpful medical assistant for rural telehealth patients.
Analyze these symptoms: "${symptoms}"
Provide a response strictly in the following JSON format without any markdown wrappers:
{
  "condition": "Possible condition in simple terms",
  "precautions": "Basic home precautions",
  "recommendation": "Recommendation on whether a doctor consultation is needed immediately, soon, or just rest"
}
Keep language extremely simple and easy to understand.
`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: import.meta.env.VITE_AI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from AI service. Please check your API key and network.');
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  return JSON.parse(content);
};

const SymptomChecker = () => {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      const aiResult = await callAI(symptoms);
      setResult(aiResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>AI Symptom Checker</h1>
        <p>Describe what you are feeling in simple words.</p>
      </header>

      <Card className="mb-lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label htmlFor="symptoms" style={{ fontSize: '18px', fontWeight: '600' }}>
            What are your symptoms today?
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g., I have fever and mild cough since yesterday..."
            rows="4"
            style={{
              padding: '12px',
              fontSize: '16px',
              borderRadius: '8px',
              border: '2px solid var(--border-color)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <Button onClick={handleAnalyze} disabled={isAnalyzing || symptoms.trim().length === 0} fullWidth size="lg">
            {isAnalyzing ? 'Analyzing...' : 'Check Symptoms'}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="result-card bg-danger-light" style={{ marginTop: '24px', borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', color: 'var(--danger)' }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0 }}>System Error</h3>
          </div>
          <p>{error}</p>
        </Card>
      )}

      {result && (
        <Card className="result-card" style={{ marginTop: '24px', border: '2px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Activity size={32} />
            <h2 style={{ margin: 0 }}>AI Analysis Result</h2>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <AlertTriangle size={20} className="text-secondary" /> Possible Condition
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.5', paddingLeft: '28px' }}>{result.condition}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Activity size={20} className="text-success" /> Basic Precautions
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.5', paddingLeft: '28px' }}>{result.precautions}</p>
            </div>

            <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--secondary)' }}>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <MessageSquare size={20} className="text-secondary" /> Recommendation
              </h3>
              <p style={{ fontSize: '16px', lineHeight: '1.5', fontWeight: '500' }}>{result.recommendation}</p>
            </div>

            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '12px', textAlign: 'center' }}>
              Disclaimer: This is a basic AI guidance tool and does not replace a professional medical diagnosis.
            </p>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
             <Button variant="outline" onClick={() => { setSymptoms(''); setResult(null); setError(null); }} fullWidth>Check Another Symptom</Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default SymptomChecker;
