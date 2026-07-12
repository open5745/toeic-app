// Part 1 照片描述的場景插圖：純 SVG、離線可用，風格與首頁吉祥物一致
// key 對應 listening.json 內 part 1 題目的 scene 欄位

export const SCENES = {
  // 一名男子坐在辦公桌前用筆電打字
  'office-typing': `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#eef3fb"/>
  <rect y="132" width="320" height="48" fill="#d7e0ee"/>
  <rect x="230" y="22" width="66" height="54" rx="6" fill="#bcd7f7"/>
  <rect x="260" y="22" width="5" height="54" fill="#eef3fb"/>
  <rect x="230" y="46" width="66" height="5" fill="#eef3fb"/>
  <circle cx="118" cy="70" r="20" fill="#ffd8b4"/>
  <path d="M98 66 C98 44 138 44 138 66 C130 54 106 54 98 66 Z" fill="#3a2e2a"/>
  <circle cx="111" cy="71" r="2.6" fill="#33302e"/><circle cx="125" cy="71" r="2.6" fill="#33302e"/>
  <path d="M112 79 Q118 84 124 79" stroke="#b55b40" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <path d="M94 130 c0-26 11-38 24-38 c13 0 24 12 24 38 Z" fill="#4a7dff"/>
  <path d="M102 106 Q118 122 142 126" stroke="#4a7dff" stroke-width="10" fill="none" stroke-linecap="round"/>
  <circle cx="145" cy="126" r="6" fill="#ffd8b4"/>
  <rect x="66" y="128" width="188" height="10" rx="5" fill="#a9773f"/>
  <rect x="76" y="138" width="8" height="36" fill="#8a5f30"/>
  <rect x="238" y="138" width="8" height="36" fill="#8a5f30"/>
  <rect x="152" y="98" width="46" height="30" rx="3" fill="#334155"/>
  <rect x="156" y="102" width="38" height="22" rx="2" fill="#7ba6f8"/>
  <rect x="148" y="124" width="56" height="6" rx="3" fill="#64748b"/>
  <rect x="220" y="112" width="15" height="16" rx="3" fill="#ef4b47"/>
  <path d="M235 116 q7 2 0 8" stroke="#ef4b47" stroke-width="3" fill="none"/>
</svg>`,

  // 幾位同事圍著會議桌開會，一人在白板前簡報
  meeting: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#f2eee7"/>
  <rect y="134" width="320" height="46" fill="#e0d9cd"/>
  <rect x="22" y="24" width="86" height="58" rx="5" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <polyline points="32,70 50,52 66,60 96,36" stroke="#ef4b47" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <circle cx="140" cy="56" r="14" fill="#ffd8b4"/>
  <path d="M126 52 C126 38 154 38 154 52 C148 45 132 45 126 52 Z" fill="#5b4632"/>
  <circle cx="135" cy="57" r="2" fill="#33302e"/><circle cx="145" cy="57" r="2" fill="#33302e"/>
  <path d="M126 120 c0-28 8-46 14-46 c6 0 14 18 14 46 Z" fill="#ef8b47"/>
  <path d="M132 84 Q118 72 110 62" stroke="#ef8b47" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="108" cy="60" r="5" fill="#ffd8b4"/>
  <circle cx="212" cy="82" r="13" fill="#ffd8b4"/>
  <path d="M199 78 C199 66 225 66 225 78 C219 71 205 71 199 78 Z" fill="#3a2e2a"/>
  <path d="M198 122 c0-20 8-30 14-30 c6 0 14 10 14 30 Z" fill="#4a7dff"/>
  <circle cx="268" cy="82" r="13" fill="#f3c9a5"/>
  <path d="M255 80 C253 64 283 64 281 80 C275 71 261 71 255 80 Z" fill="#7a5230"/>
  <path d="M254 122 c0-20 8-30 14-30 c6 0 14 10 14 30 Z" fill="#2f9e6e"/>
  <rect x="176" y="120" width="128" height="12" rx="6" fill="#a9773f"/>
  <rect x="188" y="132" width="8" height="38" fill="#8a5f30"/>
  <rect x="284" y="132" width="8" height="38" fill="#8a5f30"/>
  <rect x="200" y="110" width="26" height="8" rx="2" fill="#e2e8f0"/>
  <rect x="252" y="110" width="26" height="8" rx="2" fill="#e2e8f0"/>
</svg>`,

  // 一名女子把咖啡倒進櫃檯上的杯子
  coffee: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#fdf2e3"/>
  <rect x="20" y="24" width="70" height="46" rx="5" fill="#f6e3c5"/>
  <rect x="30" y="34" width="20" height="26" rx="3" fill="#c99e63"/>
  <rect x="58" y="34" width="20" height="26" rx="3" fill="#ef4b47"/>
  <circle cx="196" cy="52" r="19" fill="#ffd8b4"/>
  <path d="M177 50 C175 28 217 28 215 50 L215 68 C210 60 208 56 206 50 C198 58 186 58 181 50 C180 56 178 62 177 68 Z" fill="#7a5230"/>
  <circle cx="189" cy="54" r="2.4" fill="#33302e"/><circle cx="203" cy="54" r="2.4" fill="#33302e"/>
  <path d="M190 62 Q196 66 202 62" stroke="#b55b40" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  <path d="M174 124 c0-32 11-52 22-52 c11 0 22 20 22 52 Z" fill="#ef4b47"/>
  <path d="M182 84 Q166 88 152 86" stroke="#ef4b47" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="85" r="5.5" fill="#ffd8b4"/>
  <path d="M118 78 h26 a4 4 0 0 1 4 4 v6 a12 12 0 0 1 -12 12 h-10 a12 12 0 0 1 -12 -12 v-6 a4 4 0 0 1 4 -4 Z" fill="#64748b" transform="rotate(-20 131 89)"/>
  <path d="M114 84 l-10 6" stroke="#64748b" stroke-width="5" stroke-linecap="round" transform="rotate(-20 131 89)"/>
  <path d="M112 96 q-3 8 -1 14" stroke="#7a4b22" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="98" y="110" width="24" height="17" rx="4" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
  <path d="M122 114 q9 3 0 9" stroke="#cbd5e1" stroke-width="3" fill="none"/>
  <path d="M100 100 q3 -6 0 -10" stroke="#d9c3a5" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <rect y="127" width="320" height="12" rx="6" fill="#a9773f"/>
  <rect x="10" y="139" width="300" height="41" fill="#c99e63"/>
</svg>`,

  // 倉庫裡層層堆疊的紙箱
  warehouse: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#eceff3"/>
  <rect y="140" width="320" height="40" fill="#cbd2dc"/>
  <rect x="228" y="20" width="10" height="122" fill="#f59e0b"/>
  <rect x="300" y="20" width="10" height="122" fill="#f59e0b"/>
  <rect x="222" y="52" width="94" height="8" fill="#f59e0b"/>
  <rect x="222" y="100" width="94" height="8" fill="#f59e0b"/>
  <rect x="240" y="26" width="26" height="26" fill="#c9924f" stroke="#a9773f" stroke-width="2"/>
  <rect x="272" y="26" width="24" height="26" fill="#d8a662" stroke="#a9773f" stroke-width="2"/>
  <rect x="242" y="74" width="28" height="26" fill="#d8a662" stroke="#a9773f" stroke-width="2"/>
  <rect x="44" y="108" width="40" height="34" fill="#c9924f" stroke="#a9773f" stroke-width="2"/>
  <rect x="88" y="108" width="40" height="34" fill="#d8a662" stroke="#a9773f" stroke-width="2"/>
  <rect x="132" y="108" width="40" height="34" fill="#c9924f" stroke="#a9773f" stroke-width="2"/>
  <rect x="66" y="74" width="40" height="34" fill="#d8a662" stroke="#a9773f" stroke-width="2"/>
  <rect x="110" y="74" width="40" height="34" fill="#c9924f" stroke="#a9773f" stroke-width="2"/>
  <rect x="88" y="40" width="40" height="34" fill="#c9924f" stroke="#a9773f" stroke-width="2"/>
  <rect x="102" y="40" width="12" height="34" fill="#e8c185"/>
  <rect x="80" y="74" width="12" height="34" fill="#e8c185"/>
  <rect x="124" y="74" width="12" height="34" fill="#e8c185"/>
  <rect x="58" y="108" width="12" height="34" fill="#e8c185"/>
  <rect x="102" y="108" width="12" height="34" fill="#e8c185"/>
  <rect x="146" y="108" width="12" height="34" fill="#e8c185"/>
</svg>`,

  // 一輛車停在大樓前
  'car-parked': `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#d9ecff"/>
  <rect y="138" width="320" height="42" fill="#cdd8e6"/>
  <rect x="22" y="26" width="118" height="112" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/>
  <rect x="34" y="38" width="20" height="16" fill="#9cc3ee"/><rect x="70" y="38" width="20" height="16" fill="#9cc3ee"/><rect x="106" y="38" width="20" height="16" fill="#9cc3ee"/>
  <rect x="34" y="66" width="20" height="16" fill="#9cc3ee"/><rect x="70" y="66" width="20" height="16" fill="#9cc3ee"/><rect x="106" y="66" width="20" height="16" fill="#9cc3ee"/>
  <rect x="66" y="106" width="30" height="32" fill="#64748b"/>
  <path d="M168 122 q4 -16 24 -18 l14 -14 q4 -4 11 -4 h30 q7 0 11 4 l14 14 q20 2 24 18 v8 q0 6 -6 6 h-116 q-6 0 -6 -6 Z" fill="#4a7dff"/>
  <path d="M212 92 q-3 0 -5 2 l-10 10 h24 v-12 Z" fill="#bcd7f7"/>
  <path d="M228 92 h18 q3 0 5 2 l10 10 h-33 Z" fill="#bcd7f7"/>
  <circle cx="196" cy="136" r="13" fill="#33302e"/><circle cx="196" cy="136" r="5.5" fill="#94a3b8"/>
  <circle cx="264" cy="136" r="13" fill="#33302e"/><circle cx="264" cy="136" r="5.5" fill="#94a3b8"/>
  <circle cx="292" cy="40" r="16" fill="#ffe37e"/>
</svg>`,

  // 一名男子在小路上騎腳踏車
  bicycle: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#e3f2e3"/>
  <rect y="140" width="320" height="40" fill="#d3c8a8"/>
  <rect x="46" y="94" width="9" height="46" fill="#8a5f30"/>
  <circle cx="50" cy="76" r="28" fill="#57b26a"/>
  <rect x="256" y="102" width="8" height="38" fill="#8a5f30"/>
  <circle cx="260" cy="88" r="22" fill="#69bd7a"/>
  <circle cx="130" cy="140" r="21" fill="none" stroke="#33302e" stroke-width="4"/>
  <circle cx="206" cy="140" r="21" fill="none" stroke="#33302e" stroke-width="4"/>
  <path d="M130 140 L158 106 L206 140 M130 140 L162 140 L158 106 M158 106 L150 98 M196 102 L206 140" stroke="#ef4b47" stroke-width="4.5" fill="none" stroke-linecap="round"/>
  <path d="M188 100 h16" stroke="#33302e" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="172" cy="62" r="13" fill="#ffd8b4"/>
  <path d="M159 58 C159 46 185 46 185 58 C179 51 165 51 159 58 Z" fill="#3a2e2a"/>
  <path d="M152 100 C154 78 166 74 172 76 L178 78 Q192 84 196 100" fill="#4a7dff"/>
  <path d="M176 80 Q188 90 197 99" stroke="#4a7dff" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M154 100 Q152 118 162 126" stroke="#2b53c9" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M160 128 h10" stroke="#33302e" stroke-width="5" stroke-linecap="round"/>
</svg>`,

  // 乘客正在月台上車
  train: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#e8eef7"/>
  <rect x="0" y="34" width="320" height="88" rx="14" fill="#4a7dff"/>
  <rect x="0" y="44" width="320" height="10" fill="#7ba6f8"/>
  <rect x="24" y="64" width="34" height="26" rx="4" fill="#bcd7f7"/>
  <rect x="76" y="64" width="34" height="26" rx="4" fill="#bcd7f7"/>
  <rect x="238" y="64" width="34" height="26" rx="4" fill="#bcd7f7"/>
  <rect x="150" y="52" width="52" height="70" rx="4" fill="#1e293b"/>
  <rect x="173" y="52" width="4" height="70" fill="#4a7dff"/>
  <circle cx="120" cy="106" r="11" fill="#ffd8b4"/>
  <path d="M109 102 C109 92 131 92 131 102 C125 96 115 96 109 102 Z" fill="#3a2e2a"/>
  <path d="M110 152 c0-24 6-36 10-36 c4 0 10 12 10 36 Z" fill="#ef8b47"/>
  <path d="M126 122 Q136 116 144 112" stroke="#ef8b47" stroke-width="7" fill="none" stroke-linecap="round"/>
  <rect x="94" y="128" width="16" height="22" rx="3" fill="#7a5230"/>
  <path d="M98 128 v-6 h8 v6" stroke="#7a5230" stroke-width="3" fill="none"/>
  <circle cx="215" cy="110" r="10" fill="#f3c9a5"/>
  <path d="M205 108 C203 96 227 96 225 108 C219 101 209 101 205 108 Z" fill="#7a5230"/>
  <path d="M206 152 c0-22 5-34 9-34 c4 0 9 12 9 34 Z" fill="#2f9e6e"/>
  <rect y="152" width="320" height="6" fill="#ffc531"/>
  <rect y="158" width="320" height="22" fill="#aab6c6"/>
</svg>`,

  // 一名女子替盆栽澆水
  watering: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#eaf6ea"/>
  <rect y="142" width="320" height="38" fill="#cfe3c8"/>
  <circle cx="196" cy="52" r="18" fill="#ffd8b4"/>
  <path d="M178 50 C176 30 216 30 214 50 L214 66 C209 58 207 54 205 48 C197 56 187 56 182 48 C181 54 179 60 178 66 Z" fill="#3a2e2a"/>
  <circle cx="190" cy="54" r="2.3" fill="#33302e"/><circle cx="202" cy="54" r="2.3" fill="#33302e"/>
  <path d="M191 61 Q196 65 201 61" stroke="#b55b40" stroke-width="2.3" fill="none" stroke-linecap="round"/>
  <path d="M176 146 c0-38 10-58 20-58 c10 0 20 20 20 58 Z" fill="#2f9e6e"/>
  <path d="M184 96 Q166 102 152 100" stroke="#2f9e6e" stroke-width="9" fill="none" stroke-linecap="round"/>
  <circle cx="150" cy="99" r="5.5" fill="#ffd8b4"/>
  <path d="M116 92 h28 a5 5 0 0 1 5 5 v10 a14 14 0 0 1 -14 14 h-10 a14 14 0 0 1 -14 -14 v-10 a5 5 0 0 1 5 -5 Z" fill="#4a7dff" transform="rotate(-18 130 106)"/>
  <path d="M112 100 l-14 8" stroke="#4a7dff" stroke-width="6" stroke-linecap="round" transform="rotate(-18 130 106)"/>
  <path d="M96 112 l-3 8 M104 112 l-3 10 M112 114 l-3 8" stroke="#5aa7e8" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M62 126 h44 l-6 20 h-32 Z" fill="#c96f4a"/>
  <ellipse cx="84" cy="112" rx="21" ry="15" fill="#57b26a"/>
  <ellipse cx="70" cy="102" rx="12" ry="9" fill="#69bd7a"/>
  <ellipse cx="98" cy="100" rx="12" ry="9" fill="#69bd7a"/>
  <path d="M242 130 h36 l-5 16 h-26 Z" fill="#c96f4a"/>
  <ellipse cx="260" cy="116" rx="17" ry="13" fill="#69bd7a"/>
</svg>`,

  // 戴著安全帽的工人在工地
  construction: `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#fdf6e3"/>
  <rect y="140" width="320" height="40" fill="#d9cba8"/>
  <rect x="20" y="24" width="12" height="116" fill="#f59e0b"/>
  <rect x="14" y="24" width="80" height="10" fill="#f59e0b"/>
  <path d="M88 34 v22 q0 6 -6 6 h-4" stroke="#64748b" stroke-width="3" fill="none"/>
  <circle cx="120" cy="66" r="16" fill="#ffd8b4"/>
  <path d="M102 62 q0 -18 18 -18 q18 0 18 18 Z" fill="#ffc531"/>
  <rect x="100" y="60" width="40" height="6" rx="3" fill="#eab308"/>
  <circle cx="114" cy="70" r="2.3" fill="#33302e"/><circle cx="126" cy="70" r="2.3" fill="#33302e"/>
  <path d="M104 144 c0-34 8-54 16-54 c8 0 16 20 16 54 Z" fill="#ef8b47"/>
  <rect x="106" y="102" width="28" height="9" fill="#ffe37e"/>
  <path d="M112 96 Q100 110 102 124" stroke="#ef8b47" stroke-width="8" fill="none" stroke-linecap="round"/>
  <circle cx="196" cy="72" r="16" fill="#f3c9a5"/>
  <path d="M178 68 q0 -18 18 -18 q18 0 18 18 Z" fill="#ffc531"/>
  <rect x="176" y="66" width="40" height="6" rx="3" fill="#eab308"/>
  <circle cx="190" cy="76" r="2.3" fill="#33302e"/><circle cx="202" cy="76" r="2.3" fill="#33302e"/>
  <path d="M180 148 c0-32 8-52 16-52 c8 0 16 20 16 52 Z" fill="#4a7dff"/>
  <rect x="182" y="106" width="28" height="9" fill="#ffe37e"/>
  <path d="M206 100 Q220 112 218 130" stroke="#4a7dff" stroke-width="8" fill="none" stroke-linecap="round"/>
  <path d="M218 132 l14 14 M232 132 l-14 14" stroke="#8a5f30" stroke-width="4" stroke-linecap="round"/>
  <path d="M262 140 l14 -28 l14 28 Z" fill="#ef8b47"/>
  <rect x="266" y="128" width="20" height="5" fill="#ffffff"/>
  <path d="M52 140 l12 -24 l12 24 Z" fill="#ef8b47"/>
  <rect x="56" y="130" width="16" height="4" fill="#ffffff"/>
</svg>`,

  // 空無一人的餐桌，椅子已排放整齊
  'chairs-table': `
<svg class="scene-svg" viewBox="0 0 320 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="場景照片">
  <rect width="320" height="180" fill="#f5f0fa"/>
  <rect y="138" width="320" height="42" fill="#e2d8ee"/>
  <path d="M160 18 v14" stroke="#64748b" stroke-width="3"/>
  <path d="M142 46 h36 l-8 -14 h-20 Z" fill="#ffc531"/>
  <rect x="70" y="86" width="14" height="52" rx="4" fill="#8a5f30"/>
  <rect x="66" y="112" width="30" height="8" rx="4" fill="#a9773f"/>
  <rect x="68" y="120" width="6" height="30" fill="#8a5f30"/><rect x="88" y="120" width="6" height="30" fill="#8a5f30"/>
  <rect x="236" y="86" width="14" height="52" rx="4" fill="#8a5f30"/>
  <rect x="224" y="112" width="30" height="8" rx="4" fill="#a9773f"/>
  <rect x="226" y="120" width="6" height="30" fill="#8a5f30"/><rect x="246" y="120" width="6" height="30" fill="#8a5f30"/>
  <rect x="122" y="78" width="10" height="34" rx="4" fill="#a9773f"/>
  <rect x="188" y="78" width="10" height="34" rx="4" fill="#a9773f"/>
  <ellipse cx="160" cy="108" rx="70" ry="16" fill="#c99e63"/>
  <rect x="152" y="108" width="16" height="34" fill="#a9773f"/>
  <ellipse cx="160" cy="146" rx="30" ry="7" fill="#a9773f"/>
  <rect x="152" y="86" width="16" height="14" rx="3" fill="#ef4b47"/>
  <ellipse cx="160" cy="86" rx="8" ry="4" fill="#57b26a"/>
</svg>`,
};
