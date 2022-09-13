import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import { Box } from "@material-ui/core";
import Grid from "@material-ui/core/Grid";

interface PopupModalProps {
    title?: string;
    description: string;
    isVisible: boolean;
    submitText?: string;
    cancelText?: string;
    submitHandler(): any;
    cancelHandler(): any;
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
        <Modal open={isVisible} className={styles.modal}>
            <Grid
                className={styles.modalGrid}
                container
                direction={"column"}
                spacing={2}
            >
                <Grid item>{title && <h1 className={styles.title}>{title}</h1>}</Grid>
                <Grid item>
                    <p className={styles.description}>{description}</p>
                </Grid>
                <Grid item container justifyContent={"flex-end"}>
                    <Button onClick={cancelHandler}>{cancelText ?? "Cancel"}</Button>
                    <Button onClick={submitHandler}>{submitText ?? "Submit"}</Button>
                </Grid>
            </Grid>
        </Modal>
    );
};

export default PopupModal;
