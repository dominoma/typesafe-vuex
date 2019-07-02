import { BasicModuleData, StoreOf } from "./module";
import { IntersectionOf } from "./types";
/**
 * Action type used to declare a Module action
 * @param P payload type of action
 * @param R return type of action
 */
export type ModuleAction<P, R> = ((payload : P) => Promise<R>) | (() => Promise<R>);
/**
 * Action type used to declare a root action in a namespced module
 * @param P payload type of action
 * @param R return type of action
 */
export type RootAction<P, R> = {
    root: true;
    handler: ((payload : P) => Promise<R>) | (() => Promise<R>)
}
/**
 * Action type used to declare an action
 * @param P payload type of action
 * @param R return type of action
 */
export type Action<P, R> = RootAction<P, R> | ModuleAction<P, R>;
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
export type ModuleActionHandler<C extends BasicActionContext, P, R> 
    = unknown extends P
        ? (context : C) => Promise<R>
        : (context : C, payload : P) => Promise<R>;
export  type RootActionHandler<C extends BasicActionContext, P, R> 
    = { root: true, handler: unknown extends P
        ? (context : C) => Promise<R>
        : (context : C, payload : P) => Promise<R>
    };
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
    = T extends ModuleAction<infer P, infer R>
        ? [P] extends [never] ? ModuleActionHandler<Context, never, R> : ModuleActionHandler<Context, P, R>
        : T extends RootAction<infer P, infer R>
            ? [P] extends [never] ? RootActionHandler<Context, never, R> : RootActionHandler<Context, P, R>
            : never;

/** 
 * Returns the actions definition type of an actions declaration
 * @param T the actions declaration
 * @param Context the type of the context to pass to the action definition functions
 */
type ActionHandlerTreeOf<T extends ActionTree, Context extends BasicActionContext> = {
    [key in keyof T]: ActionHandlerOf<T[key], Context>;
}

export type Dispatch<Name extends string | number | symbol, P, R> 
    = unknown extends P
        ? ((name : Name) => Promise<R>) & ((args : { type : Name })=>R)
        : ((name : Name, payload : P) => Promise<R>) & ((args : { type : Name } & P)=>R);
export type DispatchOf<ATree extends ActionTree> = IntersectionOf<{
    [name in keyof ATree]: ATree[name] extends ModuleAction<infer P, infer R> 
        ? Dispatch<name, P, R>
        : unknown;
}>;
export type RootDispatchOf<ATree extends ActionTree> = IntersectionOf<{
    [name in keyof ATree]: ATree[name] extends RootAction<infer P, infer R> 
        ? Dispatch<name, P, R>
        : unknown;
}>;