import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Activity, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useTranslation } from 'react-i18next';
import './PatientHome.css';

const PatientSymptomChecker = () => {
  const { t } = useTranslation();
  const { currentUser, saveSymptomCheck } = useAppContext();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const callAI = async (symptomsText) => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_AI_API_KEY;

    if (!apiKey) {
      throw new Error('API Key is missing for AI service.');
    }

    const prompt = `
You are a simple medical assistant for rural patients.
Analyze these symptoms: "${symptomsText}"
Provide a JSON response ONLY, with no extra text:
{
  "condition": "possible condition",
  "urgency": "Low, Medium, or High",
  "recommendation": "simple advice"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.3
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('The AI is currently busy (Rate Limit reached). Please try again in 1 minute.');
      }
      throw new Error('Failed to reach the AI service.');
    }

    const data = await response.json();
    let textResult = data.candidates[0].content.parts[0].text;
    
    // Strip markdown formatting if Gemini returns the JSON block inside markdown backticks
    textResult = textResult.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    return JSON.parse(textResult);
  };

  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    
    try {
      const aiResult = await callAI(symptoms);
      setResult(aiResult);
      
      // Save result to Firestore
      saveSymptomCheck({
        patientId: currentUser.id,
        symptoms: symptoms,
        aiResponse: aiResult
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>{t('symptomCheckerTitle')}</h1>
        <p>{t('symptomCheckerSubtitle')}</p>
      </header>

      <Card className="mb-lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label htmlFor="symptoms" style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {t('symptomsQuestion')}
          </label>
          <textarea
            id="symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t('symptomsPlaceholder')}
            rows="4"
            style={{
              padding: '16px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid var(--border-color)',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <Button onClick={handleAnalyze} disabled={isAnalyzing || symptoms.trim().length === 0} fullWidth size="lg">
            {isAnalyzing ? t('analyzingBtn') : t('checkSymptomsBtn')}
          </Button>
        </div>
      </Card>

      {error && (
        <Card className="bg-danger-light" style={{ borderLeft: '4px solid var(--danger)', marginTop: '24px' }}>
          <h3 style={{ color: 'var(--danger)' }}><AlertCircle size={24} /> {t('errorLabel')}</h3>
          <p>{error}</p>
        </Card>
      )}

      {result && (
        <Card style={{ marginTop: '24px', border: '2px solid var(--primary)' }}>
          <h2 style={{ color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={28} /> {t('aiAnalysisTitle')}
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} className="text-secondary" /> {t('possibleCondition')}
              </h3>
              <p style={{ fontSize: '18px', paddingLeft: '28px', marginTop: '4px' }}>{result.condition}</p>
            </div>

            <div>
              <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: result.urgency === 'High' ? 'var(--danger)' : 'var(--warning)' }}>
                <AlertTriangle size={20} /> {t('urgencyLevel')}
              </h3>
              <p style={{ fontSize: '18px', paddingLeft: '28px', marginTop: '4px', fontWeight: 'bold' }}>{result.urgency}</p>
            </div>

            <div style={{ backgroundColor: 'rgba(14, 165, 233, 0.1)', padding: '16px', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{t('recommendation')}</h3>
              <p style={{ fontSize: '18px', fontWeight: '500' }}>{result.recommendation}</p>
            </div>
            
            <Button variant="outline" onClick={() => { setSymptoms(''); setResult(null); }} size="lg">
              {t('checkAnotherBtn')}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PatientSymptomChecker;
