import React from "react";
import InventoryFilter from "./InventoryFilter";
import { render } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { inventoryCategories } from "testing/mockData";

describe("<InventoryFilter />", () => {
    const applyFilter = jest.fn();
    const removeFilter = jest.fn();

    it("Calls applyFilter when the 'Apply' button is clicked", () => {
        const { getByText } = render(
            <InventoryFilter
                categories={inventoryCategories}
                applyFilter={applyFilter}
                removeFilter={removeFilter}
            />
        );
        const button = getByText("Apply");
        fireEvent.click(button);
        expect(applyFilter).toHaveBeenCalled();
    });
    it("Calls removeFilter when the 'Clear all' button is clicked", () => {
        const { getByText } = render(
            <InventoryFilter
                categories={inventoryCategories}
                applyFilter={applyFilter}
                removeFilter={removeFilter}
            />
        );
        const button = getByText("Clear all");
        fireEvent.click(button);
        expect(removeFilter).toHaveBeenCalled();
    });
    it("Checks that all labels of form are in there", () => {
        let orderBy = [
            "All",
            "A-Z",
            "Z-A",
            "Stock remaining: high to low",
            "Stock remaining: low to high",
        ];
        const { queryByText, getByText } = render(
            <InventoryFilter
                categories={inventoryCategories}
                applyFilter={applyFilter}
                removeFilter={removeFilter}
            />
        );
        for (let c of inventoryCategories) {
            expect(queryByText(c.name)).toBeTruthy();
        }
        for (let o of orderBy) {
            expect(queryByText(o)).toBeTruthy();
        }
        expect(getByText("Order by")).toBeInTheDocument();
        expect(getByText("Availability")).toBeInTheDocument();
        expect(getByText("Categories")).toBeInTheDocument();
    });
});
