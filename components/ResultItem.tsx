
import React from 'react';
import { LegalDocument } from '../types';

interface ResultItemProps {
  document: LegalDocument;
  onSelect: (document: LegalDocument) => void;
}

const ResultItem: React.FC<ResultItemProps> = ({ document, onSelect }) => {
  return (
    <div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl hover:bg-slate-50 transition-all duration-200 ease-in-out mb-4 border border-slate-200 cursor-pointer"
      onClick={() => onSelect(document)}
      onKeyPress={(e) => e.key === 'Enter' && onSelect(document)}
      tabIndex={0}
      role="button"
      aria-pressed="false"
      aria-label={`Ver detalles de ${document.title}`}
    >
      <h3 className="text-xl font-semibold text-blue-700 mb-2">{document.title}</h3>
      <p className="text-slate-600 text-sm mb-3 leading-relaxed line-clamp-3">{document.summary}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
          ID: {document.id}
        </span>
        <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-full font-medium">
          Jurisdicción: {document.jurisdiction}
        </span>
        {document.date && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
            Fecha: {document.date}
          </span>
        )}
        {document.legalArea && (
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
            Área: {document.legalArea}
          </span>
        )}
        {document.documentType && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
            Tipo: {document.documentType}
          </span>
        )}
        {document.court && (
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full font-medium">
            Tribunal: {document.court}
          </span>
        )}
      </div>
    </div>
  );
};

export default ResultItem;
