import React, { useState } from "react";
import styles from "./ProjectDescription.module.scss";
import { Formik, Form, Field, FormikValues } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Grid, Typography } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { updateProjectDescription } from "slices/event/teamDetailSlice";
import { minProjectDescriptionLength } from "constants.js";
import { teamSelector, isLoadingSelector } from "slices/event/teamSlice";

export interface ProjectDescriptionProps {
    teamCode: string;
}

const ProjectDescription = ({ teamCode }: ProjectDescriptionProps) => {
    const dispatch = useDispatch();
    const isProjectDescriptionLoading: boolean = useSelector(isLoadingSelector);
    const initialProjectDescription =
        useSelector(teamSelector)?.project_description ||
        "Project description is required";
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
        setIsEditing(false);
    };

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
                        {({ isSubmitting, isValid, values }) => (
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
                                {minProjectDescriptionLength -
                                    values.projectDescription.length >
                                    0 && (
                                    <Typography
                                        variant="caption"
                                        display="block"
                                        gutterBottom
                                    >
                                        Minimum{" "}
                                        {minProjectDescriptionLength -
                                            values.projectDescription.length}{" "}
                                        characters required
                                    </Typography>
                                )}
                                <Box mt={2}>
                                    <Grid container justifyContent="flex-end">
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={!isValid || isSubmitting}
                                                    className={styles.submitBtn}
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
                                        ) : null}
                                        {!isEditing && (
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
