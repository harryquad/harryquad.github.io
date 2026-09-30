// ツール一覧。新しいツールはここに追加すると、各ページの「関連ツール」に自動で出る
const TOOLS = [
  { path: "/yukyu/", name: "有給消化 最終出社日 計算", desc: "退職日と残り有給から最終出社日を逆算" },
  { path: "/taishokutodoke/", name: "退職届・退職願 作成", desc: "入力するだけで縦書きの退職届を作成・印刷" },
  { path: "/taishokukin/", name: "退職金の手取り計算", desc: "退職所得控除・所得税・住民税から手取りを計算" },
  { path: "/taishokubi/", name: "退職日と社会保険料の診断", desc: "月末退職と月途中退職で保険料がどう変わるか" },
  { path: "/tedori-hikaku/", name: "転職後の手取り比較", desc: "年収が変わると手取りはいくら変わるか" },
  { path: "/kinzoku/", name: "勤続年数 計算", desc: "在籍期間と有給の付与日数の目安を計算" },
];

const pad = n => String(n).padStart(2, "0");
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const WD = ["日", "月", "火", "水", "木", "金", "土"];
const fmtDate = d => `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`;
const parseDate = v => { if (!v) return null; const [y, m, d] = v.split("-").map(Number); return new Date(y, m - 1, d); };
const yen = n => Math.round(n).toLocaleString("ja-JP") + "円";

document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("related");
  if (!el) return;
  const here = location.pathname.replace(/index\.html$/, "");
  el.innerHTML = `<h2>ほかのツール</h2><ul class="tools">${TOOLS.filter(t => t.path !== here)
    .map(t => `<li><a href="${t.path}"><b>${t.name}</b><span>${t.desc}</span></a></li>`).join("")}</ul>`;
});
