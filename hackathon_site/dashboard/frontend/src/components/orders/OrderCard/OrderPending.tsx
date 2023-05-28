import React, { useEffect, useState } from "react";
import styles from "./OrderCardPending.module.scss";
import { Typography, Container, Card } from "@material-ui/core";
import { Formik, FormikValues } from "formik";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import stylesButton from "components/sharedStyles/Filter.module.scss";

interface OrderPendingProps {
    team: string;
    orderQuantity: number;
    timeOrdered: string;
    receivedIDs: boolean;
    id: number;
}

const OrderPending = ({
    team,
    orderQuantity,
    timeOrdered,
    receivedIDs,
    id,
}: OrderPendingProps) => {
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

    // controls the state of the button
    const [pickedUp, setPickedUp] = useState(false);

    const alertEvent = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // evokes window alert
        event.preventDefault();
        if (event.target === event.currentTarget) {
            alert("The order you clicked is: #" + id);
        }
    };

    return (
        <Card onClick={alertEvent}>
            <Formik
                initialValues={{
                    ReceivedIDsCheck: false,
                }}
                onSubmit={(values: FormikValues) => {
                    console.log(values);
                    console.log("click picked up");
                    setPickedUp(true);
                }}
            >
                <Container
                    className={styles.container}
                    data-testid={`order-item-${id}`}
                >
                    {orderDetails.map((item, idx) => {
                        return (
                            <Container
                                className={styles.contentContainer}
                                key={idx}
                                style={{ alignItems: "center" }}
                            >
                                <Typography variant="body2" className={styles.title}>
                                    {item.title}
                                </Typography>
                                {item.title === "Received IDs" ? (
                                    <Checkbox
                                        name="ReceivedIDsCheck"
                                        color="primary"
                                        checked={
                                            typeof item.value === "boolean"
                                                ? item.value
                                                : false
                                        }
                                        disabled={pickedUp}
                                    />
                                ) : (
                                    <Typography
                                        variant="body2"
                                        style={{ textAlign: "end" }}
                                    >
                                        {item.value}
                                    </Typography>
                                )}
                            </Container>
                        );
                    })}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "4px 12px",
                        }}
                    >
                        <Button
                            type="submit"
                            onClick={(event) => {
                                event.stopPropagation();
                                // console.log("click picked up");
                                setPickedUp(true);
                            }}
                            color="primary"
                            variant="contained"
                            fullWidth={true}
                            className={stylesButton.filterBtnsApply}
                            disabled={pickedUp}
                            disableElevation
                            data-testid="apply-button"
                            style={pickedUp ? { pointerEvents: "none" } : {}}
                        >
                            Picked Up
                        </Button>
                        <Button
                            // type="submit"
                            color="primary"
                            data-testid="clear-button"
                            onClick={(event) => {
                                event.stopPropagation();
                                console.log("click view");
                            }}
                        >
                            View
                        </Button>
                    </div>
                </Container>
            </Formik>
        </Card>
    );
};

export default OrderPending;
