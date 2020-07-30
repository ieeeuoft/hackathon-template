import React from "react";
import CartCard from "./CartCard";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { fireEvent } from "@testing-library/react";
import { screen } from "@testing-library/dom";

describe("CartCard", () => {
    const image = "https://i.imgur.com/IO6e5a6.jpg";
    const title = "Some very long title and stuff";
    const currentStock = 9;
    const closeChange = jest.fn();
    const checkedOutQuantity = 3;
    const isError = false;
    const outOfStock = "Currently unavailable";
    const errorMessage = "some error message";

    test("CartCard Test", () => {
        const { getByText, getByAltText, getByDisplayValue } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                closeChange={closeChange}
                checkedOutQuantity={checkedOutQuantity}
                isError={isError}
            />
        );

        // const selectedValue = getByRole("selecter");
        const selectedValue = screen.getByDisplayValue(checkedOutQuantity.toString());
        // expect(selectedValue.value).toBe(checkedOutQuantity);
        expect(selectedValue).toBeInTheDocument();
        expect(getByAltText(title)).toBeInTheDocument();
        expect(getByText(title)).toBeInTheDocument();
    });

    test("Close button", () => {
        const { getByRole } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                closeChange={closeChange}
                checkedOutQuantity={checkedOutQuantity}
                isError={isError}
            />
        );

        const exitButton = getByRole("close");
        fireEvent.click(exitButton);
        expect(closeChange.mock.calls.length).toBe(1);
    });

    test("Out of Stock", () => {
        const currentStock = 0;

        const { getByText } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                closeChange={closeChange}
                checkedOutQuantity={checkedOutQuantity}
                isError={isError}
            />
        );

        expect(getByText(outOfStock)).toBeInTheDocument();
    });

    test("Error message", () => {
        const isError = true;

        const { getByText } = render(
            <CartCard
                image={image}
                title={title}
                currentStock={currentStock}
                closeChange={closeChange}
                checkedOutQuantity={checkedOutQuantity}
                isError={isError}
            />
        );

        expect(getByText(errorMessage)).toBeInTheDocument();
    });
});
