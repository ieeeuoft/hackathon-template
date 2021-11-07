import React from "react";
import ProductOverview, { EnhancedAddToCartForm } from "./ProductOverview";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { productInformation } from "testing/mockData";

describe("<ProductOverview />", () => {
    test("all 3 parts of the product overview is there", () => {
        const addCartMock = jest.fn();

        const { getByText } = render(
            <ProductOverview
                detail={productInformation}
                addToCart={addCartMock}
                isVisible={true}
            />
        );

        // Check if the main section, detailInfoSection, and add to cart section works
        expect(getByText("Category")).toBeInTheDocument();
        expect(getByText("Datasheet")).toBeInTheDocument();
        expect(getByText("Add to cart")).toBeInTheDocument();
    });
});

describe("<EnhancedAddToCartForm />", () => {
    test("add to cart button calls the correct function", async () => {
        const addCartMock = jest.fn();

        const { getByText } = render(
            <EnhancedAddToCartForm handleSubmit={addCartMock} quantityAvailable={3} />
        );

        const button = getByText("Add to cart");

        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(addCartMock).toHaveBeenCalledTimes(1);
    });

    test("handleSubmit called with the correct values", async () => {
        const handleSubmit = jest.fn();
        const quantityAvailable = 3;
        const quantityToBeSelected = "2";

        const { getByRole, getByText } = render(
            <EnhancedAddToCartForm
                handleSubmit={handleSubmit}
                quantityAvailable={quantityAvailable}
            />
        );

        // click the select
        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        // select the quantity
        const quantitySelected = getByText(quantityToBeSelected);
        fireEvent.click(quantitySelected);

        // wait for the click button to have been done
        const button = getByText("Add to cart");
        await waitFor(() => {
            fireEvent.click(button);
        });

        expect(handleSubmit).toHaveBeenCalledWith(quantityToBeSelected);
    });

    test("requestFailure is passed in and rendered properly", () => {
        const requestFailure = { message: "Failed" };
        const quantityAvailable = 4;

        const { getByText } = render(
            <EnhancedAddToCartForm
                requestFailure={requestFailure}
                quantityAvailable={quantityAvailable}
            />
        );

        expect(getByText(requestFailure.message)).toBeInTheDocument();
    });

    test("button and select are disabled if quantityAvailable is 0", () => {
        const { getByText, getByLabelText } = render(
            <EnhancedAddToCartForm quantityAvailable={0} />
        );

        const button = getByText("Add to cart").closest("button");
        const select = getByLabelText("Qty");

        expect(button).toBeDisabled();
        expect(select).toHaveClass("Mui-disabled");
    });

    test("dropdown values are minimum between quantityAvailable and maxConstraint", () => {
        const { queryByText, getByText, getByRole } = render(
            <EnhancedAddToCartForm quantityAvailable={3} constraintMax={2} />
        );

        fireEvent.mouseDown(getByRole("button", { name: "Qty 1" }));

        expect(queryByText("3")).not.toBeInTheDocument();
        expect(getByText("2")).toBeInTheDocument();
    });
});
