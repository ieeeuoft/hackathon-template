import React from "react";
import styles from "./OrderCard.module.scss";
import { Typography, Container, Card } from "@material-ui/core";

interface OrderProps {
    teamCode: string;
    orderQuantity: number;
    timeOrdered: string;
    id: number;
}

const OrderCard = ({ teamCode, orderQuantity, timeOrdered, id }: OrderProps) => {
    const orderDetails = [
        { title: "Team", value: teamCode },
        { title: "Order Qty", value: orderQuantity },
        { title: "Time ordered", value: timeOrdered },
        { title: "ID", value: id },
    ];
    return (
        <Card>
            <Container className={styles.container}>
                {orderDetails.map((item, idx) => (
                    <Container className={styles.contentContainer} key={idx}>
                        <Typography variant="body2">{item.title}</Typography>
                        <Typography variant="body2">{item.value}</Typography>
                    </Container>
                ))}
            </Container>
        </Card>
    );
};

export default OrderCard;
