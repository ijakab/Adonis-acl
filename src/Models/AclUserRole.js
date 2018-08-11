'use strict'

const Model = use('Model')

class AclUserRole extends Model {

    //Relations
    user() {
        return this.belongsTo('App/Models/User')
    }

    role() {
        return this.belongsTo('App/Models/AclRole')
    }
}

module.exports = AclUserRole
