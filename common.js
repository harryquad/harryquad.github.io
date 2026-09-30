// ツール一覧。新しいツールはここに追加すると、各ページの「関連ツール」に自動で出る
const TOOLS = [
  { path: "/tenshoku-schedule/", name: "転職スケジュール 逆算", desc: "入社日から、退職を伝える期限・最終出社日を逆算します" },
  { path: "/yukyu/", name: "有給消化 最終出社日 計算", desc: "退職日と残りの有給日数から、最終出社日と有給消化期間を逆算します" },
  { path: "/taishokutodoke/", name: "退職届・退職願 作成", desc: "入力するだけで縦書きの退職届・退職願を作成。そのまま印刷できます" },
  { path: "/taishokubi/", name: "退職日と社会保険料の診断", desc: "月末退職と月の途中の退職で、健康保険・年金がどう変わるかを表示します" },
  { path: "/yukyu-fuyo/", name: "有給休暇 付与日数 計算", desc: "有給がいつ・何日もらえるかを一覧表示。パートの比例付与にも対応" },
  { path: "/kinzoku/", name: "勤続年数 計算", desc: "入社日から在籍期間を計算。有給の付与日数の目安もわかります" },
  { path: "/taishoku-tetsuzuki/", name: "退職後の手続き チェックリスト", desc: "健康保険・年金・失業保険・税金の手続きを期限つきで一覧にします" },
  { path: "/shitsugyo/", name: "失業保険 受給額 計算", desc: "失業手当の1日あたりの金額・もらえる日数・総額を計算します（2026年8月改定対応）" },
  { path: "/saishushoku/", name: "再就職手当 計算", desc: "早く再就職したときにもらえる再就職手当の金額を計算します" },
  { path: "/jyuminzei/", name: "退職後の住民税 計算", desc: "退職後に払う住民税の残りと、翌年度の住民税の目安を計算します" },
  { path: "/taishokukin/", name: "退職金の手取り計算", desc: "退職所得控除・所得税・住民税を差し引いた手取り額を計算します" },
  { path: "/nenshu-tedori/", name: "年収 手取り 計算", desc: "年収から手取りを計算。年収別の早見表つき（2026年の税制対応）" },
  { path: "/tedori-hikaku/", name: "転職後の手取り比較", desc: "年収が変わると手取りがいくら増える（減る）かを比べます" },
  { path: "/jikyu/", name: "年収 時給換算・比較", desc: "休日・残業・通勤時間まで含めた「本当の時給」で会社を比べます" },
];

const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const WD = ["日", "月", "火", "水", "木", "金", "土"];
const fmtDate = d => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`;
const parseDate = v => { if (!v) return null; const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };
const yen = n => Math.round(n).toLocaleString("ja-JP") + "円";

// 日本の祝日（2007年以降のルール。振替休日・国民の休日を含む）
const holidayCache = {};
function holidays(y) {
  if (holidayCache[y]) return holidayCache[y];
  const s = new Set();
  const add = (m, d) => s.add(ymd(new Date(y, m - 1, d)));
  const nthMonday = (m, n) => {
    const first = new Date(y, m - 1, 1).getDay();
    return 1 + ((8 - first) % 7) + (n - 1) * 7;
  };
  add(1, 1); add(1, nthMonday(1, 2)); add(2, 11);
  if (y >= 2020) add(2, 23);
  add(3, Math.floor(20.8431 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4)));
  add(4, 29); add(5, 3); add(5, 4); add(5, 5);
  add(7, nthMonday(7, 3));
  if (y >= 2016) add(8, 11);
  add(9, nthMonday(9, 3));
  add(9, Math.floor(23.2488 + 0.242194 * (y - 1980) - Math.floor((y - 1980) / 4)));
  add(10, nthMonday(10, 2)); add(11, 3); add(11, 23);
  // 国民の休日：祝日に挟まれた平日
  for (let d = new Date(y, 0, 2); d.getFullYear() === y; d = addDays(d, 1)) {
    if (d.getDay() !== 0 && !s.has(ymd(d)) && s.has(ymd(addDays(d, -1))) && s.has(ymd(addDays(d, 1)))) s.add(ymd(d));
  }
  // 振替休日：日曜の祝日の後、最初の祝日でない日
  for (const k of [...s]) {
    let d = parseDate(k);
    if (d.getDay() === 0) {
      do { d = addDays(d, 1); } while (s.has(ymd(d)));
      s.add(ymd(d));
    }
  }
  return (holidayCache[y] = s);
}

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("related");
  if (!el) return;
  const here = location.pathname.replace(/index\.html$/, "");
  el.innerHTML = `<h2>ほかのツール</h2><ul class="tools">${TOOLS.filter(t => t.path !== here)
    .map(t => `<li><a href="${t.path}"><b>${t.name}</b><span>${t.desc}</span></a></li>`).join("")}</ul>`;
});
