// import React from "react";
// import Header from "components/general/Header/Header";
// import Typography from "@material-ui/core/Typography";
// import Grid from "@material-ui/core/Grid";
// import styles from "pages/Teams/Teams.module.scss";
//
// import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";
// import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";
// import { teamsList } from "testing/mockData";
//
// const Teams = () => {
//     const CardComponents = teamsList.map((team, index) => (
//         <Grid
//             item
//             md={3}
//             sm={4}
//             xs={12}
//             xl={2}
//             key={index}
//             className={styles.teamsListGridItem}
//             grid-template-column="true"
//             onClick={() => alert(`Goes to team-detail for team ${team.TeamName}`)}
//         >
//             <TeamCardAdmin teamCode={team.TeamName} members={team.Members} />
//         </Grid>
//     ));
//
//     return (
//         <>
//             <Header />
//             <Typography variant="h1">Teams</Typography>
//             <TeamSearchBar />
//             <Grid container>{CardComponents}</Grid>
//         </>
//     );
// };
//
// export default Teams;

import React, { useState } from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import styles from "pages/Teams/Teams.module.scss";

import TeamCardAdmin from "components/team/TeamCardAdmin/TeamCardAdmin";
import TeamSearchBar from "components/team/TeamSearchBar/TeamSearchBar";
import { teamsList } from "testing/mockData";
import Button from "@material-ui/core/Button";
import PopupModal from "../../components/general/PopupModal/PopupModal";

const Teams = () => {
    const [showModal, setShowModal] = useState(false);

    const CardComponents = teamsList.map((team, index) => (
        <Grid
            item
            md={3}
            sm={4}
            xs={12}
            xl={2}
            key={index}
            className={styles.teamsListGridItem}
            grid-template-column="true"
            onClick={() => alert(`Goes to team-detail for team ${team.TeamName}`)}
        >
            <TeamCardAdmin teamCode={team.TeamName} members={team.Members} />
        </Grid>
    ));

    const cancelModal = () => {
        console.log("clicked cancel");
        setShowModal(false);
    };

    const submitModal = () => {
        console.log("clicked submit");
        setShowModal(false);
    };

    return (
        <>
            <Header />
            <Typography variant="h1">Teams</Typography>
            <TeamSearchBar />
            <Grid container>{CardComponents}</Grid>
            <Button
                onClick={() => {
                    setShowModal(true);
                }}
            >
                Toggle Modal
            </Button>
            <PopupModal
                description={
                    "This is a test modal sdfkasjfjsdfjsl;sadflskla sdafasldfjsaf dsfjsdkjfsf sdfjks"
                }
                isVisible={showModal}
                submitHandler={submitModal}
                cancelHandler={cancelModal}
                cancelText={"cancel"}
                submitText={"submit"}
                title={"Test Modal"}
            ></PopupModal>
        </>
    );
};

export default Teams;
