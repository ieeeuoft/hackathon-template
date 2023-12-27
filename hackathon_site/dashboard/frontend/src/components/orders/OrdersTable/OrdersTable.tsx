import React from "react";
import {
    DataGrid,
    GridCallbackDetails,
    GridColDef,
    GridEventListener,
    GridRowParams,
    MuiEvent,
} from "@mui/x-data-grid";
import { ItemsInOrder, Order } from "api/types";
import { format, parseISO } from "date-fns"; // to parse date
import { statusIconMap, statusStylesMap } from "api/orders";
import styles from "./OrdersTable.module.scss";
import { useHistory } from "react-router-dom";

// magic numbers
const pageSizeOptions = [5, 10, 25]; // items displayed per page
const paginationModel = { pageSize: 25, page: 0 }; // defauly number of rows displayed per page

interface OrdersTableProps {
    ordersData: Order[];
}

interface IOrderStateIcon {
    status: string;
}

export const orderQtyValueGetter = (params: any) => {
    const items = params?.value as ItemsInOrder[] | undefined;
    return Array.isArray(items) ? items.length : 0;
};

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

const handleEvent = (
    params: GridRowParams, // GridRowParams
    event: MuiEvent<React.MouseEvent<HTMLElement>>, // MuiEvent<React.MouseEvent<HTMLElement>>
    details: GridCallbackDetails,
    navigateCallback: (path: string) => void
) => {
    const path = `/teams/${params.row.team_code}`;
    navigateCallback(path);
};

const OrdersTable = ({ ordersData }: OrdersTableProps) => {
    const history = useHistory();

    const handleDoubleRowClick: GridEventListener<"rowClick"> = (
        params: GridRowParams,
        event: MuiEvent<React.MouseEvent<HTMLElement>>,
        details: GridCallbackDetails
    ) => {
        handleEvent(params, event, details, (path) => {
            history.push(path); // Call the navigateCallback
        });
    };

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
            valueGetter: orderQtyValueGetter,
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
                    className={styles.gridContainer}
                    rows={ordersData}
                    columns={columns}
                    autoPageSize={true} // adjusts page size to fit available area
                    pageSizeOptions={pageSizeOptions}
                    columnVisibilityModel={{
                        // hide specific columns
                        updated_at: false,
                        request: false,
                    }}
                    initialState={{
                        pagination: {
                            paginationModel: paginationModel,
                        },
                    }}
                    onRowDoubleClick={handleDoubleRowClick}
                />
            </div>
        </>
    );
};

export { OrdersTable };
