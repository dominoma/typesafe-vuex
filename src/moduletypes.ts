export type UnionOf<T extends {}> 
    = T extends { [key:string]: infer R } ? R : never;
export type IntersectionOf<T extends {}> = {
    [key in keyof T]: (dummy : T[key])=>void;
} extends { [key:string] : (dummy : infer R)=>void } ? R : never;


export type Action<P, R> = {
    (payload : P): Promise<R>
}
type BasicAction = Action<any, any>;
export type ActionTree = {
    [key:string]: BasicAction;
}
type ActionHandler<C extends BasicActionContext, P, R> = {
    (context : C, payload : P): Promise<R>;
}
type BasicActionHandler = ActionHandler<any,any,any>;
type ActionHandlerTree = {
    [key:string]: BasicActionHandler;
}

export type Mutation<P> = {
    (payload : P):void
}
type BasicMutation = Mutation<any>;
export type MutationTree = {
    [key:string]: BasicMutation;
}
type MutationHandler<S, P> = {
    (state : S, payload : P): void;
}
type BasicMutationHandler = MutationHandler<any, any>;
type MutationHandlerTree = {
    [key:string]: BasicMutationHandler;
}

export type Getter<R> = R;
type BasicGetter = Getter<any>;
export type GetterTree = {
    [key:string]: BasicGetter;
}
type GetterHandler<S, T extends GetterTree, R, RMD extends BasicModuleData = never> 
    = [RMD] extends [never] 
        ? (state : S, getters : T)=>R
        : (state : S, getters : T, root: RootOfRMD<RMD>)=>R;
type BasicGetterHandler = GetterHandler<any, any, any>;
type GetterHandlerTree = {
    [key:string]: BasicGetterHandler;
}

export type ActionContext<State, C, D, GTree, RMD extends BasicModuleData = never> 
= [RMD] extends [never] ? {
    state : Readonly<State>;
    commit: C;
    dispatch: D;
    getters: Readonly<GTree>;
} : {
    state : Readonly<State>;
    commit: C;
    dispatch: D;
    getters: Readonly<GTree>;
    root: ModuleOf<RMD>;
};
type BasicActionContext = ActionContext<any, any, any, any>;

type ActionHandlerOf<T extends BasicAction, Context extends BasicActionContext>
    = T extends Action<infer P, infer R>
        ? ActionHandler<Context, P, R>
        : never;

type ActionHandlerTreeOf<T extends ActionTree, Context extends BasicActionContext> = {
    [key in keyof T]: ActionHandlerOf<T[key], Context>;
}
type ActionOf<T extends BasicActionHandler>
    = T extends ActionHandler<any, infer P, infer R>
        ? Action<P, R>
        : never;
type ActionTreeOf<T extends ActionHandlerTree> = {
    [key in keyof T]: ActionOf<T[key]>;
}

type MutationHandlerOf<T extends BasicMutation, State>
    = T extends Mutation<infer P>
        ? MutationHandler<State, P>
        : never;

type MutationHandlerTreeOf<T extends MutationTree, State> = {
    [key in keyof T]: MutationHandlerOf<T[key], State>;
}
type MutationOf<T extends BasicMutationHandler>
    = T extends MutationHandler<any, infer P>
        ? Mutation<P>
        : never;
type MutationTreeOf<T extends MutationHandlerTree> = {
    [key in keyof T]: MutationOf<T[key]>;
}

type GetterHandlerOf<T extends BasicGetter, State, GTree extends GetterTree, RMD extends BasicModuleData = never>
    = T extends Getter<infer R>
        ? GetterHandler<State, GTree, R, RMD>
        : never;

type GetterHandlerTreeOf<T extends GetterTree, State> = {
    [key in keyof T]: GetterHandlerOf<T[key], State, T>;
}
type GetterOf<T extends BasicGetterHandler>
    = T extends GetterHandler<any, any, infer R>
        ? R 
        : never;
type GetterTreeOf<T extends GetterHandlerTree> = {
    [key in keyof T]: GetterOf<T[key]>;
}

type ActionReturn<T extends BasicAction> 
    = T extends Action<any, infer R> ? R : never;
type ActionPayload<T extends BasicAction> 
    = T extends Action<infer P, any> ? P : never;

type Dispatch<Name extends string | number | symbol, P, R> 
    = (name : Name, payload : P) => Promise<R>
type DispatchOf<ATree extends ActionTree> = IntersectionOf<{
    [name in keyof ATree]: Dispatch<name, ActionPayload<ATree[name]>, ActionReturn<ATree[name]>>
}>;

type MutationPayload<T extends BasicMutation> 
    = T extends Mutation<infer P> ? P : never;
type Commit<Name extends string | number | symbol, P>
    = (name : Name, payload : P)=>void;
type CommitOf<MTree extends MutationTree> = IntersectionOf<{
    [name in keyof MTree]: Commit<name, MutationPayload<MTree[name]>>
}>;

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
    state: State;
    actions: ActionHandlerTreeOf<
        ATree, 
        ActionContext<
            State,
            CommitOf<MTree>,
            DispatchOf<ATree>,
            GTree,
            RootModuleData
        >
    >;
    mutations: MutationHandlerTreeOf<MTree, State>;
    getters: GetterHandlerTreeOf<GTree, State>;
    modules: SubModuleTree;
}
export type ModuleOf<T extends BasicModuleData> 
    = T extends {
        namespaced: boolean,
        state: infer State,
        actions: infer AHTree,
        mutations: infer MHTree,
        getters: infer GHTree,
        modules: infer SMTree
    } 
        ? GHTree extends GetterHandlerTree
            ? MHTree extends MutationHandlerTree
                ? AHTree extends ActionHandlerTree
                    ? SMTree extends ModuleDataTree
                        ? { 
                            state: Readonly<State>,
                            getters: Readonly<GetterTreeOf<GHTree>>,
                            commit: CommitOf<MutationTreeOf<MHTree>>,
                            dispatch: DispatchOf<ActionTreeOf<AHTree>>,
                            modules: ModuleTreeOf<SMTree>
                        }
                        : never
                    : never
                : never
            : never
        : never;
type BasicModuleData = ModuleData<any,any,any,any,any,any>;
type ModuleDataTree = {
    [key:string]: BasicModuleData;
}
type ModuleTreeOf<T extends ModuleDataTree> = {
    [key in keyof T]: ModuleOf<T[key]>
}
type StateOfRMD<RMD extends BasicModuleData> = 
    RMD extends ModuleData<infer S, any> ? S : never;
type GetterTreeOfRMD<RMD extends BasicModuleData> =
    RMD extends ModuleData<any,any, infer GTree, any, infer SMTree>
        ? {
            getters: GTree,
            modules: { [key in keyof SMTree]: GetterTreeOfRMD<SMTree[key]> }
        }
        : never;
type RootOfRMD<RMD extends BasicModuleData> = { state: StateOfRMD<RMD> } & GetterTreeOfRMD<RMD>;
type RootDataOf<M extends BasicModuleData>
    = M extends ModuleData<
        infer State, 
        infer MTree, 
        infer GTree, 
        infer ATree, 
        infer SMTree, 
        infer Namespaced
    >
        ? Namespaced extends false
            ? {
                state: Readonly<State>,
                commit: CommitOf<MTree>,
                dispatch: DispatchOf<ATree>,
                getters: Readonly<GTree>
            } & RootDataOfTree<SMTree>
            : RootDataOfTree<SMTree>
        : never;
type RootDataOfTree<T extends ModuleDataTree> = {
    [key in keyof T]: (
        dummy: RootDataOf<T[key]>
    ) => void;
} extends { [key:string]: (dummy: infer RootState)=>void } ? RootState : never;

export type StoreOf<RootModuleData extends BasicModuleData> = ModuleOf<RootModuleData> & RootDataOf<RootModuleData>;