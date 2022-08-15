import {
    Grid,
    Paper,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React from "react";
import NotificationImportantIcon from "@material-ui/icons/NotificationImportant";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import DeleteIcon from "@material-ui/icons/Delete";

const TeamActionTable = () => {
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
                alert("Team successfully deleted");
            },
        },
    ];

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
        </Grid>
    );
};

export default TeamActionTable;
