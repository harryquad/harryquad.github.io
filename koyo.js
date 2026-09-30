// 雇用保険（失業保険）の共通計算
// 2026年8月1日〜の基本手当日額（厚生労働省「基本手当日額の計算式及び金額」）。毎年8月に改定される
const LOWER_W = 3203, LOWER_Y = 2562;
const AGE_BANDS = [
  { max: 29, capW: 14900, capY: 7450 },
  { max: 44, capW: 16540, capY: 8270 },
  { max: 59, capW: 18220, capY: 9110 },
  { max: 64, capW: 17400, capY: 7830 },
];
// 再就職手当の計算に使う基本手当日額の上限（2026年8月1日〜）
const REEMPLOY_CAP = { under60: 6745, over60: 5454 };

// 賃金日額wと年齢から基本手当日額を求める
function dailyBenefit(w, age) {
  const band = AGE_BANDS.find(b => age <= b.max);
  if (w < LOWER_W) return { y: LOWER_Y, band };
  if (w > band.capW) return { y: band.capY, band };
  let y;
  if (age >= 60) {
    if (w < 5480) y = 0.8 * w;
    else if (w <= 12120) y = Math.min(0.8 * w - 0.35 * ((w - 5480) / (12120 - 5480)) * w, 0.05 * w + 12120 * 0.4);
    else y = 0.45 * w;
  } else {
    if (w < 5480) y = 0.8 * w;
    else if (w <= 13490) y = 0.8 * w - 0.3 * ((w - 5480) / (13490 - 5480)) * w;
    else y = 0.5 * w;
  }
  return { y: Math.floor(y), band };
}

// 所定給付日数。yearsは加入期間の区分 0:1年未満 1:1〜5年 5:5〜10年 10:10〜20年 20:20年以上
const YEAR_COL = { 0: 0, 1: 1, 5: 2, 10: 3, 20: 4 };
function benefitDays(age, years, reason) {
  const col = YEAR_COL[years];
  if (reason === "self") return [null, 90, 90, 120, 150][col];
  const table = age < 30 ? [90, 90, 120, 180, 180]
    : age < 35 ? [90, 120, 180, 210, 240]
    : age < 45 ? [90, 150, 180, 240, 270]
    : age < 60 ? [90, 180, 240, 270, 330]
    : [90, 150, 180, 210, 240];
  return table[col];
}
