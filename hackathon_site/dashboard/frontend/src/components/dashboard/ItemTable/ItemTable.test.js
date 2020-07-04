import React from "react";
import configureStore from "redux-mock-store";
import { fireEvent, render } from "@testing-library/react";
import {
    ChipStatus,
    PendingTable,
    UnconnectedReturnedTable,
    UnconnectedCheckedOutTable,
    ReturnedTable,
    CheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import {
    uiReducerName,
    initialState as uiInitialState,
    actions as uiActions,
} from "slices/ui/uiSlice";
import { itemsCheckedOut, itemsPending, itemsReturned } from "testing/mockData";
import { withStore, withRouter } from "testing/helpers";

const mockStore = configureStore();

describe("<ChipStatus />", () => {
    test("Ready status", () => {
        const { getByText } = render(<ChipStatus status="ready" />);
        expect(getByText("Ready for pickup")).toBeInTheDocument();
    });

    test("Pending status", () => {
        const { getByText } = render(<ChipStatus status="pending" />);
        expect(getByText("In progress")).toBeInTheDocument();
    });

    test("Error status", () => {
        const { getByText } = render(<ChipStatus status="error" />);
        expect(getByText("Please visit the tech station")).toBeInTheDocument();
    });
});

describe("<PendingTable />", () => {
    it("Shows pending items and status chip", () => {
        const { getByText, queryByText } = render(
            <PendingTable items={itemsPending} status="pending" />
        );
        expect(getByText(/orders pending/i)).toBeInTheDocument();
        expect(queryByText("In progress")).toBeInTheDocument();
        itemsPending.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });

    it("Doesn't show when there are no pending orders", () => {
        const { queryByText } = render(<PendingTable items={[]} status={null} />);
        expect(queryByText("Orders pending")).toBeNull();
    });
});

describe("<UnconnectedCheckedOutTable />", () => {
    it("Shows a message when there's no checked out items", () => {
        const { getByText } = render(withRouter(
            <UnconnectedCheckedOutTable items={[]} isVisible={true} />
        ));
        expect(
            getByText("You have no items checked out yet. View our inventory.")
        ).toBeInTheDocument();
    });

    it("Shows checked out items", () => {
        const { getByText } = render(withRouter(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={true} />
        ));
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/hide all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        const { getByText, queryByText } = render(withRouter(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={false} />
        ));
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
    });
    it("Goes to the incident form when you click the 'Report broken/lost' button", async () => {
        const itemsCheckedOutRow = [{ url: "https://i.imgur.com/IO6e5a6.jpg", name: "Arduino", qty: 6 },]
        const { getByText } = render(
            withRouter(
                <UnconnectedCheckedOutTable items={itemsCheckedOutRow} isVisible={true} />
        ));
        const button = getByText("Report broken/lost").closest("button");

        // const button = getByText(/hide all/i);

        await fireEvent.click(button);


        await expect(/Lost Item Incident/i).toBeInTheDocument();
    })
});

describe("<UnconnectedReturnedTable, />", () => {
    it("Shows a message when there's no returned items", () => {
        const { getByText } = render(
            <UnconnectedReturnedTable items={[]} isVisible={true} />
        );
        expect(
            getByText(
                "Please bring items to the tech table and a tech team member will assist you."
            )
        ).toBeInTheDocument();
    });

    it("Shows returned items", () => {
        const { getByText } = render(
            <UnconnectedReturnedTable items={itemsReturned} isVisible={true} />
        );
        expect(getByText(/returned items/i)).toBeInTheDocument();
        itemsReturned.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        const { getByText, queryByText } = render(
            <UnconnectedReturnedTable items={itemsReturned} isVisible={false} />
        );
        expect(getByText(/returned items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsReturned.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
    });
});

describe("Connected tables", () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            [uiReducerName]: uiInitialState,
        });
    });

    it("CheckedOutTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText } = render(
            withStore(withRouter(<CheckedOutTable items={itemsCheckedOut} />, store))
        );
        const button = getByText(/hide all/i);

        await fireEvent.click(button);
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: uiActions.toggleCheckedOutTable.type })
        );
    });

    it("ReturnedTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText } = render(
            withStore(<ReturnedTable items={itemsReturned} />, store)
        );
        const button = getByText(/hide all/i);

        await fireEvent.click(button);
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: uiActions.toggleReturnedTable.type })
        );
    });
});
