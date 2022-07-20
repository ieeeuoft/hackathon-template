import React from "react";
import styles from "./OrderCard.module.scss";
import { Typography, Container, Card } from "@material-ui/core";

interface OrderProps {
    teamCode: string;
    orderQuantity: number;
    time: string;
    id: number;
}

const OrderCard = ({ teamCode, orderQuantity, time, id }: OrderProps) => {
    const monthNames = [
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
    ];
    const date = new Date(time);
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const hoursAndMinutes = date.getHours() + ":" + date.getMinutes();

    const orderDetails = [
        { title: "Team", value: teamCode },
        { title: "Order Qty", value: orderQuantity },
        { title: "Time ordered", value: `${month} ${day}, ${hoursAndMinutes}` },
        { title: "ID", value: id },
    ];

    return (
        <Card>
            <Container className={styles.container}>
                {orderDetails.map((item, idx) => (
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
