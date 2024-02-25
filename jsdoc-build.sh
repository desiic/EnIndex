#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi
echo "Deprecated, use DevOps"
exit

if [[ ! -f doc-conf/jsdoc.json ]]; then
    echo "Error: Config file ./doc-conf/jsdoc.json not found!"
    exit  
fi

# Remove old dirs
rm -rf doc-src
rm -rf doc

# Create new source dir for JSDoc
mkdir doc-src

# Add files
cp -f  src/eidb.js doc-src 
cp -rf src/eidb    doc-src

# Make documentation
# npm install docdash
# npm install clean-jsdoc-theme

# Disable sorting in template to keep source code in sections
# https://github.com/jsdoc/jsdoc/issues/428#issue-14846165
echo "Disabling sort in template..."
cd doc-themes/clean-jsdoc-theme-modded

if [[ ! -f publish.bak.js ]]; then
    cp -f publish.js publish.bak.js
fi
perl -pi -e $'s|data.sort\(\'longname, version, since\'\);|// No sort|g' publish.js
cd ../..

# jsdoc.json theme_opts:
# "sections": ["Modules"],
# "include_css": ["./doc-conf/jsdoc-custom.css"],
# "include_js":  ["./doc-conf/jsdoc-custom.js"]

echo -e "\nBuilding doc..."
# jsdoc -c doc-conf/jsdoc.json -t doc-themes/clean-jsdoc-theme-modded -R README.md \
# jsdoc -c doc-conf/jsdoc.json -t doc-themes/clean-jsdoc-theme -R README.md \
jsdoc -c doc-conf/jsdoc.json -R README.md \
    -r doc-src -d doc

# # Add custom CSS (docdash only, already in jsdoc.json for clean-jsdoc-theme)
echo -e $'\n'                  >>doc/styles/jsdoc-default.css
cat  doc-conf/jsdoc-custom.css >>doc/styles/jsdoc-default.css

# # Add custom CSS (docdash only, already in jsdoc.json for clean-jsdoc-theme)
# echo -e $'\n'         >>doc/styles/jsdoc.css
# cat  jsdoc-custom.css >>doc/styles/jsdoc.css
# EOF