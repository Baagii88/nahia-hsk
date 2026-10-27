const TYPES={PDF:'application/pdf',MP3:'audio/mpeg',M4A:'audio/mp4',AAC:'audio/aac',OGG:'audio/ogg',WAV:'audio/wav',EPUB:'application/epub+zip',DOCX:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',TXT:'text/plain;charset=utf-8',MD:'text/plain;charset=utf-8'};
export function typedBlob(blob,format){const type=TYPES[String(format).toUpperCase()];return blob&&type&&blob.type!==type?blob.slice(0,blob.size,type):blob}
export function typedAsset(asset){return asset?.blob?{...asset,blob:typedBlob(asset.blob,asset.format)}:asset}
export function canvasSize(width,height,desiredWidth,pixelRatio=1,maxPixels=2400000){
 const scale=Math.max(.1,desiredWidth/width),ratio=Math.min(2,Math.max(1,pixelRatio),Math.sqrt(maxPixels/(width*height*scale*scale)));
 return{scale,ratio,width:Math.max(1,Math.floor(width*scale*ratio)),height:Math.max(1,Math.floor(height*scale*ratio)),cssWidth:width*scale,cssHeight:height*scale};
}
