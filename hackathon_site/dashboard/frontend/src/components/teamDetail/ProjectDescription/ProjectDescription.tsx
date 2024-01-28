import React, { useState, useEffect } from "react";
import styles from "./ProjectDescription.module.scss";
import { Formik, Form, Field, FormikValues } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Grid, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import {
    updateProjectDescription,
    fetchInitialProjectDescription,
    projectDescriptionSelector,
    isTeamInfoLoadingSelector,
    isProjectDescriptionLoadingSelector,
} from "slices/event/teamDetailSlice";
import CircularProgress from "@material-ui/core/CircularProgress";

interface ProjectDescriptionProps {
    teamCode: string;
}

const ProjectDescription = ({ teamCode }: ProjectDescriptionProps) => {
    const dispatch = useDispatch();
    const isTeamInfoLoading: boolean = useSelector(isTeamInfoLoadingSelector);
    const isProjectDescriptionLoading: boolean = useSelector(
        isProjectDescriptionLoadingSelector
    );
    const initialProjectDescription =
        useSelector(projectDescriptionSelector) ||
        "Write your project description here";
    const [isEditing, setIsEditing] = useState(false);
    const projectDescriptionSchema = Yup.object().shape({
        projectDescription: Yup.string()
            .max(500)
            .required("Project description is required"),
    });

    const handleSubmit = async (values: FormikValues, { setSubmitting }: any) => {
        await dispatch(
            updateProjectDescription({
                teamCode: teamCode,
                projectDescription: values.projectDescription,
            })
        );
        setSubmitting(false);
    };

    useEffect(() => {
        if (teamCode != "None") {
            dispatch(fetchInitialProjectDescription(teamCode));
        }
    }, [dispatch, teamCode]);

    return (
        <>
            {isProjectDescriptionLoading ? (
                ""
            ) : (
                <div className={styles.title}>
                    <Typography variant="h2" gutterBottom>
                        Project Description
                    </Typography>
                    <Formik
                        initialValues={{
                            projectDescription: initialProjectDescription,
                        }}
                        validationSchema={projectDescriptionSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ isSubmitting, isValid }) => (
                            <Form>
                                <Field
                                    as={TextField}
                                    name="projectDescription"
                                    multiline
                                    fullWidth
                                    variant="outlined"
                                    disabled={!isEditing}
                                    rows={4}
                                    className={styles.formTextField}
                                />
                                <Box mt={2}>
                                    <Grid container justifyContent="flex-end">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={!isValid || isSubmitting}
                                                    className={styles.submitBtn}
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    SUBMIT
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="contained"
                                                    color="secondary"
                                                    className={styles.actionBtn}
                                                    onClick={() => setIsEditing(false)}
                                                >
                                                    CANCEL
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                type="button"
                                                variant="contained"
                                                color="primary"
                                                className={styles.actionBtn}
                                                onClick={() => setIsEditing(true)}
                                            >
                                                EDIT
                                            </Button>
                                        )}
                                    </Grid>
                                </Box>
                            </Form>
                        )}
                    </Formik>
                </div>
            )}
        </>
    );
};

export default ProjectDescription;
