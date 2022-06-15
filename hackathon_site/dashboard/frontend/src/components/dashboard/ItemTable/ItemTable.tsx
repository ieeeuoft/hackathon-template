import React from "react";
import styles from "./ItemTable.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Container from "@material-ui/core/Container";
import IconButton from "@material-ui/core/IconButton";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Info from "@material-ui/icons/Info";
import Error from "@material-ui/icons/Error";
import WatchLater from "@material-ui/icons/WatchLater";
import CheckCircle from "@material-ui/icons/CheckCircle";
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
import { OrderStatus } from "api/types";
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
    updateOrder,
} from "slices/order/orderSlice";

export const ChipStatus = ({ status }: { status: OrderStatus | "Error" }) => {
    switch (status) {
        case "Ready for Pickup":
            return (
                <Chip
                    icon={<CheckCircle />}
                    label="Ready for pickup"
                    className={`${styles.chipGreen} ${styles.chip}`}
                />
            );
        case "Submitted":
            return (
                <Chip
                    icon={<WatchLater />}
                    label="In progress"
                    className={`${styles.chipOrange} ${styles.chip}`}
                />
            );
        case "Error":
            return (
                <Chip
                    icon={<Error />}
                    label="Visit the tech station"
                    className={`${styles.chipRed} ${styles.chip}`}
                />
            );
        default:
            return null;
    }
};

export const CheckedOutTable = () =>
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
                <div className={styles.title}>
                    <Typography variant="h2" className={styles.titleText}>
                        Checked out items
                    </Typography>
                    <Button onClick={toggleVisibility} color="primary">
                        {isVisible ? "Hide all" : "Show all"}
                    </Button>
                </div>

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
                                <Container
                                    className={styles.titleChip}
                                    maxWidth={false}
                                    disableGutters={true}
                                >
                                    <Typography
                                        variant="h2"
                                        className={styles.titleChipText}
                                    >
                                        Order #{checkedOutOrder.id}
                                    </Typography>
                                </Container>
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
            <div className={styles.title}>
                <Typography variant="h2" className={styles.titleText}>
                    Returned items
                </Typography>
                <Button onClick={toggleVisibility} color="primary">
                    {isVisible ? "Hide all" : "Show all"}
                </Button>
            </div>

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
                            <Container
                                className={styles.titleChip}
                                maxWidth={false}
                                disableGutters={true}
                            >
                                <Typography
                                    variant="h2"
                                    className={styles.titleChipText}
                                >
                                    Order #{order.id}
                                </Typography>
                            </Container>
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

export const PendingTable = () => {
    const dispatch = useDispatch();
    const orders = useSelector(pendingOrderSelectors.selectAll);
    const hardware = useSelector(hardwareSelectors.selectEntities);
    const isVisible = useSelector(isPendingTableVisibleSelector);
    const toggleVisibility = () => dispatch(togglePendingTable());
    const cancelOrder = (orderId: number) => dispatch(updateOrder(orderId));

    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            {orders.length > 0 && (
                <div className={styles.title}>
                    <Typography variant="h2" className={styles.titleText}>
                        Pending Orders
                    </Typography>
                    <Button onClick={toggleVisibility} color="primary">
                        {isVisible ? "Hide all" : "Show all"}
                    </Button>
                </div>
            )}

            {isVisible &&
                orders.length > 0 &&
                orders.map((pendingOrder) => (
                    <div key={pendingOrder.id}>
                        <Container
                            className={styles.titleChip}
                            maxWidth={false}
                            disableGutters={true}
                        >
                            <Typography variant="h2" className={styles.titleChipText}>
                                Order #{pendingOrder.id}
                            </Typography>

                            <Container
                                className={styles.titleChipSpace}
                                maxWidth={false}
                                disableGutters={true}
                            >
                                <ChipStatus status={pendingOrder.status} />
                            </Container>
                        </Container>
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
                        <div className={styles.title}>
                            <Typography
                                variant="h2"
                                className={styles.titleText}
                            ></Typography>
                            <Button
                                onClick={() => cancelOrder(pendingOrder.id)}
                                color="secondary"
                            >
                                {isVisible ? "Cancel order" : ""}
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
