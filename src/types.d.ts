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

export type BasicMap<V = unknown> = {
    [key:string]: V
}
export type DeepReadonly<O> = O extends BasicMap ? {
    readonly [key in keyof O]: DeepReadonly<O[key]>;
} : O;
// type BasicActionHandler = ActionHandler<any,any,any>;
// /**
//  * Definition type for Module actions
//  */
// type ActionHandlerTree = {
//     [key:string]: BasicActionHandler;
// }

// type BasicMutationHandler = MutationHandler<any, any>;
// /**
//  * Definition type for Module mutations
//  */
// type MutationHandlerTree = {
//     [key:string]: BasicMutationHandler;
// }

// type BasicGetterHandler = GetterHandler<any, any, any>;
// /**
//  * Definition type for Module getters
//  */
// type GetterHandlerTree = {
//     [key:string]: BasicGetterHandler;
// }



// type ActionOf<T extends BasicActionHandler>
//     = T extends ActionHandler<any, infer P, infer R>
//         ? Action<P, R>
//         : never;
// type ActionTreeOf<T extends ActionHandlerTree> = {
//     [key in keyof T]: ActionOf<T[key]>;
// }


// type MutationOf<T extends BasicMutationHandler>
//     = T extends MutationHandler<any, infer P>
//         ? Mutation<P>
//         : never;
// type MutationTreeOf<T extends MutationHandlerTree> = {
//     [key in keyof T]: MutationOf<T[key]>;
// }


// type GetterOf<T extends BasicGetterHandler>
//     = T extends GetterHandler<any, any, infer R>
//         ? R 
//         : never;
// type GetterTreeOf<T extends GetterHandlerTree> = {
//     [key in keyof T]: GetterOf<T[key]>;
// }

// type ActionReturn<T extends BasicAction> 
//     = T extends Action<any, infer R, any> ? R : never;
// type ActionPayload<T extends BasicAction> 
//     = T extends Action<infer P, any, any> ? P : never;






