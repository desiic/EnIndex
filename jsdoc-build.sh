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
cp -f  eidb.js doc-src 
cp -rf eidb    doc-src

# Make documentation
# npm install docdash
npm install clean-jsdoc-theme

# Disable sorting in template to keep source code in sections
# https://github.com/jsdoc/jsdoc/issues/428#issue-14846165
echo -e "\nDisabling sort in template..."
cd node_modules/clean-jsdoc-theme

if [[ ! -f publish.bak.js ]]; then
    cp -f publish.js publish.bak.js
fi
perl -pi -e $'s|data.sort\(\'longname, version, since\'\);|// No sort|g' publish.js
cd ../..

echo -e "\nBuilding doc..."
jsdoc -c jsdoc.json -t node_modules/clean-jsdoc-theme -R README.md \
    -r doc-src -d doc

# # Add custom CSS (docdash only)
# echo -e $'\n'         >>doc/styles/jsdoc.css
# cat  jsdoc-custom.css >>doc/styles/jsdoc.css
# EOF