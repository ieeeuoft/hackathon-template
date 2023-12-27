import React from "react";
import { fireEvent, render, waitFor } from "testing/utils";
import { mockPendingOrders } from "testing/mockData";
import { OrdersTable } from "./OrdersTable";
import { format, parseISO } from "date-fns"; // to parse date
import { orderQtyValueGetter } from "./OrdersTable";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";

describe("Orders Table", () => {
    test("renders order table", () => {
        const { container } = render(<OrdersTable ordersData={mockPendingOrders} />);
        // find the rendered Data Grid
        const dataGrid = container.querySelector(".MuiDataGrid-root");
        expect(dataGrid).toBeInTheDocument();
    });

    test("Displays the correct number of rows", () => {
        const { container } = render(<OrdersTable ordersData={mockPendingOrders} />);

        const rows = container.querySelector(".MuiTablePagination-displayedRows");
        const rowsText = rows?.textContent || ""; // get the text content of the element
        // returns 1-4 of 4

        // regex to extract numbers from the text
        const numbersInText = rowsText.split(" "); // get the last number 4
        expect(numbersInText ? parseInt(numbersInText[2]) : 0).toEqual(
            mockPendingOrders.length
        );
    });

    test("Displays data accurately", () => {
        const { container } = render(
            <OrdersTable ordersData={[mockPendingOrders[0]]} />
        ); // select the first row

        const rows = container.querySelectorAll("div.MuiDataGrid-row");
        rows.forEach((row, rowIndex) => {
            // Query for the cells in each row
            const cells = row.querySelectorAll("div.MuiDataGrid-cell");

            expect(cells.length).toBe(6); // 6 fields are displayed in datagrid

            // Access and assert the cell data
            expect(cells[0].textContent).toBe(
                mockPendingOrders[rowIndex].id.toString()
            );
            expect(cells[1].textContent).toBe(
                format(parseISO(mockPendingOrders[rowIndex].created_at), "MMM d, HH:mm")
            );
            expect(cells[2].textContent).toBe(mockPendingOrders[rowIndex].team_id);
            expect(cells[3].textContent).toBe(mockPendingOrders[rowIndex].team_code);
            expect(cells[4].textContent).toBe(
                mockPendingOrders[rowIndex].items?.length.toString()
            );
            expect(cells[5].textContent).toBe(mockPendingOrders[rowIndex].status);
        });
    });

    test("ValueGetter caluclates order quantity correctly", () => {
        let params = {
            value: [
                {
                    id: 6,
                    hardware_id: 3,
                    part_returned_health: null,
                },
                {
                    id: 7,
                    hardware_id: 4,
                    part_returned_health: null,
                },
            ],
        }; // initialize grid value getter params

        const result = orderQtyValueGetter(params);
        expect(result).toBe(2);
    });

    test("Handles double row click event", async () => {
        const history = createMemoryHistory();

        const { container } = render(
            <Router history={history}>
                <OrdersTable ordersData={mockPendingOrders} />
            </Router>
        );

        const rows = container.querySelectorAll("div.MuiDataGrid-row");

        fireEvent.doubleClick(rows[0]);

        await waitFor(() => {
            // Assert that the URL has changed to the expected path
            expect(history.location.pathname).toBe("/teams/IEEE"); // Replace with your expected URL
        });
    });
});
