git fetch --all
git reset --hard origin/main
bash index.sh > index.html
cd ..
firebase deploy
