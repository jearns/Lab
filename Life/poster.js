import { illustration } from './illustration.js';
function lines(ctx,text,width){
 const rows=[];let row='';
 for(const char of text){if(char==='\n'){rows.push(row);row='';continue}
 if(row&&ctx.measureText(row+char).width>width){rows.push(row);row=''}row+=char}
 if(row)rows.push(row);return rows;
}
export async function makePoster(chapter,item,excerpt){
 const canvas=document.createElement('canvas');canvas.width=1080;
 let ctx=canvas.getContext('2d');const serif='Georgia, "Songti SC", "Noto Serif CJK SC", serif',sans='"PingFang SC","Microsoft YaHei",sans-serif';
 ctx.font='bold 58px '+serif;const title=lines(ctx,item.title,932);
 ctx.font='38px '+sans;const body=lines(ctx,excerpt,932);
 canvas.height=Math.max(1440,580+title.length*80+body.length*62+165);
 ctx.fillStyle='#f6f3e8';ctx.fillRect(0,0,1080,canvas.height);
 ctx.fillStyle='#84612f';ctx.font='500 34px '+sans;ctx.fillText('高性价比',70,98);
 ctx.fillStyle='#204e40';ctx.font='bold 60px '+serif;ctx.fillText('人生指南',225,100);
 ctx.fillStyle='#52675b';ctx.font='28px '+sans;ctx.textAlign='right';ctx.fillText('阅读文摘',1010,96);ctx.textAlign='left';
 const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(illustration(chapter.id,item.n,item.title));
 await img.decode();ctx.drawImage(img,68,148,944,281);
 ctx.fillStyle='#466454';ctx.font='29px '+sans;ctx.fillText('第 '+chapter.id+' 章　'+chapter.title+'　·　第 '+item.n+' 条',72,503,936);
 let y=597;ctx.fillStyle='#163b30';ctx.font='bold 58px '+serif;
 for(const row of title){ctx.fillText(row,70,y);y+=80}
 y+=28;ctx.font='38px '+sans;for(const row of body){ctx.fillText(row,72,y);y+=62}
 ctx.fillStyle='#6c786e';ctx.fillRect(70,canvas.height-132,940,2);ctx.font='26px '+sans;
 ctx.fillText('摘自 eternity4719《高性价比人生指南》 · CC BY 4.0',72,canvas.height-79);
 ctx.font='23px '+sans;ctx.fillText('github.com/eternity4719/HowToLiveBetter',72,canvas.height-37);
 return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('图片生成失败')),'image/png'));
}
