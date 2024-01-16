import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Grid,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import NotificationImportantIcon from "@material-ui/icons/NotificationImportant";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import DeleteIcon from "@material-ui/icons/Delete";
import PopupModal from "components/general/PopupModal/PopupModal";
import { deleteTeamThunk } from "slices/event/teamAdminSlice";
import { teamDetailAdapterSelector } from "slices/event/teamDetailSlice";

interface TeamActionTableProps {
    teamCode: string;
}

const TeamActionTable = ({ teamCode }: TeamActionTableProps) => {
    const [visible, setVisible] = useState(false);
    const [warningVisible, setWarningVisible] = useState(false);
    const profiles = useSelector(teamDetailAdapterSelector.selectAll);

    const hasMultipleTeamMembers = () => {
        return profiles.length >= 1;
    };

    const actionButtons = [
        {
            icon: <NotificationImportantIcon />,
            text: "Notify team to come to table to resolve issue",
            onClick: undefined,
        },
        {
            icon: <CallSplitIcon />,
            text: "Split team",
            onClick: undefined,
        },
        {
            icon: <MergeTypeIcon />,
            text: "Merge team",
            onClick: undefined,
        },
        {
            icon: <DeleteIcon />,
            text: "Delete team",
            onClick: () => {
                setVisible(true);
            },
        },
    ];

    const dispatch = useDispatch();
    const history = useHistory();

    const deleteTeam = async () => {
        setVisible(false);
        if (hasMultipleTeamMembers()) {
            setWarningVisible(true);
        } else {
            await dispatch(deleteTeamThunk(teamCode));
            history.push("/teams");
        }
    };

    const handleWarningSubmit = async () => {
        setWarningVisible(false);
        const result = await dispatch(deleteTeamThunk(teamCode));
        // @ts-ignore
        if (result.error === undefined || result.error.message !== "Rejected") {
            history.push("/teams");
        }
    };

    return (
        <Grid container direction="column" spacing={1} item md={6} xs={12}>
            <Grid item>
                <Typography variant="h2">Actions</Typography>
            </Grid>

            <List
                component={Paper}
                style={{ display: "flex", flexDirection: "column", flex: 1 }}
            >
                {actionButtons.map((action, index) => (
                    <ListItem
                        key={index}
                        button
                        onClick={action.onClick}
                        disabled={action.onClick === undefined}
                        style={{ flex: 1 }}
                    >
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        <ListItemText primary={action.text} />
                    </ListItem>
                ))}
            </List>

            <PopupModal
                title="Confirmation"
                description={`Are you sure you want to delete this team (${teamCode})?`}
                isVisible={visible}
                submitText="Yes"
                cancelText="No"
                submitHandler={deleteTeam}
                cancelHandler={() => setVisible(false)}
            />

            <PopupModal
                title="Warning"
                description="This team has multiple members. Deleting it will also remove all team members. Are you sure you want to continue?"
                isVisible={warningVisible}
                submitText="Yes, Delete"
                cancelText="Cancel"
                submitHandler={handleWarningSubmit}
                cancelHandler={() => setWarningVisible(false)}
            />
        </Grid>
    );
};

export default TeamActionTable;
