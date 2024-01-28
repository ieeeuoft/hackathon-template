import React from "react";
import AlertBox from "components/general/AlertBox/AlertBox";
import { projectDescriptionSelector } from "slices/event/teamDetailSlice";
import { useSelector } from "react-redux";
import { minProjectDescriptionLength } from "constants.js";

const ProjectDescriptionAlert = () => {
    const projectDescription = useSelector(projectDescriptionSelector);

    if (projectDescription && projectDescription.length < minProjectDescriptionLength) {
        return (
            <AlertBox
                data-testid="project-description-alert"
                title="Project Description Required"
                error="Please provide a more detailed project description."
                type="error"
            />
        );
    }

    return null;
};

export default ProjectDescriptionAlert;
