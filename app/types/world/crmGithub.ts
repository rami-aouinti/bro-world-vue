export interface CrmGithubListResponse<TItem = Record<string, unknown>> {
  items: TItem[]
  [key: string]: unknown
}

export interface CrmGithubSyncJobStatus {
  id: string
  applicationSlug: string
  owner: string
  startedAt: string
  finishedAt: string | null
  status: string
  projectsCreated: number
  reposAttached: number
  issuesImported: number
  errorsCount: number
  errors: Array<Record<string, unknown> | string>
}

export interface CrmGithubBootstrapPayload {
  token: string
  owner: string
  issueTarget?: string
  createPublicProject?: boolean
  dryRun?: boolean
}

export interface CrmGithubBootstrapResponse {
  jobId: string
  status: string
}

export interface CrmGithubAttachRepositoryPayload {
  fullName: string
}

export interface CrmGithubCreateRepositoryPayload {
  name: string
  description?: string
  private?: boolean
}

export interface CrmGithubCreateIssuePayload {
  repository: string
  title: string
  body?: string
}

export interface CrmGithubIssueCommentPayload {
  repository: string
  body: string
}

export interface CrmGithubIssueStatePayload {
  repository: string
  state: string
}

export interface CrmGithubCreateBranchPayload {
  repository: string
  name: string
  sourceBranch?: string
}

export interface CrmGithubDeleteBranchPayload {
  repository: string
  name: string
}

export interface CrmGithubCreateProjectBoardPayload {
  owner: string
  title: string
}

export interface CrmGithubMoveProjectItemPayload {
  afterItemId?: string | null
}

export interface CrmGithubPullRequestActionPayload {
  repo: string
  action: 'merge' | 'close'
  mergeMethod?: 'merge' | 'squash' | 'rebase'
}

export interface CrmGithubUpdateRepositoryBindingPayload {
  defaultBranch?: string
  syncStatus?: string
  metadata?: Record<string, unknown>
}

export interface CrmGithubTaskRequestBranchPayload {
  name?: string
  sourceBranch?: string
  postCommentOnIssue?: boolean
}
