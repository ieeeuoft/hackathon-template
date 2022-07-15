import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import { Box } from "@material-ui/core";

interface PopupModalProps {
    title?: string;
    description: string;
    isVisible: boolean;
    submitText?: string;
    cancelText?: string;
    submitHandler(): any;
    cancelHandler?(): any;
}

const PopupModal = ({
    title,
    description,
    isVisible,
    submitText,
    cancelText,
    submitHandler,
    cancelHandler,
}: PopupModalProps) => {
    return (
        <Modal open={isVisible}>
            <Box className={styles.modalSize}>
                <h1 className={styles.title}>{title}</h1>
                <p className={styles.description}>{description}</p>
                <div className={styles.buttons}>
                    <Button onClick={cancelHandler}>{cancelText}</Button>
                    <Button onClick={submitHandler}>{submitText}</Button>
                </div>
            </Box>
        </Modal>
    );
};

export default PopupModal;
