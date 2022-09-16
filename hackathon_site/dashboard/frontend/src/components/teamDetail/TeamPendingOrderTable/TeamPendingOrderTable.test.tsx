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
    mockHardwareWithBuffer,
    mockPendingOrdersInTable,
} from "testing/mockData";
import TeamPendingOrderTable from "components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";

describe("team pending order table", () => {
    test("renders team pending order table", () => {
        const { getByTestId } = render(
            <TeamPendingOrderTable
                orders={mockPendingOrdersInTable}
                optionalHardware={mockHardwareWithBuffer}
            />
        );
        expect(screen.getByText("Requested Items")).toBeInTheDocument();

        mockPendingOrdersInTable.forEach((currentOrder) => {
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardwareWithBuffer[currentRow.id].name}`)
                ).toBeInTheDocument();

                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardwareWithBuffer[currentRow.id].model_number}`)
                ).toBeInTheDocument();

                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByText(`${mockHardwareWithBuffer[currentRow.id].manufacturer}`)
                ).toBeInTheDocument();
            });
        });
    });

    test("All button changes the dropdown to maximum value", () => {
        const { getByTestId, getByRole } = render(
            <TeamPendingOrderTable
                orders={mockPendingOrdersInTable}
                optionalHardware={mockHardwareWithBuffer}
            />
        );

        mockPendingOrdersInTable.forEach((currentOrder) => {
            currentOrder.hardwareInTableRow.forEach((currentRow) => {
                const allButton = within(
                    getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                ).getByTestId(`all-button`);

                const select = within(
                    getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                ).getByRole(`button`);

                //set the select option to 0
                fireEvent.mouseDown(select);

                const listbox = within(getByRole("listbox"));

                fireEvent.click(listbox.getByText(`0`));

                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByTestId(`select`)
                ).toHaveTextContent("0");

                fireEvent.click(allButton);

                expect(
                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getByTestId(`select`)
                ).toHaveTextContent(currentRow.quantityGranted.toString());
            });
        });
    });
    test("Check all button checks and unchecks every row", async () => {
        const { getByTestId } = render(
            <TeamPendingOrderTable
                orders={mockPendingOrdersInTable}
                optionalHardware={mockHardwareWithBuffer}
            />
        );
        const currentOrder = mockPendingOrdersInTable[0];
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
