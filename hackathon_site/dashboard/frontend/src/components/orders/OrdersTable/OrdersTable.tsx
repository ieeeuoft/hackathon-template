import React from "react";
import { DataGrid, GridColDef, GridEventListener } from "@mui/x-data-grid";
import { ItemsInOrder, Order } from "api/types";
import { format, parseISO } from "date-fns"; // to parse date
import { statusIconMap, statusStylesMap } from "api/orders";
import styles from "./OrdersTable.module.scss";

// status icons

interface OrdersTableProps {
    ordersData: Order[];
}

interface IOrderStateIcon {
    status: string;
}

const OrderStateIcon = ({ status }: IOrderStateIcon) => {
    const filterState: string = status.replace(/\s+/g, "");
    const styleIcon = statusStylesMap[filterState];
    const iconSrc = statusIconMap[filterState];

    return (
        <div className={styles.container}>
            <div className={`${styles.container} ${styleIcon}`}>
                <img
                    src={iconSrc}
                    className={styles.statusIcon}
                    alt={`${status} icon`}
                />
                {status}
            </div>
        </div>
    );
};

const handleEvent: GridEventListener<"rowClick"> = (
    params, // GridRowParams
    event, // MuiEvent<React.MouseEvent<HTMLElement>>
    details // GridCallbackDetails
) => {
    console.log("clicked", params.row);
};

const OrdersTable = ({ ordersData }: OrdersTableProps) => {
    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 25, flex: 1 },
        {
            field: "created_at",
            headerName: "Time Ordered",
            flex: 1,
            valueFormatter: (params) => {
                const time = params.value as string;
                const date = parseISO(time);
                const formattedTime = format(date, "MMM d, HH:mm");
                return formattedTime;
            },
        },
        { field: "team_id", headerName: "Team ID", flex: 1, minWidth: 100 },
        { field: "team_code", headerName: "Team", flex: 1 },
        {
            field: "items",
            headerName: "Order Qty",
            flex: 1,
            valueGetter: (params) => {
                let orderQty: number = 0;
                const items = params?.value as ItemsInOrder[];
                try {
                    orderQty = items.length;
                } catch (err) {
                    return 0;
                }
                return orderQty;
            },
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 250,
            renderCell: (params) => <OrderStateIcon status={params.value} />,
        },
        { field: "updated_at", headerName: "Updated At" },
        { field: "request", headerName: "Request" },
    ];

    return (
        <>
            <div style={{ width: "100%", height: "700px" }}>
                <DataGrid
                    rows={ordersData}
                    columns={columns}
                    // pageSize={10} // not available in free version
                    autoPageSize={true} // adjusts page size to fit available area
                    pageSizeOptions={[5, 10, 15]}
                    columnVisibilityModel={{
                        // hide specific columns
                        updated_at: false,
                        request: false,
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25, page: 0 },
                        },
                    }}
                    onRowDoubleClick={handleEvent}
                />
            </div>
        </>
    );
};

export { OrdersTable };
