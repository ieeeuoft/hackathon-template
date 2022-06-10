import React from "react";
import Header from "components/general/Header/Header";
import Typography from "@material-ui/core/Typography";
import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";
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
    Grid,
} from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";

export interface PageParams {
    id: string;
}

const TeamDetail = () => {
    return (
        <>
            <Header />
            <TeamInfoTable match={id} />
        </>
    );
};
