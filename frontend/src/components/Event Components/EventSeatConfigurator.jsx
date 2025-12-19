import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiInfo, FiDollarSign } from 'react-icons/fi';
import './EventSeatConfigurator.css';

const SEAT_TYPES = {
    STANDARD: 'standard',
    VIP: 'vip',
    PREMIUM: 'premium',
    WHEELCHAIR: 'wheelchair'
};

const EventSeatConfigurator = ({ theaterLayout, initialSeatConfig = [], initialPricing = {}, onSave, onCancel }) => {
    const [currentCategory, setCurrentCategory] = useState(SEAT_TYPES.VIP);

    // Map for quick lookup of current seat status
    // Key: `${section}-${row}-${seatNum}` -> Value: seatType
    const [seatMap, setSeatMap] = useState({});

    // Pricing for each category
    const [pricing, setPricing] = useState({
        standard: initialPricing.standard || 0,
        vip: initialPricing.vip || 0,
        premium: initialPricing.premium || 0,
        wheelchair: initialPricing.wheelchair || 0
    });

    useEffect(() => {
        // Initialize from theater layout first, then apply event-specific overrides
        const initialMap = {};

        // 1. Apply theater default categories (from seatCategories in layout)
        if (theaterLayout?.seatCategories) {
            Object.entries(theaterLayout.seatCategories).forEach(([key, type]) => {
                initialMap[key] = type;
            });
        }

        // 2. Apply event-specific overrides from initialSeatConfig
        if (initialSeatConfig && initialSeatConfig.length > 0) {
            initialSeatConfig.forEach(cfg => {
                const key = `${cfg.section || 'main'}-${cfg.row}-${cfg.seatNumber}`;
                initialMap[key] = cfg.seatType;
            });
        }

        setSeatMap(initialMap);
    }, [theaterLayout, initialSeatConfig]);

    // Check if a seat is removed - key format: "section-row-seatNum"
    const isSeatRemoved = (section, row, seatNum) => {
        if (!theaterLayout?.removedSeats) return false;
        const key = `${section}-${row}-${seatNum}`;
        if (Array.isArray(theaterLayout.removedSeats)) {
            return theaterLayout.removedSeats.includes(key);
        }
        return false;
    };

    // Check if a seat is disabled - key format: "section-row-seatNum"
    const isSeatDisabled = (section, row, seatNum) => {
        if (!theaterLayout?.disabledSeats) return false;
        const key = `${section}-${row}-${seatNum}`;
        if (Array.isArray(theaterLayout.disabledSeats)) {
            return theaterLayout.disabledSeats.includes(key);
        }
        return false;
    };

    // Get vertical corridor count after a seat - key format: "section-v-colIndex"
    const getVCorridorCount = (section, colIndex) => {
        if (!theaterLayout?.vCorridors) return 0;
        const key = `${section}-v-${colIndex}`;
        return theaterLayout.vCorridors[key] || 0;
    };

    // Get horizontal corridor count after a row - key format: "section-rowIndex"
    const getHCorridorCount = (section, rowIndex) => {
        if (!theaterLayout?.hCorridors) return 0;
        const key = `${section}-${rowIndex}`;
        return theaterLayout.hCorridors[key] || 0;
    };

    const handleSeatClick = (section, rowLabel, seatNum) => {
        // Don't allow clicking removed or disabled seats
        if (isSeatRemoved(section, rowLabel, seatNum) || isSeatDisabled(section, rowLabel, seatNum)) {
            return;
        }

        const key = `${section}-${rowLabel}-${seatNum}`;

        setSeatMap(prev => {
            const newMap = { ...prev };
            // If already this category, toggle back to standard
            if (newMap[key] === currentCategory) {
                delete newMap[key]; // effectively resets to standard/undefined
            } else {
                newMap[key] = currentCategory;
            }
            return newMap;
        });
    };

    // Handle row click - apply current category to ALL seats in the row
    const handleRowClick = (section, rowLabel, seatsPerRow) => {
        setSeatMap(prev => {
            const newMap = { ...prev };

            // Check if all valid seats in this row already have the current category
            let allHaveCategory = true;
            for (let i = 1; i <= seatsPerRow; i++) {
                const key = `${section}-${rowLabel}-${i}`;
                if (isSeatRemoved(section, rowLabel, i) || isSeatDisabled(section, rowLabel, i)) {
                    continue; // Skip removed/disabled seats
                }
                if (newMap[key] !== currentCategory) {
                    allHaveCategory = false;
                    break;
                }
            }

            // Toggle: if all have category, reset to standard; otherwise apply category
            for (let i = 1; i <= seatsPerRow; i++) {
                const key = `${section}-${rowLabel}-${i}`;
                if (isSeatRemoved(section, rowLabel, i) || isSeatDisabled(section, rowLabel, i)) {
                    continue; // Skip removed/disabled seats
                }
                if (allHaveCategory) {
                    delete newMap[key]; // Reset to standard
                } else {
                    newMap[key] = currentCategory;
                }
            }

            return newMap;
        });
    };

    const handlePriceChange = (category, value) => {
        setPricing(prev => ({
            ...prev,
            [category]: parseFloat(value) || 0
        }));
    };

    const handleSave = () => {
        // Convert map back to array format for backend
        const configArray = Object.entries(seatMap).map(([key, type]) => {
            const parts = key.split('-');
            const section = parts[0];
            const row = parts[1];
            const seatNumber = parseInt(parts[2]);
            return { section, row, seatNumber, seatType: type };
        });

        // Convert pricing to array format
        const pricingArray = Object.entries(pricing).map(([type, price]) => ({
            seatType: type,
            price: price
        }));

        onSave(configArray, pricingArray);
    };

    const renderSeat = (section, rowLabel, seatIndex) => {
        const seatNum = seatIndex + 1;
        const key = `${section}-${rowLabel}-${seatNum}`;

        // Check if removed
        if (isSeatRemoved(section, rowLabel, seatNum)) {
            return <div key={key} className="seat-slot empty" />;
        }

        // Check if disabled
        const isDisabled = isSeatDisabled(section, rowLabel, seatNum);
        const seatType = seatMap[key] || SEAT_TYPES.STANDARD;

        return (
            <div
                key={key}
                className={`seat ${seatType} ${isDisabled ? 'disabled-seat' : ''}`}
                onClick={() => !isDisabled && handleSeatClick(section, rowLabel, seatNum)}
                title={`${rowLabel}${seatNum} - ${seatType.toUpperCase()}${isDisabled ? ' (Disabled)' : ''} - $${pricing[seatType]}`}
            >
                <span className="seat-number">{seatNum}</span>
            </div>
        );
    };

    const renderRow = (section, rowLabel, seatsPerRow, rowIndex) => {
        const seats = [];

        for (let i = 0; i < seatsPerRow; i++) {
            const seatNum = i + 1;
            seats.push(renderSeat(section, rowLabel, i));

            // Add vertical corridor after this seat if needed - key is section-v-seatNum
            const vCorridorCount = getVCorridorCount(section, seatNum);
            for (let c = 0; c < vCorridorCount; c++) {
                seats.push(<div key={`vcorr-${rowLabel}-${seatNum}-${c}`} className="v-corridor" />);
            }
        }

        // Get horizontal corridor count for AFTER this row
        const hCorridorCount = getHCorridorCount(section, rowIndex);

        return (
            <React.Fragment key={`row-${section}-${rowLabel}`}>
                <div className="seating-row">
                    <button
                        className="row-label row-label-btn"
                        onClick={() => handleRowClick(section, rowLabel, seatsPerRow)}
                        title={`Click to apply ${currentCategory.toUpperCase()} to entire row ${rowLabel}`}
                    >
                        {rowLabel}
                    </button>
                    <div className="seats-container">{seats}</div>
                    <button
                        className="row-label row-label-btn"
                        onClick={() => handleRowClick(section, rowLabel, seatsPerRow)}
                        title={`Click to apply ${currentCategory.toUpperCase()} to entire row ${rowLabel}`}
                    >
                        {rowLabel}
                    </button>
                </div>

                {/* Add horizontal corridor after this row if needed */}
                {Array.from({ length: hCorridorCount }).map((_, idx) => (
                    <div key={`hcorr-${section}-${rowIndex}-${idx}`} className="h-corridor">
                        <span className="corridor-label">CORRIDOR</span>
                    </div>
                ))}
            </React.Fragment>
        );
    };

    const renderLabels = () => {
        if (!theaterLayout?.labels || theaterLayout.labels.length === 0) return null;

        return (
            <div className="theater-labels-overlay">
                {theaterLayout.labels.map(label => (
                    <div
                        key={label.id}
                        className="theater-label"
                        style={{
                            left: `${label.position?.x || 0}%`,
                            top: `${label.position?.y || 0}%`,
                            width: label.width || 'auto',
                            height: label.height || 'auto'
                        }}
                    >
                        {label.icon && <span className="label-icon">{label.icon}</span>}
                        <span className="label-text">{label.text}</span>
                    </div>
                ))}
            </div>
        );
    };

    // Generate row labels
    const getRowLabel = (index, prefix = '') => {
        if (index < 26) {
            return prefix + String.fromCharCode(65 + index);
        }
        return prefix + 'R' + (index + 1);
    };

    const mainFloorRows = theaterLayout?.mainFloor?.rows || 10;
    const mainFloorSeats = theaterLayout?.mainFloor?.seatsPerRow || 12;
    const hasBalcony = theaterLayout?.hasBalcony || false;
    const balconyRows = theaterLayout?.balcony?.rows || 0;
    const balconySeats = theaterLayout?.balcony?.seatsPerRow || 0;

    return (
        <div className="event-seat-configurator fullpage">
            {/* Header */}
            <div className="configurator-header">
                <div className="header-left">
                    <h3>Configure Event Seating & Pricing</h3>
                    <p>Select categories, set prices, and click seats to customize.</p>
                </div>
                <div className="header-actions">
                    <button className="secondary-btn" onClick={onCancel}>
                        <FiX /> Cancel
                    </button>
                    <button className="primary-btn" onClick={handleSave}>
                        <FiCheck /> Save Configuration
                    </button>
                </div>
            </div>

            {/* Main Content - Split Layout */}
            <div className="configurator-main">
                {/* Left Sidebar - Category Selection & Pricing */}
                <div className="configurator-sidebar">
                    <div className="sidebar-section">
                        <h4>Paint Category</h4>
                        <p className="section-hint">Select a category, then click seats to apply</p>
                        <div className="category-list">
                            {Object.values(SEAT_TYPES).map(type => (
                                <button
                                    key={type}
                                    className={`category-select-btn type-${type} ${currentCategory === type ? 'active' : ''}`}
                                    onClick={() => setCurrentCategory(type)}
                                >
                                    <span className="cat-color"></span>
                                    <span className="cat-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                                    {currentCategory === type && <FiCheck className="cat-check" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section pricing-section">
                        <h4><FiDollarSign /> Set Prices</h4>
                        <p className="section-hint">Define price for each seat type</p>
                        <div className="pricing-inputs">
                            {Object.values(SEAT_TYPES).map(type => (
                                <div key={type} className={`price-input-row type-${type}`}>
                                    <span className="price-cat-color"></span>
                                    <label>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                                    <div className="price-input-wrapper">
                                        <span className="currency">$</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={pricing[type] || ''}
                                            onChange={(e) => handlePriceChange(type, e.target.value)}
                                            onFocus={(e) => {
                                                if (e.target.value === '0' || e.target.value === 0) {
                                                    handlePriceChange(type, '');
                                                }
                                            }}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="sidebar-section legend-section">
                        <h4>Legend</h4>
                        <div className="legend-list">
                            <div className="legend-item"><div className="legend-color standard" /><span>Standard</span></div>
                            <div className="legend-item"><div className="legend-color vip" /><span>VIP</span></div>
                            <div className="legend-item"><div className="legend-color premium" /><span>Premium</span></div>
                            <div className="legend-item"><div className="legend-color wheelchair" /><span>Wheelchair</span></div>
                            <div className="legend-item"><div className="legend-color disabled" /><span>Removed</span></div>
                        </div>
                    </div>
                </div>

                {/* Right - Theater Canvas (Scrollable, Fixed Frame) */}
                <div className="configurator-canvas-area">
                    <div className="canvas-scroll-container">
                        <div className="theater-canvas" style={{ position: 'relative' }}>
                            {/* Stage at TOP position */}
                            {theaterLayout?.stage?.position === 'top' && (
                                <div className="stage-area stage-top" style={{
                                    width: `${theaterLayout?.stage?.width || 80}%`,
                                    height: `${theaterLayout?.stage?.height || 60}px`
                                }}>
                                    STAGE
                                </div>
                            )}

                            {/* Labels overlay */}
                            {renderLabels()}

                            {/* Main Floor Seating - reverse rows if stage at bottom */}
                            <div className="seating-grid main-floor">
                                {(() => {
                                    const stageAtBottom = theaterLayout?.stage?.position === 'bottom';
                                    const rowIndices = Array.from({ length: mainFloorRows }, (_, i) => i);
                                    const orderedRows = stageAtBottom ? [...rowIndices].reverse() : rowIndices;

                                    return orderedRows.map((originalIndex) => {
                                        const rowLabel = theaterLayout?.mainFloor?.rowLabels?.[originalIndex] || getRowLabel(originalIndex);
                                        return renderRow('main', rowLabel, mainFloorSeats, originalIndex);
                                    });
                                })()}
                            </div>

                            {/* Balcony Section */}
                            {hasBalcony && balconyRows > 0 && (
                                <>
                                    <div className="balcony-divider">Balcony</div>
                                    <div className="seating-grid balcony-floor">
                                        {(() => {
                                            const stageAtBottom = theaterLayout?.stage?.position === 'bottom';
                                            const rowIndices = Array.from({ length: balconyRows }, (_, i) => i);
                                            const orderedRows = stageAtBottom ? [...rowIndices].reverse() : rowIndices;

                                            return orderedRows.map((originalIndex) => {
                                                const rowLabel = theaterLayout?.balcony?.rowLabels?.[originalIndex] || getRowLabel(originalIndex, 'B');
                                                return renderRow('balcony', rowLabel, balconySeats, originalIndex);
                                            });
                                        })()}
                                    </div>
                                </>
                            )}

                            {/* Stage at BOTTOM position */}
                            {theaterLayout?.stage?.position === 'bottom' && (
                                <div className="stage-area stage-bottom" style={{
                                    width: `${theaterLayout?.stage?.width || 80}%`,
                                    height: `${theaterLayout?.stage?.height || 60}px`
                                }}>
                                    STAGE
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSeatConfigurator;
