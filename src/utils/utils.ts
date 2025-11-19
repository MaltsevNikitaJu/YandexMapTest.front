import base64 from 'base-64'

let injectedCsrfToken: string | null = null

export function takeHash(location: Location) {
  return location.hash.slice(1)
}

export function generateUuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Возвращает текущий CSRF токен для защиты от атаки CSRF.
 * Не создаёт токен, если его нет в cookies.
 * @returns {string|undefined} Токен CSRF.
 */
export function getCsrfToken(): string | null {
  if (injectedCsrfToken) {
    return injectedCsrfToken
  }
  const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]*)/)
  return match && match[1] ? decodeURIComponent(match[1]) : null
}

export function setCsrfToken(token: string | null) {
  injectedCsrfToken = token
}

export function base64encode(data: string) {
  return base64.encode(data)
}

export function base64decode(data: string) {
  return base64.decode(data)
}

export function pickObjectPart<T, K extends string | number | symbol>(
  fields: string[],
  object: Record<K, T>,
) {
  return fields.reduce<Record<string, T>>(
    (acc, field) => Object.assign(acc, { field: object[field as keyof typeof object] }),
    {},
  )
}

export function jsonDeepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

export function getURLWithoutPrefix(url: string) {
  return url.slice(url.indexOf('//') + 2)
}

export function makeQueryParams(params: Record<string, string | number | boolean | undefined>) {
  const result = Object.entries(params)
    .filter((e): e is [string, string | number | boolean] => e[1] !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
  return result ? `?${result}` : ''
}

export function formatNumber(number: number, fractionDigitsCount?: 0): string {
  const options = {
    minimumFractionDigits: fractionDigitsCount,
    maximumFractionDigits: fractionDigitsCount,
  }
  return Intl.NumberFormat(undefined, options).format(number)
}

export function wordForms(x: number, forms: string[]) {
  x = Math.abs(x)
  if ((x % 100 < 10 || x % 100 > 15) && [2, 3, 4].includes(x % 10)) return forms[1]
  if ((x % 100 < 10 || x % 100 > 15) && x % 10 === 1) return forms[0]
  return forms[2] || forms[1]
}

export function isFloat(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x) && !Number.isInteger(x)
}
