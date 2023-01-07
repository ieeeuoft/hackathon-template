import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import Grid from "@material-ui/core/Grid";

//New Imports for Animation
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
                    <Button onClick={cancelHandler}>{cancelText ?? "Cl"}</Button>
                    <Button onClick={submitHandler} color="primary">
                        {submitText ?? "Submit"}
                    </Button>
                </Grid>
            </Grid>
        );
    };

    return (
        //The implementation below does render the animation both sliding up and down.
        //But the ternary operation is rendered inside <Slide></Slide>, no matter what is being passed inside the ternary operation.../
        //... it will always be inside <Slide></Slide>, and so will always have the sliding up and down animation
        //I tried moving <Slide></Slide> inside the ternary operation (see commented code below), but the modal renders to a white screen
        //So, I am still stuck on how to conditionally control when the Slide animation is being used.
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
