import React, { useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fetchUserData, userDataSelector } from "slices/users/userSlice";
import { connect } from "react-redux";

export const TEST_IDS = {
    loading: "loading-wheel",
    name: "name",
};

// Example of how to create a component that connects to the redux store to consume
// information, and dispatches actions to the store.
export const UnconnectedGreeting = ({
    fetchUserData,
    userID,
    isLoading,
    errors,
    data,
}) => {
    useEffect(() => {
        fetchUserData(userID);
    }, [fetchUserData, userID]);

    if (isLoading) return <CircularProgress data-testid={TEST_IDS.loading} />;
    if (errors) return <p>Something went wrong.</p>;
    if (data) return <p data-testid={TEST_IDS.name}>Hello, {data.name}.</p>;

    return null;
};

const mapStateToProps = (state) => ({
    ...userDataSelector(state),
});

const ConnectedGreeting = connect(mapStateToProps, { fetchUserData })(
    UnconnectedGreeting
);

export default ConnectedGreeting;
