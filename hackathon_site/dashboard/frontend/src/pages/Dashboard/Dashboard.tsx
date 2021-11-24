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
import {
    cardItems,
    members,
    teamCode,
    productInformation,
    mockPendingOrders,
    mockCheckedOutOrders,
    mockReturnedItems,
} from "testing/mockData";
import { hackathonName } from "constants.js";
import { useDispatch } from "react-redux";
import { getHardwareWithFilters } from "../../slices/hardware/hardwareSlice";

const Dashboard = () => {
    // TODO: change to open Product Overview Panel
    const addToCart = () => {
        alert("Add to cart");
    };

    // TODO: remove these when new Product Overview is added
    const [sideSheetOpen, setSideSheetOpen] = React.useState(false);
    const toggleMenu = () => {
        setSideSheetOpen(!sideSheetOpen);
    };

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getHardwareWithFilters());
    }, [dispatch]);

    return (
        <>
            <Header />
            {/* TODO: replace with new ProductOverview*/}
            <ProductOverview
                detail={productInformation}
                addToCart={addToCart}
                isVisible={sideSheetOpen}
                handleClose={toggleMenu}
            />
            <div className={styles.dashboard}>
                <Typography variant="h1">{hackathonName} Hardware Dashboard</Typography>
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
                    >
                        <TeamCard
                            members={members}
                            teamCode={teamCode}
                            handleEditTeam={() => alert("Editing Team")}
                        />
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
                {/* TODO: add back in when incident reports are completed on the frontend */}
                {/* <BrokenTable items={itemsBroken} openReportAlert={openBrokenTable} /> */}
                <PendingTable orders={mockPendingOrders} />
                <CheckedOutTable orders={mockCheckedOutOrders} />
                <ReturnedTable items={mockReturnedItems} />
            </div>
        </>
    );
};

export default Dashboard;
