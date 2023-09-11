import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikValues } from "formik";
import * as Yup from "yup";
import { TextField, Button, Box, Grid } from "@material-ui/core";
import { useDispatch } from "react-redux";
import { updateProjectDescription } from "slices/event/teamDetailSlice";

interface ProjectDescriptionProps {
    teamCode: string;
}

const ProjectDescription = ({ teamCode }: ProjectDescriptionProps) => {
    const dispatch = useDispatch();
    const initialProjectDescription = "Write your project description here";
    const [isEditing, setIsEditing] = useState(false);
    const projectDescriptionSchema = Yup.object().shape({
        projectDescription: Yup.string()
            .max(500)
            .required("Project description is required"),
    });

    const handleSubmit = async (values: FormikValues, { setSubmitting }: any) => {
        try {
            await dispatch(
                updateProjectDescription({
                    teamCode: teamCode,
                    projectDescription: values.projectDescription,
                })
            );
        } catch (error) {
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <Formik
                initialValues={{ projectDescription: initialProjectDescription }}
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
                            style={{ margin: "20px 5px 0 0" }}
                        />
                        <Box mt={2}>
                            <Grid container justifyContent="flex-end">
                                {isEditing ? (
                                    <>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!isValid || isSubmitting}
                                            style={{
                                                width: "120px",
                                                marginRight: "10px",
                                            }}
                                        >
                                            SUBMIT
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="contained"
                                            color="secondary"
                                            style={{ width: "120px" }}
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
                                        style={{ width: "120px" }}
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
    );
};

export default ProjectDescription;
