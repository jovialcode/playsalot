DEV_PROJECT_NAME ?= playsalot
PROD_PROJECT_NAME ?= playsalot-prod
DEV_COMPOSE = docker compose --env-file deploy/dev/.env -f deploy/dev/docker-compose.yml -p $(DEV_PROJECT_NAME)
PROD_COMPOSE = docker compose --env-file deploy/prod/.env -f deploy/prod/docker-compose.yml -p $(PROD_PROJECT_NAME)

.PHONY: help dev-env db-up db-down dev-up dev-down dev-logs prod-up prod-down prod-logs

help:
	@echo "make db-up       Start PostgreSQL for local development (port 5432)"
	@echo "make db-down     Stop local PostgreSQL"
	@echo "make dev-up      Build and start all development services"
	@echo "make dev-down    Stop all development services"
	@echo "make dev-logs    Follow development logs"
	@echo "make prod-up     Build and start production services"
	@echo "make prod-down   Stop production services"
	@echo "make prod-logs   Follow production logs"

# Keeps an existing local configuration intact. The generated values in the
# example file are for local development only; replace them before deployment.
dev-env:
	@test -f deploy/dev/.env || cp deploy/dev/.env.example deploy/dev/.env

db-up: dev-env
	$(DEV_COMPOSE) up -d postgres

db-down:
	$(DEV_COMPOSE) stop postgres

dev-up: dev-env
	$(DEV_COMPOSE) up -d --build

dev-down:
	$(DEV_COMPOSE) down

dev-logs:
	$(DEV_COMPOSE) logs -f

prod-up:
	@test -f deploy/prod/.env || (echo "Create deploy/prod/.env from .env.example first."; exit 1)
	$(PROD_COMPOSE) up -d --build

prod-down:
	$(PROD_COMPOSE) down

prod-logs:
	$(PROD_COMPOSE) logs -f
