import {
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Button,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React from "react";
import NotificationImportantIcon from "@material-ui/icons/NotificationImportant";
import CallSplitIcon from "@material-ui/icons/CallSplit";
import MergeTypeIcon from "@material-ui/icons/MergeType";
import DeleteIcon from "@material-ui/icons/Delete";

import styles from "./TeamActionsTable.module.scss";

const TeamActionTable = () => {
    return (
        <Grid container spacing={1} direction="column" item md={6} xs={12}>
            <Grid item>
                <Typography variant="h2">Actions</Typography>
            </Grid>
            <Grid item>
                <TableContainer component={Paper}>
                    <Table>
                        <TableBody>
                            <TableRow>
                                <TableCell className={styles.actionItem}>
                                    <Button
                                        className={styles.button}
                                        startIcon={<NotificationImportantIcon />}
                                        disabled
                                        size="large"
                                    >
                                        Notify team to come to table to resolve issue
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={styles.actionItem}>
                                    <Button
                                        className={styles.button}
                                        startIcon={<CallSplitIcon />}
                                        disabled
                                        size="large"
                                    >
                                        Split team
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={styles.actionItem}>
                                    <Button
                                        className={styles.button}
                                        startIcon={<MergeTypeIcon />}
                                        disabled
                                        size="large"
                                    >
                                        Merge team
                                    </Button>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className={styles.actionItem}>
                                    <Button
                                        className={styles.button}
                                        startIcon={
                                            <DeleteIcon className={styles.icon} />
                                        }
                                        size="large"
                                        onClick={() => {
                                            alert("Team successfully deleted");
                                        }}
                                    >
                                        Delete team
                                    </Button>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Grid>
        </Grid>
    );
};

export default TeamActionTable;
