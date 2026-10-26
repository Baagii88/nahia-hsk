import * as course from './course-model.mjs';
import * as review from './review-engine.mjs';
import * as pronunciation from './pronunciation.mjs';
import * as writing from './writing-model.mjs';
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import { exportDeck, readDeck } from './anki-service.mjs';
window.Learning = { course, review, writing, pronunciation, JSZip, initSqlJs, exportDeck, readDeck };
