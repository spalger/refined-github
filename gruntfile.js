const {
  CHROME_APP_ID,
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
  EXTENSION_ZIP = 'extension.zip',
} = process.env

if (
  !CHROME_APP_ID ||
  !CLIENT_ID ||
  !CLIENT_SECRET ||
  !REFRESH_TOKEN
) {
  throw new Error('You must specify the CHROME_APP_ID, CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN environment vars')
}

module.exports = function initGrunt(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webstore_upload: {
      accounts: {
        default: {
          cli_auth: true,
          publish: true,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: REFRESH_TOKEN,
        },
      },
      extensions: {
        refinedGitHub: {
          appID: CHROME_APP_ID,
          publish: true,
          zip: EXTENSION_ZIP,
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-webstore-upload')
  grunt.registerTask('default', ['webstore_upload'])
}
