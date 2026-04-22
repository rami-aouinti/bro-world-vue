export interface CrmGithubListResponse<TItem = Record<string, unknown>> {
  items: TItem[]
  [key: string]: unknown
}

export interface CrmGithubPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface CrmGithubCommitSummary {
  sha: string
  message: string
  author: string
  date: string
  htmlUrl: string
}

export interface CrmGithubCommitFile {
  filename: string
  status: string
  additions: number
  deletions: number
  changes: number
}

export interface CrmGithubCommitDetail extends CrmGithubCommitSummary {
  files: CrmGithubCommitFile[]
}

export interface CrmGithubCollaborator {
  login: string
  type: string
  htmlUrl: string
  permissions?: {
    admin?: boolean
    maintain?: boolean
    push?: boolean
    triage?: boolean
    pull?: boolean
  }
}

export interface CrmGithubWorkflow {
  id: number
  name: string
  state: string
  path: string
  htmlUrl: string
  createdAt: string
  updatedAt: string
}

export interface CrmGithubWorkflowRun {
  id: number
  name: string
  status: string
  conclusion: string | null
  event: string
  htmlUrl: string
  createdAt: string
  updatedAt: string
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

export interface CrmGithubSyncContext {
  jobId?: string
  applicationSlug?: string
  owner?: string
  status?: string
  updatedAt: string
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
