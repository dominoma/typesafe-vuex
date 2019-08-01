import { IntersectionOf, BasicMap } from "./types";
import * as Vuex from "vuex";
import { ModuleData, BasicModuleData, DefaultStore, DefaultModule, DefaultModuleData, StoreOf } from "./module";
import { Mutation, DefaultMutationHandlerTree } from "./mutation";
import { ModuleAction, DefaultActionHandlerTree } from "./action";
import * as Wrapper from"./wrapper";
import { DefaultGetterHandlerTree } from "./getter";


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
type ExcludeRoot<keys extends string | number | symbol> = Exclude<keys, "root">;
type GetterKeys<T extends BasicClassModule> = ExcludeRoot<ReadonlyKeys<T>>;
type GettersOf<T extends BasicClassModule> = Pick<T, GetterKeys<T> >;
type StateKeys<T extends BasicClassModule> = ExcludeRoot<NonFunctionKeys<T> & WritableKeys<T> & (string | number | symbol)>;
type StateOf<T extends BasicClassModule> = Pick<T, StateKeys<T> >;
type ActionKeys<T extends BasicClassModule> = ExcludeRoot<WritableKeys<T> & AsyncFunctionKeys<T> & (string | number | symbol)>;
type ActionsOf<T extends BasicClassModule> = {
    [key in ActionKeys<T>]: T[key] extends (payload : infer P)=>Promise<infer R>
        ? ModuleAction<P, R>
        : never;
};
type MutationKeys<T extends BasicClassModule> = ExcludeRoot<WritableKeys<T> & FunctionKeys<T> & NonAsyncFunctionKeys<T> & (string | number | symbol)>;
type MutationsOf<T extends BasicClassModule> = {
    [key in MutationKeys<T>]: T[key] extends (payload : infer P)=>void 
        ? unknown extends P
            ? ()=>void
            : (payload : P)=>void
        : never;
};

export type ModuleDataOf<T extends BasicClassModule> = ModuleData<
    StateOf<T>, 
    MutationsOf<T>, 
    GettersOf<T>, 
    ActionsOf<T>, 
    ModuleDataTreeOf<T>, 
    NamespacedOf<T>,
    RootModuleDataOf<T>
>;

export class ClassModule<
    Name extends string, 
    Namespaced=false, 
    Modules extends BasicClassModule[]=[], 
    RootModule extends BasicClassModule=never
> {
    private __name__ !: Name;
    private __namespaced__ !: Namespaced;
    private __modules__ !: Modules;
    root !: StoreOf<ModuleDataOf<RootModule>>;
}
export type BasicClassModule = ClassModule<any, any, any, any>;

export class ClassStore<Modules extends BasicClassModule[]=[]> extends ClassModule<"", false, Modules> {};
export type BasicClassStore = ClassStore<any>;

type NameOf<M extends BasicClassModule> = M extends ClassModule<infer Name, any, any, any> ? Name & (string | number | symbol) : never;
type ModuleArrayOf<M extends BasicClassModule> = M extends ClassModule<any, any, infer MS, any> ? MS : never;
type NamespacedOf<M extends BasicClassModule> = M extends ClassModule<any, infer NS, any, any> ? NS & boolean : never;
type RootModuleDataOf<M extends BasicClassModule> = M extends ClassModule<any, any, any, infer RMD> ? RMD : never;

type ClassModuleTreeOf<M extends BasicClassModule> = Extract<
    IntersectionOf<{
        [K in keyof ModuleArrayOf<M>]: ModuleArrayOf<M>[K] extends BasicClassModule ? { [name in NameOf<ModuleArrayOf<M>[K]>]: ModuleArrayOf<M>[K] } : unknown
    }, {}>,
    BasicMap<BasicClassModule>>;
type ModuleDataTreeOfTree<MT extends BasicMap<BasicClassModule>> = {
    [K in keyof MT]: ModuleDataOf<MT[K]>
}
type ModuleDataTreeOf<M extends BasicClassModule> = ModuleDataTreeOfTree<ClassModuleTreeOf<M>>;

enum ModuleScopes {
    Action="Action",
    Mutation="Mutation",
    Getter="Getter"
}
type ModuleOperations = {
    commit ?: Vuex.Commit, 
    getters ?: BasicMap, 
    state ?: BasicMap, 
    dispatch ?: Vuex.Dispatch, 
    root ?: DefaultModule
}

class ModuleConverter {

    private readonly module : any;
    private readonly actionKeys : PropertyKey[];
    private readonly mutationKeys : PropertyKey[];
    private readonly getterKeys : PropertyKey[];
    private readonly stateKeys : PropertyKey[];

    static getModuleData(module : any) {
        return (new ModuleConverter(module)).createModuleData();
    }

    private constructor(module : any) {
        
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
            return !(module[key] instanceof Function) && desc && !desc.get;
        });
    }

    private createThis(scope : ModuleScopes, ops : ModuleOperations) {
        return new Proxy({}, {
            get: (_target, key) => {
                if(key === "root") {
                    if(!ops.root) {
                        throw new Error(`You can't access the root module in ${scope}s!`);
                    }
                    return ops.root;
                }
                else if(this.actionKeys.indexOf(key) != -1) {
                    if(!ops.dispatch) {
                        throw new Error(`You can't call an action in ${scope}s!`);
                    }
                    return (payload : unknown) => ops.dispatch!(key as string, payload);
                }
                else if(this.mutationKeys.indexOf(key) != -1) {
                    if(!ops.commit) {
                        throw new Error(`You can't call a mutation in ${scope}s!`);
                    }
                    return (payload : unknown) => ops.commit!(key as string, payload);
                }
                else if(this.getterKeys.indexOf(key) != -1) {
                    if(!ops.getters) {
                        throw new Error(`You can't access getters in ${scope}s!`);
                    }
                    return ops.getters[key as string];
                }
                else if(this.stateKeys.indexOf(key) != -1) {
                    if(!ops.state) {
                        throw new Error(`You can't access the state in ${scope}s!`);
                    }
                    return ops.state[key as string];
                }
                else if(this.module[key] instanceof Function) {
                    return ()=>{
                        let newThis = this.createThis(scope, ops);
                        return this.module[key].apply(newThis, arguments);
                    }
                }
                throw new Error(`Property '${key as string}' doesn't exist!`);
            },
            set: (_target, key, value) => {
                if(this.stateKeys.indexOf(key) != -1) {
                    if(!ops.state || scope === ModuleScopes.Action) {
                        throw new Error(`You can't set the state in ${scope}s!`);
                    }
                    ops.state[key as string] = value;
                    return true;
                }
                return false;
            }
        });
    }
    private createModuleData() : DefaultModuleData {
        let actionHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key as string] = (context, payload)=>{
                let newThis = this.createThis(ModuleScopes.Action, context);
                return this.module[key].call(newThis, payload);
            };
            return acc;
        }, {} as DefaultActionHandlerTree);
        let mutationHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key as string] = (state, payload)=>{
                let newThis = this.createThis(ModuleScopes.Mutation, { state });
                this.module[key].call(newThis, payload);
            };
            return acc;
        }, {} as DefaultMutationHandlerTree);
        let getterHandlers = this.actionKeys.reduce((acc, key)=>{
            acc[key as string] = (state, getters, root)=>{
                let newThis = this.createThis(ModuleScopes.Getter, { state, getters, root });
                return Object.getOwnPropertyDescriptor(this.module, key)!.get!.call(newThis);
            };
            return acc;
        }, {} as DefaultGetterHandlerTree);
        let state = this.stateKeys.reduce((acc, key)=>{
            acc[key as string] = JSON.parse(JSON.stringify(this.module[key]));
            return acc;
        }, {} as BasicMap)
        return {
            state,
            actions: actionHandlers,
            mutations: mutationHandlers,
            getters: getterHandlers,
            namespaced: false,
            modules: {}
        };
    }
}

export function Action(target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<(payload ?: any)=>Promise<any>>) {
    target[propertyKey].isAction = true;
}
export function Mutation(target : any, propertyKey: string, descriptor: TypedPropertyDescriptor<(payload ?: any)=>void>) {
    target[propertyKey].isMutation = true;
}
export type ModuleCtor<M extends BasicClassModule> = new ()=>M;
type ModuleCtorsOf<A extends BasicClassModule[]> = {
    [K in keyof A]: A[K] extends BasicClassModule ? ModuleCtor<A[K]> : A[K]
}
type ModuleDecoratorArgs<M extends BasicClassModule> = {
    name: NameOf<M>, 
    modules: ModuleCtorsOf<ModuleArrayOf<M>>, 
    namespaced: NamespacedOf<M>
}
export function Module<M extends BasicClassModule>(p : ModuleDecoratorArgs<M>) {
    return (constr: ModuleCtor<M>) => {
        return class extends (constr as any) {
            static moduleName = p.name;
            static modules = p.modules;
            static namespaced = p.namespaced;

            getModuleData() {
                let module = ModuleConverter.getModuleData(this);
                module.namespaced = p.namespaced;
                module.modules = {};
                for(let smctor of p.modules as any) {
                    let submodule = new smctor();
                    module.modules[(smctor as any).moduleName] = submodule.getModuleData();
                }
            }
        } as unknown as ModuleCtor<M>;
    }
}
export function Store<S extends BasicClassStore>(p : { modules: ModuleCtorsOf<ModuleArrayOf<S>>}) {
    return Module<S>({
        name: "" as any,
        namespaced: false as any,
        modules: p.modules
    });
}

export function toTypesafeStore<M extends BasicClassModule>(moduleCtor : ModuleCtor<M>) {
    let module = new moduleCtor() as any;
    let moduleData = module.getModuleData() as ModuleDataOf<M>;
    return Wrapper.toTypesafeStore(moduleData);
}


