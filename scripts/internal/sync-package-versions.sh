#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts (go up one directory to reach helpers)
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../helpers/colors-style.sh"
source "$SCRIPT_DIR/../helpers/logging.sh"
source "$SCRIPT_DIR/../helpers/utils.sh"

# Ensure jq is available
require_cmd jq

# Set list of directories to ignore
IGNORE_DIRS=("node_modules" "dist")

# Get the version from the root package.json
ROOT_PKG="package.json"
ROOT_VERSION=$(jq -r '.version' "$ROOT_PKG")
if [ -z "$ROOT_VERSION" ]; then
  log_error "Couldn't retrieve version from $ROOT_PKG"
  exit 1
fi

log_info "Current root version: $ROOT_VERSION"

# Ask the user for the version to set
read -p "$(echo -e "${BOLD_YELLOW}Enter the version you want to set: ${NC}")" NEW_VERSION

if [ -z "$NEW_VERSION" ]; then
  log_error "No version provided."
  exit 1
fi

# If the new version differs from the root version, display both and ask for confirmation
if [ "$NEW_VERSION" != "$ROOT_VERSION" ]; then
  log_info "Root version: $ROOT_VERSION"
  log_info "New version: $NEW_VERSION"
  read -p "$(echo -e "${BOLD_YELLOW}The new version is different from the root. Are you sure you want to proceed? (y/N): ${NC}")" confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    log_warn "Operation cancelled by the user."
    exit 0
  fi
fi

# Build the find command to exclude files inside any ignored directory
find_cmd=( find . -mindepth 2 -type f -name package.json )
for ignore in "${IGNORE_DIRS[@]}"; do
  find_cmd+=( "!" "-path" "*/${ignore}/*" )
done

# Execute the find command and update each package.json with the new version
"${find_cmd[@]}" | while read -r pkg_file; do
  log_info "Updating version in $pkg_file to $NEW_VERSION"
  tmp_file=$(mktemp)
  jq --arg ver "$NEW_VERSION" '.version = $ver' "$pkg_file" > "$tmp_file"
  mv "$tmp_file" "$pkg_file"
done

log_success "All package.json files synced to version $NEW_VERSION."
