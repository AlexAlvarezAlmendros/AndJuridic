import React from 'react';
import { Jurisdiction, SearchFilters, LegalArea, DocumentType } from '../types';
import { FilterIcon, ChevronDownIcon } from './icons';

interface FilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (newFilters: SearchFilters) => void;
  isLoading: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFiltersChange, isLoading }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onFiltersChange({
      ...filters,
      [name]: value,
    });
  };

  const inputBaseClass = "w-full p-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-700 disabled:bg-slate-50 disabled:text-slate-500";
  const selectClass = `${inputBaseClass} appearance-none pr-8`;
  const labelClass = "block text-sm font-medium text-slate-600 mb-1";

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg space-y-4">
      <h3 className="text-xl font-semibold text-slate-700 mb-3 flex items-center">
        <FilterIcon className="w-6 h-6 mr-2 text-blue-600" />
        Filtros Avanzados
      </h3>

      {/* Jurisdiction Filter */}
      <div>
        <label htmlFor="jurisdiction" className={labelClass}>
          Jurisdicción
        </label>
        <div className="relative">
          <select
            id="jurisdiction"
            name="jurisdiction"
            value={filters.jurisdiction}
            onChange={handleInputChange}
            disabled={isLoading}
            className={selectClass}
          >
            {Object.values(Jurisdiction).map((jurisdictionValue) => (
              <option key={jurisdictionValue} value={jurisdictionValue}>
                {jurisdictionValue}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDownIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div>
        <p className={`${labelClass} mb-2 font-semibold`}>Rango de Fechas</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="dateFrom" className={labelClass}>Desde</label>
            <input
              type="date"
              id="dateFrom"
              name="dateFrom"
              value={filters.dateFrom || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className={inputBaseClass}
              max={filters.dateTo || undefined}
            />
          </div>
          <div>
            <label htmlFor="dateTo" className={labelClass}>Hasta</label>
            <input
              type="date"
              id="dateTo"
              name="dateTo"
              value={filters.dateTo || ''}
              onChange={handleInputChange}
              disabled={isLoading}
              className={inputBaseClass}
              min={filters.dateFrom || undefined}
            />
          </div>
        </div>
      </div>

      {/* Legal Area Filter */}
      <div>
        <label htmlFor="legalArea" className={labelClass}>
          Área Legal
        </label>
        <div className="relative">
          <select
            id="legalArea"
            name="legalArea"
            value={filters.legalArea || LegalArea.ALL}
            onChange={handleInputChange}
            disabled={isLoading}
            className={selectClass}
          >
            {Object.values(LegalArea).map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDownIcon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Document Type Filter */}
      <div>
        <label htmlFor="documentType" className={labelClass}>
          Tipo de Documento
        </label>
        <div className="relative">
          <select
            id="documentType"
            name="documentType"
            value={filters.documentType || DocumentType.ALL}
            onChange={handleInputChange}
            disabled={isLoading}
            className={selectClass}
          >
            {Object.values(DocumentType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-700">
            <ChevronDownIcon className="w-5 h-5" />
          </div>
        </div>
      </div>
      
      {/* Court/Tribunal Filter */}
      <div>
        <label htmlFor="court" className={labelClass}>
          Tribunal / Órgano Emisor
        </label>
        <input
          type="text"
          id="court"
          name="court"
          value={filters.court || ''}
          onChange={handleInputChange}
          placeholder="Ej: Tribunal Superior, TJUE"
          disabled={isLoading}
          className={inputBaseClass}
        />
      </div>
    </div>
  );
};

export default FilterPanel;