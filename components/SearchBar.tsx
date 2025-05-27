
import React, { useState } from 'react';
import { SearchIcon } from './icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full bg-white shadow-lg rounded-lg p-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Introduzca su consulta legal aquí..."
        className="flex-grow p-3 text-slate-800 placeholder-slate-500 focus:outline-none rounded-l-md text-lg"
        disabled={isLoading}
      />
      <button
        type="submit"
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-md flex items-center justify-center transition-colors duration-150 ease-in-out disabled:opacity-50"
        disabled={isLoading}
      >
        <SearchIcon className="w-6 h-6 mr-2" />
        <span className="font-semibold text-lg">Buscar</span>
      </button>
    </form>
  );
};

export default SearchBar;
