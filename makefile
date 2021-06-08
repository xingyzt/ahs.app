build:
	sh build.sh
deploy: build
	cp -r dist/* /var/www/html/	
host: build
	python3 server.py 8000
