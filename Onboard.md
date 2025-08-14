# IEEE Hackathon Website Template

A customizable website template for hackathons run by [IEEE University of Toronto Student Branch](https://ieee.utoronto.ca/).

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

---

## Quick Start Guide

### 1. Install Prerequisites

- Python 3.9
- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js v16

### 2. Setup Environment

```bash
# Create and activate conda environment
conda env create -f environment.yml
conda activate ieee-template

# Set required environment variables
conda env config vars set SECRET_KEY=123
conda env config vars set DEBUG=1
conda env config vars set REACT_APP_DEV_SERVER_URL=http://localhost:8000

# Reactivate environment
conda deactivate
conda activate ieee-template
```

### 3. Start Services

```bash
# Launch database and cache
docker compose -f development/docker-compose.yml up -d

# Apply database migrations
cd hackathon_site
python manage.py migrate
```

### 4. Build Assets

```bash
# Compile SCSS to CSS
yarn install
yarn run scss

# Watch for SCSS changes (optional)
yarn run scss-watch
```

### 5. Run Development Servers

```bash
# Start Django server (main site)
python manage.py runserver

# In separate terminal - Start Hardware Signout System (HSS)
conda activate ieee-template
cd hackathon_site/dashboard/frontend
nvm use 16
yarn install
yarn run start
```

### 6. Access

- Main site: http://localhost:8000

- HSS: http://localhost:3000

- Admin: http://localhost:8000/admin
