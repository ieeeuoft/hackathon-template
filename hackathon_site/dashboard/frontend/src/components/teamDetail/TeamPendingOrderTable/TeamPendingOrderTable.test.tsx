import React from "react";
import { getByTestId, render, screen } from "testing/utils";
import { mockHardware, mockPendingOrdersInTable } from "testing/mockData";
import TeamPendingOrderTable from "components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";
import { within, waitFor } from "testing/utils";
import { fireEvent } from "@testing-library/react";

describe("team pending order table", () => {
    test("renders team pending order table", () => {
        const { getByTestId } = render(<TeamPendingOrderTable />);
        expect(screen.getByText("Requested Items")).toBeInTheDocument();

        //loop through all pending orders
        for (let i = 0; i < mockPendingOrdersInTable.length; i++) {
            const currentOrder = mockPendingOrdersInTable[i];
            //loop through all the hardware in each order
            for (let j = 0; j < currentOrder.hardwareInTableRow.length; j++) {
                // renders all hardware names
                const currentRow = currentOrder.hardwareInTableRow[j];
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
            }
            const submitButton = getByTestId(`complete-button-${currentOrder.id}`);
            fireEvent.click(submitButton);
        }
    });

    test("Complete Order button", async () => {
        const { getByTestId } = render(<TeamPendingOrderTable />);

        for (let i = 0; i < mockPendingOrdersInTable.length; i++) {
            const currentOrder = mockPendingOrdersInTable[i];
            const submitButton = getByTestId(`complete-button-${currentOrder.id}`);
            fireEvent.click(submitButton);
            await waitFor(() => {
                for (let j = 0; j < currentOrder.hardwareInTableRow.length; j++) {
                    const currentRow = currentOrder.hardwareInTableRow[j];
                    expect(
                        screen.getByText(
                            `"${mockHardware[currentRow.id - 1].id}-quantity": "${
                                currentRow.quantityGranted
                            }"`
                        )
                    ).toBeInTheDocument();
                    expect(
                        screen.getByText(
                            `"${mockHardware[currentRow.id - 1].id}-checkbox": false`
                        )
                    ).toBeInTheDocument();
                }
            });
        }
    });
});
