#!/usr/bin/env bash
# Wait until a published site serves exactly the files in a local build.
#
# Usage: verify-published.sh <base-url> <dist-dir> [attempts] [delay-seconds]
#
# GitHub Pages needs a short time after a push before it serves the new files,
# so a check that only looks for text the old site also contains passes too
# early. This compares every built file byte for byte (SHA-256) with what the
# site returns, and retries until they all match or the attempts run out. A
# per-commit query string keeps a CDN from answering with a stale copy.
set -euo pipefail

base="${1:?base URL required}"
dist="${2:?dist directory required}"
attempts="${3:-30}"
delay="${4:-10}"
cache_key="${GITHUB_SHA:-local}"

base="${base%/}"
mapfile -t files < <(cd "$dist" && find . -type f | sed 's|^\./||' | sort)
if [ "${#files[@]}" -eq 0 ]; then
  echo "No files found in $dist." >&2
  exit 1
fi

for attempt in $(seq 1 "$attempts"); do
  mismatch=""
  for file in "${files[@]}"; do
    want=$(sha256sum "$dist/$file" | cut -d' ' -f1)
    got=$(curl --silent --show-error --fail --max-time 20 "$base/$file?cb=$cache_key" | sha256sum | cut -d' ' -f1) || got=""
    if [ "$want" != "$got" ]; then
      mismatch="$file"
      break
    fi
  done

  if [ -z "$mismatch" ]; then
    echo "Published site serves all ${#files[@]} built files (attempt $attempt/$attempts)."
    exit 0
  fi

  echo "Attempt $attempt/$attempts: $mismatch does not match the build yet; retrying in ${delay}s..."
  sleep "$delay"
done

echo "The published site did not serve the new build after $attempts attempts." >&2
exit 1
