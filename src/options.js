import angular from 'angular'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-material-design/dist/css/bootstrap-material-design.css'
import 'bootstrap-material-design/dist/css/ripples.css'

angular
  .module('OptionsApp', [])
  .component('options', {
    template: `
      <div>My name is {{$ctrl.name}}</div>
    `,
    controller: class OptionsController {
      name = 'spencer'
    },
  })
