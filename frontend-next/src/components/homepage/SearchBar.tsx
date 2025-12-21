'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
}

const SearchBar = ({ onSearch }: SearchBarProps) => {
    const [query, setQuery] = useState<string>('');

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <div className="search-bar">
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Search events or categories..."
                    value={query}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                />
                <button type="submit">Search</button>
            </form>
        </div>
    );
};

export default SearchBar;
