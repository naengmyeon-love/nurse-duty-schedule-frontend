export function formText(formData: FormData, key: string, maxLength: number) {
  const value = String(formData.get(key) ?? "").trim();
  return value.length <= maxLength ? value : "";
}

export function formInt(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!/^\d{1,9}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

export function formIntInRange(formData: FormData, key: string, min: number, max: number) {
  const value = String(formData.get(key) ?? "").trim();
  if (!/^\d{1,3}$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : null;
}

export function isValidMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return year >= 2020 && year <= 2100 && month >= 1 && month <= 12;
}

export function isValidDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || !isValidMonth(`${match[1]}-${match[2]}`)) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.toISOString().slice(0, 10) === value;
}
