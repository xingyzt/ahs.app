mkdir -p dist

cd src
	bash index.sh >	../dist/index.html
	cat css/* > ../dist/index.css
	cat js/* > ../dist/index.js
	cp media/* ../dist/
cd ..