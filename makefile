build: download build-cache
	:

build-cache:
	sh build.sh

download:
	curl -ZL "db.ahs.app/{locationIDs,locations,categories,snippets,weekIDs,weeks,scheduleIDs,schedules,covid-dashboard}.json" -o "/tmp/#1.json"

archives:
	sh archives.sh

deploy: build
	firebase deploy

host: build
	python3 server.py 8000

update:
	git pull
