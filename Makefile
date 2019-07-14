build:
	docker build -t chrismeyers/cihistory:latest -f ./Dockerfile .

devel:
	docker-compose run cihistory /bin/bash -c "source /venv/parser/bin/activate && cd /devel/ && /bin/bash"
