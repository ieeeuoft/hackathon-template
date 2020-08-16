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

    // Registration open and close date, and event date
    let regOpenDate = new Date("Sep 1, 2020 00:00:00").getTime();
    let regCloseDate = new Date("Sep 30, 2020 00:00:00").getTime();
    let eventDate = new Date("Oct 31, 2020 00:00:00").getTime();

    let now = new Date().getTime();

    // Set the title based off what it's counting down to
    if (regOpenDate > now) {
        countDownDate = regOpenDate;
        $("#countdownTitle").html("Registration Opens In");
    } else if (regCloseDate > now) {
        countDownDate = regCloseDate;
        $("#countdownTitle").html("Registration Closes In");
    } else if (eventDate > now) {
        countDownDate = eventDate;
        $("#countdownTitle").html("Event Starts In");
    }

    // Delete the entire countdown if event start date has passed
    if (eventDate < now) {
        $("#countdown").remove();
        $("#aboutText").removeClass("l7");
    } else {
        // Update the countdown every ten minute
        setInterval(setCounter(countDownDate), 600000);
    }
});

function setCounter(countDownDate) {
    let now = new Date().getTime();
    let distance = countDownDate - now;
    let days = Math.ceil(distance / (1000 * 60 * 60 * 24));

    // Check if we need a third digit or not
    if (days > 99) {
        $("#day1").html(Math.floor(days / 100));
    } else {
        $("#day1").parent().remove();
    }

    $("#day2").html(Math.floor(days / 10) % 10);
    $("#day3").html(days % 10);
}
