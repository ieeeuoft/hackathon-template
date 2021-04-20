import React from "react";
import EnhancedInventoryFilter, { orderByOptions } from "./InventoryFilter";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { inventoryCategories } from "testing/mockData";

describe("<EnhancedInventoryFilter />", () => {
    it("Calls handleSubmitSpy when the 'Apply' button is clicked", async () => {
        const handleSubmitSpy = jest.fn();

        const { getByText } = render(
            <EnhancedInventoryFilter
                handleSubmit={handleSubmitSpy}
                isApplyLoading={false}
                isClearLoading={false}
            />
        );
        const button = getByText("Apply");
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmitSpy).toHaveBeenCalled();
        });
    });

    it("Calls handleResetSpy when the 'Clear all' button is clicked", async () => {
        const handleResetSpy = jest.fn();

        const { getByText } = render(
            <EnhancedInventoryFilter
                handleReset={handleResetSpy}
                isApplyLoading={false}
                isClearLoading={false}
            />
        );

        const button = getByText("Clear all");
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleResetSpy).toHaveBeenCalled();
        });
    });

    it("Checks that all labels of form are in there", () => {
        const handleSubmitSpy = jest.fn();

        const { queryByText, getByText } = render(
            <EnhancedInventoryFilter
                handleSubmit={handleSubmitSpy}
                isApplyLoading={false}
                isClearLoading={false}
            />
        );
        for (let c of inventoryCategories) {
            expect(queryByText(c.name)).toBeTruthy();
        }
        for (let o of orderByOptions) {
            expect(queryByText(o.label)).toBeTruthy();
        }
        expect(getByText("Order by")).toBeInTheDocument();
        expect(getByText("Availability")).toBeInTheDocument();
        expect(getByText("Categories")).toBeInTheDocument();
    });

    it("Submits the form, the clears it, and recieves the expected values", async () => {
        const handleSubmitSpy = jest.fn();
        const handleResetSpy = jest.fn();
        let orderBy = "A-Z";
        let inStock = true;
        let inventoryCategories = ["MCU"];

        const { findByLabelText, findByText } = render(
            <EnhancedInventoryFilter
                handleSubmit={handleSubmitSpy}
                handleReset={handleResetSpy}
                isApplyLoading={false}
                isClearLoading={false}
            />
        );

        const orderByInput = await findByLabelText("A-Z");
        const inStockInput = await findByLabelText("In stock");
        const inventoryCategoriesInput = await findByLabelText("MCU");
        const buttonSubmit = await findByText("Apply");
        const buttonClear = await findByText("Clear all");

        // Select checkboxes/radio buttons and submit
        fireEvent.click(orderByInput);
        fireEvent.click(inStockInput);
        fireEvent.click(inventoryCategoriesInput);
        fireEvent.click(buttonSubmit);

        await waitFor(() => {
            expect(handleSubmitSpy).toHaveBeenCalledWith({
                orderBy,
                inStock,
                inventoryCategories,
            });
        });

        orderBy = "Default";
        inStock = false;
        inventoryCategories = [];

        // Clear form
        fireEvent.click(buttonClear);

        await waitFor(() => {
            expect(handleResetSpy).toHaveBeenCalledWith({
                orderBy,
                inStock,
                inventoryCategories,
            });
        });
    });

    it("Looks for loader on Apply button", () => {
        const { getByTestId, queryByTestId } = render(
            <EnhancedInventoryFilter isApplyLoading={true} isClearLoading={false} />
        );

        expect(getByTestId("circularProgressApply")).toBeInTheDocument();
        expect(queryByTestId("circularProgressClear")).not.toBeInTheDocument();
    });

    it("Looks for loader on Clear all button", () => {
        const { getByTestId, queryByTestId } = render(
            <EnhancedInventoryFilter isApplyLoading={false} isClearLoading={true} />
        );

        expect(queryByTestId("circularProgressApply")).not.toBeInTheDocument();
        expect(getByTestId("circularProgressClear")).toBeInTheDocument();
    });
});
