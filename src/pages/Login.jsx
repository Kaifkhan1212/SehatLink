import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Stethoscope, AlertTriangle } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle, userRole, currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if newly logged in and role is established
  useEffect(() => {
    if (currentUser && userRole) {
      if (userRole === 'patient') navigate('/patient-dashboard');
      else if (userRole === 'doctor') navigate('/doctor-dashboard');
      else if (userRole === 'pharmacist') navigate('/pharmacy-dashboard');
    }
  }, [currentUser, userRole, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    try {
      setError('');
      setIsSubmitting(true);
      await login(email, password);
      // Let the useEffect handle the redirection once auth state changes
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      await loginWithGoogle();
      // useEffect handles redirect
    } catch (err) {
      console.error(err);
      setError('Failed to log in with Google.');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: 'var(--bg-color)' }}>
      <Card style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ background: 'var(--primary)', padding: '16px', borderRadius: '50%', marginBottom: '16px' }}>
            <Stethoscope size={48} color="white" />
          </div>
          <h1 style={{ color: 'var(--primary)', fontSize: '28px', marginBottom: '8px' }}>SehatLink</h1>
          <p style={{ color: 'var(--text-muted)' }}>Rural TeleHealth Access System</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', textAlign: 'left' }}>
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
            <Input 
              type="email" 
              placeholder="Enter your email" 
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
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ fontSize: '18px', padding: '16px' }}
            />
          </div>

          <Button type="submit" size="lg" disabled={isSubmitting} style={{ marginTop: '8px' }}>
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </Button>
        </form>

        <div style={{ margin: '20px 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '14px', fontWeight: 'bold' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
        </div>

        <Button 
          type="button" 
          onClick={handleGoogleLogin} 
          disabled={isSubmitting}
          style={{ 
            width: '100%', 
            backgroundColor: 'white', 
            color: '#333', 
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px'
          }}
        >
          <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Sign in with Google</span>
        </Button>

        <p style={{ marginTop: '24px', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Register Here</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
