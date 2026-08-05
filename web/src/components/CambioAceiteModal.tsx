import React, { useState, useEffect } from 'react';
import { Save, X } from 'lucide-react';
import { Interno, CambioAceitePayload } from '../types';

interface CambioAceiteModalProps {
  isOpen: boolean;
  interno: Interno | null;
  onClose: () => void;
  onSubmit: (payload: CambioAceitePayload) => Promise<void>;
  isLoading: boolean;
}

export const CambioAceiteModal: React.FC<CambioAceiteModalProps> = ({
  isOpen,
  interno,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [fechaCambio, setFechaCambio] = useState('');
  const [kilometraje, setKilometraje] = useState('');
  const [mecanicos, setMecanicos] = useState('');
  const [imagenComprobante, setImagenComprobante] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      const hoy = new Date().toISOString().split('T')[0];
      setFechaCambio(hoy);
      setKilometraje('');
      setMecanicos('');
      setImagenComprobante(null);
    }
  }, [isOpen]);

  if (!isOpen || !interno) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const kmVal = parseInt(kilometraje, 10);
    if (isNaN(kmVal) || kmVal <= 0) return;

    await onSubmit({
      interno_id: interno.id,
      fecha_cambio: fechaCambio,
      kilometraje: kmVal,
      mecanicos: mecanicos.trim(),
      imagen_comprobante: imagenComprobante,
    });
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-subtle">
          <h3 className="modal-title-text">Registrar Cambio de Aceite</h3>
          <button type="button" className="btn-cerrar-modal" onClick={onClose} aria-label="Cerrar ventana">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-form-body">
            <div style={{ background: 'var(--color-card-subtle)', border: '1px solid var(--color-border)', padding: '0.75rem 1rem', borderRadius: '6px', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Unidad seleccionada: Interno N° <span style={{ color: 'var(--color-ersa-red)' }}>{interno.numero_interno} ({interno.marca})</span>
              </span>
            </div>

            <div className="form-group-large">
              <label className="label-large" htmlFor="modal_fecha_cambio">Fecha de mantenimiento *</label>
              <input
                type="date"
                id="modal_fecha_cambio"
                className="input-large"
                value={fechaCambio}
                onChange={(e) => setFechaCambio(e.target.value)}
                required
              />
            </div>

            <div className="form-group-large">
              <label className="label-large" htmlFor="modal_kilometraje">Kilometraje al momento del cambio (Km) *</label>
              <input
                type="number"
                id="modal_kilometraje"
                className="input-large"
                placeholder={interno.ultimo_kilometraje ? `Sugerido > ${interno.ultimo_kilometraje} Km` : 'Ejemplo: 450100'}
                value={kilometraje}
                onChange={(e) => setKilometraje(e.target.value)}
                min="1"
                required
              />
              <p className="ayuda-texto">Ingrese el valor exacto del cuentakilómetros del colectivo.</p>
            </div>

            <div className="form-group-large">
              <label className="label-large" htmlFor="modal_mecanicos">Mecánico(s) responsable(s) *</label>
              <input
                type="text"
                id="modal_mecanicos"
                className="input-large"
                placeholder="Ejemplo: Carlos Gómez, Juan Pérez"
                value={mecanicos}
                onChange={(e) => setMecanicos(e.target.value)}
                required
              />
              <p className="ayuda-texto">Ingrese los nombres del personal de taller que realizó el trabajo.</p>
            </div>

            <div className="form-group-large">
              <label className="label-large" htmlFor="modal_imagen">Comprobante o foto de la orden (opcional)</label>
              <input
                type="file"
                id="modal_imagen"
                className="input-large"
                accept="image/*"
                onChange={(e) => setImagenComprobante(e.target.files ? e.target.files[0] : null)}
              />
            </div>
          </div>

          <div className="modal-footer-btns">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              <Save size={16} />
              {isLoading ? 'Guardando...' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
