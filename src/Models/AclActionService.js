'use strict'

const Model = use('Model')

class AclActionService extends Model {

    static boot() {
        super.boot()
    }

    static get table() {
        return 'acl_action_services'
    }

    //Relations
    action() {
        return this.belongsTo('Adonis/Acl/Action', 'action_slug', 'slug')
    }
}

module.exports = AclActionService
