duration=$1
while true
do
	git fetch --all
	git reset --hard origin/main
	bash index.sh > public/index.html
	yui-compressor public/style.css -o public/style.css
	firebase deploy
	sleep ${duration}
done
