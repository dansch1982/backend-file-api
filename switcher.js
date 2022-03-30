
class Switcher {
    objectives = []
    addObjective(name, func) {
        this.objectives[name] = func
    }
    switch(name, ...args) {
            try {
                this.objectives[name](...args)
                return true
            } catch (error) {
                console.log(error)
                return false
            }
    }
}
module.exports = Switcher;