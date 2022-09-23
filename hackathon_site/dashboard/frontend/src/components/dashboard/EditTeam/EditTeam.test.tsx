import React from "react";
import EditTeam from "components/dashboard/EditTeam/EditTeam";
import { render, fireEvent, makeStoreWithEntities } from "testing/utils";
import { act, getByLabelText, getByTestId } from "@testing-library/react";
import { waitFor } from "../../../testing/utils";

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

    test("Buttons should be disabled if the user doesn't type anything", async () => {
        const store = makeStoreWithEntities({
            ui: {
                dashboard: {
                    isEditTeamVisible: true,
                },
            },
        });
        const { getByText, getByTestId } = render(
            <EditTeam teamCode={"ABCDE"} canChangeTeam={false} teamSize={1} />,
            {
                store,
            }
        );

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).toBeDisabled();
    });

    test("Buttons should be disabled if the user type their current team code", async () => {
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

        const input_field = document.querySelectorAll("[name=teamCode]")[0];
        fireEvent.change(input_field, { target: { value: "ABCDE" } });

        const button_submit = getByText("SUBMIT").closest("button");
        expect(button_submit).toBeDisabled();
    });

    test("If the team code is not found", async () => {
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

        const input_field = document.querySelectorAll("[name=teamCode]")[0];
        fireEvent.change(input_field, { target: { value: "noutfound" } });

        const button_submit = getByText("SUBMIT");
        fireEvent.click(button_submit);

        waitFor(() => {
            getByText(/Failed to join the team noutfound: Error Not Found/i);
        });
    });

    test("When user want to leave the team, and the team has order, then the request should be rejected", async () => {
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

        const button_submit = getByText("LEAVE TEAM");
        fireEvent.click(button_submit);

        waitFor(() => {
            getByText(
                /Failed to leave the team: Error Cannot leave a team with already processed orders/i
            );
        });
    });

    test("Leave team successful", async () => {
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

        const button_submit = getByText("LEAVE TEAM");
        fireEvent.click(button_submit);

        waitFor(() => {
            getByText(/You have left the team./i);
        });
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
