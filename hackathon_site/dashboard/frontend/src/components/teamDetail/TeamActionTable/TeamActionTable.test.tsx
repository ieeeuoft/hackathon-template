import React from "react";

import {
    render,
    screen,
    fireEvent,
    makeStoreWithEntities,
    waitFor,
} from "testing/utils";

import TeamActionTable from "components/teamDetail/TeamActionTable/TeamActionTable";
import TeamCheckedOutOrderTable from "../TeamCheckedOutOrderTable/TeamCheckedOutOrderTable";
import { mockCheckedOutOrders, mockHardware } from "testing/mockData";
import { RootStore } from "slices/store";

describe("Team action table", () => {
    test("Renders team action table", () => {
        const { container } = render(<TeamActionTable teamCode={""} />);

        expect(
            screen.getByText("Notify team to come to table to resolve issue")
        ).toBeInTheDocument();
        expect(screen.getByText("Split team")).toBeInTheDocument();
        expect(screen.getByText("Merge team")).toBeInTheDocument();
        expect(screen.getByText("Delete team")).toBeInTheDocument();
    });
});

// Mocking the Redux store and deleteTeamThunk action
jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useDispatch: () => jest.fn(),
}));

jest.mock("slices/event/teamAdminSlice", () => ({
    deleteTeamThunk: jest.fn(),
}));

describe("Team action table", () => {
    let store: RootStore;

    beforeEach(() => {
        store = makeStoreWithEntities({
            hardware: mockHardware,
            allOrders: mockCheckedOutOrders,
        });
    });

    test("Renders team action table", () => {
        const { container } = render(<TeamActionTable teamCode={""} />);

        expect(
            screen.getByText("Notify team to come to table to resolve issue")
        ).toBeInTheDocument();
        expect(screen.getByText("Split team")).toBeInTheDocument();
        expect(screen.getByText("Merge team")).toBeInTheDocument();
        expect(screen.getByText("Delete team")).toBeInTheDocument();
    });

    test("Shows the delete team confirmation modal when 'Delete' button is clicked", () => {
        const { getByText } = render(<TeamActionTable teamCode="TEAM001" />);

        // Click the 'Delete team' button
        fireEvent.click(getByText("Delete team"));

        // Check if the confirmation modal is visible
        expect(screen.getByText("Confirmation")).toBeInTheDocument();
        expect(
            screen.getByText("Are you sure you want to delete this team (TEAM001)?")
        ).toBeInTheDocument();
    });

    test("Dispatches the 'deleteTeamThunk' action when 'Yes' is clicked on the confirmation modal", async () => {
        // Import the mock implementation of deleteTeamThunk
        const { deleteTeamThunk } = require("slices/event/teamAdminSlice");
        const { getByText } = render(<TeamActionTable teamCode="TEAM001" />);

        // Click the 'Delete team' button
        fireEvent.click(getByText("Delete team"));

        // Click the 'Yes' button on the confirmation modal
        fireEvent.click(getByText("Yes"));

        // Check if the 'deleteTeamThunk' action was called with the correct team code
        expect(deleteTeamThunk).toHaveBeenCalledWith("TEAM001");

        // You can also add more assertions based on the behavior after the 'deleteTeamThunk' action is dispatched
    });

    // TODO: Testing for snackbar message
    // test("Displays the snackbar message when not able to delete team", async () => {
    //     const { getByText } = render(<TeamActionTable teamCode="TEAM001" />);
    //     const { container } = render(<TeamCheckedOutOrderTable />);
    //
    //     // Click the 'Delete team' button
    //     fireEvent.click(getByText("Delete team"));
    //
    //     // Click the 'Yes' button on the confirmation modal
    //     fireEvent.click(getByText("Yes"));
    //
    //     await waitFor(() => {
    //         expect(
    //             screen.getByText(
    //                 "Failed to delete team: Cannot delete a team with unreturned order items"
    //             )
    //         ).toBeInTheDocument();
    //     });
    // });
});
