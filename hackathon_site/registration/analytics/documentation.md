## IEEE - Analytics for Hackathons

In the `hackathon_site/registration/analytics` folder there's a file named 
`data_manipulation.py` that performs analytics using pandas and SQL on **historical hackathon data**.
This python file generates JSON files that are used in the frontend to display graphs.

### Overview
Currently, we display 4 kinds of analytics:
1. a line graph showing all completed applications since a hackathon registration open date
2. a pie chart showing the different schools our applicants attend
3. a pie chart showing the different programs our applicants are enrolled in
4. a pie chart showing the education levels of our applicants

### Setup
running `data_manipulation.py` requires a csv file containing:

| school | study_level | program | created_at | status |
| ------ | ----------- | ------- | ---------- | -------|
from the application model. This needs to be collected from our server's database
before its shut down. Store this csv elsewhere as a backup.

Create a `data` folder in `registration/analytics` and place this csv there.
Make sure the file name starts with `{hackathon name}_{year}_<...>.csv`.

#### Dependencies
Ensure you have `pandas` and `pandasql` installed in your local environment.

### Running the Code

`python data_manipulation.py <type> <hackathon name> <year>`

There are 3 arguments:
- `type` what kind of JSON data files you want to generate
  - 3 options: `timeline`, `categorized` or `all` (creates both categorized and timeline JSON files from all csv files)
- `hackathon name`: makeuoft or newhacks
- `year`: year that hackathon took place

`timeline` type will create a JSON for the line graph

`categorized` type will create a JSON for the pie charts

#### Examples
`python data_manipulation.py timeline makeuoft 2022`

`python data_manipulation.py all`

#### Result
Running this code will generate json files in `hackathon_site/registration/static/registration/assets` in this format:
```
registration/static/registration
|
└─── assets
│   │
│   └─── { hackathon name }
│           └─── { year }
│               │   categorized.json
│               │   timeline.json
│   
└─── css
    │   contains styling for admin django template
└─── js
    │   contains charts.js configurations
```

If any of the folders in `assets` don't exist, they will be created.

If you choose `timeline` as the type when you ran the file, then `timeline.json` will appear.
Same if you chose `categorized`. Both JSONs will be created if type is `all`.