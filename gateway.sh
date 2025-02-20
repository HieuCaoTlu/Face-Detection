gateway=$(ip route | awk '/default/ {print $3; exit}')
echo "{ \"gateway\": \"$gateway\" }" > backend/gateway.json