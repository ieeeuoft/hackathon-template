import React from "react";
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
} from "components/general/OrderTables/OrderTables";

export const CheckedOutTables = () =>
    // TODO: for incident reports
    // { push,
    // reportIncident, }
    {
        const dispatch = useDispatch();
        const orders = useSelector(checkedOutOrdersSelector);
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
                            <div key={checkedOutOrder.id}>
                                <GeneralOrderTableTitle orderId={checkedOutOrder.id} />
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
    const orders = useSelector(returnedOrdersSelector);
    const fetchOrdersError = useSelector(orderErrorSelector);
    const hardware = useSelector(hardwareSelectors.selectEntities);
    const isVisible = useSelector(isReturnedTableVisibleSelector);
    const toggleVisibility = () => dispatch(toggleReturnedTable());

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <GeneralOrderTitle
                {...{
                    title: "Returned items",
                    isVisible,
                    toggleVisibility,
                }}
            />

            {isVisible &&
                (!orders.length || fetchOrdersError ? (
                    <Paper elevation={2} className={styles.empty} square={true}>
                        {fetchOrdersError
                            ? `Unable to view returned items.`
                            : "Please bring items to the tech table and a tech team member will assist you."}
                    </Paper>
                ) : (
                    orders.map((order) => (
                        <div key={order.id}>
                            <GeneralOrderTableTitle orderId={order.id} />
                            <TableContainer
                                component={Paper}
                                elevation={2}
                                square={true}
                            >
                                <Table
                                    className={styles.table}
                                    size="small"
                                    aria-label="returned table"
                                >
                                    <TableHead>
                                        <TableRow>
                                            <TableCell className={styles.widthFixed} />
                                            <TableCell
                                                className={styles.width6}
                                                align="left"
                                            >
                                                Name
                                            </TableCell>
                                            <TableCell
                                                className={styles.widthFixed}
                                                align="right"
                                            >
                                                Qty
                                            </TableCell>
                                            <TableCell
                                                className={styles.width4}
                                                align="right"
                                            >
                                                Time
                                            </TableCell>
                                            <TableCell
                                                align="left"
                                                className={styles.width2}
                                            >
                                                Condition
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.hardwareInOrder.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell align="left">
                                                    <img
                                                        className={styles.itemImg}
                                                        src={
                                                            hardware[row.hardware_id]
                                                                ?.picture ??
                                                            hardware[row.hardware_id]
                                                                ?.image_url ??
                                                            hardwareImagePlaceholder
                                                        }
                                                        alt={
                                                            hardware[row.hardware_id]
                                                                ?.name
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell align="left">
                                                    {hardware[row.hardware_id]?.name}
                                                </TableCell>
                                                <TableCell align="right">
                                                    {row.quantity}
                                                </TableCell>
                                                <TableCell
                                                    align="right"
                                                    className={styles.noWrap}
                                                >
                                                    {row.time}
                                                </TableCell>
                                                <TableCell
                                                    align="left"
                                                    className={styles.noWrap}
                                                >
                                                    {row.part_returned_health}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </div>
                    ))
                ))}
        </Container>
    );
};

export const PendingTables = () => {
    const dispatch = useDispatch();
    const orders = useSelector(pendingOrderSelectors.selectAll);
    const hardware = useSelector(hardwareSelectors.selectEntities);
    const isVisible = useSelector(isPendingTableVisibleSelector);
    const isCancelOrderLoading = useSelector(cancelOrderLoadingSelector);
    const toggleVisibility = () => dispatch(togglePendingTable());
    const cancelOrder = (orderId: number) => dispatch(cancelOrderThunk(orderId));

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
                        key={pendingOrder.id}
                        data-testid={`pending-order-table-${pendingOrder.id}`}
                    >
                        <GeneralOrderTableTitle
                            orderId={pendingOrder.id}
                            orderStatus={pendingOrder.status}
                        />
                        <TableContainer component={Paper} elevation={2} square={true}>
                            <Table
                                className={styles.table}
                                size="small"
                                aria-label="pending table"
                            >
                                <TableHead>
                                    <TableRow>
                                        <TableCell className={styles.widthFixed} />
                                        <TableCell
                                            className={styles.width6}
                                            align="left"
                                        >
                                            Name
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                            align="right"
                                        >
                                            Requested Qty
                                        </TableCell>
                                        <TableCell
                                            className={`${styles.width1} ${styles.noWrap}`}
                                            align="right"
                                        >
                                            Granted Qty
                                        </TableCell>
                                        <TableCell className={styles.widthBuffer} />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {pendingOrder.hardwareInTableRow.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell align="left">
                                                <img
                                                    className={styles.itemImg}
                                                    src={
                                                        hardware[row.id]?.picture ??
                                                        hardware[row.id]?.image_url ??
                                                        hardwareImagePlaceholder
                                                    }
                                                    alt={hardware[row.id]?.name}
                                                />
                                            </TableCell>
                                            <TableCell align="left">
                                                {hardware[row.id]?.name}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.quantityRequested}
                                            </TableCell>
                                            <TableCell align="right">
                                                {row.quantityGranted}
                                            </TableCell>
                                            <TableCell className={styles.widthBuffer} />
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginTop: "10px",
                            }}
                        >
                            <Button
                                onClick={() => cancelOrder(pendingOrder.id)}
                                disabled={isCancelOrderLoading}
                                color="secondary"
                                data-testid="cancel-order-button"
                            >
                                Cancel order
                            </Button>
                        </div>
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
