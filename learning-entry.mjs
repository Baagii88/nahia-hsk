import * as review from './review-engine.mjs';
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import { exportDeck, readDeck } from './anki-service.mjs';
window.Learning = { review, JSZip, initSqlJs, exportDeck, readDeck };
