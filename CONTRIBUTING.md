# Contributing to IEEE UofT's Hackathon Website Template
Contributions are welcome, both from members of IEEE UofT and those externally. While this template is made to suit our event needs, we welcome others to use and contribute to it as well.

## Development Process
We aim to follow a workflow similar to [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) where practical.

Our primary branch for merging changes is `develop`. The `master` branch represents a stable release of the template we are confident with people using in production, but you are welcome to get the latest features from `develop`.

### Adding a New feature
New features (anything from new pages to just code style tweaks) should be done in branches off of `develop`.
```bash
$ git checkout develop
$ git pull origin develop
$ git checkout -b my_new_feature
```

Changes should be made on your new branch and tested locally, with changes committed as you work. Before committing files, we recommend you run `git status` to check what has been modified, and potentially `git diff` to dig into things, to make sure you aren't committing files you don't want. After that, add your files to a commit with one of:
```bash
$ git add my_new_file.py  # Add an individual file
$ git add my_new_directory/  # Add an entire directory
$ git add .  # Add the entire current working directory - use with caution
```

Commits should be given a descriptive message of the changes made. If your description is short (80 characters or less), you can include the message from the command line:
```bash
$ git commit -m "Added some cool files"
```

If your message is longer or you would like to provide additional details, then simply run `git commit`. This will open up your system default text editor, where you can type a short (80 characters or less) title on the first line, then type a descriptive message on subsequent lines.

Once you are ready for others to see your changes, you should push them to GitHub. If you are a member of IEEE UofT, you can be granted limited push access to this repository, otherwise [create a fork](https://help.github.com/en/github/getting-started-with-github/fork-a-repo).
```bash
$ git push -u origin my_new_feature
```

### Pull Requests
Once your changes have been pushed, [create a pull request](https://github.com/ieeeuoft/hackathon-template/compare) with your changes into the `develop` branch. Give a descriptive title, and a description of the changes __including__ how to test them.

Pull requests must be approved by members of the IEEE UofT web team. Reviewers must carefully read through all the changes made, and run them locally. They will add comments to your pull request with any changes they'd like to see or suggestions they have. 

Once your pull request has been approved, our policy is that the **members of IEEE UofT should merge their own pull requests** as a final sign off on the changes. Pull requests from outside will be merged by a member of our team. Merges into `develop` should only be done with the "Squash and Merge" button.

## Code Formatting
### Python
All python code submitted must be formatted with [Black](https://github.com/psf/black) using default settings for consistency and sanity. Black is an opinionated superset of PEP-8 that may do things you don't like, but these are necessary tradeoffs to have clean, readable, and consistent code.