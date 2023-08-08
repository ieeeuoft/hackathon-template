import React, { useEffect } from "react";
import Typography from "@material-ui/core/Typography";
import Header from "components/general/Header/Header";
import { hackathonName } from "constants.js";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import { styled } from "@material-ui/core/styles";
import MemoryIcon from "@material-ui/icons/Memory";
import PeopleIcon from "@material-ui/icons/People";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import LocalMallIcon from "@material-ui/icons/LocalMall";
import BrokenImageIcon from "@material-ui/icons/BrokenImage";
import { useDispatch, useSelector } from "react-redux";
import {
    teamCountSelector,
    getTeamsWithSearchThunk,
    totalParticipantCountSelector,
} from "slices/event/teamAdminSlice";
import { clearFilters } from "slices/hardware/hardwareSlice";
import {
    adminOrderNewTotalSelector,
    getOrdersWithFilters,
    adminCheckedOutOrderTotalSelector,
} from "slices/order/adminOrderSlice";

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: "#fff",
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: "center",
    color: theme.palette.text.secondary,
}));

const AdminDashboard = () => {
    const dispatch = useDispatch();
    const orderQuantity = useSelector(adminOrderNewTotalSelector);
    const count = useSelector(teamCountSelector);
    const participants = useSelector(totalParticipantCountSelector);
    const checkedOut = useSelector(adminCheckedOutOrderTotalSelector);

    // TODO: Create selector for Broken/Lost Items

    useEffect(() => {
        dispatch(clearFilters());
        dispatch(getOrdersWithFilters());
        dispatch(getTeamsWithSearchThunk());
    }, [dispatch]);
    return (
        <>
            <Header />
            <div style={{ width: "100%" }}>
                <Typography style={{ paddingBottom: "20px" }} variant="h1">
                    {hackathonName} Admin Dashboard
                </Typography>
                <Typography style={{ paddingBottom: "10px" }} variant="h2">
                    {" "}
                    Overview{" "}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                    <Grid wrap="nowrap" container spacing={2}>
                        <Grid item xs={5} md={3}>
                            <Item>
                                <Box display="flex" alignItems="center">
                                    <MemoryIcon />{" "}
                                    <Typography
                                        variant="inherit"
                                        style={{
                                            paddingLeft: "7px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            color: "black",
                                        }}
                                    >
                                        {checkedOut} item's checked out
                                    </Typography>
                                </Box>
                            </Item>
                        </Grid>
                        <Grid item xs={5} md={3}>
                            <Item>
                                <Box display="flex" alignItems="center">
                                    <PeopleIcon />{" "}
                                    <Typography
                                        variant="inherit"
                                        style={{
                                            paddingLeft: "7px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            color: "black",
                                        }}
                                    >
                                        {participants} participants
                                    </Typography>
                                </Box>
                            </Item>
                        </Grid>
                        <Grid item xs={5} md={3}>
                            <Item>
                                <Box display="flex" alignItems="center">
                                    <AccountBoxIcon />{" "}
                                    <Typography
                                        variant="inherit"
                                        style={{
                                            paddingLeft: "7px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            color: "black",
                                        }}
                                    >
                                        {count} teams
                                    </Typography>
                                </Box>
                            </Item>
                        </Grid>
                        <Grid item xs={5} md={3}>
                            <Item>
                                <Box display="flex" alignItems="center">
                                    <LocalMallIcon />{" "}
                                    <Typography
                                        variant="inherit"
                                        style={{
                                            paddingLeft: "7px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            color: "black",
                                        }}
                                    >
                                        {orderQuantity} orders
                                    </Typography>
                                </Box>
                            </Item>
                        </Grid>
                        <Grid item xs={5} md={3}>
                            <Item>
                                <Box display="flex" alignItems="center">
                                    <BrokenImageIcon />{" "}
                                    <Typography
                                        variant="inherit"
                                        style={{
                                            paddingLeft: "7px",
                                            paddingBottom: "10px",
                                            paddingTop: "10px",
                                            color: "black",
                                        }}
                                    >
                                        7 broken/lost items
                                    </Typography>
                                </Box>
                            </Item>
                        </Grid>
                    </Grid>
                </Box>
            </div>
        </>
    );
};

export default AdminDashboard;
