#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Run tasks only for packages affected since a given Git ref using Turborepo filters.

Usage: scripts/affected.sh [--since <git-ref>] [--task <task>] [--dry-run] [--help]

Options:
  --since <git-ref>  Git ref to compare against (default: origin/main).
  --task <task>      Turbo task to run (default: build).
  --dry-run          Do not execute, print Turbo dry-run JSON summary.
  --help             Show this help and exit.

Examples:
  scripts/affected.sh --since origin/main --task build
  scripts/affected.sh --since HEAD~1 --task test:unit --dry-run
EOF
}

SINCE="origin/main"
TASK="build"
DRY_RUN=false

# Ensure required commands exist
require_cmd yarn
require_cmd turbo || true # turbo may be available via npx, but yarn turbo uses local binary

while [[ $# -gt 0 ]]; do
  case "$1" in
    --since)
      SINCE="${2:-}"; shift 2 ;;
    --task)
      TASK="${2:-}"; shift 2 ;;
    --dry-run)
      DRY_RUN=true; shift ;;
    --help|-h)
      usage; exit 0 ;;
    *)
      log_error "Unknown option: $1"; usage; exit 1 ;;
  esac
done

FILTER="...[${SINCE}]"

if [ "$DRY_RUN" = true ]; then
  log_info "Turbo dry-run for task '${TASK}' with filter '${FILTER}'..."
  if yarn turbo run "$TASK" --filter="$FILTER" --dry=json; then
    log_warn "(Dry-run is informational; no tasks were executed.)"
    exit 0
  else
    log_warn "Dry-run encountered issues. See output above."
    exit 0
  fi
fi

log_info "Running 'turbo run ${TASK}' for affected packages since ${SINCE}..."
yarn turbo run "$TASK" --filter="$FILTER"

log_success "Affected run complete."
