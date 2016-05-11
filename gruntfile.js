if (
  !process.env.CHROME_APP_ID
  || !process.env.CLIENT_ID
  || !process.env.CLIENT_SECRET
  || !process.env.REFRESH_TOKEN
) {
  throw new Error('You must specify the CHROME_APP_ID, CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN environment vars')
}

const ZIP = 'extension.zip'

module.exports = function initGrunt(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    webstore_upload: {
      accounts: {
        default: {
          cli_auth: true,
          publish: true,
          client_id: process.env.CLIENT_ID,
          client_secret: process.env.CLIENT_SECRET,
          refresh_token: process.env.REFRESH_TOKEN,
        },
      },
      extensions: {
        refinedGitHub: {
          appID: process.env.CHROME_APP_ID, // App ID from chrome webstore
          publish: true,
          zip: ZIP,
        },
      },
    },
  })

  grunt.loadNpmTasks('grunt-webstore-upload')
  grunt.registerTask('default', ['webstore_upload'])
}
