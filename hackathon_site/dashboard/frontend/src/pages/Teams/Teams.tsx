import React from "react";
// import styles from "./Teams.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Teams/Teams.module.scss";

import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";
import InventorySearch from "components/inventory/InventorySearch/InventorySearch";
import { teamsList } from "testing/mockData";

const Teams = () => {
    const CardComponents = teamsList.map((team, index) => (
        <Grid
            item
            md={3}
            sm={4}
            xs={12}
            key={index}
            className={styles.dashboard}
            grid-template-column="true"
            onClick={() => alert(`Goes to team-detail for team ${team.TeamName}`)}
        >
            <TeamCardAdmin teamCode={team.TeamName} members={team.Members} />
        </Grid>
    ));

    return (
        <>
            <Header />
            <Typography variant="h1">Teams</Typography>
            <div className={styles.searchBar}>
                <InventorySearch></InventorySearch>
            </div>
            <Grid container>{CardComponents}</Grid>
        </>
    );
};

export default Teams;
