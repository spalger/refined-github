import $ from 'jquery'

export function add(currentUser) {
  $('.comment-reactions.has-reactions').each((_, reactionsContainer) => {
    const $reactionsContainer = $(reactionsContainer)
    const $reactionButtons = $reactionsContainer.find('.comment-reactions-options .reaction-summary-item[aria-label]')

    $reactionButtons.each((_, element) => {
      const participantCount = Number(element.innerHTML.split('/g-emoji>')[1])
      const participants = element.getAttribute('aria-label')
        .replace(/ reacted with.*/, '')
        .replace(/,? and /, ', ')
        .replace(/, \d+ more/, '')
        .split(', ')
      const userPosition = participants.indexOf(currentUser)

      // if the user is the only participant, leave as is
      if (participantCount === 1 && userPosition > -1) {
        return
      }

      // add participant container
      if ($(element).find('div.participants-container').length === 0) {
        $(element).append('<div class="participants-container">')
      }

      // remove self from participant list so you don't see your own avatar
      if (userPosition > -1) {
        participants.splice(userPosition, 1)
      }

      const firstThreeParticipants = participants.slice(0, 3)
      const participantsContainer = $(element).find('.participants-container').get(0)

      // clear any existing avatars and remainder count
      $(participantsContainer).html('')

      for (const participant of firstThreeParticipants) {
        $(participantsContainer).append(`<img src="https://github.com/${participant}.png">`)
      }
    })
  })
}

export function reapply(e, currentUser) {
  const hasHeads = $(e.target)
    .closest('button')
    .not('.add-reaction-btn')
    .is('.add-reactions-options-item, .reaction-summary-item')

  if (!hasHeads) return

  const applyReactions = setInterval(() => {
    add(currentUser)
    clearInterval(applyReactions)
  }, 500)
}

export function addListener(currentUser) {
  document.addEventListener('click', e => {
    reapply(e, currentUser)
  })
}
