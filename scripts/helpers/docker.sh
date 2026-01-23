#!/usr/bin/env bash
# docker.sh - Docker and compose detection helpers

# Source the logging utilities for consistent error messages
HELPER_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$HELPER_DIR/logging.sh"

# Get the appropriate docker compose command
# Returns "docker compose" for V2 or "docker-compose" for legacy
get_compose_cmd() {
  if command -v docker &>/dev/null && docker compose version &>/dev/null; then
    echo "docker compose"
  elif command -v docker-compose &>/dev/null; then
    echo "docker-compose"
  else
    return 1
  fi
}

# Require docker compose to be available, exit if not found
require_docker() {
  if ! get_compose_cmd &>/dev/null; then
    log_error "Neither 'docker compose' nor 'docker-compose' is available. Please install Docker."
    exit 1
  fi
}

# Run docker compose with the appropriate command
# Usage: run_compose up -d
#        run_compose -f custom.yaml up -d
run_compose() {
  local compose_cmd
  compose_cmd=$(get_compose_cmd) || {
    log_error "Docker Compose is not available."
    exit 1
  }
  $compose_cmd "$@"
}
