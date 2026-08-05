import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import api from '../api/client';
import { useAuthStore } from '../store/authStore';
import { Toast } from '../components/Toast';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'exito' | 'error' } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsLoading(true);
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setAuth(res.data.token, res.data.usuario);
        setToastMessage({ text: '¡Bienvenido! Sesión iniciada correctamente.', type: 'exito' });
        setTimeout(() => navigate('/'), 800);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Credenciales inválidas. Verifique su email y contraseña.';
      setToastMessage({ text: msg, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-page)', padding: '1rem' }}>
      {toastMessage && (
        <Toast message={toastMessage.text} type={toastMessage.type} />
      )}

      <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid var(--color-border)', width: '100%', maxWidth: '400px', padding: '2rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="brand-logo-ersa" style={{ fontSize: '2rem', padding: '0.3rem 1.2rem', marginBottom: '0.75rem' }}>ERSA</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>Iniciar Sesión</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Ingresá a tu cuenta de mecánico o administrador</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group-large">
            <label className="label-large" htmlFor="login_email">Correo Electrónico *</label>
            <input
              type="email"
              id="login_email"
              className="input-large"
              placeholder="admin@ersa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group-large">
            <label className="label-large" htmlFor="login_password">Contraseña *</label>
            <input
              type="password"
              id="login_password"
              className="input-large"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', height: '44px' }} disabled={isLoading}>
            <LogIn size={16} />
            {isLoading ? 'Iniciando Sesión...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
