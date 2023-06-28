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

export const CheckedOutTables = () =>
    // TODO: for incident reports
    // { push,
    // reportIncident, }
    {
        const dispatch = useDispatch();
        const unsorted_orders = useSelector(checkedOutOrdersSelector);
        const orders = unsorted_orders.slice();

        orders.sort((order1, order2) => {
            return (
                new Date(order2.updatedTime).valueOf() -
                new Date(order1.updatedTime).valueOf()
            );
        });
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
    const orders = unsorted_orders.slice().sort((order1, order2) => {
        const orderDate1 = order1.hardwareInOrder[0].time;
        const orderDate2 = order2.hardwareInOrder[0].time;

        const matchResult = orderDate1.match(
            /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
        );
        const matchResult2 = orderDate2.match(
            /(\d{1,2}):(\d{2}):(\d{2}) (AM|PM) \((\w{3}) (\w{3}) (\d{2}) (\d{4})\)/
        );

        if (matchResult && matchResult2) {
            // converting invalid date to a valid Date for first order to be compared
            const [, hours, minutes, seconds, meridiem, , month, day, year] =
                matchResult;
            const monthIndex = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ].indexOf(month);

            const date = new Date(
                Number(year),
                monthIndex,
                Number(day),
                Number(hours) + (meridiem === "PM" ? 12 : 0),
                Number(minutes),
                Number(seconds)
            );
            const formattedDate = date.toISOString();

            // converting invalid date to a valid Date for first order to be compared
            const [, hours2, minutes2, seconds2, meridiem2, , month2, day2, year2] =
                matchResult2;
            const monthIndex2 = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ].indexOf(month2);

            const date2 = new Date(
                Number(year2),
                monthIndex2,
                Number(day2),
                Number(hours2) + (meridiem2 === "PM" ? 12 : 0),
                Number(minutes2),
                Number(seconds2)
            );
            const formattedDate2 = date2.toISOString();

            return (
                new Date(formattedDate2).valueOf() - new Date(formattedDate).valueOf()
            );
        } else {
            console.log("Invalid time format");
        }
        return 0;
    });

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
    const orders = useSelector(pendingOrderSelectors.selectAll);
    let ready_orders = [];
    let submitted_orders = [];
    for (let order of orders) {
        if (order.status === "Ready for Pickup") {
            ready_orders.push(order);
        } else {
            submitted_orders.push(order);
        }
    }
    ready_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    submitted_orders.sort((order1, order2) => {
        return (
            new Date(order1.updatedTime).valueOf() -
            new Date(order2.updatedTime).valueOf()
        );
    });

    orders.splice(0, orders.length, ...ready_orders, ...submitted_orders);

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
