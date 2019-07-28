import { BasicModuleData, StoreOf, DefaultModuleData, DefaultStore, DefaultModule } from "./module";
import * as Vuex from "vuex";
import { BasicMap } from "./types";

function mapObject<V, N>(obj : { [key:string]: V }, map : (v : V, k : string) => N) {
    return Object.keys(obj).reduce((acc, el) => {
        acc[el] = map(obj[el], el);
        return acc;
    }, {} as { [key:string]: N });
};

function toVuexModuleData(data : DefaultModuleData, root: DefaultStore) : Vuex.Module<any, any> {
    let modules : Vuex.ModuleTree<unknown> = mapObject(data.modules, (el)=>{
        return toVuexModuleData(el, root);
    });
    let actions : Vuex.ActionTree<BasicMap, unknown> = mapObject(data.actions, (el) => {
        if("root" in el) {
            return { 
                root: el.root,
                handler: (context, payload) => {
                    return el.handler({
                        state: context.state,
                        commit: context.commit,
                        dispatch: context.dispatch,
                        getters: context.getters,
                        root
                    }, payload);
                }
            }
        }
        else {
            return (context, payload) => {
                return el({
                    state: context.state,
                    commit: context.commit,
                    dispatch: context.dispatch,
                    getters: context.getters,
                    root
                }, payload);
            }
        }
    });
    let getters : Vuex.GetterTree<BasicMap, unknown> = mapObject(data.getters, (el)=>{
        return (state, getters) => {
            return el(state, getters, root);
        };
    });
    let mutations : Vuex.MutationTree<BasicMap> = data.mutations;
    return {
        namespaced: data.namespaced,
        state: data.state,
        mutations,
        actions,
        getters,
        modules
    }
}
function toVuexStoreData(data : DefaultModuleData, root: DefaultStore) : Vuex.StoreOptions<unknown> {
    let md = toVuexModuleData(data, root);
    return { ...md, strict: true };
}

function toTypesafeModule(store : Vuex.Store<unknown>, data : DefaultModuleData, path : string) : DefaultModule {
    let modules = mapObject(data.modules, (el, key)=>{
        return toTypesafeModule(store, el, path+key+"/");
    });
    let commit : Vuex.Commit = (nameOrPayload : any, payloadOrOptions : any, options ?: any) => {
        if("type" in nameOrPayload) {
            store.commit({
                ...nameOrPayload,
                type: path+nameOrPayload.type,
            }, payloadOrOptions);
        }
        else {
            store.commit(path+nameOrPayload, payloadOrOptions, options)
        }
    }
    let dispatch : Vuex.Dispatch = (nameOrPayload : any, payloadOrOptions : any, options ?: any) => {
        if("type" in nameOrPayload) {
            return store.dispatch({
                ...nameOrPayload,
                type: path+nameOrPayload.type,
            }, payloadOrOptions);
        }
        else {
            return store.dispatch(path+nameOrPayload, payloadOrOptions, options)
        }
    }
    let getters = {};
    for(let key in data.getters) {
        getters = {
            ...getters,
            get [key]() {
                return store.getters[path+key];
            }
        }
    }
    return {
        commit,
        dispatch,
        getters,
        ...modules
    }
}
export function toTypesafeStore<T extends BasicModuleData> (storeData : T) {
    let store = {} as DefaultStore;
    let vuexData = toVuexStoreData(storeData as unknown as DefaultModuleData, store);
    let vuexStore = new Vuex.Store(vuexData);
    Object.assign(store, toTypesafeModule(vuexStore, storeData as unknown as DefaultModuleData, ""));
    return store as StoreOf<T>;
}