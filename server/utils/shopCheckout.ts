import crypto from 'node:crypto'

export type CheckoutStep = 'cart' | 'address' | 'shipping' | 'payment' | 'confirmation'
export type PaymentProvider = 'stripe' | 'adyen' | 'paypal'
export type CheckoutStatus = 'draft' | 'payment_pending' | 'processing' | 'paid' | 'failed'

export interface CartLine {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export interface Address {
  fullName: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
}

export interface ShippingOption {
  id: string
  label: string
  carrier: string
  amount: number
  etaDays: number
}

export interface PaymentAttempt {
  id: string
  createdAt: string
  idempotencyKey: string
  provider: PaymentProvider
  status: 'pending' | 'failed' | 'succeeded'
  reason?: string
  providerPaymentId?: string
  clientSecret?: string
}

export interface CheckoutSession {
  id: string
  step: CheckoutStep
  status: CheckoutStatus
  currency: string
  cart: CartLine[]
  subtotalAmount: number
  shippingAmount: number
  totalAmount: number
  address?: Address
  shippingOptions: ShippingOption[]
  selectedShippingId?: string
  provider?: PaymentProvider
  providerPaymentId?: string
  attempts: PaymentAttempt[]
  lastError?: string
  createdAt: string
  updatedAt: string
}

interface CheckoutStore {
  sessions: Record<string, CheckoutSession>
  idempotency: Record<string, string>
}

const STORAGE_KEY = 'world:shop:checkout:v1'

const baseStore = (): CheckoutStore => ({ sessions: {}, idempotency: {} })

export async function getCheckoutStore() {
  const storage = useStorage<CheckoutStore>('data')
  const existing = await storage.getItem(STORAGE_KEY)

  if (existing)
    return existing

  const seeded = baseStore()
  await storage.setItem(STORAGE_KEY, seeded)
  return seeded
}

export async function saveCheckoutStore(store: CheckoutStore) {
  await useStorage<CheckoutStore>('data').setItem(STORAGE_KEY, store)
}

export function generateId(prefix: string) {
  return `${prefix}_${crypto.randomUUID().replaceAll('-', '').slice(0, 22)}`
}

export function computeSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
}

export function computeShippingOptions(address: Address): ShippingOption[] {
  const isDomestic = address.country.toUpperCase() === 'US'

  return [
    { id: 'standard', label: 'Standard', carrier: 'UPS', amount: isDomestic ? 7.5 : 18, etaDays: isDomestic ? 5 : 10 },
    { id: 'express', label: 'Express', carrier: 'DHL', amount: isDomestic ? 15 : 32, etaDays: isDomestic ? 2 : 4 },
  ]
}

export function assertIdempotencyKey(idempotencyKey: unknown) {
  if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
    throw createError({ statusCode: 422, statusMessage: 'idempotencyKey is required' })
  }

  return idempotencyKey.trim()
}

export function assertNonEmptyString(value: unknown, field: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw createError({ statusCode: 422, statusMessage: `${field} is required` })
  }

  return value.trim()
}

export function assertPositiveNumber(value: unknown, field: string) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    throw createError({ statusCode: 422, statusMessage: `${field} must be a positive number` })
  }

  return value
}

export function assertStepTransition(current: CheckoutStep, target: CheckoutStep) {
  const map: Record<CheckoutStep, CheckoutStep[]> = {
    cart: ['address'],
    address: ['shipping'],
    shipping: ['payment'],
    payment: ['confirmation'],
    confirmation: [],
  }

  if (!map[current].includes(target)) {
    throw createError({
      statusCode: 409,
      statusMessage: `invalid checkout transition from ${current} to ${target}`,
    })
  }
}
