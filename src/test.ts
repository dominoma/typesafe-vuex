import { ModuleData, StoreOf } from "./module";
import { Module, ClassModule, Mutation, Action, toTypesafeStore } from "./class-style";
import { BasicMap } from "./types";

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
    add(payload : {}):void,
    
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
            
        },
        
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
@Module<MyModule2>({
    name: "Hallo2",
    namespaced: true,
    modules: []
})
class MyModule2 extends ClassModule<"Hallo2", true>{
    name = ""
    count = 0   

    get strnbr() {
        return this.count + this.name;
    }

    @Mutation
    inc() {
        this.count++;
    }
    @Mutation
    dec(n : { t: number }) {
        this.count-=n.t;
    }
    @Action
    async wg(t:string) {
        return this.count;
    }

}
@Module<MyModule>({
    name: "Hallo",
    namespaced: true,
    modules: [MyModule2]
})
class MyModule extends ClassModule<"Hallo", true, [MyModule2]>{
    name = ""
    count = 0   

    get strnbr() {
        return this.count + this.name;
    }

    @Mutation
    increment() {
        this.count++;
    }
    @Mutation
    decrement(n : number) {
        this.count-=n;
    }
    @Action
    async waitget(t:string) {
        return this.count;
    }

}

let z = toTypesafeStore(MyModule);
z.Hallo2.commit({ type: "dec", t: 1 })