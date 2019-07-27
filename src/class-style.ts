import { IntersectionOf, BasicMap } from "./types";
import * as Vuex from "vuex";
import { ModuleData, ModuleDataTree, ModuleOf, BasicModuleData } from "./module";
import { MutationTree, BasicMutation, Mutation, CommitOf } from "./mutation";
import { ActionTree, BasicAction, Action, DispatchOf, ModuleAction } from "./action";


type IfEquals<X, Y, A=X, B=never> =
  (<T>() => T extends X ? 1 : 2) extends
  (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

type ReadonlyKeys<T> = {
  [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
}[keyof T];

type FunctionKeys<T> = {
    [P in keyof T]: T[P] extends Function ? P : never
}[keyof T];
type NonFunctionKeys<T> = {
    [P in keyof T]: T[P] extends Function ? never : P
}[keyof T];

type AsyncFunctionKeys<T> = {
    [P in keyof T]: T[P] extends (...args: any[])=>Promise<any> ? P : never
}[keyof T];
type NonAsyncFunctionKeys<T> = {
    [P in keyof T]: T[P] extends (...args: any[])=>Promise<any> ? never : P
}[keyof T];

type GettersOf<T extends BasicModule> = Pick<T, ReadonlyKeys<T> >;
type StateOf<T extends BasicModule> = Pick<T, NonFunctionKeys<T> & WritableKeys<T> >;
type ActionKeys<T extends BasicModule> = WritableKeys<T> & AsyncFunctionKeys<T> & (string | number | symbol);
type ActionsOf<T extends BasicModule> = {
    [key in ActionKeys<T>]: T[key] extends Action<infer P, infer R> 
        ? ModuleAction<P, R>
        : never;
};
type MutationKeys<T extends BasicModule> = WritableKeys<T> & FunctionKeys<T> & NonAsyncFunctionKeys<T> & (string | number | symbol);
type MutationsOf<T extends BasicModule> = {
    [key in MutationKeys<T>]: T[key] extends Mutation<infer P> ? Mutation<P> : never;
};
type ModuleDataTreeOf<M extends BasicModule> = (M extends TModule<any, any, infer Ms> 
    ? IntersectionOf<{
        [key in keyof Ms]: key extends number 
            ? { [name in NameOf<Ms[key]>]: ModuleDataOf<Ms[key]> }
            : never;
    }>
    : never ) & ModuleDataTree;
type ModuleDataOf<T extends BasicModule> = ModuleData<
    StateOf<T>, 
    MutationsOf<T>, 
    GettersOf<T>, 
    ActionsOf<T>, 
    {}, 
    NamespacedOf<T>
>;

class TModule<Name extends string, Namespaced=false, Modules extends TModule<any, any, any>[]=[]> {
    
}
type BasicModule = TModule<any, any, any>;

type NameOf<M extends BasicModule> = M extends TModule<infer Name, any, any> ? Name & (string | number | symbol) : never;
type ModuleArrayOf<M extends BasicModule> = M extends TModule<any, any, infer MS> ? MS : never;
type NamespacedOf<M extends BasicModule> = M extends TModule<any, infer NS, any> ? NS & boolean : never;



class ModuleConverter {

    private readonly module : any;
    private readonly actionKeys : string[];
    private readonly mutationKeys : string[];
    private readonly getterKeys : string[];
    private readonly stateKeys : string[];

    constructor(module : any) {
        
        this.module = module;
        let keys = Object.keys(module);
        this.actionKeys = keys
            .filter(key => typeof module[key] === "function" && module[key].isAction);
        this.mutationKeys = keys
            .filter(key => typeof module[key] === "function" && module[key].isMutation);
        this.getterKeys = keys.filter((key)=>{
            let desc = Object.getOwnPropertyDescriptor(module, key);
            return desc && !!desc.get;
        });
        this.stateKeys = keys.filter((key)=>{
            let desc = Object.getOwnPropertyDescriptor(module, key);
            return typeof module[key] !== "function" && desc && !desc.get;
        });
    }

    private createThis(commit ?: Vuex.Commit, getters ?: BasicMap, state ?: BasicMap, dispatch ?: Vuex.Dispatch) {
        let actions = this.actionKeys.reduce((acc, key)=>{
            acc[key] = (payload : any) => {
                if(!dispatch) {
                    throw new Error("You can't call an action here!");
                }
                return dispatch(key, payload);
            }
            return acc;
        }, {} as BasicMap);
        let mutations = this.mutationKeys.reduce((acc, key)=>{
            acc[key] = (payload : any) => {
                if(!commit) {
                    throw new Error("You can't call a mutation here!");
                }
                commit(key, payload);
            }
            return acc;
        }, {} as BasicMap)
        let _getters = this.getterKeys.reduce((acc, key)=>{
            Object.defineProperty(acc, key, {
                get() {
                    if(!getters) {
                        throw new Error("You can't access getters here!");
                    }
                    return getters[key];
                }
            }) 
            return acc;
        }, {} as BasicMap);
        let _state = this.stateKeys.reduce((acc, key)=>{
            Object.defineProperty(acc, key, {
                get() {
                    if(!state) {
                        throw new Error("You can't access the state here!");
                    }
                    return state[key];
                },
                set(value) {
                    if(!state) {
                        throw new Error("You can't access the state here!");
                    }
                    state[key] = value;
                }
            }) 
            return acc;
        }, {} as BasicMap);
        return { ...actions, ...mutations, ..._getters, ..._state };
    }
    createVuexModule() : Vuex.Module<any, any> {
        let actionHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key] = (context, payload)=>{
                let newThis = this.createThis(context.commit, context.getters, context.state, context.dispatch);
                return this.module[key].call(newThis, payload);
            };
            return acc;
        }, {} as Vuex.ActionTree<any, any>);
        let mutationHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key] = (state, payload)=>{
                let newThis = this.createThis(undefined, undefined, state);
                this.module[key].call(newThis, payload);
            };
            return acc;
        }, {} as Vuex.MutationTree<any>);
        let getterHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key] = (state, getters)=>{
                let newThis = this.createThis(undefined, getters, state);
                return Object.getOwnPropertyDescriptor(this.module, key)!.get!.call(newThis);
            };
            return acc;
        }, {} as Vuex.GetterTree<any, any>);
        let state = this.stateKeys.reduce((acc, key)=>{
            acc[key] = JSON.parse(JSON.stringify(this.module[key]));
            return acc;
        }, {} as any)
        return {
            state,
            actions: actionHandlers,
            mutations: mutationHandlers,
            getters: getterHandlers,
        };
    }
}

function Action(target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<BasicAction>) {
    target[propertyKey].isAction = true;
}
function Mutation(target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<BasicMutation>) {
    target[propertyKey].isMutation = true;
}
type ModuleCtor<M extends BasicModule> = new ()=>M;
function Module<M extends BasicModule>(p : { name: NameOf<M>, modules: ModuleArrayOf<M>, namespaced: NamespacedOf<M> }) {
    return (constr: ModuleCtor<M>) => {
        return class extends (constr as any) {
            static moduleName = p.name;
            static modules = p.modules;
            static namespaced = p.namespaced;

            getVuexModule() {
                let module = (new ModuleConverter(this)).createVuexModule();
                module.namespaced = p.namespaced;
                module.modules = {};
                for(let smctor of p.modules as any) {
                    let submodule = new smctor();
                    module.modules[(smctor as any).moduleName] = submodule.getVuexModule();
                }
            }
        } as unknown as ModuleCtor<M>;
    }
}
@Module<MyModule>({
    name: "Hallo",
    namespaced: false,
    modules: []
})
class MyModule extends TModule<"Hallo">{
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
let actions : ActionsOf<MyModule>;
let dispatch : DispatchOf<ActionsOf<MyModule>>;
let commit : CommitOf<MutationsOf<MyModule>>;
let module: ModuleOf< ModuleDataOf<MyModule>>;

let moduled : ModuleDataOf<MyModule>;



