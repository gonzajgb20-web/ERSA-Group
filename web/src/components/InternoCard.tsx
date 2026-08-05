import React from 'react';
import { Calendar, Gauge, Wrench, Edit, Bus } from 'lucide-react';
import { Interno } from '../types';

interface InternoCardProps {
  interno: Interno;
  onOpenModal: (interno: Interno) => void;
}

export const InternoCard: React.FC<InternoCardProps> = ({ interno, onOpenModal }) => {
  const { numero_interno, marca, ultimo_cambio_fecha, ultimo_kilometraje, ultimo_mecanicos } = interno;

  let prioridadClass = 'prioridad-alta';
  let badgeText = 'Revisión Prioritaria';

  if (ultimo_cambio_fecha) {
    const fechaObj = new Date(ultimo_cambio_fecha);
    const hoyObj = new Date();
    const diffTime = Math.abs(hoyObj.getTime() - fechaObj.getTime());
    const diasTranscurridos = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasTranscurridos > 90) {
      prioridadClass = 'prioridad-alta';
      badgeText = `Prioridad Alta (${diasTranscurridos} días)`;
    } else if (diasTranscurridos > 45) {
      prioridadClass = 'prioridad-media';
      badgeText = `Atención (${diasTranscurridos} días)`;
    } else {
      prioridadClass = 'al-dia';
      badgeText = `Al Día (${diasTranscurridos} días)`;
    }
  }

  const fechaFormateada = ultimo_cambio_fecha
    ? new Date(ultimo_cambio_fecha).toLocaleDateString('es-AR')
    : 'Sin registro';

  const kmFormateado = ultimo_kilometraje
    ? Number(ultimo_kilometraje).toLocaleString('es-AR') + ' Km'
    : '-';

  return (
    <article className={`interno-card ${prioridadClass}`}>
      <div className="card-header">
        <div className="interno-number-box">
          <span className="interno-label">Interno</span>
          <span className="interno-number">N° {numero_interno}</span>
        </div>
        <span className={`badge-estado ${prioridadClass}`}>{badgeText}</span>
      </div>

      <div className="card-body-details">
        <div className="data-row">
          <span className="data-label">
            <Bus size={15} />
            Marca del Colectivo:
          </span>
          <span className="data-value">{marca}</span>
        </div>

        <div className="data-row">
          <span className="data-label">
            <Calendar size={15} />
            Último Cambio:
          </span>
          <span className={`data-value ${!ultimo_cambio_fecha ? 'urgente' : ''}`}>
            {fechaFormateada}
          </span>
        </div>

        <div className="data-row">
          <span className="data-label">
            <Gauge size={15} />
            Kilometraje:
          </span>
          <span className="data-value">{kmFormateado}</span>
        </div>

        <div className="data-row">
          <span className="data-label">
            <Wrench size={15} />
            Mecánico(s):
          </span>
          <span
            className="data-value"
            style={{ maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          >
            {ultimo_mecanicos || '-'}
          </span>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', cursor: 'pointer' }}
          onClick={(e) => {
            e.stopPropagation();
            onOpenModal(interno);
          }}
        >
          <Edit size={16} />
          Registrar Cambio de Aceite
        </button>
      </div>
    </article>
  );
};
