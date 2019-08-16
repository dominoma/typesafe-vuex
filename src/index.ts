import * as Vuex from 'vuex'
import * as VuexClass from 'vuex-class'
import Vue from 'vue'

type BasicMap<V = any> = { [name: string]: V }

type ActionHandler<P, R> = (
  context: Vuex.ActionContext<any, any>,
  payload: P
) => Promise<R>
type ActionHandlerTree = BasicMap<ActionHandler<any, any>>
type Action<P, R> = unknown & {} extends P
  ? () => Promise<R>
  : (payload: P) => Promise<R>
type ActionOfHandler<
  H extends ActionHandler<any, any>
> = H extends ActionHandler<infer P, infer R> ? Action<P, R> : never
type ActionTreeOfHandlerTree<T extends ActionHandlerTree> = {
  [name in keyof T]: ActionOfHandler<T[name]>
}

type MutationHandler<P> = (state: any, payload: P) => void
type MutationHandlerTree = BasicMap<MutationHandler<any>>
type Mutation<P> = unknown & {} extends P ? () => void : (payload: P) => void
type MutationOfHandler<
  H extends MutationHandler<any>
> = H extends MutationHandler<infer P> ? Mutation<P> : never
type MutationTreeOfHandlerTree<T extends MutationHandlerTree> = {
  [name in keyof T]: MutationOfHandler<T[name]>
}

type GetterHandler<R> = () => R
type GetterHandlerTree = BasicMap<GetterHandler<any>>
type Getter<R> = R
type GetterOfHandler<H extends GetterHandler<any>> = H extends GetterHandler<
  infer R
>
  ? Getter<R>
  : never

type GetterTreeOfHandlerTree<T extends GetterHandlerTree> = {
  [name in keyof T]: GetterOfHandler<T[name]>
}

type ModuleData<
  S extends BasicMap,
  A extends ActionHandlerTree,
  M extends MutationHandlerTree,
  G extends GetterHandlerTree
> = {
  state?: () => S
  actions?: A
  mutations?: M
  getters?: G
}
type ModuleDataTree = BasicMap<ModuleData<any, any, any, any>>

type ModuleOfData<
  D extends ModuleData<any, any, any, any>
> = D extends ModuleData<infer S, infer A, infer M, infer G>
  ? {
      state: S
      actions: ActionTreeOfHandlerTree<A>
      mutations: MutationTreeOfHandlerTree<M>
      getters: GetterTreeOfHandlerTree<G>
    }
  : never

type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends (<T>() => T extends Y ? 1 : 2)
  ? A
  : B

type VueDecorator<P> = <V extends Vue, k extends keyof V>(
  target: V,
  key: k
) => IfEquals<V[k], P, void, null>

type VuexDecorator<T extends BasicMap> = {} extends T
  ? never
  : {
      <n extends keyof T>(name: n): VueDecorator<T[n]>
      <V extends Vue, key extends keyof V>(
        target: V,
        key: key
      ): key extends keyof T ? IfEquals<V[key], T[key], void, null> : null
    }
type NamespacedVuexDecorator<
  M extends ModuleData<any, any, any, any>,
  k extends 'state' | 'actions' | 'mutations' | 'getters'
> = VuexDecorator<ModuleOfData<M>[k]>

export default function getTypesafeDecorators<
  R extends ModuleData<any, any, any, any>,
  M extends ModuleDataTree = {}
>() {
  return {
    Action: VuexClass.Action as NamespacedVuexDecorator<R, 'actions'>,
    Mutation: VuexClass.Action as NamespacedVuexDecorator<R, 'mutations'>,
    State: VuexClass.Action as NamespacedVuexDecorator<R, 'state'>,
    Getter: VuexClass.Action as NamespacedVuexDecorator<R, 'getters'>,
    namespace: (VuexClass.namespace as unknown) as {} extends M 
      ? never 
      : <m extends keyof M>(
        module: m
    ) => {
      /**
       * Decorator for store actions of that namespace
       * results in compile time error if signature of property doesn't match signature of action declared in namespace file
       */
      Action: NamespacedVuexDecorator<M[m], 'actions'>
      /**
       * Decorator for store mutations of that namespace
       * results in compile time error if signature of property doesn't match signature of mutation declared in namespace file
       */
      Mutation: NamespacedVuexDecorator<M[m], 'mutations'>
      /**
       * Decorator for store getters of that namespace
       * results in compile time error if signature of property doesn't match signature of getter declared in namespace file
       */
      Getter: NamespacedVuexDecorator<M[m], 'getters'>
      /**
       * Decorator for store state property of that namespace
       * results in compile time error if signature of property doesn't match signature of state property declared in namespace file
       */
      State: NamespacedVuexDecorator<M[m], 'state'>
    }
  }
}