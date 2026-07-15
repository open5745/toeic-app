// 例句點字查詢：優先查題庫 500 字，其次查常用功能詞小字典，並做簡單詞形還原
const COMMON = {
  the: '（定冠詞）', a: '一（個）', an: '一（個）', and: '和；而且', or: '或者', but: '但是', so: '所以',
  to: '到；去；（不定詞）', of: '…的', in: '在…裡', on: '在…上', at: '在（時刻/地點）', by: '被；在…之前',
  for: '為了；給', with: '和…一起；用', from: '從', about: '關於；大約', as: '作為；當…時', into: '進入',
  over: '超過；在…之上', up: '向上', out: '出去；向外', off: '離開；關掉', down: '向下',
  after: '在…之後', before: '在…之前', between: '在…之間', during: '在…期間', until: '直到',
  within: '在…之內', without: '沒有', through: '穿過；透過', per: '每', upon: '在…之上（正式）',
  is: '是', are: '是（複數）', was: '是（過去式）', were: '是（過去複數）', be: '是；成為',
  been: '是（完成式）', being: '正在；作為', am: '是（第一人稱）',
  do: '做；（助動詞）', does: '做（第三人稱）', did: '做（過去式）', done: '做完（p.p.）',
  have: '有；（完成式助動詞）', has: '有（第三人稱）', had: '有（過去式）', having: '有著',
  will: '將會', would: '將會（委婉/過去）', can: '能夠', could: '能（委婉/過去）', may: '可以；可能',
  might: '可能', must: '必須', should: '應該', shall: '將；應',
  i: '我', you: '你；你們', he: '他', she: '她', it: '它', we: '我們', they: '他們',
  them: '他們（受格）', us: '我們（受格）', me: '我（受格）', him: '他（受格）', her: '她的；她（受格）',
  his: '他的', its: '它的', our: '我們的', their: '他們的', your: '你的；您的', my: '我的',
  this: '這個', that: '那個；（引導子句）', these: '這些', those: '那些',
  who: '誰；（關係代名詞）', whom: '誰（受格）', whose: '誰的', which: '哪一個；（關代）',
  what: '什麼', when: '何時；當…時', where: '哪裡', why: '為什麼', how: '如何',
  all: '全部', any: '任何', some: '一些', each: '每個', every: '每一個', both: '兩者都',
  few: '很少', many: '許多', much: '很多（不可數）', more: '更多', most: '最；大多數',
  other: '其他的', another: '另一個', such: '這樣的', no: '沒有', not: '不', own: '自己的',
  if: '如果', because: '因為', although: '雖然', though: '雖然；不過', while: '當…時；然而',
  since: '自從；因為', unless: '除非', whether: '是否', once: '一次；一旦',
  than: '比', then: '然後', there: '那裡；（there is 有）', here: '這裡',
  also: '也', too: '也；太', very: '非常', only: '只有', just: '剛剛；只是',
  now: '現在', soon: '很快', still: '仍然', already: '已經', yet: '尚未；然而', again: '再次',
  always: '總是', usually: '通常', often: '常常', sometimes: '有時', never: '從不',
  new: '新的', old: '舊的；老的', good: '好的', great: '很棒的', best: '最好的', better: '更好的',
  long: '長的', short: '短的', last: '最後的；上一個', next: '下一個', early: '早的', late: '晚的；遲的',
  first: '第一', second: '第二；秒', third: '第三', one: '一；一個', two: '二', three: '三',
  four: '四', five: '五', six: '六', ten: '十', hundred: '百', thousand: '千',
  get: '得到', got: '得到（過去式）', make: '製作；使', made: '製作（過去式）',
  take: '拿；花費', took: '拿（過去式）', taken: '拿（p.p.）', give: '給', given: '給（p.p.）',
  go: '去', went: '去（過去式）', come: '來', came: '來（過去式）', see: '看見', saw: '看見（過去式）',
  know: '知道', need: '需要', needs: '需要（第三人稱）', want: '想要', like: '喜歡；像',
  use: '使用', used: '使用（過去式）；習慣的', find: '找到', found: '找到（過去式）；創立',
  keep: '保持', let: '讓', put: '放', call: '打電話；稱呼', called: '打電話（過去式）；被稱為',
  ask: '詢問；要求', asked: '詢問（過去式）', tell: '告訴', told: '告訴（過去式）',
  send: '寄送', sent: '寄送（過去式）', bring: '帶來', pay: '支付', paid: '支付（過去式）',
  buy: '購買', bought: '購買（過去式）', sell: '販售', sold: '販售（過去式）',
  start: '開始', begin: '開始', end: '結束', open: '打開；開放', close: '關閉',
  work: '工作；運作', help: '幫助', show: '顯示；展示', run: '跑；營運', hold: '舉行；持有', held: '舉行（過去式）',
  please: '請', thank: '感謝', thanks: '謝謝', welcome: '歡迎', sorry: '抱歉',
  day: '天；日', days: '天（複數）', week: '週', month: '月', year: '年', years: '年（複數）',
  time: '時間；次數', hour: '小時', hours: '小時（複數）', minute: '分鐘', minutes: '分鐘；會議紀錄',
  today: '今天', tomorrow: '明天', yesterday: '昨天', weekend: '週末',
  morning: '早上', afternoon: '下午', evening: '傍晚', night: '夜晚',
  company: '公司', office: '辦公室', staff: '員工', team: '團隊', customer: '顧客', customers: '顧客（複數）',
  meeting: '會議', room: '房間', store: '商店', price: '價格', item: '品項', items: '品項（複數）',
  people: '人們', person: '人', place: '地方', way: '方法；路', number: '號碼；數字',
  free: '免費的；自由的', available: '可取得的；有空的', percent: '百分比', dollars: '美元',
};

let bankDict = null;

// 用題庫單字建立查詢表（多字片語也收，供整詞比對）；題庫載入後不變，建一次即可
export function buildDict(vocabData) {
  if (bankDict) return;
  bankDict = new Map();
  for (const pack of vocabData.packs) {
    for (const w of pack.words) {
      bankDict.set(w.word.toLowerCase(), { pos: w.pos, zh: w.zh, fromBank: true });
    }
  }
}

// 簡單詞形還原：複數、過去式、進行式、副詞化都試著還原回原形
function stems(w) {
  const out = [w];
  if (w.endsWith('ies') && w.length > 4) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ing') && w.length > 5) { out.push(w.slice(0, -3)); out.push(w.slice(0, -3) + 'e'); }
  if (w.endsWith('ied') && w.length > 4) out.push(w.slice(0, -3) + 'y');
  if (w.endsWith('ed') && w.length > 4) { out.push(w.slice(0, -2)); out.push(w.slice(0, -1)); }
  if (w.endsWith('es') && w.length > 4) out.push(w.slice(0, -2));
  if (w.endsWith('s') && w.length > 3) out.push(w.slice(0, -1));
  if (w.endsWith('ly') && w.length > 4) out.push(w.slice(0, -2));
  return out;
}

// 回傳 { word, pos, zh, fromBank }；查不到時 zh 為 null
export function lookupWord(raw) {
  const w = raw.toLowerCase().replace(/[^a-z'\-]/g, '');
  if (!w) return null;
  for (const cand of stems(w)) {
    if (bankDict && bankDict.has(cand)) return { word: cand, ...bankDict.get(cand) };
  }
  for (const cand of stems(w)) {
    if (COMMON[cand]) return { word: cand, pos: '', zh: COMMON[cand], fromBank: false };
  }
  return { word: w, pos: '', zh: null, fromBank: false };
}
