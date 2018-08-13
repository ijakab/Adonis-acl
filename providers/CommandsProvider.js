'use strict'

const ace = require('@adonisjs/ace')
const { ServiceProvider } = require('@adonisjs/fold')

class CommandsProvider extends ServiceProvider {
    register () {
        this.app.bind('Adonis/Commands/Acl:Setup', () => require('../commands/Setup'))
    }

    boot () {
        ace.addCommand('Adonis/Commands/Acl:Setup')
    }
}

module.exports = CommandsProvider
