export const notAvailable = "Not available";

const USD_TO_INR_DISPLAY_RATE = 83;

export function getSafeMoneyValue(value?: number | null) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

export function usdToINR(usdAmount?: number | null) {
  const safeValue = getSafeMoneyValue(usdAmount);
  return safeValue ? safeValue * USD_TO_INR_DISPLAY_RATE : null;
}

export function formatINR(amount?: number | null) {
  const safeValue = getSafeMoneyValue(amount);
  if (!safeValue) return notAvailable;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(safeValue);
}

export function formatDate(value?: string) {
  if (!value || value === notAvailable) return notAvailable;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}

export function formatRuntime(minutes?: number | null) {
  if (!minutes || minutes <= 0) return notAvailable;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${rest}m` : `${rest}m`;
}

export function languageName(code?: string) {
  const namesByCode: Record<string, string> = {
    en: "English",
    te: "Telugu",
    hi: "Hindi",
    mr: "Marathi",
    kn: "Kannada",
    ta: "Tamil",
    ml: "Malayalam"
  };

  return code ? namesByCode[code] ?? code.toUpperCase() : notAvailable;
}
