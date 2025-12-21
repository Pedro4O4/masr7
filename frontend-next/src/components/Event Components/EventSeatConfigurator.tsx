"use client";
import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiDollarSign } from 'react-icons/fi';
import { TheaterLayout } from '@/types/theater';
import './EventSeatConfigurator.css';

const SEAT_TYPES = {
    STANDARD: 'standard',
    VIP: 'vip',
    PREMIUM: 'premium',
    WHEELCHAIR: 'wheelchair'
};

interface SeatConfig {
    section: string;
    row: string;
    seatNumber: number;
    seatType: string;
}

interface EventSeatConfiguratorProps {
    theaterLayout: TheaterLayout;
    initialSeatConfig?: SeatConfig[];
    initialPricing?: Record<string, number>;
    onSave: (config: SeatConfig[], pricing: { seatType: string; price: number }[]) => void;
    onCancel: () => void;
}

const EventSeatConfigurator: React.FC<EventSeatConfiguratorProps> = ({
    theaterLayout, initialSeatConfig = [], initialPricing = {}, onSave, onCancel
}) => {
    const [currentCategory, setCurrentCategory] = useState(SEAT_TYPES.VIP);
    const [seatMap, setSeatMap] = useState<Record<string, string>>({});
    const [pricing, setPricing] = useState<Record<string, number>>({
        standard: initialPricing.standard || 0,
        vip: initialPricing.vip || 0,
        premium: initialPricing.premium || 0,
        wheelchair: initialPricing.wheelchair || 0
    });

    useEffect(() => {
        const initialMap: Record<string, string> = {};
        if (theaterLayout?.seatCategories) {
            Object.entries(theaterLayout.seatCategories).forEach(([key, type]) => {
                initialMap[key] = type;
            });
        }
        if (initialSeatConfig && initialSeatConfig.length > 0) {
            initialSeatConfig.forEach(cfg => {
                const key = `${cfg.section || 'main'}-${cfg.row}-${cfg.seatNumber}`;
                initialMap[key] = cfg.seatType;
            });
        }
        setSeatMap(initialMap);
    }, [theaterLayout, initialSeatConfig]);

    const isSeatRemoved = (section: string, row: string, seatNum: number) => {
        const key = `${section}-${row}-${seatNum}`;
        return theaterLayout?.removedSeats?.includes(key) || false;
    };

    const isSeatDisabled = (section: string, row: string, seatNum: number) => {
        const key = `${section}-${row}-${seatNum}`;
        return theaterLayout?.disabledSeats?.includes(key) || false;
    };

    const handleSeatClick = (section: string, rowLabel: string, seatNum: number) => {
        if (isSeatRemoved(section, rowLabel, seatNum) || isSeatDisabled(section, rowLabel, seatNum)) return;
        const key = `${section}-${rowLabel}-${seatNum}`;
        setSeatMap(prev => {
            const newMap = { ...prev };
            if (newMap[key] === currentCategory) delete newMap[key];
            else newMap[key] = currentCategory;
            return newMap;
        });
    };

    const handleRowClick = (section: string, rowLabel: string, seatsPerRow: number) => {
        setSeatMap(prev => {
            const newMap = { ...prev };
            let allHaveCategory = true;
            for (let i = 1; i <= seatsPerRow; i++) {
                if (isSeatRemoved(section, rowLabel, i) || isSeatDisabled(section, rowLabel, i)) continue;
                if (newMap[`${section}-${rowLabel}-${i}`] !== currentCategory) {
                    allHaveCategory = false;
                    break;
                }
            }
            for (let i = 1; i <= seatsPerRow; i++) {
                const key = `${section}-${rowLabel}-${i}`;
                if (isSeatRemoved(section, rowLabel, i) || isSeatDisabled(section, rowLabel, i)) continue;
                if (allHaveCategory) delete newMap[key];
                else newMap[key] = currentCategory;
            }
            return newMap;
        });
    };

    const handlePriceChange = (category: string, value: string) => {
        setPricing(prev => ({ ...prev, [category]: parseFloat(value) || 0 }));
    };

    const handleSave = () => {
        const configArray = Object.entries(seatMap).map(([key, type]) => {
            const parts = key.split('-');
            return { section: parts[0], row: parts[1], seatNumber: parseInt(parts[2]), seatType: type };
        });
        const pricingArray = Object.entries(pricing).map(([type, price]) => ({ seatType: type, price }));
        onSave(configArray, pricingArray);
    };

    const getRowLabel = (index: number, prefix = '') => {
        if (index < 26) return prefix + String.fromCharCode(65 + index);
        return prefix + 'R' + (index + 1);
    };

    const renderSeat = (section: string, rowLabel: string, seatIndex: number) => {
        const seatNum = seatIndex + 1;
        const key = `${section}-${rowLabel}-${seatNum}`;
        if (isSeatRemoved(section, rowLabel, seatNum)) return <div key={key} className="seat-slot empty" />;
        const isDisabled = isSeatDisabled(section, rowLabel, seatNum);
        const seatType = seatMap[key] || SEAT_TYPES.STANDARD;
        return (
            <div key={key} className={`seat ${seatType} ${isDisabled ? 'disabled-seat' : ''}`} onClick={() => !isDisabled && handleSeatClick(section, rowLabel, seatNum)} title={`${rowLabel}${seatNum} - ${seatType.toUpperCase()}${isDisabled ? ' (Disabled)' : ''} - $${pricing[seatType]}`}>
                <span className="seat-number">{seatNum}</span>
            </div>
        );
    };

    const renderRow = (section: string, rowLabel: string, seatsPerRow: number, rowIndex: number) => {
        const seats = [];
        for (let i = 0; i < seatsPerRow; i++) {
            seats.push(renderSeat(section, rowLabel, i));
            const vCorr = theaterLayout?.vCorridors?.[`${section}-v-${i + 1}`] || 0;
            for (let c = 0; c < vCorr; c++) seats.push(<div key={`vcorr-${rowLabel}-${i + 1}-${c}`} className="v-corridor" />);
        }
        const hCorr = theaterLayout?.hCorridors?.[`${section}-${rowIndex}`] || 0;
        return (
            <React.Fragment key={`row-${section}-${rowLabel}`}>
                <div className="seating-row">
                    <button className="row-label row-label-btn" onClick={() => handleRowClick(section, rowLabel, seatsPerRow)}>{rowLabel}</button>
                    <div className="seats-container">
                        {/* column 0 vertical corridor (left-most) */}
                        {(() => {
                            const vCorr0 = theaterLayout?.vCorridors?.[`${section}-v-0`] || 0;
                            return Array.from({ length: vCorr0 }).map((_, c) => <div key={`vcorr-${rowLabel}-0-${c}`} className="v-corridor" />);
                        })()}
                        {seats}
                    </div>
                    <button className="row-label row-label-btn" onClick={() => handleRowClick(section, rowLabel, seatsPerRow)}>{rowLabel}</button>
                </div>
                {Array.from({ length: hCorr }).map((_, idx) => <div key={`hcorr-${section}-${rowIndex}-${idx}`} className="h-corridor"><span className="corridor-label">CORRIDOR</span></div>)}
            </React.Fragment>
        );
    };

    const renderLabels = () => {
        if (!theaterLayout?.labels || theaterLayout.labels.length === 0) return null;
        return (
            <div className="theater-labels-overlay">
                {(theaterLayout.labels as any[]).map((label: any) => {
                    // Handle transition from percentage to pixels if necessary
                    // (Top-center anchored pixels: x is offset from center, y is absolute from top)
                    let style: React.CSSProperties = {
                        position: 'absolute',
                        width: label.width || 'auto',
                        height: label.height || 'auto'
                    };

                    // Simple heuristic: if x/y are very small and no isPixelBased flag, might be old percentages
                    // But in EventSeatConfigurator, we just render what we have.
                    // New logic: left: 50% + x px, top: y px
                    if (label.isPixelBased) {
                        style.left = `calc(50% + ${label.position?.x || 0}px)`;
                        style.top = `${label.position?.y || 0}px`;
                    } else {
                        // Compatibility for old percentage-based labels (0-100 range)
                        // If stage is at bottom, Row A should be at the bottom, 
                        // so maybe the entire theater scale/transform needs to handle this.
                        style.left = `${label.position?.x || 0}%`;
                        style.top = `${label.position?.y || 0}%`;
                    }

                    return (
                        <div key={label.id} className="theater-label" style={style}>
                            {label.icon && <span className="label-icon">{label.icon}</span>}
                            <span className="label-text">{label.text}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const mainFloorRows = theaterLayout?.mainFloor?.rows || 10;
    const mainFloorSeats = theaterLayout?.mainFloor?.seatsPerRow || 12;

    // Synchronized row numbering: Row 'A' always closest to stage
    const mainRowLabels = (() => {
        const labels = Array.from({ length: mainFloorRows }, (_, i) => getRowLabel(i));
        const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
        return isStageAtBottom ? [...labels].reverse() : labels;
    })();

    const balconyRows = theaterLayout?.balcony?.rows || 0;
    const balconyRowLabels = (() => {
        const labels = Array.from({ length: balconyRows }, (_, i) => getRowLabel(i, 'B'));
        const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
        return isStageAtBottom ? [...labels].reverse() : labels;
    })();

    return (
        <div className="event-seat-configurator fullpage">
            <div className="configurator-header">
                <div className="header-left"><h3>Configure Event Seating & Pricing</h3><p>Select categories, set prices, and click seats to customize.</p></div>
                <div className="header-actions"><button className="secondary-btn" onClick={onCancel}><FiX /> Cancel</button><button className="primary-btn" onClick={handleSave}><FiCheck /> Save Configuration</button></div>
            </div>
            <div className="configurator-main">
                <div className="configurator-sidebar">
                    <div className="sidebar-section">
                        <h4>Paint Category</h4>
                        <p className="section-hint">Select a category, then click seats to apply</p>
                        <div className="category-list">
                            {Object.values(SEAT_TYPES).map(type => (
                                <button key={type} className={`category-select-btn type-${type} ${currentCategory === type ? 'active' : ''}`} onClick={() => setCurrentCategory(type)}>
                                    <span className="cat-color"></span><span className="cat-name">{type.charAt(0).toUpperCase() + type.slice(1)}</span>{currentCategory === type && <FiCheck className="cat-check" />}
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
                                    <span className="price-cat-color"></span><label>{type.charAt(0).toUpperCase() + type.slice(1)}</label>
                                    <div className="price-input-wrapper"><span className="currency">$</span><input type="text" inputMode="decimal" value={pricing[type] || ''} onChange={(e) => handlePriceChange(type, e.target.value)} placeholder="0.00" /></div>
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
                <div className="configurator-canvas-area">
                    <div className="canvas-scroll-container">
                        <div className="theater-canvas" style={{ position: 'relative' }}>
                            {theaterLayout?.stage?.position === 'top' && (
                                <div className="stage-area stage-top" style={{ width: `${theaterLayout?.stage?.width || 80}%`, height: `${theaterLayout?.stage?.height || 60}px` }}>STAGE</div>
                            )}
                            {renderLabels()}

                            {/* Render order depends on stage position to keep Main Floor closest to stage */}
                            {theaterLayout?.stage?.position === 'top' ? (
                                <>
                                    <div className="seating-grid main-floor">
                                        {mainRowLabels.map((rowLabel, idx) => {
                                            const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
                                            const displayLabel = isStageAtBottom ? rowLabel : (theaterLayout?.mainFloor?.rowLabels?.[idx] || rowLabel);
                                            return renderRow('main', displayLabel, mainFloorSeats, idx);
                                        })}
                                    </div>
                                    {theaterLayout?.hasBalcony && (
                                        <div className="seating-grid balcony-floor">
                                            <div className="balcony-divider">Balcony</div>
                                            {balconyRowLabels.map((rowLabel, idx) => {
                                                const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
                                                const displayLabel = isStageAtBottom ? rowLabel : (theaterLayout?.balcony?.rowLabels?.[idx] || rowLabel);
                                                return renderRow('balcony', displayLabel, theaterLayout.balcony?.seatsPerRow || 0, idx);
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    {theaterLayout?.hasBalcony && (
                                        <div className="seating-grid balcony-floor">
                                            <div className="balcony-divider">Balcony</div>
                                            {balconyRowLabels.map((rowLabel, idx) => {
                                                const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
                                                const displayLabel = isStageAtBottom ? rowLabel : (theaterLayout?.balcony?.rowLabels?.[idx] || rowLabel);
                                                return renderRow('balcony', displayLabel, theaterLayout.balcony?.seatsPerRow || 0, idx);
                                            })}
                                        </div>
                                    )}
                                    <div className="seating-grid main-floor">
                                        {mainRowLabels.map((rowLabel, idx) => {
                                            const isStageAtBottom = theaterLayout?.stage?.position?.toLowerCase() === 'bottom';
                                            const displayLabel = isStageAtBottom ? rowLabel : (theaterLayout?.mainFloor?.rowLabels?.[idx] || rowLabel);
                                            return renderRow('main', displayLabel, mainFloorSeats, idx);
                                        })}
                                    </div>
                                </>
                            )}

                            {theaterLayout?.stage?.position === 'bottom' && (
                                <div className="stage-area stage-bottom" style={{ width: `${theaterLayout?.stage?.width || 80}%`, height: `${theaterLayout?.stage?.height || 60}px` }}>STAGE</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventSeatConfigurator;
