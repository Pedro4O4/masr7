"use client";
import React from 'react';
import './ConfirmationDialog.css';

interface ConfirmationDialogProps {
    isOpen: boolean;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
    disabled?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    title = 'Confirm Action',
    message = 'Are you sure you want to proceed?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isLoading = false,
    disabled = false
}) => {
    if (!isOpen) return null;

    return (
        <div className="admin-modal-overlay">
            <div className="admin-modal confirmation-dialog">
                <h2>{title}</h2>
                <p className="dialog-message">{message}</p>
                <div className="button-container">
                    <button
                        className="admin-button"
                        onClick={onConfirm}
                        disabled={isLoading || disabled}
                    >
                        {isLoading && <span className="loading-spinner"></span>}
                        {confirmText}
                    </button>
                    <button
                        className="admin-button"
                        onClick={onCancel}
                        disabled={isLoading || disabled}
                    >
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;
