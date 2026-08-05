import { create } from 'zustand';
import { Usuario } from '../types';

interface AuthState {
  token: string | null;
  usuario: Usuario | null;
  isAuthenticated: boolean;
  setAuth: (token: string, usuario: Usuario) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('ersa_token'),
  usuario: JSON.parse(localStorage.getItem('ersa_usuario') || 'null'),
  isAuthenticated: !!localStorage.getItem('ersa_token'),

  setAuth: (token: string, usuario: Usuario) => {
    localStorage.setItem('ersa_token', token);
    localStorage.setItem('ersa_usuario', JSON.stringify(usuario));
    set({ token, usuario, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('ersa_token');
    localStorage.removeItem('ersa_usuario');
    set({ token: null, usuario: null, isAuthenticated: false });
  },
}));
