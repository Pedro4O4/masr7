// SeatSelector.jsx - Interactive seat selection for booking
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiDollarSign, FiCheck, FiX, FiAlertCircle,
    FiChevronUp, FiLoader
} from 'react-icons/fi';
import './SeatSelector.css';

const SEAT_TYPE_COLORS = {
    standard: { bg: '#4B5563', border: '#6B7280', label: 'Standard' },
    vip: { bg: '#D97706', border: '#F59E0B', label: 'VIP' },
    premium: { bg: '#7C3AED', border: '#8B5CF6', label: 'Premium' },
    wheelchair: { bg: '#2563EB', border: '#3B82F6', label: 'Wheelchair' }
};

const SeatSelector = ({
    eventId,
    onSeatsSelected,
    maxSeats = 10
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [theaterData, setTheaterData] = useState(null);
    const [seats, setSeats] = useState([]);
    const [seatPricing, setSeatPricing] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [hoveredSeat, setHoveredSeat] = useState(null);

    // Fetch seat availability
    useEffect(() => {
        fetchSeats();
    }, [eventId]);

    const fetchSeats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(
                `http://localhost:3000/api/v1/booking/event/${eventId}/seats`,
                { withCredentials: true }
            );

            if (response.data.success) {
                const data = response.data.data;
                console.log('=== SeatSelector Theater Data ===');
                console.log('removedSeats:', data.theater.layout.removedSeats);
                console.log('disabledSeats:', data.theater.layout.disabledSeats);
                console.log('vCorridors:', data.theater.layout.vCorridors);
                console.log('aislePositions:', data.theater.layout.mainFloor?.aislePositions);
                console.log('seatsPerRow:', data.theater.layout.mainFloor?.seatsPerRow);
                console.log('Seats count:', data.seats.length);
                setTheaterData(data.theater);
                setSeats(data.seats);
                setSeatPricing(data.seatPricing);
            }
        } catch (err) {
            console.error('Error fetching seats:', err);
            setError(err.response?.data?.message || 'Failed to load seats');
        } finally {
            setLoading(false);
        }
    };

    // Group seats by SECTION and ROW for easy lookup
    const seatMap = useMemo(() => {
        const map = new Map();
        seats.forEach(seat => {
            const key = `${seat.section}-${seat.row}-${seat.seatNumber}`;
            map.set(key, seat);
        });
        return map;
    }, [seats]);

    // Helpers from Designer logic
    const getHCorridorCount = useCallback((section, rowIndex) => {
        return theaterData?.layout?.hCorridors?.[`${section}-h-${rowIndex}`] || 0;
    }, [theaterData]);

    const getVCorridorCount = useCallback((section, colIndex) => {
        return theaterData?.layout?.vCorridors?.[`${section}-v-${colIndex}`] || 0;
    }, [theaterData]);

    const generateRowLabels = useCallback((count, prefix = '') => {
        return Array.from({ length: count }, (_, i) =>
            prefix + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')
        );
    }, []);

    const getOrderedRowLabels = useCallback((section) => {
        if (!theaterData) return [];
        const rows = section === 'balcony' ? theaterData.layout.balcony.rows : theaterData.layout.mainFloor.rows;
        const prefix = section === 'balcony' ? 'BALC-' : '';
        const labels = generateRowLabels(rows, prefix);

        // Stage position determines row order:
        // - Stage at TOP: Row A at top (first), going A→Z downward (normal order, no reverse)
        // - Stage at BOTTOM: Row A at bottom (last rendered), going Z→A visually (reversed)
        const stagePos = theaterData.layout.stage?.position || 'top';

        // For "top" stage: rows rendered top-to-bottom as A, B, C... (normal)
        // For "bottom" stage: rows rendered top-to-bottom as Z, Y, X... A (so A is near bottom stage)
        return stagePos === 'bottom' ? [...labels].reverse() : labels;
    }, [theaterData, generateRowLabels]);

    // Handle seat click
    const handleSeatClick = useCallback((seat) => {
        if (seat.isBooked || !seat.isActive) return;

        setSelectedSeats(prev => {
            const isSelected = prev.some(
                s => s.row === seat.row &&
                    s.seatNumber === seat.seatNumber &&
                    s.section === seat.section
            );

            if (isSelected) {
                return prev.filter(
                    s => !(s.row === seat.row &&
                        s.seatNumber === seat.seatNumber &&
                        s.section === seat.section)
                );
            } else {
                if (prev.length >= maxSeats) {
                    return prev; // Max reached
                }
                return [...prev, seat];
            }
        });
    }, [maxSeats]);

    // Calculate total price
    const totalPrice = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }, [selectedSeats]);

    // Notify parent of selection changes
    useEffect(() => {
        onSeatsSelected?.(selectedSeats, totalPrice);
    }, [selectedSeats, totalPrice, onSeatsSelected]);

    // Clear all selections
    const clearSelection = () => setSelectedSeats([]);

    // Render single seat seat-wrapper
    const renderSeatSlot = (section, rowLabel, seatNum) => {
        const seatKey = `${section}-${rowLabel}-${seatNum}`;
        const seat = seatMap.get(seatKey);

        const vCount = getVCorridorCount(section, seatNum);
        const vCorridorSpaces = Array.from({ length: vCount }).map((_, i) => (
            <div key={`vcor-${seatKey}-${i}`} className="v-corridor-space" />
        ));

        // Check if this is an aisle position (corridor column)
        const aislePositions = section === 'balcony'
            ? theaterData?.layout?.balcony?.aislePositions
            : theaterData?.layout?.mainFloor?.aislePositions;
        const isAisle = aislePositions?.includes(seatNum);

        // Debug: log for row A to see aisle check
        if (rowLabel === 'A' && (seatNum === 4 || seatNum === 9)) {
            console.log(`Aisle check: row=${rowLabel}, seat=${seatNum}, aislePositions=`, aislePositions, 'isAisle=', isAisle);
        }

        if (isAisle) {
            // Render as aisle/corridor column
            return (
                <React.Fragment key={seatKey}>
                    <div className="seat-slot aisle">
                        <span className="aisle-mark">|</span>
                    </div>
                    {vCorridorSpaces}
                </React.Fragment>
            );
        }

        if (!seat) {
            // Check if it's explicitly disabled or just removed
            const isDisabled = theaterData.layout.disabledSeats?.includes(seatKey);
            return (
                <React.Fragment key={seatKey}>
                    <div className={`seat-slot ${isDisabled ? 'disabled' : 'empty'}`}>
                        {isDisabled && <FiX />}
                    </div>
                    {vCorridorSpaces}
                </React.Fragment>
            );
        }


        const isSelected = selectedSeats.some(
            s => s.row === seat.row &&
                s.seatNumber === seat.seatNumber &&
                s.section === seat.section
        );
        const typeColors = SEAT_TYPE_COLORS[seat.seatType] || SEAT_TYPE_COLORS.standard;

        return (
            <React.Fragment key={seatKey}>
                <motion.button
                    className={`seat-btn ${seat.seatType} ${isSelected ? 'selected' : ''} ${seat.isBooked ? 'booked' : ''} ${!seat.isActive ? 'disabled' : ''}`}
                    style={{
                        '--seat-bg': typeColors.bg,
                        '--seat-border': typeColors.border
                    }}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={seat.isBooked || !seat.isActive}
                    whileHover={!seat.isBooked && seat.isActive ? { scale: 1.15 } : {}}
                    whileTap={!seat.isBooked && seat.isActive ? { scale: 0.95 } : {}}
                >
                    {isSelected && <FiCheck className="check-icon" />}
                    {seat.isBooked && <FiX className="booked-icon" />}
                    {!isSelected && !seat.isBooked && (
                        <span className="seat-num">{seat.seatNumber}</span>
                    )}
                </motion.button>
                {vCorridorSpaces}
            </React.Fragment>
        );
    };

    // Render horizontal corridor gaps
    const renderHCorridorGap = (section, rowIndex) => {
        const count = getHCorridorCount(section, rowIndex);
        return Array.from({ length: count }).map((_, i) => (
            <div key={`hgor-${section}-${rowIndex}-${i}`} className="h-corridor-space">
                <span className="corridor-label">CORRIDOR</span>
            </div>
        ));
    };

    // Render row
    const renderRow = (section, rowLabel, rowIndex) => {
        const seatsPerRow = section === 'balcony' ? theaterData.layout.balcony.seatsPerRow : theaterData.layout.mainFloor.seatsPerRow;
        const slots = [];

        // Pre-row corridor
        const preVCount = getVCorridorCount(section, 0);
        const preVSpaces = Array.from({ length: preVCount }).map((_, i) => (
            <div key={`vcor-${section}-${rowLabel}-pre-${i}`} className="v-corridor-space" />
        ));
        slots.push(<React.Fragment key="pre">{preVSpaces}</React.Fragment>);

        for (let s = 1; s <= seatsPerRow; s++) {
            slots.push(renderSeatSlot(section, rowLabel, s));
        }

        return (
            <React.Fragment key={`${section}-${rowLabel}`}>
                <div className="seat-row">
                    <span className="row-label">{rowLabel}</span>
                    <div className="row-seats">
                        {slots}
                    </div>
                    <span className="row-label">{rowLabel}</span>
                </div>
                {renderHCorridorGap(section, rowIndex)}
            </React.Fragment>
        );
    };

    // Render section
    const renderSection = (sectionName) => {
        if (!theaterData) return null;
        const rows = getOrderedRowLabels(sectionName);
        if (rows.length === 0) return null;

        return (
            <div key={sectionName} className={`section ${sectionName}-section`}>
                <div className="section-label">
                    {sectionName === 'balcony' && <FiChevronUp />}
                    {sectionName.toUpperCase()}
                </div>
                <div className="section-seats grid-layout">
                    {renderHCorridorGap(sectionName, -1)}
                    {rows.map((row, idx) => renderRow(sectionName, row, idx))}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="seat-selector loading">
                <FiLoader className="spinner" />
                <p>Loading seat map...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="seat-selector error">
                <FiAlertCircle />
                <p>{error}</p>
                <button onClick={fetchSeats}>Retry</button>
            </div>
        );
    }

    return (
        <div className="seat-selector">
            {/* Stage - render at top if position is 'top' */}
            {(theaterData?.layout?.stage?.position || 'top') === 'top' && (
                <motion.div
                    className="stage"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span>STAGE</span>
                </motion.div>
            )}

            {/* Seat Map */}
            <div className="seat-map-container">
                <div className="seat-map">
                    {theaterData?.layout?.hasBalcony && renderSection('balcony')}
                    {renderSection('main')}

                    {/* Designer Labels */}
                    {theaterData?.layout?.labels?.map(label => (
                        <div
                            key={label.id}
                            className="theater-label"
                            style={{
                                left: `${label.position.x}%`,
                                top: `${label.position.y}%`,
                                width: label.width || 'auto',
                                height: label.height || 'auto'
                            }}
                        >
                            <span className="label-icon">{label.icon}</span>
                            <span className="label-text">{label.text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stage - render at bottom if position is 'bottom' */}
            {theaterData?.layout?.stage?.position === 'bottom' && (
                <motion.div
                    className="stage stage-bottom"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <span>STAGE</span>
                </motion.div>
            )}

            {/* Legend */}
            <div className="seat-legend">
                {Object.entries(SEAT_TYPE_COLORS).map(([type, colors]) => {
                    const pricing = seatPricing.find(p => p.seatType === type);
                    return (
                        <div key={type} className="legend-item">
                            <div
                                className="legend-color"
                                style={{ background: colors.bg }}
                            />
                            <span>{colors.label}</span>
                            {pricing && <span className="legend-price">${pricing.price}</span>}
                        </div>
                    );
                })}
                <div className="legend-item">
                    <div className="legend-color booked" />
                    <span>Booked</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color selected-legend" />
                    <span>Selected</span>
                </div>
            </div>

            {/* Hover Tooltip */}
            <AnimatePresence>
                {hoveredSeat && !hoveredSeat.isBooked && hoveredSeat.isActive && (
                    <motion.div
                        className="seat-tooltip"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                    >
                        <strong>{hoveredSeat.row}{hoveredSeat.seatNumber}</strong>
                        <span className="tooltip-type">{SEAT_TYPE_COLORS[hoveredSeat.seatType]?.label}</span>
                        <span className="tooltip-price">${hoveredSeat.price}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selection Summary */}
            <AnimatePresence>
                {selectedSeats.length > 0 && (
                    <motion.div
                        className="selection-summary"
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                    >
                        <div className="summary-header">
                            <div className="summary-count">
                                <FiUsers />
                                <span>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected</span>
                            </div>
                            <button className="clear-btn" onClick={clearSelection}>
                                Clear All
                            </button>
                        </div>

                        <div className="selected-seats-list">
                            {selectedSeats.map(seat => (
                                <motion.div
                                    key={`${seat.section}-${seat.row}-${seat.seatNumber}`}
                                    className="selected-seat-chip"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <span>{seat.row}{seat.seatNumber}</span>
                                    <span className="chip-price">${seat.price}</span>
                                    <button
                                        onClick={() => handleSeatClick(seat)}
                                        className="remove-seat"
                                    >
                                        <FiX />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                        <div className="summary-total">
                            <FiDollarSign />
                            <span>Total:</span>
                            <strong>${totalPrice.toFixed(2)}</strong>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeatSelector;
