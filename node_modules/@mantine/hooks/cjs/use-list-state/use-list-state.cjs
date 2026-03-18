'use client';
'use strict';

var React = require('react');

function useListState(initialValue = []) {
  const [state, setState] = React.useState(initialValue);
  const append = React.useCallback((...items) => setState((current) => [...current, ...items]), []);
  const prepend = React.useCallback((...items) => setState((current) => [...items, ...current]), []);
  const insert = React.useCallback(
    (index, ...items) => setState((current) => [...current.slice(0, index), ...items, ...current.slice(index)]),
    []
  );
  const apply = React.useCallback(
    (fn) => setState((current) => current.map((item, index) => fn(item, index))),
    []
  );
  const remove = React.useCallback(
    (...indices) => setState((current) => current.filter((_, index) => !indices.includes(index))),
    []
  );
  const pop = React.useCallback(
    () => setState((current) => {
      const cloned = [...current];
      cloned.pop();
      return cloned;
    }),
    []
  );
  const shift = React.useCallback(
    () => setState((current) => {
      const cloned = [...current];
      cloned.shift();
      return cloned;
    }),
    []
  );
  const reorder = React.useCallback(
    ({ from, to }) => setState((current) => {
      const cloned = [...current];
      const item = current[from];
      cloned.splice(from, 1);
      cloned.splice(to, 0, item);
      return cloned;
    }),
    []
  );
  const swap = React.useCallback(
    ({ from, to }) => setState((current) => {
      const cloned = [...current];
      const fromItem = cloned[from];
      const toItem = cloned[to];
      cloned.splice(to, 1, fromItem);
      cloned.splice(from, 1, toItem);
      return cloned;
    }),
    []
  );
  const setItem = React.useCallback(
    (index, item) => setState((current) => {
      const cloned = [...current];
      cloned[index] = item;
      return cloned;
    }),
    []
  );
  const setItemProp = React.useCallback(
    (index, prop, value) => setState((current) => {
      const cloned = [...current];
      cloned[index] = { ...cloned[index], [prop]: value };
      return cloned;
    }),
    []
  );
  const applyWhere = React.useCallback(
    (condition, fn) => setState(
      (current) => current.map((item, index) => condition(item, index) ? fn(item, index) : item)
    ),
    []
  );
  const filter = React.useCallback((fn) => {
    setState((current) => current.filter(fn));
  }, []);
  const handlers = React.useMemo(
    () => ({
      setState,
      append,
      prepend,
      insert,
      pop,
      shift,
      apply,
      applyWhere,
      remove,
      reorder,
      swap,
      setItem,
      setItemProp,
      filter
    }),
    []
  );
  return [state, handlers];
}

exports.useListState = useListState;
//# sourceMappingURL=use-list-state.cjs.map
