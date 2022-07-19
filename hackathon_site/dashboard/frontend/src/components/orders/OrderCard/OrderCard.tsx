import React from "react";
import styles from "./OrderCard.module.scss";
import { Typography, Container, Card } from "@material-ui/core";

interface OrderProps {
    teamId: number;
    orderQuantity: number;
    timeOrdered: string;
    id: number;
}

const OrderCard = ({ teamId, orderQuantity, timeOrdered, id }: OrderProps) => {
    const arr = [
        { title: "Team", value: teamId },
        { title: "Order Qty", value: orderQuantity },
        { title: "Time ordered", value: timeOrdered },
        { title: "ID", value: id },
    ];
    return (
        <Card style={{ minHeight: "160px" }}>
            <Container className={styles.container}>
                {arr.map((item, idx) => (
                    <Container className={styles.contentContainer} key={idx}>
                        <Typography variant="body2" className={styles.title}>
                            {item.title}
                        </Typography>
                        <Typography variant="body2">{item.value}</Typography>
                    </Container>
                ))}
            </Container>
        </Card>
    );
};

export default OrderCard;
