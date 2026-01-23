#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Run a local CI pipeline simulation.

Usage: scripts/ci-local.sh [--full] [--with-docker] [--help]

Options:
  --full         Run full pipeline: lint, typecheck, unit + e2e tests, coverage, security audit.
  --with-docker  Start local infra (docker compose) before running.
  --help         Show this help and exit.
EOF
}

FULL=false
WITH_DOCKER=false

# Ensure required commands exist
require_cmd yarn

while [[ $# -gt 0 ]]; do
  case "$1" in
    --full) FULL=true; shift ;;
    --with-docker) WITH_DOCKER=true; shift ;;
    --help|-h) usage; exit 0 ;;
    *) log_error "Unknown option: $1"; usage; exit 1 ;;
  esac
done

if [ "$WITH_DOCKER" = true ]; then
  log_info "Starting docker infra..."
  docker compose up -d
fi

if [ "$FULL" = true ]; then
  log_info "Running full verify (including e2e)..."
  scripts/verify.sh --with-e2e
  log_info "Generating and merging coverage report..."
  yarn coverage
  log_info "Running security audit..."
  scripts/security-audit.sh || true
else
  log_info "Running quick verify (lint + typecheck + unit tests)..."
  scripts/verify.sh
fi

log_success "Local CI run completed successfully."
