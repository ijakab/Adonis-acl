'use strict'

/**
 * adonis-acl
 * Copyright(c) 2017 Evgeny Razumov
 * MIT Licensed
 */

const { ServiceProvider } = require('@adonisjs/fold')

class AclProvider extends ServiceProvider {
  register () {
    this.app.bind('Adonis/AclService', () => {
      const AclService = require('../src/Services/AclService')
      return AclService
    })
  }

  boot () {
    try {
      const View = this.app.use('Adonis/Src/View')
      require('../src/ViewBindings')(View)
    } catch (error) {}
  }
}

module.exports = AclProvider