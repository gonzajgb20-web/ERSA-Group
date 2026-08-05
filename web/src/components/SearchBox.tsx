import React from 'react';
import { Search } from 'lucide-react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  visibleCount: number;
  totalCount: number;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  visibleCount,
  totalCount,
}) => {
  return (
    <section className="search-section">
      <label className="search-title" htmlFor="searchInterno">
        <Search size={18} />
        Búsqueda rápida por número de colectivo:
      </label>
      <div className="search-box-large">
        <Search className="search-icon-svg" size={20} />
        <input
          type="text"
          id="searchInterno"
          className="search-input-large"
          placeholder="Ingrese el número de interno (ej: 3624, 3760)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="stats-bar">
        <span>Prioridad automática: Mostrando primero unidades con mayor antigüedad de servicio.</span>
        <div>
          Unidades visibles: <span className="stat-pill">{visibleCount}</span> de {totalCount}
        </div>
      </div>
    </section>
  );
};
