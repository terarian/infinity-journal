"use strict";
const extraData = new WeakMap;
const fixedHookOnce = Symbol();

function once() {
  const { base, cb } = extraData.get(this);
  extraData.delete(this);
  try { return cb.apply(this, arguments); }
  finally { base.unhook(this); }
}

function hookOnce() {
  const argsLen = arguments.length - 1;
  const copy = new Array(argsLen + 1);
  let i = -1;
  while(++i < argsLen) copy[i] = arguments[i];
  const cb = arguments[i];
  if (typeof cb !== "function") {
    throw new TypeError("last argument not a function");
  }

  copy[i] = once;
  const hook = this.base.hook.apply(this.base, copy);
  extraData.set(hook, {
    cb,
    base: this.base
  });

  return hook;
}

hookOnce.fixed = fixedHookOnce;

function fixHookOnce(dispatch) {
  const proto = Object.getPrototypeOf(dispatch);
  if (proto.hookOnce.fixed === fixedHookOnce) return;
  Object.defineProperty(proto, "hookOnce", {
    value: hookOnce,
    writeable: true,
    configurable: true
  });
}

module.exports = fixHookOnce;
