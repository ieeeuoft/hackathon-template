import React from "react";
import { render, screen } from "testing/utils";
import { mockHardware, mockPendingOrdersInTable } from "testing/mockData";
import TeamPendingOrderTable from "components/teamDetail/TeamPendingOrderTable/TeamPendingOrderTable";

describe("team pending order table", () => {
    test("renders team pending order table", () => {
        const { container } = render(<TeamPendingOrderTable />);
        // const checkboxes = container.getElementsByClassName("MuiCheckbox-root");
        expect(screen.getByText("Requested Items")).toBeInTheDocument();

        //loop through all pending orders
        for (let i = 0; i < mockPendingOrdersInTable.length; i++) {
            const currentOrder = mockPendingOrdersInTable[i];
            //loop through all the hardware in each order
            for (let j = 0; j < currentOrder.hardwareInTableRow.length; j++) {
                // renders all hardware names
                const currentRow = currentOrder.hardwareInTableRow[j];
                expect(
                    screen.getByText(`${mockHardware[currentRow.id - 1].name}`)
                ).toBeInTheDocument();

                // renders all hardware model numbers
                expect(
                    screen.getByText(`${mockHardware[currentRow.id - 1].model_number}`)
                ).toBeInTheDocument();

                // renders all hardware manufacturers
                expect(
                    screen.getByText(`${mockHardware[currentRow.id - 1].manufacturer}`)
                ).toBeInTheDocument();

                // renders the quantity requested
                expect(
                    screen.getByText(`${currentRow.quantityRequested}`)
                ).toBeInTheDocument();

                // renders the dropdown
                expect(
                    screen.getByText(`${currentRow.quantityGranted}`)
                ).toBeInTheDocument();

                // renders checkboxes correctly checked
                // NOTE: this test assumes that users are rendered in the table in the same order that they are stored in the json test data
                // if (mockTeamMultiple.profiles[i].id_provided) {
                //     expect(checkboxes[i].classList.contains("Mui-checked")).toBe(true);
                // } else {
                //     expect(checkboxes[i].classList.contains("Mui-checked")).toBe(false);
                // }
            }
        }
    });
});
