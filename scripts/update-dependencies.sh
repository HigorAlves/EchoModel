#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

usage() {
  cat <<EOF
Update dependencies across the monorepo using npm-check-updates (ncu).

Usage: scripts/update-dependencies.sh [--dep <prod|dev|all>] [--target <minor|patch|latest>] [--scope <glob>]... [--no-install] [--dry-run] [--help]

Options:
  --dep <type>      Which dependencies to update (default: prod). Use 'all' to include prod+dev.
  --target <rule>   Target version range: minor, patch, latest (default: minor).
  --scope <glob>    Limit to packages whose path matches glob (can be used multiple times).
  --no-install      Do not run 'yarn install' after updates.
  --dry-run         Show proposed updates without writing to package.json.
  --help            Show this help and exit.

Examples:
  scripts/update-dependencies.sh --dep prod --target patch
  scripts/update-dependencies.sh --dep all --target latest --scope apps/ --scope packages/*
  scripts/update-dependencies.sh --dry-run
EOF
}

DEP="prod"
TARGET="minor"
SCOPES=()
NO_INSTALL=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dep) DEP="${2:-}"; shift 2;;
    --target) TARGET="${2:-}"; shift 2;;
    --scope) SCOPES+=("${2:-}"); shift 2;;
    --no-install) NO_INSTALL=true; shift;;
    --dry-run) DRY_RUN=true; shift;;
    --help|-h) usage; exit 0;;
    *) log_error "Unknown option: $1"; usage; exit 1;;
  esac
done

case "$DEP" in
  prod|dev|all) ;;
  *) log_error "Invalid --dep: $DEP (expected prod|dev|all)"; exit 1;;
esac

case "$TARGET" in
  minor|patch|latest) ;;
  *) log_error "Invalid --target: $TARGET (expected minor|patch|latest)"; exit 1;;
esac

FIND_PATHS=(packages kernel libs apps config infra)

# Build list of package.json files
PACKAGE_FILES=()
while IFS= read -r -d '' pkg; do
  PACKAGE_FILES+=("$pkg")
done < <(find "${FIND_PATHS[@]}" -name "package.json" -not -path "*/node_modules/*" -print0)

# Apply scope filters if provided
if [ ${#SCOPES[@]} -gt 0 ]; then
  FILTERED=()
  for pkg in "${PACKAGE_FILES[@]}"; do
    for glob in "${SCOPES[@]}"; do
      case "$(dirname "$pkg")/" in
        $glob*) FILTERED+=("$pkg"); break;;
      esac
    done
  done
  PACKAGE_FILES=("${FILTERED[@]}")
fi

if [ ${#PACKAGE_FILES[@]} -eq 0 ]; then
  log_warn "No packages found matching the given scope(s)."
  exit 0
fi

for package in "${PACKAGE_FILES[@]}"; do
  package_dir=$(dirname "$package")
  log_info "Updating dependencies in $package_dir"
  pushd "$package_dir" >/dev/null || continue

  NCU_ARGS=(-t "$TARGET")
  if [ "$DEP" != "all" ]; then
    NCU_ARGS+=(--dep "$DEP")
  fi
  if [ "$DRY_RUN" = true ]; then
    npx npm-check-updates "${NCU_ARGS[@]}"
  else
    npx npm-check-updates -u "${NCU_ARGS[@]}"
  fi

  log_success "Processed $package_dir"
  popd >/dev/null || true
done

if [ "$DRY_RUN" = false ] && [ "$NO_INSTALL" = false ]; then
  log_info "Installing dependencies (yarn install)..."
  yarn install
fi

log_success "Dependency update run completed."
