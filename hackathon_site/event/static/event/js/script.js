// Change navbar color on scroll
$(document).scroll(function () {
    let $nav = $(".navbar");
    $nav.toggleClass("scrolled", $(this).scrollTop() > $nav.height());
});

$(document).ready(function () {
    // Materialize stuff
    $(".sidenav").sidenav();
    $(".carousel").carousel({ dist: 0, padding: 600 });

    setInterval(function () {
        $(".carousel").carousel("next");
    }, 3000);

    $(".scrollspy").scrollSpy();
    $(".collapsible").collapsible();

    // Countdown stuff
    let countDownDate = new Date("Dec 31, 2020 00:00:00").getTime();

    // Update the count down every hour
    let x = setInterval(function () {
        let now = new Date().getTime();
        let distance = countDownDate - now;
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));

        if (days > 100) {
            $("#day1").html(Math.floor(days / 100));
        } else {
            $("#day1").parent().remove();
        }

        $("#day2").html(Math.floor(days / 10) % 10);
        $("#day3").html(days % 10);

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            $("#day2").html(0);
            $("#day3").html(0);
        }
    }, 1000);
});
