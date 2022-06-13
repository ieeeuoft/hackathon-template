import React from "react";

import { render, screen } from "testing/utils";

import { mockTeamMultiple } from "testing/mockData";
import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";

test("renders without crashing", () => {
    const teamDetailProps = {
        match: {
            params: {
                id: mockTeamMultiple.id.toString(),
            },
        },
    } as RouteComponentProps<PageParams>;
    render(<TeamDetail {...teamDetailProps} />);
    expect(
        screen.getByText(`Team ${teamDetailProps.match.params.id} Overview`)
    ).toBeInTheDocument();
});
