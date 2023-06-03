import React, { ReactElement } from "react";
import { Box, Button, Divider, Grid, Link, Typography } from "@material-ui/core";
import AlertBox from "components/general/AlertBox/AlertBox";
import { hackathonName } from "constants.js";

export const UserAcceptanceMessage = ({
    status,
    handleGetStarted,
}: {
    status: "Accepted" | "Waitlisted" | "Rejected" | "Incomplete";
    handleGetStarted(): any;
}) => {
    const ACCEPTANCE_MESSAGES: {
        [key: string]: {
            title: string;
            alertColor: "error" | "info" | "success" | "warning";
            actionMessage: ReactElement;
        };
    } = Object.freeze({
        Accepted: {
            title: `Congratulations! You've been accepted to ${hackathonName}`,
            alertColor: "success",
            actionMessage: (
                <>
                    <Typography variant="h2" align="center">
                        Ready to prepare for the hackathon and order some hardware?
                    </Typography>
                    <Box
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "10px",
                        }}
                    >
                        <Button
                            color="primary"
                            variant="contained"
                            onClick={handleGetStarted}
                        >
                            Get started
                        </Button>
                    </Box>
                </>
            ),
        },
        Waitlisted: {
            title: `Thank you for applying to ${hackathonName} but you have been waitlisted and cannot use the Hardware Signout Site for now.`,
            alertColor: "warning",
            actionMessage: (
                <Typography variant="h2" align="center">
                    Keep an eye out for your application status changes on your{" "}
                    <Link href={`${process.env.REACT_APP_DEV_SERVER_URL}/dashboard/`}>
                        Dashboard
                    </Link>
                </Typography>
            ),
        },
        Rejected: {
            title: `Thank you for applying to ${hackathonName} but you have not been invited to participate this year.`,
            alertColor: "error",
            actionMessage: (
                <Typography variant="h2" align="center">
                    We still encourage you to apply for {hackathonName} next year! Keep
                    an eye out for your application status changes on your{" "}
                    <Link href={`${process.env.REACT_APP_DEV_SERVER_URL}/dashboard/`}>
                        Dashboard
                    </Link>
                </Typography>
            ),
        },
        Incomplete: {
            title: `Thank you for signing up for ${hackathonName} but you don't seem to have finished your application or your application hasn't been reviewed yet.`,
            alertColor: "info",
            actionMessage: (
                <Typography variant="h2" align="center">
                    Please finish your application{" "}
                    <Link
                        href={`${process.env.REACT_APP_DEV_SERVER_URL}/registration/application/`}
                    >
                        here
                    </Link>{" "}
                    and view your application status{" "}
                    <Link href={`${process.env.REACT_APP_DEV_SERVER_URL}/dashboard/`}>
                        here
                    </Link>
                    .
                </Typography>
            ),
        },
    });
    return (
        <div data-testid="userReviewStatusMessage">
            <Typography variant="h1">{ACCEPTANCE_MESSAGES[status].title}</Typography>
            <Grid container justifyContent="center">
                <Grid item lg={4} md={4} sm={6} xs={12}>
                    <AlertBox
                        title={`Acceptance Status: ${status}`}
                        type={ACCEPTANCE_MESSAGES[status].alertColor}
                    />
                </Grid>
            </Grid>
            <Divider style={{ margin: "20px 0px" }} />
            {ACCEPTANCE_MESSAGES[status].actionMessage}
        </div>
    );
};

export const UserHasBeenGrantedAccessMessage = () => (
    <>
        <Typography variant="h1">
            You have already been granted permissions to access the Hardware Signout
            Site.
        </Typography>
        <Divider style={{ margin: "20px 0px" }} />
        <Typography variant="h2" align="center">
            You can access your dashboard <Link href="/">here</Link>
        </Typography>
    </>
);
