import React from "react";
import Modal from "@material-ui/core/Modal";
import Button from "@material-ui/core/Button";
import styles from "components/general/PopupModal/PopupModal.module.scss";
import Grid from "@material-ui/core/Grid";
//Added a new import line for the Slide animation
import Slide from "@material-ui/core/Slide";
//Import Backdrop for animation
import Backdrop from "@material-ui/core/Backdrop";

interface PopupModalProps {
    title?: string;
    description: string;
    isVisible: boolean;
    submitText?: string;
    cancelText?: string;
    //Created new attribute below called "animation"://
    //animation: string;
    submitHandler(): any;
    cancelHandler(): any;
}

const PopupModal = ({
    title,
    description,
    isVisible,
    submitText,
    cancelText,
    //Passing in new attribute called "animation"
    //animation,
    submitHandler,
    cancelHandler,
}: PopupModalProps) => {
    const AnimationProp = () => {
        //In the actual implementation, I will need to insert conditional statements that handle for:...
        //...depending on the value of variable animation, the return statements will be different.
        //As you see, I have not implemented this yet.
        //Current problem: Rendering the Slide animation as a seperate tag in React does not display the Slide animation when tab is closed.
        return (
            <>
                <Slide in={isVisible} direction="up">
                    <Grid
                        className={styles.modalGrid}
                        container
                        direction={"column"}
                        spacing={2}
                    >
                        <Grid item>
                            {title && <h1 className={styles.title}>{title}</h1>}
                        </Grid>
                        <Grid item>
                            <p className={styles.description}>{description}</p>
                        </Grid>
                        <Grid item container justifyContent={"flex-end"}>
                            <Button onClick={cancelHandler}>
                                {cancelText ?? "Cl"}
                            </Button>
                            <Button onClick={submitHandler} color="primary">
                                {submitText ?? "Submit"}
                            </Button>
                        </Grid>
                    </Grid>
                </Slide>
            </>
        );
    };
    return (
        <Modal
            open={isVisible}
            className={styles.modal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
                timeout: 500,
            }}
        >
            <AnimationProp />
        </Modal>
    );
};

export default PopupModal;
