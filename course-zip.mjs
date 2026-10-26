// Read the ZIP directory and selected slices, never the entire textbook archive.
const fail=message=>{throw Error(message)};
const view=bytes=>new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
export async function openCourseZip(file){
 if(!file||file.size<22)fail('Багц хоосон эсвэл ZIP бүтэцтэй биш байна. .nahia-course.zip файлаа сонгоорой.');
 if(file.size>1024**3)fail('Багц 1 GB-аас их байна. Номын хавтас холбох аргыг ашиглаарай.');
 const start=Math.max(0,file.size-65557),tail=new Uint8Array(await file.slice(start).arrayBuffer()),tv=view(tail);let end=-1;
 for(let i=tail.length-22;i>=0;i--)if(tv.getUint32(i,true)===0x06054b50&&i+22+tv.getUint16(i+20,true)===tail.length){end=i;break}
 if(end<0)fail('ZIP файл бүрэн татагдаагүй эсвэл гэмтсэн байна. OneDrive таталт дууссан .nahia-course.zip файлыг сонгоорой.');
 if(tv.getUint16(end+4,true)||tv.getUint16(end+6,true))fail('Олон хэсэгт ZIP багц дэмжихгүй.');
 const count=tv.getUint16(end+10,true),length=tv.getUint32(end+12,true),offset=tv.getUint32(end+16,true);
 if(count===65535||offset===0xffffffff)fail('Энэ ZIP64 багцыг номын хавтас холбох аргаар оруулна уу.');
 if(count>4000||length>4*1024**2||offset+length>start+end)fail('ZIP багцын жагсаалтын бүтэц буруу байна.');
 const bytes=new Uint8Array(await file.slice(offset,offset+length).arrayBuffer()),dv=view(bytes),entries=new Map();let at=0,total=0;
 for(let i=0;i<count;i++){
  if(at+46>bytes.length||dv.getUint32(at,true)!==0x02014b50)fail('ZIP файлын жагсаалт гэмтсэн байна.');
  const flags=dv.getUint16(at+8,true),method=dv.getUint16(at+10,true),packed=dv.getUint32(at+20,true),size=dv.getUint32(at+24,true),n=dv.getUint16(at+28,true),extra=dv.getUint16(at+30,true),comment=dv.getUint16(at+32,true),local=dv.getUint32(at+42,true),next=at+46+n+extra+comment;
  if(next>bytes.length||local>=offset||flags&1||![0,8].includes(method)||size>300*1024**2)fail('ZIP багцын файл дэмжихгүй бүтэц эсвэл хэмжээтэй байна.');
  const name=new TextDecoder().decode(bytes.subarray(at+46,at+46+n));
  if(entries.has(name)||name.split(/[\\/]/).includes('..'))fail('ZIP дотор давхардсан эсвэл буруу замтай файл байна.');
  entries.set(name,{name,flags,method,packed,size,local,central:bytes.slice(at,next)});total+=size;at=next;
 }
 if(total>1200*1024**2)fail('Задалсан багц хэт том байна.');
 async function blob(name,JSZip){
  const e=entries.get(name);if(!e)fail('Багц дотор файл дутуу: '+name);
  const header=new Uint8Array(await file.slice(e.local,e.local+30).arrayBuffer());if(header.length!==30||view(header).getUint32(0,true)!==0x04034b50)fail('ZIP файлын толгой гэмтсэн байна.');
  const hv=view(header),dataAt=e.local+30+hv.getUint16(26,true)+hv.getUint16(28,true);
  if(hv.getUint16(8,true)!==e.method||dataAt+e.packed>offset)fail('ZIP файлын хэмжээ буруу байна.');
  const data=file.slice(dataAt,dataAt+e.packed);
  if(e.method===0){if(e.packed!==e.size)fail('ZIP файлын хэмжээ таарахгүй байна.');return data}
  // Compressed legacy exports: rebuild a one-entry ZIP so JSZip only holds one file.
  const local=new Uint8Array(30),lv=view(local),nameBytes=new TextEncoder().encode(name),central=e.central.slice(),cv=view(central),eocd=new Uint8Array(22),ev=view(eocd);
  lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(8,8,true);lv.setUint32(14,cv.getUint32(16,true),true);lv.setUint32(18,e.packed,true);lv.setUint32(22,e.size,true);lv.setUint16(26,nameBytes.length,true);
  cv.setUint16(8,0x800,true);cv.setUint32(42,0,true);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,1,true);ev.setUint16(10,1,true);ev.setUint32(12,central.length,true);ev.setUint32(16,local.length+nameBytes.length+e.packed,true);
  const z=await JSZip.loadAsync(await new Blob([local,nameBytes,data,central,eocd]).arrayBuffer());return z.file(name).async('blob');
 }
 return {entries,total,blob};
}
