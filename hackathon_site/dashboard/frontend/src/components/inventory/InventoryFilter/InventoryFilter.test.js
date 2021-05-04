import React from "react";
import EnhancedInventoryFilter, { orderByOptions } from "./InventoryFilter";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { inventoryCategories } from "testing/mockData";

describe("<EnhancedInventoryFilter />", () => {
    it("Calls handleSubmit when the 'Apply' button is clicked", async () => {
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

    it("Calls handleReset when the 'Clear all' button is clicked", async () => {
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

    it("Submits the form, then clears it, and receives the expected values", async () => {
        const handleSubmitSpy = jest.fn();
        const handleResetSpy = jest.fn();
        let orderBy = "name";
        let inStock = true;
        let inventoryCategories = [1];

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

        orderBy = "";
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

    it("Displays a loading wheel on Apply button when loading", () => {
        const { getByTestId, queryByTestId, getByText } = render(
            <EnhancedInventoryFilter isApplyLoading={true} isClearLoading={false} />
        );

        const applyBtn = getByText("Apply");
        const clearBtn = getByText("Clear all");

        expect(getByTestId("circularProgressApply")).toBeInTheDocument();
        expect(queryByTestId("circularProgressClear")).not.toBeInTheDocument();
        expect(applyBtn.closest("button")).toBeDisabled();
        expect(clearBtn.closest("button")).toBeDisabled();
    });

    it("Displays a loading wheel on Clear all button when loading", () => {
        const { getByTestId, queryByTestId, getByText } = render(
            <EnhancedInventoryFilter isApplyLoading={false} isClearLoading={true} />
        );

        const applyBtn = getByText("Apply");
        const clearBtn = getByText("Clear all");

        expect(queryByTestId("circularProgressApply")).not.toBeInTheDocument();
        expect(getByTestId("circularProgressClear")).toBeInTheDocument();
        expect(applyBtn.closest("button")).toBeDisabled();
        expect(clearBtn.closest("button")).toBeDisabled();
    });
});
