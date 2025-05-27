
import React from 'react';
import { LegalDocument, SourceInfo } from '../types';
import ResultItem from './ResultItem';
import { ExternalLinkIcon } from './icons';

interface ResultsDisplayProps {
  documents: LegalDocument[];
  sources: SourceInfo[];
  isLoading: boolean;
  onDocumentSelect: (document: LegalDocument) => void; // Nueva prop
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ documents, sources, isLoading, onDocumentSelect }) => {
  if (isLoading) return null; 

  if (!documents.length && !sources.length) {
    return <p className="text-center text-slate-500 py-8 text-lg">No se encontraron resultados. Intente una búsqueda diferente o ajuste sus filtros.</p>;
  }

  return (
    <div className="mt-6">
      {documents.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Documentos Encontrados</h2>
          <div className="space-y-4">
            {documents.map((doc) => (
              <ResultItem key={doc.id} document={doc} onSelect={onDocumentSelect} />
            ))}
          </div>
        </div>
      )}

      {sources.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-4">Fuentes Consultadas</h2>
          <ul className="space-y-2 bg-white p-4 rounded-lg shadow">
            {sources.map((source, index) => (
              <li key={index} className="text-sm text-blue-600 hover:text-blue-800">
                <a
                  href={source.uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={source.title || source.uri}
                  className="flex items-center group"
                >
                  <ExternalLinkIcon className="w-4 h-4 mr-2 text-slate-500 group-hover:text-blue-700 transition-colors" />
                  <span className="truncate group-hover:underline">{source.title || source.uri}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
