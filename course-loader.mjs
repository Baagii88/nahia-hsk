export function withTimeout(promise,ms,message){
 let timer;return Promise.race([promise,new Promise((_,reject)=>timer=setTimeout(()=>reject(Error(message)),ms))]).finally(()=>clearTimeout(timer));
}
export async function readSavedCourses(store,ms=6000){
 const [courses,assets]=await withTimeout(Promise.all([store.courses(),store.metadata()]),ms,'Хадгалсан номын сан хариу өгөхгүй байна. Бусад Нахиа цонхыг хаагаад «Дахин холбох»-ыг дараарай. Бэлэн хичээлүүдийг одоо ашиглаж болно.');
 return {courses,assets};
}
