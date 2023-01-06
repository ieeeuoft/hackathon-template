# IEEE Hackathon Website Template

A website template for hackathons run by [IEEE University of Toronto Student Branch](https://ieee.utoronto.ca/).

## IEEE Web Team 2022-2023
#### Directors
- YuYing Liang
- Leo Haocheng Li
- Mustafa Abdulrahman (PM)

#### Associates
- Ethan Hugh
- Luke Cheseldine
- Karandeep Lubana
- Terry Luan
- Eric Ji
- Dalia Mahidashti 
- Carmen Chau
- Samuel Liu
- Daniel Qiu

## Contents
- [Requirements](#requirements)
- [Getting Started](#getting-started)
    * [Python Environment](#python-environment)
    * [Environment Variables](#environment-variables)
    * [Running the development server](#running-the-development-server)
    * [Creating users locally](#creating-users-locally)
    * [Tests](#tests)
- [File Structure](#file-structure)
- [Using this Template](#using-this-template)
    * [Forking](#forking)
    * [From the Template (Recommended)](#from-the-template)
    * [Copy the Repository](#copy-the-repository)
- [Customization](#customization)
    * [Branding and Styling](#branding-and-styling)

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

| **Variable**   | **Required value**                | **Default**       | **Description**                                                                   |
|----------------|-----------------------------------|-------------------|-----------------------------------------------------------------------------------|
| **DEBUG**      | 1                                 | 0                 | Run Django in debug mode. Required to run locally.                                |
| **SECRET_KEY** | Something secret, create your own | None              | Secret key for cryptographic signing. Must not be shared. Required.               |
| DB_HOST        |                                   | 127.0.0.1         | Postgres database host.                                                           |
| DB_USER        |                                   | postgres          | User on the postgres database. Must have permissions to create and modify tables. |
| DB_PASSWORD    |                                   |                   | Password for the postgres user.                                                   |
| DB_PORT        |                                   | 5432              | Port the postgres server is open on.                                              |
| DB_NAME        |                                   | hackathon_site    | Postgres database name.                                                           |
| REDIS_URI      |                                   | 172.17.0.1:6379/1 | Redis [URI](https://github.com/lettuce-io/lettuce-core/wiki/Redis-URI-and-connection-details#uri-syntax). `<host>:<port>/<database>`. |
| **REACT_APP_DEV_SERVER_URL** | http://localhost:8000 |                 | Path to the django development server, used by React. Update the port if you aren't using the default 8000. |
| RECAPTCHA_PUBLIC_KEY | Something | A recaptcha public key that will skip the challenge | Key info: https://www.google.com/recaptcha/ |
| RECAPTCHA_PRIVATE_KEY | Something | A recaptcha private key that will skip the challenge | Key info: https://www.google.com/recaptcha/ |

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

To run only the database service:
```bash
$ docker-compose -f development/docker-compose.yml up -d postgres
```

The postgres container uses a volume mounted to `development/.postgres-data/` for persistent data storage, so you can safely stop the service without losing any data in your local database.

A note about security: by default, the Postgres service is run with [trust authentication](https://www.postgresql.org/docs/current/auth-trust.html) for convenience, so no passwords are required even if they are set. You should not store any sensitive information in your local database, or broadcast your database host publicly with these settings.

#### Database migrations
[Migrations](https://docs.djangoproject.com/en/3.0/topics/migrations/) are Django's way of managing changes to the database structure. Before you run the development server, you should run any unapplied migrations; this should be done every time you pull an update to the codebase, not just the first time you set up:
```bash
$ cd hackathon_site
$ python manage.py migrate
```

#### Cache
This application also relies on a cache, for which we use [Redis](https://redis.io/).

You may install Redis on your machine if you wish, but we recommend running it locally using docker. A Redis service is available in [development/docker-compose.yml](/home/graham/ieee/hackathon-template/README.md). To run all the services, including the database:
```bash
$ docker-compose -f development/docker-compose.yml up -d
```

To run only the redis service:
```bash
$ docker-compose -f development/docker-compose.yml up -d redis
```

If you run multiple instances of this application in production using Redis through Docker (perhaps in Swarm mode), you should make sure that the Redis databases used between applications do not conflict. The easiest way to do this is to change the database id in the [Redis URI environment variable](#environment-variables), eg to `172.17.0.1:6379/2`.

#### Run the development server
Finally, you can run the development server, by default on port 8000. From above, you should already be in the top-level `hackathon_site` directory:
```bash
$ python manage.py runserver
```

If you would like to run on a port other than 8000, specify a port number after `runserver`.

### Creating users locally
In order to access most of the functionality of the site (the React dashboard or otherwise), you will need to have user accounts to test with. 

To start, create an admin user. This will give you access to the admin site, and will bypass all Django permissions checks:

```bash
$ python manage.py createsuperuser 
```

Once a superuser is created (and the Django dev server is running), you can log in to the admin site at `http://localhost:8000/admin`. Note that creating a superuser does not give it a first or last name, so you should set those from the admin site otherwise some parts of the site may behave weird. Our regular sign up flow also assumes that username and email are the same, so we recommend creating your superuser accordingly.

#### Adding additional users
The easiest way to add new users is via the admin site, through the "Users" link of the "Authentication and Authorization" panel. When adding a user, you will be prompted for only a username and a password. The react site uses email to log in, so *make sure* to click "Save and continue editing" and add a first name, last name, and email address.

#### Giving a user a profile
Profiles are used by participants who have either been accepted or waitlisted. Some features of the React dashboard require the user to have a profile. This can be done through the "Profiles" link of the "Event" panel on the admin site. Click "Add profile", select a user from the dropdown, either add them to an existing team (if you have any) or click the green "+" to create a team, pick a status, fill out any other required fields, and click save.


### Tests
#### Django
Django tests are run using [Django's test system](https://docs.djangoproject.com/en/3.0/topics/testing/overview/), based on the standard python `unittest` module.

A custom settings settings module is available for testing, which tells Django to use an in-memory sqlite3 database instead of the postgresql database and to use an in-memory cache instead of Redis. To run the full test suite locally:

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

The main project configs are in [hackathon_site/hackathon_site](hackathon_site/hackathon_site), including the main settings file [settings/\_\_init__.py](hackathon_site/hackathon_site/settings/__init__.py) and top-level URL config.

The [dashboard](hackathon_site/dashboard) app contains the React project for the inventory management and hardware sign-out platform.

The [event](hackathon_site/event) app contains the public-facing templates for the landing page.

The [registration](hackathon_site/registration) app contains models, forms, and templates for user registration, including signup and application templates. Since these templates are similar to the landing page, they may extend templates and use static files from the `event` app. 

### Templates and Static Files
Templates served from Django can be placed in any app. We use [Jinja 2](https://jinja.palletsprojects.com/en/2.11.x/) as our templating engine, instead of the default Django Template Language. Within each app, Jinja 2 templates must be placed in a folder called `jinja2/<app_name>/` (i.e., the full path will be `hackathon_site/<app_name>/jinja2/<app_name>/`). Templates can then be referenced in views as `<app_name>/your_template.html`.

Static files are placed within each app, in a folder named `static/<app_name>/` (same convention as templates). For example, SCSS files for the Event app may be in `hackathon_site/event/static/event/styles/scss/`. They can then be referenced in templates as `<app_name>/<path to static file>`, for example `event/styles/css/styles.css` (assuming the SCSS has been compiled to CSS).

To compile the SCSS automatically when you save, run following task running while you work:

```bash
$ cd hackathon_site
$ yarn run scss-watch
```
To compile all SCSS files at once, run:

```bash
$ yarn run scss
```

Django can serve static files automatically in development. In a production environment, static files must be collected:

```bash
$ python manage.py collectstatic
```

This will place static files in `hackathon_site/static/`. These must be served separately, for example using Nginx, as Django cannot serve static files in production. [Read more about how Django handles static files](https://docs.djangoproject.com/en/3.0/howto/static-files/).

## Using this Template
This repository is setup as a template. To read more about how to use a template and what a template repository is, see [GitHub's doc page](https://docs.github.com/en/github/creating-cloning-and-archiving-repositories/creating-a-repository-from-a-template).

Before you begin, note that the [main workflow file](https://github.com/ieeeuoft/hackathon-template/blob/develop/.github/workflows/main.yml) uses the `pull_request_target` trigger. This means that pull requests from forks will run workflows in the base branch, **and will have access to repository secrets**. For the base template repo, this is not a security concern since the only secret used in tests is `DJANGO_SECRET_KEY`, and is meaningless in this repository. However, an instance of this repository will likely have other secrets set. **Unless you are absolutely sure that code run by workflows for pull requests, such as tests, does not have access to important secrets, you should change this trigger type back to `pull_request`**. This means that pull requests from forks (of your fork) will not run actions. Alternatively, if tests only need access to secret keys so they don't complain, use a different secret in the workflow files for running tests.

### Forking
If you are interested in receiving updates to this template in your project, we recommend that you fork this repository into your own account or organization. This will give you the entire commit history of the project, and will allow you to make pull requests from this repository into your own to perform updates.

Unfortunately, GitHub does not allow you to fork your own repository. As a result, the forking option is not available to the owner account or organization. This means that IEEE UofT cannot use this template by forking it, and if you choose to fork your own generic copy of this template for instantiating, you will not be able to fork that fork.

Note: `develop` is our default branch, but it should not be considered the most stable branch. If you want only the most stable releases, we recommend that you apply your customizations on top of the `master` branch.

### From the Template
This is our recommended approach to instantiate this template, if forking is unavailable to you. In the end, this gives a similar result to [copying the repository](#copy-the-repository) (below), but maintains the "generated from ieeeuoft/hackathon-template" message on GitHub. If you don't care about that, then copying is simpler.

1. Create an instance of the template by clicking "Use this template". 
![image](https://user-images.githubusercontent.com/26036279/90323566-e153a100-df30-11ea-82b5-11a5effb1fd7.png)

    Note: By default, using a template creates a new repository based off only the default branch, which for this repository is `develop`. We recommend that you apply your customizations on top of the more stable `master` branch. To do so, make sure you check "Include all branches".

    Creating a repository from a template flattens all commits into a single initial commit. If you never plan on merging updates from the upstream template, you may proceed in customizing your instance from here and ignore all of the following steps.
    
2. Clone your new instance locally via the method of your choosing.

3. In order to pull history and updates, you will need to add the original template as a remote on the git repository. Note that this only happens on your cloned instance, changing remotes has no effect on the repository you created on GitHub.

    ```bash
    $ git remote add upstream git@github.com:ieeeuoft/hackathon-template.git
    ```

    If you do not have git configured to clone over SSH, you may use the HTTPS url instead: `https://github.com/ieeeuoft/hackathon-template.git`
    
4. Merge in whichever branch you would like to base your customizations off from upstream right away to get the history. For the rest of this example, we assume you are using `master`.
    
    ```bash
    $ git fetch upstream
    $ git merge upstream/master master --allow-unrelated-histories
    $ git push origin master
    ```
5. Use the repository as you see fit, by creating feature branches off of `master`. We recommend a [Gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

6. When you want to pull an update from the upstream template, we recommend merging it into a new branch so that you can review the changes, resolve any conflicts, and merge it into your base branch by a pull request for added visibility.

    ```bash
    $ git checkout master
    $ git checkout -b update-from-upstream-template    
    $ git fetch upstream
    $ git merge upstream/master update-from-upstream-template
    $ git push -u origin update-from-upstream-template
    ```
   
7. Make a PR on your repo to merge `update-from-upstream-template` into your base branch.

### Copy the Repository
This approach is very similar to using the template, but you lose the "generated from ..." text. You gain the added benefit of keeping the entire commit history of the repository, and not having to deal with fetching it upfront.

1. Import a new repository at [https://github.com/new/import](https://github.com/new/import). Set the old repository's clone URL to `https://github.com/ieeeuoft/hackathon-template.git`.

2. Clone your new instance locally via the method of your choosing.

3. Add the original template as a remote on the git repository.

    ```bash
    $ git remote add upstream git@github.com:ieeeuoft/hackathon-template.git
    ```

    If you do not have git configured to clone over SSH, you may use the HTTPS url instead: `https://github.com/ieeeuoft/hackathon-template.git`
    
4. Use the repository as you see fit, by creating feature branches off of `master`. We recommend a [Gitflow workflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow).

5. When you want to pull an update from the upstream template, we recommend merging it into a new branch so that you can review the changes, resolve any conflicts, and merge it into your base branch by a pull request for added visibility.

    ```bash
    $ git checkout master
    $ git checkout -b update-from-upstream-template    
    $ git fetch upstream
    $ git merge upstream/master update-from-upstream-template
    $ git push -u origin update-from-upstream-template
    ```
   
6. Make a PR on your repo to merge `update-from-upstream-template` into your base branch.

## Customization
This project was designed to be generic and customizable. At minimum, you will want to update templates to include your event's name and logo, but you may customize them to whatever degree you wish. See [file structure](#file-structure) for more details about templates.

Core event settings and constants, such as cutoff dates, are kept at the bottom of the [settings](hackathon_site/hackathon_site/settings/__init__.py) file. These settings can be imported and used in any view, form, or in general any other python file. See the [Django docs on settings](https://docs.djangoproject.com/en/3.1/topics/settings/#using-settings-in-python-code) to read more about how to use them.

Some settings you will definitely want to change are:
- `HACKATHON_NAME` - The name of your hackathon, for use in templates
- `DEFAULT_FROM_EMAIL` - This can be used in templates, and it will also be used by [Django's email system](https://docs.djangoproject.com/en/3.1/topics/email/))
- `CONTACT_EMAIL` - By default, the same as `DEFAULT_FROM_EMAIL`. The email users should contact you at, for use in templates
- `REGISTRATION_OPEN_DATE` - When registration opens
- `REGISTRATION_CLOSE_DATE` - When registration closes
- `EVENT_START_DATE` - When the event starts
- `EVENT_END_DATE` - When the event ends
- `MEDIA_ROOT` - The path on the server where user-uploaded files will end up, including resumes

You will also need to set the necessary settings for your email server, so that Django can send emails to users. [Read about those settings here](https://docs.djangoproject.com/en/3.1/topics/email/).

Near the top of the settings file, you must also set `ALLOWED_HOSTS` and `CORS_ORIGIN_REGEX_WHITELIST` for your domain.

For convenience, some constants have been passed into the context of all Jinja templates by default, so they can be used right away. See the [Jinja2 config file](hackathon_site/hackathon_site/jinja2.py) for full details.


### Branding and Styling
Both the Event App and Dashboard App are styled by seperate SCSS files found in their respective directories.
#### Event App
**Warning: Deleting items in `styles.css`, `_mixins.scss`, and `_variables.scss` will mess up styling throughout all template pages.** Please read the following carefully and make sure you know what you're doing when you're modifying the aforementioned files.

[Materialize](https://materializecss.com/) is the CSS framework that the Event App uses. Review their documentation to get a further understanding of how the template is styled.

In order to determine the original source of a class, class names in kebab notation are from Materialize and class names in camel case are found in `styles.scss`. We recommend you follow this convention when adding your own classes.

[SCSS mixins](https://sass-lang.com/documentation/at-rules/mixin) are stored in `_mixin.scss`. Currently, there are 2 mixin functions: `@mixin flexPosition` to be used if you want to style a class with CSS Flexbox and `@mixin responsive` to be used in place of Media Queries. If you are not familiar with mixins, example usages of both mixins are in `styles.scss`.

Color, font family, and font size variables are stored in `_variables.scss`. Edit the values in the map to customize for your hackathons branding. For further organization, the variables are stored into maps and called using [SCSS functions](https://sass-lang.com/documentation/at-rules/function). 

For example:
```
$fonts: (
    body: "Nunito",
    header: "Roboto",
); 

@function font($fonts-name) {
    @return map-get($fonts, $fonts-name); //(name of map, key)
}
```
Instead of calling...
```
h1 { font-family: $header; }
```
...you should get the `$header` variable through the `font` function:
```
h1 { font-family: font(header); }
```

## Deploying
This template may be deployed however you wish, we recommend you read [Django's documentation on deploying](https://docs.djangoproject.com/en/3.1/howto/deployment/). 

[Gunicorn](https://gunicorn.org/) is included in `requirements.txt` already, and deploying through gunicorn with a reverse proxy such as [Nginx](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/) is our recommended approach. The template is fully configured to be deployed under a subdirectory of your website through a reverse proxy, provided that the `SCRIPT_NAME` header is set. You may also set the path prefix explicitly in the settings file with [`FORCE_SCRIPT_NAME`](https://docs.djangoproject.com/en/2.2/ref/settings/#force-script-name).

### Serving static files
Static files are configured to be served under the `static/` path, and are expected to be in a folder called `static` in the django project root (adjacent to `manage.py`). In production, you should run `python manage.py collectstatic` to move all static files into the `static` folder, and configure your web server to serve them directly. Read more about [managing static files in Django in the docs](https://docs.djangoproject.com/en/3.1/howto/static-files/).

### Serving user uploaded files
User-uploaded files are handled differently in Django than static files. We recommend you read the pages on Django [file uploads](https://docs.djangoproject.com/en/3.1/topics/http/file-uploads/) and [the security of user-uploaded content](https://docs.djangoproject.com/en/3.1/topics/security/#user-uploaded-content-security) before proceeding.

This template is configured to expect user-uploaded content to be served at `media/`, per the `MEDIA_URL` setting (you are free to change this, for example to an off-domain URL). User-uploaded content will be put in the folder defined by `MEDIA_ROOT`, which defaults to `/var/www/media/` and should almost certainly be configured for your server. Whatever you set it to, make sure the folder exists and is accessible by Django.

Some user-uploaded content, such as resumes, should not be served to the general public. Others, such as pictures of hardware, should be. Hence, we recommend the following:

- Upload all public-facing files with the prefix `uploads/`, so that they end up at `media/uploads/`. Configure your web server to serve this folder, e.g. `/var/www/media/uploads/`, to `media/uploads/` under your domain.
- Upload all private files to another prefix, e.g. `resumes/`, so that they end up at e.g. `media/resumes/`. For any users that should be able to see these files (such as staff members in this case), have a view that validates the user's permission, then reads in the data from disk and returns it directly in the HTTP response. Keep in mind that there are performance downsides to this approach.
