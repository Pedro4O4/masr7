// src/components/shared/Loader.jsx
import React from 'react';
import './Loader.css';

const Loader = ({ message = "Loading..." }) => {
    return (
        <div className="loader-container">
            <div className="spinner"></div>
            {message && <p className="loading-text">{message}</p>}
        </div>
    );
};

export default Loader;