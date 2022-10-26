#!/bin/bash
set +ex

git checkout dev; 
git pull; git add -A; git commit -a -m Msg; git push

git checkout main; 
git pull; git merge dev; git add -A; git commit -a -m Msg; git push

git checkout dev
# EOF