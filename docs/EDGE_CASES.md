# Prompt Studio — Edge-Case Checklist

Every case below is covered by an automated test in `tests/` (test name in parentheses).
Run with: `./venv/bin/pytest -q`

## A. Persistence ("if someone saves, closes, and opens — is it gone?")
- A1. A saved prompt survives a server restart — data lives in SQLite, not the browser (`test_saved_prompt_survives_restart`)
- A2. Recorded runs survive a restart (`test_runs_survive_restart`)
- A3. Saving identical content does NOT create a duplicate version (`test_identical_version_dedupes`)
- A4. Changing only the model DOES create a new version (`test_model_change_new_version`)
- A5. `init_db()` is idempotent — restart never wipes tables (`test_init_idempotent`)

## B. Owner isolation (anonymous localStorage token)
- B1. Another owner cannot read your prompt → 404 (`test_other_owner_cannot_read`)
- B2. Another owner cannot delete your prompt (`test_other_owner_cannot_delete`)
- B3. Another owner cannot add versions to your prompt (`test_other_owner_cannot_version`)
- B4. Another owner cannot read your runs (`test_other_owner_cannot_read_runs`)
- B5. Another owner cannot grade/override your runs (`test_other_owner_cannot_grade`)
- B6. Missing owner header → 401 on create/list (`test_missing_owner_401`)

## C. Input validation & malformed requests
- C1. Prompt under 10 chars → 400 (`test_run_too_short`)
- C2. Prompt over 20k chars → 400 (`test_run_too_long`)
- C3. Unknown model id → 400 (`test_run_unknown_model`)
- C4. Invalid JSON body → 400, not a crash (`test_run_invalid_json`)
- C5. Empty blocks → 400 "prompt is empty" (`test_create_empty_blocks`)
- C6. Single block over 8000 chars → 400 (`test_block_too_long`)
- C7. Missing / 120+ char title → 400 (`test_title_validation`)
- C8. Checklist: bad type / missing label / >8 items → 400 (`test_checklist_validation`)
- C9. Test-input values must be strings → 400 (`test_test_input_validation`)
- C10. Unknown prompt/version ids → 404 (`test_unknown_ids_404`)
- C11. /api/verdict with missing fields → 400 (`test_verdict_missing_fields`)

## D. {{variable}} handling
- D1. Duplicates dedupe, order preserved (`test_find_variables_dedupe_order`)
- D2. `{{ spaced }}`, hyphens/underscores parse; malformed `{{x` ignored (`test_variable_syntax_edges`)
- D3. Missing variable substitutes to empty string, no crash (`test_substitute_missing`)
- D4. Unicode/emoji values substitute intact (`test_substitute_unicode`)
- D5. Public run with missing variable → 400 naming it (`test_public_missing_variable`)
- D6. Public run ignores unexpected extra variables (`test_public_extra_variables_ignored`)

## E. Unicode round-trips
- E1. Emoji/CJK/RTL in blocks and titles survive DB → API round-trip (`test_unicode_roundtrip`)

## F. Checklist grading (deterministic checks)
- F1. max_words boundary: exactly N passes, N+1 fails (`test_max_words_boundary`)
- F2. min_words boundary (`test_min_words_boundary`)
- F3. contains is case-insensitive (`test_contains_case_insensitive`)
- F4. not_contains (`test_not_contains`)
- F5. Grading with no checklist → 400 (`test_grade_no_checklist`)
- F6. Override flips a verdict, marks it yours, recomputes the score (`test_override_flow`)
- F7. Override with out-of-range index → 400 (`test_override_bad_index`)

## G. Publish & abuse controls
- G1. Publishing someone else's version → 404 (`test_publish_not_owner`)
- G2. Bad slug rejected; duplicate slug → 409 (`test_slug_validation`)
- G3. Unicode-only title still yields a valid slug (`test_slug_from_unicode_title`)
- G4. Unknown/unpublished slug → 404 page and 404 API (`test_unpublished_404`)
- G5. Paid-model versions are pinned to a free model on public runs (`test_public_model_pinning`)
- G6. Per-IP rate limit → 429 after N requests (`test_rate_limit`)
- G7. App daily token budget exhausted → blocked (`test_app_budget`)
- G8. Global daily budget exhausted → blocked (`test_global_budget`)
- G9. Kill switch blocks all public runs (`test_kill_switch`)
- G10. Per-variable 4000-char and total 12000-char caps (`test_input_caps`)
- G11. Visitor input is wrapped in data delimiters (`test_visitor_wrapping`)
- G12. Daily counters reset on date change (`test_usage_date_reset`)

## H. Concurrency
- H1. Two simultaneous version saves both succeed with distinct version numbers — no UNIQUE crash (`test_concurrent_version_saves`)
- H2. Concurrent run recording doesn't lose rows (`test_concurrent_runs`)

## I. No-key behavior
- I1. /api/run without OPENROUTER_API_KEY streams a friendly error pointing at the free key page, HTTP 200 stream (`test_run_no_key_friendly_error`)

- A6. Unsaved builder drafts survive a page reload — autosaved to localStorage on
  every change, restored on load, cleared by Reset (manual browser verification;
  frontend-only, not in the pytest suite)

## Known limitations (by design, documented not tested)
- Clearing browser storage / switching devices orphans the anonymous library
  (Phase 5: magic-link auth) — now surfaced as a warning in the Library view
- Deploys without a mounted volume + DATABASE_PATH wipe the DB
