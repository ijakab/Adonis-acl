'use strict'

const Model = use('Model')

class AclRoleAction extends Model {

    //Relations
    role() {
        return this.belongsTo('Adonis/Acl/Role')
    }

    action() {
        return this.belongsTo('Adonis/Acl/Action', 'acl_action_slug', 'slug')
    }

}

module.exports = AclRoleAction
