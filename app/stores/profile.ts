interface ProfileDetails {
  title?: string
  information?: string
  gender?: string
  birthday?: string
  location?: string
  phone?: string
}

interface UserSocial {
  provider: string
  providerId: string
}

export interface UserSessionInfo {
  icon: string
  title: string
  description: string
  badge: string
  city: string
  ip: string
}

export interface UserApplication {
  id: string
  platformId: string
  platformName: string
  title: string
  slug: string
  description: string
  status: string
  private: boolean
  createdAt: string
  updatedAt: string
}

export interface FriendUser {
  id: string
  username: string
  firstName: string
  lastName: string
  photo?: string
}

export interface ConnectedUserProfile {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  photo?: string
  coins: number
  profile?: ProfileDetails
  socials?: UserSocial[]
  sessions?: UserSessionInfo[]
  applications?: UserApplication[]
  friends?: FriendUser[]
  friendRequests?: FriendUser[]
  blockedUsers?: FriendUser[]
  incomingRequests?: FriendUser[]
}

const PROFILE_CACHE_TTL_MS = 60_000

export const useProfileStore = defineStore('profile', {
  state: () => ({
    profile: null as ConnectedUserProfile | null,
    loading: false,
    error: '' as string,
    lastFetchedAt: 0,
  }),
  getters: {
    isCacheValid: (state) =>
      Boolean(state.profile) &&
      Date.now() - state.lastFetchedAt < PROFILE_CACHE_TTL_MS,
  },
  actions: {
    setCoins(coins: number) {
      if (!this.profile) {
        return
      }

      this.profile.coins = coins
    },
    clearProfile() {
      this.profile = null
      this.lastFetchedAt = 0
      this.error = ''
    },
    async fetchProfile(force = false) {
      if (!force && this.isCacheValid) {
        return this.profile
      }

      this.loading = true
      this.error = ''

      try {
        const response = await $fetch<ConnectedUserProfile>('/api/users/me')
        this.profile = response
        this.lastFetchedAt = Date.now()
        return this.profile
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : 'Unable to load profile'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
