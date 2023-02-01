import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import Slide from "@material-ui/core/Slide";

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
    const PropInformation = () => {
        return (
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
                    <Button onClick={submitHandler} color="primary">
                        {submitText ?? "Submit"}
                    </Button>
                </Grid>
            </Grid>
        );
    };

    return (
        <Modal
            open={isVisible}
            className={styles.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Slide in={isVisible} direction="up">
                <div>
                    <PropInformation></PropInformation>
                </div>
            </Slide>
        </Modal>
    );
};

export default PopupModal;
