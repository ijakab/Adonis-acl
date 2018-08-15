# Advanced Adonis ACL
This is Access control list provider for [Adonis](https://adonisjs.com/) It was heavily inspired by [Adonis ACL](https://github.com/enniel/adonis-acl) provider. In fact, we recommend using it if it suits your needs, as it is much simpler. This provider introduces concept of services as a way to assign different roles to different parts of your application

## Installation
1. *Install the package*
>node ace install adonis-acl-advanced
1. *Register a providers*
Inside `start/app.js`
```javascript
const providers = [
    //anything you have
    'adonis-acl-advanced/providers/AclProvider'
    //anything you have
]

const aceProviders = [
    //anything you have
    'adonis-cache/providers/CommandsProvider'
    //anything you have
]
```
1. *Add a configuration*
Inside `config/acl.js`
```javascript
module.exports = {
    userPath: 'App/Models/User', //Adonis path to user model goes here, this is what you would pass to use() method
    existingActions: [
        'MakeUser', //if you just pass string, it will be considered as object with slug property as provided
        'MakePost',
        'SomeActionSlug',
        { //optionally, you can provide an object with additional properties
            slug: 'CustomizedAction', //slug is MANDATORY
            title: 'Customized Action',
            locale_code: 'customized_action'
        }
    ]
}
```
1. *Add relation to your user model*
Inside UserModel file (probably `app/Models/User.js`)
```javascript
class User {
    //anything you have
    roles() {
         return this.belongsToMany('Adonis/Acl/Role', 'user_id', 'acl_role_id', 'id', 'id').pivotTable('acl_user_roles')
    }
}
```
1. *Register a middleware (if you want to use it)*
Inside `start/kernel.js`
```javascript
const namedMiddleware = {
    //anything you have
    aclValidator: 'Adonis/Acl/AclValidator'
}
```
1. *Setup database*

Add migrations with

>node ace acl:setup

Run migrations with

>node ace migration:run

Inside your code, access AclService by `const AclService = use('Adonis/AclService')`. Everything you need should be possible to access that variable

## Services
Concept of services is really named that way for the lack of the better name. They represent different parts of your application that need to have different access control. For example, your users are allowed to create their own blog, and assign their own roles to users of their choice to their blog.
Every blog, forum, social media page, chat room or anything else is represented by a **service**

Property name | Description
------------- | -----------
id | Number that uniquely identifies service. You should not set it yourself but let database handle it
type | Type of service, such as forum, chat, company etc. **Mandatory**
slug | Unique identifier for service within service type. Represents concrete service. E.g. 2 records with type *forum* have slugs *ThisForum* *ThatForum*. **Mandatory**
relation | Unique identifier within service type by foreign relation. E.g. you probably don't just have forums as services in this ACL, but you have collection forums. This param should match it's id, slug or anything you use to identify it, and should be update accordingly. **Optional**

In using this provider, you will often have to specify the service you are interested in. For that reason, we introduce concept of **service strings** - a string formatted in that way our provider can understand it and identify requested service
It is formatted as `serviceType:service`, where service Type matches above described *type*
*service* can be represented by it's slug, so *forum:ThisForum* will match service with type *forum* and slug *ThisForum*

You can also use three meta characters in describing service

Character | Description | Example
--------- | ----------- | -------
~ | Indicates identification of service by *relation* property | forum:~2 identifies service with *type = forum* and *relation = 2*
% | Indicates identification of service by *id* property | chat:%51 identifies service with *type = chat* and *id = 51*
\* | Indicate all services of given type. **Cannot always be used** | page:\* identifies all services with *type = page*

You should always create *application:application* service in your seeder, which represent you general, application level service

Methods related to services:

Declaration | Inputs | Returns | Description | EagerFriendly
----------- | ------ | ------- | ----------- | -------------
async createService(serviceString) | serviceString - *Mandatory*. Service string as described above. Service indicators can be nested, so you can pass service:slug:~relation, but you should not pass id. Slug must be passed | void | Creates service as specified by service string. If relation is passed, it will be added to the service, so later you can access service by relation | No
async createManyServices(serviceStringArray) | serviceStringArray - *Mandatory* array of serviceStrings, like in the method above | void | Everything like in function above, except it will make multiple services in one database query | No
async getServiceId(serviceString) | serviceString - *Mandatory* Service string as described above | integer - id of service or null if \* meta character was passed | Tries to get id of service locally if it can (from serviceString), if not finds specified service in database | No
async getService(serviceString, relations) | serviceString - *Mandatory*. relations - *Optional*, array<string>, represents addition resources to be eager loaded with service. Only ['possibleActions'] supported as of this version | Serialized service object with loaded relations | Loads service specified by serviceString. It will try to eager load resources specified in *relations* by adding them to knex.js's .with()