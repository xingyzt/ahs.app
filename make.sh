duration=$1
while true
do
	git fetch --all
	git reset --hard origin/main

	bash bin/index.sh > public/index.html
	yui-compressor bin/style.css -o public/style.css
	terser --compress --mangle --toplevel bin/script.js -o public/script.js

	firebase deploy
	sleep ${duration}
done
