import React from "react";
import EnhancedInventoryFilter, {
    InventoryFilter,
    orderByOptions,
} from "./InventoryFilter";
import { render, fireEvent, waitFor } from "@testing-library/react";
import { Formik } from "formik";
import { inventoryCategories } from "testing/mockData";

describe("<InventoryFilter />", () => {
    const initValues = {
        orderBy: "Default",
        inStock: false,
        inventoryCategories: [],
    };

    it("Calls handleResetSpy when the 'Clear all' button is clicked", () => {
        const handleResetSpy = jest.fn();

        const { getByText } = render(
            <Formik
                initialValues={initValues}
                onSubmit={() => {}}
                onReset={handleResetSpy}
            >
                {(formikProps) => (
                    <InventoryFilter
                        {...formikProps}
                        categories={inventoryCategories}
                        isLoadingApply={false}
                        isLoadingClear={false}
                    />
                )}
            </Formik>
        );
        const button = getByText("Clear all");
        fireEvent.click(button);
        expect(handleResetSpy).toHaveBeenCalled();
    });
});

describe("<EnhancedInventoryFilter />", () => {
    it("Calls handleSubmitSpy when the 'Apply' button is clicked", async () => {
        const handleSubmitSpy = jest.fn();

        const { getByText } = render(
            <EnhancedInventoryFilter handleSubmit={handleSubmitSpy} />
        );
        const button = getByText("Apply");
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmitSpy).toHaveBeenCalled();
        });
    });

    it("Checks that all labels of form are in there", () => {
        const handleSubmitSpy = jest.fn();

        const { queryByText, getByText } = render(
            <EnhancedInventoryFilter handleSubmit={handleSubmitSpy} />
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

    it("Submits the form and recieves the expected values", async () => {
        const handleSubmitSpy = jest.fn();
        const orderBy = "A-Z";
        const inStock = true;
        const inventoryCategories = ["MCU"];

        const { findByLabelText, findByText } = render(
            <EnhancedInventoryFilter handleSubmit={handleSubmitSpy} />
        );

        const orderByInput = await findByLabelText("A-Z");
        const inStockInput = await findByLabelText("In stock");
        const inventoryCategoriesInput = await findByLabelText("MCU");
        const button = await findByText("Apply");

        fireEvent.click(orderByInput);
        fireEvent.click(inStockInput);
        fireEvent.click(inventoryCategoriesInput);
        fireEvent.click(button);

        await waitFor(() => {
            expect(handleSubmitSpy).toHaveBeenCalledWith({ orderBy, inStock, inventoryCategories });
        });
    });
});
