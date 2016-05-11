import url from 'url'

const $curUri = Symbol('current uri')

function WindowMock(initialURI) {
  this[$curUri] = initialURI
}

WindowMock.prototype.location = {
  set href(uri) {
    const uriParts = url.parse(uri)
    this.hostname = uriParts.hostname
    this.pathname = uriParts.pathname
    this[$curUri] = uri
  },

  get href() {
    return this[$curUri]
  },
}

module.exports = WindowMock
