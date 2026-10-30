# Nahia 3.3.1 — vocabulary audit

Every shipped 2025 HSK vocabulary entry has Mongolian and English meanings,
pinyin, and a resolver route to an existing packaged MP3: 11,073 / 11,073.
All 3,088 distinct simplified characters have audio routes and valid stroke data.
All audio archives pass CRC and MP3 signature checks. This is structural
verification, not a claim that every recording has been listened to or that
every machine translation has been reviewed by a linguist.

Improve 13 grammar/particle readings with reviewed Mongolian explanations and
examples. Prefer ID-specific translations over the old character-only glossary,
and retain manual overrides when machine translations reload or regenerate.
Both vocabulary cards and detailed dictionary definitions receive the fixes.

Add an offline reproducible audit, per-word CSV report and packaged-file
regression tests. The 2025 source lists match exactly. Supplied 2021 lists
differ by 1,250 entries (1,249 distinct words) and are reported separately;
they have not been silently relabelled or merged into 2025 levels.

Validation: 33 tests passed; production build passed; zero structural audit
errors. Cloud book/progress sync remains unimplemented.
