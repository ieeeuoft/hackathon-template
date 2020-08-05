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
##### Fixtures
Django has fixtures which are hardcoded files (YAML/JSON) that provide initial data for models. They are placed in a fixtures folder under each app.

More information at [this link](https://docs.djangoproject.com/en/3.0/howto/initial-data/).

To load fixtures into the database, use the command `python manage.py loaddata <fixturename>` where `<fixturename>` is the name of the fixture file you’ve created. Each time you run loaddata, the data will be read from the fixture and re-loaded into the database. Note this means that if you change one of the rows created by a fixture and then run loaddata again, you’ll wipe out any changes you’ve made.


#### React
React tests are handled by [Jest](https://jestjs.io/). To run the full suite of React tests:
```bash
$ cd hackathon_site/dashboard/frontend
$ yarn test
```
## File Structure
The top level [hackathon_site](hackathon_site) folder contains the Django project that encapsulates this template.

The main project configs are in [hackathon_site/hackathon_site](hackathon_site/hackathon_site), including the main settings file [settings/__init__.py](hackathon_site/hackathon_site/settings/__init__.py) and top-level URL config.

The [dashboard](hackathon_site/dashboard) app contains the React project for the inventory management and hardware sign-out platform.

The [event](hackathon_site/event) app contains the public-facing templates for the landing page.

The [applications](hackathon_site/applications) app contains models, forms, and templates for user registration, including landing page and application templates. Since these templates are similar to the landing page, they may extend templates and use static files from the `event` app. 

### Templates and Static Files
Templates served from Django can be placed in any app. We use [Jinja 2](https://jinja.palletsprojects.com/en/2.11.x/) as our templating engine, instead of the default Django Template Language. Within each app, Jinja 2 templates must be placed in a folder called `jinja2/<app_name>/` (i.e., the full path will be `hackathon_site/<app_name>/jinja2/<app_name>/`). Templates can then be referenced in views as `<app_name>/your_template.html`.

Static files are placed within each app, in a folder named `static/<app_name>/` (same convention as templates). For example, SCSS files for the Event app may be in `hackathon_site/event/static/event/styles/scss/`. They can then be referenced in templates as `<app_name>/<path to static file>`, for example `event/styles/css/styles.css` (assuming the SCSS has been compiled to CSS).

Django can serve static files automatically in development. In a production environment, static files must be collected:

```bash
$ python manage.py collectstatic
```

This will place static files in `hackathon_site/static/`. These must be served separately, for example using Nginx, as Django cannot serve static files in production. [Read more about how Django handles static files](https://docs.djangoproject.com/en/3.0/howto/static-files/).