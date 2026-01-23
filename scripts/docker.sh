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
Start local Docker services for development.

Usage: scripts/docker.sh [--file <compose.yaml>] [--profile <name>] [--build] [--help]

Options:
  --file <path>     Path to docker compose file (default: compose.yml).
  --profile <name>  Compose profile to enable (can be passed multiple times).
  --build           Build images before starting.
  --help            Show this help and exit.
EOF
}

COMPOSE_FILE="$(dirname "$0")/../compose.yml"
PROFILES=()
BUILD=false

# Ensure docker is available
require_docker

while [[ $# -gt 0 ]]; do
  case "$1" in
    --file) COMPOSE_FILE="${2:-}"; shift 2;;
    --profile) PROFILES+=("${2:-}"); shift 2;;
    --build) BUILD=true; shift;;
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
for p in "${PROFILES[@]}"; do
  ARGS+=(--profile "$p")
done

if [ "$BUILD" = true ]; then
  ARGS+=(--build)
fi

if [ ${#PROFILES[@]} -gt 0 ]; then
  log_info "Enabling profiles: ${PROFILES[*]}"
fi

log_info "Starting docker services using compose file: ${COMPOSE_FILE}"
run_compose "${ARGS[@]}" up -d

log_success "Everything looks good, happy coding :D"
