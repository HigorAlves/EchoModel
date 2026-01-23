#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Run dependency security audit using audit-ci.

Usage: scripts/security-audit.sh [--level <low|moderate|high|critical>] [--verbose] [--help]

Options:
  --level <lvl>  Minimum severity level to fail on (default: high).
  --verbose      Print the executed command.
  --help         Show this help and exit.

Notes:
  This wraps 'npx audit-ci' and forwards the chosen minimum level as a flag.
EOF
}

LEVEL="high"
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --level) LEVEL="${2:-}"; shift 2;;
    --verbose) VERBOSE=true; shift;;
    --help|-h) usage; exit 0;;
    *) log_error "Unknown option: $1"; usage; exit 1;;
  esac
done

case "$LEVEL" in
  low|moderate|high|critical) ;;
  *) log_error "Invalid level: $LEVEL (expected low|moderate|high|critical)"; exit 1;;
 esac

CMD=(npx audit-ci --package-manager yarn "--$LEVEL")

if [ "$VERBOSE" = true ]; then
  log_info "Running: ${CMD[*]}"
fi

"${CMD[@]}"
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  log_error "Security issues found (exit code: $EXIT_CODE)."
  exit $EXIT_CODE
fi

log_success "Audit complete. No blocking vulnerabilities at level '$LEVEL'."