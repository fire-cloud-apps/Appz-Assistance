import { authConfig } from '../auth/authConfig'

export interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: BodyInit | null | Record<string, unknown>
  requiresAuth?: boolean
}

export interface ApiClient {
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>
  patch<T>(path: string, options?: ApiRequestOptions): Promise<T>
  post<T>(path: string, options?: ApiRequestOptions): Promise<T>
  put<T>(path: string, options?: ApiRequestOptions): Promise<T>
  request<T>(path: string, options?: ApiRequestOptions): Promise<T>
}

export class ApiError extends Error {
  status: number
  statusText: string
  responseBody?: unknown

  constructor(status: number, statusText: string, responseBody?: unknown) {
    super(`API request failed with status ${status} ${statusText}`.trim())
    this.name = 'ApiError'
    this.status = status
    this.statusText = statusText
    this.responseBody = responseBody
  }
}

const isJsonContentType = (value: string | null) => value?.includes('application/json') ?? false

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, '')

const buildRequestUrl = (path: string) => {
  const baseUrl = authConfig.apiBaseUrl.trim()

  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured for Web API requests.')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${normalizeBaseUrl(baseUrl)}${normalizedPath}`
}

const normalizeBody = (body: ApiRequestOptions['body'], headers: Headers) => {
  if (body == null || body instanceof FormData || typeof body === 'string' || body instanceof Blob) {
    return body ?? null
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  return JSON.stringify(body)
}

const parseResponse = async (response: Response) => {
  if (response.status === 204) {
    return undefined
  }

  const contentType = response.headers.get('content-type')

  if (isJsonContentType(contentType)) {
    return response.json()
  }

  return response.text()
}

export const createApiClient = (getAccessToken?: (() => Promise<string>) | null): ApiClient => {
  const request = async <T>(path: string, options: ApiRequestOptions = {}) => {
    const { body, headers, requiresAuth = true, ...init } = options
    const requestHeaders = new Headers(headers)
    requestHeaders.set('Accept', 'application/json')

    if (requiresAuth) {
      if (!getAccessToken) {
        throw new Error('Authenticated API requests require an Auth0 access token provider.')
      }

      const token = await getAccessToken()
      requestHeaders.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(buildRequestUrl(path), {
      ...init,
      body: normalizeBody(body, requestHeaders),
      headers: requestHeaders,
    })

    const responseBody = await parseResponse(response)

    if (!response.ok) {
      throw new ApiError(response.status, response.statusText, responseBody)
    }

    return responseBody as T
  }

  return {
    delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
    get: (path, options) => request(path, { ...options, method: 'GET' }),
    patch: (path, options) => request(path, { ...options, method: 'PATCH' }),
    post: (path, options) => request(path, { ...options, method: 'POST' }),
    put: (path, options) => request(path, { ...options, method: 'PUT' }),
    request,
  }
}
