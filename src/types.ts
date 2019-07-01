/**
 * Returns the Union of all property types in T
 */
export type UnionOf<T extends {}> 
    = T extends { [key:string]: infer R } ? R : never;
/**
 * Returns the Intersection of all property types in T 
 */
export type IntersectionOf<T extends {}> = {
    [key in keyof T]: (dummy : T[key])=>void;
} extends { [key:string] : (dummy : infer R)=>void } ? R : never;

/**
 * Action type used to declare a Module action
 * @param P payload type of action
 * @param R return type of action
 */
export type Action<P, R> = ((payload : P) => Promise<R>) | (() => Promise<R>);
type BasicAction = Action<any, any>;
/**
 * Declaration type for Module actions
 */
export type ActionTree = {
    [key:string]: BasicAction;
}
/**
 * Action Type used to define a Module action
 * @param C type of action context
 * @param P type of action payload
 * @param R return type
 */
type ActionHandler<C extends BasicActionContext, P, R> 
    = unknown extends P
        ? (context : C) => Promise<R>
        : (context : C, payload : P) => Promise<R>;
type BasicActionHandler = ActionHandler<any,any,any>;
/**
 * Definition type for Module actions
 */
type ActionHandlerTree = {
    [key:string]: BasicActionHandler;
}
/**
 * Mutation type used to declare a Module mutation
 * @param P type of mutation payload
 */
export type Mutation<P> = ((payload : P)=>void )| (() => void);
type BasicMutation = Mutation<any>;
/**
 * Declaration type for Module mutations
 */
export type MutationTree = {
    [key:string]: BasicMutation;
}
/**
 * Mutation type used to define a Module mutation
 * @param S type of module state
 * @param P type of mutation payload
 */
type MutationHandler<S, P> 
    = unknown extends P
        ? (state : S) => void
        : (state : S, payload : P) => void;
type BasicMutationHandler = MutationHandler<any, any>;
/**
 * Definition type for Module mutations
 */
type MutationHandlerTree = {
    [key:string]: BasicMutationHandler;
}
/**
 * Getter type used to declare a Module getter
 * @param R return type of getter
 */
export type Getter<R> = R;
type BasicGetter = Getter<any>;
/**
 * Declaration type for Module getters
 */
export type GetterTree = {
    [key:string]: BasicGetter;
}
/**
 * Getter type used to define a Module getter
 * @param S state type of module
 * @param T type of getters
 * @param R return type of getter
 * @param RMD type of root module definition
 */
type GetterHandler<S, T extends GetterTree, R, RMD extends BasicModuleData = never> 
    = [RMD] extends [never] 
        ? (state : S, getters : T)=>R
        : (state : S, getters : T, root: GetterHandlerRootOf<RMD>)=>R;
type BasicGetterHandler = GetterHandler<any, any, any>;
/**
 * Definition type for Module getters
 */
type GetterHandlerTree = {
    [key:string]: BasicGetterHandler;
}
/**
 * Type of context passed in action definitions
 * @param State state type of module
 * @param C type of commit function
 * @param D type of dispatch function
 * @param GTree type of module getters
 * @param RMD type of root module definition
 */
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
    root: StoreOf<RMD>;
};
type BasicActionContext = ActionContext<any, any, any, any>;

/**
 * Returns the action definition type of an action declaration
 * @param T the action declaration
 * @param Context the type of the context to pass to the action definition function
 */
type ActionHandlerOf<T extends BasicAction, Context extends BasicActionContext>
    = T extends Action<infer P, infer R>
        ? [P] extends [never] ? ActionHandler<Context, never, R> : ActionHandler<Context, P, R>
        : never;

/** 
 * Returns the actions definition type of an actions declaration
 * @param T the actions declaration
 * @param Context the type of the context to pass to the action definition functions
 */
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

type GetterHandlerTreeOf<T extends GetterTree, State, RMD extends BasicModuleData> = {
    [key in keyof T]: GetterHandlerOf<T[key], State, T, RMD>;
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
    = unknown extends P
        ? ((name : Name) => Promise<R>) & ((args : { type : Name })=>R)
        : ((name : Name, payload : P) => Promise<R>) & ((args : { type : Name } & P)=>R);
type DispatchOf<ATree extends ActionTree> = IntersectionOf<{
    [name in keyof ATree]: Dispatch<name, ActionPayload<ATree[name]>, ActionReturn<ATree[name]>>
}>;

type MutationPayload<T extends BasicMutation> 
    = T extends Mutation<infer P> ? P : never;
type Commit<Name extends string | number | symbol, P>
    = unknown extends P
        ? ((name : Name)=>void) & ((args : { type : Name })=>void)
        : ((name : Name, payload : P)=>void) & ((args : { type : Name } & P)=>void);
type CommitOf<MTree extends MutationTree> = IntersectionOf<{
    [name in keyof MTree]: Commit<name, MutationPayload<MTree[name]>>
}>;

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
            DispatchOf<ATree>,
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
type ModuleReserved<T extends ModuleDataTree> = Reserved<ModuleDataTree, T, "commit" | "dispatch" | "getters" | "state">;

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
type GetterHandlerRootGettersOf<M extends BasicModuleData>
    = M extends ModuleData<
        any, 
        any, 
        infer GTree, 
        any, 
        infer SMTree, 
        infer Namespaced
    >
        ? Namespaced extends true
            ? {
                getters: Readonly<GTree>
            } & GetterHandlerRootOfTree<SMTree>
            : GetterHandlerRootOfTree<SMTree>
        : never;
type GetterHandlerRootOfTree<T extends ModuleDataTree> = {
    [key in keyof T]: GetterHandlerRootGettersOf<T[key]>;
}
type GetterHandlerRootOf<RMD extends BasicModuleData> = { state: StateOf<RMD> } & GetterHandlerRootGettersOf<RMD>;
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
            : RootDataOfTree<SMTree>
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