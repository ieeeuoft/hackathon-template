import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchInitialProjectDescription,
    projectDescriptionSelector,
    isTeamInfoLoadingSelector,
    teamInfoErrorSelector,
} from "slices/event/teamDetailSlice";
import styles from "./ProjectDescription.module.scss";
import { LinearProgress, Paper, Typography } from "@material-ui/core";
interface ProjectDescriptionProps {
    teamCode: string;
}

const ProjectDescriptionDetail = ({ teamCode }: ProjectDescriptionProps) => {
    const dispatch = useDispatch();

    const projectDescription = useSelector(projectDescriptionSelector);
    const isTeamInfoLoading = useSelector(isTeamInfoLoadingSelector);

    useEffect(() => {
        dispatch(fetchInitialProjectDescription(teamCode));
    }, [dispatch, teamCode]);

    return (
        <div>
            {isTeamInfoLoading ? (
                <LinearProgress data-testid="team-info-linear-progress" />
            ) : (
                <>
                    <Typography variant="h2" gutterBottom>
                        Project Description
                    </Typography>
                    <Paper className={styles.projectDescriptionDetail}>
                        <Typography variant="body1">{projectDescription}</Typography>
                    </Paper>
                </>
            )}
        </div>
    );
};

export default ProjectDescriptionDetail;
