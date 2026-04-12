#!/bin/bash
# Start the Remindrr data server (keeps invoices synced for the reminder engine)
# Run: bash start-server.sh
cd "$(dirname "$0")"
node data-server.js &
echo "Data server started on port 3000"
