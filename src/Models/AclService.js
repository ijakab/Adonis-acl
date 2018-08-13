'use strict'

const Model = use('Model')

class AclService extends Model {

    static get traits() {
        return [
            '@provider:Adonis/Acl/ServiceTrait'
        ]
    }

    //Relations
    //IMPORTANT!!! Don't add relations with AclRoles, since role's NULL on service id and service type represents all services.
    //That logic needs to be custom implemented

    possibleActions() {
        return this.belongsToMany('Adonis/Acl/Action', 'service_type', 'action_slug', 'type', 'slug').pivotTable('acl_action_services')
    }
}

module.exports = AclService
