#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"

# List of allowed branch name prefixes
VALID_BRANCH_PREFIXES="^(feat|fix|docs|style|refactor|test|chore)/(.+)$"

# Branches to ignore validation for
IGNORED_BRANCHES="^(main|staging|develop)$"

# Detect branch name if not passed as an argument
if [[ -z "${1:-}" ]]; then
  BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
else
  BRANCH_NAME=$1
fi

# Check if branch name was successfully retrieved
if [[ -z "$BRANCH_NAME" ]]; then
  log_error "Unable to determine the branch name."
  exit 1
fi

# Check if the branch name matches the ignored branches list
if [[ "$BRANCH_NAME" =~ $IGNORED_BRANCHES ]]; then
  log_warn "Skipping branch name validation for '${BRANCH_NAME}'."
  exit 0
fi

# Validate the branch name
if [[ ! "$BRANCH_NAME" =~ $VALID_BRANCH_PREFIXES ]]; then
  log_error "Invalid branch name: '${BRANCH_NAME}'"
  echo -e "${YELLOW}Branch name must follow the convention:${NC}"
  echo -e "${GREEN}  feat:${NC}     (new feature)"
  echo -e "${GREEN}  fix:${NC}      (bug fix)"
  echo -e "${GREEN}  docs:${NC}     (changes to documentation)"
  echo -e "${GREEN}  style:${NC}    (formatting, etc; no production code change)"
  echo -e "${GREEN}  refactor:${NC} (refactoring production code, no functional changes)"
  echo -e "${GREEN}  test:${NC}     (adding or updating tests)"
  echo -e "${GREEN}  chore:${NC}    (other tasks, no production code change)"
  echo -e "${YELLOW}Example:${NC} ${GREEN}'feat/ISSUE-1'${NC}"
  exit 1
fi

log_success "Branch name is valid: '${BRANCH_NAME}'"
