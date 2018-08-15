let User
const ActionService = use('Adonis/Acl/ActionService')
const Action = use('Adonis/Acl/Action')
const Role = use('Adonis/Acl/Role')
const Service = use('Adonis/Acl/Service')
const RoleAction = use('Adonis/Acl/RoleAction')
const UserRole = use('Adonis/Acl/UserRole')
const Database = use('Database')

const parser = use('Adonis/Acl/Parser')
let existingActions

let AclService = {

    init(Config) {
        this.Config = Config
        User = use(Config.get('acl.userPath'))
        existingActions = Config.get('acl.existingActions')
    },

    //SERVICES
    async createService(str) {
        let info = parser.getService(str)
        try {
            if(!info.slug) throw {
                message: 'Every service must have a slug'
            }
            await Service.create(info)
        } catch (e) {
            e.AclMessage = 'Error while creating service ' + str
            throw e
        }
    },

    async createManyServices(arr){
        let objs = []
        for(let str of arr) {
            objs.push(parser.getService(str))
        }
        try{
            await Service.createMany(objs)
        } catch (e) {
            e.AclMessage = 'Error while creating many services ' + arr
            throw e
        }
    },

    //always accepts serviceStr and and sees if it can read ID from it. if it can, it will not go to DB
    async getServiceId(serviceStr) {
        let info = parser.getService(serviceStr)
        if(info.id || info.id === null) return info.id
        let service = await Service.query().serviceString(serviceStr).first()
        if(!service) throw {
            message: `Error while fetching id of ${serviceStr}: Service ${serviceStr} does not exist`
        }
        return service.toJSON().id
    },

    //accepts either serviceStr and fetches serviceObj with provided relations and returns serialized, or object in which case it just returns it
    async getService(service, relations) {
        if(typeof service === 'string') {
            let query = Service.query().serviceString(service)
            if(relations) {
                for(let relation of relations) {
                    query.with(relation)
                }
            }
            let serviceObj = await query.first()
            if(!serviceObj) {throw {
                message: `Service ${service} does not exist`
            }}
            return serviceObj.toJSON()
        } else {
            return service
        }
    },

    //ACTIONS
    //IMPORTANT NOTE!!! functions under this section are very expensive and are intended to use ONLY during seed.
    //Furthermore, if you are calling this during runtime you are probably doing something wrong
    //Only function you might need to call on runtime is resetScope, but ONLY ON RATE OCCASIONS
    async resetActions() {
        let actions = existingActions
        let actionObjs = []
        for(let action of actions) {
            if(typeof action === 'string') {
                actionObjs.push({slug: action})
            } else {
                actionObjs.push(action)
            }
        }
        await Action.query().truncate()
        await Action.createMany(actionObjs)
        await this.refreshScopes()
        await this.refreshRoleActions()
    },

    async resetActionScope(serviceType, actions) {
        for(let action of actions) {
            if(!this.actionExists(action))
                throw {message: `Error while resetting action scope for ${serviceType}, Action ${action} does not exist`}
        }
        try{
            await ActionService.query()
                .where('service_type', serviceType)
                .delete()
        } catch (e) {
            e.AclMessage = 'Error deleting action scope on ' + serviceType
            throw e
        }
        let objs = []
        for(let action of actions) {
            objs.push({
                action_slug: action,
                service_type: serviceType
            })
        }
        try{
            await ActionService.createMany(objs)
        } catch (e) {
            e.AclMessage = 'Error setting action scope for services on ' + serviceType
            e.actions = actions
            throw e
        }
        await this.refreshRoleActions()
    },

    async refreshScopes() {
        await ActionService
            .query()
            .whereNotIn('action_slug', this.getExistingActionSlugs())
            .delete()
    },

    async refreshRoleActions() {
        //to save a lot of processing power, we wrote raw query
        //We need to pass through role_action links, and remove those that link to actions that their service types no longer have access to
        let query = `
            select RA.id, RA.acl_action_slug, R.service_type
            from acl_role_actions as RA
            inner join acl_roles as R on R.id = RA.acl_role_id
            where not exists
                (select id from acl_action_services as ASER
                 where ASER.service_type = R.service_type and ASER.action_slug = RA.acl_action_slug)
        `
        let result = await Database.raw(query)
        let remove_ids = result[0].map(record => record.id)
        await RoleAction.query()
            .whereNotIn('acl_action_slug', this.getExistingActionSlugs()) //we also want to remove relation if action no longer exists
            .orWhereIn('id', remove_ids)
            .delete()
    },

    //ROLES
    async createRoleObject(role, service_string, isPublic = true, foreign = false) {
        let info = parser.getService(service_string)
        let service_id = await this.getServiceId(service_string)
        let obj = {
            public: isPublic,
            foreign,
            acl_service_id: service_id,
            service_type: info.type
        }
        if(typeof role === 'string') {
            obj.slug = role
            return obj
        } else {
            let assigned = Object.assign(obj, role)
            return assigned
        }
    },

    async createRole(role) {
        if(role.service_type === '*' && role.acl_service_id !== '*') {
            throw {
                message: `Error while creating role ${role}: If service type is set to * (or null), service id must be also * (or null)`
            }
        }
        if(!role.acl_service_id && role.acl_service_id !== null) {
            throw {
                message: `Error while creating role ${role}: Every role must have service_id or set to null to indicate that role is applied for all services`
            }
        }
        if(role.acl_service_id !== null) {
            let service = await this.getService(`${role.service_type}:%${role.acl_service_id}`) //function will throw error on fail on it's own - we check if service exists
            if((await this.ServiceHasRole(service, role.slug))) throw {message: `Error while creating role: Service ${role.service_type}:%${role.acl_service_id} already has role with slug ${role.slug}`}
            //Todo: what if you create a role for all services, and some service already has that role
        }
        await Role.create(role)
    },

    //LINKING
    async linkRoleActions(role_id, actions) {
        let objs = []
        for(let action of actions) {
            //todo check if service has action
            //todo check if role already has action
            if(!this.actionExists(action))
                throw {message: `Error while linking ${role} to ${action} on ${serviceStr}: Action ${action} does not exist`}
            objs.push({
                acl_role_id: role_id,
                acl_action_slug: action
            })
        }
        await RoleAction.createMany(objs)
    },

    async linkUsersRole(role_id, userIds) {
        let objs = []
        for(let userId of userIds) {
            objs.push({user_id: userId, acl_role_id: role_id})
        }
        await UserRole.createMany(objs)
    },

    async unlinkUserRole(role_id, user_id) {
        await UserRole.query()
            .where('user_id', user_id)
            .where('acl_role_id', role_id)
            .delete()
    },

    async unlinkRoleAction(role_id, action) {
        await RoleAction.query()
            .where('acl_role_id', role_id)
            .where('acl_action_slug', action)
            .delete()
    },

    async deleteRole(role_id) {
        await Role.query()
            .where('id', role_id)
            .delete()
        await RoleAction.query()
            .where('acl_role_id', role_id)
            .delete()
        await UserRole.query()
            .where('acl_role_id', role_id)
            .delete()
    },

    async resetRoleActions(role_id, actions) {
        await RoleAction.query()
            .where('acl_role_id', role_id)
            .delete()
        await this.linkRoleActions(role_id, actions)
        //todo: check service has action
    },

    //VALIDATION
    async ServiceHasAction(serviceStr, actionSlug) {
        //a bit confusing naming, serviceStr can actually be classic serviceStr used throughout service, or it can be already fetched object to ease eager loading. If latter, it needs to be serialized and have 'possibleActions' attached to it
        let serviceObj = await this.getService(serviceStr, ['possibleActions'])
        if(!serviceObj.possibleActions.find(action => action.slug === actionSlug)) {
            return false
        } else {
            return serviceObj
        }
    },

    async ServiceHasRole(serviceStr, role) {
        //a bit confusing naming, serviceStr can actually be classic serviceStr used throughout service, or it can be already fetched object to ease eager loading. If latter, it needs to be serialized have 'possibleActions' attached to it
        let service = await this.getService(serviceStr)
        let query = Role.query()
            .whereService(service)
        if(typeof role === 'number') query.where('id', role)
        if(typeof role === 'string') query.where('slug', role)
        let roleObj = await query.first()
        if(!roleObj) return false
        return roleObj.toJSON()
    },

    async UserCan(serviceStr, action, initialQuery) {
        initialQuery = this.initializeUserQuery(initialQuery)
        let service = await this.getService(serviceStr)

        let user = await initialQuery
            .with('roles', q => {
                q.whereService(service)
                q.with('actions', q => {
                    q.where('slug', action)
                })
            })
            .first()
        let userObj = user.toJSON()

        let aclResult = false
        if(userObj.roles[0].actions.length === 1) aclResult = true
        return {
            aclResult,
            queryResult: user
        }
    },

    async UserIs(serviceStr, role, initialQuery) {
        initialQuery = this.initializeUserQuery(initialQuery)
        let service = await this.getService(serviceStr)
        let user = await initialQuery
            .with('roles', q => {
                q.whereService(service)
                q.where('slug', role)
            })
            .first()
        let userObj = user.toJSON()

        let aclResult = false
        if(userObj.roles.length === 1) aclResult = true
        return {
            aclResult,
            queryResult: user
        }
    },

    //LISTINGS
    async getRole(serviceStr, role, relations) {
        let service = await this.getService(serviceStr)
        let query = Role.query()
            .whereService(service)
            .where('slug', role)
        if(relations){
            for(let relation of relations) {
                query.with(relation)
            }
        }
        let result = await query.first();
        if(!result) {
            throw {message: `Error while getting role: Service ${serviceStr} does not have role ${role}`}
        }
        return result
    },

    async getServiceRoles(service) {
        service = await this.getService(service)
        return await Role.query().whereService(service).fetch()
    },

    async getServicePublicRoles(service) {
        service = await this.getService(service)
        return await Role.query().whereServicePublic(service).fetch()
    },

    async getServicePrivateRoles(service) {
        service = await this.getService(service)
        return await Role.query().whereServicePrivate(service).fetch()
    },

    async getServiceActions(service) {
        let serviceObj = service
        if(typeof  service === 'string') {
            serviceObj = await this.getService(service, ['possibleActions'])
        } else {
            if(!serviceObj.possibleActions) {
                serviceObj = await this.getService(`${service.type}:%${service.id}`, ['possibleActions'])
            }
        }
        return serviceObj.possibleActions
    },

    async getUserRoles(initialQuery, serviceStr) {
        initialQuery = this.initializeUserQuery(initialQuery)
        if(serviceStr) serviceStr = await this.getStrOrObject(serviceStr)
        let query = initialQuery
            .with('roles', q => {
                if(serviceStr){
                    q.whereServices(serviceStr)
                }
            })
        return await query.fetch()
    },

    async getUserActions(initialQuery, serviceStr) {
        initialQuery = this.initializeUserQuery(initialQuery)
        if(serviceStr) serviceStr = await this.getStrOrObject(serviceStr)
        let query = initialQuery
            .with('roles', q => {
                if(serviceStr) q.whereServices(serviceStr)
                q.with('actions')
            })
        return await query.fetch()
    },

    //HELPERS
    actionExists(action) {
        //we have all existing actions in memory which will save a lot of database calls
        return existingActions.find(existingAction => {
            if(typeof existingAction === 'string')
                return existingAction === action
            else
                return existingAction.slug === action
        })
    },

    getExistingActionSlugs() {
        let slugs = []
        for(let existingAction of existingActions) {
            if(typeof existingAction === 'string') slugs.push(existingAction)
            else slugs.push(existingAction.slug)
        }
        return slugs
    },

    initializeUserQuery(param) {
        if(typeof param === 'number')
            return User.query().where('id', param)
        else if(typeof param === 'string')
            return User.query().where('slug', param)
        else
            return param
    },

    async getStrOrObject(serviceStr) {
        //whereServices (which accepts string) macro can accept the object and redirect to whereService macro (which accepts object) but it cannot async get object from string.
        //for that reason we check if sent string is represents services or service and create object or leave it in string accordingly. if object is already sent all is ok
        if(typeof  serviceStr !== 'string') return serviceStr
        let info = parser.getService(serviceStr)
        if(info.id !== null) return await this.getService(serviceStr)
        return serviceStr
    }
}

module.exports = AclService