import React, { useEffect, useState } from "react";
import Header from "components/general/Header/Header";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    Container,
    Fade,
    Grid,
    LinearProgress,
    Typography,
} from "@material-ui/core";
import AcknowledgementForm from "components/acknowledgement/AcknowledgementForm/AcknowledgementForm";
import { useDispatch, useSelector } from "react-redux";
import {
    createProfileSelector,
    fetchUserAcceptanceStatus,
    isTestUserSelector,
    userAcceptanceSelector,
    userSelector,
    userTypeSelector,
} from "slices/users/userSlice";
import {
    UserAcceptanceMessage,
    UserHasBeenGrantedAccessMessage,
} from "components/acknowledgement/UserAcceptanceStatus/UserAcceptanceStatus";
import AlertBox from "components/general/AlertBox/AlertBox";
import { hardwareSignOutStartDate } from "constants.js";
import { push } from "connected-react-router";

const Acknowledgement = () => {
    const dispatch = useDispatch();
    const userType = useSelector(userTypeSelector);
    const isTestUser = useSelector(isTestUserSelector);
    const {
        error: getAcceptanceError,
        isLoading,
        user: acceptanceUser,
    } = useSelector(userAcceptanceSelector);
    const {
        error: createProfileError,
        isLoading: createProfileLoading,
        profile,
    } = useSelector(createProfileSelector);
    const userDoesNotHaveRole = userType === "none";
    const [showAcknowledgements, setShowAcknowledgements] = useState(false);

    useEffect(() => {
        const today = new Date();
        if (hardwareSignOutStartDate > today) {
            push("/404");
        } else if (userDoesNotHaveRole) {
            dispatch(fetchUserAcceptanceStatus());
        }
    }, [dispatch, userDoesNotHaveRole]);

    return (
        <>
            <Header showNavbar={false} />
            <Container maxWidth="lg">
                {getAcceptanceError ? (
                    <AlertBox
                        error={getAcceptanceError?.message ?? getAcceptanceError}
                        title="An error has occurred"
                        type="error"
                    />
                ) : userDoesNotHaveRole ? (
                    isLoading ? (
                        <LinearProgress data-testid="userReviewStatusLoadingBar" />
                    ) : !showAcknowledgements ? (
                        <UserAcceptanceMessage
                            status={
                                isTestUser
                                    ? "Accepted"
                                    : acceptanceUser?.review_status === "None" ||
                                      !acceptanceUser?.review_status
                                    ? "Incomplete"
                                    : acceptanceUser?.review_status
                            }
                            handleGetStarted={() => setShowAcknowledgements(true)}
                        />
                    ) : createProfileError ? (
                        <AlertBox
                            error={createProfileError?.message ?? createProfileError}
                            title="An error has occurred while granting you permissions"
                            type="error"
                        />
                    ) : createProfileLoading ? (
                        <CircularProgress />
                    ) : profile ? (
                        <Fade in={!!profile} timeout={1000}>
                            <SuccessMessage />
                        </Fade>
                    ) : (
                        <Fade in={showAcknowledgements} timeout={1000}>
                            <div>
                                <AcknowledgementForm isLoading={false} />
                            </div>
                        </Fade>
                    )
                ) : (
                    <UserHasBeenGrantedAccessMessage />
                )}
            </Container>
        </>
    );
};

const SuccessMessage = () => {
    const user = useSelector(userSelector);
    const { profile } = useSelector(createProfileSelector);

    return (
        <Grid container justifyContent="center">
            <Grid item lg={6} xs={12}>
                <Card style={{ padding: "15px 5px" }}>
                    <Typography style={{ fontSize: "25px" }} align="center">
                        {`${user?.first_name
                            .charAt(0)
                            .toUpperCase()}${user?.first_name.substring(
                            1
                        )}, you're ready to get started. We've placed you in Team ${
                            profile?.team
                        } but you can leave and join another team anytime.`}
                    </Typography>
                    <Box
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "10px",
                        }}
                    >
                        <Button color="primary" variant="contained" href="/">
                            Let's Go!
                        </Button>
                    </Box>
                </Card>
            </Grid>
        </Grid>
    );
};

export default Acknowledgement;
