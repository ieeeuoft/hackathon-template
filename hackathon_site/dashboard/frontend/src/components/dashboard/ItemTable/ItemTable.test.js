import React from "react";
import { render } from "@testing-library/react";
import {
    PendingTable,
    UnconnectedReturnedTable,
    UnconnectedCheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import { itemsCheckedOut, itemsPending, itemsReturned } from "testing/mockData";

describe("<PendingTable />", () => {
    it("renders correctly when there's an order pending and orange chip", () => {
        const { getByText, queryByText } = render(
            <PendingTable items={itemsPending} status="pending" />
        );
        expect(getByText("Name")).toBeInTheDocument();
        expect(queryByText("In progress")).toBeInTheDocument();
    });

    it("renders correctly when there's an order pending and green chip", () => {
        const { getByText, queryByText } = render(
            <PendingTable items={itemsPending} status="ready" />
        );
        expect(getByText("Name")).toBeInTheDocument();
        expect(queryByText("Ready for pickup")).toBeInTheDocument();
    });

    it("renders correctly when there's an order pending and red chip", () => {
        const { getByText, queryByText } = render(
            <PendingTable items={itemsPending} status="error" />
        );
        expect(getByText("Name")).toBeInTheDocument();
        expect(queryByText("Please visit the tech station")).toBeInTheDocument();
    });

    it("renders correctly when it's null", () => {
        const { queryByText } = render(<PendingTable items={[]} status={null} />);
        expect(queryByText("Orders pending")).toBeNull();
    });
});

describe("<UnconnectedCheckedOutTable />", () => {
    it("renders correctly when there's no checked out items", () => {
        const { getByText } = render(<UnconnectedCheckedOutTable items={[]} />);
        expect(
            getByText("You have no items checked out yet. View our inventory.")
        ).toBeInTheDocument();
        expect(getByText("Hide all")).toBeInTheDocument();
    });

    it("renders correctly when there are checked out items", () => {
        const { getByText } = render(
            <UnconnectedCheckedOutTable items={itemsCheckedOut} />
        );
        expect(getByText("Name")).toBeInTheDocument();
        expect(getByText("Hide all")).toBeInTheDocument();
    });
});

describe("<UnconnectedReturnedTable, />", () => {
    it("renders correctly when there's no returned items", () => {
        const { getByText } = render(<UnconnectedReturnedTable items={[]} />);
        expect(
            getByText(
                "Please bring items to the tech table and a tech team member will assist you."
            )
        ).toBeInTheDocument();
        expect(getByText("Hide all")).toBeInTheDocument();
    });

    it("renders correctly when there are returned items", () => {
        const { getByText } = render(
            <UnconnectedReturnedTable items={itemsReturned} />
        );
        expect(getByText("Name")).toBeInTheDocument();
        expect(getByText("Hide all")).toBeInTheDocument();
    });
});
