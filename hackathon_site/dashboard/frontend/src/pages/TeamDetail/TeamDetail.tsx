import React from "react";
import styles from "./TeamDetail.module.scss";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import { mockTeamMultiple } from "testing/mockData";
import {
    Table,
    TableBody,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    Checkbox,
    Paper,
    Container,
    Box,
} from "@material-ui/core";

const TeamDetail = () => {
    return (
        <>
            <Header />
            <Container className={styles.container}>
                <Typography variant="h1">
                    Team {mockTeamMultiple.team_code} Overview
                </Typography>

                <Box className={styles.tableContainer}>
                    <Box className={styles.left}>
                        <Typography variant="h2" className={styles.tableTitle}>
                            Team info
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table className={styles.table} size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Phone</TableCell>
                                        <TableCell>ID</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {mockTeamMultiple.profiles.map((row) => (
                                        <TableRow key={row.user.id}>
                                            <TableCell>
                                                {row.user.first_name}{" "}
                                                {row.user.last_name}
                                            </TableCell>
                                            <TableCell>{row.user.email}</TableCell>
                                            <TableCell>{row.user.phone}</TableCell>
                                            <TableCell>
                                                <Checkbox
                                                    checked={row.id_provided}
                                                    className={styles.checkBox}
                                                ></Checkbox>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>

                    <Box className={styles.right}>
                        <Typography variant="h2" className={styles.tableTitle}>
                            Dummy
                        </Typography>
                        <TableContainer component={Paper}>
                            <Table>Dummy</Table>
                        </TableContainer>
                    </Box>
                </Box>
            </Container>
        </>
    );
};

export default TeamDetail;
