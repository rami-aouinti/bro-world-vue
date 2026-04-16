import type { AxiosRequestConfig, Method } from 'axios'
import { usePrivateAxios } from './axiosClient'

type PrivateApiRequestOptions = Omit<AxiosRequestConfig, 'url' | 'method'> & {
  method?: Method
}

async function request<T = unknown>(
  url: string,
  options: PrivateApiRequestOptions = {},
): Promise<T> {
  const privateAxios = usePrivateAxios()

  const response = await privateAxios.request<T>({
    url,
    ...options,
  })

  return response.data
}

export const privateApi = {
  request,
}
