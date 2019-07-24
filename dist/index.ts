import * as Module from "../src/module";
import * as Mutation from "../src/mutation";
import * as Getter from "../src/getter";
import * as Action from "../src/action";
import * as Wrapper from "../src/wrapper";

export type ModuleData<
    State, 
    MTree extends Mutation.MutationTree,
    GTree extends Getter.GetterTree = {}, 
    ATree extends Action.ActionTree = {},
    SubModuleTree extends Module.ModuleReserved<SubModuleTree> = {},
    Namespaced extends boolean = true,
    RootModuleData extends Module.BasicModuleData = never
> = Module.ModuleData<State, MTree, GTree, ATree, SubModuleTree, Namespaced, RootModuleData>;
export const toTypesafeStore = Wrapper.toTypesafeStore;