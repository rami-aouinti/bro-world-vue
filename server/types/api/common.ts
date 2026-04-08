export type ApiPrimitive = string | number | boolean | null

export type ApiValue = ApiPrimitive | ApiObject | ApiValue[]

export type ApiObject = {
  [key: string]: ApiValue | undefined
}

export type ApiResponse = ApiObject | ApiValue[]

export type ApiQueryValue = string | number | boolean | undefined

export type ApiQuery = Record<string, ApiQueryValue>

export type MutationPayload = ApiObject

export type ResourceMutationPayload<
  TResource extends string,
  TBody extends MutationPayload = MutationPayload,
> = TBody & {
  resource: TResource
  resourceId: string
}
