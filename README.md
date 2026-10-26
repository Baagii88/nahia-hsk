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


Нахиа 3.0 нь 3,021 Google Translate нийлэг аудио, олон дуудлагатай үгийн тусдаа жишээ өгүүлбэр, эх толийн дэлгэрэнгүй тайлбар, номоор сурах хэсэгтэй. Туслах үг 了 le-г 我吃饭了。 өгүүлбэрээр сонсоно.

## Номоор сурах

[Номоор сурах](https://baagii88.github.io/nahia-hsk/#courses) хэсэгт Textbook → Сонсох → Workbook → Тест гэсэн дараалалтай. Нахиагийн Монгол тайлбартай 21 хичээл, 63 тестийн асуулт шууд ашиглагдана. Номын хувилбаруудыг тусад нь сонгоно.

Өгсөн эх хавтасны хуучин HSK-ийн 9 боть, шинэ HSK 1–3-ын 12 сурах бичиг, хуучин HSK-ийн 9 Workbook болон бүлгийн 1,215 аудио файлын холбоос бэлэн. Эх номууд олон нийтэд байршаагүй; «Номын хавтас холбох»-д HSK all books хавтсыг сонгох, эсвэл `.nahia-course.zip` багц импортлоно. Хөтөч тэдгээрийг тухайн төхөөрөмжийн IndexedDB санд хадгална. Шинэ HSK 1–3-ын Workbook, шинэ HSK 4–9-ийн эх файлууд өгсөн хавтаст байхгүй; тэдгээрийг дараа оруулна.

Номын дасгалыг PDF дээр уншиж дэвтэрт ажиллан, өөрөө шалгасан оноо, тэмдэглэл хадгална. Нахиагийн хичээлийн дасгал, тест автоматаар шалгагдана. Сканнердсан хэвлэлийн бүх дасгал интерактив хэлбэрт хөрвөөгүй. Шинэ HSK 1-ийн Textbook, хуучин HSK 1-ийн Workbook-ийн эхлэх хуудсуудыг эхтэй тулгасан; бусад бүлгийн хуудсыг «Бүлэг тохируулах»-д PDF-ийн дугаараар тохируулна.

«Багцаа татах» нь ном, аудио, ахицыг хамтад нь экспортлоно. Автомат үүлэн синк байхгүй. 1 GB хүртэл багц импортлоно; том багцыг компьютероор оруулах, эсвэл ном/бүлгийн аудиог хэсэгчлэн оруулах нь утасны санах ойд тохиромжтой.

## Баталгаажуулалт

`npm test` · `npm run build` · `python verify-assets.py` (FFmpeg шаардлагатай; эх номын локал 12 багцтай үед багцуудыг давхар шалгана).
3,021 нэмэлт аудионы SHA256, ZIP CRC болон FFmpeg задлал шалгагдсан. Энэ нь бичлэг бүрийн дуудлагыг хүн сонсож баталгаажуулсан гэсэн үг биш. Бүх 3,088 хялбаршуулсан HSK ханз зураас болон аудио руу холбогдоно. Эх аудионы гарал, нэмэлт TTS-ийн URL/огноо/хэш `audio-catalog.json`-д бүртгэлтэй.

Локал номын багц дахин бэлтгэхдээ `python prepare-book-packs.py "HSK all books хавтасны бүтэн зам"` ажиллуулна. Эх файлыг өөрчлөхгүй. Багцууд Git checkout-ын гаднах `Nahia-Book-Packs` хавтаст үүснэ.
