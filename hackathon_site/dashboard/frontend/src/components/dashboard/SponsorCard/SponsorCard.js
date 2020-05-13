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

let sponsorList = [
    { imgSrc: "AMD.svg" },
    { imgSrc: "City of Brampton.svg" },
    { imgSrc: "Cognitive Systems.svg" },
    { imgSrc: "ECE.png" },
    { imgSrc: "ecobee.svg" },
    { imgSrc: "Faculty of Applied Science and Engineering.png" },
    { imgSrc: "Huawei.svg" },
];

const SponsorCard = () => (
    <Container className={styles.sponsors}>
        <h2>Thanks to our sponsors!</h2>
        <Paper elevation={3} className={styles.sponsorsPaper}>
            <Slider {...settings}>
                {sponsorList.map((item) => (
                    <div className={styles.sponsorsImgdiv}>
                        <img
                            src={require("./../../../assets/images/sponsors/" +
                                item.imgSrc)}
                        />
                    </div>
                ))}
            </Slider>
        </Paper>
    </Container>
);

export default SponsorCard;
