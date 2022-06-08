import React from "react";
import { render, screen } from "testing/utils";
import { mockTeamMultiple } from "testing/mockData";

import TeamDetail, { PageParams } from "pages/TeamDetail/TeamDetail";
import { RouteComponentProps } from "react-router-dom";

const teamDetailProps = {
    match: {
        params: {
            code: mockTeamMultiple.team_code,
        },
    },
} as RouteComponentProps<PageParams>;

describe("User info table", () => {
    test("renders team detail page with team code", () => {
        render(<TeamDetail {...teamDetailProps} />);

        expect(
            screen.getByText(`Team ${mockTeamMultiple.team_code} Overview`)
        ).toBeInTheDocument();
    });

    test("renders user info table", () => {
        render(<TeamDetail {...teamDetailProps} />);

        expect(screen.getByText("Team info")).toBeInTheDocument();
    });

    test("renders each user first and last name in the table", () => {
        render(<TeamDetail {...teamDetailProps} />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(
                screen.getByText(`${user.user.first_name} ${user.user.last_name}`)
            ).toBeInTheDocument();
        });
    });

    test("renders each user email in the table", () => {
        render(<TeamDetail {...teamDetailProps} />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(screen.getByText(user.user.email)).toBeInTheDocument();
        });
    });

    test("renders each user phone number in the table", () => {
        render(<TeamDetail {...teamDetailProps} />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(screen.getByText(user.user.phone)).toBeInTheDocument();
        });
    });

    test("users with id provided have a checkbox in the table", () => {
        // NOTE: this test assumes that users are rendered in the table in the same order that they are stored in the json test data
        const { container } = render(<TeamDetail {...teamDetailProps} />);

        const checkboxes = container.getElementsByClassName("MuiCheckbox-root");

        for (let i = 0; i < checkboxes.length; i++) {
            if (mockTeamMultiple.profiles[i].id_provided) {
                expect(checkboxes[i].classList.contains("Mui-checked")).toBe(true);
            } else {
                expect(checkboxes[i].classList.contains("Mui-checked")).toBe(false);
            }
        }
    });
});
