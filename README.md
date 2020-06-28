# IEEE Hackathon Website Template

A website template for hackathons run by [IEEE University of Toronto Student Branch](https://ieee.utoronto.ca/).

## Requirements
- Python 3.8 or higher
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started
### Python Environment
For local development, create a Python virtual environment. 

#### Conda
We recommend you use [Anaconda](https://www.anaconda.com/products/individual) (or [Miniconda](https://docs.conda.io/en/latest/miniconda.html)), as it makes managing virtual environments with different Python versions easier:
```bash
$ conda create -n hackathon_site python=3.8
```

This will create a new conda environment named `hackathon_site` (you may choose a different name). Then, activate the environment:
```bash
$ conda activate hackathon_site
```

#### venv
Alternatively, you can use [venv](https://docs.python.org/3/library/venv.html) provided under the standard library, but note that you must already have Python 3.8 installed first:
```bash
$ python3.8 -m venv venv
```

How you activate the environment depends on your operating system, consult [the docs](https://docs.python.org/3/library/venv.html) for further information.

#### Installing Requirements
Install the requirements in `hackathon_site/requirements.txt`. This should be done regularly as new requirements are added, not just the first time you set up.
```bash
$ cd hackathon_site
$ pip install -r requirements.txt
```

### Environment Variables
In order to run the django and react development servers locally (or run tests), the following environment variables are used. Those in **bold** are required.

| **Variable**   | **Required value**                | **Default**    | **Description**                                                                   |
|----------------|-----------------------------------|----------------|-----------------------------------------------------------------------------------|
| **DEBUG**      | 1                                 | 0              | Run Django in debug mode. Required to run locally.                                |
| **SECRET_KEY** | Something secret, create your own | None           | Secret key for cryptographic signing. Must not be shared. Required.               |
| DB_HOST        |                                   | 127.0.0.1      | Postgres database host.                                                           |
| DB_USER        |                                   | postgres       | User on the postgres database. Must have permissions to create and modify tables. |
| DB_PASSWORD    |                                   |                | Password for the postgres user.                                                   |
| DB_PORT        |                                   | 5432           | Port the postgres server is open on.                                              |
| DB_NAME        |                                   | hackathon_site | Postgres database name.                                                           |
| REACT_APP_DEV_SERVER_URL |                  | http://localhost:8000 | Path to the django development server, used by React.                             |

#### Testing
Specifying `SECRET_KEY` is still required to run tests, because the settings file expects it to be set. `DEBUG` is forced to `False` by Django.

In the [GitHub action for Python tests](.github/workflows/pythonchecks.yml), `DEBUG` is set to be `1`. `SECRET_KEY` is taken from the `DJANGO_SECRET_KEY` repository secret. In order to run tests on a fork of this repo, you will need to [create this secret yourself](https://help.github.com/en/actions/configuring-and-managing-workflows/creating-and-storing-encrypted-secrets).

### Running the development server
#### Database
Before the development server can be ran, the database must be running. This project is configured to use [PostgreSQL](https://www.postgresql.org/). 

You may install Postgres on your machine if you wish, but we recommend running it locally using docker. A docker-compose service is available in [development/docker-compose.yml](/home/graham/ieee/hackathon-template/README.md). To run all the services, including the database:
```bash
$ docker-compose -f development/docker-compose.yml up -d
```

To shut down the database and all other services:
```bash
$ docker-compose -f development/docker-compose.yml down
```

The postgres container uses a volume mounted to `development/.postgres-data/` for persistent data storage, so you can safely stop the service without losing any data in your local database.

A note about security: by default, the Postgres service is run with [trust authentication](https://www.postgresql.org/docs/current/auth-trust.html) for convenience, so no passwords are required even if they are set. You should not store any sensitive information in your local database, or broadcast your database host publicly with these settings.

#### Database migrations
[Migrations](https://docs.djangoproject.com/en/3.0/topics/migrations/) are Django's way of managing changes to the database structure. Before you run the development server, you should run any unapplied migrations; this should be done every time you pull an update to the codebase, not just the first time you set up:
```bash
$ cd hackathon_site
$ python manage.py migrate
```

#### Run the development server
Finally, you can run the development server, by default on port 8000. From above, you should already be in the top-level `hackathon_site` directory:
```bash
$ python manage.py runserver
```

If you would like to run on a port other than 8000, specify a port number after `runserver`.

### Tests
#### Django
Django tests are run using [Django's test system](https://docs.djangoproject.com/en/3.0/topics/testing/overview/), based on the standard python `unittest` module.

A custom settings settings module is available for testing, which tells Django to use an in-memory sqlite3 database instead of the postgresql database for testing. To run the full test suite locally:

```bash
$ cd hackathon_site
$ python manage.py test --settings=hackathon_site.settings.ci
``` 

#### React
React tests are handled by [Jest](https://jestjs.io/). To run the full suite of React tests:
```bash
$ cd hackathon_site/dashboard/frontend
$ yarn test
```
