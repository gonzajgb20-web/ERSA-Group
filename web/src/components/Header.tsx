import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Download, Settings, ArrowLeft, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const isConfig = location.pathname === '/configuracion';
  const { isAuthenticated, logout, usuario } = useAuthStore();

  const handleDownloadExcel = () => {
    const apiBase = import.meta.env.VITE_API_URL || '/api';
    window.location.href = `${apiBase}/exportar/excel`;
  };

  return (
    <header className="header-navbar">
      <div className="brand-container">
        <div className="brand-logo-ersa">ERSA</div>
        <div className="brand-text-container">
          <h1 className="brand-title">
            {isConfig ? 'Gestión de Colectivos' : 'Control de Flota'}
          </h1>
          <p className="brand-subtitle">
            {isConfig ? 'Administración de la Flota e Ingreso de Marcas' : 'Gestión Preventiva de Mantenimiento de Aceite'}
          </p>
        </div>
      </div>

      <div className="nav-actions">
        {!isConfig ? (
          <>
            <button className="btn btn-dark" onClick={handleDownloadExcel} title="Descargar planilla Excel">
              <Download size={16} />
              Descargar Planilla Excel
            </button>
            <Link to="/configuracion" className="btn btn-secondary">
              <Settings size={16} />
              Gestión de Colectivos
            </Link>
          </>
        ) : (
          <Link to="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Volver al Inicio
          </Link>
        )}

        {isAuthenticated && (
          <button className="btn btn-secondary" onClick={logout} title={`Cerrar sesión (${usuario?.nombre})`}>
            <LogOut size={16} />
          </button>
        )}
      </div>
    </header>
  );
};
