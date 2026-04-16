import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate      = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [loading,    setLoading]    = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();  // stop browser page reload
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(fullName, email, password);
        // After registering, log in automatically
      }

      const data = await login(email, password);
      loginUser({ email: data.email, fullName: data.fullName, token: data.token });
      navigate('/');  // redirect to dashboard

    } catch (err: any) {
      setError(err.response?.data || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>TaskFlow</h1>
        <h2 style={styles.subtitle}>{isRegister ? 'Create account' : 'Sign in'}</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <input
              style={styles.input}
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          )}
          <input
            style={styles.input}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {error && <p style={styles.error}>{error}</p>}

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p style={styles.toggle}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            style={styles.link}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Sign in' : 'Register'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', backgroundColor: '#f0f4f8' },
  card: { backgroundColor: 'white', padding: '2.5rem', borderRadius: '12px',
    width: '100%', maxWidth: '400px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  title: { margin: 0, color: '#1E5FA8', fontSize: '2rem', fontWeight: 700 },
  subtitle: { margin: '0.5rem 0 1.5rem', color: '#666', fontWeight: 400, fontSize: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  input: { padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #ddd',
    fontSize: '1rem', outline: 'none' },
  button: { padding: '0.75rem', backgroundColor: '#1E5FA8', color: 'white',
    border: 'none', borderRadius: '8px', fontSize: '1rem', cursor: 'pointer',
    fontWeight: 600, marginTop: '0.5rem' },
  error: { color: '#c0392b', fontSize: '0.875rem', margin: 0 },
  toggle: { textAlign: 'center', marginTop: '1.5rem', color: '#666', fontSize: '0.9rem' },
  link: { color: '#1E5FA8', cursor: 'pointer', fontWeight: 600 },
};