import React from "react";

import TeamInfoTable from "components/teamDetail/TeamInfoTable/TeamInfoTable";

import { RouteComponentProps, useHistory, useLocation } from "react-router-dom";
import Header from "components/general/Header/Header";

export interface PageParams {
    id: string;
}

const TeamDetail = ({ match }: RouteComponentProps<PageParams>) => {
    const history = useHistory();
    const location = useLocation();

    return (
        <>
            <Header />
            <TeamInfoTable match={match} history={history} location={location} />
        </>
    );
};

export default TeamDetail;
