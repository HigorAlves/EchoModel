#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname \"${BASH_SOURCE[0]}\")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Verify codebase quality (lint, typecheck, tests) using Turborepo.

Usage: scripts/verify.sh [--fix] [--with-e2e] [--no-unit] [--help]

Options:
  --fix       Run lint in fix mode.
  --with-e2e  Run e2e tests in addition to unit tests.
  --no-unit   Skip unit tests.
  --help      Show this help and exit.
EOF
}

RUN_FIX=false
RUN_E2E=false
RUN_UNIT=true

for arg in "$@"; do
  case "$arg" in
    --fix) RUN_FIX=true ;;
    --with-e2e) RUN_E2E=true ;;
    --no-unit) RUN_UNIT=false ;;
    --help|-h) usage; exit 0 ;;
    *) log_error "Unknown option: $arg"; usage; exit 1 ;;
  esac
done

log_info "Linting..."
if [ "$RUN_FIX" = true ]; then
  yarn lint:fix
else
  yarn lint
fi

log_info "Type checking..."
yarn check-types

if [ "$RUN_UNIT" = true ]; then
  log_info "Running unit tests..."
  yarn test:unit
else
  log_warn "Skipping unit tests (--no-unit)."
fi

if [ "$RUN_E2E" = true ]; then
  echo -e "${CYAN}Running e2e tests...${RESET}"
  yarn test:e2e
fi

echo -e "${GREEN}Verification complete.${RESET}"
