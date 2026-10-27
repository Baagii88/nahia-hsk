// Blob ranges avoid reading a 50–110 MB textbook into a single ArrayBuffer.
export function loadBlobPdf(api,blob,options={}){
 let stopped=false,task;const stats={bytes:0,requests:0};
 class BlobRanges extends api.PDFDataRangeTransport{
  constructor(){super(blob.size,new Uint8Array(0),false)}
  requestDataRange(begin,end){
   if(stopped)return;
   blob.slice(begin,Math.min(end,blob.size)).arrayBuffer().then(buffer=>{
    if(stopped)return;stats.bytes+=buffer.byteLength;stats.requests++;this.onDataRange(begin,new Uint8Array(buffer));
   }).catch(error=>{if(!stopped){stopped=true;options.onError?.(error);task?.destroy()}});
  }
  abort(){stopped=true}
 }
 const range=new BlobRanges();
 task=api.getDocument({...options,range,rangeChunkSize:131072,disableAutoFetch:true,disableStream:true,isEvalSupported:false,enableXfa:false,canvasMaxAreaInBytes:16000000});
 return {task,stats,destroy:()=>{stopped=true;return task.destroy()}};
}
