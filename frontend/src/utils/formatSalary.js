export const formatSalary = (salaryText) => {
  if (!salaryText) return "Thỏa thuận";
  return salaryText;
};

/** Lương dạng số từ backend (VND) → "15 - 25 triệu" / "Từ 15 triệu" / "Thỏa thuận". */
export const formatSalaryRange = (min, max) => {
  const toMillion = (v) => `${Number((Number(v) / 1_000_000).toFixed(1))}`;
  if (min && max) return `${toMillion(min)} - ${toMillion(max)} triệu`;
  if (min) return `Từ ${toMillion(min)} triệu`;
  if (max) return `Đến ${toMillion(max)} triệu`;
  return 'Thỏa thuận';
};
