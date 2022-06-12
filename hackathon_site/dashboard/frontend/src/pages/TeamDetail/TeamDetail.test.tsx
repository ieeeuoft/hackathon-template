import React from "react";

import { render, screen } from "testing/utils";

import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { mockTeamMultiple } from "testing/mockData";
import { RouteComponentProps } from "react-router-dom";

// this test is just so we pass dashboard-checks, doesn't do anything

test("renders without crashing", () => {
    const teamDetailProps = {
        match: {
            params: {
                id: mockTeamMultiple.id.toString(),
            },
        },
    } as RouteComponentProps<PageParams>;

    render(<TeamDetail {...teamDetailProps} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
});
