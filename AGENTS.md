# Agent instructions

## Maintaining this file

- Keep this handoff current after authorized work. Update repository state, useful discoveries, validation results, known limitations, and remaining work when they change.
- Correct stale information instead of appending a chronological activity log. Distinguish verified facts from assumptions and provide enough context for another agent to continue.
- This file is intended for a public repository. Never include credentials, tokens, passwords, personal information, private application or document contents, or sensitive logs.
- Use repository-relative paths and generic placeholders for personal filesystem paths and machine identifiers. Review additions for private data before saving or committing.
- Read any additional applicable `AGENTS.md` files.

## User preferences

- Discuss issues and proposed solutions by default. Do not change files unless the user explicitly requests implementation.
- Once the user requests a change, carry it through implementation and appropriate verification. Do not ask again for authorization already given in the conversation.
- Commit, push, tag, publish, and install only when requested. Creating this file does not authorize those actions.
- Keep progress updates and final answers concise. Distinguish source changes, built packages, published releases, installed files, and behavior verified in a running GNOME session.
- Do not delegate to other agents unless explicitly requested.

## Repository

- This is `tiagosantosvdl/ArcMenu`, a GNOME Shell extension written in GJS using ES modules.
- Extension UUID: `arcmenu@tiagosantosvdl.github.com`.
- Dash to Panel integration UUID: `dash-to-panel@tiagosantosvdl.github.com`.
- Settings schema: `org.gnome.shell.extensions.arcmenu`. Preserve existing preferences and schema compatibility.
- Edit source under `src/`. The Makefile copies its contents into the root of `_build/` for packaging.
- Menu layouts live in `src/menulayouts/`; preferences live in `src/settings/`; schemas, assets, and translations live in `schemas/`, `data/`, and `po/`.
- Inspect neighboring extension repositories when useful, but do not modify them unless the user includes them in the requested scope.
- Check `git status` before editing and preserve unrelated changes.
- Keep the README explicit that this repository is a fork, link to upstream ArcMenu, and state that the fork is maintained by Codex. Installation and support instructions should point to this repository.

## Current state and handoff

Recorded 2026-10-12; recheck Git, GitHub, and installed files when taking over.

- Repository: https://github.com/tiagosantosvdl/ArcMenu; branch `master`; `origin` uses SSH.
- Current version: **70.0.3 (76)**; tag `v70.0.3`; release commit `e4b8199`.
- Release: https://github.com/tiagosantosvdl/ArcMenu/releases/tag/v70.0.3. Publication and ZIP, Debian package, and checksum assets were verified in the preceding session.
- Version 70.0.3 was installed locally. Installed metadata and changed source files matched the verified local build, and the removed `updateNotifier.js` was absent. A complete comparison against the published ZIP was not performed.
- The release passed 12 startup regression cases, seven Python packaging tests, JavaScript syntax checks, schema validation, and whitespace checks. The release workflow succeeded. Local npm/ESLint were unavailable; check availability again rather than assuming that persists.
- Documentation now describes this fork's installation, development, and release workflow, links to upstream ArcMenu, and identifies Codex as the maintainer. This handoff includes shared guidance from the neighboring Forge repository. Check Git and the remote branch for documentation commit and push status.
- No feature work is outstanding from these requests. Fresh-login behavior and a complete GNOME Shell compatibility matrix remain unverified.
- Installation does not reload an already imported extension. The user was advised to log out and back in; do not assume they did so or that ArcMenu is currently enabled.


## Behavior to preserve

- An active panel extension may not have created its panels yet. Subscribe to readiness signals before attempting integration; wait for valid wrappers instead of treating `Main.panel` as an extension panel wrapper.
- Track controllers before initialization begins so failures can clean up partial state. Register hotkeys after the menu layout is ready.
- Clean up signals, hotkeys, DBus services, actors, and input-source overrides on failure and disable. Only remove a global callback owned by the controller being destroyed.
- Preserve both extension enable orders, multiple monitors, and primary standalone panel behavior.
- Release notifications, including thank-you, donation, and “What's new?” notices, were removed at the user's request. Do not reintroduce them. Release notes remain accessible in Preferences.

## Verification

Use checks appropriate to the change:

```sh
node --check src/extension.js
node tests/panel_startup_test.js
python3 -m unittest discover -s tests -p '*test.py'
glib-compile-schemas --strict --dry-run schemas
git diff --check
```

- Run `node --check` on every changed JavaScript file; the release workflow checks all JavaScript under `src/`.
- `tests/panel_startup_test.js` exercises real controller and extension logic with mocked Shell dependencies. It covers panel readiness, enable order, monitor selection, and initialization cleanup.
- `tests/release_package_test.py` checks ZIP and Debian packaging without installing into the running session.
- If npm and dependencies are available, use `npm run lint:ci` for linting. `npm run lint` rewrites files with `--fix`.
- Mocked tests and syntax checks do not establish that startup works in GNOME Shell. Report any missing session verification accurately.
- Do not install packages or restart the user's desktop merely to run checks.
- Isolate tests and diagnostics with temporary configurations and memory-backed settings where appropriate. Never fall back to writes against live dconf when isolated testing fails.
- If sandbox restrictions block isolated tests, use the environment's approval mechanism for a suitable rerun or report the limitation. Do not alter desktop settings to make tests pass.

## Releases and installation

When the user requests a release:

1. Bump `version-name` in `metadata.json` using the appropriate release increment and increment the integer `version`.
2. Update `README.md` version examples and prepend release notes in `RELEASENOTES.md`, preserving its Pango markup format.
3. Run relevant checks and build with `make release VERSION=<version-name>`. Providing `VERSION` avoids injecting an earlier Git commit into package metadata before the release commit exists.
4. Verify `dist/SHA256SUMS`, packaged metadata, and changed source files. Generated `_build/`, `_po/`, binaries, and `dist/` artifacts are ignored; do not commit them.
5. Commit with a message describing the change and version. Check the branch, remote head, and tag availability. Never force-push or replace published tags.
6. Push the branch and annotated `v<version-name>` tag atomically. The workflow in `.github/workflows/release.yml` builds and publishes the ZIP, `.deb`, and checksums automatically; local `gh` is not required. Verify workflow success and actual release assets before claiming publication is complete. A tag push alone is not a completed release; the public GitHub REST API can verify workflow and release status.
7. Download published assets into ignored `dist/published-<version>/` and verify their checksums before installation. Local and CI package bytes can differ because of timestamps or build metadata; do not assume a verified local build is identical to the published package.

When installation is also requested:

- For a published release, install the checksum-verified `.deb` from `dist/published-<version>/` using apt. If only a local build was requested, install the verified `dist/gnome-shell-extension-arcmenu-tiagosantosvdl_<version>_all.deb`. Preview the transaction first and inspect unexpected dependencies or removals.
- Administrator authentication may be required. Use the environment's approval mechanism; never request or record the user's password. If sudo cannot authenticate noninteractively, desktop authentication through `pkexec /usr/bin/apt-get install -y <absolute-deb-path>` can be used when available.
- Verify the installed package version with `dpkg-query` and compare installed extension files under `/usr/share/gnome-shell/extensions/arcmenu@tiagosantosvdl.github.com/` against the corresponding checksum-verified ZIP. Verify removed files are absent and check Git status afterward.
- Installed files do not mean the running Shell has loaded them. Advise logging out and back in; do not terminate or restart the desktop without authorization.
- If installation is blocked, report that separately from build and publication success.
