# CASA MX — Analysis Tools Guide

How to use the code analysis, performance, and quality tools installed in this project.

---

## 1. ai-code-review-mcp — AI-Powered Code Review

**What it does:** MCP server that exposes code review tools to OpenCode. Lets you analyze files, review diffs, and check quality directly from the agent.

**Location:** Installed via pip. Configured in `.opencode/opencode.json`.

**How to use (from OpenCode):**

| Example Prompt | Description |
|---|---|
| "Analyze file src/routes/properties.ts for security issues" | Review a specific file |
| "Review the diff in my current branch" | Review uncommitted changes |
| "Check the project for code quality issues" | General project analysis |
| "Run a code review focusing on error handling" | Targeted review |

**Available MCP tools:**
- `analyze_file` — Analyze a single file
- `review_diff` — Review staged/unstaged changes
- `check_project` — General project analysis

**Note:** Restart OpenCode after modifying the MCP configuration file.

---

## 2. build-size-diff — Bundle Size Monitoring

**What it does:** GitHub Action that tracks bundle size (gzip/brotli) on every push and PR. Posts automatic PR comments showing per-file size changes.

**File:** `.github/workflows/bundle-size.yml`

**How it works:**
- **Push to main/staging:** Creates/updates the bundle size baseline.
- **Pull Request:** Compares PR bundle against baseline and posts a comment.
- The comment shows: total size (gzip/brotli), per-file changes (🔴 ↑ / 🟢 ↓), budget status.

**Local usage:**

```bash
# From casa-mx/
npm run build

# The CI workflow handles this automatically.
# To check sizes locally:
npx next build 2>&1 | grep -E "○|●|λ"  # View generated pages
ls -la .next/static/chunks/ | sort -k5 -n  # View chunks by size
```

**Troubleshooting:**
- **"No baseline found":** Push to main/staging first to create the baseline.
- **Auto-detection failed:** The action auto-detects `.next` for Next.js projects.

**Budget configuration (optional):**

To enable budget limits, add to the workflow:
```yaml
with:
  github-token: ${{ secrets.GITHUB_TOKEN }}
  budget-max-increase-kb: 50   # Max allowed increase
  warn-above-kb: 20            # Warning threshold per file
  fail-above-kb: 40            # Fail threshold per file
```

---

## 3. github-action-benchmark — Performance Monitoring

**What it does:** Runs JavaScript benchmarks (Benchmark.js) in CI and stores historical results to detect performance regressions over time.

**Files:**
- `scripts/benchmark.js` — Benchmark suite (JSON.stringify, JSON.parse, Array ops, RegExp)
- `.github/workflows/benchmark.yml` — CI pipeline that runs and stores results

**Local usage:**

```bash
# From casa-mx/
npm run benchmark
# Results written to: benchmark-result.json
```

**In CI:**
- Runs on push to `main` and `staging`.
- Stores historical results on `gh-pages` branch (trend charts).
- Alerts if regression exceeds 200% (configurable via `alert-threshold`).

**Viewing historical results:**
1. Go to Settings > Pages in the GitHub repo.
2. Select `gh-pages` branch as the source.
3. Access at `https://<your-username>.github.io/CASA-MX/`.

**Adding new benchmarks:**

Edit `scripts/benchmark.js` and add blocks:
```js
suite.add('my-operation', () => {
  // code to measure
});
```

---

## 4. unentropy — Continuous Code Metrics

**What it does:** Automatically tracks 3 metrics in CI: lines of code, test coverage, and bundle size. Generates historical reports and PR quality gates.

**Files:**
- `unentropy.json` — Configuration (3 active metrics)
- `.github/workflows/metrics.yml` — Tracking on main branch
- `.github/workflows/quality-gate.yml` — Quality gate on pull requests

**Tracked metrics:**

| Metric | Source |
|---|---|
| Lines of Code | Count of `.ts`, `.tsx`, `.js`, `.jsx` files |
| Test Coverage | Output from `npm test -- --coverage` (Vitest) |
| Bundle Size | Output from `npm run build` (Next.js `.next/`) |

**Local usage:**

```bash
# From casa-mx/
bunx unentropy preview    # Preview report structure
bunx unentropy test       # Verify metrics collection
```

**In CI:**
- **Push to main:** Collects and stores metrics (SQLite artifact).
- **Pull Request:** Quality gate compares against baseline. `soft` mode = warns but does not block.

**Quality Gate (PRs):**
- Automatic PR comment with metric changes.
- `soft` mode: shows warnings, does not block merges.
- To switch to strict mode: `quality-gate-mode: hard` in the workflow.

---

## 5. CodeKritik — Multi-Language Static Analysis

**What it does:** Static analysis suite with 12 MCP tools. Calculates cyclomatic complexity, Halstead metrics, maintainability index, LOC, and more. Supports 20+ languages including TypeScript.

**Location:** `C:\Users\axelj\codekritik\`

**Starting the MCP server:**

```bash
cd C:\Users\axelj\codekritik
venv\Scripts\python.exe mcp_servers\codekritik_metrics_server.py
# Server listening on stdio
```

**12 available MCP tools:**

| Tool | Description |
|---|---|
| `run_static_analysis` | Full static analysis of a directory |
| `get_loc_metrics` | Lines of code (LOC/SLOC/CLOC/BLOC) |
| `get_halstead_metrics` | Volume, difficulty, effort, estimated bugs |
| `get_cyclomatic_complexity` | McCabe complexity per file |
| `get_abc_metrics` | Assignments/Branches/Conditionals |
| `get_maintainability_index` | Maintainability score (0-100) |
| `get_git_commit_stats` | Commit stats by author |
| `get_per_user_commit_summary` | Per-user commit summary |
| `list_analysis_results` | List previous analysis results |
| `read_metric_file` | Read a specific metrics JSON file |
| `scan_for_vulnerabilities` | Heuristic SQL injection + XSS scan |
| `get_supported_languages` | List supported languages |

**How to use from OpenCode:**

| Example Prompt | Result |
|---|---|
| "Run static analysis on the backend src directory" | Full complexity, LOC, Halstead analysis |
| "What files have the highest cyclomatic complexity?" | Ranking of most complex files |
| "Check casa-mx-backend for SQL injection vulnerabilities" | Heuristic security scan |
| "Show me the maintainability index for the frontend" | Maintainability score per file |
| "How many lines of code in casa-mx-backend/src?" | LOC/SLOC/CLOC count |

**Terminal-based analysis (without OpenCode):**

```bash
cd C:\Users\axelj\codekritik

# Static analysis of the backend
venv\Scripts\python.exe static_analyzer.py --dir C:\Users\axelj\casa-mx-backend\src

# Git history analysis
venv\Scripts\python.exe git_history_analysis.py --repo_url https://github.com/AyyJayyC/CASA-MX --since 01-01-2026 --until 06-05-2026 --branch main

# Results in: repo_analysis/<repo>/<branch>/<date>/
```

---

## 6. Quick Reference

| Tool | Run Locally | Runs in CI |
|---|---|---|
| **ai-code-review-mcp** | OpenCode prompt | — (local only) |
| **build-size-diff** | — (CI only) | Push + PR |
| **benchmark** | `npm run benchmark` | Push to main/staging |
| **unentropy** | `bunx unentropy test` | Push to main + PR |
| **CodeKritik** | `python static_analyzer.py --dir <path>` | — (local/MCP only) |

### CI Triggers (Summary)

| Event | What Runs |
|---|---|
| **Push to main/staging** | build-size-diff (baseline), benchmark (tracking), unentropy (metrics), CI tests |
| **Pull Request** | build-size-diff (comparison comment), unentropy (quality gate), CI tests, E2E tests |
| **Manual** | `npm run benchmark`, `bunx unentropy test`, CodeKritik CLI |

---

## Notes

- **Node.js:** Required v18-20. All tools run within this range.
- **Bun:** Required only for `unentropy` commands. Installed at `C:\Users\axelj`.
- **Python 3.11+:** Required for `ai-code-review-mcp` and `CodeKritik`.
- **Stripe / Maps:** Analysis tools do not interact with external paid APIs.
