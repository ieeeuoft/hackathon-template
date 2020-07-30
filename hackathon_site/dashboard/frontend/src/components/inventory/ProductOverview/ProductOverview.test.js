import React from "react";
import { ProductOverview, EnhancedAddToCartForm } from "./ProductOverview";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { productInformation } from "testing/mockData";

describe("<ProductOverview />", () => {
    test("all 3 parts of the product overview is there", () => {
        const addCartMock = jest.fn();

        const { getByText } = render(
            <ProductOverview detail={productInformation} addToCart={addCartMock} />
        );

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("ADD TO CART")).toBeInTheDocument();
    });
});

describe("<EnhancedAddToCartForm />", () => {
    test("add to cart button calls the correct function", async () => {
        const addCartMock = jest.fn();

        const { getByText } = render(
            <EnhancedAddToCartForm handleSubmit={addCartMock} availableQuantity={3} />
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
            <EnhancedAddToCartForm
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

    test("requestFailure is passed in and rendered properly", () => {
        const requestFailure = { message: "Failed" };
        const availableQuantity = "4";

        const { getByText } = render(
            <EnhancedAddToCartForm
                requestFailure={requestFailure}
                availableQuantity={availableQuantity}
            />
        );

        expect(getByText(requestFailure.message)).toBeInTheDocument();
    });
});
