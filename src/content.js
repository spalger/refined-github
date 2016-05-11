import $ from 'jquery'
import githubInjection from 'github-injection'

// libs
import * as pageDetect from './lib/pageDetect'
import * as addReactionParticipants from './lib/reactionsAvatars'
import { addFileCopyButton } from './lib/copyFile'
import * as diffFileHeader from './lib/diffHeader'

// assets
import './style/content.css'
import './style/custom.css'
import octiconSvg from './assets/octicon.svg'
import octiconPullSvg from './assets/octicon-pull.svg'
import octiconPencilSvg from './assets/octicon-pencil.svg'
import octiconForkedSvg from './assets/octicon-forked.svg'

const { ownerName, repoName } = pageDetect.getOwnerAndRepo()
const repoUrl = `${ownerName}/${repoName}`
const getUsername = () => $('meta[name="user-login"]').attr('content')

function linkifyBranchRefs() {
  $('.commit-ref').each((i, el) => {
    const parts = $(el).find('.css-truncate-target')
    const branch = parts.eq(parts.length - 1).text()
    let username = ownerName

    // if there are two parts the first part is the username
    if (parts.length > 1) {
      username = parts.eq(0).text()
    }

    $(el).wrap(`<a href="https://github.com/${username}/${repoName}/tree/${branch}">`)
  })
}

function appendReleasesCount(count) {
  if (!count) {
    return
  }

  $('.reponav-releases').append(`<span class="counter">${count}</span>`)
}

function cacheReleasesCount() {
  const releasesCountCacheKey = `${repoUrl}-releases-count`

  if (pageDetect.isRepoRoot()) {
    const releasesCount = $('.numbers-summary a[href$="/releases"] .num').text().trim()
    appendReleasesCount(releasesCount)
    chrome.storage.local.set({ [releasesCountCacheKey]: releasesCount })
  } else {
    chrome.storage.local.get(releasesCountCacheKey, items => {
      appendReleasesCount(items[releasesCountCacheKey])
    })
  }
}

function addReleasesTab() {
  const $repoNav = $('.js-repo-nav')
  let $releasesTab = $repoNav.children('[data-selected-links~="repo_releases"]')
  const hasReleases = $releasesTab.length > 0

  if (!hasReleases) {
    $releasesTab = $(`
      <a
        href="/${repoUrl}/releases"
        class="reponav-item reponav-releases"
        data-hotkey="g r"
        data-selected-links="repo_releases /${repoUrl}/releases">
        ${octiconSvg}
      <span>Releases</span>
    </a>`)
  }

  if (pageDetect.isReleases()) {
    $repoNav.find('.selected')
      .removeClass('js-selected-navigation-item selected')

    $releasesTab.addClass('js-selected-navigation-item selected')
  }

  if (!hasReleases) {
    $repoNav.append($releasesTab)

    cacheReleasesCount()
  }
}

function infinitelyMore() {
  const btn = $('.ajax-pagination-btn').get(0)

  // if there's no more button remove unnecessary event listeners
  if (!btn) {
    window.removeEventListener('scroll', infinitelyMore)
    window.removeEventListener('resize', infinitelyMore)
    return
  }

  // grab dimensions to see if we should load
  const wHeight = window.innerHeight
  const wScroll = window.pageYOffset || document.scrollTop
  const btnOffset = $('.ajax-pagination-btn').offset().top

  // smash the button if it's coming close to being in view
  if (wScroll > (btnOffset - wHeight)) {
    btn.click()
  }
}

function addBlameParentLinks() {
  $('.blame-sha:not(.js-blame-parent)').each((index, commitLink) => {
    const $commitLink = $(commitLink)
    const $blameMetaContainer = $commitLink.nextAll('.blame-commit-meta')
    if ($blameMetaContainer.find('.js-blame-parent').length > 0) {
      return
    }

    const $blameParentLink = $commitLink.clone()
    const commitSha = /\w{40}$/.exec(commitLink.href)[0]

    $blameParentLink
      .text('Blame ^')
      .addClass('js-blame-parent')
      .prop('href', location.pathname.replace(
        /(\/blame\/)[^\/]+/,
        `$1${commitSha}${encodeURI('^')}`
      ))

    $blameMetaContainer.append($blameParentLink)
  })
}

function addReadmeEditButton() {
  const readmeContainer = $('#readme')
  if (!readmeContainer.length) {
    return
  }

  const readmeName = $('#readme > h3').text().trim()
  const path = $('.js-repo-root ~ .js-path-segment, .final-path')
    .map((idx, el) => $(el).text())
    .get()
    .join('/')

  const currentBranch = $('.file-navigation .select-menu.left button.select-menu-button').attr('title')
  const editHref = `/${repoUrl}/edit/${currentBranch}/${path ? `${path}/` : ''}${readmeName}`
  const editButtonHtml = `
    <div id="refined-github-readme-edit-link">
      <a href="${editHref}">
        ${octiconPencilSvg}
      </a>
    </div>
  `

  readmeContainer.append(editButtonHtml)
}

function addDeleteForkLink() {
  const postMergeContainer = $('#partial-pull-merging')

  if (postMergeContainer.length > 0) {
    const postMergeDescription = $(postMergeContainer).find('.merge-branch-description').get(0)
    const forkPath = $(postMergeContainer).attr('data-channel').split(':')[0]

    if (forkPath !== repoUrl) {
      $(postMergeDescription).append(
        `<p id="refined-github-delete-fork-link">
          <a href="https://github.com/${forkPath}/settings">
            ${octiconForkedSvg}
            Delete fork
          </a>
        </p>`
      )
    }
  }
}

function linkifyIssuesInTitles() {
  const $title = $('.js-issue-title')
  const titleText = $title.text()

  if (/(#\d+)/.test(titleText)) {
    $title.html(titleText.replace(
      /#(\d+)/g,
      `<a href="https://github.com/${repoUrl}/issues/$1">#$1</a>`
    ))
  }
}

function addPatchDiffLinks() {
  if ($('.sha-block.patch-diff-links').length > 0) {
    return
  }

  let commitUrl = location.pathname.replace(/\/$/, '')
  if (pageDetect.isPRCommit()) {
    commitUrl = commitUrl.replace(/\/pull\/\d+\/commits/, '/commit')
  }
  const commitMeta = $('.commit-meta span.right').get(0)

  $(commitMeta).append(`
    <span class="sha-block patch-diff-links">
      <a href="${commitUrl}.patch" class="sha">.patch</a>
      <a href="${commitUrl}.diff" class="sha">.diff</a>
    </span>
  `)
}

function markMergeCommitsInList() {
  $('.commit.commits-list-item.table-list-item:not(.refined-github-merge-commit)').each((index, element) => {
    const $element = $(element)
    const messageText = $element.find('.commit-title').text()
    if (/Merge pull request #/.test(messageText)) {
      $element
        .addClass('refined-github-merge-commit')
        .find('.commit-avatar-cell')
          .prepend(octiconPullSvg)
          .find('img')
            .addClass('avatar-child')
    }
  })
}

function indentInput(el, size = 4) {
  el.focus()
  const value = el.value
  const selectionStart = el.selectionStart
  const indentSize = (size - el.selectionEnd % size) || size
  const indentationText = ' '.repeat(indentSize)

  /* eslint-disable no-param-reassign */
  el.value = value.slice(0, selectionStart) + indentationText + value.slice(el.selectionEnd)
  el.selectionEnd = el.selectionStart = selectionStart + indentationText.length
  /* eslint-enable no-param-reassign */
}

function showRecentlyPushedBranches() {
  // Don't duplicate on back/forward in history
  if ($('.recently-touched-branches-wrapper').length) {
    return
  }

  const uri = `/${repoUrl}/show_partial?partial=tree/recently_touched_branches_list`
  const fragMarkup = `<include-fragment src=${uri}></include-fragment>`
  const div = document.createElement('div')
  div.innerHTML = fragMarkup
  $('.repository-content').prepend(div)
}

// Support indent with tab key in textarea elements
$(document).on('keydown', 'textarea', e => {
  if (e.which === 9 && !e.shiftKey) {
    e.preventDefault()
    indentInput(e.target)
    return false
  }

  return null
})

// Prompt user to confirm erasing a comment with the Cancel button
$(document).on('click', '.js-hide-inline-comment-form', () => {
  // Do not prompt if textarea is empty
  const text = $(this)
    .closest('.js-inline-comment-form')
    .find('.js-comment-field')
    .val()

  if (text.length === 0) {
    return
  }

  const sure = window.confirm('Are you sure you want to discard your unsaved changes?') // eslint-disable-line no-alert
  if (sure === false) {
    event.stopPropagation()
    event.stopImmediatePropagation()
  }
})

// Collapse file diffs when clicking the file header
$(document).on('click', e => {
  const $target = $(e.target)

  if (!(
    $target.closest('.file-header').length > 0 &&
    $target.closest('.file-actions').length === 0
  )) {
    return
  }

  $target.closest('.js-details-container').toggleClass('refined-github-minimized')
})

document.addEventListener('DOMContentLoaded', () => {
  const username = getUsername()

  if (pageDetect.isDashboard()) {
    // hide other users starring/forking your repos
    const hideStarsOwnRepos = () => {
      $('#dashboard .news .watch_started, #dashboard .news .fork')
        .has(`.title a[href^="/${username}"]`)
        .css('display', 'none')
    }

    hideStarsOwnRepos()

    new MutationObserver(() => hideStarsOwnRepos())
      .observe($('#dashboard .news').get(0), { childList: true })

    // event binding for infinite scroll
    window.addEventListener('scroll', infinitelyMore)
    window.addEventListener('resize', infinitelyMore)
  }

  if (pageDetect.isRepo()) {
    githubInjection(window, () => {
      addReleasesTab()
      diffFileHeader.destroy()

      if (pageDetect.isPR()) {
        linkifyBranchRefs()
        addDeleteForkLink()
      }

      if (pageDetect.isPR() || pageDetect.isIssue()) {
        linkifyIssuesInTitles()
      }

      if (pageDetect.isBlame()) {
        addBlameParentLinks()
      }

      if (pageDetect.isRepoRoot() || pageDetect.isRepoTree()) {
        addReadmeEditButton()
      }

      if (pageDetect.isPRList() || pageDetect.isIssueList()) {
        showRecentlyPushedBranches()
      }

      if (pageDetect.isCommit()) {
        addPatchDiffLinks()
      }

      if (pageDetect.isPR() || pageDetect.isIssue() || pageDetect.isCommit()) {
        addReactionParticipants.add(username)
        addReactionParticipants.addListener(username)
      }

      if (pageDetect.isCommitList()) {
        markMergeCommitsInList()
      }

      if (pageDetect.isPRFiles() || pageDetect.isPRCommit()) {
        diffFileHeader.setup()
      }

      if (pageDetect.isSingleFile()) {
        addFileCopyButton()
      }
    })
  }
})
