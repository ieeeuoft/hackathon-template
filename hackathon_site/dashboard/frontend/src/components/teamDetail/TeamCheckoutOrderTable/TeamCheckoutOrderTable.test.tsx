import React from "react";
import { render, screen } from "testing/utils";
import { mockCheckedOutOrders, mockHardware } from "testing/mockData";
import TeamCheckoutOrderTable from "./TeamCheckoutOrderTable";

describe("team checked out order table", () => {
    test("renders team checked out order table", () => {
        const { container } = render(<TeamCheckoutOrderTable />);
        const checkboxes = container.getElementsByClassName("MuiCheckbox-root");

        for (let i = 0; i < mockCheckedOutOrders.length; i++) {
            //expect(screen.getByText({`Order #${checkoutOrder.id}`})).toBeInTheDocument();
            const currentOrder = mockCheckedOutOrders[i];
            for (let j = 0; j < currentOrder.items.length; j++) {
                const currentRow = currentOrder.items[j];
                // renders hardware names
                expect(
                    screen.getByText(`${mockHardware[currentRow.id - 1].name}`)
                ).toBeInTheDocument();

                // renders hardware quantity available
                expect(
                    screen.getByText(
                        `${mockHardware[currentRow.id - 1].quantity_available}`
                    )
                ).toBeInTheDocument();

                // renders hardware quantity remaining
                expect(
                    screen.getByText(
                        `${mockHardware[currentRow.id - 1].quantity_remaining}`
                    )
                ).toBeInTheDocument();
            }
        }
    });
});
