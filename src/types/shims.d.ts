declare module 'base-64' {
  export function encode(value: string): string
  export function decode(value: string): string

  const base64: {
    encode: typeof encode
    decode: typeof decode
  }

  export default base64
}

declare module 'vue-cookies' {
  import type { App } from 'vue'

  export interface CookiesConfig {
    expires?: string | number | Date
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'lax' | 'strict' | 'none'
    partitioned?: boolean
  }

  export interface VueCookies {
    config(
      expires?: string | number | Date,
      path?: string,
      domain?: string,
      secure?: boolean,
      sameSite?: string,
      partitioned?: boolean,
    ): void
    set(
      keyName: string,
      value: unknown,
      expires?: string | number | Date,
      path?: string,
      domain?: string,
      secure?: boolean,
      sameSite?: string,
      partitioned?: boolean,
    ): this
    get<T = string>(keyName: string): T | null
    remove(keyName: string, path?: string, domain?: string): boolean
    isKey(keyName: string): boolean
    keys(): string[]
  }

  const VueCookies: VueCookies & {
    install(app: App, options?: CookiesConfig): void
  }

  export default VueCookies
}
