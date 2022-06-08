import React from "react";
// import styles from "./Teams.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Teams/Teams.module.scss";

import TeamCardAdmin from "components/dashboard/TeamCardAdmin/TeamCardAdmin";
import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import { teamsList } from "testing/mockData";

// import TeamCardAdmin from "../../components/dashboard/TeamCardAdmin/TeamCardAdmin";

const Teams = () => {
    const CardComponents = teamsList.map((team) => (
        <Grid
            item
            md={3}
            sm={4}
            xs={6}
            className={styles.dashboardGridItem}
            key={0}
            data-testid="team"
            direction="column"
            grid-template-column="true"
        >
            <TeamCardAdmin
                team_name={team.TeamName}
                members={team.Members}
            ></TeamCardAdmin>
        </Grid>
    ));

    return (
        <>
            <Header></Header>
            <Typography variant="h1">Teams</Typography>
            <div className={styles.searchBar}>
                <InventorySearch></InventorySearch>
            </div>
            <Grid container>{CardComponents}</Grid>
        </>
    );
};

export default Teams;
