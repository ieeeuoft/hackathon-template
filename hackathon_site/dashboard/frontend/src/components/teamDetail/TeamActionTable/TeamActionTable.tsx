import {
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@material-ui/core";
import { useHistory } from "react-router-dom";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import NotificationImportantIcon from "@material-ui/icons/NotificationImportant";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import DeleteIcon from "@material-ui/icons/Delete";
import PopupModal from "components/general/PopupModal/PopupModal";
import { useDispatch } from "react-redux";
import { deleteTeamThunk } from "slices/event/teamAdminSlice";

interface TeamActionTableProps {
    teamCode: string;
}

const TeamActionTable = ({ teamCode }: TeamActionTableProps) => {
    const [visible, setVisible] = useState(false);
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
        try {
            await dispatch(deleteTeamThunk(teamCode));
            history.push("/teams");
        } catch (error) {
            // Handle any errors that occur during deletion
            console.error("Error deleting team:", error);
        }
    };

    return (
        <Grid container direction="column" spacing={1} item md={6} xs={12}>
            <Grid item>
                <Typography variant="h2">Actions</Typography>
            </Grid>

            <List
                component={Paper}
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                }}
            >
                {actionButtons.map((action, index) => (
                    <ListItem
                        key={index}
                        button
                        onClick={action.onClick}
                        disabled={action.onClick === undefined}
                        style={{
                            flex: 1,
                        }}
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
        </Grid>
    );
};

export default TeamActionTable;
