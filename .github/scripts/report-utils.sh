#!/usr/bin/env bash
# report-utils.sh - Reusable reporting utilities for GitHub Actions pipelines
# Generates consistent Markdown reports with metadata

set -euo pipefail

# ============================================================================
# Cleanup and Error Handling
# ============================================================================

# Track temp files for cleanup
declare -ga _REPORT_TEMP_FILES=()

# Cleanup function - removes temp files on exit
_report_cleanup() {
    local file
    for file in "${_REPORT_TEMP_FILES[@]:-}"; do
        rm -f "$file" 2>/dev/null || true
    done
}

# Register cleanup trap
trap _report_cleanup EXIT

# Standard error handler for GitHub Actions
_report_error() {
    local msg="${1:-Unknown error}"
    local code="${2:-1}"
    echo "::error::$msg" >&2
    return "$code"
}

# Validate required parameters
# Usage: _require_param <param-value> <param-name>
_require_param() {
    local value="$1"
    local name="$2"
    if [ -z "$value" ]; then
        _report_error "Required parameter '$name' is missing or empty"
        return 1
    fi
}

# Validate status value
# Usage: _validate_status <status>
_validate_status() {
    local status="$1"
    case "$status" in
        success|failure|skipped|pending|cancelled) return 0 ;;
        *)
            echo "::warning::Unknown status '$status', treating as pending"
            return 0
            ;;
    esac
}

# ============================================================================
# GitHub Actions Integration
# ============================================================================

# Log a group start (collapsible in GHA logs)
log_group() {
    echo "::group::$1"
}

# Log a group end
log_endgroup() {
    echo "::endgroup::"
}

# Log an error annotation
log_error() {
    local msg="$1"
    local file="${2:-}"
    local line="${3:-}"
    if [ -n "$file" ] && [ -n "$line" ]; then
        echo "::error file=$file,line=$line::$msg"
    elif [ -n "$file" ]; then
        echo "::error file=$file::$msg"
    else
        echo "::error::$msg"
    fi
}

# Log a warning annotation
log_warning() {
    local msg="$1"
    echo "::warning::$msg"
}

# ============================================================================
# Report State Variables (namespaced to avoid collisions)
# ============================================================================

declare -g _REPORT_FILE=""
declare -g _REPORT_TITLE=""
declare -g _REPORT_GATE_TYPE=""
declare -ga _REPORT_CHECKS=()
declare -g _REPORT_TOTAL=0
declare -g _REPORT_PASSED=0
declare -g _REPORT_FAILED=0
declare -g _REPORT_SKIPPED=0

# Legacy aliases for backward compatibility
REPORT_FILE=""
REPORT_TITLE=""
REPORT_GATE_TYPE=""
REPORT_CHECKS=()
REPORT_TOTAL=0
REPORT_PASSED=0
REPORT_FAILED=0
REPORT_SKIPPED=0

# Initialize a new report
# Usage: init_report <report-file> <title> <gate-type>
init_report() {
    local report_file="${1:-}"
    local title="${2:-}"
    local gate_type="${3:-}"

    # Parameter validation (P2: RU-3)
    _require_param "$report_file" "report-file" || return 1
    _require_param "$title" "title" || return 1
    _require_param "$gate_type" "gate-type" || return 1

    # Set namespaced variables
    _REPORT_FILE="$report_file"
    _REPORT_TITLE="$title"
    _REPORT_GATE_TYPE="$gate_type"
    _REPORT_CHECKS=()
    _REPORT_TOTAL=0
    _REPORT_PASSED=0
    _REPORT_FAILED=0
    _REPORT_SKIPPED=0

    # Update legacy aliases for backward compatibility
    REPORT_FILE="$report_file"
    REPORT_TITLE="$title"
    REPORT_GATE_TYPE="$gate_type"
    REPORT_CHECKS=()
    REPORT_TOTAL=0
    REPORT_PASSED=0
    REPORT_FAILED=0
    REPORT_SKIPPED=0

    # Create report directory if it doesn't exist
    mkdir -p "$(dirname "$report_file")"

    # Initialize report file with header
    cat > "$report_file" <<EOF
# $title

> **Gate Type:** $gate_type
> **Status:** 🔄 In Progress

---

EOF
}

# Add a check result to the report
# Usage: add_check <check-name> <status> [details] [log-file]
# Status: success, failure, skipped, pending, cancelled
add_check() {
    local check_name="${1:-}"
    local status="${2:-}"
    local details="${3:-}"
    local log_file="${4:-}"

    # Parameter validation
    _require_param "$check_name" "check-name" || return 1
    _require_param "$status" "status" || return 1
    _validate_status "$status"

    # Update both namespaced and legacy counters
    _REPORT_TOTAL=$((_REPORT_TOTAL + 1))
    REPORT_TOTAL=$_REPORT_TOTAL

    local icon=""
    local status_text=""

    case "$status" in
        success)
            icon="✅"
            status_text="PASS"
            _REPORT_PASSED=$((_REPORT_PASSED + 1))
            REPORT_PASSED=$_REPORT_PASSED
            ;;
        failure)
            icon="❌"
            status_text="FAIL"
            _REPORT_FAILED=$((_REPORT_FAILED + 1))
            REPORT_FAILED=$_REPORT_FAILED
            # P2: QR-4 - Add GHA annotation for failures
            log_error "$check_name failed${details:+: $details}"
            ;;
        skipped|cancelled)
            icon="⏭️"
            status_text="SKIPPED"
            _REPORT_SKIPPED=$((_REPORT_SKIPPED + 1))
            REPORT_SKIPPED=$_REPORT_SKIPPED
            ;;
        pending)
            icon="🔄"
            status_text="PENDING"
            ;;
        *)
            icon="❓"
            status_text="UNKNOWN"
            log_warning "Unknown status '$status' for check '$check_name'"
            ;;
    esac

    # Update both namespaced and legacy arrays
    _REPORT_CHECKS+=("$icon **$check_name:** $status_text")
    REPORT_CHECKS+=("$icon **$check_name:** $status_text")

    # Add details if provided
    if [ -n "$details" ]; then
        _REPORT_CHECKS+=("  └─ $details")
        REPORT_CHECKS+=("  └─ $details")
    fi

    # Add log file reference if provided and exists
    if [ -n "$log_file" ] && [ -f "$log_file" ]; then
        _REPORT_CHECKS+=("  └─ 📄 Log: \`$log_file\`")
        REPORT_CHECKS+=("  └─ 📄 Log: \`$log_file\`")
    fi
}

# Add a custom section to the report
# Usage: add_section <section-title> <section-content>
add_section() {
    local section_title="${1:-}"
    local section_content="${2:-}"

    # Parameter validation
    _require_param "$section_title" "section-title" || return 1

    # Use namespaced variable with fallback to legacy
    local report_file="${_REPORT_FILE:-$REPORT_FILE}"
    if [ -z "$report_file" ]; then
        _report_error "No report initialized. Call init_report first."
        return 1
    fi

    cat >> "$report_file" <<EOF

## $section_title

$section_content

EOF
}

# Finalize the report with metadata and summary
# Usage: finalize_report
finalize_report() {
    # Use namespaced variables with fallback to legacy
    local report_file="${_REPORT_FILE:-$REPORT_FILE}"
    local report_title="${_REPORT_TITLE:-$REPORT_TITLE}"
    local report_gate="${_REPORT_GATE_TYPE:-$REPORT_GATE_TYPE}"
    local report_total="${_REPORT_TOTAL:-$REPORT_TOTAL}"
    local report_passed="${_REPORT_PASSED:-$REPORT_PASSED}"
    local report_failed="${_REPORT_FAILED:-$REPORT_FAILED}"
    local report_skipped="${_REPORT_SKIPPED:-$REPORT_SKIPPED}"

    if [ -z "$report_file" ]; then
        _report_error "No report initialized. Call init_report first."
        return 1
    fi

    # Determine overall status
    local overall_status
    local status_icon
    local status_color

    if [ "$report_failed" -gt 0 ]; then
        overall_status="FAILED"
        status_icon="💥"
        status_color="🔴"
    elif [ "$report_passed" -eq "$report_total" ]; then
        overall_status="PASSED"
        status_icon="🎉"
        status_color="🟢"
    elif [ "$report_skipped" -gt 0 ] && [ "$report_failed" -eq 0 ]; then
        overall_status="PASSED WITH SKIPS"
        status_icon="✅"
        status_color="🟡"
    else
        overall_status="PARTIAL"
        status_icon="⚠️"
        status_color="🟡"
    fi

    # Create temporary file for new content (track for cleanup)
    local temp_file="${report_file}.tmp"
    _REPORT_TEMP_FILES+=("$temp_file")

    # Write header with final status
    cat > "$temp_file" <<EOF
# $report_title

> **Gate Type:** $report_gate
> **Status:** $status_color $overall_status

---

## Summary

$status_icon **$overall_status** - $report_passed/$report_total checks passed

EOF

    # Add individual check results - use namespaced array with fallback
    local -a checks_array
    if [ ${#_REPORT_CHECKS[@]} -gt 0 ]; then
        checks_array=("${_REPORT_CHECKS[@]}")
    elif [ ${#REPORT_CHECKS[@]} -gt 0 ]; then
        checks_array=("${REPORT_CHECKS[@]}")
    fi

    if [ ${#checks_array[@]} -gt 0 ]; then
        cat >> "$temp_file" <<EOF

## Check Results

EOF
        printf '%s\n' "${checks_array[@]}" >> "$temp_file"
    fi

    # Add metadata section
    add_metadata_section "$temp_file"

    # Replace original file
    mv "$temp_file" "$report_file"

    # Remove from temp files array since we moved it
    _REPORT_TEMP_FILES=("${_REPORT_TEMP_FILES[@]/$temp_file}")

    # Output to console with grouping for GHA
    log_group "Report Summary: $report_title"
    echo ""
    echo "================================================"
    echo "$status_icon $report_title: $overall_status"
    echo "================================================"
    echo "  Passed:  $report_passed"
    echo "  Failed:  $report_failed"
    echo "  Skipped: $report_skipped"
    echo "  Total:   $report_total"
    echo "================================================"
    echo ""
    echo "📄 Full report: $report_file"
    echo ""
    log_endgroup

    # Write to GitHub Step Summary if available
    if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
        {
            echo "## $report_title"
            echo ""
            echo "$status_icon **$overall_status** - $report_passed/$report_total checks passed"
            echo ""
            echo "| Metric | Count |"
            echo "|--------|-------|"
            echo "| ✅ Passed | $report_passed |"
            echo "| ❌ Failed | $report_failed |"
            echo "| ⏭️ Skipped | $report_skipped |"
            echo ""
        } >> "$GITHUB_STEP_SUMMARY"
    fi
}

# Add metadata section to the report
# Usage: add_metadata_section <target-file>
add_metadata_section() {
    local target_file="${1:-}"

    _require_param "$target_file" "target-file" || return 1

    # P2: RU-4 - Use consistent UTC timestamps throughout
    local timestamp
    timestamp=$(date -u '+%Y-%m-%d %H:%M:%S UTC')

    cat >> "$target_file" <<EOF

---

## Metadata

### Git Context

- **Branch:** \`${GITHUB_REF_NAME:-$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")}\`
- **Commit:** \`${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo "unknown")}\`
- **Author:** ${GITHUB_ACTOR:-$(git log -1 --format='%an' 2>/dev/null || echo "unknown")}

### CI Environment

- **Workflow:** ${GITHUB_WORKFLOW:-"N/A"}
- **Run ID:** ${GITHUB_RUN_ID:-"N/A"}
- **Run Number:** ${GITHUB_RUN_NUMBER:-"N/A"}
- **Runner OS:** ${RUNNER_OS:-$(uname -s)}
- **Timestamp:** $timestamp

EOF
}

# Helper: Create a report section from a log file
# Usage: add_log_section <section-title> <log-file> [max-lines] [max-chars]
# P2: QR-3 - Added max-chars limit to prevent memory issues with large logs
add_log_section() {
    local section_title="${1:-}"
    local log_file="${2:-}"
    local max_lines="${3:-100}"  # Increased default from 50 to 100
    local max_chars="${4:-50000}"  # Max characters to include

    _require_param "$section_title" "section-title" || return 1
    _require_param "$log_file" "log-file" || return 1

    if [ ! -f "$log_file" ]; then
        return 0
    fi

    local content
    local line_count
    local file_size
    line_count=$(wc -l < "$log_file" 2>/dev/null || echo "0")
    file_size=$(stat -f%z "$log_file" 2>/dev/null || stat -c%s "$log_file" 2>/dev/null || echo "0")

    # Check if file is too large
    if [ "$file_size" -gt "$max_chars" ]; then
        log_warning "Log file '$log_file' exceeds $max_chars chars, truncating"
        content="<details>
<summary>View log (truncated - file too large: ${file_size} bytes)</summary>

\`\`\`
$(head -c "$max_chars" "$log_file" 2>/dev/null || head -n "$max_lines" "$log_file")
... [truncated]
\`\`\`

</details>"
    elif [ "$line_count" -gt "$max_lines" ]; then
        content="<details>
<summary>View log (showing last $max_lines of $line_count lines)</summary>

\`\`\`
$(tail -n "$max_lines" "$log_file")
\`\`\`

</details>"
    else
        content="\`\`\`
$(cat "$log_file")
\`\`\`"
    fi

    add_section "$section_title" "$content"
}

# Helper: Get check status from exit code
# Usage: status_from_exit_code <exit-code>
status_from_exit_code() {
    local exit_code="$1"

    if [ "$exit_code" -eq 0 ]; then
        echo "success"
    else
        echo "failure"
    fi
}

# Helper: Run a command and capture status
# Usage: run_check <check-name> <command> [log-file]
# Returns: 0 if success, 1 if failure
run_check() {
    local check_name="$1"
    shift
    local log_file="${!#}"

    # Check if last argument is a file path (contains /)
    if [[ "$log_file" != *"/"* ]]; then
        log_file=""
    else
        # Remove log file from command args
        set -- "${@:1:$(($#-1))}"
    fi

    local exit_code=0

    if [ -n "$log_file" ]; then
        mkdir -p "$(dirname "$log_file")"
        "$@" > "$log_file" 2>&1 || exit_code=$?
    else
        "$@" > /dev/null 2>&1 || exit_code=$?
    fi

    local status
    status=$(status_from_exit_code "$exit_code")

    add_check "$check_name" "$status" "" "$log_file"

    return "$exit_code"
}

# Export functions for use in other scripts
export -f init_report
export -f add_check
export -f add_section
export -f finalize_report
export -f add_metadata_section
export -f add_log_section
export -f status_from_exit_code
export -f run_check

# Export new helper functions
export -f _report_cleanup
export -f _report_error
export -f _require_param
export -f _validate_status
export -f log_group
export -f log_endgroup
export -f log_error
export -f log_warning
