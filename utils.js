"use strict";

const fs = require("fs");
const journalPath = require("path").join(__dirname, "journal.json");

let saveTimer, customLocations;
function save() {
  try { fs.writeFileSync(journalPath, JSON.stringify(customLocations)); }
  catch(e) { console.error("failed to write custom location", e); }
}

function queueSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 1e4);
}

try { customLocations = require(journalPath); }
catch(_) {
  customLocations = [];
  save();
}

const initCtx = (_, u) => {
  _.enabled = true;
  _.currentContract = u;
  _.newCustom = u;
  _.serverLocations = u;
  _.customLocations = u;
  _.slotAtlas = -1;
  _.gameId = u;
  _.tpTo = u;
  return _;
};

const ctxSymbol = Symbol("context");

const makeHook = (_, ctx) => {
  const hook = _.hook;
  return function() { hook.apply(_, arguments)[ctxSymbol] = ctx; };
};

const makeSender = _ => {
  const c = _.toClient;
  const s = _.toServer;
  return function(p) { (p.charAt() === "c" ? s : c).apply(_, arguments); };
};

const locationSort = (a, b) => a.name.localeCompare(b.name);

const newLocation = (loc, ctx) => ({
  zone: loc.zone,
  x: loc.x,
  y: loc.y,
  z: loc.z,
  name: ctx.newCustom
});

const makeCustom = loc => ({
  unk: 0,
  zone: loc.zone,
  x: loc.x,
  y: loc.y,
  z: loc.z,
  name: ~loc.name.indexOf("\t") ? loc.name : loc.name + "\t"
});

const getCtx = _ => _[ctxSymbol];

function getCustomLocations() {
  const custom = [];
  for (let i = 0, arr = customLocations, len = arr.length; i < len; ++i) {
    custom[i] = makeCustom(arr[i]);
  }
  return custom;
}

module.exports = Object.freeze({
  getCtx,
  initCtx,
  makeHook,
  queueSave,
  makeSender,
  newLocation,
  journalPath,
  locationSort,
  customLocations,
  getCustomLocations
});
