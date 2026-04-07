export interface SessionUser {
  id: string
  username: string
  firstName: string
  lastName: string
  email: string
  language: string
  locale: string
  timezone: string
  photo: string
  coins: number
  roles: string[]
  token: string
}
