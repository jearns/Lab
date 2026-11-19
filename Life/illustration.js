// Each drawing pairs a subject pictogram with a small, reproducible landscape.
const subjects = [
 [/安全带|系带|乘车/, '搭扣', '<path d="m26 66 38-23 15 24-38 23zM75 54l18-11 8 13-18 11M22 80 5 90m91-44 18-12"/><path d="m46 70 12-7"/>'],
 [/睡|失眠|作息|夜班/, '月相', '<path d="M78 22a35 35 0 1 0 22 52 40 40 0 0 1-22-52Z"/><path d="M26 88h80m-9-62v10m-5-5h10"/>'],
 [/父母|老人|家庭|结婚|租房|住房|家里/, '屋檐', '<path d="m12 54 49-36 48 36M24 49v43h73V49M52 92V66h19v26"/><path d="M17 98h90"/>'],
 [/走|运动|步行|跑|锻炼|登山/, '山径', '<path d="m6 89 34-47 13 18 23-39 38 68ZM46 92q40-12 19-18t14-19"/>'],
 [/食|吃|餐|蔬菜|饮|营养/, '餐桌', '<path d="M15 64h93q-8 33-46 33T15 64Zm13-6q32-35 63 0M45 45q-9-18 7-26m14 22q-5-11 6-19"/>'],
 [/钱|费用|医保|社保|合同|财|保单|账户/, '账本', '<rect x="23" y="20" width="70" height="78" rx="6"/><path d="M37 20v77m11-57h30m-30 16h19m-19 16h25"/>'],
 [/火|紧急|救|安全|风险|防|密码/, '护盾', '<path d="M60 18q19 15 40 17-1 39-40 64-39-25-40-64 21-2 40-17Z"/><path d="m43 58 12 12 23-26"/>'],
 [/学习|学会|读|孩子|学业|教育|学校/, '书页', '<path d="M60 36q-18-14-47-9v59q28-5 47 9 19-14 47-9V27q-29-5-47 9Zm0 0v59m-35-50 22 5m25 2 22-7"/>'],
 [/时间|计划|几点|工期|期限|拖延|分钟/, '日晷', '<ellipse cx="60" cy="78" rx="46" ry="19"/><path d="m40 77 34-51-3 52zM17 76l7 2m74-1 7-3m-50 15v6"/>'],
 [/工作|创业|技能|职|平台/, '工具箱', '<rect x="14" y="39" width="94" height="54" rx="6"/><path d="M43 39V26h35v13M14 58q47 16 94 0m-53 3h13v12H55Z"/>'],
 [/烟|空气|通风/, '风向', '<path d="M10 47h65q26 0 22-17-4-13-17-8M13 62h80m-73 15h46q22 0 18 15-4 10-15 6"/>'],
 [/病|医|药|检查|健康/, '记录夹', '<rect x="24" y="24" width="73" height="73" rx="8"/><path d="M44 24v-7h32v7m-29 31h26m-13-13v26M41 81h37"/>'],
 [/车|旅行|出行|出国/, '路标', '<path d="M59 17v82m-34-68h54l16 12-16 12H25zM19 99h82"/>'],
 [/水|河|泳/, '水纹', '<path d="M60 15Q17 64 39 82q21 19 42-1Q99 64 60 15Zm-32 80q32 12 62-1"/>']
];
const fallback=['<path d="m59 13 34 45-34 44-34-44Zm0 0v89M25 58h68"/>','<path d="M21 94h77M60 92V48m0 27Q30 72 24 43q31 0 36 32Zm0-16q2-30 36-39-1 30-36 39Z"/>','<circle cx="61" cy="58" r="37"/><path d="m75 35-8 30-23 15 9-30z"/>'];
const palettes=[['#f1eed7','#285845','#d9a54f'],['#e6eef0','#345b70','#d69b6a'],['#f6e8dd','#774b43','#89a985'],['#ece9f4','#554d73','#d2ac66']];
export function illustration(ch,n,title){
 let hash=2166136261;for(const char of title)hash=Math.imul(hash^char.codePointAt(0),16777619)>>>0;
 const subject=subjects.find(([re])=>re.test(title));const shape=subject?.[2]||fallback[hash%fallback.length];
 const [paper,ink,accent]=palettes[(hash+n)%palettes.length];
 const horizon=48+hash%30, sun=180+(hash>>>8)%135;
 return `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="125" viewBox="0 0 420 125" role="img" aria-label="条目插画：${subject?.[1]||'生活札记'}"><rect width="420" height="125" fill="${paper}"/><circle cx="${sun}" cy="42" r="${18+n%13}" fill="${accent}"/><g fill="none" stroke="${ink}" opacity=".32">${Array.from({length:7},(_,i)=>`<path d="M100 ${114+i*4}Q190 ${horizon-i*7} 262 ${80+i*4}T430 ${54+i*8}"/>`).join('')}</g><g transform="translate(13 3)" fill="${paper}" stroke="${ink}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">${shape}</g><text x="397" y="112" text-anchor="end" font-family="monospace" font-size="12" fill="${ink}">${ch} / ${String(n).padStart(2,'0')}</text></svg>`;
}
