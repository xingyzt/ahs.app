build:
	sh build.sh
deploy: build
	firebase deploy
host: build
	python3 server.py 8000
