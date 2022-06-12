import React from "react";
import { mockAdminPendingOrders } from "testing/mockData";
import Container from "@material-ui/core/Container";
import styles from "./OrderCard.module.scss";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

const SmallInfoCard = ({ name, info }: { name: string; info: number | string }) => {
    return (
        <Container className={styles.items}>
            <Typography variant="body2" noWrap>
                {name}
            </Typography>
            {info}
        </Container>
    );
};

const SmallContentCard = ({
    content,
}: {
    content: { team: number; order_quantity: number; time_ordered: string; id: number };
}) => (
    <Paper elevation={2} square={true} className={styles.paper}>
        <SmallInfoCard name={"Team"} info={content.team} />
        <SmallInfoCard name={"Order Qty"} info={content.order_quantity} />
        <SmallInfoCard name={"Time Ordered"} info={content.time_ordered} />
        <SmallInfoCard name={"ID"} info={content.id} />
    </Paper>
);

export const OrderCard = () => {
    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <div className={styles.title}>
                <Typography variant="h2" className={styles.titleText}>
                    Pending Orders
                </Typography>
                {mockAdminPendingOrders.map((element, i) => (
                    <Grid
                        item
                        md={3}
                        sm={4}
                        xs={6}
                        className={styles.dashboardGridItem}
                        key={i + 1}
                    >
                        <SmallContentCard content={element} />
                    </Grid>
                ))}
            </div>
        </Container>
    );
};
