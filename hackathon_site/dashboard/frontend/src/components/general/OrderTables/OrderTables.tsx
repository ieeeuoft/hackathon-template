import styles from "./OrderTables.module.scss";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React, { ReactElement } from "react";
import Container from "@material-ui/core/Container";
import { OrderInTable, OrderStatus, ReturnOrderInTable } from "api/types";
import Chip from "@material-ui/core/Chip";
import CheckCircle from "@material-ui/icons/CheckCircle";
import WatchLater from "@material-ui/icons/WatchLater";
import Error from "@material-ui/icons/Error";
import EditIcon from "@material-ui/icons/Edit";
import UpdateIcon from "@material-ui/icons/Update";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@material-ui/core";
import hardwareImagePlaceholder from "assets/images/placeholders/no-hardware-image.svg";
import { useSelector } from "react-redux";
import { hardwareSelectors } from "slices/hardware/hardwareSlice";
import { formatDateTime } from "api/helpers";

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

interface GeneralOrderTitleProps {
    title: string;
    isVisible?: boolean;
    toggleVisibility?: () => void;
}
export const GeneralOrderTitle = ({
    title,
    isVisible,
    toggleVisibility,
}: GeneralOrderTitleProps) => (
    <div className={styles.title}>
        <Typography variant="h2" className={styles.titleText}>
            {title}
        </Typography>
        {!!toggleVisibility && (
            <Button
                onClick={toggleVisibility}
                color="primary"
                data-testid="visibility-button"
            >
                {isVisible ? "Hide all" : "Show all"}
            </Button>
        )}
    </div>
);

interface GeneralOrderTableTitleProps {
    orderId: number;
    orderStatus?: OrderStatus;
    createdTime?: string;
    updatedTime?: string;
    additionalChipFormatting?: boolean;
}

export const GeneralOrderTableTitle = ({
    orderId,
    orderStatus,
    createdTime,
    updatedTime,
    additionalChipFormatting,
}: GeneralOrderTableTitleProps) => (
    <Container className={styles.titleChip} maxWidth={false} disableGutters={true}>
        <Typography variant="h2" className={styles.titleChipText}>
            Order #{orderId}
        </Typography>

        {orderStatus && (
            <Container
                className={styles.titleChipSpace}
                maxWidth={false}
                disableGutters={true}
            >
                <ChipStatus status={orderStatus} />
            </Container>
        )}

        {createdTime && updatedTime ? (
            <Container>
                <Chip
                    label={[<b>Created at: </b>, formatDateTime(createdTime)]}
                    icon={<EditIcon />}
                    className={`${styles.chipPurple} ${styles.chip} ${
                        additionalChipFormatting ? styles.chipPadding : ""
                    }`}
                />
                {"    "}
                <Chip
                    label={[<b>Updated at: </b>, formatDateTime(updatedTime)]}
                    icon={<UpdateIcon />}
                    className={`${styles.chipBlue} ${styles.chip} ${
                        additionalChipFormatting ? styles.chipPadding : ""
                    }`}
                />
            </Container>
        ) : null}
    </Container>
);

export const GeneralPendingTable = ({
    pendingOrder,
    extraColumn,
}: {
    pendingOrder: OrderInTable;
    extraColumn?: {
        header: ReactElement;
        body: (id: number) => ReactElement;
    };
}) => {
    const hardware = useSelector(hardwareSelectors.selectEntities);

    return (
        <>
            <GeneralOrderTableTitle
                orderId={pendingOrder.id}
                orderStatus={pendingOrder.status}
                createdTime={pendingOrder.createdTime}
                updatedTime={pendingOrder.updatedTime}
            />
            <TableContainer component={Paper} elevation={2} square={true}>
                <Table className={styles.table} size="small" aria-label="pending table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={styles.widthFixed} />
                            <TableCell className={styles.width6} align="left">
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
                            {extraColumn?.header}
                            {!extraColumn && (
                                <TableCell className={styles.widthBuffer} />
                            )}
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
                                {extraColumn?.body(row.id)}
                                {!extraColumn && (
                                    <TableCell className={styles.widthBuffer} />
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
};

export const GeneralReturnTable = ({
    isVisible,
    toggleVisibility,
    orders,
    fetchOrdersError,
}: {
    isVisible: boolean;
    toggleVisibility?: () => void;
    orders: ReturnOrderInTable[];
    fetchOrdersError?: string | null;
}) => {
    const hardware = useSelector(hardwareSelectors.selectEntities);

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
                        <div
                            key={order.id}
                            data-testid={`returned-order-table-${order.id}`}
                            data-updated-time={`returned-order-time-${order.hardwareInOrder[0].time}`}
                        >
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
