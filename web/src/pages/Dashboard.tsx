import React, { useState, useMemo } from 'react';
import { useInternos, useRegistrarCambio } from '../hooks/useInternos';
import { Header } from '../components/Header';
import { SearchBox } from '../components/SearchBox';
import { InternoCard } from '../components/InternoCard';
import { CambioAceiteModal } from '../components/CambioAceiteModal';
import { Toast } from '../components/Toast';
import { Interno, CambioAceitePayload } from '../types';

export const Dashboard: React.FC = () => {
  const { data: internos = [], isLoading, isError, error } = useInternos();
  const registrarMutation = useRegistrarCambio();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterno, setSelectedInterno] = useState<Interno | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'exito' | 'error' } | null>(null);

  const filteredInternos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return internos;
    return internos.filter((item) =>
      item.numero_interno.toLowerCase().includes(q) ||
      item.marca.toLowerCase().includes(q)
    );
  }, [internos, searchQuery]);

  const handleOpenModal = (interno: Interno) => {
    setSelectedInterno(interno);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedInterno(null);
    setIsModalOpen(false);
  };

  const handleSubmitCambio = async (payload: CambioAceitePayload) => {
    try {
      const res = await registrarMutation.mutateAsync(payload);
      setToastMessage({ text: res.message || 'Cambio de aceite registrado con éxito.', type: 'exito' });
      handleCloseModal();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Error al guardar el registro.';
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

      {isError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem', color: '#991b1b' }}>
          <h3>Error de Conexión</h3>
          <p>{(error as Error)?.message || 'No se pudo conectar con el servidor de la API.'}</p>
        </div>
      )}

      <SearchBox
        value={searchQuery}
        onChange={setSearchQuery}
        visibleCount={filteredInternos.length}
        totalCount={internos.length}
      />

      <main className="internos-grid">
        {isLoading ? (
          <div className="empty-box">Cargando flota de colectivos...</div>
        ) : filteredInternos.length > 0 ? (
          filteredInternos.map((item) => (
            <InternoCard
              key={item.id}
              interno={item}
              onOpenModal={handleOpenModal}
            />
          ))
        ) : (
          <div className="empty-box">
            <h3>Sin resultados</h3>
            <p>No existe ninguna unidad registrada con ese número de interno.</p>
          </div>
        )}
      </main>

      <CambioAceiteModal
        isOpen={isModalOpen}
        interno={selectedInterno}
        onClose={handleCloseModal}
        onSubmit={handleSubmitCambio}
        isLoading={registrarMutation.isPending}
      />
    </div>
  );
};
