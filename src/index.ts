// import {ActionFunction , MutationFunction} from "./moduletypes";

// function Action() {
//     return function (target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<ActionFunction>) {
        
//     }
// }
// function Mutation() {
//     return function (target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<MutationFunction>) {
        
//     }
// }
// function Module<T extends new (...args:any[])=>any>(name : string) {
//     return function(constructor : T) {
        
//         Object.seal(constructor);
//         Object.seal(constructor.prototype);
//         return constructor;
//     }
// }


// @Module("TestModule")
// class TestModule {

//     hallo = true;

//     private async test2() {
        
//     }

//     @Action()
//     async test() {

//     }

//     @Mutation()
//     setTest() {

//     }
//     getTest() {
//         return "";
//     }

// }
import { ModuleData, ModuleOf } from "./moduletypes";
type PlaylistState = {
    test: boolean,
    soo: string
}
type PlaylistActions = {
    load(payload : {}):Promise<void>,
    save(payload : { t: boolean }):Promise<void>,
}
type PlaylistMutations = {
    add(payload : {}):void
}
type PlaylistGetters = {
    test: string;
    count(n : number):string
}

let y : ModuleData<PlaylistState,PlaylistActions,PlaylistMutations,PlaylistGetters,{}> = {
    namespaced: false,
    state: {
        test: false,
        soo: ""
    },
    actions: {
        async load(context, payload) {
            
        },
        async save(context, payload) {
            
        }
    },
    mutations: {
        add(state, payload) {
            
        }
    },
    getters: {
        test(state, getters) {
            return "";
        },
        count(state, getters) {
            return ()=>{
                return "";
            }
        }
    },
    modules: {
    }
}
let x : ModuleData<PlaylistState,PlaylistActions,PlaylistMutations,PlaylistGetters,{ test: typeof y }> = {
    namespaced: false,
    state: {
        test: false,
        soo: ""
    },
    actions: {
        async load(context, payload) {
            
        },
        async save(context, payload) {
            
        }
    },
    mutations: {
        add(state, payload) {
            
        }
    },
    getters: {
        test(state, getters) {
            return "";
        },
        count(state, getters) {
            return ()=>{
                return "";
            }
        }
    },
    modules: {
        test: y
    }
}
type t = typeof x;
let z = {} as ModuleOf<t>;
