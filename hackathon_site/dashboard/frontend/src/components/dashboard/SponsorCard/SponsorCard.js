import React from "react";
import styles from "./SponsorCard.module.scss";
import Slider from "react-slick";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";

let settings = {
    dots: true,
    arrows: true,
    autoplaySpeed: 2500,
    autoplay: true,
    slidesToShow: 2,
    speed: 500,
    pauseOnHover: false,
};

const SponsorCard = ({ sponsors }) => {
    return !sponsors.length ? null : (
        <Grid className={styles.sponsors} data-testid="sponsor-card" item>
            <Typography variant="h2">Thanks to our sponsors!</Typography>
            <Paper elevation={3} className={styles.sponsorsPaper}>
                <Slider {...settings}>
                    {sponsors.map((item, i) => (
                        <img
                            src={require("assets/images/sponsors/" + item.imgSrc)}
                            alt={item.imgSrc}
                            key={i}
                        />
                    ))}
                </Slider>
            </Paper>
        </Grid>
    );
};

export default SponsorCard;
