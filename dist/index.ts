import * as MModule from "../src/module";
import * as MMutation from "../src/mutation";
import * as Getter from "../src/getter";
import * as MAction from "../src/action";
import * as Wrapper from "../src/wrapper";
import * as ClassStyle from "../src/class-style";

export type ModuleData<
    State, 
    MTree extends MMutation.MutationTree,
    GTree extends Getter.GetterTree = {}, 
    ATree extends MAction.ActionTree = {},
    SubModuleTree extends MModule.ModuleDataTree = {},
    Namespaced extends boolean = true,
    RootModuleData extends MModule.BasicModuleData = never
> = MModule.ModuleData<State, MTree, GTree, ATree, SubModuleTree, Namespaced, RootModuleData>;

export const ClassModule = ClassStyle.ClassModule;
export const Action = ClassStyle.Action;
export const Mutation = ClassStyle.Mutation;
export const Module = ClassStyle.Module;

export function toTypesafeStore<M extends MModule.BasicModuleData>(module : M) : MModule.StoreOf<M>;
export function toTypesafeStore<M extends ClassStyle.BasicClassModule>(module : ClassStyle.ModuleCtor<M>) : MModule.StoreOf<ClassStyle.ModuleDataOf<M>>;
export function toTypesafeStore(module : MModule.BasicModuleData | ClassStyle.ModuleCtor<ClassStyle.BasicClassModule>) : any {
    if(module instanceof Function) {
        return ClassStyle.toTypesafeStore(module);
    }
    else {
        return Wrapper.toTypesafeStore(module);
    }
};