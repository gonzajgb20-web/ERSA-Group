import React, { useState } from 'react';
import { PlusCircle, FileText, Trash2 } from 'lucide-react';
import { useInternos, useAgregarInterno, useEliminarInterno } from '../hooks/useInternos';
import { Header } from '../components/Header';
import { Toast } from '../components/Toast';

export const Configuracion: React.FC = () => {
  const { data: internos = [], isLoading } = useInternos();
  const agregarMutation = useAgregarInterno();
  const eliminarMutation = useEliminarInterno();

  const [numeroInterno, setNumeroInterno] = useState('');
  const [marca, setMarca] = useState('Volkswagen');
  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'exito' | 'error' } | null>(null);

  const handleAgregar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroInterno.trim()) return;

    try {
      const res = await agregarMutation.mutateAsync({
        numero_interno: numeroInterno.trim(),
        marca: marca.trim() || 'Volkswagen',
        imagen: imagenFile,
      });

      setToastMessage({ text: res.message || 'Colectivo agregado con éxito.', type: 'exito' });
      setNumeroInterno('');
      setMarca('Volkswagen');
      setImagenFile(null);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'No se pudo agregar el colectivo.';
      setToastMessage({ text: errMsg, type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handleEliminar = async (id: string, numero: string) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el Interno N° ${numero} de la flota?\nEsta acción borrará su historial de mantenimiento.`)) {
      return;
    }

    try {
      const res = await eliminarMutation.mutateAsync(id);
      setToastMessage({ text: res.message || 'Interno eliminado correctamente.', type: 'exito' });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'No se pudo eliminar el colectivo.';
      setToastMessage({ text: errMsg, type: 'error' });
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  return (
    <div className="app-container">
      <Header />

      {toastMessage && (
        <Toast message={toastMessage.text} type={toastMessage.type} />
      )}

      {/* Formulario Agregar Colectivo */}
      <div className="config-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PlusCircle size={18} />
          Agregar Nuevo Colectivo a la Flota
        </h2>

        <form onSubmit={handleAgregar} className="config-form-responsive">
          <div className="form-field-item">
            <label className="label-large" htmlFor="nuevo_numero_interno">Número de Interno *</label>
            <input
              type="text"
              id="nuevo_numero_interno"
              className="input-large"
              placeholder="Ej: 4250"
              value={numeroInterno}
              onChange={(e) => setNumeroInterno(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-field-item">
            <label className="label-large" htmlFor="nuevo_marca">Marca del Colectivo *</label>
            <input
              type="text"
              id="nuevo_marca"
              className="input-large"
              placeholder="Ej: Volkswagen..."
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              required
              autoComplete="off"
            />
          </div>

          <div className="form-field-item">
            <label className="label-large" htmlFor="nuevo_imagen">Foto (opcional)</label>
            <input
              type="file"
              id="nuevo_imagen"
              className="input-large"
              accept="image/*"
              onChange={(e) => setImagenFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>

          <div className="form-field-item btn-submit-wrapper">
            <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '42px' }} disabled={agregarMutation.isPending}>
              <PlusCircle size={16} />
              {agregarMutation.isPending ? 'Guardando...' : 'Dar de Alta Colectivo'}
            </button>
          </div>
        </form>
      </div>

      {/* Padrón de Colectivos Optimizado para Móviles */}
      <div className="config-card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} />
          Padrón de Colectivos Registrados ({internos.length})
        </h2>

        {isLoading ? (
          <div style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>Cargando padrón...</div>
        ) : (
          <div className="table-responsive-container">
            <table className="tabla-internos-optimized">
              <thead>
                <tr>
                  <th>Colectivo</th>
                  <th className="col-marca-desktop">Marca</th>
                  <th className="col-fecha">Fecha Registro</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {internos.map((row) => {
                  const fechaFormateada = row.creado_en
                    ? new Date(row.creado_en).toLocaleDateString('es-AR')
                    : '-';

                  return (
                    <tr key={row.id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>
                            INT N° {row.numero_interno}
                          </strong>
                          <span className="sublabel-marca-mobile">
                            {row.marca}
                          </span>
                        </div>
                      </td>
                      <td className="col-marca-desktop">
                        <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {row.marca}
                        </span>
                      </td>
                      <td className="col-fecha" style={{ color: 'var(--color-text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {fechaFormateada}
                      </td>
                      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <button
                          className="btn btn-danger-subtle btn-eliminar-compact"
                          onClick={() => handleEliminar(row.id, row.numero_interno)}
                          disabled={eliminarMutation.isPending}
                          title="Eliminar colectivo"
                        >
                          <Trash2 size={14} />
                          <span className="btn-eliminar-texto">Eliminar</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
