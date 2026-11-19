/** «18 января 2027 года» — без «г.», чтобы после даты можно было ставить точку. */
export function formatDateRu(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }).replace(/\s?г\.$/, " года")
}
