export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'packed'
  | 'shipped'
  | 'delivered'
  | 'returned'
  | 'refunded'

export type SalesChannel = 'web' | 'mobile' | 'marketplace' | 'store'

export type OrderTimelineEvent = {
  id: string
  status: OrderStatus
  label: string
  at: string
  note?: string
}

export type OrderLine = {
  sku: string
  title: string
  quantity: number
  unitPrice: number
}

export type ReturnRecord = {
  id: string
  reason: string
  amount: number
  status: 'requested' | 'approved' | 'rejected' | 'refunded'
  createdAt: string
}

export type OrderRecord = {
  id: string
  customer: string
  channel: SalesChannel
  status: OrderStatus
  createdAt: string
  amount: number
  currency: string
  timeline: OrderTimelineEvent[]
  lines: OrderLine[]
  returns: ReturnRecord[]
  refundedAmount: number
  invoiceNumber?: string
  invoiceGeneratedAt?: string
}

export type OrderStatusMeta = {
  value: OrderStatus | 'all'
  title: string
  color: string
}

export type ChannelOption = {
  value: SalesChannel | 'all'
  title: string
}
