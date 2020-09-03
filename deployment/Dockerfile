FROM python:3.8-buster

# Set working directory
WORKDIR /usr/src/hackathon_site

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install dependencies
RUN apt-get update && apt-get install -y postgresql-client

RUN pip install --upgrade pip
COPY hackathon_site/requirements.txt /usr/src/hackathon_site/requirements.txt
RUN pip install -r /usr/src/hackathon_site/requirements.txt

# Copy app
COPY hackathon_site/ /usr/src/hackathon_site/

# Copy entrypoint
COPY deployment/entrypoint.sh /usr/src/entrypoint.sh
RUN chmod +x /usr/src/entrypoint.sh
ENTRYPOINT ["/usr/src/entrypoint.sh"]
