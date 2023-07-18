import React, { useState } from "react";
import styles from "components/general/OrderTables/OrderTables.module.scss";
import {
    Button,
    Paper,
    Container,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import Info from "@material-ui/icons/Info";
import { useDispatch, useSelector } from "react-redux";
import {
    isCheckedOutTableVisibleSelector,
    isPendingTableVisibleSelector,
    isReturnedTableVisibleSelector,
    openProductOverview,
    toggleCheckedOutTable,
    togglePendingTable,
    toggleReturnedTable,
} from "slices/ui/uiSlice";
import {
    getUpdatedHardwareDetails,
    hardwareSelectors,
} from "slices/hardware/hardwareSlice";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import {
    checkedOutOrdersSelector,
    orderErrorSelector,
    pendingOrderSelectors,
    returnedOrdersSelector,
    cancelOrderThunk,
    cancelOrderLoadingSelector,
} from "slices/order/orderSlice";
import {
    GeneralOrderTitle,
    GeneralOrderTableTitle,
    GeneralPendingTable,
    GeneralReturnTable,
} from "components/general/OrderTables/OrderTables";
import PopupModal from "components/general/PopupModal/PopupModal";
import { sortPendingOrders, sortReturnedOrders } from "api/helpers";
import { sortCheckedOutOrders } from "api/helpers";

export const CheckedOutTables = () =>
    // TODO: for incident reports
    // { push,
    // reportIncident, }
    {
        const dispatch = useDispatch();
        const unsorted_orders = useSelector(checkedOutOrdersSelector);
        const orders = unsorted_orders.slice().sort(sortCheckedOutOrders);
        const hardware = useSelector(hardwareSelectors.selectEntities);
        const isVisible = useSelector(isCheckedOutTableVisibleSelector);
        const fetchOrdersError = useSelector(orderErrorSelector);
        const toggleVisibility = () => dispatch(toggleCheckedOutTable());
        const openProductOverviewPanel = (hardwareId: number) => {
            dispatch(getUpdatedHardwareDetails(hardwareId));
            dispatch(openProductOverview());
        };

        return (
            <Container
                className={styles.tableContainer}
                maxWidth={false}
                disableGutters={true}
            >
                <GeneralOrderTitle
                    {...{
                        title: "Checked out items",
                        isVisible,
                        toggleVisibility,
                    }}
                />

                {isVisible &&
                    (!orders.length || fetchOrdersError ? (
                        <Paper elevation={2} className={styles.empty} square={true}>
                            {fetchOrdersError
                                ? `Unable to view checked out items.`
                                : "You have no items checked out yet. View our inventory."}
                        </Paper>
                    ) : (
                        orders.map((checkedOutOrder) => (
                            <div
                                id={`order${checkedOutOrder.id}`}
                                key={checkedOutOrder.id}
                                data-testid={`checked-out-order-table-${checkedOutOrder.id}`}
                                data-updated-time={`checked-out-order-time-${checkedOutOrder.updatedTime}`}
                            >
                                <GeneralOrderTableTitle
                                    orderId={checkedOutOrder.id}
                                    createdTime={checkedOutOrder.createdTime}
                                    updatedTime={checkedOutOrder.updatedTime}
                                    additionalChipFormatting={true}
                                />
                                <TableContainer
                                    component={Paper}
                                    elevation={2}
                                    square={true}
                                >
                                    <Table
                                        className={styles.table}
                                        size="small"
                                        aria-label="checkout table"
                                    >
                                        <TableHead>
                                            <TableRow>
                                                <TableCell
                                                    className={styles.widthFixed}
                                                />
                                                <TableCell
                                                    className={styles.width6}
                                                    align="left"
                                                >
                                                    Name
                                                </TableCell>
                                                <TableCell
                                                    className={styles.widthFixed}
                                                    align="center"
                                                >
                                                    Info
                                                </TableCell>
                                                <TableCell
                                                    className={styles.widthFixed}
                                                    align="right"
                                                >
                                                    Qty
                                                </TableCell>
                                                <TableCell
                                                    align="right"
                                                    className={styles.width6}
                                                />
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {checkedOutOrder.hardwareInTableRow.map(
                                                (row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        data-testid={`checked-out-hardware-${row.id}-${checkedOutOrder.id}`}
                                                    >
                                                        <TableCell align="left">
                                                            <img
                                                                className={
                                                                    styles.itemImg
                                                                }
                                                                src={
                                                                    hardware[row.id]
                                                                        ?.picture ??
                                                                    hardware[row.id]
                                                                        ?.image_url ??
                                                                    hardwareImagePlaceholder
                                                                }
                                                                alt={
                                                                    hardware[row.id]
                                                                        ?.name
                                                                }
                                                            />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            {hardware[row.id]?.name}
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <IconButton
                                                                color="inherit"
                                                                aria-label="Info"
                                                                data-testid="info-button"
                                                                onClick={() =>
                                                                    openProductOverviewPanel(
                                                                        row.id
                                                                    )
                                                                }
                                                            >
                                                                <Info />
                                                            </IconButton>
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {row.quantityGranted}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {/* TODO: Add back in when incident reports are being used*/}
                                                            {/*<Button*/}
                                                            {/*    color="secondary"*/}
                                                            {/*    size="small"*/}
                                                            {/*    onClick={() => {*/}
                                                            {/*        reportIncident(row.id);*/}
                                                            {/*        push("/incident-form");*/}
                                                            {/*    }}*/}
                                                            {/*>*/}
                                                            {/*    Report broken/lost*/}
                                                            {/*</Button>*/}
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        ))
                    ))}
            </Container>
        );
    };

export const ReturnedTable = () => {
    const dispatch = useDispatch();
    const unsorted_orders = useSelector(returnedOrdersSelector);
    const orders = unsorted_orders.slice().sort(sortReturnedOrders);
    const fetchOrdersError = useSelector(orderErrorSelector);
    const isVisible = useSelector(isReturnedTableVisibleSelector);
    const toggleVisibility = () => dispatch(toggleReturnedTable());

    return (
        <GeneralReturnTable
            {...{
                orders,
                fetchOrdersError,
                isVisible,
                toggleVisibility,
            }}
        />
    );
};

export const PendingTables = () => {
    const dispatch = useDispatch();
    const unsorted_orders = useSelector(pendingOrderSelectors.selectAll);
    const orders = sortPendingOrders(unsorted_orders);
    orders.reverse();
    const isVisible = useSelector(isPendingTableVisibleSelector);
    const isCancelOrderLoading = useSelector(cancelOrderLoadingSelector);
    const toggleVisibility = () => dispatch(togglePendingTable());
    const cancelOrder = (orderId: number) => dispatch(cancelOrderThunk(orderId));
    const [showCancelOrderModal, setShowCancelOrderModal] = useState(false);
    const [orderId, setorderId] = useState(null);

    const closeModal = () => {
        setShowCancelOrderModal(false);
    };

    const submitCancelOrderModal = (cancelOrderId: number | null) => {
        if (cancelOrderId != null) {
            cancelOrder(cancelOrderId); // Perform Cancellation
            setShowCancelOrderModal(false);
        }
    };

    const setCancelOrderModal = (pendingOrder: any) => {
        setShowCancelOrderModal(true);
        setorderId(pendingOrder.id);
    };

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <GeneralOrderTitle
                    {...{
                        title: "Pending Orders",
                        isVisible,
                        toggleVisibility,
                    }}
                />
            )}

            {isVisible &&
                orders.length > 0 &&
                orders.map((pendingOrder) => (
                    <div
                        id={`order${pendingOrder.id}`}
                        key={pendingOrder.id}
                        data-testid={`pending-order-table-${pendingOrder.id}`}
                        data-updated-time={`pending-order-time-${pendingOrder.updatedTime}`}
                    >
                        <GeneralPendingTable {...{ pendingOrder }} />
                        {pendingOrder.status !== "Ready for Pickup" && (
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    marginTop: "10px",
                                }}
                            >
                                <Button
                                    onClick={() => setCancelOrderModal(pendingOrder)}
                                    disabled={isCancelOrderLoading}
                                    color="secondary"
                                    data-testid="cancel-order-button"
                                >
                                    Cancel order
                                </Button>
                                <PopupModal
                                    description={
                                        "Are you sure you want to cancel this order? The team will be notified."
                                    }
                                    isVisible={showCancelOrderModal}
                                    submitHandler={() =>
                                        submitCancelOrderModal(orderId)
                                    }
                                    cancelText={"Go Back"}
                                    submitText={"Delete Order"}
                                    cancelHandler={closeModal}
                                    title={"Careful!"}
                                />
                            </div>
                        )}
                    </div>
                ))}
        </Container>
    );
};

// TODO: implement when incidents are finished
// export const BrokenTable = ({ items, openReportAlert }) => {
//     return !items.length ? null : (
//         <Container
//             className={styles.tableContainer}
//             maxWidth={false}
//             disableGutters={true}
//         >
//             <div className={styles.titleChip}>
//                 <Typography
//                     variant="h2"
//                     className={styles.titleChipText}
//                     color="secondary"
//                 >
//                     Reported broken/lost items
//                 </Typography>
//                 <ChipStatus status="error" />
//             </div>
//
//             <TableContainer component={Paper} elevation={2} square={true}>
//                 <Table className={styles.table} size="small" aria-label="broken table">
//                     <TableHead>
//                         <TableRow>
//                             <TableCell className={styles.widthFixed} />
//                             <TableCell className={styles.width6} align="left">
//                                 Name
//                             </TableCell>
//                             <TableCell className={styles.widthFixed} align="left">
//                                 Qty
//                             </TableCell>
//                             <TableCell className={styles.width4} align="right">
//                                 Time
//                             </TableCell>
//                             <TableCell className={styles.width2} align="left">
//                                 Condition
//                             </TableCell>
//                             <TableCell className={styles.widthFixed} />
//                         </TableRow>
//                     </TableHead>
//                     <TableBody>
//                         {items.map((row) => (
//                             <TableRow key={row.id}>
//                                 <TableCell align="left">
//                                     <img
//                                         className={styles.itemImg}
//                                         src={row.url}
//                                         alt={row.name}
//                                     />
//                                 </TableCell>
//                                 <TableCell align="left">{row.name}</TableCell>
//                                 <TableCell align="right">{row.qty}</TableCell>
//                                 <TableCell align="right" className={styles.noWrap}>
//                                     {row.time}
//                                 </TableCell>
//                                 <TableCell align="left" className={styles.noWrap}>
//                                     {row.condition}
//                                 </TableCell>
//                                 <TableCell align="right">
//                                     <Button
//                                         color="primary"
//                                         size="small"
//                                         onClick={() => {
//                                             openReportAlert(row.id);
//                                         }}
//                                     >
//                                         View Report
//                                     </Button>
//                                 </TableCell>
//                             </TableRow>
//                         ))}
//                     </TableBody>
//                 </Table>
//             </TableContainer>
//         </Container>
//     );
// };
