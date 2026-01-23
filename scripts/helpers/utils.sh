#!/usr/bin/env bash
# utils.sh - Handy bash helpers
source "$(dirname "${BASH_SOURCE[0]}")/colors-style.sh"

# Ask user for yes/no
confirm() {
  read -rp "❓ $1 [y/N]: " response
  case "$response" in
    [yY][eE][sS]|[yY]) return 0 ;;
    *) return 1 ;;
  esac
}

# Run a command and check if it exists
require_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "❌ Required command '$1' not found. Please install it." >&2
    exit 1
  fi
}

# Spinner for long tasks
spinner() {
  local pid=$!
  local delay=0.1
  local spin='-\|/'
  while ps -p $pid &>/dev/null; do
    for i in $(seq 0 3); do
      echo -ne "\r${spin:$i:1} $1"
      sleep $delay
    done
  done
  echo -ne "\r"
}

clear_screen() {
    clear
}

# Show a header with title
show_header() {
    local title="$1"
    echo
    colorize "$BOLD_CYAN" "🚀 ====================================="
    colorize "$BOLD_WHITE" "    $title"
    colorize "$BOLD_CYAN" "====================================="
    echo
}

# Show a fancy banner
show_banner() {
    local title="$1"
    echo
    colorize "$BOLD_CYAN" "╔════════════════════════════════════════╗"
    colorize "$BOLD_CYAN" "║               🚀 ${title}              ║"
    colorize "$BOLD_CYAN" "╚════════════════════════════════════════╝"
    echo
}

# Show menu options
show_menu_option() {
    local number="$1"
    local emoji="$2"
    local title="$3"
    local description="$4"
    local color="$5"

    echo -e "${color}${emoji} ${number}. ${title}${NC}$(printf "%*s" $((15 - ${#title})) "") - ${description}"
}

# Ask for input with prompt
ask_input() {
    local prompt="$1"
    local var_name="$2"
    echo -ne "${BOLD_WHITE}👉 ${prompt}: ${NC}"
    read -r "$var_name"
}

# Check if a command exists and is available
check_dependency() {
    local cmd="$1"
    local name="$2"

    if ! command -v "$cmd" &>/dev/null; then
        error "$name is not installed. Please install it first."
        return 1
    fi
    return 0
}

# Run command with loading indicator
run_with_loading() {
    local message="$1"
    shift

    info "$message..."

    if "$@" &>/dev/null; then
        success "$message completed successfully!"
        return 0
    else
        error "$message failed!"
        return 1
    fi
}

# Show a separator line
show_separator() {
    colorize "$CYAN" "─────────────────────────────────────────"
}

# Pause for user input
pause() {
    local message="${1:-Press any key to continue...}"
    echo -ne "${BOLD_WHITE}${message}${NC}"
    read -n1 -s
    echo
}