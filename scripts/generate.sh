#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/helpers/colors-style.sh"
source "$SCRIPT_DIR/helpers/logging.sh"
source "$SCRIPT_DIR/helpers/utils.sh"

# Generator configurations
declare -A GENERATORS=(
    ["1"]="lambda 🚀 Lambda Create a new Lambda API for a bounded context"
    ["2"]="application 🏗️ Application Add CQRS components to a bounded context"
    ["3"]="domain 🏛️ Domain Add DDD components to a bounded context"
    ["4"]="exit ❌ Exit Close the generator"
)

# Show the main menu
show_main_menu() {
    show_header "ENTERPRISE PROJECT GENERATOR"

    colorize "$BOLD_YELLOW" "🎯 What would you like to generate today?"
    echo

    show_menu_option "1" "🚀" "Lambda" "Create a new Lambda API for a bounded context" "$BOLD_BLUE"
    show_menu_option "2" "🏗️" "Application" "Add CQRS components to a bounded context" "$BOLD_PURPLE"
    show_menu_option "3" "🏛️" "Domain" "Add DDD components to a bounded context" "$BOLD_GREEN"
    show_menu_option "4" "❌" "Exit" "Close the generator" "$BOLD_RED"
    echo
    show_separator
    echo
}

# Run turbo generator function
run_generator() {
    local generator="$1"

    echo
    log_info "Starting ${generator} generator"
    show_separator

    if npx turbo gen "$generator"; then
        echo
        show_separator
        success "${generator} generated successfully!"
        info "You can now start working on your new ${generator}!"
        return 0
    else
        echo
        show_separator
        error "Failed to generate ${generator}"
        warn "Please check the error messages above for details."
        return 1
    fi
}

# Handle user choice function
handle_choice() {
    local choice="$1"

    case $choice in
        1|2|3)
            local generator_info="${GENERATORS[$choice]}"
            local generator_name=$(echo "$generator_info" | cut -d' ' -f1)

            if run_generator "$generator_name"; then
                return 0
            else
                return 1
            fi
            ;;
        4)
            colorize "$BOLD_YELLOW" "👋 Thanks for using Foundry Generator! See you next time!"
            exit 0
            ;;
        *)
            warn "Invalid option! Please choose 1, 2, 3, or 4."
            sleep 1.5
            return 1
            ;;
    esac
}

# Ask to continue function
ask_continue() {
    echo
    colorize "$BOLD_YELLOW" "🔄 Would you like to generate something else?"
    echo
    show_menu_option "1" "✅" "Yes" "Show menu again" "$BOLD_GREEN"
    show_menu_option "2" "❌" "No" "Exit generator" "$BOLD_RED"

    while true; do
        ask_input "Your choice (1 or 2)" continue_choice

        case $continue_choice in
            1)
                return 0
                ;;
            2)
                colorize "$BOLD_YELLOW" "👋 Thanks for using Foundry Generator! See you next time!"
                return 1
                ;;
            *)
                warn "Invalid option! Please enter 1 or 2."
                ;;
        esac
    done
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies"

    if ! check_dependency "npx" "NPX"; then
        exit 1
    fi

    if ! check_dependency "turbo" "Turbo"; then
        if ! npx turbo --version &>/dev/null; then
            error "Turbo is not available. Please make sure it's installed."
            exit 1
        fi
    fi

    success "All dependencies found!"
    sleep 1
}

# Handle Ctrl+C gracefully
cleanup() {
    echo
    colorize "$BOLD_YELLOW" "👋 Goodbye! Thanks for using Foundry Generator!"
    exit 0
}

# Main function
main() {
    local continue_generating=true

    # Set up signal handlers
    trap cleanup INT TERM

    # Check dependencies first
    check_dependencies

    while $continue_generating; do
        clear_screen
        show_main_menu

        ask_input "Enter your choice (1-4)" choice

        # Check if user wants to exit
        if [[ $choice == "4" ]]; then
            colorize "$BOLD_YELLOW" "👋 Thanks for using Foundry Generator! See you next time!"
            break
        fi

        # Handle the choice
        if handle_choice "$choice"; then
            # If generation was successful, ask to continue
            if [[ $choice != "4" ]]; then
                if ! ask_continue; then
                    continue_generating=false
                fi
            fi
        else
            # If there was an error or invalid choice, ask to continue
            if [[ $choice != "4" ]] && [[ $choice =~ ^[1-3]$ ]]; then
                error "Something went wrong during generation!"
                sleep 2
                if ! ask_continue; then
                    continue_generating=false
                fi
            fi
        fi
    done
}

# Run the main function
main "$@"