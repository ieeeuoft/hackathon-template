import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Alert from "@material-ui/lab/Alert";

import FileCopyIcon from "@material-ui/icons/FileCopy";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";

import styles from "./EditTeam.module.scss";
import { isTeamModalVisibleSelector, closeTeamModalItem } from "slices/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@material-ui/core";
import { maxTeamSize } from "constants.js";

interface TeamModalProps {
    teamCode: string;
    canChangeTeam: boolean;
    teamSize: number;
}

const TeamInfoBlock = ({ teamCode, canChangeTeam, teamSize }: TeamModalProps) => {
    return (
        <Alert severity="info" icon={false} className={styles.alertBox}>
            Team code:
            <strong> {teamCode} </strong>
            <Button
                color={"primary"}
                onClick={() => navigator.clipboard.writeText(teamCode)}
            >
                <FileCopyIcon fontSize={"small"} />
                Copy
            </Button>
            <p>There are {maxTeamSize - teamSize} spots remaining on your team.</p>
        </Alert>
    );
};

const TeamChangeForm = ({ canChangeTeam }: TeamModalProps) => {
    const [value, setValue] = React.useState("");

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    };
    return (
        <>
            <Typography variant={"h2"} className={styles.heading}>
                Join a different team
            </Typography>
            <form noValidate autoComplete="off" className={styles.teamForm}>
                <Grid container spacing={3}>
                    <Grid item xs={8}>
                        <TextField
                            fullWidth={true}
                            label="Team code"
                            variant="outlined"
                            value={value}
                            onChange={handleChange}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            color={"primary"}
                            className={styles.teamButton}
                            variant="contained"
                            disabled={!canChangeTeam}
                            onClick={() => alert(`The new teamcode is: ${value}`)}
                        >
                            SUBMIT
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </>
    );
};

export const EditTeam = ({ teamCode, canChangeTeam, teamSize }: TeamModalProps) => {
    const dispatch = useDispatch();
    const closeTeamModal = () => dispatch(closeTeamModalItem());
    const isTeamModalVisible: boolean = useSelector(isTeamModalVisibleSelector);

    return (
        <SideSheetRight
            title="Edit Team"
            isVisible={isTeamModalVisible}
            handleClose={closeTeamModal}
        >
            <div className={styles.editTeamModal}>
                <div className={styles.editTeamModalDiv}>
                    <Typography variant="body1">
                        Create a team with up to 4 people. Share your code with others
                        who have RSVP’ed to MakeUofT, or join another team.
                    </Typography>
                    <Typography variant="body2" className={styles.heading}>
                        Note: You do not have to stay in the same team you applied with.
                    </Typography>
                    <TeamInfoBlock
                        teamCode={teamCode}
                        canChangeTeam={false}
                        teamSize={teamSize}
                    />
                    <Typography variant="body1" className={styles.heading}>
                        Your team will be locked after you make your first order on the
                        day of the event. After that, in order to leave the team or add
                        new members, please speak to the tech team at the tech station.
                    </Typography>

                    <TeamChangeForm
                        teamCode={teamCode}
                        canChangeTeam={canChangeTeam}
                        teamSize={teamSize}
                    />
                </div>
                <div className={styles.formButton}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth={true}
                        size="large"
                        type="submit"
                        disableElevation
                        disabled={!canChangeTeam}
                    >
                        LEAVE TEAM
                    </Button>
                </div>
            </div>
        </SideSheetRight>
    );
};

export default EditTeam;
