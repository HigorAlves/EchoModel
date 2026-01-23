#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"
source "$SCRIPT_DIR/helpers/docker.sh"

usage() {
  cat <<EOF
Tear down local Docker services.

Usage: scripts/docker-down.sh [--file <compose.yaml>] [--volumes] [--help]

Options:
  --file <path>  Path to docker compose file (default: compose.yml).
  --volumes      Remove named volumes declared in the compose file.
  --help         Show this help and exit.
EOF
}

COMPOSE_FILE="$(dirname "$0")/../compose.yml"
REMOVE_VOLUMES=false

# Ensure docker is available
require_docker

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file) COMPOSE_FILE="${2:-}"; shift 2;;
    --volumes) REMOVE_VOLUMES=true; shift;;
    --help|-h) usage; exit 0;;
    *) log_error "Unknown option: $1"; usage; exit 1;;
  esac
done

# Validate compose file exists
if [[ ! -f "$COMPOSE_FILE" ]]; then
  log_error "Compose file not found: $COMPOSE_FILE"
  exit 1
fi

ARGS=(-f "$COMPOSE_FILE")
if [ "$REMOVE_VOLUMES" = true ]; then
  ARGS+=(-v)
fi

log_info "Tearing down docker services using compose file: ${COMPOSE_FILE}"
run_compose "${ARGS[@]}" down

log_success "Teardown complete."
