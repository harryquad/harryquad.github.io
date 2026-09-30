// 税金・社会保険料の共通計算（令和8年＝2026年分）
// 社会保険料率は目安：健康保険5.0%、介護保険0.8%（40〜64歳）、厚生年金9.15%、雇用保険0.55%

// 所得税の速算表 [上限, 税率, 控除額]
const BRACKETS = [
  [1949000, 0.05, 0], [3299000, 0.10, 97500], [6949000, 0.20, 427500], [8999000, 0.23, 636000],
  [17999000, 0.33, 1536000], [39999000, 0.40, 2796000], [Infinity, 0.45, 4796000],
];

// 課税所得（1,000円未満切り捨て済み）から、復興特別所得税を含む所得税を求める
function incomeTaxOf(taxable) {
  if (taxable <= 0) return 0;
  const [, rate, minus] = BRACKETS.find(b => taxable <= b[0]);
  return Math.floor(Math.round(taxable * rate - minus) * 1021 / 1000);
}

// 給与所得控除（minは最低保障額。所得税は令和8年分の特例で74万円、住民税は65万円）
function salaryDeduction(a, min) {
  let d;
  if (a <= 3600000) d = a * 0.3 + 80000;
  else if (a <= 6600000) d = a * 0.2 + 440000;
  else if (a <= 8500000) d = a * 0.1 + 1100000;
  else d = 1950000;
  return Math.min(a, Math.max(min, d));
}

// 所得税の基礎控除（令和8年分、合計所得金額による）
function basicDeduction(income) {
  if (income <= 4890000) return 1040000;
  if (income <= 6550000) return 670000;
  if (income <= 23500000) return 620000;
  if (income <= 24000000) return 480000;
  if (income <= 24500000) return 320000;
  if (income <= 25000000) return 160000;
  return 0;
}

// 会社員の社会保険料（年額）
function socialInsurance(annual, over40, months = 12) {
  const monthly = annual / months;
  const pension = Math.min(monthly, 650000) * 0.0915 * months;
  const health = annual * (0.05 + (over40 ? 0.008 : 0));
  const employment = annual * 0.0055;
  return { pension, health, employment, total: pension + health + employment };
}

// 住民税（年額）。socialは社会保険料の年額
function residentTaxOf(annual, social) {
  const income = annual - salaryDeduction(annual, 650000);
  if (income <= 450000) return 0;
  const taxable = Math.max(0, Math.floor((income - social - 430000) / 1000) * 1000);
  return taxable * 0.1 + 5000;
}

// 年収（額面）から手取りを求める。独身・扶養なしの会社員を想定
function takeHome(annual, over40) {
  const si = socialInsurance(annual, over40);
  const social = si.total;
  const incomeIT = annual - salaryDeduction(annual, 740000);
  const taxableIT = Math.max(0, Math.floor((incomeIT - social - basicDeduction(incomeIT)) / 1000) * 1000);
  const incomeTax = incomeTaxOf(taxableIT);
  const residentTax = residentTaxOf(annual, social);
  return { annual, si, social, incomeTax, residentTax, net: annual - social - incomeTax - residentTax };
}
