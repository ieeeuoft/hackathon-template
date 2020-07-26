import React from "react";
import { ProductOverview, EnhancedCartForm } from "./ProductOverview";
import { render, fireEvent, waitFor } from "@testing-library/react";

describe("<EnhancedCartForm />", () => {
    test("add to cart button calls the correct function", async () => {
        const addCartMock = jest.fn();

        const { getByText } = render(
            <EnhancedCartForm handleSubmit={addCartMock} availableQuantity={3} />
        );

        const button = getByText("ADD TO CART");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(addCartMock).toHaveBeenCalledTimes(1);
    });

    test("handleSubmit called with the correct values", async () => {
        const handleSubmit = jest.fn();
        const quantityAvailable = "3";
        const quantityToBeSelected = "2";

        const { getByRole, getByText } = render(
            <EnhancedCartForm
                handleSubmit={handleSubmit}
                availableQuantity={quantityAvailable}
            />
        );

        // click the select
        fireEvent.mouseDown(getByRole("button", { name: "1" }));

        // select the quantity
        const quantitySelected = getByText(quantityToBeSelected);
        fireEvent.click(quantitySelected);

        // wait for the click button to have been done
        const button = getByText("ADD TO CART");
        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(handleSubmit).toHaveBeenCalledWith(quantityToBeSelected);
    });
});
