import { illustration } from './illustration.js';
import { makePoster } from './poster.js?v=004';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(name,fn,cls='')=>`<button class="${cls}" data-do="${fn}">${esc(name)}</button>`;
const link=(name,url)=>`<a class="btn" target="_blank" rel="noopener noreferrer" href="${esc(url)}">${esc(name)}</a>`;
const opts=(items,current)=>items.map(([v,n])=>`<option value="${esc(v)}" ${v==current?'selected':''}>${esc(n)}</option>`).join('');
const repo='https://github.com/eternity4719/HowToLiveBetter';
const base='life.journal.v1';
const nowDay=(d=new Date())=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
function person(name,role){return {id:crypto.randomUUID(),name,role,focus:'成长',phase:'日常生活',load:3,times:['08:00','12:30','19:30'],setup:false,logs:{},prefs:{},stepGoal:0}}
let state=JSON.parse(localStorage.getItem(base)||'null')||{people:[person('我','本人')],active:0};
function save(){localStorage.setItem(base,JSON.stringify(state))}
const p=()=>state.people[state.active], day=()=>p().logs[nowDay()]??={};
let tab='today', screen='', wizard=0, cursor=0, book, chapter='01', entry=1, query='', comment=0, historyPage=0, noticeTimer, readToken=0, familyPage=0;
const comments=window.EMBED?.comments||await fetch('./data/comments.json').then(r=>r.json()).catch(()=>[]);
const icons={today:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2"/>',log:'<path d="M4 20V4m0 16h16M8 15l4-5 4 2 4-7"/>',family:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2m1-14a3 3 0 0 1 0 6m1 2q4 1 4 6"/>',book:'<path d="M12 6q-5-4-10-2v15q5-2 10 2 5-4 10-2V4q-5-2-10 2Zm0 0v15"/>'};
const names={today:'今日',log:'记录',family:'家庭',book:'指南'};
const tasks={
 walk:['活动','出去走一走','选一段舒服的路，回来记下今天的累计步数。','02',11],
 meal:['饮食','记下这一餐','记下吃了什么，以及大致的份量。','02',27],
 move:['活动','起身换个姿势','把正在做的事放一放，起身活动片刻。','02',17],
 water:['饮水','给自己倒杯水','按自己的需要喝水，顺手记录一次。','02',7],
 grow:['成长','给今天留一段专注时间','选一件想做的事，写下何时、在哪里开始。','04',1],
 small:['成长','把难事拆小一点','写下今天能完成的第一步。','04',7],
 child:['亲子','听孩子讲一件事','让孩子选话题，听他说完，再聊聊今天想一起做什么。','30',14],
 elder:['照应','和家人通个电话','问问近况，记下一件对方希望你帮忙的小事。','17',4],
 together:['陪伴','留一段共同时间','约定今天一起做的一件小事和时间。','04',1],
 sleep:['作息','为今天收个尾','记下准备休息的时间，给明天留一点余地。','02',13],
 guide:['阅读','读一条适合自己的指南','读完后，留下一句对自己有用的话。','04',1]};
const focusMap={'活动':['walk','move','water'],'饮食':['meal','water','walk'],'成长':['grow','small','guide'],'家庭':['together','child','elder'],'作息':['walk','move','sleep']};
const roleMap={'孩子':['small','walk','together'],'父母':['walk','together','elder'],'伴侣':['grow','meal','together'],'姐姐':['grow','meal','together']};
function plan(){let u=p(), list=[...(focusMap[u.focus]||focusMap['成长'])];if(u.role==='孩子'&&u.focus==='家庭')list=[...roleMap['孩子']];if(u.phase==='退休生活'&&u.focus==='成长')list=['grow','walk','guide'];if((u.phase==='在校学习'||(u.age>0&&u.age<18))&&u.focus==='成长')list=['small','walk','guide'];return list.slice(0,Number(u.load)).map((k,i)=>({k:u.prefs[i]||k,t:u.times[i],slot:i})).sort((a,b)=>a.t.localeCompare(b.t))}
function pick(){const list=plan(),time=new Date().toTimeString().slice(0,5);let i=list.findIndex(x=>!day()['done'+x.slot]&&x.t>=time);if(i<0)i=list.findIndex(x=>!day()['done'+x.slot]);return Math.max(0,i)}
function toast(s){$('toast').textContent=s;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>$('toast').textContent='',3500)}
function page(title,small,body){$('view').innerHTML=`<div class="between"><h1>${esc(title)}</h1><span class="eyebrow">${esc(small)}</span></div>${body}`}
function shell(title,sub,html){page(title,sub,`<section class="card">${html}</section>`)}
function recommendations(){if(!book)return [];let u=p(), chapters=({'成长':['04','23'],'活动':['02'],'作息':['03','02'],'家庭':u.role==='孩子'?['04','23']:['17','30','10'],'饮食':['02']}[u.focus]||['04']);if(u.interest)return book.chapters.filter(c=>c.id===u.interest).flatMap(c=>c.entries.map(([n,title])=>({c:c.id,n,title})));if((u.age>0&&u.age<18)||u.role==='孩子')chapters=['04','23'];let pool=book.chapters.filter(c=>chapters.includes(c.id)).flatMap(c=>c.entries.map(([n,title])=>({c:c.id,n,title})));if(['活动','作息','饮食'].includes(u.focus)){let pattern={'活动':/走路|步行|快走|连着坐|零碎|运动量/,'作息':/作息|熬夜|午睡|睡眠/,'饮食':/全谷物|水果蔬菜|加工肉|含糖饮料/}[u.focus];pool=pool.filter(x=>pattern.test(x.title))}return pool}
function dailyRead(){let pool=recommendations();let seed=Number(nowDay().replaceAll('-',''));return pool.length?pool[seed%pool.length]:{c:'04',n:1}}
function render(){
 $('identity').textContent=p().name;$('nav').innerHTML=Object.entries(names).map(([k,v])=>`<button class="${tab===k?'active':''}" ${tab===k?'aria-current="page"':''} data-do="tab:${k}"><svg viewBox="0 0 24 24" aria-hidden="true">${icons[k]}</svg>${v}</button>`).join('');
 if(screen==='wizard')return survey();if(screen==='settings')return settings();if(screen==='editSlot')return editSlot();if(screen==='steps'||screen==='meal'||screen==='note')return recordForm();if(screen==='bridge')return bridge();if(screen==='member')return member();if(screen==='history')return history();if(screen==='quiz')return quiz();if(screen==='poster')return poster();if(screen==='read')return reader();if(screen==='comments')return community();
 if(tab==='family')return family();if(tab==='log')return log();if(tab==='book')return library();today()
}
let introSlide = 0;
let showIntro = new URLSearchParams(location.search).has('intro');
const introStats = {stars:76526, forks:6799, date:'2026-11-19'};
let statsChecked = false;

function paintPopularity(stats){
 const box=$('guidePopularity');
 if(!box)return;
 box.innerHTML=`<a href="${repo}/stargazers" target="_blank" rel="noopener"><strong>☆ ${stats.stars.toLocaleString('en-US')}</strong><span>GitHub 星标</span></a><a href="${repo}/forks" target="_blank" rel="noopener"><strong>${stats.forks.toLocaleString('en-US')}</strong><span>项目分叉（Fork）</span></a><small>统计于<br>${esc(stats.date)}</small>`;
}
async function refreshPopularity(){
 let stats=introStats;
 try{const cached=JSON.parse(localStorage.getItem('life.guide.popularity'));if(cached&&Number.isSafeInteger(cached.stars)&&Number.isSafeInteger(cached.forks)&&cached.date>=stats.date)stats=cached}catch{}
 paintPopularity(stats);
 if(statsChecked||stats.date===nowDay())return;
 statsChecked=true;
 try{
  const r=await fetch('https://api.github.com/repos/eternity4719/HowToLiveBetter',{referrerPolicy:'no-referrer'});if(!r.ok)return;
  const {stargazers_count:stars,forks_count:forks}=await r.json();if(!Number.isSafeInteger(stars)||!Number.isSafeInteger(forks))return;
  stats={stars,forks,date:nowDay()};localStorage.setItem('life.guide.popularity',JSON.stringify(stats));paintPopularity(stats)
 }catch{}
}
function guideIntroduction(){
 const choices=['为什么值得读','谁在读','试读一条'];
 const count=book?.chapters.reduce((total,ch)=>total+ch.entries.length,0)||772;
 const panels=[
  `<article class="guideCover"><small>eternity4719 著　·　开放阅读</small><h2 class="cover-title"><span class="title-prefix">高性价比</span><strong class="title-main">人生指南</strong></h2><p>一天只有这么多精力，<br>哪件小事，值得今天就做？</p><div id="guidePopularity" class="guideNumbers"></div></article><p class="introCopy">从坐进车里扣上安全带，到把「以后多陪孩子」写进今晚的日程。${count} 条建议都摊开了成本、可能的收益和证据出处。挑一条用得上的，今天就能试。</p>`,
  `<article class="introReviews"><h2>他们为什么翻开这本书？</h2><section><small>少数派作者 · Benx_AI　/　9 月 28 日</small><p>他认为这本书「值得收藏」，尤其欣赏它把行动的代价、收益和证据摆在一起。他也开发了相关的清单工具。</p><a href="https://sspai.com/post/115118" target="_blank" rel="noopener">读他的完整评价</a></section><section><small>小众软件 · 青小蛙　/　10 月 11 日</small><p>他把它选入「10 个有意思的 GitHub 项目」，点出了一处好用的设计：读到一条建议，顺着出处就能自己查证。</p><a href="https://www.appinn.com/10-tools-github/" target="_blank" rel="noopener">看项目选介</a></section></article>`,
  `<article class="introSamples"><h2>从你今天会遇到的事读起</h2>${[['04','1','想多陪孩子，今晚几点开始？','把愿望写成有时间、有地点的行动。'],['01','1','一家人上车，后排也系好了吗？','读一条几秒钟就能做到的出行建议。'],['04','7','一件难事拖了很久，从哪里下手？','看看怎样把大任务拆成能开始的第一步。']].map(([c,n,t,h])=>`<a href="${guidePath(c,n)}" data-entry="${c}/${n}"><strong>${t}</strong><span>${h}</span></a>`).join('')}</article>`
 ];
 page('今日手记','指南导读',`<section class="card introCard"><div class="introTabs">${choices.map((label,i)=>`<button aria-pressed="${i===introSlide}" data-do="introSlide:${i}">${label}</button>`).join('')}</div><div class="introBody">${panels[introSlide]}</div><div class="actions introFoot">${introSlide!==2?btn('选一条试读','introSlide:2','primary'):btn('浏览全部章节','allChapters')}${btn(p().setup?'回到今日行动':'定制我的一天','introDone')}</div></section>`);
 if(introSlide===0)refreshPopularity()
}

function today(){if(showIntro||!p().setup||!p().sawGuideIntro)return guideIntroduction();
 const list=plan();cursor=Math.min(cursor,list.length-1);const x=list[cursor],a=tasks[x.k],d=day(),done=list.filter(s=>d['done'+s.slot]==='完成').length, status=d['done'+x.slot];page('今日手记',new Intl.DateTimeFormat('zh-CN',{month:'long',day:'numeric',weekday:'short'}).format(new Date()),`<section class="card hero"><div class="between"><span class="label">${esc(x.t)}　/　${a[0]}</span>${btn('关于人生指南','showIntro')}</div><h2>${a[1]}</h2><p>${a[2]}</p><div class="actions">${btn(status?status+' · 撤销':x.k==='guide'?'开始阅读':'去打卡',status?'undo':'check','primary')}${status?'':btn('今天跳过','skip')}</div></section><div class="between"><small>今日完成 ${done} / ${list.length}</small>${btn('查看依据','basis')+btn('安排与提醒','settings')}</div><div class="bar"><i style="width:${done/list.length*100}%"></i></div><div class="between">${btn('上一张','prevTask')}<small>${cursor+1} / ${list.length}</small>${btn('下一张','nextTask')}</div>`)}
function survey(){const u=p();const parts=[
 `<span class="label">生活阶段</span><h2>你的一天怎样度过？</h2><div class="row"><label>年龄（选填）<input id="age" style="width:6em" type="number" min="1" max="120" value="${esc(u.age||'')}"></label><label>称呼<input id="who" maxlength="12" value="${esc(u.name)}"></label></div><label>当前阶段<select id="phase">${opts(['日常生活','退休生活','在校学习','工作生活','照护家人'].map(x=>[x,x]),u.phase)}</select></label>`,
 `<span class="label">当前重心</span><h2>先把精力留给哪件事？</h2><label>首要目标<select id="focus">${opts(Object.keys(focusMap).map(x=>[x,x]),u.focus)}</select></label><label>每天安排<select id="load">${opts([[1,'一件 · 轻量'],[2,'两件 · 适中'],[3,'三件 · 完整']],u.load)}</select></label><label>延伸阅读主题<select id="interest">${opts([['','按目标匹配'],...(book?.chapters||[]).map(c=>[c.id,c.title])],u.interest||'')}</select></label>`,
 `<span class="label">我的节奏</span><h2>什么时候提醒你？</h2>${u.times.slice(0,u.load).map((v,i)=>`<label>行动 ${i+1}<input id="t${i}" type="time" value="${esc(v)}" required></label>`).join('')}`];
 shell('定制生活方案',`${wizard+1} / 3`,`<div class="fill"></div>${parts[wizard]}<div class="actions">${wizard?btn('上一步','wizBack'):''}${btn(wizard===2?'生成我的方案':'下一步','wizNext','primary')}</div><div class="fill"></div>`)}
function settings(){shell('安排与提醒',p().name,`<p>按设备当地时间提醒。选择一项可调整时间和内容。</p>${plan().map(x=>btn(x.t+'　'+tasks[x.k][1],'edit:'+x.slot)).join('')}<div class="actions">${btn('导出日历提醒','calendar')}${btn('开启页面通知','notify')}${btn('重新自测','wizard')}</div><small>日历导入后可在关闭网页时提醒。页面通知需要页面保持打开。</small>`)}
let editing=0, recordSlot=null, mealType='午餐';
function editSlot(){let x=plan().find(v=>v.slot===editing);shell('编辑行动',p().name,`<label>行动<select id="act">${opts(Object.entries(tasks).map(([k,v])=>[k,v[1]]),x.k)}</select></label><label>时间<input id="clock" type="time" value="${x.t}"></label>${btn('保存安排','saveSlot','primary')}`)}
function recordForm(){let d=day();shell(screen==='steps'?'记录步数':screen==='meal'?'记下这一餐':'行动手记',p().name,screen==='steps'?`<label>今天累计步数<input type="number" id="value" min="0" max="200000" value="${d.steps??''}"></label><label>个人步数目标（0 表示暂不设置）<input type="number" id="goal" min="0" max="200000" value="${p().stepGoal}"></label>${btn('保存步数','saveRecord','primary')}`:screen==='meal'?`<label>餐次<select id="mealType">${opts(['早餐','午餐','晚餐','加餐'].map(x=>[x,x]),mealType)}</select></label><label>食物和份量<textarea id="value" rows="2" maxlength="350" placeholder="例如：半碗糙米饭、一掌心鱼、一碗青菜">${esc(d.meals?.[mealType]||'')}</textarea></label>${btn('保存这餐','saveRecord','primary')}`:`<h2>${tasks[plan().find(x=>x.slot===recordSlot)?.k||'grow'][1]}</h2><label>留一句话（可选）<textarea id="value" maxlength="350" rows="2">${esc(d['note'+recordSlot]||'')}</textarea></label>${btn('完成打卡','saveRecord','primary')}`)}
function log(){let d=day();shell('生活记录',p().name,`<span class="label">今日步数</span><strong class="big">${d.steps??'—'}</strong><small>${d.steps==null?'尚未记录':esc(d.stepSource)}　${p().stepGoal?'目标 '+p().stepGoal+' 步 · '+((d.steps||0)>=p().stepGoal?'已达标':'进行中'):''}</small><div class="actions">${btn('录入步数','manualSteps')}${btn('连接步数来源','bridge')}</div><div class="bar"></div><p>饮食记录　${Object.keys(d.meals||{}).length} 餐</p><div class="actions">${btn('记一餐','manualMeal')}${btn('查看过往记录','history')+btn(p().sitAt?'取消休息计时':'开始 45 分钟久坐计时','sit')}</div><small>此设备分成员保存。</small>`)}
function history(){let days=Object.keys(p().logs).filter(k=>Object.keys(p().logs[k]).length).sort().reverse(), rows=[];for(let dt of days){let d=p().logs[dt];if(d.steps!=null)rows.push([dt,'步数',d.steps+' 步 · '+d.stepSource]);for(let [m,v] of Object.entries(d.meals||{}))rows.push([dt,m,v]);for(let i=0;i<3;i++)if(d['done'+i])rows.push([dt,d['title'+i]||'行动',d['done'+i]+(d['note'+i]?' · '+d['note'+i]: '')]);}let x=rows[historyPage%Math.max(1,rows.length)];shell('过往记录',p().name,`<small>${x?esc(x[0]):'暂无记录'}</small><h2>${esc(x?.[1]||'从今天开始')}</h2><div class="reader" id="histText"></div><div class="actions">${rows.length?btn('上一条','historyPrev')+btn('下一条','historyNext'):''}${btn('返回记录','tab:log')}</div>`);if(x){$('histText').textContent=x[2];$('histText').style.overflowY='auto'}}
const relatives=[['伴侣','伴侣'],['大儿子','孩子'],['小儿子','孩子'],['父亲','父母'],['母亲','父母'],['岳父','父母'],['岳母','父母'],['姐姐','姐姐']];
function family(){let list=state.people, start=familyPage*9;shell('我的家庭',list.length+' 位成员',`<p>选择成员，查看或代记对方的行动。</p><div class="grid">${list.slice(start,start+9).map((u,i)=>btn(u.name+(u.setup?' · '+Object.keys(u.logs[nowDay()]||{}).filter(k=>/^done/.test(k)&&u.logs[nowDay()][k]==='完成').length+'/'+u.load:' · 待设置'),'switch:'+(start+i),state.active===start+i?'selected':'')).join('')}</div><div class="actions">${btn('添加成员','member')}${list.length===1?btn('建立九人家庭','template'):''}${list.length>9?btn('换一页','familyPage'):''}</div><small>家庭资料保存在当前浏览器。每位成员有独立目标、提醒和记录。</small>`)}
function member(){shell('添加家庭成员','本机家庭',`<div class="row"><label>年龄（选填）<input id="age" style="width:6em" type="number" min="1" max="120" value="${esc(u.age||'')}"></label><label>称呼<input id="newName" maxlength="12" placeholder="例如：姐姐"></label><label>关系<select id="role">${opts(['伴侣','孩子','父母','姐姐','其他'].map(x=>[x,x]),'其他')}</select></label>${btn('添加并定制方案','add','primary')}`)}
function bridge(){shell('接入每日步数',p().name,`<p>支持 iPhone 快捷指令传入今日累计值。手表先将步数同步到 Apple 健康。</p><p>在快捷指令中获取今天的累计步数，在下方地址末尾替换数字，再用「打开 URL」在保存本档案的浏览器中打开。</p><small>地址只含本机成员编号。首次接入需开启授权，可随时关闭。</small><div class="actions">${btn(p().bridge?'关闭接入':'允许此成员接入','toggleBridge')}${p().bridge?btn('复制接入地址','copyBridge'):''}${btn('详细步骤','bridgeHelp')}</div>`)}
function ingest(){if(!location.hash.startsWith('#steps?'))return;let q=new URLSearchParams(location.hash.slice(7)),u=state.people.find(v=>v.id===q.get('id')),raw=q.get('value');historyReplace();if(!u?.bridge||!/^\d{1,6}$/.test(raw||'')||+raw>200000)return toast('未导入，请检查成员授权和步数');state.active=state.people.indexOf(u);Object.assign(day(),{steps:+raw,stepSource:'快捷指令导入'});autoWalk();save();tab='log';screen='';toast('已更新今日步数')}
function historyReplace(){window.history.replaceState(null,'',location.pathname+location.search)}
function autoWalk(){if(p().stepGoal>0&&day().steps>=p().stepGoal)for(let x of plan())if(x.k==='walk'&&!day()['done'+x.slot])mark(x.slot,'完成')}
const currentChapter=()=>book?.chapters.find(c=>c.id===chapter);
const cache={};
let readSlot=null, activeItem=null, listPositions=new Map(), posterUrl='', posterFile=null, excerptText='', quizStep=0;
const fields=item=>item.body.split(/\n(?=-\s)/).map(s=>{const m=s.match(/^-\s*([^：:\n]+)[：:]\s*([\s\S]*)$/);return m?[m[1],m[2]]:['正文',s]});
function sourceLinks(raw){
 const pattern=/<(https?:\/\/[^>\s]+)>|\[([^\]]+)\]\((https?:\/\/[^\s]+?)\)(?=[\s，。；;）)]|$)|(https?:\/\/[^\s<>，。；「」【】]+)/g;
 let html='',last=0;
 for(const match of raw.matchAll(pattern)){
  const url=match[1]||match[3]||match[4];let host;try{host=new URL(url).hostname}catch{continue}
  html+=esc(raw.slice(last,match.index))+`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(match[2]||host)} ↗</a>`;last=match.index+match[0].length
 }
 return html+esc(raw.slice(last));
}
function listKey(){return query?'?'+query:chapter}
function guidePath(c,n,q=''){return '#guide/'+c+(n?'/'+n:'')+(q?'?q='+encodeURIComponent(q):'')}
function setPath(url){if(location.hash!==url)window.history.pushState(null,'',url||location.pathname+location.search)}
function listRoute(c,q=''){if($('entries'))listPositions.set(listKey(),$('entries').scrollTop);chapter=c;entry=1;query=q;tab='book';screen='';readSlot=null;setPath(guidePath(c,null,q));render()}
function restoreRoute(){
 if(!book)return;
 const url=new URL(location.href),[path,search]=url.hash.slice(1).split('?'),m=path.match(/^guide\/(\d+)(?:\/(\d+))?$/);
 if(!m){if(!path&&tab==='book'){tab='today';screen='';render()}return}
 const ch=book.chapters.find(x=>x.id===m[1]);if(!ch)return;
 chapter=ch.id;entry=Number(m[2]||1);query=new URLSearchParams(search).get('q')||'';tab='book';readSlot=null;
 screen=m[2]&&ch.entries.some(([n])=>n===entry)?'read':'';render()
}
function crumbs(detail=false){
 const ch=currentChapter();return `<div class="crumbs" aria-label="阅读位置">${btn('指南','guideHome')}<span>›</span>${btn(ch.title,'chapterList')}${detail?'<span>›</span><strong>第 '+entry+' 条</strong>':''}${detail&&query?btn('返回搜索','returnSearch'):''}</div>`
}
function library(){
 if(!book)return shell('指南原文','',link('打开作者原站',repo));
 const ch=currentChapter();const rows=query?book.chapters.flatMap(c=>c.entries.filter(([,t])=>t.includes(query)).map(([n,t])=>[c.id,n,t])):ch.entries.map(([n,t])=>[ch.id,n,t]);
 shell('指南原文',book.chapters.length+' 章',`<div class="searchline"><input id="search" aria-label="搜索标题" placeholder="搜索全部条目" value="${esc(query)}">${btn('搜索','search')}</div><label class="pickchapter">章节<select id="chapter">${opts(book.chapters.map(c=>[c.id,c.id+'　'+c.title]),chapter)}</select></label><div class="between"><small>${query?'搜索结果':'本章条目'} · ${rows.length} 条</small><div>${btn('为我选一条','recommend')}${btn('读者讨论','comments')}</div></div><div class="entries" id="entries">${rows.map(([c,n,t])=>`<a href="${esc(guidePath(c,n,query))}" data-entry="${c}/${n}"><span>${query?c+'·':''}${String(n).padStart(2,'0')}</span><b>${esc(t)}</b></a>`).join('')||'<p>没有匹配的标题。试试其他关键词。</p>'}</div><small>eternity4719 · <a href="${repo}" target="_blank" rel="noopener">作者仓库</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a></small>`);
 $('entries').scrollTop=listPositions.get(listKey())||0
}
function openRead(c,n,slot=null){if($('entries'))listPositions.set(listKey(),$('entries').scrollTop);chapter=c;entry=n;readSlot=slot;screen='read';tab='book';setPath(guidePath(c,n,query));render()}
async function loadChapter(c){
 if(cache[c])return cache[c];if(window.EMBED)return cache[c]=window.EMBED.chapters[c];
 const r=await fetch('./data/'+c+'.gz');if(!r.ok)throw Error('章节未载入');const bytes=new Uint8Array(await r.arrayBuffer());
 const raw=bytes[0]===31?await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).text():new TextDecoder().decode(bytes);
 return cache[c]=JSON.parse(raw)
}
async function reader(){
 const ch=currentChapter();if(!ch)return library();const token=++readToken;activeItem=null;
 const url=repo+'/blob/'+book.version+'/book/'+encodeURIComponent(ch.path);
 shell('条目阅读',ch.id+' / '+entry,`${crumbs(true)}<div class="readscroll" id="paper">载入正文中…</div>`);
 try{const data=await loadChapter(ch.id);if(token!==readToken||screen!=='read')return;
 const item=data.find(e=>e.n===entry);activeItem=item;const pos=data.indexOf(item);
 $('paper').innerHTML=`<div class="art">${illustration(ch.id,item.n,item.title)}</div><h2>${esc(item.title)}</h2><div class="readtools">${btn('做个自测','quiz')}${btn('生成文摘图','poster','primary')}${btn(readSlot===null?'收进计划':'完成阅读',readSlot===null?'pinRead':'finishRead')}</div>${fields(item).map(([k,v])=>`<section><h3>${esc(k)}</h3><p>${sourceLinks(v)}</p></section>`).join('')}<p>${link('作者原页',url)}</p><div class="readtools">${pos?btn('上一条','neighbor:'+data[pos-1].n):''}${btn('本章目录','chapterList')}${pos+1<data.length?btn('下一条','neighbor:'+data[pos+1].n):''}</div>`
 }catch{if(token===readToken&&$('paper'))$('paper').innerHTML='章节加载失败。 '+link('打开作者原页',url)}
}
const prompts=[
 ['这条建议与你现在的生活有关吗？',['经常遇到','偶尔遇到','暂时用不上']],
 ['遇到这种情况，你通常怎样做？',['已有固定做法','有时会忘记','还没有试过']],
 ['读完后，哪一步最适合你？',['找个机会实践','找家人聊一聊','先留作参考']]
];
function evidenceTest(){
 const grade=fields(activeItem).find(([k])=>k==='证据等级')?.[1].trim();
 if(!grade)return '';
 const match=grade.match(/^[ABCD](?![A-Za-z])/);
 if(!match)return '';
 const id=chapter+'/'+entry,answer=p().evidenceAnswers?.[id];
 return `<section><h3>读后回想</h3><p>作者给这条建议标了哪个证据等级？</p><div class="readtools">${['A','B','C','D'].map(x=>btn(x,'evidence:'+x,answer===x?'selected':'')).join('')}</div>${answer?'<p>'+esc((answer===match[0]?'答对了。':'再看一眼原文。')+' 作者标注为 '+grade)+'</p>':''}</section>`
}
function quiz(){
 const item=activeItem;if(!item)return openRead(chapter,entry);
 const key=chapter+'/'+entry,answers=p().reflections?.[key]||[],step=quizStep;
 const feedback=['把你打算实践的时间和场景写进今日手记。','可以把文摘发给家人，先问问对方的看法。','下次碰到类似场景时，再回来看看自己的选择。'];
 shell('阅读自测',step<3?(step+1)+' / 3':'已完成',`${crumbs(true)}<div class="readscroll quiz"><small>第 ${entry} 条 · 自我观察</small><p>${esc(item.title)}</p><h2>${step<3?prompts[step][0]:'我的自测记录'}</h2>${step<3?prompts[step][1].map((label,i)=>btn(label,'answer:'+i,answers[step]===i?'selected':'')).join(''):`<p>${esc(answers.map((a,i)=>prompts[i][1][a]).join(' · '))}</p><p>${feedback[answers[2]]}</p>${evidenceTest()}`}<div class="actions">${btn('返回原文','returnRead')}${step===3?btn('重新自测','repeatQuiz'):step?btn('上一题','previousQuiz'):''}</div></div>`)
}
function clearPoster(){if(posterUrl)URL.revokeObjectURL(posterUrl);posterUrl='';posterFile=null}
function excerpt(item){
 const sections=fields(item),value=(sections.find(([k])=>k==='说人话')||sections[0])[1];
 return value.length<=210?value:value.slice(0,209)+'…'
}
async function poster(){
 const item=activeItem,ch=currentChapter();if(!item)return openRead(chapter,entry);
 clearPoster();const token=++readToken;
 shell('分享文摘',ch.id+' / '+entry,`${crumbs(true)}<div class="readscroll poster"><div id="imagebox">正在排版…</div><label>文摘文字（最多 260 字）<textarea id="excerpt" rows="3" maxlength="260">${esc(excerptText)}</textarea></label><div class="actions">${btn('重新排版','newPoster')}${btn('返回原文','returnRead')}</div></div><div class="actions" id="posterActions"></div>`);
 try{const blob=await makePoster(ch,item,excerptText);if(token!==readToken||screen!=='poster')return;posterUrl=URL.createObjectURL(blob);posterFile=new File([blob],'高性价比人生指南-'+ch.id+'-'+item.n+'.png',{type:'image/png'});
 $('imagebox').innerHTML=`<img src="${posterUrl}" alt="文摘分享图，可长按保存">`;
 $('posterActions').innerHTML=`<a class="btn primary" href="${posterUrl}" download="${posterFile.name}">保存图片</a>${navigator.canShare?.({files:[posterFile]})?btn('系统分享','shareFile'):''}<small>可保存到相册，再发朋友圈或小红书。</small>`
 }catch{if(token===readToken&&$('imagebox'))$('imagebox').textContent='图片生成失败，可重新排版。'}
}
function community(){let c=comments[comment%Math.max(1,comments.length)];shell('读者讨论','精选互动',c?`<small>来自作者仓库 · 讨论 #13</small><h2>道理懂了，怎么做到？</h2><p>“${esc(c.text)}”</p><small>@${esc(c.user)} · 原讨论节选</small><div class="actions">${btn('下一条','nextComment')}${link('看完整对话',c.url)}</div>`:link('前往作者讨论区',repo+'/issues'))}
function mark(slot,status){let d=day(), x=plan().find(x=>x.slot===slot);d['done'+slot]=status;d['title'+slot]=tasks[x.k][1]}
function calendar(){const stamp=new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');let lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Life//Daily planner//ZH','CALSCALE:GREGORIAN'];for(let x of plan()){lines.push('BEGIN:VEVENT','UID:'+p().id+'-'+x.slot+'@life.iinnkk.me','DTSTAMP:'+stamp,'DTSTART:'+nowDay().replaceAll('-','')+'T'+x.t.replace(':','')+'00','DURATION:PT5M','RRULE:FREQ=DAILY','SUMMARY:高性价比人生指南 · '+tasks[x.k][1],'BEGIN:VALARM','ACTION:DISPLAY','TRIGGER:PT0M','DESCRIPTION:高性价比人生指南 · '+tasks[x.k][1],'END:VALARM','END:VEVENT')}lines.push('END:VCALENDAR');const url=URL.createObjectURL(new Blob([lines.join('\r\n')+'\r\n'],{type:'text/calendar;charset=utf-8'}));let a=document.createElement('a');a.href=url;a.download='高性价比人生指南.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已生成日历文件，导入系统日历并允许提醒')}
async function action(act){const [key,arg]=act.split(':');let u=p(),d=day(),list=plan(),x=list[cursor]||list[0];
 switch(key){
 case 'tab':if(arg==='book')return listRoute(chapter,query);if(location.hash.startsWith('#guide/'))setPath('');tab=arg;screen='';recordSlot=null;if(tab==='today')cursor=pick();break;
 case 'showIntro':showIntro=true;introSlide=0;break;
 case 'introSlide':introSlide=Number(arg);break;
 case 'allChapters':return listRoute('01');
 case 'introDone':u.sawGuideIntro=true;showIntro=false;introSlide=0;if(!u.setup){wizard=0;screen='wizard'}else cursor=pick();break;
 case 'wizard':wizard=0;screen='wizard';break;
 case 'wizBack':wizard--;break;
 case 'wizNext':if(wizard===0){if(!$('who').value.trim())return toast('请输入称呼');if(!$('age').checkValidity())return toast('请检查年龄');u.age=+$('age').value;u.name=$('who').value.trim();u.phase=$('phase').value;wizard++}else if(wizard===1){u.focus=$('focus').value;u.interest=$('interest').value;u.load=+$('load').value;wizard++}else{let t=u.times.slice(0,u.load).map((v,i)=>$('t'+i).value);if(t.some(v=>!v))return toast('请补全时间');t.forEach((v,i)=>u.times[i]=v);u.setup=true;u.prefs={};screen='';tab='today';cursor=pick()}break;
 case 'prevTask':cursor=(cursor+list.length-1)%list.length;break;case 'nextTask':cursor=(cursor+1)%list.length;break;
 case 'settings':case 'bridge':case 'comments':case 'member':screen=key;break;
 case 'edit':editing=+arg;screen='editSlot';break;
 case 'saveSlot':if(!$('clock').value)return toast('请设置时间');u.prefs[editing]=$('act').value;u.times[editing]=$('clock').value;screen='settings';break;
 case 'undo':delete d['done'+x.slot];break;case 'skip':mark(x.slot,'跳过');break;
 case 'check':recordSlot=x.slot;if(x.k==='guide'){let r=u.pins?.[x.slot]||dailyRead();return openRead(r.c,r.n,x.slot)}screen=x.k==='walk'?'steps':x.k==='meal'?'meal':'note';break;
 case 'manualSteps':case 'manualMeal':recordSlot=null;screen=key==='manualSteps'?'steps':'meal';break;
 case 'saveRecord':{let v=$('value').value.trim();if(screen==='steps'){let g=$('goal').value;if(!/^\d+$/.test(v)||+v>200000||!/^\d+$/.test(g)||+g>200000)return toast('请输入有效的非负整数');Object.assign(d,{steps:+v,stepSource:'手动记录'});u.stepGoal=+g;autoWalk()}else if(screen==='meal'){if(!v)return toast('先写下这一餐吃了什么');(d.meals??={})[$('mealType').value]=v}else d['note'+recordSlot]=v;if(recordSlot!==null)mark(recordSlot,'完成');screen='';toast('已保存');break}
 case 'sit':if(u.sitAt)delete u.sitAt;else u.sitAt=Date.now()+45*60000;toast(u.sitAt?'已开始计时，页面打开时会提醒':'已取消');break;
 case 'history':historyPage=0;screen='history';break;
 case 'historyPrev':historyPage=Math.max(0,historyPage-1);break;case 'historyNext':historyPage++;break;
 case 'template':if(state.people.length===1){for(let [n,r] of relatives){let v=person(n,r);v.phase=r==='孩子'?'在校学习':'日常生活';v.focus=r==='父母'?'活动':'成长';state.people.push(v)}}break;
 case 'familyPage':familyPage=(familyPage+1)%Math.ceil(state.people.length/9);break;
 case 'switch':state.active=+arg;cursor=pick();tab='today';screen='';break;
 case 'add':{let n=$('newName').value.trim();if(!n)return toast('请输入称呼');let v=person(n,$('role').value);if(v.role==='孩子')v.phase='在校学习';state.active=state.people.push(v)-1;wizard=0;screen='wizard';break}
 case 'toggleBridge':u.bridge=!u.bridge;break;
 case 'copyBridge':try{await navigator.clipboard.writeText(location.href.split('#')[0]+'#steps?id='+u.id+'&value=1234');toast('已复制，替换 1234 为今日步数')}catch{toast('当前浏览器不允许复制')}return;
 case 'bridgeHelp':shell('设定快捷指令','iPhone',`<p>① 从可信来源获取当日累计步数，先与健康 App 的今日数值核对。多设备样本须先去重。</p><p>② 添加「URL」，粘贴成员接入地址，用累计步数变量替换 1234。再添加「打开 URL」。</p><p>③ 在「自动化」选择每天的时间并运行此指令。设备可能要求解锁。</p>${btn('返回接入','bridge')}`);return;
 case 'notify':if(!('Notification'in window))return toast('当前环境请使用日历提醒');try{toast(await Notification.requestPermission()==='granted'?'已允许页面通知':'未获通知权限，可使用日历提醒')}catch{toast('当前环境请使用日历提醒')}return;
 case 'basis':{let a=tasks[x.k],r=x.k==='guide'?(u.pins?.[x.slot]||dailyRead()):{c:a[3],n:a[4]};return openRead(r.c,r.n)}
 case 'calendar':return calendar();
 case 'search':return listRoute(chapter,$('search').value.trim());
 case 'guideHome':return listRoute('01');
 case 'chapterList':return listRoute(chapter);
 case 'returnSearch':return listRoute(chapter,query);
 case 'neighbor':return openRead(chapter,Number(arg));
 case 'returnRead':clearPoster();screen='read';break;
 case 'quiz':quizStep=(u.reflections?.[chapter+'/'+entry]?.length||0);screen='quiz';break;
 case 'repeatQuiz':quizStep=0;break;
 case 'previousQuiz':quizStep=Math.max(0,quizStep-1);break;
 case 'answer':{const id=chapter+'/'+entry;const answers=(u.reflections??={})[id]??=[];answers[quizStep]=Number(arg);quizStep++;break}
 case 'evidence':(u.evidenceAnswers??={})[chapter+'/'+entry]=arg;break;
 case 'poster':excerptText=excerpt(activeItem);screen='poster';break;
 case 'newPoster':excerptText=$('excerpt').value.trim();if(!excerptText)return toast('请填写文摘');break;
 case 'shareFile':if(posterFile){try{await navigator.share({files:[posterFile]})}catch(err){if(err.name!=='AbortError')toast('可使用保存图片')}}return;
 case 'recommend':{let r=dailyRead();return openRead(r.c,r.n)}
 case 'pinRead':{if(!u.setup)return toast('先在「今日」定制方案');let s=u.load-1;u.prefs[s]='guide';(u.pins??={})[s]={c:chapter,n:entry};toast('已设为最后一项行动的阅读内容');break}
 case 'finishRead':mark(readSlot,'完成');readSlot=null;tab='today';setPath('');screen='';break;
 case 'nextComment':comment++;break;
 }
 save();render()
}
document.addEventListener('click',e=>{let a=e.target.closest('[data-entry]');if(a&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();let [c,n]=a.dataset.entry.split('/');return openRead(c,+n)}let b=e.target.closest('[data-do]');if(b)action(b.dataset.do)});
document.addEventListener('change',e=>{if(e.target.id==='chapter'){listRoute(e.target.value)}if(e.target.id==='mealType'){mealType=e.target.value;$('value').value=day().meals?.[mealType]||''}});
$('identity').onclick=()=>action('tab:family');document.addEventListener('keydown',e=>{if(e.target.id==='search'&&e.key==='Enter')action('search')});
let lastDay=nowDay();
function tick(){if(lastDay!==nowDay()){lastDay=nowDay();cursor=pick();if(!screen)render()}if(!p().setup)return;if(p().sitAt&&Date.now()>=p().sitAt){delete p().sitAt;save();toast('已到你设置的久坐休息时间');if(window.Notification?.permission==='granted'){try{new Notification('高性价比人生指南 · 起身休息一下')}catch{}}}let time=new Date().toTimeString().slice(0,5);for(let x of plan()){let d=day(),key='alert'+x.slot+x.t;if(x.t!==time||d['done'+x.slot]||d[key])continue;d[key]=true;save();let msg=p().name+' · '+tasks[x.k][1];toast(msg);if(tab==='today'&&!screen){cursor=plan().findIndex(a=>a.slot===x.slot);render()}if(window.Notification?.permission==='granted'){try{new Notification('高性价比人生指南 · 行动时间',{body:msg})}catch{}}}}
save();ingest();cursor=pick();render();book=window.EMBED?.book||await fetch('./data/guide.json').then(r=>r.json()).catch(()=>null);if(location.hash.startsWith('#guide/'))restoreRoute();else if(tab==='book')render();tick();setInterval(tick,15000);window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#steps?')){ingest();render()}else restoreRoute()});
