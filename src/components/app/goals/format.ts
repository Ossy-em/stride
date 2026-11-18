export const minutes = (m: number) => {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h}h ${r}m` : `${h}h`;
};
export const hours = (m: number) => `${Math.round((m / 60) * 10) / 10}h`.replace(".0h", "h");
export const shortDate = (ymd: string) =>
  new Date(`${ymd}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" });
export const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
