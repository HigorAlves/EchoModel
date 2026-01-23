#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts (go up one directory to reach helpers)
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../helpers/colors-style.sh"
source "$SCRIPT_DIR/../helpers/logging.sh"
source "$SCRIPT_DIR/../helpers/utils.sh"

log_info "Retrieving commits from the current branch (with body)..."

# Ensure git is available
require_cmd git

# Get the current branch name
CURRENT_BRANCH=$(git branch --show-current || true)
if [[ -z "$CURRENT_BRANCH" ]]; then
  log_warn "Not currently on any branch. Are you in a Git repository?"
  exit 1
fi

# Get formatted commits (hash, title, and body)
COMMITS=$(git log --pretty=format:'%h%n%s%n%b' --no-merges || true)

if [[ -z "$COMMITS" ]]; then
  log_warn "No commits found on the current branch: $CURRENT_BRANCH."
  exit 0
fi

# Output formatted commit messages
log_info "Commits from branch '${CURRENT_BRANCH}':"
echo -e "$COMMITS"

# Write commits to a temporary file and copy to clipboard if possible
TEMP_FILE=$(mktemp)
echo "$COMMITS" > "$TEMP_FILE"

if command -v pbcopy &> /dev/null; then
  echo "$COMMITS" | pbcopy
  log_success "Commit messages have been copied to your clipboard!"
elif command -v xclip &> /dev/null; then
  echo "$COMMITS" | xclip -selection clipboard
  log_success "Commit messages have been copied to your clipboard!"
else
  log_warn "Unable to copy: Clipboard utility (pbcopy or xclip) not found."
  log_info "The commit messages are saved in the temporary file: $TEMP_FILE"
fi
