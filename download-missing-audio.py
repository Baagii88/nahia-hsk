from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlencode
import json,hashlib
folder=Path('audio-audit');folder.mkdir(exist_ok=True)
url='https://translate.google.com/translate_tts?'+urlencode({'ie':'UTF-8','client':'tw-ob','tl':'zh-CN','q':'一下'})
request=Request(url,headers={'User-Agent':'Mozilla/5.0','Referer':'https://translate.google.com/'})
with urlopen(request,timeout=30) as response:
 data=response.read();mime=response.headers.get('Content-Type','')
 if 'audio' not in mime:raise ValueError('Response is not audio: '+mime)
file=folder/'cmn-一下.mp3';file.write_bytes(data)
(folder/'google-translate-source.json').write_text(json.dumps({'text':'一下','requestedLanguage':'zh-CN','source':url,'sourcePage':'https://translate.google.com/?sl=zh-CN&tl=mn&text=%E4%B8%80%E4%B8%8B&op=translate','provider':'Google Translate TTS','synthesized':True,'downloadedAt':'2026-10-21','filename':file.name,'mimeType':mime,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest(),'listeningReviewed':False},ensure_ascii=False,indent=2),encoding='utf8')
print('Downloaded audio bytes:',len(data));print('Content-Type:',mime)
