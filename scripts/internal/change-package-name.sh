#!/usr/bin/env bash
set -euo pipefail

# Load helper scripts (go up one directory to reach helpers)
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/../helpers/colors-style.sh"
source "$SCRIPT_DIR/../helpers/logging.sh"
source "$SCRIPT_DIR/../helpers/utils.sh"

# Directories to ignore (e.g. node_modules, build artifacts)
IGNORE_DIRS=("node_modules" ".next" "dist" "build" ".turbo")

# Root package file
ROOT_PKG="package.json"

# Get current root package name
# Ensure required tools
require_cmd jq

CURRENT_ROOT_NAME=$(jq -r '.name // empty' "$ROOT_PKG")
if [ -z "$CURRENT_ROOT_NAME" ]; then
  log_error "Couldn't retrieve name from $ROOT_PKG"
  exit 1
fi

log_info "Current root package name: $CURRENT_ROOT_NAME"

# Auto-detect current scope from existing packages
CURRENT_SCOPE=""

# Check if we need to migrate from a specific old scope (look for @foundry first)
find_cmd_scope=( find . -mindepth 2 -type f -name package.json )
for ignore in "${IGNORE_DIRS[@]}"; do
  find_cmd_scope+=( "!" "-path" "*/${ignore}/*" )
done

# Look for @foundry packages first (prioritize packages that need migration)
while IFS= read -r pkg_file && [ -z "$CURRENT_SCOPE" ]; do
  if [ -f "$pkg_file" ] && [ -s "$pkg_file" ]; then
    pkg_name=$(jq -r '.name // empty' "$pkg_file" 2>/dev/null)
    if [ "$pkg_name" != "null" ] && [ -n "$pkg_name" ] && [[ "$pkg_name" =~ ^@foundry/ ]]; then
      CURRENT_SCOPE="enterprise"
      log_info "Found packages with @foundry/ scope that need migration"
      break
    fi
  fi
done < <("${find_cmd_scope[@]}")

# If no @foundry packages found, detect from root or other packages
if [ -z "$CURRENT_SCOPE" ]; then
  if [[ "$CURRENT_ROOT_NAME" =~ ^@([^/]+)/ ]]; then
    CURRENT_SCOPE="${BASH_REMATCH[1]}"
    log_info "Detected current scope from root: @$CURRENT_SCOPE/"
  else
    # Try to find scope from sub-packages
    while IFS= read -r pkg_file && [ -z "$CURRENT_SCOPE" ]; do
      if [ -f "$pkg_file" ] && [ -s "$pkg_file" ]; then
        pkg_name=$(jq -r '.name // empty' "$pkg_file" 2>/dev/null)
        if [ "$pkg_name" != "null" ] && [ -n "$pkg_name" ] && [[ "$pkg_name" =~ ^@([^/]+)/ ]]; then
          CURRENT_SCOPE="${BASH_REMATCH[1]}"
          log_info "Detected current scope from $pkg_file: @$CURRENT_SCOPE/"
          break
        fi
      fi
    done < <("${find_cmd_scope[@]}")
  fi
fi

# Prompt for new root package name
read -p "$(echo -e ${BOLD_YELLOW}"Enter the new root package name: "${NC})" NEW_ROOT_NAME
if [ -z "$NEW_ROOT_NAME" ]; then
  log_error "No package name provided."
  exit 1
fi

log_info "New root package name will be set to: $NEW_ROOT_NAME"
echo

# Function to preview changes in a package.json file.
preview_changes() {
  local pkg_file="$1"
  local original

  # Skip if file doesn't exist or is empty
  if [ ! -f "$pkg_file" ] || [ ! -s "$pkg_file" ]; then
    return 0
  fi

  # Get original name from the file (if present)
  original=$(jq -r '.name // empty' "$pkg_file" 2>/dev/null)
  if [ "$original" = "null" ]; then
    original=""
  fi

  # Determine what the updated package name should be.
  local new_name=""
  if [ "$pkg_file" = "$ROOT_PKG" ]; then
    new_name="$NEW_ROOT_NAME"
  else
    if [ -n "$CURRENT_SCOPE" ] && [[ "$original" =~ ^@${CURRENT_SCOPE}\/ ]]; then
      suffix=${original#@${CURRENT_SCOPE}/}
      new_name="@$NEW_ROOT_NAME/$suffix"
    else
      new_name="$original"
    fi
  fi

  log_info "File: $pkg_file"
  echo "  Package name:"
  echo "    current: $original"
  echo "    new:     $new_name"

  # Preview dependency updates if any.
  for section in dependencies devDependencies; do
    # Check if the section exists and contains any relevant keys.
    if jq -e "has(\"$section\")" "$pkg_file" >/dev/null; then
      # Collect keys matching current scope
      keys=()
      if [ -n "$CURRENT_SCOPE" ]; then
        while IFS= read -r line; do
          keys+=("$line")
        done < <(jq -r --arg section "$section" --arg scope "^@${CURRENT_SCOPE}/" '.[ $section ] | to_entries[] | select(.key | test($scope)) | .key' "$pkg_file" 2>/dev/null)
      fi

      if [ ${#keys[@]} -gt 0 ]; then
        echo "  In $section:"
        for key in "${keys[@]}"; do
          suffix=$(echo "$key" | sed "s/^@${CURRENT_SCOPE}\///")
          new_dep="@$NEW_ROOT_NAME/$suffix"
          echo "    $key  ->  $new_dep"
        done
      fi
    fi
  done
  echo
}

log_info "Preview of changes:"
echo "===================================="
# Preview changes for the root package.json first.
preview_changes "$ROOT_PKG"

# Build find command (to include only package.json files at least one level below the root)
find_cmd=( find . -mindepth 2 -type f -name package.json )
for ignore in "${IGNORE_DIRS[@]}"; do
  find_cmd+=( "!" "-path" "*/${ignore}/*" )
done

# Preview changes for each sub-package.json
while IFS= read -r pkg_file; do
  preview_changes "$pkg_file"
done < <("${find_cmd[@]}")

# Ask for final confirmation
read -p "$(echo -e ${BOLD_YELLOW}"Are you sure you want to apply these changes? (y/N): "${NC})" confirm
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
  log_warn "Operation cancelled by the user."
  exit 0
fi

# Function to update a package.json file
update_pkg() {
  local pkg_file="$1"
  local tmp_file
  tmp_file=$(mktemp)

  # Skip if file doesn't exist or is empty
  if [ ! -f "$pkg_file" ] || [ ! -s "$pkg_file" ]; then
    rm -f "$tmp_file"
    return 0
  fi

  # For the root package, set .name directly to NEW_ROOT_NAME.
  # For sub-packages with a name starting with current scope, rebuild the name.
  # Also update dependency and devDependency keys that start with current scope.
  if [ "$pkg_file" = "$ROOT_PKG" ]; then
    if [ -n "$CURRENT_SCOPE" ]; then
      jq --arg new "$NEW_ROOT_NAME" --arg scope "$CURRENT_SCOPE" '
        .name = $new
        |
        (if has("dependencies") then
           .dependencies |= with_entries(.key |= (if test("^@" + $scope + "/") then ("@" + $new + "/" + sub("^@" + $scope + "/"; "")) else . end))
         else . end)
        |
        (if has("devDependencies") then
           .devDependencies |= with_entries(.key |= (if test("^@" + $scope + "/") then ("@" + $new + "/" + sub("^@" + $scope + "/"; "")) else . end))
         else . end)
      ' "$pkg_file" > "$tmp_file"
    else
      jq --arg new "$NEW_ROOT_NAME" '.name = $new' "$pkg_file" > "$tmp_file"
    fi
  else
    if [ -n "$CURRENT_SCOPE" ]; then
      jq --arg new "$NEW_ROOT_NAME" --arg scope "$CURRENT_SCOPE" '
        if (.name? | test("^@" + $scope + "/")) then
          .name = ("@" + $new + "/" + (.name | sub("^@" + $scope + "/"; "")))
        else
          .
        end
        |
        (if has("dependencies") then
           .dependencies |= with_entries(.key |= (if test("^@" + $scope + "/") then ("@" + $new + "/" + sub("^@" + $scope + "/"; "")) else . end))
         else . end)
        |
        (if has("devDependencies") then
           .devDependencies |= with_entries(.key |= (if test("^@" + $scope + "/") then ("@" + $new + "/" + sub("^@" + $scope + "/"; "")) else . end))
         else . end)
      ' "$pkg_file" > "$tmp_file"
    else
      cp "$pkg_file" "$tmp_file"
    fi
  fi

  mv "$tmp_file" "$pkg_file"
  log_success "Updated $pkg_file"
}

log_info "Applying changes..."
# Update root package.json
update_pkg "$ROOT_PKG"

# Update sub-package.json files:
while IFS= read -r pkg_file; do
  update_pkg "$pkg_file"
done < <("${find_cmd[@]}")

log_success "All updates are complete."
