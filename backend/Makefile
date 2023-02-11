.PHONY: help build build-local
.DEFAULT_GOAL := help

build: ## build docker image for production
	docker image build -t s3-cicd-test-app:latest --targat deploy -e API_ENV=production CORS_PERMIT=http://react-cicd-test-cjadiop.s3-website-ap-northeast-1.amazonaws.com API_PORT=80 ./
build-local: ## build docker image for local
	docker image build -t s3-cicd-test-app-local:latest --targat deploy ./
run: ## run container for local docker image
	docker container run -p 8000:8000 s3-cicd-test-app:latest
help: ## Show options
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'