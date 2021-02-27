duration=$1
while true
do
	git fetch --all
	git reset --hard origin/main
	bash index.sh > public/index.html
	yui-compressor style.css > style.css
	yui-compressor script.js > script.js
	firebase deploy
	sleep ${duration}
done
