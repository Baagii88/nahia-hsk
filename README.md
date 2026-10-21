# Нахиа Studio 🌱

**[Нахиа аппыг нээх →](https://baagii88.github.io/nahia-hsk/)**

Хятад хэлийг сонсож, тогтоож, өөрийн гараар бичиж сурах монгол интерфэйстэй вэб апп. Утас, компьютерийн хөтөч дээр ажиллана.

## Суралцах боломжууд

- HSK 1–6, 7–9 түвшний 11,073 үгийн бичлэг, 10,900 дуудлага, 593 дүрэм.
- 4,421 ханзын зураас: дараалал үзэх, зураас тус бүр үзэх, дагаж бичих, цээжээр бичих, зөв/буруу зураасыг шалгах.
- Чөлөөт бичгийн самбар, арилгах, алхам буцах.
- Уламжлалт ханз, жуинь, үгийн аймаг, өнгөөр ялгасан хөг, ханзын бүтцийн тайлбар, 214 язгуур.
- FSRS давтлага: Дахиад / Хэцүү / Мэднэ / Хялбар гэсэн үнэлгээ, давтах хугацаа, 90% зорилтот тогтоолт.
- Өөрийн үгээр багц үүсгэх, TSV/TXT болон нийцтэй .apkg багц оруулах.
- Дуудлага, офлайн ханзын дасгалтай .apkg багц татах; бусад нийцтэй картын аппд оруулах.
- Хайлт, сорил, хадгалсан үгс, өдрийн зорилго, бичгийн ахиц, 14 өдрийн график, бараан горим.
- Ахицын JSON нөөц хуулбар, сэргээх; утасны нүүр дэлгэцэд нэмэх.

Зарим анхан шатны үгийн тайлбар монгол, үлдсэн нь англи, дүрмийн эх материал хятад хэлээр. Ахиц тухайн хөтөчдөө хадгалагдана; төхөөрөмж хооронд автоматаар синк хийхгүй. Анхны ачааллын дараа үндсэн үгийн сан, өмнө нээсэн ханзын зураас офлайн ажиллана. Дуудлага интернэт шаардаж болно.

## Картын багц

Нэг импорт 25 MB / 1000 карт хүртэл, нийт 2500 хувийн карт. Нэг экспорт 350 карт хүртэл. Импортын HTML-г цэвэрлэж энгийн текст болгоно; дурын скрипт, загвар, медиа ажиллуулахгүй. .apkg нь шинэ карт экспортлоно, давтлагын түүхийг бусад апптай синк хийхгүй. Орчин үеийн шахалттай .anki21b багцыг эх апп дээрээ хуучин хувилбарт нийцүүлэх сонголттой экспортлоод оруулна.

Давтлагын гарын товч: **Space** — хариу харах, **1–4** — үнэлэх.

## Хөгжүүлэх

Node.js 22+, Python 3.11+:

```sh
npm ci
npm test
npm run build
python -m http.server 4175 --directory dist
```

`main` салбар шинэчлэгдэхэд GitHub Actions шалгалтуудыг ажиллуулж, Pages-д автоматаар нийтэлнэ. `audio-*.zip` нь дуудлага; `studio-assets.zip` нь зураас, баяжуулсан толь болон эхийн лицензүүд. `prepare_studio.py` нь хэрэглэгчийн өгсөн Anki-xiehanzi-main хавтсаас эдгээрийг дахин бэлдэх скрипт; энгийн build хийхэд эх хавтас шаардлагагүй. Browser bundle-ийг `bundle.mjs` pinned npm сангуудаас үүсгэнэ.

Шалгалтууд: FSRS хуваарь/хуучин ахицын шилжилт; бодит SQLite .apkg үүсгэх ба буцаан унших; медианы бүрдэл; дэмжихгүй шахалттай багцын тайлбар. Build нь үг, дүрэм, дуудлагын нийт тоог шалгана.

## Нээлттэй эхийн нэгтгэл

AnkiDroid-ийн smooth-path бичгийн самбарын логикийг JavaScript руу хөрвүүлэв. Anki-xiehanzi сангийн Hanzi Writer хөдөлгүүр, ханзын зураас, HSK мэдээлэл, бүтцийн тайлбар, язгуурын өгөгдлийг Нахиагийн интерфэйстэй холбов. Android-ийн натив дэлгэц, AnkiWeb синк, Android APK энэ вэб хувилбарт багтаагүй.

Нахиа Studio 2: **AGPL-3.0-or-later**, бүрэн эх нь энэ repository-д нээлттэй. [COPYING](COPYING), [THIRD-PARTY.md](THIRD-PARTY.md), [DATA-LICENSE.md](DATA-LICENSE.md). Анхны v1 кодын MIT мэдэгдэл [LICENSE.v1-MIT](LICENSE.v1-MIT)-д хадгалагдсан.


## Studio 2.1

HSK writing now follows the selected level and exposes every word and character. Exact level-specific pinyin and matching dictionary readings are used; shared recordings for 43 cross-level polyphones are withheld pending listening review. The missing 一下 clip is supplemented with Google Translate synthesized Chinese speech, with provenance in `audio-audit/`.

21 Nahia-authored Mongolian grammar lessons and four starter reading materials are included. The personal library stores PDF, EPUB, DOCX, TXT, Markdown and HTML locally in IndexedDB. EPUB/DOCX/HTML are reduced to safe text; PDF uses the browser viewer with a download fallback. Files do not sync between devices.

Run `python audit-data.py` for structural coverage; with the supplied sibling source folders present it also compares every HSK character path and vocabulary entry with the original data. `python decode-audio.py` requires FFmpeg and an existing `dist/` build. Structural and decoder checks do not certify every recording’s spoken reading.


Studio 2.1.1 corrects the contextual traditional form of grammatical `了 le` to `了` (not `瞭`), identifies the audio filename by the HSK form and explicitly distinguishes file availability from listening verification. The shared 了 recording is withheld pending a pronunciation-specific review. `python audit-orthography.py --output PATH` produces a full script-pair/audio-link CSV; source pairs are not presented as independently verified conversions. References: https://stroke-order.learningweb.moe.edu.tw/dictMean.jsp?ID=20102&la=0 and https://dict.variants.moe.edu.tw/dictView.jsp?ID=30045 .
