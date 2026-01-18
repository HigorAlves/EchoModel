#!/usr/bin/env bash
# license-checker.sh - Flexible license checking with deny-list approach
# This avoids having to add every permissive license to an allow-list

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================

# Denied licenses (copyleft licenses that pose legal risks)
# P2: LC-4 - Include common SPDX variations and aliases
DENIED_LICENSES=(
    # GPL variants
    "GPL-1.0"
    "GPL-1.0-only"
    "GPL-1.0-or-later"
    "GPL-2.0"
    "GPL-2.0-only"
    "GPL-2.0-or-later"
    "GPL-3.0"
    "GPL-3.0-only"
    "GPL-3.0-or-later"
    "GPL"
    "GPLv2"
    "GPLv3"
    # AGPL variants
    "AGPL-1.0"
    "AGPL-1.0-only"
    "AGPL-1.0-or-later"
    "AGPL-3.0"
    "AGPL-3.0-only"
    "AGPL-3.0-or-later"
    "AGPL"
    "AGPLv3"
    # LGPL variants
    "LGPL-2.0"
    "LGPL-2.0-only"
    "LGPL-2.0-or-later"
    "LGPL-2.1"
    "LGPL-2.1-only"
    "LGPL-2.1-or-later"
    "LGPL-3.0"
    "LGPL-3.0-only"
    "LGPL-3.0-or-later"
    "LGPL"
    "LGPLv2"
    "LGPLv2.1"
    "LGPLv3"
)

OUTPUT_FILE="${1:-license-report.txt}"

# P1: LC-2 - Use mktemp for safe temp file handling
LICENSE_TEMP=""
cleanup() {
    if [ -n "$LICENSE_TEMP" ] && [ -f "$LICENSE_TEMP" ]; then
        rm -f "$LICENSE_TEMP"
    fi
}
trap cleanup EXIT

echo "📋 Running flexible license compliance check"
echo "Approach: Deny copyleft licenses, allow all others"

# P1: LC-3 - Use npx instead of global npm install
echo "Scanning dependencies..."
LICENSE_TEMP=$(mktemp)

# Use npx to run license-checker without global install
if ! npx license-checker --json --excludePrivatePackages > "$LICENSE_TEMP" 2>/dev/null; then
    echo "::error::Failed to run license-checker"
    exit 1
fi

# Parse and check for denied licenses
echo "Checking for copyleft licenses..."

FOUND_DENIED=0
DENIED_PACKAGES=()

# P2: LC-4 - Normalize license string for comparison
normalize_license() {
    local license="$1"
    # Convert to uppercase for case-insensitive comparison
    echo "$license" | tr '[:lower:]' '[:upper:]' | sed 's/[[:space:]]//g'
}

# Extract licenses and check against deny-list
while IFS= read -r package; do
    license=$(echo "$package" | jq -r '.licenses // empty' 2>/dev/null || echo "")
    pkg_name=$(echo "$package" | jq -r '.name // empty' 2>/dev/null || echo "")

    if [ -z "$license" ] || [ "$license" = "null" ]; then
        continue
    fi

    # Normalize the license for comparison
    normalized_license=$(normalize_license "$license")

    # Check if license is in deny-list
    for denied in "${DENIED_LICENSES[@]}"; do
        normalized_denied=$(normalize_license "$denied")
        if [[ "$normalized_license" == *"$normalized_denied"* ]]; then
            FOUND_DENIED=$((FOUND_DENIED + 1))
            DENIED_PACKAGES+=("$pkg_name: $license")
            echo "::error::DENIED: $pkg_name is licensed under $license"
            break  # Only report each package once
        fi
    done
done < <(jq -c 'to_entries[] | {name: .key, licenses: .value.licenses}' "$LICENSE_TEMP" 2>/dev/null)

# Generate summary report
{
    echo "========================================"
    echo "License Compliance Report"
    echo "Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    echo "========================================"
    echo ""
    echo "Strategy: Deny-list approach"
    echo "Blocked license families: GPL, AGPL, LGPL (all variants)"
    echo ""

    if [ $FOUND_DENIED -eq 0 ]; then
        echo "✅ No copyleft licenses detected"
        echo ""
        echo "All dependencies use compatible licenses."
    else
        echo "❌ Found $FOUND_DENIED package(s) with denied licenses:"
        echo ""
        for pkg in "${DENIED_PACKAGES[@]}"; do
            echo "  - $pkg"
        done
        echo ""
        echo "Please replace or remove these dependencies."
    fi

    echo ""
    echo "========================================"
    echo "All Detected Licenses:"
    echo "========================================"
    jq -r 'to_entries[] | "\(.key): \(.value.licenses)"' "$LICENSE_TEMP" 2>/dev/null | sort -u | sed 's/.*: //' | sort -u

} > "$OUTPUT_FILE"

cat "$OUTPUT_FILE"

# Write to GitHub Step Summary if available
if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    {
        echo "## License Compliance Check"
        echo ""
        if [ $FOUND_DENIED -eq 0 ]; then
            echo "✅ **All licenses are compliant**"
        else
            echo "❌ **Found $FOUND_DENIED package(s) with denied licenses**"
            echo ""
            echo "| Package | License |"
            echo "|---------|---------|"
            for pkg in "${DENIED_PACKAGES[@]}"; do
                echo "| ${pkg%%:*} | ${pkg#*: } |"
            done
        fi
        echo ""
    } >> "$GITHUB_STEP_SUMMARY"
fi

# Exit with error if denied licenses found
if [ $FOUND_DENIED -gt 0 ]; then
    exit 1
fi

exit 0
