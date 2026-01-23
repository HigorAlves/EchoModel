#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

log_info "Starting cleanup of Turbo monorepo..."

# Define folders to clean
BUILD_DIRS=("dist" "build" ".turbo" ".next" "node_modules" "out" "coverage")
TEMP_FILES=("*.log" "*.tmp" "*.tsbuildinfo" "*.cache" "coverage.json")

# Clean up build artifacts and Turbo cache
log_info "Cleaning build directories and Turbo cache..."
for BUILD_DIR in "${BUILD_DIRS[@]}"; do
  find . -name "$BUILD_DIR" -type d -exec rm -rf {} + 2>/dev/null
done

# Clean up temporary files
log_info "Cleaning temporary files..."
for TEMP_FILE in "${TEMP_FILES[@]}"; do
  find . -type f -name "$TEMP_FILE" -exec rm -f {} + 2>/dev/null
done

# Clean Node.js packages
read -p "$(echo -e "${BOLD_BLUE}Do you want to remove all 'node_modules'? \n${BOLD_YELLOW}WARNING: This will erase all current dependencies and require reinstallation. (y/n): ${NC}")" CLEAN_NODE_MODULES
if [[ "$CLEAN_NODE_MODULES" == "y" || "$CLEAN_NODE_MODULES" == "Y" ]]; then
  log_warn "Removing node_modules..."
  find . -name "node_modules" -type d -exec rm -rf {} + 2>/dev/null
fi

# Clean Yarn cache
read -p "$(echo -e "${BOLD_BLUE}Do you want to clean the Yarn Cache? (y/n): ${NC}")" CLEAN_YARN_CACHE
if [[ "$CLEAN_YARN_CACHE" == "y" || "$CLEAN_YARN_CACHE" == "Y" ]]; then
  log_warn "Cleaning Yarn cache..."
  require_cmd yarn
  yarn cache clean
fi

log_success "Cleanup is complete!"
log_warn "You may need to reinstall dependencies by running 'yarn install' if 'node_modules' was removed."
