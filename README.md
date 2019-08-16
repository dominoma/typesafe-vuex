# vuex-typesafe

This is a simple way to make Vuex typescript-ready with decorators.
It uses the decorators from `vuex-class` and makes them typesafe.

To retrieve those decorators you have to pass the type information of the store
and the modules to the `getTypesafeDecorators` function.

```typescript
import getTypesafeDecorators from 'vuex-typesafe'

import * as MyModule1 from './path/to/mymodule'
import * as MyModule2 from './path/to/mymodule2'

const state = () => ({
    field: true,
    //...
})

const actions = {
    async fetchData(context, payload : string) {
        //do something
        return true // return something
    },
    //...
}
const mutations = {
    //...
}
const getters = {
    //...
}

type Modules = {
    'myModule1': typeof MyModule1
    'myModule1/myModule2': typeof MyModule2
    // register all your modules with respective path here
}
type Store = {
    actions: typeof actions
    mutations: typeof mutations
    getters: typeof getters
    state: typeof state
}

export const { State, Getter, Action, Mutation, namespace } = getTypesafeDecorators<Store, Modules>()

```
You can use these decorators like in `vuex-class`, but they are completely typesafe

```typescript
import { State, Action, namespace } from '/path/to/store'

@Component
class MyComponent extends Vue {

    @State('field')     // using a string not describing a state field name will result in a compile-time error
    myField!: boolean    // using the wrong type will result in a compile-time error

    @State
    field!: boolean // using a property name not describing a state field name or the wrong type will result in a compile-time error

    @Action('fetchData')
    myFetchData!: (payload: string)=>Promise<boolean> // same here
}

```

Using namespaced modules also works just like in `vuex-class`

```typescript
import { State, Action, namespace } from '/path/to/store'

const myModule2 = namespace('myModule/myModule2') // invalid module strings result in a compile-time error

@Component
class MyComponent extends Vue {

    @myModule2.State('field')     // using a string not describing a state field name of myModule2 will result in a compile-time error
    myField!: boolean    // using the wrong type will result in a compile-time error

    @myModule2.State
    field!: boolean // using a property name not describing a state field name of myModule2 or the wrong type will result in a compile-time error

    @myModule2.Action('fetchData')
    myFetchData!: (payload: string)=>Promise<boolean> // same here
}

```
