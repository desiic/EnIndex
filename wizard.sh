echo "1. Pack"
echo "2. Pack Dev"
read -p "Enter a choice (1..2): " Choice
echo

if [[ $Choice == 1 ]]; then
    bash pack.sh
elif [[ $Choice == 2 ]]; then
    bash pack.sh dev
else
    echo "No such choice"
fi
# EOF