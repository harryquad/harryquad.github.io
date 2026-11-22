// ボーナス（賞与）の手取り計算（令和8年＝2026年に支払う賞与）
// 根拠：国税庁「賞与に対する源泉徴収税額の算出率の表（令和8年分）」、協会けんぽ 令和8年度保険料率、
//       日本年金機構「従業員に賞与を支給したときの手続き」、厚生労働省「令和8年度雇用保険料率」

// 算出率の表（甲欄）の率（1/1000 %単位。2042 = 2.042%）
const RATES = [0, 2042, 4084, 6126, 8168, 10210, 12252, 14294, 16336, 18378, 20420, 22462, 24504, 26546, 28588, 30630, 32672, 35735, 38798, 41861, 45945];
// 扶養親族等の数（0〜7人以上）ごとの「前月の社会保険料等控除後の給与等の金額」の各行の上限（千円未満）
const KOU = [
  [82, 94, 260, 309, 342, 372, 402, 433, 520, 605, 684, 715, 752, 795, 854, 922, 1318, 1521, 2621, 3495],
  [107, 250, 289, 346, 373, 401, 430, 463, 520, 621, 705, 739, 778, 821, 882, 952, 1342, 1526, 2645, 3527],
  [143, 276, 321, 377, 400, 426, 457, 492, 525, 636, 728, 764, 804, 848, 910, 983, 1367, 1526, 2669, 3559],
  [181, 300, 354, 405, 424, 452, 484, 517, 550, 651, 751, 788, 830, 876, 938, 1013, 1391, 1538, 2693, 3590],
  [218, 300, 387, 431, 452, 477, 509, 540, 577, 666, 774, 813, 856, 903, 966, 1044, 1416, 1555, 2716, 3622],
  [251, 304, 412, 457, 479, 503, 531, 564, 604, 681, 798, 838, 881, 930, 994, 1074, 1440, 1555, 2740, 3654],
  [284, 343, 438, 483, 505, 527, 553, 589, 630, 697, 821, 862, 907, 957, 1022, 1104, 1464, 1555, 2764, 3685],
  [317, 383, 463, 508, 529, 552, 578, 614, 657, 708, 845, 887, 933, 985, 1051, 1135, 1489, 1583, 2788, 3717],
];
// 乙欄（扶養控除等申告書を出していない人）
const OTSU_RATES = [10210, 20420, 30630, 38798, 45945];
const OTSU = [224, 295, 527, 1118];

// 協会けんぽ 令和8年度の健康保険料率（%、労使合計）
const KENPO = {
  "全国平均": 9.90,
  北海道: 10.28, 青森県: 9.85, 岩手県: 9.51, 宮城県: 10.10, 秋田県: 10.01, 山形県: 9.75, 福島県: 9.50,
  茨城県: 9.52, 栃木県: 9.82, 群馬県: 9.68, 埼玉県: 9.67, 千葉県: 9.73, 東京都: 9.85, 神奈川県: 9.92,
  新潟県: 9.21, 富山県: 9.59, 石川県: 9.70, 福井県: 9.71, 山梨県: 9.55, 長野県: 9.63, 岐阜県: 9.80,
  静岡県: 9.61, 愛知県: 9.93, 三重県: 9.77, 滋賀県: 9.88, 京都府: 9.89, 大阪府: 10.13, 兵庫県: 10.12,
  奈良県: 9.91, 和歌山県: 10.06, 鳥取県: 9.86, 島根県: 9.94, 岡山県: 10.05, 広島県: 9.78, 山口県: 10.15,
  徳島県: 10.24, 香川県: 10.02, 愛媛県: 9.98, 高知県: 10.05, 福岡県: 10.11, 佐賀県: 10.55, 長崎県: 10.06,
  熊本県: 10.08, 大分県: 10.08, 宮崎県: 9.77, 鹿児島県: 10.13, 沖縄県: 9.44,
};
const KAIGO = 1.62;      // 介護保険料率（40〜64歳、全国一律）
const SHIENKIN = 0.23;   // 子ども・子育て支援金率（令和8年4月分から）
const PENSION = 18.3;    // 厚生年金保険料率
const KOYO = { general: 5, special: 6 }; // 雇用保険の本人負担（1/1000）。special＝農林水産・清酒製造・建設

// 健康保険の標準報酬月額の等級の境目（この金額以上で次の等級）と、各等級の標準報酬月額
const H_GRADES = [58000, 68000, 78000, 88000, 98000, 104000, 110000, 118000, 126000, 134000, 142000, 150000, 160000, 170000, 180000, 190000, 200000, 220000, 240000, 260000, 280000, 300000, 320000, 340000, 360000, 380000, 410000, 440000, 470000, 500000, 530000, 560000, 590000, 620000, 650000, 680000, 710000, 750000, 790000, 830000, 880000, 930000, 980000, 1030000, 1090000, 1150000, 1210000, 1270000, 1330000, 1390000];
const H_LOWER = [0, 63000, 73000, 83000, 93000, 101000, 107000, 114000, 122000, 130000, 138000, 146000, 155000, 165000, 175000, 185000, 195000, 210000, 230000, 250000, 270000, 290000, 310000, 330000, 350000, 370000, 395000, 425000, 455000, 485000, 515000, 545000, 575000, 605000, 635000, 665000, 695000, 730000, 770000, 810000, 855000, 905000, 955000, 1005000, 1055000, 1115000, 1175000, 1235000, 1295000, 1355000];

function standardMonthly(pay) {
  let i = 0;
  while (i + 1 < H_LOWER.length && pay >= H_LOWER[i + 1]) i++;
  const health = H_GRADES[i];
  const pension = Math.min(650000, Math.max(88000, health)); // 厚生年金は 88,000円〜650,000円
  return { health, pension };
}

// 給与から差し引く本人負担分：50銭以下は切り捨て、50銭を超えたら切り上げ
// base × rate(%) ÷ 2 を整数のまま計算する（rate は小数第2位までの%）
function halfShare(base, ratePct) {
  const n = base * Math.round(ratePct * 100); // ÷ 20000 で本人負担額
  const q = Math.floor(n / 20000), r = n % 20000;
  return r > 10000 ? q + 1 : q;
}
function koyoShare(pay, perMille) {
  const n = pay * perMille; // ÷ 1000
  const q = Math.floor(n / 1000), r = n % 1000;
  return r > 500 ? q + 1 : q;
}

// 社会保険料（本人負担）。hb＝健康保険の対象額、pb＝厚生年金の対象額、pay＝雇用保険の対象額
function premiums(hb, pb, pay, o) {
  const healthRate = o.kenpo + (o.age === "40" ? KAIGO : 0);
  const health = halfShare(hb, healthRate);
  const shien = halfShare(hb, SHIENKIN);
  const pension = halfShare(pb, PENSION);
  const koyo = koyoShare(pay, KOYO[o.industry] || 5);
  return { health, shien, pension, koyo, total: health + shien + pension + koyo };
}

// 賞与にかかる社会保険料：1,000円未満切り捨て。健康保険は年度573万円、厚生年金は1か月150万円が上限
function bonusPremiums(bonus, o) {
  const std = Math.floor(bonus / 1000) * 1000;
  return premiums(Math.min(std, 5730000), Math.min(std, 1500000), bonus, o);
}

// 前月の給与にかかる社会保険料（標準報酬月額から計算した目安）
function monthlyPremiums(pay, o) {
  const s = standardMonthly(pay);
  return premiums(s.health, s.pension, pay, o);
}

// 算出率の表から率を求める（deps：0〜7、または "otsu"）。net＝前月の社会保険料等控除後の給与
function bonusRate(net, deps) {
  const k = net / 1000;
  if (deps === "otsu") {
    const i = OTSU.findIndex(m => k < m);
    return OTSU_RATES[i < 0 ? OTSU_RATES.length - 1 : i];
  }
  const col = KOU[Math.min(7, Math.max(0, deps))];
  const i = col.findIndex(m => k < m);
  return RATES[i < 0 ? RATES.length - 1 : i];
}

// o = { bonus, prev, prevSocial(任意), age: "u40"|"40"|"65", deps: 0〜7|"otsu", kenpo: 料率%, industry }
function bonusTakeHome(o) {
  const si = bonusPremiums(o.bonus, o);
  const after = o.bonus - si.total; // 社会保険料等控除後の賞与
  const prevSocial = o.prevSocial != null ? o.prevSocial : (o.prev > 0 ? monthlyPremiums(o.prev, o).total : 0);
  const prevNet = o.prev - prevSocial;
  // 前月の給与がない、または賞与が前月の10倍を超えるときは算出率の表を使わない（月額表で計算する）
  const special = o.prev <= 0 || prevNet <= 0 ? "noprev" : after > prevNet * 10 ? "over10" : null;
  if (special) return { si, after, prevSocial, prevNet, special, rate: null, tax: null, net: null };
  const rate = bonusRate(prevNet, o.deps);
  const tax = Math.floor(after * rate / 100000);
  return { si, after, prevSocial, prevNet, special, rate, tax, net: after - tax };
}

if (typeof module !== "undefined") module.exports = { bonusTakeHome, bonusRate, monthlyPremiums, bonusPremiums, standardMonthly, KENPO };
