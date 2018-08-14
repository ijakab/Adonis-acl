module.exports = {
    getService(str) {
        let split = str.split(':')
        let obj = {type: split[0]}
        if(obj.type === '*') obj.type = null
        for(let i = 1; i < split.length; i++) {
            if(!split[i]) continue
            if(split[i][0] === '~') {
                obj.relation = split[i].substring(1, split[i].length)
            } else if(split[i][0] === '%') {
                obj.id = split[i].substring(1, split[i].length)
            } else if(split[i] === '*') {
                obj.id = null
            } else {
                obj.slug = split[i]
            }
        }
        return obj
    },

    makeServiceStr(aclParams, requestParams) {
        let to_replace = aclParams[2].match(/{.+}/)
        let replaced_full
        if(!to_replace) replaced_full = aclParams[2]
        else {
            replaced_full = aclParams[2]
            for(let replace of to_replace) {
                let param_name = replace.substring(1, replace.length-1)
                replaced_full = replaced_full.replace(replace, requestParams[param_name])
            }
        }
        return `${aclParams[1]}:${replaced_full}`
    },

    operationInfo(middlewareStr) {
        let array = middlewareStr.split(/\(|\)| /)
        let operationName
        switch (array[0]){
            case 'can':
                operationName = 'UserCan'
                break
            case 'is':
                operationName = 'UserIs'
                break
        }
        let requirements = array.slice(1, array.length-1)
        return {operationName, requirements}
    },

    getActionArray(allActions, string) {
        let keywords = string.split(',')
        allActions = allActions.slice() //To make sure we don't override input array
        let actions = []
        for(let keyword of keywords) {
            if(keyword === '*') {
                actions = allActions
            } else if(keywords[0] === '!') {
                keyword = keyword.substring(1, keyword.length)
                let index = actions.indexOf(keyword)
                if(index === -1) continue
                allActions.splice(index, 1)
            } else {
                actions.push(keyword)
            }
        }
    }
}