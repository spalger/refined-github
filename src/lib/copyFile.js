import $ from 'jquery'

export function addFileCopyButton() {
  // Button already added (partial page nav), or non-text file
  if ($('.copy-btn').length || !$('[data-line-number="1"]').length) {
    return
  }

  const $targetSibling = $('#raw-url')
  const fileUri = $targetSibling.attr('href')
  $(`<a href="${fileUri}" class="btn btn-sm copy-btn">Copy</a>`).insertBefore($targetSibling)

  $(document).on('click', e => {
    if (!e.target.classList.contains('copy-btn')) {
      return
    }

    e.preventDefault()
    const fileContents = $('.js-file-line-container').get(0).innerText
    const css = {
      opacity: 0,
      position: 'fixed',
    }

    const $textArea = $('<textarea>')
    .css(css)
    .appendTo('body')
    .val(fileContents)
    $textArea.get(0).select()

    document.execCommand('copy')
    $textArea.remove()
  })
}
