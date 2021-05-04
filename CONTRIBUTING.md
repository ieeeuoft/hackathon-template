# Contributing to IEEE UofT's Hackathon Website Template
Contributions are welcome, both from members of IEEE UofT and those externally. While this template is made to suit our event needs, we welcome others to use and contribute to it as well.

## Development Process
We aim to follow a workflow similar to [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) where practical.

Our primary branch for merging changes is `develop`. The `master` branch represents a stable release of the template we are confident with people using in production, but you are welcome to get the latest features from `develop`.

### Issues
All substantial work should relate to something tracked in the [issues](https://github.com/ieeeuoft/hackathon-template/issues). Issues can be created by anyone. They should be given a description description detailing the bug, proposed feature, suggestion, or other issue subject. Tickets should be tagged with the appropriate label - if you are unsure which label is appropriate, you can omit labels and let a maintainer add them. Minor changes like fixing typos can be made into a pull request directly without needing an issue.

Bug tickets should have a detailed description about the unintended behaviour, how to reproduce it, what the expected behaviour is, and optionally what the solution is if it is obvious in advance. Feature suggestions should have a clear need or justification, acceptance criteria if applicable, references to which part of the repository is being modified (docs, review app, registration app, etc), and optionally mockups. If a feature request is being made from someone external to IEEE UofT, please wait for a discussion with a maintainer in the issues comments before spending time implementing it.

### Claiming an Issue
If an issues is unassigned, you are welcome to leave a comment that you would like to work on it. If you don't hear from the issue creator in a reasonable amount of time, please @ a maintainer and we will assign it to you if you have a good plan. If an issue has been claimed but has been inactive for a few weeks, and there is no response from the ticket author or assignee in a reasonable amount of time, mention a maintainer as well and it can be assigned to you. 

### Making Changes
Members of the core IEEE UofT webmasters team have access to push new branches directly to the template repository. External contributors must first [make a fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo) of this repository into their personal github account, push branches off `develop` there, and make pull requests into the base repository. Make sure that your `develop` branch is up to date with the base repository before making a branch.

Any changes (anything from new pages to just code style tweaks) should be done in branches off of `develop`. As above, all changes should relate to an issue, but minor things like typo fixes can be done without making an issue first. When you create a branch, start the branch name with the issue number followed by a hyphen, and then a (very short) description of the changes. For example, `123-make-everything-blue`.
```bash
$ git checkout develop
$ git pull origin develop
$ git checkout -b 123-make-everything-blue
```

Changes should be made on your new branch and tested locally, with changes committed as you work. Before committing files, we recommend you run `git status` to check what has been modified, and potentially `git diff` to dig into things, to make sure you aren't committing files you don't want. After that, add your files to a commit with one of:
```bash
$ git add my_new_file.py  # Add an individual file
$ git add my_new_directory/  # Add an entire directory
$ git add .  # Add the entire current working directory - use with caution
```

Commits should be given a descriptive message of the changes made. If your description is short (50 characters or less), you can include the message from the command line:
```bash
$ git commit -m "Added some cool files"
```

If your message is longer or you would like to provide additional details, then simply run `git commit`. This will open up your system default text editor, where you can type a short (50 characters or less) title on the first line, then type a descriptive message on subsequent lines.

Once you are ready for others to see your changes, you should push them to GitHub. If you are a member of IEEE UofT, you can be granted limited push access to this repository, and can open a pull request directly from your branch into `develop`. External contributors must make the pull request from their forked repository.
```bash
$ git push -u origin my_new_feature
```

### Pull Requests
Once your changes have been pushed, [create a pull request](https://github.com/ieeeuoft/hackathon-template/compare) with your changes into the `develop` branch. Give a descriptive title, and a description of the changes __including__ how to test them. Fill out everything in the pull request template, being as descriptive as possible and using appropriate markdown code formatting where necessary.

Pull requests must be approved by members of the IEEE UofT web team. Reviewers must carefully read through all the changes made, and run them locally. They will add comments to your pull request with any changes they'd like to see or suggestions they have. 

Pull requests must also pass the checks in our [CI workflow](https://github.com/ieeeuoft/hackathon-template/blob/develop/.github/workflows/main.yml). These include unit tests and code formatting checks. If a CI run fails for your pull request, please see why and make the necessary changes. A reviewer may not look at your pull request until checks are passing, unless you ask for help or feedback on something that's a work in progress.

Once your pull request has been approved, our policy is that the **members of IEEE UofT should merge their own pull requests** as a final sign off on the changes. Pull requests from outside will be merged by a member of our team. Merges into `develop` should only be done with the "Squash and Merge" button.

#### Checking Out Pull Requests
For pull requests with branches committed directly to the repository, a regular `git checkout <branch name>` will work. Since branches should follow the above naming guidelines, this is usually as easy as doing `git pull` followed by `git checkout <issue number>-<TAB>`.

 For pull requests from external repositories, you can still check them out from the main repository using the pull request number. For pull request `123`, do:
 ```bash
$ git fetch origin pull/123/head:pull/123
$ git checkout pull/123
```

If you need to pull the latest changes from a pull request branch, run the `git fetch ...` line again, or set the upstream for the branch.

## Code Formatting
### Python
All python code submitted must be formatted with [Black](https://github.com/psf/black) using default settings for consistency and sanity. Black is an opinionated superset of PEP-8 that may do things you don't like, but these are necessary tradeoffs to have clean, readable, and consistent code.

### JavaScript and SCSS
JavaScript and SCSS files must be formatted with [Prettier](https://prettier.io/), using the settings defined in our package.json files. There are two of these: One for the [react portion of the site](https://github.com/ieeeuoft/hackathon-template/blob/develop/hackathon_site/dashboard/frontend/package.json), and one for [files used in Jinja templates](https://github.com/ieeeuoft/hackathon-template/blob/develop/hackathon_site/package.json). In both cases, first run `yarn install` to install the necessary packages. For the React side, you can then run `yarn prettier --write **/*.(js|scss)` to format everything in the current directory (that syntax may not work on Windows, if so run the command separately for `js` and `scss` extensions). For files used in Jinja templates, run `yarn prettier` from the root `hackathon_site` project folder.

### Jinja2 Templates
Unfortunately, there is no formatter for Jinja2 templates that we know of. If you write or know of one, please let us know! In the meantime, exercise sensible formatting when modifying Jinja templates. We may ask you to change the formatting if it is inconsistent with the rest of the file.

## Suggestions for First Time Contributors
The first thing to do is make sure you can run the project locally. Follow the [Getting Started](https://github.com/ieeeuoft/hackathon-template#getting-started) section of the main readme for more details. Before you start, make sure you have [Docker](https://docs.docker.com/get-docker/) and  [Docker Compose](https://docs.docker.com/compose/install/) installed, as well as a compatible Python version.

The first time you launch the Django development server, the site will probably have a pink nav bar at the top. We use SCSS for our stylesheets, which must first be compiled to CSS. To do that, run the following:
```bash
$ cd hackathon_site
$ yarn install
$ yarn run scss
```

If you don't have yarn installed, you can use `npm` in its place for these commands. SCSS files will be compiled into CSS and placed in the appropriate directory. When you refresh the page (you may need to clear your cache first), the navbar should now be purple indicating the styles were loaded successfully.

If you are on Windows, certain pages (including the landing page) may crash because of unix-specific date format strings we use. At the moment, our only suggestion is to build a Docker container to run the site, or install Linux. We do not plan on fully supporting running the site on Windows, since we expect all deployments to run in a Unix environment.

If you are making any changes that involve the registration system, you will probably need to change the default registration close date to something in the future. This can be done by changing the `REGISTRATION_CLOSE_DATE` setting in the [Django settings file](https://github.com/ieeeuoft/hackathon-template/blob/develop/hackathon_site/hackathon_site/settings/__init__.py#L257). Please do not commit this particular change.