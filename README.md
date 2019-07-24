# typesafe-vuex
This is a simple way to make Vuex typescript-ready. To type your store/module, you have to declare actions, mutations and getters like this:
##Actions
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
##Mutations
```typescript
type MyMutations = {
    myMutation1(): void,
    myMutation2(payload : MyOtherPayloadObject): void
}
```
##Getters
```typescript
type MyGetters = {
    myGetter1: number,
    myGetter2: (myarg: string) => string
}
```
##SubModules
If your store / module has submodules you can type it this way:
```typescript
type MySubModules = {
    mySubModule1: MySubModuleData1,
    mySubModule2: MySubModuleData2,
}
```
Notice: `MySubModuleData1` and `MySubModuleData2` are example module data types created with the following method.
##ModuleData
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
##Store
To create and use the store with typesafety you have to do the following:
```typescript
import toTypesafeStore from 'typesafe-vuex';
const store = toTypesafeStore(myModuleData);
new Vue({
    store
})
```