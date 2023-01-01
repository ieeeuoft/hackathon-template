import React from "react";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Alert from "@material-ui/lab/Alert";
import LinearProgress from "@material-ui/core/LinearProgress";

import FileCopyIcon from "@material-ui/icons/FileCopy";
import SideSheetRight from "components/general/SideSheetRight/SideSheetRight";
import { Formik, FormikValues } from "formik";

import styles from "./EditTeam.module.scss";
import { isTeamModalVisibleSelector, closeTeamModalItem } from "slices/ui/uiSlice";
import { useDispatch, useSelector } from "react-redux";
import { Grid } from "@material-ui/core";
import { maxTeamSize } from "constants.js";
import {
    isJoinLoadingSelector,
    isLeaveTeamLoadingSelector,
    joinTeam,
    leaveTeam,
} from "slices/event/teamSlice";

interface TeamModalProps {
    teamCode: string;
    canChangeTeam: boolean;
    teamSize: number;
}

const TeamInfoBlock = ({ teamCode, teamSize }: TeamModalProps) => {
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

const TeamChangeForm = ({ canChangeTeam, teamCode }: TeamModalProps) => {
    const dispatch = useDispatch();
    const isJoinTeamLoading = useSelector(isJoinLoadingSelector);

    const handleSubmitExternal = (values: FormikValues) => {
        dispatch(joinTeam(values.teamCode));
    };

    return (
        <>
            <Typography variant={"h2"} className={styles.heading}>
                Join a different team
            </Typography>
            <Formik
                initialValues={{
                    teamCode: "",
                }}
                onSubmit={handleSubmitExternal}
            >
                {({ errors, handleSubmit, handleChange, values }) => (
                    <form
                        noValidate
                        onSubmit={handleSubmit}
                        autoComplete="off"
                        className={styles.teamForm}
                    >
                        <Grid container spacing={3}>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth={true}
                                    label="Team Code"
                                    name="teamCode"
                                    variant="outlined"
                                    value={values.teamCode}
                                    onChange={handleChange}
                                />
                            </Grid>
                            <Grid item>
                                <Button
                                    color={"primary"}
                                    className={styles.teamButton}
                                    variant="contained"
                                    disabled={
                                        !canChangeTeam
                                            ? true
                                            : isJoinTeamLoading
                                            ? true
                                            : values.teamCode === ""
                                            ? true
                                            : values.teamCode === teamCode
                                    }
                                    type="submit"
                                >
                                    SUBMIT
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                )}
            </Formik>
        </>
    );
};

export const EditTeam = ({ teamCode, canChangeTeam, teamSize }: TeamModalProps) => {
    const dispatch = useDispatch();
    const closeTeamModal = () => dispatch(closeTeamModalItem());
    const isTeamModalVisible: boolean = useSelector(isTeamModalVisibleSelector);
    const handleLeaveTeam = () => dispatch(leaveTeam());
    const isLeaveTeamLoading = useSelector(isLeaveTeamLoadingSelector);
    const isJoinTeamLoading = useSelector(isJoinLoadingSelector);

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
                        or join another team.
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
                    {isJoinTeamLoading ||
                        (isLeaveTeamLoading && (
                            <LinearProgress style={{ marginTop: "10px" }} value={0} />
                        ))}
                </div>
                <div className={styles.formButton}>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth={true}
                        size="large"
                        type="submit"
                        disableElevation
                        disabled={isJoinTeamLoading || isLeaveTeamLoading}
                        onClick={handleLeaveTeam}
                    >
                        LEAVE TEAM
                    </Button>
                </div>
            </div>
        </SideSheetRight>
    );
};

export default EditTeam;
