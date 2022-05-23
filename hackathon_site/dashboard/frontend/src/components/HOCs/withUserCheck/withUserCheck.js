import React, { useEffect } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import LinearProgress from "@material-ui/core/LinearProgress";

import { userSelector, fetchUserData, userTypeSelector } from "slices/users/userSlice";
import { displaySnackbar } from "slices/ui/uiSlice";
import { adminPages, participantPages } from "constants.js";

export const UnconnectedUserCheck = ({
    user,
    userType,
    fetchUserData,
    push,
    displaySnackbar,
    PrimaryComponent,
    SecondaryComponent,
    ...passThroughProps
}) => {
    useEffect(() => {
        if (!user) {
            fetchUserData();
            return;
        }

        const incorrectPermissions =
            (userType !== "participant" && userType !== "admin") ||
            (userType === "participant" &&
                !participantPages.includes(window.location.pathname)) ||
            (userType === "admin" && !adminPages.includes(window.location.pathname));

        if (incorrectPermissions) {
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            });
            push("/404");
        }
    }, [user, userType, fetchUserData, displaySnackbar, push]);

    return user ? (
        userType === "participant" ? (
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

export const withUserCheck = (PrimaryComponent, SecondaryComponent) => {
    const mapStateToProps = (state) => ({
        user: userSelector(state),
        userType: userTypeSelector(state),
        PrimaryComponent,
        SecondaryComponent,
    });

    return connect(mapStateToProps, {
        fetchUserData,
        displaySnackbar,
        push,
    })(UnconnectedUserCheck);
};

export default withUserCheck;
