import React, { useEffect } from "react";
import CircularProgress from "@material-ui/core/CircularProgress";
import { fetchUserById, userDataSelector } from "slices/users/userSlice";
import { connect } from "react-redux";

export const TEST_IDS = {
    loading: "loading-wheel",
    name: "name",
};

// Example of how to create a component that connects to the redux store to consume
// information, and dispatches actions to the store.
export const UnconnectedGreeting = ({
    fetchUserById,
    userID,
    isLoading,
    error,
    data,
}) => {
    useEffect(() => {
        fetchUserById(userID);
    }, [fetchUserById, userID]);

    if (isLoading) return <CircularProgress data-testid={TEST_IDS.loading} />;
    if (error) return <p>Something went wrong: {error.message}.</p>;
    if (data) return <p data-testid={TEST_IDS.name}>Hello, {data.name}.</p>;

    return null;
};

const mapStateToProps = (state) => ({
    ...userDataSelector(state),
});

const ConnectedGreeting = connect(mapStateToProps, { fetchUserById })(
    UnconnectedGreeting
);

export default ConnectedGreeting;
