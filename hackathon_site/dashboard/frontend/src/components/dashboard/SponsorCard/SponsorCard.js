import React from "react";
import styles from "./SponsorCard.module.scss";
import Slider from "react-slick";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";

let settings = {
    dots: true,
    arrows: true,
    autoplaySpeed: 2500,
    autoplay: true,
    slidesToShow: 2,
    speed: 500,
    pauseOnHover: false,
};

const SponsorCard = ({ sponsors }) => (
    <Container
        className={!sponsors.length ? `${styles.noSponsors}` : `${styles.sponsors}`}
    >
        <h2>Thanks to our sponsors!</h2>
        <Paper elevation={3} className={styles.sponsorsPaper}>
            <Slider {...settings}>
                {sponsors.map((item) => (
                    <img
                        src={require("assets/images/sponsors/" + item.imgSrc)}
                        alt={item.imgSrc}
                    />
                ))}
            </Slider>
        </Paper>
    </Container>
);

export default SponsorCard;
