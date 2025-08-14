# IEEE Hackathon Website Template

A comprehensive, customizable website template for hackathons run by [IEEE University of Toronto Student Branch](https://ieee.utoronto.ca/). This template provides a complete solution for hackathon management, including registration, hardware sign-out systems, and administrative dashboards.

## IEEE Web Team 2025-2026

#### Directors

- Aaron Gu
- Ashwin Santhosh

#### Advisors

- Mustafa Abdulrahman
- Carmen Chau

#### Associates

- Wahib Barqawi
- Aidan Tran
- Warrick Tsui

## 🚀 Quick Start

For a streamlined setup experience, see our [Onboard.md](Onboard.md) for a quick start guide.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
  - [Environment Setup](#environment-setup)
  - [Database & Cache Services](#database--cache-services)
  - [Running the Application](#running-the-application)
- [Development](#development)
  - [Creating Users](#creating-users)
  - [Testing](#testing)
  - [Static Files & Styling](#static-files--styling)
- [Project Structure](#project-structure)
- [Using This Template](#using-this-template)
  - [Forking](#forking)
  - [From Template (Recommended)](#from-template-recommended)
  - [Copy Repository](#copy-repository)
- [Customization](#customization)
  - [Event Configuration](#event-configuration)
  - [Branding & Styling](#branding--styling)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

- **Public Landing Page**: Customizable event landing page with registration
- **User Registration System**: Complete user management with email verification
- **Hardware Sign-Out System (HSS)**: React-based inventory management dashboard
- **Admin Dashboard**: Django admin interface for event management
- **Email Integration**: Automated email notifications and confirmations
- **File Upload System**: Secure handling of resumes and other documents
- **Team Management**: Support for team-based hackathons
- **Responsive Design**: Mobile-friendly interface using Material-UI
- **API Integration**: RESTful API for frontend-backend communication

## 🏗️ Architecture

This project uses a modern full-stack architecture:

- **Backend**: Django 3.2 with Django REST Framework
- **Frontend**: React 16 with TypeScript and Material-UI
- **Database**: PostgreSQL 12.2
- **Cache**: Redis 6
- **Templating**: Jinja2 (instead of Django templates)
- **Styling**: SCSS with Materialize CSS framework
- **Containerization**: Docker & Docker Compose for development

## 📋 Prerequisites

Before setting up the project, ensure you have the following installed:

- **Python 3.9** (required - specified in environment.yml)
- **Docker** & **Docker Compose** - [Installation Guide](https://docs.docker.com/get-docker/)
- **Node.js v16** - Required for the React frontend
- **Conda** (recommended) or **Miniconda** - [Installation Guide](https://docs.conda.io/en/latest/miniconda.html)

## 🛠️ Installation & Setup

### Environment Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd hackathon-template
   ```

2. **Create and activate the conda environment**:

   ```bash
   conda env create -f environment.yml
   conda activate ieee-template
   ```

3. **Set required environment variables**:

   ```bash
   conda env config vars set SECRET_KEY=your-secret-key-here
   conda env config vars set DEBUG=1
   conda env config vars set REACT_APP_DEV_SERVER_URL=http://localhost:8000
   ```

4. **Reactivate the environment**:
   ```bash
   conda deactivate
   conda activate ieee-template
   ```

### Database & Cache Services

The project uses PostgreSQL and Redis, which are managed via Docker:

1. **Start the services**:

   ```bash
   docker compose -f development/docker-compose.yml up -d
   ```

2. **Apply database migrations**:

   ```bash
   cd hackathon_site
   python manage.py migrate
   ```

3. **Stop services** (when needed):
   ```bash
   docker compose -f development/docker-compose.yml down
   ```

**Note**: The PostgreSQL container uses trust authentication for development convenience. Never store sensitive data in the local development database.

### Running the Application

1. **Compile SCSS assets**:

   ```bash
   yarn run scss
   ```

2. **Start the Django development server** (main site):

   ```bash
   python manage.py runserver
   ```

3. **Start the Hardware Sign-Out System** (in a separate terminal):

   ```bash
   conda activate ieee-template
   cd hackathon_site/dashboard/frontend
   nvm use 16  # If using nvm
   yarn run start
   ```

4. **Access the applications**:
   - Main site: http://localhost:8000
   - HSS Dashboard: http://localhost:3000
   - Admin interface: http://localhost:8000/admin

## 💻 Development

### Creating Users

1. **Create a superuser**:

   ```bash
   python manage.py createsuperuser
   ```

2. **Add additional users** via the admin interface at http://localhost:8000/admin

3. **User profiles**: Create profiles for accepted/waitlisted participants through the admin interface

### Testing

#### Django Tests

```bash
cd hackathon_site
python manage.py test --settings=hackathon_site.settings.ci
```

#### React Tests

```bash
cd hackathon_site/dashboard/frontend
yarn test
```

### Static Files & Styling

#### SCSS Compilation

- **Compile once**: `yarn run scss`
- **Watch for changes**: `yarn run scss-watch`

#### Static File Management

- **Development**: Django serves static files automatically
- **Production**: Run `python manage.py collectstatic` to collect files

## 📁 Project Structure

```
hackathon-template/
├── hackathon_site/                 # Main Django project
│   ├── dashboard/                  # React frontend app
│   │   └── frontend/              # React application
│   ├── event/                     # Public landing page templates
│   ├── registration/              # User registration system
│   ├── hardware/                  # Hardware management models
│   ├── review/                    # Application review system
│   └── hackathon_site/           # Project settings & config
├── development/                   # Development Docker setup
├── deployment/                    # Production deployment configs
└── environment.yml               # Conda environment specification
```

### Key Components

- **`dashboard/`**: React-based hardware sign-out system with Material-UI
- **`event/`**: Public-facing templates using Jinja2 and Materialize CSS
- **`registration/`**: User registration, application forms, and email templates
- **`hardware/`**: Database models for inventory management
- **`review/`**: Application review and decision management

## 🔧 Using This Template

This repository is configured as a GitHub template. Choose the method that best suits your needs:

### Forking (Recommended for Updates)

If you want to receive updates from the original template:

1. Fork this repository to your account/organization
2. Clone your fork locally
3. Add the original as upstream:
   ```bash
   git remote add upstream git@github.com:ieeeuoft/hackathon-template.git
   ```

**Note**: GitHub doesn't allow forking your own repository, so this option isn't available to the original owners.

### From Template (Recommended for New Projects)

1. Click "Use this template" on GitHub
2. Check "Include all branches" for complete history
3. Clone your new repository
4. Add upstream remote for future updates

### Copy Repository

1. Use GitHub's import feature at https://github.com/new/import
2. Set source URL to: `https://github.com/ieeeuoft/hackathon-template.git`
3. Clone and add upstream remote

## 🎨 Customization

### Event Configuration

Key settings are located in `hackathon_site/hackathon_site/settings/__init__.py`:

```python
# Essential settings to customize
HACKATHON_NAME = "Your Hackathon Name"
DEFAULT_FROM_EMAIL = "your-email@domain.com"
CONTACT_EMAIL = "contact@domain.com"
REGISTRATION_OPEN_DATE = datetime(2024, 1, 1)
REGISTRATION_CLOSE_DATE = datetime(2024, 2, 1)
EVENT_START_DATE = datetime(2024, 3, 1)
EVENT_END_DATE = datetime(2024, 3, 3)
```

### Branding & Styling

#### Event App Styling

- **Framework**: Materialize CSS
- **SCSS Files**: Located in `hackathon_site/event/static/event/styles/scss/`
- **Key Files**:
  - `styles.scss`: Main stylesheet
  - `_variables.scss`: Colors, fonts, and sizes
  - `_mixins.scss`: Reusable SCSS mixins

#### Dashboard App Styling

- **Framework**: Material-UI (MUI)
- **Location**: `hackathon_site/dashboard/frontend/src/`

#### Customization Guidelines

- **Colors & Fonts**: Edit maps in `_variables.scss`
- **Responsive Design**: Use the `@mixin responsive` mixin
- **Flexbox Layouts**: Use the `@mixin flexPosition` mixin

## 🚀 Deployment

### Recommended Stack

- **WSGI Server**: Gunicorn (included in requirements.txt)
- **Reverse Proxy**: Nginx
- **Database**: PostgreSQL
- **Cache**: Redis

### Production Checklist

1. Set `DEBUG = False` in settings
2. Configure `ALLOWED_HOSTS` and `CORS_ORIGIN_REGEX_WHITELIST`
3. Set up email server configuration
4. Configure `MEDIA_ROOT` for file uploads
5. Run `python manage.py collectstatic`
6. Set up proper SSL certificates

### File Serving Strategy

- **Public files**: Serve from `media/uploads/` via web server
- **Private files**: Serve through Django views with permission checks
- **Static files**: Serve from `static/` directory via web server

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `python manage.py test` and `yarn test`
5. Submit a pull request

### Code Style

- **Python**: Black formatter (included in environment)
- **JavaScript/TypeScript**: Prettier (configured in package.json)
- **SCSS**: Follow existing patterns in `_variables.scss` and `_mixins.scss`

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Material-UI Documentation](https://mui.com/)
- [Materialize CSS Documentation](https://materializecss.com/)
- [Docker Documentation](https://docs.docker.com/)

## 📄 License

This project is licensed under the terms specified in [LICENSE.md](LICENSE.md).

---

For quick setup instructions, see [Onboard.md](Onboard.md).
