# vuex-typesafe

This is a simple way to make Vuex typescript-ready. To type your store/module, you have to declare actions, mutations and getters like this:

## Actions

```typescript
type MyActions = {
    myAction1(): Promise<string>,
    myAction2(payload : MyPayloadObject): Promise<void>,
    myAction3: {
        root: true,
        handler(): Promise<number>
    }
}
```

## Mutations

```typescript
type MyMutations = {
    myMutation1(): void,
    myMutation2(payload : MyOtherPayloadObject): void
}
```

## Getters

```typescript
type MyGetters = {
    myGetter1: number,
    myGetter2: (myarg: string) => string
}
```

## SubModules

If your store / module has submodules you can type it this way:
```typescript
type MySubModules = {
    mySubModule1: MySubModuleData1,
    mySubModule2: MySubModuleData2,
}
```
Notice: `MySubModuleData1` and `MySubModuleData2` are example module data types created with the following method.

## ModuleData

To create the module data type do this:
```typescript
type MyModuleData = ModuleData<MyState, MyMutations, MyGetters, MyActions, MySubModules>;
```
By default, all modules are namespaced. You have to explicitly declare your module non namespaced like this
```typescript
type MyModuleData = ModuleData<MyState, MyMutations, MyGetters, MyActions, MySubModules, false>;
```
If your getter handlers or action handlers depend on the store's root, you can do it typeesafe:
```typescript
type MyModuleData = ModuleData<MyState, MyMutations, MyGetters, MyActions, MySubModules, false /*or true*/, MyStoreData>;
```
Notice: `MyStoreData` is the store data type which is created exactly like a module data type.

Now that you have created the module data type, you can program the module.
```typescript
const myModuleData : MyModuleData = {
    namespaced: true, //has to match with namespace in type definition
    state: { /*...*/ },
    getters: {
        myGetter1(state, getters, root) : number {
            //...
        },
        myGetter2(state, getters, root) {
            return (myarg : string) => {
                //...
            }
        }
    },
    actions: {
        async myAction1(context) {

        },
        async myAction2(context, payload) {

        },
        myAction3: {
            root: true,
            handler(context) {

            }
        }
    },
    mutations: {
        mutation1(state) {

        },
        mutation2(state, payload) {

        }
    },
    modules: {
        mySubModule1, //imported
        mySubModule2  //imported
    }
}
```

## Class-Based Modules

You can write class-based modules like this
```typescript
import { ClassModule, Module, Action, Mutation } from 'vuex-typesafe';
@Module<MyModule>({
    name: "myModule",
    namespaced: true,
    modules: [MySubModule, MySubModule2]
})
class MyModule extends ClassModule<"myModule", true, [MySubModule, MySubModule2], MyRootModule> {

    //State
    myField = 0
    myOtherField = "hello"

    //Actions
    @Action
    async myAction() {
        return this.myField;
    }

    @Action
    async myAction2(payload : number) {
        this.root.commit("myRootMutation", payload);
        this.myMutation(payload);
    }

    //Mutations
    @Mutation
    myMutation(payload : number) {
        this.myField += number;
    }

    //Getters

    get myGetter() {
        return this.myOtherField
    }

    private myHelperMethod() {
        //Do something
    }

}
```
Notice: Your helper methods must be declared private, everything else must be public and actions and mutations must have their respective decorators.

Also keep in mind, that there are access restrictions for your methods
* Getter Methods can only access other getters, fields, the root object and those private methods accessing only these
* Mutation methods can only access fields and those private methods accessing only these
* Action methods can access all methods, fields, the root object and private methods
* Private methods can access all methods, fields and the root object

Violating these access restrictions will result in an Exception at runtime!

## Store

To create and use the store with typesafety you have to do the following:
```typescript
import { toTypesafeStore } from 'vuex-typesafe';
const store = toTypesafeStore(myModuleData);
type MyStore = typeof store;
new Vue({
    store
})
```
To use it in your components you have to declare the store type like this
```typescript
import MyStore from '../types/store':
export default class MyComponent extends Vue {
    
    $store !: MyStore;
    
    //...
}
```
The typesafe store works exactly like the vuex store with one exception.
To access operations of namespaced modules you have to do this
```typescript
this.$store.myNamespacedModule.commit('myOperation', myPayload); //typesafe (won't compile with wrong string or payload)
```
instead of this
```javascript
this.$store.commit('myNamespacedModule/myOperation', myPayload);
```
The same holds for accessing getters and actions of namespaced modules.
