
import React, { useState } from 'react';
import { LegalDocument, ApplicableLegislation, RelatedCase, ExpandedDetails } from '../types';
import { ExternalLinkIcon, PlusCircleIcon } from './icons';
import { fetchExpandedDocumentDetails } from '../services/geminiService';

interface DocumentDetailViewProps {
  document: LegalDocument;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value?: string | null; isLink?: boolean }> = ({ label, value, isLink }) => {
  if (!value) return null;
  return (
    <div className="mb-3 break-words">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      {isLink ? (
        <a 
          href={value} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
        >
          {value} <ExternalLinkIcon className="w-4 h-4 ml-1" />
        </a>
      ) : (
        <p className="text-slate-700">{value}</p>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode; condition?: boolean; className?: string }> = ({ title, children, condition = true, className = "" }) => {
  if (!condition) return null;
  return (
    <div className={`mt-6 pt-4 border-t border-slate-200 ${className}`}>
      <h3 className="text-lg font-semibold text-slate-700 mb-3">{title}</h3>
      {children}
    </div>
  );
};

const DocumentDetailView: React.FC<DocumentDetailViewProps> = ({ document, onClose }) => {
  const [expandedDetails, setExpandedDetails] = useState<ExpandedDetails | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expansionError, setExpansionError] = useState<string | null>(null);

  const handleExpandDetails = async () => {
    setIsExpanding(true);
    setExpansionError(null);
    // No limpiar expandedDetails aquí para que si hay un error, no desaparezca lo ya cargado.
    // Si se quiere recargar, se podría añadir lógica para ello.
    try {
      const details = await fetchExpandedDocumentDetails(document);
      setExpandedDetails(details);
    } catch (err: any) {
      setExpansionError(err.message || "Error desconocido al obtener detalles ampliados.");
      setExpandedDetails(null); // Limpiar si hubo error
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl animate-fadeIn">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-blue-700 leading-tight">{document.title}</h2>
        <button
          onClick={onClose}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 whitespace-nowrap"
          aria-label="Volver a los resultados"
        >
          &larr; Volver
        </button>
      </div>

      <div className="mb-6 p-4 bg-slate-50 rounded-md">
        <p className="text-sm font-semibold text-slate-500 mb-1">Resumen</p>
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{document.summary}</p>
      </div>

      <Section title="Contenido Detallado del Documento" condition={!!document.extendedContent}>
        <div className="p-4 bg-slate-50 rounded-md max-h-96 overflow-y-auto">
          <article className="prose prose-sm max-w-none prose-slate">
            <p className="whitespace-pre-wrap text-slate-700">{document.extendedContent}</p>
          </article>
        </div>
      </Section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-6">
        <DetailItem label="ID del Documento" value={document.id} />
        <DetailItem label="Jurisdicción" value={document.jurisdiction} />
        <DetailItem label="Fecha" value={document.date} />
        <DetailItem label="Área Legal" value={document.legalArea} />
        <DetailItem label="Tipo de Documento" value={document.documentType} />
        <DetailItem label="Tribunal / Órgano Emisor" value={document.court} />
        <DetailItem label="Juez / Magistrado Ponente" value={document.judgeMagistrate} />
        <DetailItem label="Partes Involucradas" value={document.parties} />
        <DetailItem label="Fallo / Decisión" value={document.decisionOutcome} />
      </div>
      
      <DetailItem label="Enlace al Texto Completo" value={document.fullTextLink} isLink={true} />

      <Section title="Palabras Clave" condition={!!document.keywords && document.keywords.length > 0}>
        <div className="flex flex-wrap gap-2">
          {document.keywords?.map((keyword, index) => (
            <span key={index} className="bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full text-xs font-medium">
              {keyword}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Legislación Aplicable Citada" condition={!!document.applicableLegislation && document.applicableLegislation.length > 0}>
        <ul className="list-disc list-inside space-y-2">
          {document.applicableLegislation?.map((leg, index) => (
            <li key={index} className="text-sm text-slate-600">
              {leg.name}
              {leg.article && <span className="text-xs text-slate-500 italic ml-1">(Art. {leg.article})</span>}
              {leg.link && (
                <a href={leg.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                  <ExternalLinkIcon className="w-3 h-3 inline-block" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Casos Relacionados Citados" condition={!!document.relatedCases && document.relatedCases.length > 0}>
        <ul className="list-disc list-inside space-y-2">
          {document.relatedCases?.map((relCase, index) => (
            <li key={index} className="text-sm text-slate-600">
              <span className="font-medium">{relCase.title}</span> (ID: {relCase.id}) - <span className="italic">{relCase.relationship}</span>
              {relCase.link && (
                <a href={relCase.link} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-500 hover:underline">
                  <ExternalLinkIcon className="w-3 h-3 inline-block" />
                </a>
              )}
            </li>
          ))}
        </ul>
      </Section>
      
      <Section title="Notas Adicionales" condition={!!document.notes}>
        <article className="prose prose-sm max-w-none prose-slate">
         <p className="whitespace-pre-wrap text-slate-700">{document.notes}</p>
        </article>
      </Section>

      {/* Botón y secciones para información ampliada */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        {!expandedDetails && !expansionError && (
            <button
                onClick={handleExpandDetails}
                disabled={isExpanding}
                className="w-full md:w-auto flex items-center justify-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-75 disabled:opacity-70 disabled:cursor-not-allowed"
                aria-live="polite"
                aria-busy={isExpanding}
            >
                {isExpanding ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Cargando Información Adicional...
                    </>
                ) : (
                    <>
                        <PlusCircleIcon className="w-5 h-5 mr-2" />
                        Ampliar Información Adicional
                    </>
                )}
            </button>
        )}

        {expansionError && !expandedDetails && ( 
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4 rounded-md shadow-md" role="alert">
                <p className="font-bold">Error al ampliar información</p>
                <p>{expansionError}</p>
            </div>
        )}

        {expandedDetails && (
            <>
                <Section title="Descripción Extensa Adicional" condition={!!expandedDetails.longDescription} className="mt-0 pt-0">
                     <div className="p-4 bg-slate-50 rounded-md">
                        <article className="prose prose-sm max-w-none prose-slate">
                            <p className="whitespace-pre-wrap text-slate-700">{expandedDetails.longDescription}</p>
                        </article>
                    </div>
                </Section>
                <Section title="Análisis Detallado Adicional" condition={!!expandedDetails.detailedAnalysis}>
                     <div className="p-4 bg-slate-50 rounded-md">
                        <article className="prose prose-sm max-w-none prose-slate">
                             <p className="whitespace-pre-wrap text-slate-700">{expandedDetails.detailedAnalysis}</p>
                        </article>
                    </div>
                </Section>
            </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default DocumentDetailView;
