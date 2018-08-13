'use strict'

const Model = use('Model')

class AclAction extends Model {

    //Relations
    roles() {
        return this.belongsToMany('Adonis/Acl/Action', 'acl_action_slug', 'acl_role_id', 'slug', 'id').pivotTable('acl_role_actions')
    }

    services() {
        return this.belongsToMany('Adonis/Acl/Service', 'action_slug', 'service_type', 'slug', 'type').pivotTable('acl_action_services')
    }

}

module.exports = AclAction
