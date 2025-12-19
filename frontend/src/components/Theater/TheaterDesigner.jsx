// TheaterDesigner.jsx - Enhanced with vertical + horizontal corridors, seat removal, drag-drop
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiGrid, FiMaximize2, FiMinimize2, FiSave, FiPlus, FiMinus,
    FiLayers, FiSettings, FiChevronsUp, FiChevronsDown,
    FiTrash2, FiMove, FiSlash, FiX, FiCheck
} from 'react-icons/fi';
import './TheaterDesigner.css';

// Tool modes for admin
const TOOLS = {
    SELECT: 'select',
    REMOVE: 'remove',
    DISABLE: 'disable',         // Disable seat slots permanently (no + sign)
    CORRIDOR_H: 'corridor_h',   // Horizontal corridor (between rows)
    CORRIDOR_V: 'corridor_v',   // Vertical corridor (between columns)
    LABEL: 'label',              // Add/edit labels
    CATEGORY: 'category'        // Assign seat types (VIP, Premium, etc.)
};

const SEAT_TYPES = {
    STANDARD: 'standard',
    VIP: 'vip',
    PREMIUM: 'premium',
    WHEELCHAIR: 'wheelchair'
};

// Preset label types
const LABEL_PRESETS = [
    { text: 'ENTRY', icon: '🚪' },
    { text: 'EXIT', icon: '🚪' },
    { text: 'SOUND', icon: '🔊' },
    { text: 'LIGHTS', icon: '💡' },
    { text: 'CAMERA', icon: '📷' },
    { text: 'VIP AREA', icon: '⭐' },
    { text: 'RESTROOM', icon: '🚻' },
    { text: 'WHEELCHAIR', icon: '♿' },
    { text: 'CUSTOM', icon: '📝' }
];

const TheaterDesigner = ({
    initialLayout = null,
    onSave,
    isPreviewMode = false
}) => {
    // Layout state
    const [layout, setLayout] = useState(initialLayout || {
        stage: { position: 'top', width: 80, height: 15 },
        mainFloor: { rows: 10, seatsPerRow: 12, aislePositions: [4, 9] },
        hasBalcony: false,
        balcony: { rows: 3, seatsPerRow: 10, aislePositions: [] }
    });

    // Removed and disabled seats
    const [removedSeats, setRemovedSeats] = useState(new Set(initialLayout?.removedSeats || []));
    const [disabledSeats, setDisabledSeats] = useState(new Set(initialLayout?.disabledSeats || []));
    const [hCorridors, setHCorridors] = useState(initialLayout?.hCorridors || {}); // { [key]: count }
    const [vCorridors, setVCorridors] = useState(initialLayout?.vCorridors || {}); // { [key]: count }
    const [seatCategories, setSeatCategories] = useState(initialLayout?.seatCategories || {}); // { [seatKey]: type }
    const [currentCategory, setCurrentCategory] = useState(SEAT_TYPES.VIP);

    // UI state
    const [selectedSeats, setSelectedSeats] = useState(new Set());
    const [currentTool, setCurrentTool] = useState(TOOLS.SELECT);
    const [showSettings, setShowSettings] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Drag state
    const [draggedSeat, setDraggedSeat] = useState(null);
    const [dragOverTarget, setDragOverTarget] = useState(null);

    // Labels state
    const [labels, setLabels] = useState(initialLayout?.labels || []);
    const [showLabelModal, setShowLabelModal] = useState(false);
    const [editingLabel, setEditingLabel] = useState(null);
    const [newLabelText, setNewLabelText] = useState('');
    const [selectedLabelPreset, setSelectedLabelPreset] = useState(null);
    const [draggingLabel, setDraggingLabel] = useState(null);
    const [resizingLabel, setResizingLabel] = useState(null);
    const wasDragging = React.useRef(false);
    const canvasRef = React.useRef(null);
    const hasInitialSync = React.useRef(false);

    // Sync state if initialLayout changes (only once or on deep change)
    useEffect(() => {
        if (initialLayout && !hasInitialSync.current) {
            setLayout(initialLayout);
            setRemovedSeats(new Set(initialLayout.removedSeats || []));
            setDisabledSeats(new Set(initialLayout.disabledSeats || []));
            setHCorridors(initialLayout.hCorridors || {});
            setVCorridors(initialLayout.vCorridors || {});
            setSeatCategories(initialLayout.seatCategories || {});
            setLabels(initialLayout.labels || []);
            hasInitialSync.current = true;
        }
    }, [initialLayout]);

    // Label movement logic at window level for robustness
    useEffect(() => {
        if (!draggingLabel && !resizingLabel) return;

        const handleMouseMove = (e) => {
            if (!canvasRef.current) return;

            const rect = canvasRef.current.getBoundingClientRect();
            // Crucial: rect contains the scaled pixels, so we divide by zoomLevel to get logical pixels
            const logicalWidth = rect.width / zoomLevel;
            const logicalHeight = rect.height / zoomLevel;

            const mouseX = (e.clientX - rect.left) / zoomLevel;
            const mouseY = (e.clientY - rect.top) / zoomLevel;

            const xPct = (mouseX / logicalWidth) * 100;
            const yPct = (mouseY / logicalHeight) * 100;

            if (draggingLabel) {
                wasDragging.current = true;
                setLabels(prev => prev.map(l =>
                    l.id === draggingLabel
                        ? { ...l, position: { x: Math.max(0, Math.min(100, xPct)), y: Math.max(0, Math.min(100, yPct)) } }
                        : l
                ));
            }

            if (resizingLabel) {
                wasDragging.current = true;
                setLabels(prev => prev.map(l => {
                    if (l.id !== resizingLabel.id) return l;

                    const labelCenterX = (l.position.x / 100) * logicalWidth;
                    const labelCenterY = (l.position.y / 100) * logicalHeight;

                    if (resizingLabel.type === 'width') {
                        const dist = Math.abs(mouseX - labelCenterX);
                        return { ...l, width: Math.max(60, dist * 2) };
                    } else if (resizingLabel.type === 'height') {
                        const dist = Math.abs(mouseY - labelCenterY);
                        return { ...l, height: Math.max(24, dist * 2) };
                    }
                    return l;
                }));
            }
        };

        const handleMouseUp = () => {
            if (draggingLabel || resizingLabel) {
                // Keep wasDragging true for a short moment so onClick can see it
                setTimeout(() => { wasDragging.current = false; }, 50);
            }
            setDraggingLabel(null);
            setResizingLabel(null);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [draggingLabel, resizingLabel, zoomLevel]); // REMOVED labels from dependency!

    // Generate row labels (A, B, C, ...)
    const generateRowLabels = useCallback((count, prefix = '') => {
        return Array.from({ length: count }, (_, i) =>
            prefix + String.fromCharCode(65 + (i % 26)) + (i >= 26 ? Math.floor(i / 26) : '')
        );
    }, []);

    // Get display order for rows based on stage position
    // When stage is at bottom, reverse the rows so A is closest to stage
    const mainRowLabels = useMemo(() => {
        const labels = generateRowLabels(layout.mainFloor.rows);
        return layout.stage.position === 'bottom' ? [...labels].reverse() : labels;
    }, [layout.mainFloor.rows, layout.stage.position, generateRowLabels]);

    const balconyRowLabels = useMemo(() => {
        const labels = generateRowLabels(layout.balcony.rows, 'BALC-');
        return layout.stage.position === 'bottom' ? [...labels].reverse() : labels;
    }, [layout.balcony.rows, layout.stage.position, generateRowLabels]);

    // Handle seat click based on current tool
    const handleSeatClick = useCallback((row, seatNum, section, e) => {
        if (isPreviewMode) return;

        const seatKey = `${section}-${row}-${seatNum}`;

        switch (currentTool) {
            case TOOLS.REMOVE:
                // Only allow removing if not disabled
                if (!disabledSeats.has(seatKey)) {
                    setRemovedSeats(prev => {
                        const next = new Set(prev);
                        if (next.has(seatKey)) {
                            next.delete(seatKey);
                        } else {
                            next.add(seatKey);
                        }
                        return next;
                    });
                }
                break;

            case TOOLS.DISABLE:
                // Toggle disabled state (permanently no seat, no + sign)
                setDisabledSeats(prev => {
                    const next = new Set(prev);
                    if (next.has(seatKey)) {
                        next.delete(seatKey);
                    } else {
                        next.add(seatKey);
                        // Also remove from removed seats if it was there
                        setRemovedSeats(r => {
                            const nr = new Set(r);
                            nr.delete(seatKey);
                            return nr;
                        });
                    }
                    return next;
                });
                break;

            case TOOLS.CATEGORY:
                // Assign category to seat
                setSeatCategories(prev => {
                    const next = { ...prev };
                    if (next[seatKey] === currentCategory) {
                        delete next[seatKey]; // Toggle off if already this category
                    } else {
                        next[seatKey] = currentCategory;
                    }
                    return next;
                });
                break;

            case TOOLS.SELECT:
            default:
                if (e.ctrlKey || e.metaKey) {
                    setSelectedSeats(prev => {
                        const next = new Set(prev);
                        if (next.has(seatKey)) {
                            next.delete(seatKey);
                        } else {
                            next.add(seatKey);
                        }
                        return next;
                    });
                } else {
                    setSelectedSeats(new Set([seatKey]));
                }
                break;
        }
    }, [isPreviewMode, currentTool]);

    // Bulk remove selected seats
    const removeSelectedSeats = useCallback(() => {
        setRemovedSeats(prev => new Set([...prev, ...selectedSeats]));
        setSelectedSeats(new Set());
    }, [selectedSeats]);

    // Restore selected seats
    const restoreSelectedSeats = useCallback(() => {
        setRemovedSeats(prev => {
            const next = new Set(prev);
            selectedSeats.forEach(key => next.delete(key));
            return next;
        });
        setSelectedSeats(new Set());
    }, [selectedSeats]);

    // Toggle horizontal corridor (between rows)
    const toggleHCorridor = useCallback((section, rowIndex, e = null) => {
        const corridorKey = `${section}-h-${rowIndex}`;
        const isRemoveAction = currentTool === TOOLS.REMOVE || (e?.altKey);

        setHCorridors(prev => {
            const next = { ...prev };
            const currentCount = next[corridorKey] || 0;

            if (isRemoveAction) {
                if (currentCount > 0) {
                    next[corridorKey] = currentCount - 1;
                    if (next[corridorKey] === 0) delete next[corridorKey];
                }
            } else {
                next[corridorKey] = currentCount + 1;
            }
            return next;
        });
    }, [currentTool]);

    // Toggle vertical corridor (between columns)
    const toggleVCorridor = useCallback((section, colIndex, e = null) => {
        const corridorKey = `${section}-v-${colIndex}`;
        const isRemoveAction = currentTool === TOOLS.REMOVE || (e?.altKey);

        setVCorridors(prev => {
            const next = { ...prev };

            // Correction for colIndex 0 key consistency
            const key = corridorKey; // Use the generated key directly
            const count = next[key] || 0;

            if (isRemoveAction) {
                if (count > 0) {
                    next[key] = count - 1;
                    if (next[key] === 0) delete next[key];
                }
            } else {
                next[key] = count + 1;
            }
            return next;
        });
    }, [currentTool]);

    // Check if row has a horizontal corridor after it
    const hasHCorridorAfter = useCallback((section, rowIndex) => {
        return (hCorridors[`${section}-h-${rowIndex}`] || 0) > 0;
    }, [hCorridors]);

    // Check if column has a vertical corridor after it
    const hasVCorridorAfter = useCallback((section, colIndex) => {
        return (vCorridors[`${section}-v-${colIndex}`] || 0) > 0;
    }, [vCorridors]);

    // Get count for corridors
    const getHCorridorCount = useCallback((section, rowIndex) => {
        return hCorridors[`${section}-h-${rowIndex}`] || 0;
    }, [hCorridors]);

    const getVCorridorCount = useCallback((section, colIndex) => {
        return vCorridors[`${section}-v-${colIndex}`] || 0;
    }, [vCorridors]);

    // Handle layout changes
    const updateMainFloor = useCallback((key, value) => {
        setLayout(prev => ({
            ...prev,
            mainFloor: { ...prev.mainFloor, [key]: value }
        }));
    }, []);

    const updateBalcony = useCallback((key, value) => {
        setLayout(prev => ({
            ...prev,
            balcony: { ...prev.balcony, [key]: value }
        }));
    }, []);

    const updateStage = useCallback((key, value) => {
        setLayout(prev => ({
            ...prev,
            stage: { ...prev.stage, [key]: value }
        }));
    }, []);

    // Drag and drop handlers
    const handleDragStart = useCallback((e, seatKey) => {
        if (currentTool !== TOOLS.SELECT) return;
        setDraggedSeat(seatKey);
        e.dataTransfer.effectAllowed = 'move';
    }, [currentTool]);

    const handleDragOver = useCallback((e, seatKey) => {
        e.preventDefault();
        if (draggedSeat && seatKey !== draggedSeat && removedSeats.has(seatKey)) {
            setDragOverTarget(seatKey);
        }
    }, [draggedSeat, removedSeats]);

    const handleDrop = useCallback((e, targetKey) => {
        e.preventDefault();
        if (draggedSeat && targetKey !== draggedSeat && removedSeats.has(targetKey)) {
            setRemovedSeats(prev => {
                const next = new Set(prev);
                next.add(draggedSeat);
                next.delete(targetKey);
                return next;
            });
        }
        setDraggedSeat(null);
        setDragOverTarget(null);
    }, [draggedSeat, removedSeats]);

    const handleDragEnd = useCallback(() => {
        setDraggedSeat(null);
        setDragOverTarget(null);
    }, []);

    // Calculate total active seats
    const totalSeats = useMemo(() => {
        let mainSeats = layout.mainFloor.rows * layout.mainFloor.seatsPerRow;
        let balconySeats = layout.hasBalcony
            ? layout.balcony.rows * layout.balcony.seatsPerRow
            : 0;
        const totalPossible = mainSeats + balconySeats;
        const removed = removedSeats.size;
        const disabled = disabledSeats.size;
        return totalPossible - removed - disabled;
    }, [layout, removedSeats, disabledSeats]);

    // Handle save
    const handleSave = useCallback(() => {
        const seatConfigArray = [];

        mainRowLabels.forEach((rowLabel) => {
            for (let s = 1; s <= layout.mainFloor.seatsPerRow; s++) {
                const seatKey = `main-${rowLabel}-${s}`;
                if (!removedSeats.has(seatKey)) {
                    seatConfigArray.push({
                        section: 'main',
                        row: rowLabel,
                        seatNumber: s,
                        seatType: 'standard',
                        isActive: true
                    });
                }
            }
        });

        if (layout.hasBalcony) {
            balconyRowLabels.forEach((rowLabel) => {
                for (let s = 1; s <= layout.balcony.seatsPerRow; s++) {
                    const seatKey = `balcony-${rowLabel}-${s}`;
                    if (!removedSeats.has(seatKey)) {
                        seatConfigArray.push({
                            section: 'balcony',
                            row: rowLabel,
                            seatNumber: s,
                            seatType: 'standard',
                            isActive: true
                        });
                    }
                }
            });
        }

        onSave?.({
            layout,
            seatConfig: seatConfigArray,
            removedSeats: Array.from(removedSeats),
            disabledSeats: Array.from(disabledSeats),
            hCorridors,
            vCorridors,
            labels: labels,
            totalSeats
        });
    }, [layout, removedSeats, disabledSeats, hCorridors, vCorridors, labels, totalSeats, onSave, mainRowLabels, balconyRowLabels]);

    // Label management
    const addLabel = useCallback((position) => {
        setEditingLabel({
            id: Date.now(),
            text: '',
            position: position,
            isNew: true
        });
        setNewLabelText('');
        setSelectedLabelPreset(null);
        setShowLabelModal(true);
    }, []);

    const saveLabel = useCallback(() => {
        if (!editingLabel) return;

        const labelText = selectedLabelPreset?.text === 'CUSTOM'
            ? newLabelText
            : (selectedLabelPreset?.text || newLabelText);

        if (!labelText.trim()) return;

        const labelData = {
            id: editingLabel.id,
            text: labelText.trim(),
            icon: selectedLabelPreset?.icon || '📍',
            position: editingLabel.position
        };

        if (editingLabel.isNew) {
            setLabels(prev => [...prev, labelData]);
        } else {
            setLabels(prev => prev.map(l => l.id === editingLabel.id ? labelData : l));
        }

        setShowLabelModal(false);
        setEditingLabel(null);
        setNewLabelText('');
        setSelectedLabelPreset(null);
    }, [editingLabel, newLabelText, selectedLabelPreset]);

    const deleteLabel = useCallback((labelId) => {
        setLabels(prev => prev.filter(l => l.id !== labelId));
        setShowLabelModal(false);
        setEditingLabel(null);
    }, []);

    const handleCanvasClick = useCallback((e) => {
        if (currentTool !== TOOLS.LABEL) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        addLabel({ x, y });
    }, [currentTool, addLabel]);

    const handleLabelClick = useCallback((label, e) => {
        e.stopPropagation();
        setEditingLabel(label);
        setNewLabelText(label.text);
        setSelectedLabelPreset(LABEL_PRESETS.find(p => p.text === label.text) || null);
        setShowLabelModal(true);
    }, []);

    // Render single seat with optional vertical corridor after it
    const renderSeat = (row, seatNum, section, seatsPerRow) => {
        const seatKey = `${section}-${row}-${seatNum}`;
        const isDisabled = disabledSeats.has(seatKey);
        const isRemoved = removedSeats.has(seatKey);
        const isSelected = selectedSeats.has(seatKey);
        const isDragOver = dragOverTarget === seatKey;

        let seatElement;

        if (isDisabled) {
            // Disabled slot - no chair can be placed here, no + sign
            seatElement = (
                <div
                    key={seatKey}
                    className={`seat-slot disabled ${currentTool === TOOLS.DISABLE ? 'can-enable' : ''}`}
                    onClick={(e) => handleSeatClick(row, seatNum, section, e)}
                    title={currentTool === TOOLS.DISABLE ? `Click to enable this slot` : `Disabled - no seat here`}
                >
                    <FiX className="disabled-icon" />
                </div>
            );
        } else if (isRemoved) {
            // Removed seat - can be restored with + sign
            seatElement = (
                <div
                    key={seatKey}
                    className={`seat-slot empty clickable ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={(e) => handleDragOver(e, seatKey)}
                    onDrop={(e) => handleDrop(e, seatKey)}
                    onClick={() => {
                        // Restore seat when clicking on empty slot
                        setRemovedSeats(prev => {
                            const next = new Set(prev);
                            next.delete(seatKey);
                            return next;
                        });
                    }}
                    title={`Click to restore seat ${row}${seatNum}`}
                >
                    <FiPlus className="empty-icon" />
                </div>
            );
        } else {
            // Normal seat
            const category = seatCategories[seatKey] || SEAT_TYPES.STANDARD;
            seatElement = (
                <motion.div
                    key={seatKey}
                    className={`seat ${category} ${isSelected ? 'selected' : ''} ${currentTool === TOOLS.REMOVE ? 'remove-mode' : ''} ${currentTool === TOOLS.DISABLE ? 'disable-mode' : ''} ${currentTool === TOOLS.CATEGORY ? 'category-mode' : ''}`}
                    onClick={(e) => handleSeatClick(row, seatNum, section, e)}
                    draggable={currentTool === TOOLS.SELECT}
                    onDragStart={(e) => handleDragStart(e, seatKey)}
                    onDragEnd={handleDragEnd}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    title={`${row}${seatNum} - ${category.toUpperCase()} ${currentTool === TOOLS.REMOVE ? 'Click to remove' : currentTool === TOOLS.DISABLE ? 'Click to disable' : currentTool === TOOLS.CATEGORY ? `Click to set as ${currentCategory}` : ''}`}
                >
                    <span className="seat-number">{seatNum}</span>
                </motion.div>
            );
        }

        const vCount = getVCorridorCount(section, seatNum);

        // Render multiple vertical corridor spaces if count > 0
        const vCorridorSpaces = Array.from({ length: vCount }).map((_, i) => (
            <div
                key={`vcor-${seatKey}-${i}`}
                className={`v-corridor-space ${currentTool === TOOLS.REMOVE ? 'remove-mode' : ''}`}
                onClick={(e) => {
                    if (currentTool === TOOLS.REMOVE) {
                        e.stopPropagation();
                        toggleVCorridor(section, seatNum, e);
                    }
                }}
                title={currentTool === TOOLS.REMOVE ? "Click to remove corridor segment" : "Corridor"}
            />
        ));

        // If vertical corridor tool is active, show toggle buttons between seats or after last seat
        const vCorridorToggle = !isPreviewMode && currentTool === TOOLS.CORRIDOR_V && seatNum <= seatsPerRow ? (
            <button
                key={`vcor-btn-${seatKey}`}
                className={`v-corridor-toggle ${vCount > 0 ? 'active' : ''}`}
                onClick={(e) => toggleVCorridor(section, seatNum, e)}
                onContextMenu={(e) => { e.preventDefault(); toggleVCorridor(section, seatNum, { altKey: true }); }}
                title={`Add/Remove corridor (Current: ${vCount}). Click to add, Alt+Click to remove.`}
            >
                {vCount > 0 ? vCount : '|'}
            </button>
        ) : null;

        return (
            <React.Fragment key={`seat-wrapper-${seatKey}`}>
                {seatElement}
                {vCorridorSpaces}
                {vCorridorToggle}
            </React.Fragment>
        );
    };

    // Helper to render horizontal corridor slots (before or after rows)
    const renderHCorridorSlot = (section, rowIndex) => {
        const count = getHCorridorCount(section, rowIndex);
        const isToolActive = currentTool === TOOLS.CORRIDOR_H;

        return (
            <React.Fragment key={`h-slot-${section}-${rowIndex}`}>
                {!isPreviewMode && isToolActive && (
                    <div className="h-corridor-slot-toggle">
                        <button
                            className={`h-corridor-toggle ${count > 0 ? 'active' : ''}`}
                            onClick={(e) => toggleHCorridor(section, rowIndex, e)}
                            onContextMenu={(e) => { e.preventDefault(); toggleHCorridor(section, rowIndex, { altKey: true }); }}
                            title={`Click to add corridor segment, Alt+Click to remove. Current: ${count}`}
                        >
                            {count > 0 ? `═ ${count}` : '═══'}
                        </button>
                    </div>
                )}
                {Array.from({ length: count }).map((_, i) => (
                    <div
                        key={`h-corr-${section}-${rowIndex}-${i}`}
                        className={`h-corridor-space ${currentTool === TOOLS.REMOVE ? 'remove-mode' : ''}`}
                        onClick={(e) => {
                            if (currentTool === TOOLS.REMOVE) {
                                e.stopPropagation();
                                toggleHCorridor(section, rowIndex, e);
                            }
                        }}
                        title={currentTool === TOOLS.REMOVE ? "Click to remove corridor segment" : "Corridor"}
                    >
                        <span className="corridor-label">CORRIDOR</span>
                    </div>
                ))}
            </React.Fragment>
        );
    };

    // Render row with horizontal corridor option
    const renderRow = (rowLabel, rowIndex, seatsPerRow, section, totalRows) => {
        const seats = [];

        // Vertical corridor BEFORE first seat (col 0)
        const vCount0 = getVCorridorCount(section, 0);
        const vSpaces0 = Array.from({ length: vCount0 }).map((_, i) => (
            <div
                key={`vcor-${section}-${rowIndex}-pre-${i}`}
                className={`v-corridor-space ${currentTool === TOOLS.REMOVE ? 'remove-mode' : ''}`}
                onClick={(e) => {
                    if (currentTool === TOOLS.REMOVE) {
                        e.stopPropagation();
                        toggleVCorridor(section, 0, e);
                    }
                }}
                title={currentTool === TOOLS.REMOVE ? "Click to remove corridor segment" : "Corridor"}
            />
        ));
        const vToggle0 = !isPreviewMode && currentTool === TOOLS.CORRIDOR_V ? (
            <button
                key={`vcor-btn-${section}-${rowIndex}-pre`}
                className={`v-corridor-toggle ${vCount0 > 0 ? 'active' : ''}`}
                onClick={(e) => toggleVCorridor(section, 0, e)}
                onContextMenu={(e) => { e.preventDefault(); toggleVCorridor(section, 0, { altKey: true }); }}
                title={`Add/Remove corridor before first seat (Current: ${vCount0})`}
            >
                {vCount0 > 0 ? vCount0 : '|'}
            </button>
        ) : null;

        seats.push(
            <React.Fragment key={`v-pre-${section}-${rowIndex}`}>
                {vSpaces0}
                {vToggle0}
            </React.Fragment>
        );

        for (let s = 1; s <= seatsPerRow; s++) {
            seats.push(renderSeat(rowLabel, s, section, seatsPerRow));
        }

        return (
            <React.Fragment key={`${section}-${rowLabel}`}>
                <div className="seat-row">
                    <div className="row-label">{rowLabel}</div>
                    <div className="seats-container">
                        {seats}
                    </div>
                    <div className="row-label">{rowLabel}</div>
                </div>
                {renderHCorridorSlot(section, rowIndex)}
            </React.Fragment>
        );
    };

    return (
        <div className="theater-designer">
            {/* Toolbar */}
            {!isPreviewMode && (
                <motion.div
                    className="designer-toolbar"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <div className="toolbar-section">
                        <button
                            className={`toolbar-btn ${showSettings ? 'active' : ''}`}
                            onClick={() => setShowSettings(!showSettings)}
                        >
                            <FiSettings />
                            <span>Settings</span>
                        </button>
                        <button
                            className="toolbar-btn"
                            onClick={() => setLayout(prev => ({ ...prev, hasBalcony: !prev.hasBalcony }))}
                        >
                            <FiLayers />
                            <span>{layout.hasBalcony ? 'Remove Balcony' : 'Add Balcony'}</span>
                        </button>
                    </div>

                    <div className="toolbar-section tool-selector">
                        <span className="toolbar-label">Tool:</span>
                        <button
                            className={`tool-btn ${currentTool === TOOLS.SELECT ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.SELECT)}
                            title="Select & Move seats"
                        >
                            <FiMove /> Select
                        </button>
                        <button
                            className={`tool-btn danger ${currentTool === TOOLS.REMOVE ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.REMOVE)}
                            title="Remove seats"
                        >
                            <FiTrash2 /> Remove
                        </button>
                        <button
                            className={`tool-btn danger ${currentTool === TOOLS.DISABLE ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.DISABLE)}
                            title="Disable seat slots permanently (no chair can be placed)"
                        >
                            <FiX /> Disable
                        </button>
                        <button
                            className={`tool-btn ${currentTool === TOOLS.CORRIDOR_H ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.CORRIDOR_H)}
                            title="Add horizontal corridors (between rows)"
                        >
                            ═ H-Corridor
                        </button>
                        <button
                            className={`tool-btn ${currentTool === TOOLS.CORRIDOR_V ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.CORRIDOR_V)}
                            title="Add vertical corridors (between columns)"
                        >
                            ║ V-Corridor
                        </button>
                        <button
                            className={`tool-btn ${currentTool === TOOLS.LABEL ? 'active' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.LABEL)}
                            title="Add labels (Entry, Sound, Lights, etc.)"
                        >
                            📍 Label
                        </button>
                        <button
                            className={`tool-btn ${currentTool === TOOLS.CATEGORY ? 'active' : ''} ${currentTool === TOOLS.CATEGORY ? 'primary' : ''}`}
                            onClick={() => setCurrentTool(TOOLS.CATEGORY)}
                            title="Assign seat types (VIP, Premium, etc.)"
                        >
                            <FiGrid /> Seat Type
                        </button>
                    </div>

                    {currentTool === TOOLS.CATEGORY && (
                        <motion.div
                            className="toolbar-section sub-toolbar"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <span className="toolbar-label">Select Type:</span>
                            {Object.values(SEAT_TYPES).map(type => (
                                <button
                                    key={type}
                                    className={`tool-btn ${currentCategory === type ? 'active' : ''} type-${type}`}
                                    onClick={() => setCurrentCategory(type)}
                                >
                                    {type.toUpperCase()}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    <div className="toolbar-section">
                        {selectedSeats.size > 0 && (
                            <>
                                <button className="toolbar-btn danger" onClick={removeSelectedSeats}>
                                    <FiTrash2 />
                                    Remove ({selectedSeats.size})
                                </button>
                                <button className="toolbar-btn" onClick={restoreSelectedSeats}>
                                    <FiPlus />
                                    Restore
                                </button>
                            </>
                        )}
                        <button className="toolbar-btn success" onClick={handleSave}>
                            <FiSave />
                            <span>Save</span>
                        </button>
                    </div>

                    <div className="toolbar-section zoom-controls">
                        <button onClick={() => setZoomLevel(z => Math.max(0.5, z - 0.1))}>
                            <FiMinimize2 />
                        </button>
                        <span>{Math.round(zoomLevel * 100)}%</span>
                        <button onClick={() => setZoomLevel(z => Math.min(2, z + 0.1))}>
                            <FiMaximize2 />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        className="settings-panel"
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                    >
                        <div className="settings-header">
                            <h3>Theater Settings</h3>
                            <button
                                className="close-settings-btn"
                                onClick={() => setShowSettings(false)}
                                title="Close settings"
                            >
                                <FiX />
                            </button>
                        </div>

                        <div className="settings-group">
                            <h4>Stage</h4>
                            <label>
                                Position
                                <select
                                    value={layout.stage.position}
                                    onChange={(e) => updateStage('position', e.target.value)}
                                >
                                    <option value="top">Top</option>
                                    <option value="bottom">Bottom</option>
                                </select>
                            </label>
                            <label>
                                Width: {layout.stage.width}%
                                <input
                                    type="range"
                                    min="20" max="100"
                                    value={layout.stage.width}
                                    onChange={(e) => updateStage('width', parseInt(e.target.value))}
                                />
                            </label>
                        </div>

                        <div className="settings-group">
                            <h4>Main Floor</h4>
                            <label>
                                Rows
                                <div className="number-input">
                                    <button onClick={() => updateMainFloor('rows', Math.max(1, layout.mainFloor.rows - 1))}>
                                        <FiMinus />
                                    </button>
                                    <span>{layout.mainFloor.rows}</span>
                                    <button onClick={() => updateMainFloor('rows', Math.min(50, layout.mainFloor.rows + 1))}>
                                        <FiPlus />
                                    </button>
                                </div>
                            </label>
                            <label>
                                Seats per Row
                                <div className="number-input">
                                    <button onClick={() => updateMainFloor('seatsPerRow', Math.max(1, layout.mainFloor.seatsPerRow - 1))}>
                                        <FiMinus />
                                    </button>
                                    <span>{layout.mainFloor.seatsPerRow}</span>
                                    <button onClick={() => updateMainFloor('seatsPerRow', Math.min(50, layout.mainFloor.seatsPerRow + 1))}>
                                        <FiPlus />
                                    </button>
                                </div>
                            </label>
                        </div>

                        {layout.hasBalcony && (
                            <div className="settings-group">
                                <h4>Balcony</h4>
                                <label>
                                    Rows
                                    <div className="number-input">
                                        <button onClick={() => updateBalcony('rows', Math.max(1, layout.balcony.rows - 1))}>
                                            <FiMinus />
                                        </button>
                                        <span>{layout.balcony.rows}</span>
                                        <button onClick={() => updateBalcony('rows', Math.min(20, layout.balcony.rows + 1))}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                </label>
                                <label>
                                    Seats per Row
                                    <div className="number-input">
                                        <button onClick={() => updateBalcony('seatsPerRow', Math.max(1, layout.balcony.seatsPerRow - 1))}>
                                            <FiMinus />
                                        </button>
                                        <span>{layout.balcony.seatsPerRow}</span>
                                        <button onClick={() => updateBalcony('seatsPerRow', Math.min(50, layout.balcony.seatsPerRow + 1))}>
                                            <FiPlus />
                                        </button>
                                    </div>
                                </label>
                            </div>
                        )}

                        <div className="settings-summary">
                            <FiGrid />
                            <span>Active Seats: <strong>{totalSeats}</strong></span>
                        </div>

                        {removedSeats.size > 0 && (
                            <div className="settings-info">
                                <span>{removedSeats.size} seats removed</span>
                            </div>
                        )}

                        {Object.keys(hCorridors).length > 0 || Object.keys(vCorridors).length > 0 ? (
                            <div className="settings-info">
                                <span>
                                    {Object.keys(hCorridors).length > 0 && `${Object.values(hCorridors).reduce((a, b) => a + b, 0)} H-corridor segments`}
                                    {Object.keys(hCorridors).length > 0 && Object.keys(vCorridors).length > 0 && ', '}
                                    {Object.keys(vCorridors).length > 0 && `${Object.values(vCorridors).reduce((a, b) => a + b, 0)} V-corridor segments`}
                                </span>
                            </div>
                        ) : null}

                        {/* Done Button */}
                        <button
                            className="done-settings-btn"
                            onClick={() => setShowSettings(false)}
                        >
                            <FiCheck /> Done with Settings
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Theater Frame */}
            <div className="theater-frame">
                <div className="theater-frame-header">
                    <div className="frame-header-item main-item">
                        <FiGrid />
                        <span>MAIN FLOOR</span>
                    </div>
                    {layout.hasBalcony && (
                        <div className="frame-header-item balcony-item">
                            <FiChevronsUp />
                            <span>BALCONY</span>
                        </div>
                    )}
                </div>

                <div className="theater-canvas-container">
                    {/* Theater Canvas */}
                    <div
                        ref={canvasRef}
                        className={`theater-canvas ${currentTool === TOOLS.LABEL ? 'label-mode' : ''} ${draggingLabel ? 'dragging-label' : ''}`}
                        style={{ transform: `scale(${zoomLevel})` }}
                        onClick={handleCanvasClick}
                        onMouseUp={() => {
                            setDraggingLabel(null);
                            setResizingLabel(null);
                        }}
                    >
                        {/* Stage */}
                        {layout.stage.position === 'top' && (
                            <motion.div
                                className="stage stage-top"
                                style={{ width: `${layout.stage.width}%` }}
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <FiChevronsUp className="stage-icon" />
                                <span>STAGE</span>
                            </motion.div>
                        )}

                        {/* Balcony Section */}
                        <AnimatePresence>
                            {layout.hasBalcony && (
                                <motion.div
                                    className="section balcony-section"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <div className="seats-grid">
                                        {renderHCorridorSlot('balcony', -1)}
                                        {balconyRowLabels.map((rowLabel, idx) =>
                                            renderRow(
                                                rowLabel,
                                                idx,
                                                layout.balcony.seatsPerRow,
                                                'balcony',
                                                layout.balcony.rows
                                            )
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Floor Section */}
                        <motion.div
                            className="section main-section"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div className="seats-grid">
                                {renderHCorridorSlot('main', -1)}
                                {mainRowLabels.map((rowLabel, idx) =>
                                    renderRow(
                                        rowLabel,
                                        idx,
                                        layout.mainFloor.seatsPerRow,
                                        'main',
                                        layout.mainFloor.rows
                                    )
                                )}
                            </div>
                        </motion.div>

                        {/* Stage at bottom */}
                        {layout.stage.position === 'bottom' && (
                            <motion.div
                                className="stage stage-bottom"
                                style={{ width: `${layout.stage.width}%` }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <span>STAGE</span>
                                <FiChevronsDown className="stage-icon" />
                            </motion.div>
                        )}

                        {/* Dedicated Labels Overlay */}
                        <div className="labels-overlay">
                            {labels.map(label => (
                                <motion.div
                                    key={label.id}
                                    className={`theater-label ${draggingLabel === label.id ? 'dragging' : ''} ${currentTool === TOOLS.REMOVE ? 'remove-mode' : ''}`}
                                    style={{
                                        left: `${label.position.x}%`,
                                        top: `${label.position.y}%`,
                                        width: label.width || 'auto',
                                        height: label.height || 'auto',
                                        minWidth: label.width ? undefined : 'auto'
                                    }}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: draggingLabel === label.id ? 1.05 : 1 }}
                                    whileHover={{ scale: draggingLabel ? 1 : 1.05 }}
                                    onMouseDown={(e) => {
                                        e.stopPropagation();
                                        if (e.button === 0 && currentTool !== TOOLS.REMOVE) {
                                            e.preventDefault();
                                            wasDragging.current = false;
                                            setDraggingLabel(label.id);
                                        }
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (currentTool === TOOLS.REMOVE) {
                                            deleteLabel(label.id);
                                        }
                                        // Edit modal disabled per user request
                                    }}
                                    title={currentTool === TOOLS.REMOVE ? `Click to delete ${label.text}` : `Drag to move ${label.text}`}
                                >
                                    <span className="label-icon">{label.icon}</span>
                                    <span className="label-text">{label.text}</span>
                                    <div
                                        className="label-resize-handle label-resize-width"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizingLabel({ id: label.id, type: 'width' });
                                        }}
                                    />
                                    <div
                                        className="label-resize-handle label-resize-height"
                                        onMouseDown={(e) => {
                                            e.stopPropagation();
                                            setResizingLabel({ id: label.id, type: 'height' });
                                        }}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Label Modal */}
            <AnimatePresence>
                {showLabelModal && (
                    <motion.div
                        className="label-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowLabelModal(false)}
                    >
                        <motion.div
                            className="label-modal"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="label-modal-header">
                                <h3>{editingLabel?.isNew ? 'Add Label' : 'Edit Label'}</h3>
                                <button
                                    className="close-modal-btn"
                                    onClick={() => setShowLabelModal(false)}
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="label-presets">
                                <p>Select a preset:</p>
                                <div className="preset-grid">
                                    {LABEL_PRESETS.map(preset => (
                                        <button
                                            key={preset.text}
                                            className={`preset-btn ${selectedLabelPreset?.text === preset.text ? 'active' : ''}`}
                                            onClick={() => {
                                                setSelectedLabelPreset(preset);
                                                if (preset.text !== 'CUSTOM') {
                                                    setNewLabelText(preset.text);
                                                }
                                            }}
                                        >
                                            <span className="preset-icon">{preset.icon}</span>
                                            <span className="preset-text">{preset.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedLabelPreset?.text === 'CUSTOM' && (
                                <div className="custom-label-input">
                                    <label>Custom Text:</label>
                                    <input
                                        type="text"
                                        value={newLabelText}
                                        onChange={(e) => setNewLabelText(e.target.value)}
                                        placeholder="Enter label text..."
                                        autoFocus
                                    />
                                </div>
                            )}

                            <div className="label-modal-actions">
                                {!editingLabel?.isNew && (
                                    <button
                                        className="delete-label-btn"
                                        onClick={() => deleteLabel(editingLabel.id)}
                                    >
                                        <FiTrash2 /> Delete
                                    </button>
                                )}
                                <button
                                    className="cancel-btn"
                                    onClick={() => setShowLabelModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="save-label-btn"
                                    onClick={saveLabel}
                                    disabled={!selectedLabelPreset && !newLabelText.trim()}
                                >
                                    <FiCheck /> Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Legend */}
            <div className="designer-legend">
                <div className="legend-item">
                    <div className="legend-color standard" />
                    <span>Standard</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color vip" />
                    <span>VIP</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color premium" />
                    <span>Premium</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color wheelchair" />
                    <span>Wheelchair</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color empty-slot" />
                    <span>Removed</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color selected" />
                    <span>Selected</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color h-corridor" />
                    <span>H-Corridor</span>
                </div>
                <div className="legend-item">
                    <div className="legend-color v-corridor" />
                    <span>V-Corridor</span>
                </div>
                <div className="legend-item">
                    <span className="legend-icon">📍</span>
                    <span>Label</span>
                </div>
            </div>

            {/* Instructions */}
            {
                !isPreviewMode && (
                    <div className="designer-instructions">
                        <p>
                            <strong>Select:</strong> Click seats, drag to move.
                            <strong> Remove:</strong> Click to remove/restore.
                            <strong> H-Corridor:</strong> Click row button for walkway.
                            <strong> V-Corridor:</strong> Click for vertical aisles. Alt+Click to remove.
                            <strong> Label:</strong> Click on canvas to add labels.
                        </p>
                        <p className="info-text">
                            <em>Tip: Use <strong>Alt+Click</strong> on any corridor toggle to reduce its segments quickly. You can now add corridors before the first row/column and after the last!</em>
                        </p>
                    </div>
                )
            }
        </div >
    );
};

export default TheaterDesigner;
