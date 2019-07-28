import { MutationTree, MutationHandlerTreeOf, CommitOf, DefaultMutationHandlerTree } from "./mutation";
import { ActionTree, ActionHandlerTreeOf, ActionContext, RootDispatchOf, DispatchOf, DefaultActionHandlerTree } from "./action";
import { GetterTree, GetterHandlerTreeOf, DefaultGetterHandlerTree } from "./getter";
import { IntersectionOf, BasicMap } from "./types";

export type ModuleData<
    State, 
    MTree extends MutationTree,
    GTree extends GetterTree = {}, 
    ATree extends ActionTree = {},
    SubModuleTree extends ModuleDataTree = {},
    Namespaced extends boolean = true,
    RootModuleData extends BasicModuleData = never
> = {
    namespaced: Namespaced;
    state: State | (()=>State);
    actions: ActionHandlerTreeOf<
        ATree, 
        ActionContext<
            State,
            CommitOf<MTree>,
            DispatchOf<ATree> & RootDispatchOf<ATree>,
            GTree,
            RootModuleData
        >
    >;
    mutations: MutationHandlerTreeOf<MTree, State>;
    getters: GetterHandlerTreeOf<GTree, State, RootModuleData>;
    modules: SubModuleTree;
}
export type BasicModuleData = ModuleData<any, any, any, any, any, any, any>;
export type DefaultModuleData = {
    namespaced: boolean;
    state: unknown;
    actions: DefaultActionHandlerTree;
    mutations: DefaultMutationHandlerTree;
    getters: DefaultGetterHandlerTree;
    modules: DefaultModuleDataTree;
}
export type ModuleDataTree = {
    [key:string]: BasicModuleData;
};
type DefaultModuleDataTree = BasicMap<DefaultModuleData>;

type Module<Getters extends GetterTree, C, D, Modules extends ModuleTree> = {
    readonly getters: Readonly<Getters>;
    readonly commit: C;
    readonly dispatch: D;
} & Readonly<Modules>;
type BasicModule = Module<any,any,any,any> | ModuleTree;
export type DefaultModule = {
    getters: unknown;
    commit: unknown;
    dispatch: unknown;
} & BasicMap<unknown>;
type ModuleTree = {
    [key:string]: BasicModule;
}
type ModuleOf<T extends BasicModuleData> 
    = T extends ModuleData<any, infer MTree, infer GTree, infer ATree, infer SMTree, infer namespaced>  
        ? namespaced extends true 
            ? Module<
                GTree,
                CommitOf<MTree>,
                DispatchOf<ATree>,
                ModuleTreeOf<SMTree>
            >
            : ModuleTreeOf<SMTree>
        : never
                   
type ModuleTreeOf<T extends ModuleDataTree> = {
    [key in keyof T]: ModuleOf<T[key]>
}

type RootDataOf<M extends BasicModuleData>
    = M extends ModuleData<
        any, 
        infer MTree, 
        infer GTree, 
        infer ATree, 
        infer SMTree, 
        infer Namespaced
    >
        ? Namespaced extends false
            ? {
                commit: CommitOf<MTree>,
                dispatch: DispatchOf<ATree>,
                getters: Readonly<GTree>
            } & RootDataOfTree<SMTree>
            : RootDataOfTree<SMTree> & {
                dispatch: RootDispatchOf<ATree>
            }
        : never;
type RootDataOfTree<T extends ModuleDataTree> = IntersectionOf<{
    [key in keyof T]: RootDataOf<T[key]>;
}>;
export type StateOf<T extends BasicModuleData>
    = T extends ModuleData<infer S, any, any, any, infer MT, any>
        ? S & StateTreeOf<MT>
        : never;
type StateTreeOf<T extends ModuleDataTree> = {
    [key in keyof T]: StateOf<T[key]>;
}
export type StoreOf<RootModuleData extends BasicModuleData> 
    = ModuleOf<RootModuleData> 
    & RootDataOf<RootModuleData> 
    & { state: StateOf<RootModuleData> };

type Store<Getters extends GetterTree, C, D, Modules extends ModuleTree> = Module<Getters, C, D, Modules>;
type BasicStore =  Store<any, any, any, any>;
export type DefaultStore = DefaultModule;