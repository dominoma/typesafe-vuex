import { BasicModuleData, ModuleData, ModuleDataTree, StateOf } from "./module";

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

type GetterHandlerOf<T extends BasicGetter, State, GTree extends GetterTree, RMD extends BasicModuleData = never>
    = T extends Getter<infer R>
        ? GetterHandler<State, GTree, R, RMD>
        : never;

type GetterHandlerTreeOf<T extends GetterTree, State, RMD extends BasicModuleData> = {
    [key in keyof T]: GetterHandlerOf<T[key], State, T, RMD>;
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