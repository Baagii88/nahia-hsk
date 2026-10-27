# Nahia Studio — sources and licenses

Nahia Studio 2 is distributed under GNU AGPL v3 or later, including combined work with GPL v3 components. Full corresponding source is public at https://github.com/Baagii88/nahia-hsk . See COPYING. The v1 original code retains its MIT notice in LICENSE.v1-MIT. Dataset licenses remain separate.

## AnkiDroid / Anki-Android

Source supplied locally: Anki-Android-main. Upstream: https://github.com/ankidroid/Anki-Android . GPL-3.0-or-later.

The smooth-path drawing logic in `studio.js` is a JavaScript adaptation of `AnkiDroid/src/main/java/com/ichi2/anki/ui/windows/reviewer/whiteboard/WhiteboardView.kt`, SmoothPath.drawAlong. Copyright (c) 2025 Brayan Oliveira. Original GPL license is included under licenses/AnkiDroid-GPL-3.0.txt in the deployed site. Android-specific Kotlin screens, the Anki native backend, AnkiWeb synchronization and Android packaging are not part of this web app.

## Anki-xiehanzi

Source supplied locally: Anki-xiehanzi-main. Upstream: https://github.com/krmanik/Anki-xiehanzi . Author: Mani (krmanik).

Reused: Hanzi Writer distribution, per-character stroke paths and medians, HSK word metadata, character etymology and 214-radical data. Writing interaction and deck interoperability are adapted to Nahia's static UI. Original License.md is served as licenses/Anki-xiehanzi.md. Stroke data: Copyright 1999 Arphic Technology Co., Ltd.; Copyright 2016 Shaunak Kishore, Arphic Public License, included as licenses/ARPHICPL.TXT. Dictionary and source-specific terms remain in DATA-LICENSE.md and the upstream license.

## Runtime libraries

- Hanzi Writer: MIT, Copyright Chanind and contributors, https://github.com/chanind/hanzi-writer . Existing bundled license notice preserved.
- ts-fsrs 5.4.2: MIT, Copyright ishiko and contributors, https://github.com/open-spaced-repetition/ts-fsrs . The FSRS scheduler uses standard parameters and 90% requested retention. It does not optimize parameters from this user's history or synchronize with Anki.
- genanki-js 2.0.0: AGPL-3.0-or-later, Copyright 2021 Mani; derived from mkanki, Copyright 2018 Jeremy Apthorp. https://github.com/krmanik/genanki-js . Package API used for interoperable classic Anki .apkg collections.
- sql.js 1.15.1: MIT, Copyright sql.js authors. https://github.com/sql-js/sql.js
- JSZip 3.10.2: MIT, Copyright Stuart Knightley, David Duponchel, Franz Buchinger, António Afonso. https://github.com/Stuk/jszip
- file-saver: MIT, Copyright 2016 Eli Grey. https://github.com/eligrey/FileSaver.js
- js-sha256: MIT, Copyright Chen, Yi-Cyuan 2017.
- big-integer: Unlicense, Copyright Peter Olson and contributors.

Third-party library legal notices are retained in vendor/learning.js. Full source, pinned dependency versions and the build script are in the repository. npm package contents are obtainable from the public registry using package-lock.json.

## Scope of Anki interoperability

Nahia exports classic .apkg with new cards, optional available MP3s and offline stroke practice. It imports note text from uncompressed classic collections up to 1000 notes. Modern zstd/protobuf .anki21b packages must first be exported with Anki's older-version compatibility setting. Imported HTML is reduced to plain text; arbitrary templates, embedded scripts and media are not executed. Scheduling history is not imported/exported and AnkiWeb sync is not implemented.

## PDF reader

- PDF.js / pdfjs-dist 6.4.299: Apache-2.0, Copyright Mozilla Foundation and contributors. https://github.com/mozilla/pdf.js . Reader and dedicated worker are bundled locally; CMaps, standard fonts, decoder WASM/ICC resources and the PDF.js license are copied under vendor/pdf/. No publisher PDF is bundled or uploaded to the public site.
- @napi-rs/canvas is an optional PDF.js dependency used by the Node regression/rendering tests, not by the browser reader. Its package license and notices remain in node_modules during local/CI installation.
