export enum Jurisdiction {
  ALL = "Todas",
  ANDORRA = "Andorra",
  SPAIN = "España",
  EUROPE = "UE",
}

export enum LegalArea {
  ALL = "Todas las áreas",
  CIVIL = "Civil",
  PENAL = "Penal",
  ADMINISTRATIVO = "Administrativo",
  LABORAL = "Laboral",
  MERCANTIL = "Mercantil",
  CONSTITUCIONAL = "Constitucional",
  OTRA = "Otra",
}

export enum DocumentType {
  ALL = "Todos los tipos",
  SENTENCIA = "Sentencia",
  LEY = "Ley",
  REGLAMENTO = "Reglamento",
  DIRECTIVA_UE = "Directiva UE",
  AUTO = "Auto",
  DECRETO = "Decreto",
  OTRO = "Otro",
}

export interface SearchFilters {
  jurisdiction: Jurisdiction;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  legalArea?: LegalArea;
  documentType?: DocumentType;
  court?: string;
}

export interface ApplicableLegislation {
  name: string;
  article?: string;
  link?: string;
}

export interface RelatedCase {
  id: string;
  title: string;
  relationship: string; // e.g., "Cita a", "Confirma", "Anula"
  link?: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  summary: string;
  jurisdiction: string;
  date: string | null;
  legalArea?: string;
  documentType?: string;
  court?: string;
  fullTextLink?: string;
  keywords?: string[];
  applicableLegislation?: ApplicableLegislation[];
  relatedCases?: RelatedCase[];
  judgeMagistrate?: string; // Juez o Magistrado Ponente
  parties?: string; // Partes involucradas (de forma genérica)
  decisionOutcome?: string; // Fallo o resultado de la decisión
  notes?: string; // Notas adicionales o contexto
  extendedContent?: string; // Contenido más extenso del documento
}

export interface SourceInfo {
  uri: string;
  title: string;
}

export interface SearchResponse {
  documents: LegalDocument[];
  sources: SourceInfo[];
}

// Used for Gemini API response parsing
export interface GeminiJsonResult {
  id: string;
  title: string;
  summary: string;
  jurisdiction: string;
  date: string | null;
  legalArea?: string;
  documentType?: string;
  court?: string;
  fullTextLink?: string;
  keywords?: string[];
  applicableLegislation?: ApplicableLegislation[];
  relatedCases?: RelatedCase[];
  judgeMagistrate?: string;
  parties?: string;
  decisionOutcome?: string;
  notes?: string;
  extendedContent?: string; 
}

export interface GeminiApiResponse {
  results: GeminiJsonResult[];
}

// For expanded details functionality
export interface ExpandedDetails {
  longDescription?: string;
  detailedAnalysis?: string;
}

export interface GeminiExpandedJsonResult {
  longDescription?: string;
  detailedAnalysis?: string;
}