#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi

if [[ ! -f build.sh ]]; then
    echo "Run build.sh in its directory."
    exit
fi

if [[ ! -d ./dist ]]; then
    mkdir dist
else
    rm -rf ./dist
fi

echo "Minifying files..."
Jsfiles=$(find ./src -depth | grep -E '.js$')

for Jsfile in ${Jsfiles[@]}; do
    echo -e "Minifying $Jsfile..."
    Outfile=$(echo $Jsfile | perl -pe $'s/\/src/\/dist/g')
    mkdir -p $Outfile

    if [[ -d $Outfile ]]; then
        rm -d $Outfile
    fi
    
    terser $Jsfile -m -c -o $Outfile
done
# EOF