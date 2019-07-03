import { BasicModuleData } from "./module";
import { BasicMap } from "./types";
import { Store, Commit, Dispatch, Module, ActionTree, GetterTree, ModuleTree } from "vuex";

function convertToVuexData(data : BasicModuleData, root: any) : Module<any, any> {
    let modules : ModuleTree<any> = {};
    for(let key in data.modules) {
        modules[key] = convertToVuexData(data.modules[key], root);
    }
    let actions : ActionTree<any, any> = {};
    for(let key in data.actions) {
        actions[key] = (context, payload)=>{
            (data.actions[key] as any)({
                commit: context.commit,
                dispatch: context.dispatch,
                getters: context.getters,
                state: context.state,
                root: root
            }, payload);
        };
    }
    let getters : GetterTree<any, any> = {};
    for(let key in data.getters) {
        getters[key] = (state, getters) => {
            (data.getters[key] as any)(state, getters, root);
        }
    }
    return {
        state: data.state,
        namespaced: data.namespaced,
        mutations: data.mutations,
        actions,
        getters,
        modules
    }
}

function createWrappedModuleTree(commit_ : Commit, dispatch_ : Dispatch, getters_ : any, data : BasicModuleData, path : string) {
    let wrappedGetters = {};
    for(let key in data.getters) {
        wrappedGetters = { 
            ...wrappedGetters,
            get [key]() {
                return getters_[path+key];
            }
        }
    }
    let wrappedModules : BasicMap = {};
    for(let key in data.modules) {
        wrappedModules[key] = createWrappedModuleTree(commit_, dispatch_, getters_, data.modules[key], path+key+"/");
    }
    return {
        commit(name : string, payload : any) {
            commit_(path+name, payload);
        },
        dispatch(name : string, payload : any) {
            return dispatch_(path+name, payload);
        },
        getters: wrappedGetters,
        ...wrappedModules
    }
}

export function wrapStore(data : BasicModuleData) {
    let root = {};
    let store = new Store(convertToVuexData(data, root));
    Object.assign(root,
        createWrappedModuleTree(store.commit, store.dispatch, store.getters, data, ""),
        { state: store.state });
    return root;
}