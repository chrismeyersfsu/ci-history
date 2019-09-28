build:
	docker build -t chrismeyers/cihistory:latest -f ./tooling/Dockerfile ./

dev:
	cd tooling && docker-compose run -e CI_HISTORY_DEV=True --service-ports cihistory /bin/bash -c "source /venv/parser/bin/activate && cd /devel/api/ && npx nodemon"

dev-test:
	cd tooling && docker-compose run -e CI_HISTORY_DEV=True --service-ports cihistory /bin/bash -c "source /venv/parser/bin/activate && cd /devel/api/ && /bin/bash"
