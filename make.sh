duration="&0"
while true
do
	git fetch --all
	git reset --hard origin/main
	bash index.sh > public/index.html
	firebase deploy
	sleep << $duration
done
