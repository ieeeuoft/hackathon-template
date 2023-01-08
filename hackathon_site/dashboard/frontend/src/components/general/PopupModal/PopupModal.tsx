import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import Grid from "@material-ui/core/Grid";

//New Imports to implement Modal animation
import Backdrop from "@material-ui/core/Backdrop";
import Slide from "@material-ui/core/Slide";

interface PopupModalProps {
    title?: string;
    description: string;
    isVisible: boolean;
    submitText?: string;
    cancelText?: string;
    AnimationPresence: boolean;
    submitHandler(): any;
    cancelHandler(): any;
}

const PopupModal = ({
    title,
    description,
    isVisible,
    submitText,
    cancelText,
    AnimationPresence,
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
                    {/*Changed default text display for cancel handler method from "Cl" to "Cancel"*/}
                    {/*This change allows for the final modified test in file PopupModal.test.tsx to properly run*/}
                    <Button onClick={cancelHandler}>{cancelText ?? "Cancel"}</Button>
                    <Button onClick={submitHandler} color="primary">
                        {submitText ?? "Submit"}
                    </Button>
                </Grid>
            </Grid>
        );
    };

    return (
        //The implementation below does render a sliding animation when a PopUpModal is opened or closed
        //Note: The <Slide> component must be passed directly in the return method, otherwise, a white screen will display when modal is closed
        //Note 2: As a result of this implementation, all modals of type PopupModal will by defualt, have this sliding animation as well
        <Modal
            open={isVisible}
            className={styles.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{ timeout: 500 }}
        >
            <Slide in={isVisible} direction="up">
                <div>
                    {AnimationPresence ? (
                        <PropInformation></PropInformation>
                    ) : (
                        <PropInformation></PropInformation>
                    )}
                </div>
            </Slide>
        </Modal>
    );
};

export default PopupModal;

//Passing the following commented out code in the return method of PopupModal would result in a white screen after the buttons of the modal are pressed:
//Probably because unlike the code above, the component <Slide></Slide> is inside the ternary expression

// <Modal open={isVisible} className={styles.modal}  closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{timeout: 500,}}>
//    <div>
//        {AnimationPresence ?
//            <Slide in={isVisible} direction="up">
//                <PropInformation></PropInformation>
//            </Slide>: <PropInformation></PropInformation>}
//    </div>
//</Modal>
