import styles from "./OrderTables.module.scss";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import React from "react";
import Container from "@material-ui/core/Container";
import { OrderStatus } from "api/types";
import Chip from "@material-ui/core/Chip";
import CheckCircle from "@material-ui/icons/CheckCircle";
import WatchLater from "@material-ui/icons/WatchLater";
import Error from "@material-ui/icons/Error";

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
    isVisible: boolean;
    toggleVisibility: () => void;
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
        <Button
            onClick={toggleVisibility}
            color="primary"
            data-testid="visibility-button"
        >
            {isVisible ? "Hide all" : "Show all"}
        </Button>
    </div>
);

interface GeneralOrderTableTitleProps {
    orderId: number;
    orderStatus?: OrderStatus;
}
export const GeneralOrderTableTitle = ({
    orderId,
    orderStatus,
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
    </Container>
);
