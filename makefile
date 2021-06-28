build: download cache-build
	:

build-cache:
	sh build.sh

download:
	curl -ZL "db.ahs.app/{locationIDs,locations,categories,snippets,weekIDs,weeks,scheduleIDs,schedules}.json" -o "/tmp/#1.json"

archives:
	sh archives.sh

deploy: build
	cp -RT dist /var/www/ahs.app

host: build
	python3 server.py 8000

update:
	git pull
