import React from "react";
import { render } from "@testing-library/react";
import ItemTable from "./ItemTable";
import { itemsP, itemsR, itemsC } from "pages/Dashboard/Dashboard";

it("renders correctly when there's an order pending and orange chip", () => {
    const { getByText, queryByText } = render(
        <ItemTable title="Order pending" items={itemsP} status="pending" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("In progress")).toBeInTheDocument();
});

it("renders correctly when there's an order pending and green chip", () => {
    const { getByText, queryByText } = render(
        <ItemTable title="Order pending" items={itemsP} status="ready" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("Ready for pickup")).toBeInTheDocument();
});

it("renders correctly when there's an order pending and red chip", () => {
    const { getByText, queryByText } = render(
        <ItemTable title="Order pending" items={itemsP} status="error" />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(queryByText("Please visit the tech station")).toBeInTheDocument();
});

it("renders correctly when there's no checked out items", () => {
    const { getByText } = render(
        <ItemTable title="Checked out items" items={[]} status={null} />
    );
    expect(
        getByText("You have no items checked out yet. View our inventory.")
    ).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there are checked out items", () => {
    const { getByText } = render(
        <ItemTable title="Checked out items" items={itemsC} status={null} />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there's no returned items", () => {
    const { getByText } = render(
        <ItemTable title="Returned items" items={[]} status={null} />
    );
    expect(
        getByText(
            "Please bring items to the tech table and a tech team member will assist you."
        )
    ).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});

it("renders correctly when there are returned items", () => {
    const { getByText } = render(
        <ItemTable title="Returned items" items={itemsR} status={null} />
    );
    expect(getByText("Name")).toBeInTheDocument();
    expect(getByText("Hide all")).toBeInTheDocument();
});
