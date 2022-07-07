import React, { useState } from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";

interface PopupModalProps {
    title?: string;
    description?: string;
    submitText?: string;
    cancelText?: string;
    handleSubmit(): any;
    handleCancel?(): any;
}

const PopupModal = ({
    title,
    description,
    submitText,
    cancelText,
    handleSubmit,
    handleCancel,
}: PopupModalProps) => {
    return (
        <Modal open>
            <div>
                <h1>{title}</h1>
                <p>{description}</p>
                <Button onSubmit={handleSubmit}>{submitText}</Button>
                <Button onSubmit={handleCancel}>{cancelText}</Button>
            </div>
        </Modal>
    );
};

export default PopupModal;
