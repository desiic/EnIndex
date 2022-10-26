#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi
if [[ ! -f jsdoc.json ]]; then
    echo "No jsdoc.json found in current dir!"
    exit  
fi

# Remove old dirs
rm -rf doc-src
rm -rf doc

# Create new source dir for JSDoc
mkdir doc-src

# Add files
cp -f  enindex.js doc-src 
cp -rf modules    doc-src

# Make documentation
jsdoc -c jsdoc.json -r doc-src -d doc
# EOF