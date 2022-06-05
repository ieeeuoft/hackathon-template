import React from "react";
import { screen } from "@testing-library/react";
import { render } from "testing/utils";

import { mockHardware, mockTeamMultiple } from "testing/mockData";

import TeamDetail from "pages/TeamDetail/TeamDetail";
import { Provider } from "react-redux";

describe("User info table", () => {
    test("renders user info table", () => {
        render(<TeamDetail />);

        expect(screen.getByText("Team info")).toBeInTheDocument();
    });

    test("renders each user first and last name in the table", () => {
        render(<TeamDetail />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(
                screen.getByText(`${user.user.first_name} ${user.user.last_name}`)
            ).toBeInTheDocument();
        });
    });

    test("renders each user email in the table", () => {
        render(<TeamDetail />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(screen.getByText(user.user.email)).toBeInTheDocument();
        });
    });

    test("renders each user phone number in the table", () => {
        render(<TeamDetail />);

        mockTeamMultiple.profiles.forEach((user) => {
            expect(screen.getByText(user.user.phone)).toBeInTheDocument();
        });
    });

    test("users with id provided have a checkbox in the table", () => {
        // NOTE: this test assumes that users are rendered in the table in the same order that they are stored in the json test data
        const { container } = render(<TeamDetail />);

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
