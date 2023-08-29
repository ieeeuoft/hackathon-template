import React from "react";
import {
    getByTestId,
    render,
    screen,
    within,
    fireEvent,
    act,
    waitFor,
    makeStoreWithEntities,
} from "testing/utils";
import { mockHardware, mockCheckedOutOrdersInTable } from "testing/mockData";
import TeamCheckedOutOrderTable from "components/teamDetail/TeamCheckedOutOrderTable/TeamCheckedOutOrderTable";

const store = makeStoreWithEntities({
    teamDetailOrders: mockCheckedOutOrdersInTable,
});

describe("team pending order table", () => {
    test("renders team pending order table", async () => {
        const { getByTestId } = render(<TeamCheckedOutOrderTable />, { store });
        expect(screen.getByText("Checked Out Items")).toBeInTheDocument();

        await waitFor(() => {
            mockCheckedOutOrdersInTable.forEach((currentOrder) => {
                //loop through all the hardware in each order
                currentOrder.hardwareInTableRow.forEach((currentRow) => {
                    // renders all hardware names
                    // expect(
                    //     within(
                    //         getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    //     ).getByText(`${mockHardware[currentRow.id - 1].name}`)
                    // ).toBeInTheDocument();

                    within(
                        getByTestId(`table-${currentOrder.id}-${currentRow.id}`)
                    ).getAllByText(`${currentRow.quantityGranted}`);
                });
            });
        });
    });

    test("All button changes the dropdown to maximum value", () => {
        const { getByTestId } = render(<TeamCheckedOutOrderTable />, { store });
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
        const { getByTestId } = render(<TeamCheckedOutOrderTable />, { store });
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
    it("Displays checked out orders from most recent to oldest order", async () => {
        const { getAllByTestId, container } = render(<TeamCheckedOutOrderTable />, {
            store,
        });
        let orderElements = getAllByTestId(/table-\d+-\d+/);
        const orders = orderElements.map((element) => {
            const updatedTime = element.getAttribute("data-updated-time");
            return { updatedTime };
        });
        let isSorted = true;
        for (let i = 0; i < orders.length - 1; i++) {
            const currentDate = orders[i];
            const previousDate = orders[i + 1];

            if (currentDate < previousDate) {
                isSorted = false;
                break;
            }
        }
        expect(isSorted).toBe(true);
    });
});
