#!/usr/bin/env bash
set -euo pipefail

# ============================================================================
# Release Script - Local Release Workflow
# ============================================================================
# Creates a release from local machine with safety checks.
# Uses semantic-release to:
#   - Analyze commits and determine version bump
#   - Generate/update CHANGELOG.md
#   - Create git tag
#   - Push tag and changelog to remote
#   - Create GitHub release

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"

# ============================================================================
# Configuration
# ============================================================================

VALID_BRANCHES=("main" "beta" "alpha")
SKIP_CONFIRMATION=false
DRY_RUN_ONLY=false

# ============================================================================
# Usage
# ============================================================================

usage() {
  cat <<EOF
Create a release from local machine with safety checks.

Usage: scripts/release.sh [options]

Options:
  --yes, -y       Skip confirmation prompt
  --dry-run       Only run in dry-run mode (preview without changes)
  --help, -h      Show this help

Environment Variables:
  GITHUB_TOKEN    Required. Personal access token with repo permissions.

Examples:
  yarn release:local              # Interactive release with confirmation
  yarn release:local --yes        # Non-interactive release
  yarn release:local --dry-run    # Preview what would be released

This script will:
  1. Validate you're on a valid release branch (main, beta, alpha)
  2. Check for uncommitted changes
  3. Verify GITHUB_TOKEN is set
  4. Run a dry-run preview
  5. Ask for confirmation before proceeding
  6. Execute the release
EOF
}

# ============================================================================
# Validation Functions
# ============================================================================

check_branch() {
  local current_branch
  current_branch=$(git branch --show-current)

  local valid=false
  for branch in "${VALID_BRANCHES[@]}"; do
    if [[ "$current_branch" == "$branch" ]]; then
      valid=true
      break
    fi
  done

  if [[ "$valid" != true ]]; then
    log_error "Cannot release from branch '$current_branch'"
    echo
    echo "Valid release branches:"
    for branch in "${VALID_BRANCHES[@]}"; do
      echo "  - $branch"
    done
    echo
    echo "Switch to a valid branch and try again:"
    echo "  git checkout main"
    exit 1
  fi

  log_success "Branch: $current_branch"
}

check_clean_working_directory() {
  if [[ -n "$(git status --porcelain)" ]]; then
    log_error "Working directory has uncommitted changes"
    echo
    echo "Please commit or stash your changes before releasing:"
    echo "  git status"
    echo "  git stash"
    exit 1
  fi

  log_success "Working directory is clean"
}

check_github_token() {
  if [[ -z "${GITHUB_TOKEN:-}" ]]; then
    log_error "GITHUB_TOKEN environment variable is not set"
    echo
    echo "Create a personal access token at:"
    echo "  https://github.com/settings/tokens"
    echo
    echo "Required scopes: repo"
    echo
    echo "Then set it in your environment:"
    echo "  export GITHUB_TOKEN=ghp_..."
    exit 1
  fi

  log_success "GITHUB_TOKEN is configured"
}

check_remote_sync() {
  local current_branch
  current_branch=$(git branch --show-current)

  # Fetch latest from remote
  git fetch origin "$current_branch" --quiet 2>/dev/null || true

  local local_sha remote_sha
  local_sha=$(git rev-parse HEAD)
  remote_sha=$(git rev-parse "origin/$current_branch" 2>/dev/null || echo "")

  if [[ -n "$remote_sha" && "$local_sha" != "$remote_sha" ]]; then
    log_warn "Local branch differs from remote"
    echo
    echo "Pull latest changes before releasing:"
    echo "  git pull origin $current_branch"
    exit 1
  fi

  log_success "Branch is in sync with remote"
}

# ============================================================================
# Release Functions
# ============================================================================

run_dry_run() {
  echo
  colorize "$BOLD_CYAN" "Running dry-run to preview release..."
  echo

  if npx semantic-release --dry-run; then
    log_success "Dry-run completed successfully"
  else
    log_error "Dry-run failed"
    exit 1
  fi
}

confirm_release() {
  if [[ "$SKIP_CONFIRMATION" == true ]]; then
    return 0
  fi

  echo
  colorize "$BOLD_YELLOW" "Ready to create release?"
  echo
  echo "This will:"
  echo "  - Update CHANGELOG.md"
  echo "  - Create a git tag"
  echo "  - Push changes to remote"
  echo "  - Create a GitHub release"
  echo

  read -r -p "Proceed with release? (y/N) " response
  case "$response" in
    [yY][eE][sS]|[yY])
      return 0
      ;;
    *)
      log_warn "Release cancelled"
      exit 0
      ;;
  esac
}

execute_release() {
  echo
  colorize "$BOLD_CYAN" "Executing release..."
  echo

  if npx semantic-release; then
    echo
    log_success "Release completed successfully!"
  else
    log_error "Release failed"
    exit 1
  fi
}

# ============================================================================
# Main
# ============================================================================

main() {
  # Parse arguments
  for arg in "$@"; do
    case "$arg" in
      --yes|-y)
        SKIP_CONFIRMATION=true
        ;;
      --dry-run)
        DRY_RUN_ONLY=true
        ;;
      --help|-h)
        usage
        exit 0
        ;;
      *)
        log_error "Unknown option: $arg"
        usage
        exit 1
        ;;
    esac
  done

  echo
  colorize "$BOLD_WHITE" "========================================="
  colorize "$BOLD_CYAN"  "         Release Workflow"
  colorize "$BOLD_WHITE" "========================================="
  echo

  # Run validations
  colorize "$BOLD_WHITE" "Validating environment..."
  echo

  check_branch
  check_clean_working_directory
  check_github_token
  check_remote_sync

  # Run dry-run preview
  run_dry_run

  # If dry-run only mode, exit here
  if [[ "$DRY_RUN_ONLY" == true ]]; then
    echo
    log_info "Dry-run mode - no changes were made"
    exit 0
  fi

  # Confirm and execute
  confirm_release
  execute_release
}

main "$@"
