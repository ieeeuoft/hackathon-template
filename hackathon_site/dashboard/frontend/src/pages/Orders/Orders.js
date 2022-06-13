import React from "react";
// import styles from "./Orders.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import EditTeamModal from "../../components/dashboard/EditTeamModal/EditTeamModal";
const Orders = () => {
    return (
        <>
            <Header />
            <Typography variant="h1">Orders</Typography>
            <p>IEEEEEsdfsdfsdE</p>
            <EditTeamModal teamCode={"ABCDE"} canChangeTeam={true} />
        </>
    );
};

export default Orders;
