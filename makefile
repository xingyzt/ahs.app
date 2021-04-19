build:
	sh build.sh
deploy: build
	firebase deploy
