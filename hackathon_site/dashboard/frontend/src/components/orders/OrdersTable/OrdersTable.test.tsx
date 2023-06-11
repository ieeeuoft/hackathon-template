import React from "react";
import { render, within } from "testing/utils";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { mockPendingOrders } from "testing/mockData";
import { OrdersTable } from "./OrdersTable";

describe("Orders Table", () => {
    test("renders order table", () => {
        const { container } = render(<OrdersTable ordersData={mockPendingOrders} />);
        // find the rendered Data Grid
        const dataGrid = container.querySelector(".MuiDataGrid-root");
        expect(dataGrid).toBeInTheDocument();
    });
});
