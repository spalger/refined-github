import $ from 'jquery'

export function isGist() {
  return location.hostname === 'gist.github.com'
}

export function isDashboard() {
  return location.pathname === '/' || /^(\/orgs\/[^\/]+)?\/dashboard/.test(location.pathname)
}

export function isRepo() {
  return !isGist() && /^\/[^/]+\/[^/]+/.test(location.pathname)
}

export function getRepoPath() {
  return location.pathname.replace(/^\/[^/]+\/[^/]+/, '')
}

export function isRepoRoot() {
  return (
    isRepo() &&
    /^(\/?$|\/tree\/)/.test(getRepoPath())
    && $('.repository-meta-content').length > 0
  )
}

export function isRepoTree() {
  return isRepo() && /\/tree\//.test(getRepoPath())
}

export function isIssueList() {
  return isRepo() && /^\/issues\/?$/.test(getRepoPath())
}

export function isIssue() {
  return isRepo() && /^\/issues\/\d+/.test(getRepoPath())
}

export function isPRList() {
  return isRepo() && /^\/pulls\/?$/.test(getRepoPath())
}

export function isPR() {
  return isRepo() && /^\/pull\/\d+/.test(getRepoPath())
}

export function isPRFiles() {
  return isRepo() && /^\/pull\/\d+\/files/.test(getRepoPath())
}

export function isPRCommit() {
  return isRepo() && /^\/pull\/\d+\/commits\/[0-9a-f]{5,40}/.test(getRepoPath())
}

export function isCommitList() {
  return isRepo() && /^\/commits\//.test(getRepoPath())
}

export function isSingleCommit() {
  return isRepo() && /^\/commit\/[0-9a-f]{5,40}/.test(getRepoPath())
}

export function isCommit() {
  return isSingleCommit() || isPRCommit() || (isPRFiles() && $('.full-commit').length > 0)
}

export function isReleases() {
  return isRepo() && /^\/(releases|tags)/.test(getRepoPath())
}

export function isBlame() {
  return isRepo() && /^\/blame\//.test(getRepoPath())
}

export function getOwnerAndRepo() {
  const [, ownerName, repoName] = location.pathname.split('/')
  return { ownerName, repoName }
}

export function isSingleFile() {
  const { ownerName, repoName } = getOwnerAndRepo()
  const blobPattern = new RegExp(`/${ownerName}/${repoName}/blob/`)
  return isRepo() && blobPattern.test(location.href)
}
