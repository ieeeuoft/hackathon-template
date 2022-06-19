const DATA_AVAILABLE = {
    newhacks: {
        2021: "#9B59B6",
    },
    makeuoft: {
        2022: "#F5B041",
    },
};
const stringToColour = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let colour = "#";
    for (let i = 0; i < 3; i++) {
        let value = (hash >> (i * 8)) & 0xff;
        colour += ("00" + value.toString(16)).substr(-2);
    }
    return colour;
};
const capitalizeString = (str) => str.replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
let handleGraphChange;
django.jQuery(document).ready(async () => {
    //-------------------------------- LOADING DATA -----------------------------------
    const timelineDataUnresolved = Object.entries(DATA_AVAILABLE).flatMap(
        ([hackathon, years]) => {
            return Object.keys(years).map(async (year) => {
                const data = await django.jQuery.getJSON(
                    `/static/registration/assets/${hackathon}/${year}/timeline.json`
                );
                return {
                    title: capitalizeString(`${hackathon} ${year}`),
                    color: DATA_AVAILABLE[hackathon][year],
                    data,
                };
            });
        }
    );
    const categorizedData = {};
    for (const [hackathon, years] of Object.entries(DATA_AVAILABLE)) {
        categorizedData[hackathon] = {};
        for (const year in years) {
            const data = await django.jQuery.getJSON(
                `/static/registration/assets/${hackathon}/${year}/categorized.json`
            );
            for (const [category, categoryData] of Object.entries(data)) {
                data[category].colors = Object.values(
                    categoryData[`applicant_${category}`]
                ).map((str) => stringToColour(str));
            }
            categorizedData[hackathon][year] = { ...data };
        }
    }
    const timelineData = await Promise.all(timelineDataUnresolved);
    const maxDayOfRegistration = timelineData.reduce((prev, curr) =>
        Math.max(
            prev.data.at(-1).day_of_registration,
            curr.data.at(-1).day_of_registration
        )
    );

    // -------------------------------- LINE CHART - Applications Timeline --------------------------------
    const applicantTimelineConfig = {
        type: "line",
        data: {
            labels: [...Array(maxDayOfRegistration + 5).keys()],
            datasets: timelineData.map(({ title, data, color }) => ({
                label: title,
                data,
                backgroundColor: color,
                borderColor: color,
            })),
        },
        options: {
            responsive: true,
            parsing: {
                xAxisKey: "day_of_registration",
                yAxisKey: "num_applied_to_date",
            },
            scales: {
                yAxes: {
                    title: {
                        color: "#BDC3C7",
                        display: true,
                        text: "Number of Completed Applications",
                        font: {
                            size: 15,
                        },
                    },
                    ticks: {
                        color: "#909497",
                    },
                },
                xAxes: {
                    title: {
                        color: "#BDC3C7",
                        display: true,
                        text: "Days Since Registration Opened",
                        font: {
                            size: 15,
                        },
                    },
                    ticks: {
                        color: "#909497",
                    },
                },
            },
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "#BDC3C7",
                        font: {
                            size: 14,
                        },
                    },
                },
                title: {
                    display: true,
                    text: "Number of Completed Applications for our Hackathons Over Time",
                    color: "#D7DBDD",
                    font: {
                        size: 18,
                    },
                },
                tooltip: {
                    callbacks: {
                        title: () => "Date",
                        label: (context) =>
                            ` Day ${context.raw.day_of_registration}: ${context.raw.date}`,
                    },
                },
            },
        },
    };

    // -------------------------------- PIE CHART - Hackathon Applicant Categorization --------------------------------
    const defaultSettings = {
        borderColor: "#17202A",
        borderWidth: 1,
        hoverOffset: 4,
    };

    const getPieChartConfig = (hackathon, year, dataType) => ({
        type: "pie",
        data: {
            labels:
                hackathon === "empty"
                    ? []
                    : categorizedData[hackathon][year][dataType][
                          `applicant_${dataType}`
                      ],
            datasets: [
                {
                    label:
                        hackathon === "empty" ? "Placeholder" : `${hackathon} ${year}`,
                    data:
                        hackathon === "empty"
                            ? []
                            : categorizedData[hackathon][year][dataType].num_applicants,
                    backgroundColor:
                        hackathon === "empty"
                            ? []
                            : categorizedData[hackathon][year][dataType].colors,
                    ...defaultSettings,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: false,
                },
                title: {
                    display: true,
                    text:
                        hackathon === "empty"
                            ? "Placeholder"
                            : capitalizeString(
                                  `${hackathon} ${year} applicant ${dataType.replace(
                                      "_",
                                      " "
                                  )}s`
                              ),
                    color: "#D7DBDD",
                    font: {
                        size: 18,
                    },
                },
            },
        },
    });

    const lineCtx = document.getElementById("lineChart").getContext("2d");
    const pieCtx = document.getElementById("pieChart").getContext("2d");
    new Chart(lineCtx, applicantTimelineConfig);
    const pieChart = new Chart(pieCtx, getPieChartConfig("empty"));
    django.jQuery("#pieChartContainer").hide();

    // ----------------------------------- DROPDOWN LOGIC ---------------------------------------
    handleGraphChange = () => {
        const chartType = django.jQuery("#chartType").val();
        const hackathonYearSelect = django.jQuery("#hackathonYear");
        if (chartType === "timeline") {
            hackathonYearSelect.val("");
            django.jQuery("#lineChartContainer").show();
            django.jQuery("#pieChartContainer").hide();
        } else {
            const hackathonYear = hackathonYearSelect.val();
            if (hackathonYear === "") {
                alert(
                    "incorrect combination for data charts, please select a valid year."
                );
                return;
            }
            const [hackathon, year] = hackathonYear.split("-");
            const pieChartConfig = getPieChartConfig(hackathon, year, chartType);
            pieChart.data = { ...pieChartConfig.data };
            pieChart.options = { ...pieChartConfig.options };
            pieChart.update();
            django.jQuery("#pieChartContainer").show();
            django.jQuery("#lineChartContainer").hide();
        }
    };
});
