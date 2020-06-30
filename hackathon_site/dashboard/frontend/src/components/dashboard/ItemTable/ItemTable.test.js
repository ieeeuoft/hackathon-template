import React from "react";
import { render } from "@testing-library/react";
import {
    ChipStatus,
    PendingTable,
    UnconnectedReturnedTable,
    UnconnectedCheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import { itemsCheckedOut, itemsPending, itemsReturned } from "testing/mockData";

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
        expect(getByText("Name")).toBeInTheDocument();
        itemsPending.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
        expect(queryByText("In progress")).toBeInTheDocument();
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
        expect(getByText("Name")).toBeInTheDocument();
        itemsCheckedOut.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });
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
        expect(getByText("Name")).toBeInTheDocument();
        itemsReturned.map(({ name }) => {
            expect(getByText(name)).toBeInTheDocument();
        });
    });
});
