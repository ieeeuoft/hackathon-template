import React, { useEffect } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import LinearProgress from "@material-ui/core/LinearProgress";

import { userSelector, fetchUserData } from "slices/users/userSlice";
import { displaySnackbar } from "slices/ui/uiSlice";

export const UnconnectedParticipantCheck = ({
    user,
    fetchUserData,
    push,
    displaySnackbar,
    WrappedComponent,
    ...passThroughProps
}) => {
    useEffect(() => {
        if (!user) {
            fetchUserData();
            return;
        }

        if (!user.profile) {
            displaySnackbar({
                message: "You do not have permission to access this page",
                options: { variant: "error" },
            });
            push("/404");
        }
    }, [user, fetchUserData, displaySnackbar, push]);

    return user && user.profile ? (
        <WrappedComponent {...passThroughProps} />
    ) : (
        <LinearProgress style={{ width: "100%" }} data-testid="linear-progress" />
    );
};

export const withParticipantCheck = (WrappedComponent) => {
    const mapStateToProps = (state) => ({
        user: userSelector(state),
        WrappedComponent,
    });

    return connect(mapStateToProps, {
        fetchUserData,
        displaySnackbar,
        push,
    })(UnconnectedParticipantCheck);
};

export default withParticipantCheck;
