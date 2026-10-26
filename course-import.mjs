import {openCourseZip} from './course-zip.mjs';
import {cleanCourse,assetNameSafe} from './course-model.mjs';
export async function importCoursePack(file,{store,JSZip,existing=[],signal,onProgress=()=>{},confirmReplace=async()=>true,readText=async()=>'',estimate}={}){
 const check=()=>{if(signal?.aborted)throw new DOMException('Импорт цуцлагдлаа.','AbortError')};
 const report=(label,done=0,total=1)=>onProgress({label,done,total});
 const staged=[];let committed=false;
 try{
  check();report('Багцыг таньж байна…');const zip=await openCourseZip(file);check();
  const manifests=[...zip.entries.keys()].filter(n=>n==='nahia-course.json'||n.endsWith('/nahia-course.json'));
  if(manifests.length!==1)throw Error('Энэ нь Нахиагийн хичээлийн багц биш байна. old-1.nahia-course.zip зэрэг файлыг сонгоорой. Номын ердийн ZIP-д «Номын хавтас холбох»-ыг ашиглана.');
  const name=manifests[0],prefix=name.slice(0,-'nahia-course.json'.length);
  if(zip.entries.get(name).size>2*1024**2)throw Error('Багцын хичээлийн мэдээлэл хэт том байна.');
  let m;try{m=JSON.parse(await (await zip.blob(name,JSZip)).text())}catch{throw Error('Багцын хичээлийн мэдээлэл уншигдсангүй.')}
  if(m.app!=='nahia-course'||m.version!==1||!Array.isArray(m.assets)||m.assets.length>2000)throw Error('Нахиа багцын бүтэц эсвэл хувилбар тохирохгүй байна.');
  const course=cleanCourse(m.course),seen=new Set();let total=0;
  for(const a of m.assets){
   if(!assetNameSafe(a.id)||seen.has(a.id)||a.courseId!==course.id||!['textbook','workbook','textbook-audio','workbook-audio'].includes(a.role)||a.unitId&&!course.units.some(u=>u.id===a.unitId)||a.role.endsWith('-audio')&&!a.unitId)throw Error('Багцын ном, аудионы бүлгийн холбоос буруу байна.');
   const allowed=a.role.endsWith('-audio')?['MP3','M4A','WAV','OGG','AAC']:['PDF','EPUB','DOCX','TXT','MD'];
   if(!allowed.includes(a.format))throw Error('Багцын файлын өргөтгөл тохирохгүй байна.');
   const entry=zip.entries.get(prefix+'files/'+a.id);if(!entry)throw Error('Багц дотор файл дутуу: '+a.name);seen.add(a.id);total+=entry.size;
  }
  const old=existing.filter(a=>a.courseId===course.id);
  if(old.length&&!await confirmReplace(course))return null;
  const space=estimate?await estimate():null;
  if(space?.quota&&space.quota-space.usage<total*1.02)throw Error('Төхөөрөмжийн хадгалах зай хүрэлцэхгүй байна. '+Math.ceil(total/1024**2)+' MB сул зай шаардлагатай.');
  const files=[];let done=0;
  for(let i=0;i<m.assets.length;i++){
   check();const a=m.assets[i];report(`${i+1} / ${m.assets.length} · ${a.name}`,done,total);
   const blob=await zip.blob(prefix+'files/'+a.id,JSZip);check();
   if(a.format==='PDF'&&await blob.slice(0,5).text()!=='%PDF-')throw Error('PDF файл гэмтсэн байна: '+a.name);
   const id='import-'+crypto.randomUUID(),entry={id,courseId:course.id,unitId:String(a.unitId||''),role:a.role,name:String(a.name).slice(0,1000),format:a.format,text:!a.role.endsWith('-audio')&&a.format!=='PDF'?await readText(new File([blob],String(a.name)),a.format):''};
   await store.stage({...entry,blob});staged.push(id);files.push(entry);done+=blob.size;report(`${i+1} / ${m.assets.length} файл хадгаллаа`,done,total);await new Promise(r=>setTimeout(r,0));
  }
  check();report('Хичээлийг нээж байна…',total,total);await store.commit(course,files,old.map(a=>a.id));committed=true;
  return {course,assets:files,progress:m.progress||{}};
 }catch(e){if(['NotReadableError','NotFoundError'].includes(e?.name))throw Error('Файлыг уншиж чадсангүй. OneDrive таталт дууссан эсэхийг шалгаад, төхөөрөмжид бүрэн хадгалсан .nahia-course.zip файлаа дахин сонгоорой.');if(e?.name==='QuotaExceededError')throw Error('Төхөөрөмжийн хадгалах зай дүүрсэн байна. Өмнөх хичээл, файлууд хэвээр хадгалагдсан.');throw e}
 finally{if(!committed&&staged.length)await store.discard(staged)}
}
