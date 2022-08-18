import React from "react";
import styles from "./OrderCard.module.scss";
import { Typography, Container, Card } from "@material-ui/core";

interface OrderCheckedOutProps {
    team: string;
    orderQuantity: number;
    timeOrdered: string;
    receivedIDs: boolean;
    id: number;
}

const OrderCheckedOut = ({
    team,
    orderQuantity,
    timeOrdered,
    receivedIDs,
    id,
}: OrderCheckedOutProps) => {
    const date = new Date(timeOrdered);
    const month = date.toLocaleString("default", { month: "short" });
    const day = date.getDate();
    const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();

    const orderDetails = [
        { title: "Team", value: team },
        { title: "Order Qty", value: orderQuantity },
        { title: "Time ordered", value: `${month} ${day}, ${hoursAndMinutes}` },
        { title: "Received IDs", value: receivedIDs },
        { title: "ID", value: id },
    ];

    return (
        <Card>
            <Container className={styles.container} data-testid={`order-item-${id}`}>
                {orderDetails.map((item, idx) => (
                    <Container className={styles.contentContainer} key={idx}>
                        <Typography variant="body2" className={styles.title}>
                            {item.title}
                        </Typography>
                        <Typography variant="body2" style={{ textAlign: "end" }}>
                            {item.value}
                        </Typography>
                    </Container>
                ))}
            </Container>
        </Card>
    );
};

export default OrderCheckedOut;
