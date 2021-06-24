build:
	sh build.sh
archives:
	sh archives.sh
deploy: build
	cp -r dist/* /var/www/ahs.app/	
host: build
	python3 server.py 8000
update:
	git pull
