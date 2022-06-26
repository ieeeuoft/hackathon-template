import React from "react";
import EditTeam from "components/dashboard/EditTeam/EditTeam";
import { render, fireEvent, makeStoreWithEntities } from "testing/utils";

Object.assign(navigator, {
    clipboard: {
        writeText: () => {},
    },
});

describe("<EditTeam />", () => {
    test("The team code is correctly displayed", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });

        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={false} teamSize={1} />,
            {
                store,
            }
        );

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("ABCDE")).toBeInTheDocument();
    });

    test("Both buttons are disabled when canChangeTeam is false", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={false} teamSize={1} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).toBeDisabled();

        const button_leave_team = getByText("LEAVE TEAM").closest("button");
        expect(button_leave_team).toBeDisabled();
    });

    test("Both buttons are not disabled when canChangeTeam is true", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={true} teamSize={1} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).not.toBeDisabled();

        const button_leave_team = getByText("LEAVE TEAM").closest("button");
        expect(button_leave_team).not.toBeDisabled();
    });

    test("Copy team code to clipboard", async () => {
        // inside unit test
        jest.spyOn(navigator.clipboard, "writeText");
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText } = render(
            <EditTeam teamCode="ABCDE" canChangeTeam={true} teamSize={1} />,
            {
                store,
            }
        );
        const copy_button = getByText("Copy");
        fireEvent.click(copy_button);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABCDE");
    });
});
