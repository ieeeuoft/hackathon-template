import React from "react";
import { render } from "@testing-library/react";
import {
    PendingTable,
    ReturnedTable,
    CheckedOutTable,
} from "components/dashboard/ItemTable/ItemTable";
import { itemsP, itemsR, itemsC } from "pages/Dashboard/Dashboard";

it("renders correctly when there's an order pending and orange chip", () => {
    const { getByText, queryByText } = render(
        <PendingTable items={itemsP} status="pending" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("In progress")).toBeInTheDocument();
});

it("renders correctly when there's an order pending and green chip", () => {
    const { getByText, queryByText } = render(
        <PendingTable items={itemsP} status="ready" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("Ready for pickup")).toBeInTheDocument();
});

it("renders correctly when there's an order pending and red chip", () => {
    const { getByText, queryByText } = render(
        <PendingTable items={itemsP} status="error" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("Please visit the tech station")).toBeInTheDocument();
});

it("renders correctly when there's no checked out items", () => {
    const { getByText } = render(<CheckedOutTable items={[]} />);
    expect(
        getByText("You have no items checked out yet. View our inventory.")
    ).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there are checked out items", () => {
    const { getByText } = render(<CheckedOutTable items={itemsC} />);
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there's no returned items", () => {
    const { getByText } = render(<ReturnedTable items={[]} />);
    expect(
        getByText(
            "Please bring items to the tech table and a tech team member will assist you."
        )
    ).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there are returned items", () => {
    const { getByText } = render(<ReturnedTable items={itemsR} />);
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});
