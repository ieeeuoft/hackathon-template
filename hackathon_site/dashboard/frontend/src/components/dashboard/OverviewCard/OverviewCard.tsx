import React from "react";
import Typography from "@material-ui/core/Typography";
import styles from "./OverviewCard.module.scss";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import MemoryIcon from "@mui/icons-material/Memory";
import PeopleIcon from "@mui/icons-material/People";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import LocalMallIcon from "@mui/icons-material/LocalMall";
import BrokenImageIcon from "@mui/icons-material/BrokenImage";
import { SvgIconComponent } from "@material-ui/icons";
import { mockOverviewStats } from "testing/mockData";

const SmallCard = ({
    icon_type,
    info_string,
}: {
    icon_type: SvgIconComponent;
    info_string: string;
}) => {
    return (
        <div>
            {icon_type}
            {info_string}
        </div>
    );
};

export const OverviewCard = () => {
    const card_info: { [key: string]: { info_string: string; icon_type: any } } = {
        checked_out: {
            info_string: "items checked out",
            icon_type: <MemoryIcon />,
        },
        participants: {
            info_string: "participants",
            icon_type: <PeopleIcon />,
        },
        teams: {
            info_string: "teams",
            icon_type: <AccountBoxIcon />,
        },
        orders: {
            info_string: "orders",
            icon_type: <LocalMallIcon />,
        },
        broken: {
            info_string: "broken/lost items",
            icon_type: <BrokenImageIcon />,
        },
    };
    return (
        <Container
            className={styles.tableContainer}
            maxWidth={false}
            disableGutters={true}
        >
            <div className={styles.title}>
                <Typography variant="h3" className={styles.titleText}>
                    Overview
                </Typography>
                {mockOverviewStats.map((element, index) => (
                    <div key={index + 1}>
                        <SmallCard
                            icon_type={card_info[element.title].icon_type}
                            info_string={element.quantity
                                .toString()
                                .concat(" ", card_info[element.title].info_string)}
                        />
                    </div>
                ))}
            </div>
        </Container>
    );
};
