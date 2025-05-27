
import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import ResultsDisplay from './components/ResultsDisplay';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import DocumentDetailView from './components/DocumentDetailView'; // Nueva importación
import { searchLegalPrecedents } from './services/geminiService';
import { LegalDocument, SearchFilters, Jurisdiction, SourceInfo, LegalArea, DocumentType } from './types';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({
    jurisdiction: Jurisdiction.ALL,
    dateFrom: '',
    dateTo: '',
    legalArea: LegalArea.ALL,
    documentType: DocumentType.ALL,
    court: '',
  });
  const [searchResults, setSearchResults] = useState<LegalDocument[]>([]);
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null); // Nuevo estado

  const performSearch = useCallback(async (query: string, currentFilters: SearchFilters) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSelectedDocument(null); // Limpiar detalle al buscar
    setSearchResults([]);
    setSources([]);

    try {
      const response = await searchLegalPrecedents(query, currentFilters);
      setSearchResults(response.documents);
      setSources(response.sources);
    } catch (err: any) {
      console.error("Search error in App.tsx:", err);
      setError(err.message || 'Ocurrió un error inesperado durante la búsqueda.');
      setSearchResults([]);
      setSources([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    performSearch(query, filters);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    if (searchQuery.trim()) {
      performSearch(searchQuery, newFilters);
    }
  };

  const handleDocumentSelect = (doc: LegalDocument) => {
    setSelectedDocument(doc);
  };

  const handleCloseDetailView = () => {
    setSelectedDocument(null);
  };
  
  const Header: React.FC = () => (
    <header className="bg-slate-800 text-white p-6 shadow-md">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold">Buscador Jurídico Andorrano</h1>
        <p className="text-sm text-slate-300 mt-1">Inteligencia artificial al servicio de la jurisprudencia.</p>
      </div>
    </header>
  );
  
  const Footer: React.FC = () => (
    <footer className="bg-slate-700 text-white p-4 mt-10 text-center text-sm">
      <p>&copy; {new Date().getFullYear()} Buscador Jurídico Andorrano. Todos los derechos reservados.</p>
      <p className="text-xs text-slate-400 mt-1">Potenciado por IA Generativa.</p></footer>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
             <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </div>
          <aside className="lg:col-span-3 bg-white p-0 rounded-lg shadow-lg h-fit">
            <FilterPanel filters={filters} onFiltersChange={handleFilterChange} isLoading={isLoading || !!selectedDocument} />
          </aside>
          <section className="lg:col-span-9">
            {isLoading && <LoadingSpinner />}
            <ErrorMessage message={error || ""} />
            
            {!isLoading && !error && selectedDocument && (
              <DocumentDetailView document={selectedDocument} onClose={handleCloseDetailView} />
            )}

            {!isLoading && !error && !selectedDocument && hasSearched && (
              <ResultsDisplay 
                documents={searchResults} 
                sources={sources} 
                isLoading={isLoading}
                onDocumentSelect={handleDocumentSelect} 
              />
            )}
            
            {!isLoading && !error && !hasSearched && !selectedDocument && (
              <div className="text-center py-10 bg-white rounded-lg shadow-md">
                <img src="https://picsum.photos/seed/courthouse/400/200" alt="Edificio de tribunal o libros de derecho" className="mx-auto mb-6 rounded-md shadow"/>
                <h2 className="text-2xl font-semibold text-slate-700 mb-2">Bienvenido al Buscador Jurídico</h2>
                <p className="text-slate-500">Utilice la barra de búsqueda y los filtros para encontrar jurisprudencia relevante.</p>
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
