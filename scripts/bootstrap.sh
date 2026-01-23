#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Bootstrap monorepo for local development.

Usage: scripts/bootstrap.sh [--no-build] [--with-docker] [--help]

Options:
  --no-build     Skip building packages after install.
  --with-docker  Start local infra via Docker Compose after setup.
  --help         Show this help and exit.
EOF
}

NO_BUILD=false
WITH_DOCKER=false

for arg in "$@"; do
  case "$arg" in
    --no-build) NO_BUILD=true ;;
    --with-docker) WITH_DOCKER=true ;;
    --help|-h) usage; exit 0 ;;
    *) log_error "Unknown option: $arg"; usage; exit 1 ;;
  esac
done

# Basic environment checks
log_info "Checking environment..."
require_cmd node
require_cmd yarn

# Install dependencies
log_info "Installing dependencies with Yarn..."
yarn install --immutable || yarn install

# Setup Git hooks via Lefthook
log_info "Installing Git hooks (lefthook) ..."
yarn prepare

# Optional build
if [ "$NO_BUILD" = false ]; then
  log_info "Building packages (turbo run build)..."
  yarn turbo run build
else
  log_warn "Skipping build step (--no-build)."
fi

# Optionally start dockerized infra
if [ "$WITH_DOCKER" = true ]; then
  log_info "Starting local infra (docker compose)..."
  docker compose up -d
fi

# Final doctor check
if command -v solidarity >/dev/null 2>&1; then
  log_info "Running environment audit..."
  scripts/environment-audit.sh || true
fi

log_success "Bootstrap complete. Happy coding!"
log_info ""
log_info "Quick start commands:"
log_info "  yarn dev            # Start development servers"
log_info "  yarn build          # Build all packages"
log_info "  yarn verify         # Run lint, types, and tests"
log_info "  yarn generate       # Interactive code generator"
log_info ""
