#!/bin/bash
set +ex

if [[ $BASH_SOURCE != $0 ]]; then
    echo "Don't source this file, Bash it."
    return
fi

# HTTP only:
# python3 -m http.server 8080

# HTTPS (for Web Crypto to work)
# Server, ref: https://stackoverflow.com/a/56503260/5581893
# Cert install on Windows (optional): certmgr.msc
python3 <<HEREDOC
from http.server import HTTPServer,SimpleHTTPRequestHandler 
import ssl

# Port: https://stackoverflow.com/a/32478278/5581893
port=8443 
httpd = HTTPServer(("localhost",port), SimpleHTTPRequestHandler)

httpd.socket = ssl.wrap_socket(
    httpd.socket,
    keyfile     = "localhost.priv.pem",
    certfile    = "localhost.cert.pem",
    server_side = True
)

print(f"HTTPS serving at port {port}...")
httpd.serve_forever()
HEREDOC
# EOF