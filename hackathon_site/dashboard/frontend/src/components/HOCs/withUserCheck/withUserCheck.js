import React, { useEffect } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import LinearProgress from "@material-ui/core/LinearProgress";

import { userSelector, fetchUserData, userTypeSelector } from "slices/users/userSlice";
import { displaySnackbar } from "slices/ui/uiSlice";

export const UnconnectedUserCheck = ({
    user,
    userType,
    fetchUserData,
    push,
    displaySnackbar,
    PrimaryComponent,
    SecondaryComponent,
    accessType,
    ...passThroughProps
}) => {
    const isParticipantOnboarding =
        (userType === "none" || userType === "participant") && accessType === "onboard";

    useEffect(() => {
        if (!user) {
            fetchUserData();
            return;
        }

        if (isParticipantOnboarding) {
            return;
        }

        if (userType === "none") {
            push("/acknowledgement");
            return;
        }

        if (
            !(accessType === "both" && userType !== "none") &&
            userType !== accessType
        ) {
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            });
            push("/404");
        }
    }, [
        user,
        userType,
        accessType,
        fetchUserData,
        displaySnackbar,
        push,
        isParticipantOnboarding,
    ]);

    return user ? (
        userType === "participant" || isParticipantOnboarding ? (
            <PrimaryComponent {...passThroughProps} />
        ) : userType === "admin" ? (
            SecondaryComponent === undefined ? (
                <PrimaryComponent {...passThroughProps} />
            ) : (
                <SecondaryComponent {...passThroughProps} />
            )
        ) : null
    ) : (
        <LinearProgress style={{ width: "100%" }} data-testid="linear-progress" />
    );
};

export const withUserCheck = (accessType, PrimaryComponent, SecondaryComponent) => {
    const mapStateToProps = (state) => ({
        user: userSelector(state),
        userType: userTypeSelector(state),
        PrimaryComponent,
        SecondaryComponent,
        accessType,
    });

    return connect(mapStateToProps, {
        fetchUserData,
        displaySnackbar,
        push,
    })(UnconnectedUserCheck);
};

export default withUserCheck;
