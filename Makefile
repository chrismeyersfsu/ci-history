build:
	docker build -t chrismeyers/cihistory:latest -f ./tooling/Dockerfile ./
	docker build -t chrismeyers/cihistory-webpack:latest -f ./tooling/Dockerfile.webpack ./

dev:
	cd tooling && docker-compose run -e CI_HISTORY_DEV=True --service-ports cihistory /bin/bash -c "source /venv/server/bin/activate && cd /devel/server/api/ && env FLASK_DEBUG=1 FLASK_APP=main.py FLASK_RUN_PORT=3000 flask run -h 0.0.0.0"

dev-test:
	cd tooling && docker-compose run -e CI_HISTORY_DEV=True --service-ports cihistory /bin/bash -c "source /venv/parser/bin/activate && cd /devel/api/ && /bin/bash"
