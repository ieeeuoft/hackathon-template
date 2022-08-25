import React from "react";
import {
    getByTestId,
    render,
    screen,
    within,
    fireEvent,
    act,
    waitFor,
} from "testing/utils";
import {
    mockCartItems,
    mockHardware,
    mockCheckedOutOrdersInTable,
} from "testing/mockData";
import TeamCheckedOutOrderTable from "components/teamDetail/TeamCheckedOutOrderTable/TeamCheckedOutOrderTable";

describe("team pending order table", () => {
    test("renders team pending order table", () => {
        const { getByTestId } = render(<TeamCheckedOutOrderTable />);
        expect(screen.getByText("Checked Out Items")).toBeInTheDocument();

        //loop through all pending orders
        mockCheckedOutOrdersInTable.forEach((currentOrder) => {
            //loop through all the hardware in each order
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                // renders all hardware names
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].name}`)
                ).toBeInTheDocument();

                // renders all hardware quantity available
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].quantity_available}`)
                ).toBeInTheDocument();

                // renders all hardware quantity remaining
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardware[currentRow.id - 1].quantity_remaining}`)
                ).toBeInTheDocument();
            });
        });
    });

    test("All button changes the dropdown to maximum value", () => {
        const { getByTestId, getByRole } = render(<TeamCheckedOutOrderTable />);
        mockCheckedOutOrdersInTable.forEach((currentOrder) => {
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByTestId(`select`)
                ).toHaveTextContent(currentRow.quantityGranted.toString());
            });
        });
    });
    test("Check all button checks and unchecks every row", async () => {
        const { getByTestId } = render(<TeamCheckedOutOrderTable />);
        const currentOrder = mockCheckedOutOrdersInTable[0];
        const checkallBox = getByTestId(`checkall-${currentOrder.id}`).querySelector(
            'input[type="checkbox"]'
        );
        if (checkallBox) {
            await act(async () => {
                fireEvent.click(checkallBox);
                await waitFor(() => {
                    expect(checkallBox).toBeChecked();
                    currentOrder.hardwareInTableRow.forEach((currentRow) => {
                        expect(
                            within(
                                getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                            )
                                .getByTestId(`${currentRow.id}-checkbox`)
                                .querySelector('input[type="checkbox"]')
                        ).toBeChecked();
                    });
                });
            });
            await act(async () => {
                fireEvent.click(checkallBox);
                await waitFor(() => {
                    expect(checkallBox).not.toBeChecked();
                    currentOrder.hardwareInTableRow.forEach((currentRow) => {
                        expect(
                            within(
                                getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                            )
                                .getByTestId(`${currentRow.id}-checkbox`)
                                .querySelector('input[type="checkbox"]')
                        ).not.toBeChecked();
                    });
                });
            });
        }
    });
});
