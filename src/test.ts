import { ModuleData, StoreOf } from "./module";
import { DeepReadonly } from "./types"
type PlaylistState = {
    test: boolean,
    soo: string
}
type PlaylistActions = {
    load():Promise<void>,
    save(payload : { t: boolean }):Promise<void>,
}
type SubPlaylistActions = {
    loaddd: {
        root: true,
        handler():Promise<void>
    }
    savedd(payload : { t: boolean }):Promise<void>,
}
type PlaylistMutations = {
    add(payload : {}):void
}
type PlaylistGetters = {
    test: string;
    count(n : number):string
}
type SubPlaylistGetters = {
    testt: string;
    countt(n : number):string
}
type SubSubPlaylistModule = ModuleData<{},PlaylistMutations, {viel:string}>;
type SubPlaylistModule = ModuleData<PlaylistState,PlaylistMutations,SubPlaylistGetters,SubPlaylistActions,{ go: SubSubPlaylistModule }, true, PlaylistModule>;
let y : SubPlaylistModule = {
    namespaced: true,
    state: {
        test: false,
        soo: ""
    },
    actions: {
        loaddd: {
            root: true,
            async handler(context) {
                
            }
        },
        async savedd(context, payload) {
            
        }
    },
    mutations: {
        add(state, payload) {
            
        }
    },
    getters: {
        testt(state, getters, root) {
            return "";
        },
        countt(state, getters) {
            return ()=>{
                return "";
            }
        }
    },
    modules: {
        go: {
            namespaced: true,
            state: {},
            actions: {},
            mutations: {
                add(state, payload) {
            
                }
            },
            getters: {
                viel() {
                    return "";
                }
            },
            modules: {}
        }
    }
}
type PlaylistModule = ModuleData<PlaylistState,PlaylistMutations,PlaylistGetters,PlaylistActions, { comit: SubPlaylistModule }>;
let x : PlaylistModule = {
    namespaced: true,
    state: {
        test: false,
        soo: ""
    },
    actions: {
        async load(context) {
            
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
        comit: y
    }
}

let z = {} as StoreOf<typeof x>;
let t = {} as DeepReadonly<{ x: number, t: boolean, z: string, v: { g: string }, b: Error }>;
type ttt = (test: any, x: any)=>void;
type bbb = ((test: "ww", x: number)=>void) & ((test: "ss", x: string)=>void);
let r : bbb;
type rrr = bbb extends ttt ? true : false;