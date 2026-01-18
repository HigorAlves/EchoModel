#!/usr/bin/env bash
# security-report.sh - Security gate report generator
# Generates a standardized report for security checks

set -euo pipefail

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source the report utilities
source "$SCRIPT_DIR/report-utils.sh"

# Default values
REPORT_DIR="${REPORT_DIR:-security-reports}"
FAIL_ON_SEVERITY="${FAIL_ON_SEVERITY:-high}"

# P1: SR-3 - Validate FAIL_ON_SEVERITY environment variable
VALID_SEVERITIES=("low" "moderate" "high" "critical")
_validate_severity() {
    local severity="$1"
    local valid=false
    for s in "${VALID_SEVERITIES[@]}"; do
        if [ "$severity" = "$s" ]; then
            valid=true
            break
        fi
    done
    if [ "$valid" = false ]; then
        log_warning "Invalid FAIL_ON_SEVERITY '$severity', defaulting to 'high'"
        FAIL_ON_SEVERITY="high"
    fi
}
_validate_severity "$FAIL_ON_SEVERITY"

# P2: SR-4 - Helper to safely get numeric value from jq output
_safe_numeric() {
    local value="$1"
    local default="${2:-0}"
    # Remove any non-numeric characters and validate
    if [[ "$value" =~ ^[0-9]+$ ]]; then
        echo "$value"
    else
        echo "$default"
    fi
}

# Initialize security gate report
init_security_report() {
    local report_file="$REPORT_DIR/security-gate-report.md"
    init_report "$report_file" "Security Gate Report" "Security"

    echo "🔒 Security gate report initialized: $report_file"
}

# Add CodeQL check result
add_codeql_check() {
    local status="$1"

    if [ "$status" = "skipped" ]; then
        add_check "CodeQL Analysis" "skipped" "Skipped by configuration"
    elif [ "$status" = "success" ]; then
        add_check "CodeQL Analysis" "success" "No security issues detected by CodeQL"
    else
        add_check "CodeQL Analysis" "failure" "CodeQL found security issues - check GitHub Security tab"
    fi
}

# Add dependency vulnerability scan result
add_dependency_scan_check() {
    local status="$1"
    local npm_audit_log="${2:-}"

    if [ "$status" = "skipped" ]; then
        add_check "Dependency Vulnerability Scan" "skipped" "Skipped by configuration"
    elif [ "$status" = "success" ]; then
        add_check "Dependency Vulnerability Scan" "success" "No vulnerabilities found at $FAIL_ON_SEVERITY severity or higher"
    else
        local vuln_count="unknown"
        if [ -f "$npm_audit_log" ]; then
            # Try to extract vulnerability count from npm audit JSON
            vuln_count=$(jq -r '.metadata.vulnerabilities | to_entries | map(.value) | add' "$npm_audit_log" 2>/dev/null || echo "unknown")
        fi
        add_check "Dependency Vulnerability Scan" "failure" "Found $vuln_count vulnerabilities" "$npm_audit_log"
    fi
}

# Add Trivy scan result
# P1: SR-2 - Added explicit file existence checks
add_trivy_check() {
    local status="$1"
    local fs_sarif="${2:-}"
    local iac_sarif="${3:-}"

    if [ "$status" = "skipped" ]; then
        add_check "Trivy Security Scan" "skipped" "Skipped by configuration"
    elif [ "$status" = "success" ]; then
        add_check "Trivy Security Scan" "success" "No security issues found in filesystem or IaC"
    else
        local details="Security issues detected"
        local fs_count=0
        local iac_count=0

        # P1: SR-2 - Explicit file existence check before parsing
        if [ -n "$fs_sarif" ] && [ -f "$fs_sarif" ]; then
            local raw_count
            raw_count=$(jq '[.runs[].results // []] | add | length' "$fs_sarif" 2>/dev/null || echo "0")
            fs_count=$(_safe_numeric "$raw_count" 0)
        else
            [ -n "$fs_sarif" ] && log_warning "Trivy FS SARIF file not found: $fs_sarif"
        fi

        # P1: SR-2 - Explicit file existence check before parsing
        if [ -n "$iac_sarif" ] && [ -f "$iac_sarif" ]; then
            local raw_count
            raw_count=$(jq '[.runs[].results // []] | add | length' "$iac_sarif" 2>/dev/null || echo "0")
            iac_count=$(_safe_numeric "$raw_count" 0)
        else
            [ -n "$iac_sarif" ] && log_warning "Trivy IaC SARIF file not found: $iac_sarif"
        fi

        if [ "$fs_count" -gt 0 ] || [ "$iac_count" -gt 0 ]; then
            details="Found $fs_count filesystem issues and $iac_count IaC issues"
        fi

        add_check "Trivy Security Scan" "failure" "$details"
    fi
}

# Add license compliance check result
add_license_check() {
    local status="$1"
    local license_log="${2:-}"

    if [ "$status" = "success" ]; then
        add_check "License Compliance" "success" "All dependencies use approved licenses"
    else
        add_check "License Compliance" "failure" "Found dependencies with unapproved licenses" "$license_log"
    fi
}

# Add security audit summary
add_security_audit_summary() {
    local security_audit_log="${1:-$REPORT_DIR/security-audit.log}"

    if [ ! -f "$security_audit_log" ]; then
        return 0
    fi

    add_log_section "Security Audit Details" "$security_audit_log" 100
}

# Add vulnerability summary from npm audit
# P2: SR-4 - Use safe numeric handling for all jq values
add_vulnerability_summary() {
    local npm_audit_json="${1:-$REPORT_DIR/npm-audit.json}"

    if [ ! -f "$npm_audit_json" ]; then
        log_warning "npm audit file not found: $npm_audit_json"
        return 0
    fi

    # Extract vulnerability counts by severity with safe numeric handling
    local critical high moderate low info
    local raw_critical raw_high raw_moderate raw_low raw_info

    raw_critical=$(jq -r '.metadata.vulnerabilities.critical // 0' "$npm_audit_json" 2>/dev/null || echo "0")
    raw_high=$(jq -r '.metadata.vulnerabilities.high // 0' "$npm_audit_json" 2>/dev/null || echo "0")
    raw_moderate=$(jq -r '.metadata.vulnerabilities.moderate // 0' "$npm_audit_json" 2>/dev/null || echo "0")
    raw_low=$(jq -r '.metadata.vulnerabilities.low // 0' "$npm_audit_json" 2>/dev/null || echo "0")
    raw_info=$(jq -r '.metadata.vulnerabilities.info // 0' "$npm_audit_json" 2>/dev/null || echo "0")

    # P2: SR-4 - Validate numeric values
    critical=$(_safe_numeric "$raw_critical" 0)
    high=$(_safe_numeric "$raw_high" 0)
    moderate=$(_safe_numeric "$raw_moderate" 0)
    low=$(_safe_numeric "$raw_low" 0)
    info=$(_safe_numeric "$raw_info" 0)

    # Calculate total for summary
    local total=$((critical + high + moderate + low + info))

    local summary="| Severity | Count |
|----------|-------|
| 🔴 Critical | $critical |
| 🟠 High     | $high |
| 🟡 Moderate | $moderate |
| 🔵 Low      | $low |
| ⚪ Info     | $info |
| **Total**   | **$total** |

**Minimum severity threshold:** $FAIL_ON_SEVERITY"

    add_section "Vulnerability Breakdown" "$summary"
}

# Generate complete security report
generate_security_report() {
    local codeql_status="${1:-skipped}"
    local dependency_status="${2:-skipped}"
    local trivy_status="${3:-skipped}"
    local license_status="${4:-success}"

    init_security_report

    # Add all checks
    add_codeql_check "$codeql_status"
    add_dependency_scan_check "$dependency_status" "$REPORT_DIR/npm-audit.json"
    add_trivy_check "$trivy_status" "$REPORT_DIR/trivy-fs-results.sarif" "$REPORT_DIR/trivy-iac-results.sarif"
    add_license_check "$license_status" "$REPORT_DIR/license-report.txt"

    # Add additional sections
    add_vulnerability_summary
    add_security_audit_summary

    # Finalize the report
    finalize_report

    # Return appropriate exit code
    if [ $REPORT_FAILED -gt 0 ]; then
        return 1
    fi
    return 0
}

# Export functions
export -f init_security_report
export -f add_codeql_check
export -f add_dependency_scan_check
export -f add_trivy_check
export -f add_license_check
export -f add_security_audit_summary
export -f add_vulnerability_summary
export -f generate_security_report

# If script is executed directly (not sourced), show usage
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    cat <<EOF
Usage: source security-report.sh

Functions available:
  - init_security_report
  - add_codeql_check <status>
  - add_dependency_scan_check <status> [npm-audit-log]
  - add_trivy_check <status> [fs-sarif] [iac-sarif]
  - add_license_check <status> [license-log]
  - add_security_audit_summary [audit-log]
  - add_vulnerability_summary [npm-audit-json]
  - generate_security_report <codeql> <dependency> <trivy> <license>

Environment Variables:
  - REPORT_DIR: Directory for reports (default: security-reports)
  - FAIL_ON_SEVERITY: Minimum severity to fail (default: high)

Example:
  export REPORT_DIR=security-reports
  export FAIL_ON_SEVERITY=high
  source security-report.sh
  generate_security_report success success success success

EOF
fi
