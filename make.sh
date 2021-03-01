mkdir -p dist

cd src
	bash index.sh >	../dist/index.html
	cp style.css	../dist/style.css
	cp script.js	../dist/script.js
	cp icon.png	../dist/icon.png
cd ..