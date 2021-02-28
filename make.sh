duration=$1
while true
do
	git fetch --all
	git reset --hard origin/main

	mkdir public
	bash bin/index.sh > public/index.html
	yui-compressor bin/style.css -o public/style.css
	terser --compress --mangle --toplevel bin/script.js -o public/script.js
	cp bin/icon.png public/icon.png

	firebase deploy
	sleep ${duration}
done
