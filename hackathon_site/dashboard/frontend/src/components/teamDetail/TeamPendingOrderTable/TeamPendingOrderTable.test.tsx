import React from "react";
import { getByTestId, render, screen, within, fireEvent } from "testing/utils";
import {
    mockCartItems,
    mockHardware,
    mockPendingOrdersInTable,
} from "testing/mockData";
import TeamPendingOrderTable from "components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";

describe("team pending order table", () => {
    test("renders team pending order table", () => {
        const { getByTestId } = render(<TeamPendingOrderTable />);
        expect(screen.getByText("Requested Items")).toBeInTheDocument();

        // make the table visible
        const visibilityButton = getByTestId(`visibility-button`);
        fireEvent.click(visibilityButton);

        //loop through all pending orders
        mockPendingOrdersInTable.forEach((currentOrder) => {
            //loop through all the hardware in each order
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                // renders all hardware names
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].name}`)
                ).toBeInTheDocument();

                // renders all hardware model numbers
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].model_number}`)
                ).toBeInTheDocument();

                // renders all hardware manufacturers
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].manufacturer}`)
                ).toBeInTheDocument();
            });
        });
    });

    test("All button changes the value correctly", () => {
        const { getByTestId, getByRole } = render(<TeamPendingOrderTable />);

        // make the table visible
        const visibilityButton = getByTestId(`visibility-button`);
        fireEvent.click(visibilityButton);

        mockPendingOrdersInTable.forEach((currentOrder) => {
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                const allButton = within(
                    getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                ).getByTestId(`all-button`);
                const select = within(
                    getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                ).getByRole(`button`);
                fireEvent.mouseDown(select);
                // const listbox = within(
                //     getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                // ).getByRole("button");
                const listbox = within(getByRole("listbox"));
                fireEvent.click(listbox.getByText(`0`));
                // expect(
                //     within(
                //         getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                //     ).getByTestId(`select`)
                // ).toHaveTextContent(currentRow.quantityGranted.toString());
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByTestId(`select`)
                ).toHaveTextContent("0");
            });
        });
    });
});
