import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { push } from "connected-react-router";

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
    const [isVisible, setIsVisible] = useState(false);

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
            return;
        }

        // This is an extra precaution that the component isn't rendered,
        // even though they should be sent to another page
        setIsVisible(true);
    }, [user, fetchUserData, displaySnackbar, push]);

    return isVisible && <WrappedComponent {...passThroughProps} />;
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
