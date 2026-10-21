from pathlib import Path
import subprocess,shutil
r=Path(__file__).resolve().parent;p=r/'.audit-audio.txt'
assert len(list((r/'dist/audio').glob('*.mp3')))>=10900,'Build dist before decoding'
assert shutil.which('ffmpeg'),'FFmpeg must be installed'
p.write_text(''.join("file '"+str(f.resolve()).replace('\\','/').replace("'","'\\''")+"'\n" for f in sorted((r/'dist/audio').glob('*.mp3'))),encoding='utf8')
try:
 result=subprocess.run([shutil.which('ffmpeg'),'-v','error','-xerror','-threads','1','-f','concat','-safe','0','-i',str(p),'-f','null','-'],capture_output=True,text=True)
 print('FFmpeg complete-library decode exit:',result.returncode);print(result.stderr[:2000]);print('Decoded files:',len(list((r/'dist/audio').glob('*.mp3'))))
finally:p.unlink(missing_ok=True)
