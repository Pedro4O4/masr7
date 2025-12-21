'use client';

import './Loader.css';

interface LoaderProps {
    message?: string;
}

const Loader = ({ message = "Loading..." }: LoaderProps) => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            {message && <p className="loading-text">{message}</p>}
        </div>
    );
};

export default Loader;
