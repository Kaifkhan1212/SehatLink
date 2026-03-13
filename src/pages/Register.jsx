import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { UserPlus, AlertTriangle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, userRole, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if newly registered/logged in
  useEffect(() => {
    if (currentUser && userRole) {
      if (userRole === 'patient') navigate('/patient-dashboard');
      else if (userRole === 'doctor') navigate('/doctor-dashboard');
      else if (userRole === 'pharmacist') navigate('/pharmacy-dashboard');
    }
  }, [currentUser, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await register(name, email, password, role);
      // App routes will handle the redirect once AuthContext updates
    } catch (err) {
      console.error(err);
      setError('Failed to register. ' + err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'var(--bg-color)' }}>
      <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--secondary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <UserPlus size={48} color="white" />
          </div>
          <h1 style={{ color: 'var(--dark)', fontSize: '28px', marginBottom: '8px' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)' }}>Join SehatLink TeleHealth</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textAlign: 'left' }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
            <Input 
              type="text" 
              placeholder="e.g. Rahul Kumar" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ fontSize: '18px', padding: '16px' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
            <Input 
              type="email" 
              placeholder="e.g. rahul@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ fontSize: '18px', padding: '16px' }}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Password</label>
            <Input 
              type="password" 
              placeholder="Create a strong password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ fontSize: '18px', padding: '16px' }}
              minLength={6}
            />
          </div>

          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>I am a...</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '16px', 
                fontSize: '18px', 
                borderRadius: '8px', 
                border: '2px solid var(--border-color)', 
                backgroundColor: 'white' 
              }}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="pharmacist">Pharmacist</option>
            </select>
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} style={{ marginTop: '8px' }}>
            {isSubmitting ? 'Creating Account...' : 'Register'}
          </Button>
        </form>

        <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Log In here</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
