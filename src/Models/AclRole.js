'use strict'

const Model = use('Model')

class AclRole extends Model {

    static get traits() {
        return [
            '@provider:Adonis/Acl/RoleTrait'
        ]
    }

    //Relations
    actions() {
        return this.belongsToMany('Adonis/Acl/Action', 'acl_role_id', 'acl_action_slug', 'id', 'slug').pivotTable('acl_role_actions')
    }

    //IMPORTANT!!! Don't add relations with AclServices, since role's NULL on service id and service type represents all services.
    //That logic needs to be custom implemented
}

module.exports = AclRole
