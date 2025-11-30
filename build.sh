#!/bin/bash
set -e
echo "--- BUILD SCRIPT START ---"
apt-get update -y > /dev/null && apt-get install -y jq > /dev/null
echo "Generating category indexes..."
find data/properties data/requests -mindepth 1 -type d | while read dir; do
  INDEX_FILE="$dir/index.json"
  FILES_FOUND=$(find "$dir" -maxdepth 1 -type f -name '*.json' ! -name 'index.json' -printf '"%f"\n' | paste -sd, -)
  if [ -n "$FILES_FOUND" ]; then echo "[$FILES_FOUND]" > "$INDEX_FILE"; else echo "[]" > "$INDEX_FILE"; fi
done
echo "Generating master indexes..."
find data/properties -type f -name '*.json' ! -path '*/index.json' -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | jq -s '.' > data/properties_index.json
find data/requests -type f -name '*.json' ! -path '*/index.json' -print0 | xargs -0 -I {} jq -n --arg path "{}" '{id: ($path | split("/")[-1] | split(".")[0]), path: ("/" + $path)}' | jq -s '.' > data/requests_index.json
echo "Running Jekyll build..."
bundle exec jekyll build
echo "--- BUILD SCRIPT END ---"
