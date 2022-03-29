import React, { useEffect } from "react";
import styles from "./Dashboard.module.scss";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import DashCard from "components/dashboard/DashCard/DashCard";
import TeamCard from "components/dashboard/TeamCard/TeamCard";
import {
    PendingTable,
    CheckedOutTable,
    ReturnedTable,
} from "components/dashboard/ItemTable/ItemTable";
import ProductOverview from "components/inventory/ProductOverview/ProductOverview";
import Header from "components/general/Header/Header";
import { cardItems, mockPendingOrders, mockCheckedOutOrders } from "testing/mockData";
import { hackathonName } from "constants.js";
import { useDispatch, useSelector } from "react-redux";
import { getHardwareWithFilters, setFilters } from "slices/hardware/hardwareSlice";
import { getCategories } from "slices/hardware/categorySlice";
import { getCurrentTeam, isLoadingSelector } from "slices/event/teamSlice";
import { fulfillmentErrorSelector } from "slices/hardware/cartSlice";
import LinearProgress from "@material-ui/core/LinearProgress";
import { Alert, AlertTitle } from "@material-ui/lab";

const Dashboard = () => {
    const dispatch = useDispatch();
    const isTeamLoading = useSelector(isLoadingSelector);
    const orderFulfillmentError = useSelector(fulfillmentErrorSelector);

    useEffect(() => {
        const allOrders = mockPendingOrders.concat(mockCheckedOutOrders);
        const hardware_ids = allOrders.flatMap((order) =>
            order.items.map((item) => item.hardware_id)
        );
        dispatch(
            setFilters({
                hardware_ids,
            })
        );
        dispatch(getHardwareWithFilters({ keepOld: true }));
        dispatch(getCategories());
        dispatch(getCurrentTeam());
    }, [dispatch]);

    return (
        <>
            <Header />
            <ProductOverview showAddToCartButton={false} />
            <div className={styles.dashboard}>
                <Typography variant="h1">{hackathonName} Hardware Dashboard</Typography>
                {isTeamLoading ? (
                    <LinearProgress
                        style={{ width: "100%", marginTop: 25 }}
                        data-testid="team-linear-progress"
                    />
                ) : (
                    <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="flex-start"
                        spacing={2}
                        className={styles.dashboardGrid}
                    >
                        <Grid
                            item
                            md={3}
                            sm={4}
                            xs={6}
                            className={styles.dashboardGridItem}
                            key={0}
                            data-testid="team"
                        >
                            <TeamCard handleEditTeam={() => alert("Editing Team")} />
                        </Grid>
                        {cardItems.map(({ title, content }, i) => (
                            <Grid
                                item
                                md={3}
                                sm={4}
                                xs={6}
                                className={styles.dashboardGridItem}
                                key={i + 1}
                            >
                                <DashCard title={title} content={content} />
                            </Grid>
                        ))}
                    </Grid>
                {orderFulfillmentError && (
                    <Alert severity="info" style={{ margin: "15px 0px" }}>
                        <AlertTitle>
                            {`There were modifications made to order ${orderFulfillmentError.order_id}`}
                        </AlertTitle>
                        <ul style={{ marginLeft: "20px" }}>
                            {orderFulfillmentError.errors.map((error) => (
                                <li>{error.message}</li>
                            ))}
                        </ul>
                    </Alert>
                )}
                {/* TODO: add back in when incident reports are completed on the frontend */}
                {/* <BrokenTable items={itemsBroken} openReportAlert={openBrokenTable} /> */}
                <PendingTable orders={mockPendingOrders} />
                <CheckedOutTable orders={mockCheckedOutOrders} />
                <ReturnedTable orders={mockCheckedOutOrders} />
            </div>
        </>
    );
};

export default Dashboard;
