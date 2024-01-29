import json
import os
import pathlib
import sys

from pandasql import sqldf
import pandas as pd

REGISTRATION_OPEN_DATES = {
    "newhacks_2021": "2021-09-03",
    "makeuoft_2022": "2022-01-03",
    "makeuoft_2023": "2023-01-17",
    "newhacks_2023": "2023-09-18",
}

parent_folder = pathlib.Path(__file__).parent.resolve()
target_folder = f"{pathlib.Path(__file__).parents[1]}/static/registration/assets"
analytic_types = ["school", "program", "study_level"]


def get_applications_to_date(hackathon: str, year: str):
    application_data = pd.read_csv(get_hackathon_data_file(hackathon, year))
    q = """
        SELECT
            COUNT(*) as num_applied_to_date,
            SUBSTR(created_at, 0, 11) as date
        FROM application_data
        GROUP BY date
        ORDER BY date;
    """
    queried_data = sqldf(q, locals())
    queried_data.num_applied_to_date = queried_data.num_applied_to_date.cumsum()
    date = pd.to_datetime(queried_data.date)
    open_date = pd.to_datetime(
        [REGISTRATION_OPEN_DATES[f"{hackathon}_{year}"]] * len(queried_data)
    )
    queried_data["day_of_registration"] = (date - open_date).dt.days

    json_data = json.loads(queried_data.to_json(orient="records"))
    create_json_data_file(json_data, hackathon, year, "timeline")


def get_all_categorized_data(hackathon: str, year: str):
    application_data = pd.read_csv(get_hackathon_data_file(hackathon, year))
    categorized_data_in_json = {}
    for analytic_type in analytic_types:
        colname = f"applicant_{analytic_type}"
        q = f"""
                SELECT
                    COUNT(*) as num_applicants,
                    LOWER({analytic_type}) as {colname}
                FROM application_data
                GROUP BY {colname}
            """
        df = sqldf(q, locals())
        df.fillna("None", inplace=True)
        formatted_data = json.loads(df.to_json(orient="columns"))
        categorized_data_in_json[analytic_type] = {
            "num_applicants": list(formatted_data["num_applicants"].values()),
            f"{colname}": list(formatted_data[colname].values()),
        }

    create_json_data_file(categorized_data_in_json, hackathon, year, "categorized")


def get_hackathon_data_file(hackathon, year):
    return f"{parent_folder}/data/{hackathon}_{year}_user_application_data.csv"


def get_files_in_data_folder():
    return os.listdir(f"{parent_folder}/data")


def create_json_data_file(json_data, hackathon, year, analytic_type):
    if not os.path.isdir(f"{target_folder}/{hackathon}"):
        os.mkdir(f"{target_folder}/{hackathon}")
    if not os.path.isdir(f"{target_folder}/{hackathon}/{year}"):
        os.mkdir(f"{target_folder}/{hackathon}/{year}")

    with open(
        f"{target_folder}/{hackathon}/{year}/{analytic_type}.json", "w"
    ) as outfile:
        json.dump(json_data, outfile, indent=4)


if __name__ == "__main__":
    args = sys.argv
    analytic_type_arg = args[1]
    if analytic_type_arg == "all":
        for file in get_files_in_data_folder():
            hackathonStr, yearStr, *_ = file.split("_")
            get_applications_to_date(hackathon=hackathonStr, year=yearStr)
            get_all_categorized_data(hackathon=hackathonStr, year=yearStr)
    else:
        hackathon_name_arg = args[2]
        year_arg = args[3]
        if analytic_type_arg == "timeline":
            get_applications_to_date(hackathon=hackathon_name_arg, year=year_arg)
        elif analytic_type_arg == "categorized":
            get_all_categorized_data(hackathon=hackathon_name_arg, year=year_arg)
        else:
            print("Invalid type argument")
