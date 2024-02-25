#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi
echo "Deprecated, use DevOps"
exit

git checkout dev; 
git pull; git add -A; git commit -a -m Msg; git push

git checkout main; 
git pull; git merge dev --no-edit; git add -A; git commit -a -m Msg; git push

git checkout dev
# EOF