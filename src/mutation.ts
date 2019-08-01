import { IntersectionOf, BasicMap } from "./types";
/**
 * Mutation type used to declare a Module mutation
 * @param P type of mutation payload
 */
export type Mutation<P> = ((payload : P)=>void ) | (() => void);
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

type DefaultMutationHandler = (state: BasicMap, payload : unknown) => void;
export type DefaultMutationHandlerTree = BasicMap<DefaultMutationHandler>;

type MutationHandlerOf<T extends BasicMutation, State>
    = T extends Mutation<infer P>
        ? MutationHandler<State, P>
        : never;

export type MutationHandlerTreeOf<T extends MutationTree, State> = {
    [key in keyof T]: MutationHandlerOf<T[key], State>;
}

type MutationPayload<T extends BasicMutation> 
    = T extends Mutation<infer P> ? P : never;

type Commit<Name extends string | number | symbol, P>
    = unknown extends P
        ? ((name : Name)=>void) & ((args : { type : Name })=>void)
        : ((name : Name, payload : P)=>void) & ( P extends BasicMap ? ((args : { type : Name } & P)=>void) : unknown);

export type DefaultCommit = {
    (name : string, payload : unknown):void;
    (args : { type : string } & unknown):void;
}

export type CommitOf<MTree extends MutationTree> = IntersectionOf<{
    [name in keyof MTree]: Commit<name, MutationPayload<MTree[name]>>
}>;