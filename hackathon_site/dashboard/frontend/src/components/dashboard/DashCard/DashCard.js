import React from "react";
import styles from "./DashCard.module.scss";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import TitledPaper from "components/general/TitledPaper/TitledPaper";

const CardItem = ({ name, icon }) => (
    <Container className={styles.items}>
        <Typography variant="body2" noWrap>
            {name}
        </Typography>
        {icon}
    </Container>
);

const DashCard = ({ title, content }) => (
    <TitledPaper title={title}>
        {content.map((listItem, i) => (
            <Link
                href={listItem.url}
                rel="noopener"
                color="inherit"
                underline="none"
                target="_blank"
                key={i}
            >
                <CardItem name={listItem.name} icon={listItem.icon} />
            </Link>
        ))}
    </TitledPaper>
);

export default DashCard;
