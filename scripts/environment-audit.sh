#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

# ============================================================================
# Configuration
# ============================================================================

VERBOSE=false

# Results arrays
PASSED=()
WARNINGS=()
FAILED=()

# ============================================================================
# Usage
# ============================================================================

usage() {
  cat <<EOF
Run comprehensive environment audit for Foundry development.

Usage: scripts/environment-audit.sh [--verbose] [--help]

Options:
  --verbose   Show detailed version information and checks.
  --help      Show this help and exit.

This script checks that all required tools are installed and configured
correctly for development. It also checks optional tools that enhance
the development experience.
EOF
}

# ============================================================================
# Version Comparison
# ============================================================================

# Compare versions using sort -V
# Returns 0 if version >= minimum, 1 otherwise
version_gte() {
  local version="$1"
  local minimum="$2"

  # Use sort -V to compare versions
  local lowest
  lowest=$(printf '%s\n%s\n' "$version" "$minimum" | sort -V | head -n1)

  [[ "$lowest" == "$minimum" ]]
}

# Extract version number from various version string formats
extract_version() {
  local version_string="$1"
  # Extract version number (handles formats like "v22.14.0", "Docker version 27.5.1", etc.)
  echo "$version_string" | grep -oE '[0-9]+\.[0-9]+(\.[0-9]+)?' | head -1
}

# ============================================================================
# Tool Check Functions
# ============================================================================

# Check if a required tool exists and optionally verify its version
# Arguments: name, command, version_cmd, min_version (optional)
check_required() {
  local name="$1"
  local cmd="$2"
  local version_cmd="$3"
  local min_version="${4:-}"

  if ! command -v "$cmd" &>/dev/null; then
    FAILED+=("$name: not found")
    return 1
  fi

  local version_output version
  version_output=$($version_cmd 2>&1 || true)
  version=$(extract_version "$version_output")

  if [[ -n "$min_version" && -n "$version" ]]; then
    if version_gte "$version" "$min_version"; then
      PASSED+=("$name|$version|(>= $min_version)")
      return 0
    else
      FAILED+=("$name: $version (requires >= $min_version)")
      return 1
    fi
  else
    PASSED+=("$name|${version:-installed}|")
    return 0
  fi
}

# Check if an optional tool exists
# Arguments: name, command, version_cmd
check_optional() {
  local name="$1"
  local cmd="$2"
  local version_cmd="$3"

  if ! command -v "$cmd" &>/dev/null; then
    WARNINGS+=("$name: not found")
    return 1
  fi

  local version_output version
  version_output=$($version_cmd 2>&1 || true)
  version=$(extract_version "$version_output")

  PASSED+=("$name|${version:-installed}|")
  return 0
}

# Check environment configuration
# Arguments: name, check_command, expected_result (optional)
check_env() {
  local name="$1"
  local check_cmd="$2"
  local expected="${3:-}"

  local result
  result=$(eval "$check_cmd" 2>/dev/null || echo "")

  if [[ -n "$expected" ]]; then
    if [[ "$result" == "$expected" ]]; then
      PASSED+=("$name|configured|")
      return 0
    else
      WARNINGS+=("$name: not configured (expected: $expected, got: ${result:-empty})")
      return 1
    fi
  else
    if [[ -n "$result" ]]; then
      PASSED+=("$name|ok|")
      return 0
    else
      WARNINGS+=("$name: not configured")
      return 1
    fi
  fi
}

# Check if a file exists
check_file() {
  local name="$1"
  local filepath="$2"

  if [[ -f "$filepath" ]]; then
    PASSED+=("$name|exists|")
    return 0
  else
    FAILED+=("$name: not found at $filepath")
    return 1
  fi
}

# ============================================================================
# Environment Variable Functions
# ============================================================================

# Load .env file into environment (without exporting)
# Returns associative array of key=value pairs
declare -A ENV_VARS

load_env_file() {
  local env_file="$1"

  if [[ ! -f "$env_file" ]]; then
    return 1
  fi

  while IFS= read -r line || [[ -n "$line" ]]; do
    # Skip empty lines and comments
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue

    # Extract key=value (handle lines with = in value)
    if [[ "$line" =~ ^[[:space:]]*([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"
      # Remove surrounding quotes if present
      value="${value#\"}"
      value="${value%\"}"
      value="${value#\'}"
      value="${value%\'}"
      ENV_VARS["$key"]="$value"
    fi
  done < "$env_file"

  return 0
}

# Get environment variable value (from .env or actual environment)
get_env_value() {
  local var_name="$1"

  # First check actual environment
  if [[ -n "${!var_name:-}" ]]; then
    echo "${!var_name}"
    return 0
  fi

  # Then check loaded .env file
  if [[ -n "${ENV_VARS[$var_name]:-}" ]]; then
    echo "${ENV_VARS[$var_name]}"
    return 0
  fi

  return 1
}

# Check if an environment variable is set
# Arguments: display_name, var_name, min_length (optional)
check_env_var() {
  local display_name="$1"
  local var_name="$2"
  local min_length="${3:-0}"

  local value
  value=$(get_env_value "$var_name")

  if [[ -z "$value" ]]; then
    WARNINGS+=("$display_name: not set")
    return 1
  fi

  if [[ $min_length -gt 0 ]]; then
    if [[ ${#value} -ge $min_length ]]; then
      PASSED+=("$display_name|configured|(>= $min_length chars)")
    else
      WARNINGS+=("$display_name: too short (${#value} chars, needs >= $min_length)")
      return 1
    fi
  else
    # For sensitive vars, just show "configured" not the actual value
    case "$var_name" in
      *PASSWORD*|*SECRET*|*KEY*)
        PASSED+=("$display_name|configured|")
        ;;
      *)
        # Show actual value for non-sensitive vars
        PASSED+=("$display_name|$value|")
        ;;
    esac
  fi

  return 0
}

# ============================================================================
# Print Functions
# ============================================================================

print_header() {
  echo
  colorize "$BOLD_CYAN" "========================================"
  colorize "$BOLD_WHITE" "       Environment Audit Report"
  colorize "$BOLD_CYAN" "========================================"
  echo
}

print_section() {
  local title="$1"
  echo
  colorize "$BOLD_WHITE" "$title:"
}

# Print a result line with proper formatting
# Format: "  ICON NAME         VERSION    (REQUIREMENT)"
print_result() {
  local icon="$1"
  local color="$2"
  local entry="$3"

  local name version req
  IFS='|' read -r name version req <<< "$entry"

  # Format with padding
  printf "  %b%-2s%b %-14s" "$color" "$icon" "$NC" "$name"

  if [[ -n "$version" ]]; then
    printf "%-12s" "$version"
  fi

  if [[ -n "$req" ]]; then
    printf "%b%s%b" "$CYAN" "$req" "$NC"
  fi

  echo
}

print_failed() {
  local entry="$1"
  printf "  %b%s%b %s\n" "$BOLD_RED" "$CROSS" "$NC" "$entry"
}

print_warning() {
  local entry="$1"
  printf "  %b%s%b %s\n" "$BOLD_YELLOW" "$WARN" "$NC" "$entry"
}

print_summary() {
  local passed=${#PASSED[@]}
  local warnings=${#WARNINGS[@]}
  local failed=${#FAILED[@]}

  echo
  show_separator
  echo -e "Summary: ${BOLD_GREEN}$passed passed${NC}, ${BOLD_YELLOW}$warnings warnings${NC}, ${BOLD_RED}$failed failed${NC}"
  echo

  if [[ $failed -gt 0 ]]; then
    log_error "Environment audit failed! Please install missing required tools."
    return 1
  elif [[ $warnings -gt 0 ]]; then
    log_warn "Environment audit passed with warnings."
    return 0
  else
    log_success "Environment audit passed!"
    return 0
  fi
}

# ============================================================================
# Main
# ============================================================================

main() {
  # Parse arguments
  for arg in "$@"; do
    case "$arg" in
      --verbose) VERBOSE=true ;;
      --help|-h) usage; exit 0 ;;
      *) log_error "Unknown option: $arg"; usage; exit 1 ;;
    esac
  done

  print_header

  if [[ "$VERBOSE" == true ]]; then
    log_info "Running in verbose mode"
    echo
  fi

  # -------------------------------------------------------------------------
  # Required Tools
  # -------------------------------------------------------------------------
  print_section "Required Tools"

  check_required "Node.js" "node" "node --version" "22" || true
  check_required "Yarn" "yarn" "yarn --version" "4" || true
  check_required "Git" "git" "git --version" "" || true
  check_required "Docker" "docker" "docker --version" "27" || true
  check_required "jq" "jq" "jq --version" "" || true

  # Docker Compose V2 check (special case)
  if docker compose version &>/dev/null; then
    local compose_version
    compose_version=$(docker compose version 2>&1 | grep -oE '[0-9]+\.[0-9]+\.[0-9]+' | head -1)
    PASSED+=("Compose|${compose_version}|(V2)")
  else
    FAILED+=("Compose: Docker Compose V2 not found")
  fi

  # Print required results
  for entry in "${PASSED[@]}"; do
    # Only print required tools in this section
    local name
    IFS='|' read -r name _ _ <<< "$entry"
    case "$name" in
      Node.js|Yarn|Git|Docker|jq|Compose)
        print_result "$CHECK" "$BOLD_GREEN" "$entry"
        ;;
    esac
  done

  for entry in "${FAILED[@]}"; do
    print_failed "$entry"
  done

  # Reset for optional tools tracking
  local required_passed=("${PASSED[@]}")
  local required_failed=("${FAILED[@]}")
  PASSED=()

  # -------------------------------------------------------------------------
  # Optional Tools
  # -------------------------------------------------------------------------
  print_section "Optional Tools"

  check_optional "Turbo" "turbo" "turbo --version" || true
  check_optional "AWS CLI" "aws" "aws --version" || true
  check_optional "CDK CLI" "cdk" "cdk --version" || true
  check_optional "psql" "psql" "psql --version" || true
  check_optional "curl" "curl" "curl --version" || true

  # Print optional results
  for entry in "${PASSED[@]}"; do
    print_result "$CHECK" "$BOLD_GREEN" "$entry"
  done

  for entry in "${WARNINGS[@]}"; do
    print_warning "$entry"
  done

  # Reset for environment checks
  local optional_passed=("${PASSED[@]}")
  local optional_warnings=("${WARNINGS[@]}")
  PASSED=()
  WARNINGS=()

  # -------------------------------------------------------------------------
  # Environment Checks
  # -------------------------------------------------------------------------
  print_section "Environment"

  check_file "yarn.lock" "./yarn.lock" || true
  check_env "Git config" "git config core.ignorecase" "true" || true

  # Docker daemon running check
  if docker info &>/dev/null; then
    PASSED+=("Docker daemon|running|")
  else
    WARNINGS+=("Docker daemon: not running")
  fi

  # Print environment results
  for entry in "${PASSED[@]}"; do
    print_result "$CHECK" "$BOLD_GREEN" "$entry"
  done

  for entry in "${WARNINGS[@]}"; do
    print_warning "$entry"
  done

  # Reset for env var checks
  local env_passed=("${PASSED[@]}")
  local env_warnings=("${WARNINGS[@]}")
  PASSED=()
  WARNINGS=()

  # -------------------------------------------------------------------------
  # Environment Variables
  # -------------------------------------------------------------------------
  print_section "Environment Variables"

  # Check if .env file exists
  local env_file="./.env"
  local env_example="./.env.example"

  if [[ -f "$env_file" ]]; then
    PASSED+=(".env file|exists|")
    load_env_file "$env_file"
  else
    WARNINGS+=(".env file: not found (copy from .env.example)")
  fi

  # Check required environment variables
  check_env_var "NODE_ENV" "NODE_ENV" || true
  check_env_var "TYPEORM_USER" "TYPEORM_USERNAME" || true
  check_env_var "TYPEORM_PASS" "TYPEORM_PASSWORD" || true
  check_env_var "TYPEORM_DB" "TYPEORM_DATABASE" || true
  check_env_var "JWT_SECRET" "JWT_SECRET" 32 || true

  # Print env var results
  for entry in "${PASSED[@]}"; do
    print_result "$CHECK" "$BOLD_GREEN" "$entry"
  done

  for entry in "${WARNINGS[@]}"; do
    print_warning "$entry"
  done

  # In verbose mode, show optional env vars
  if [[ "$VERBOSE" == true ]]; then
    echo
    colorize "$CYAN" "  Optional env vars (have defaults):"
    local optional_vars=("TYPEORM_HOST:localhost" "TYPEORM_PORT:5432" "USE_LOCALSTACK:false" "LOG_LEVEL:info")
    for var_info in "${optional_vars[@]}"; do
      local var_name="${var_info%%:*}"
      local default="${var_info#*:}"
      local value
      value=$(get_env_value "$var_name")
      if [[ -n "$value" ]]; then
        printf "    %b%s%b %-14s %s\n" "$GREEN" "$CHECK" "$NC" "$var_name" "$value"
      else
        printf "    %b%s%b %-14s %b(default: %s)%b\n" "$CYAN" "-" "$NC" "$var_name" "$CYAN" "$default" "$NC"
      fi
    done
  fi

  # Store env var results
  local envvar_passed=("${PASSED[@]}")
  local envvar_warnings=("${WARNINGS[@]}")

  # -------------------------------------------------------------------------
  # Final Summary
  # -------------------------------------------------------------------------

  # Combine all results
  PASSED=("${required_passed[@]}" "${optional_passed[@]}" "${env_passed[@]}" "${envvar_passed[@]}")
  WARNINGS=("${optional_warnings[@]}" "${env_warnings[@]}" "${envvar_warnings[@]}")
  FAILED=("${required_failed[@]}")

  print_summary
  exit_code=$?

  if [[ "$VERBOSE" == true ]]; then
    echo
    log_info "Tip: Install missing optional tools for the best development experience."
    echo "  - Turbo: yarn global add turbo (or use via yarn)"
    echo "  - AWS CLI: brew install awscli"
    echo "  - CDK CLI: npm install -g aws-cdk"
    echo "  - psql: brew install postgresql"
  fi

  exit $exit_code
}

main "$@"
