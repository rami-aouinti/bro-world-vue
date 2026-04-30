import type { AxiosRequestConfig, Method } from 'axios'
import { usePrivateAxios } from './axiosClient'

type PrivateApiRequestOptions = Omit<
  AxiosRequestConfig,
  'url' | 'method' | 'data'
> & {
  method?: Method
  body?: AxiosRequestConfig['data']
  data?: AxiosRequestConfig['data']
}

async function request<T = unknown>(
  url: string,
  options: PrivateApiRequestOptions = {},
): Promise<T> {
  const privateAxios = usePrivateAxios()
  const { body, data, ...rest } = options

  const response = await privateAxios.request<T>({
    url,
    ...rest,
    data: data ?? body,
  })

  return response.data
}

export const privateApi = {
  request,
}
