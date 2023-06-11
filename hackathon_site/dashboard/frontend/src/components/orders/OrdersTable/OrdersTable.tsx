import React from "react";
import {
    DataGrid,
    GridColDef,
    GridRowsProp,
    GridRenderCellParams,
    GridEventListener,
} from "@mui/x-data-grid";
import { ItemsInOrder, Order } from "api/types";
import { format, parseISO } from "date-fns"; // to parse date
import styles from "./OrdersTable.module.scss";

// status icons
import SubmittedIcon from "../../../assets/images/icons/statusIcons/unfulfilled-status.svg";
import ReadyForPickupIcon from "../../../assets/images/icons/statusIcons/readyforpickup-status.svg";
import PickedUpIcon from "../../../assets/images/icons/statusIcons/checkout-status.svg";
import CancelledIcon from "../../../assets/images/icons/statusIcons/cancelled-status.svg";
import ReturnedIcon from "../../../assets/images/icons/statusIcons/checkout-status.svg";
import PendingIcon from "../../../assets/images/icons/statusIcons/pending-status.svg";
import InProgressIcon from "../../../assets/images/icons/statusIcons/inprogress-status.svg";

interface OrdersTableProps {
    ordersData: Order[];
}

interface OrderStateIcon {
    status: string;
}

const OrderStateIcon = ({ status }: OrderStateIcon) => {
    const filterState = status.replace(/\s+/g, "");
    console.log(filterState);

    return (
        <div className={styles.container}>
            <div className={`${styles.container} order-${filterState}-icon`}>
                {/* <img src={filterState + "Icon"} />
                <img src={`../../../assets/images/icons/statusIcons/${filterState}-status.svg`} /> */}
                {status === "Submitted" ? (
                    <img
                        src={SubmittedIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : status === "Ready for Pickup" ? (
                    <img
                        src={ReadyForPickupIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : status === "Picked Up" ? (
                    <img
                        src={PickedUpIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : status === "Cancelled" ? (
                    <img
                        src={CancelledIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : status === "Returned" ? (
                    <img
                        src={ReturnedIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : status === "Pending" ? (
                    <img
                        src={PendingIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                ) : (
                    <img
                        src={InProgressIcon}
                        className={styles.statusIcon}
                        alt={`${status} icon`}
                    />
                )}
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
        { field: "team_id", headerName: "Team ID" },
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
                        team_id: false,
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
