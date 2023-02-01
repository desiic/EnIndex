#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi

echo "Installing JSDoc..."
sudo npm i -g jsdoc

echo -e "\nInstalling Terser..."
sudo npm i -g terser
echo "Done."
# EOF