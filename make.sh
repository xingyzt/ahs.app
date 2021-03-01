duration=$1
while true
do
	git fetch --all
	git reset --hard origin/editor

	mkdir public
	cd dist
		bash index.sh > ../public/index.html
		yui-compressor style.css -o ../public/style.css
		terser --compress --mangle --toplevel script.js -o ../public/script.js
		cp icon.png ../public/icon.png
	cd ..

	firebase deploy
	sleep ${duration}
done
