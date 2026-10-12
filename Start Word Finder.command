#!/bin/zsh
# Double-click to open the Word Finder. Starts a small local server for this folder if one is not already running.
cd "${0:A:h}"
PORT=8765
URL="http://127.0.0.1:$PORT/"
if ! curl -s -o /dev/null --max-time 1 "$URL"; then
  nohup python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
  disown
  sleep 1
fi
open "$URL"
