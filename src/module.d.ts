import { MutationTree, MutationHandlerTreeOf, CommitOf } from "./mutation";
import { ActionTree, ActionHandlerTreeOf, ActionContext, RootDispatchOf, DispatchOf } from "./action";
import { GetterTree, GetterHandlerTreeOf } from "./getter";
import { IntersectionOf } from "./types";

export type ModuleData<
    State, 
    MTree extends MutationTree,
    GTree extends GetterTree = {}, 
    ATree extends ActionTree = {},
    SubModuleTree extends ModuleReserved<SubModuleTree> = {},
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
type BasicModuleData = ModuleData<any,any,any,any,any,any>;
type ModuleDataTree = {
    [key:string]: BasicModuleData;
};
export type Reserved<B, T extends B, K extends string> 
    = Omit<T, K> extends T ? B : never;
type ModuleReservedKeys = "commit" | "dispatch" | "getters" | "state";
type ModuleReserved<T extends ModuleDataTree> = Reserved<ModuleDataTree, T, ModuleReservedKeys>;

export type Module<Getters extends GetterTree, C, D, Modules extends ModuleTree> = {
    readonly getters: Readonly<Getters>;
    readonly commit: C;
    readonly dispatch: D;
} & Readonly<Modules>;
type BasicModule = Module<any,any,any,any> | ModuleTree;
type ModuleTree = {
    [key:string]: BasicModule;
}
export type ModuleOf<T extends BasicModuleData> 
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
                   
export type ModuleTreeOf<T extends ModuleDataTree> = {
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
type StateOf<T extends BasicModuleData>
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