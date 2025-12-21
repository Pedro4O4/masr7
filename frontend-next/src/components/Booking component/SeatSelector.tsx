"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiUsers, FiDollarSign, FiCheck, FiX, FiAlertCircle,
    FiChevronUp, FiLoader
} from 'react-icons/fi';
import { Theater } from '@/types/theater';
import { Seat, SeatPricing } from '@/types/booking';
import './SeatSelector.css';

const SEAT_TYPE_COLORS: Record<string, { bg: string; border: string; label: string }> = {
    standard: { bg: '#4B5563', border: '#6B7280', label: 'Standard' },
    vip: { bg: '#D97706', border: '#F59E0B', label: 'VIP' },
    premium: { bg: '#7C3AED', border: '#8B5CF6', label: 'Premium' },
    wheelchair: { bg: '#2563EB', border: '#3B82F6', label: 'Wheelchair' }
};

interface SeatSelectorProps {
    eventId: string;
    onSeatsSelected?: (seats: Seat[], totalPrice: number) => void;
    maxSeats?: number;
    readOnly?: boolean;
    highlightedSeats?: { row: string; seatNumber: number; section: string }[];
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
    eventId,
    onSeatsSelected,
    maxSeats = 10,
    readOnly = false,
    highlightedSeats = []
}) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [theaterData, setTheaterData] = useState<Theater | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [seatPricing, setSeatPricing] = useState<SeatPricing[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [hoveredSeat, setHoveredSeat] = useState<Seat | null>(null);

    // Fetch seat availability
    useEffect(() => {
        const fetchSeats = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.get<any>(`/booking/event/${eventId}/seats`);

                if (response.data.success) {
                    const data = response.data.data;
                    setTheaterData(data.theater);
                    setSeats(data.seats);
                    setSeatPricing(data.seatPricing);
                }
            } catch (err: any) {
                console.error('Error fetching seats:', err);
                setError(err.response?.data?.message || 'Failed to load seats');
            } finally {
                setLoading(false);
            }
        };
        fetchSeats();
    }, [eventId]);

    // Group seats by SECTION and ROW for easy lookup
    const seatMap = useMemo(() => {
        const map = new Map<string, Seat>();
        seats.forEach(seat => {
            const key = `${seat.section}-${seat.row}-${seat.seatNumber}`;
            map.set(key, seat);
        });
        return map;
    }, [seats]);

    // Helpers
    const getHCorridorCount = useCallback((section: string, rowIndex: number) => {
        return theaterData?.layout?.hCorridors?.[`${section}-h-${rowIndex}`] || 0;
    }, [theaterData]);

    const getVCorridorCount = useCallback((section: string, colIndex: number) => {
        return theaterData?.layout?.vCorridors?.[`${section}-v-${colIndex}`] || 0;
    }, [theaterData]);

    const generateRowLabels = useCallback((count: number, prefix: string = '') => {
        return Array.from({ length: count }, (_, i) =>
            prefix + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')
        );
    }, []);

    const getOrderedRowLabels = useCallback((section: 'main' | 'balcony') => {
        if (!theaterData) return [];
        const floor = section === 'balcony' ? theaterData.layout.balcony : theaterData.layout.mainFloor;
        if (!floor) return [];

        const prefix = section === 'balcony' ? 'BALC-' : '';
        const labels = generateRowLabels(floor.rows, prefix);
        const stagePos = theaterData.layout.stage?.position || 'top';

        return stagePos === 'bottom' ? [...labels].reverse() : labels;
    }, [theaterData, generateRowLabels]);

    // Handle seat click
    const handleSeatClick = useCallback((seat: Seat) => {
        if (readOnly || seat.isBooked || !seat.isActive) return;

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
                if (prev.length >= maxSeats) return prev;
                return [...prev, seat];
            }
        });
    }, [maxSeats]);

    // Calculate total price
    const totalPrice = useMemo(() => {
        return selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
    }, [selectedSeats]);

    // Notify parent
    useEffect(() => {
        onSeatsSelected?.(selectedSeats, totalPrice);
    }, [selectedSeats, totalPrice, onSeatsSelected]);

    const clearSelection = () => setSelectedSeats([]);

    // Render single seat
    const renderSeatSlot = (section: string, rowLabel: string, seatNum: number) => {
        const seatKey = `${section}-${rowLabel}-${seatNum}`;
        const seat = seatMap.get(seatKey);

        const vCount = getVCorridorCount(section, seatNum);
        const vCorridorSpaces = Array.from({ length: vCount }).map((_, i) => (
            <div key={`vcor-${seatKey}-${i}`} className="v-corridor-space" />
        ));

        if (!seat) {
            const isDisabled = theaterData?.layout.disabledSeats?.includes(seatKey);
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

        const isHighlighted = highlightedSeats.some(
            s => s.row === seat.row &&
                s.seatNumber === seat.seatNumber &&
                s.section === seat.section
        );

        const typeColors = SEAT_TYPE_COLORS[seat.seatType] || SEAT_TYPE_COLORS.standard;

        return (
            <React.Fragment key={seatKey}>
                <motion.button
                    className={`seat-btn ${seat.seatType} ${isSelected ? 'selected' : ''} ${isHighlighted ? 'highlighted' : ''} ${seat.isBooked && !isHighlighted ? 'booked' : ''} ${!seat.isActive ? 'disabled' : ''}`}
                    style={{
                        '--seat-bg': typeColors.bg,
                        '--seat-border': typeColors.border
                    } as any}
                    onClick={() => handleSeatClick(seat)}
                    onMouseEnter={() => !readOnly && setHoveredSeat(seat)}
                    onMouseLeave={() => setHoveredSeat(null)}
                    disabled={(seat.isBooked && !isHighlighted) || !seat.isActive || readOnly}
                    whileHover={!seat.isBooked && seat.isActive && !readOnly ? { scale: 1.15 } : {}}
                    whileTap={!seat.isBooked && seat.isActive && !readOnly ? { scale: 0.95 } : {}}
                >
                    {(isSelected || isHighlighted) && <FiCheck className="check-icon" />}
                    {seat.isBooked && !isHighlighted && <FiX className="booked-icon" />}
                    {!isSelected && !isHighlighted && !seat.isBooked && (
                        <span className="seat-num">{seat.seatNumber}</span>
                    )}
                </motion.button>
                {vCorridorSpaces}
            </React.Fragment>
        );
    };

    const renderHCorridorGap = (section: string, rowIndex: number) => {
        const count = getHCorridorCount(section, rowIndex);
        return Array.from({ length: count }).map((_, i) => (
            <div key={`hgor-${section}-${rowIndex}-${i}`} className="h-corridor-space">
                <span className="corridor-label">CORRIDOR</span>
            </div>
        ));
    };

    const renderRow = (section: 'main' | 'balcony', rowLabel: string, rowIndex: number) => {
        const floor = section === 'balcony' ? theaterData?.layout.balcony : theaterData?.layout.mainFloor;
        const seatsPerRow = floor?.seatsPerRow || 0;
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

    const renderSection = (sectionName: 'main' | 'balcony') => {
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

    if (loading) return <div className="seat-selector loading"><FiLoader className="spinner" /><p>Loading seat map...</p></div>;
    if (error) return <div className="seat-selector error"><FiAlertCircle /><p>{error}</p><button onClick={() => window.location.reload()}>Retry</button></div>;

    return (
        <div className="seat-selector">
            {(theaterData?.layout.stage?.position || 'top') === 'top' && (
                <motion.div className="stage" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                    <span>STAGE</span>
                </motion.div>
            )}

            <div className="seat-map-container">
                <div className="seat-map">
                    {theaterData?.layout.hasBalcony && renderSection('balcony')}
                    {renderSection('main')}

                    {theaterData?.layout.labels?.map(label => (
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

            {theaterData?.layout.stage?.position === 'bottom' && (
                <motion.div className="stage stage-bottom" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <span>STAGE</span>
                </motion.div>
            )}

            <div className="seat-legend">
                {Object.entries(SEAT_TYPE_COLORS).map(([type, colors]) => {
                    const pricing = seatPricing.find(p => p.seatType === type);
                    return (
                        <div key={type} className="legend-item">
                            <div className="legend-color" style={{ background: colors.bg }} />
                            <span>{colors.label}</span>
                            {pricing && <span className="legend-price">${pricing.price}</span>}
                        </div>
                    );
                })}
                <div className="legend-item"><div className="legend-color booked" /><span>Booked</span></div>
                <div className="legend-item">
                    <div className={`legend-color ${readOnly ? 'highlighted' : 'selected-legend'}`} />
                    <span>{readOnly ? 'Your Seats' : 'Selected'}</span>
                </div>
            </div>

            <AnimatePresence>
                {hoveredSeat && !hoveredSeat.isBooked && hoveredSeat.isActive && (
                    <motion.div className="seat-tooltip" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                        <strong>{hoveredSeat.row}{hoveredSeat.seatNumber}</strong>
                        <span className="tooltip-type">{SEAT_TYPE_COLORS[hoveredSeat.seatType]?.label}</span>
                        <span className="tooltip-price">${hoveredSeat.price}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {!readOnly && selectedSeats.length > 0 && (
                    <motion.div className="selection-summary" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}>
                        <div className="summary-header">
                            <div className="summary-count"><FiUsers /><span>{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''} selected</span></div>
                            <button className="clear-btn" onClick={clearSelection}>Clear All</button>
                        </div>
                        <div className="selected-seats-list">
                            {selectedSeats.map(seat => (
                                <motion.div key={`${seat.section}-${seat.row}-${seat.seatNumber}`} className="selected-seat-chip" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                    <span>{seat.row}{seat.seatNumber}</span>
                                    <span className="chip-price">${seat.price}</span>
                                    <button onClick={() => handleSeatClick(seat)} className="remove-seat"><FiX /></button>
                                </motion.div>
                            ))}
                        </div>
                        <div className="summary-total"><FiDollarSign /><span>Total:</span><strong>${totalPrice.toFixed(2)}</strong></div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SeatSelector;

