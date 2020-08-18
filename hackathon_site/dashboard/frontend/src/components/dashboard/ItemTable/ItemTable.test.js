import React from "react";
import configureStore from "redux-mock-store";
import { fireEvent, render } from "@testing-library/react";
import {
    ChipStatus,
    PendingTable,
    UnconnectedReturnedTable,
    UnconnectedCheckedOutTable,
    UnconnectedBrokenTable,
    ReturnedTable,
    CheckedOutTable,
    BrokenTable,
} from "components/dashboard/ItemTable/ItemTable";
import {
    uiReducerName,
    initialState as uiInitialState,
    toggleCheckedOutTable,
    toggleReturnedTable,
    toggleBrokenTable,
} from "slices/ui/uiSlice";
import {
    itemsCheckedOut,
    itemsPending,
    itemsReturned,
    itemsBroken,
} from "testing/mockData";
import { withStore } from "testing/helpers";

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
        const { getByText } = render(
            <UnconnectedCheckedOutTable items={[]} isVisible={true} />
        );
        expect(
            getByText("You have no items checked out yet. View our inventory.")
        ).toBeInTheDocument();
    });

    it("Shows checked out items", () => {
        const { getByText } = render(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={true} />
        );
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/hide all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });

    it("Hides the table when isVisible is false", () => {
        const { getByText, queryByText } = render(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={false} />
        );
        expect(getByText(/checked out items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
    });

    it("Calls 'push' and 'reportIncident' when 'Report broken/lost' is clicked", () => {
        const push = jest.fn();
        const reportIncident = jest.fn();
        const oneRow = [itemsCheckedOut[0]];
        const { getByText } = render(
            <UnconnectedCheckedOutTable
                items={oneRow}
                isVisible={true}
                push={push}
                reportIncident={reportIncident}
            />
        );
        const button = getByText(/report broken\/lost/i);
        fireEvent.click(button);
        expect(push).toHaveBeenCalled();
        expect(reportIncident).toHaveBeenCalled();
    });

    it("Makes sure there's the same number of buttons as rows", () => {
        const { getAllByText } = render(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} isVisible={true} />
        );
        const numItems = itemsCheckedOut.length;
        expect(getAllByText(/report broken\/lost/i).length).toBe(numItems);
    });
});

describe("<UnconnectedReturnedTable />", () => {
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

describe("<UnconnectedBrokenTable />", () => {
    it("shows when there are broken or lost items", () => {
        const { getByText } = render(
            <UnconnectedBrokenTable
                items={itemsBroken}
                status="error"
                isVisible={true}
            />
        );

        expect(getByText(/Reported broken\/lost items/i)).toBeInTheDocument();
        expect(getByText(/hide all/i)).toBeInTheDocument();
        itemsBroken.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });

    it("Hides the broken table when isVisible is false", () => {
        const { getByText, queryByText } = render(
            <UnconnectedBrokenTable
                items={itemsBroken}
                status="error"
                isVisible={false}
            />
        );

        expect(getByText(/Reported broken\/lost items/i)).toBeInTheDocument();
        expect(getByText(/show all/i)).toBeInTheDocument();
        itemsBroken.map(({ name }) => {
            expect(queryByText(name)).toBeNull();
        });
    });

    it("Calls 'onClickViewReport' when 'View Report' is clicked", () => {
        const onClickViewReport = jest.fn();
        const oneRow = [itemsBroken[0]];
        const { getByText } = render(
            <UnconnectedBrokenTable
                items={oneRow}
                status="error"
                isVisible={true}
                onClickViewReport={onClickViewReport}
            />
        );

        const button = getByText(/View Report/i);
        fireEvent.click(button);
        expect(onClickViewReport).toHaveBeenCalled();
    });

    it("Calls the same amount of chips and buttons as the rows", () => {
        const { getAllByText } = render(
            <UnconnectedBrokenTable
                items={itemsBroken}
                status="error"
                isVisible={true}
            />
        );

        const numItems = itemsBroken.length;
        expect(getAllByText(/View Report/i).length).toBe(numItems);
        expect(getAllByText("Please visit the tech station").length).toBe(numItems);
    });

    it("Disappears when there are no broken items", () => {
        const { queryByText } = render(
            <UnconnectedBrokenTable items={[]} status={null} isVisible={true} />
        );
        expect(queryByText(/Reported broken\/lost items/)).toBeNull();
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
            withStore(<CheckedOutTable items={itemsCheckedOut} />, store)
        );
        const button = getByText(/hide all/i);

        await fireEvent.click(button);
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: toggleCheckedOutTable.type })
        );
    });

    it("ReturnedTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText } = render(
            withStore(<ReturnedTable items={itemsReturned} />, store)
        );
        const button = getByText(/hide all/i);

        await fireEvent.click(button);
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: toggleReturnedTable.type })
        );
    });

    it("BrokenTable dispatches an action to toggle visibility when button clicked", async () => {
        const { getByText } = render(
            withStore(<BrokenTable items={itemsBroken} />, store)
        );
        const button = getByText(/hide all/i);

        await fireEvent.click(button);
        expect(store.getActions()).toContainEqual(
            expect.objectContaining({ type: toggleBrokenTable.type })
        );
    });
});
