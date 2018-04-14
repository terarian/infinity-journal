"use strict";

/**
 * IMPORTS
 */
const {
  getCtx,
  initCtx,
  makeHook,
  queueSave,
  makeSender,
  newLocation,
  locationSort,
  customLocations,
  getCustomLocations
} = require("./utils");
const journalOptions = require("./commands");
const command = require("command");
const webui = require("./ui");

/**
 * UNBREAK SOME REGIONS
 */
const specialCases = {
  "7015": 71001,
  "7013": 75001,
  "7021": 80001,
  "7022": 79001,
  "7023": 77001
};

/**
 * HELPERS
 */
function onLogin(evt) {
  const ctx = getCtx(this);
  ctx.gameId = evt.gameId;
  ctx.tpTo = ctx.currentContract = undefined;
  ctx.slotAtlas = -1;
}
function getContract(evt) { getCtx(this).currentContract = evt.type; }
function nullContract() { getCtx(this).currentContract = undefined; }
function nullDestination() { getCtx(this).tpTo = undefined; }

/**
 * TO INFINITY AND BEYOND
 */
function teleportTo(evt) {
  const ctx = getCtx(this);
  return ctx.tpTo ? (
    Object.assign(evt.loc, ctx.tpTo), true
  ) : undefined;
}

function onVilList(evt) {
  const ctx = getCtx(this);
  if (!ctx.enabled || !ctx.tpTo) return;
  const zone = ctx.tpTo.zone;
  const special = specialCases[zone];
  if (special) {
    ctx.send("cTeleportToVillage", 1, { id: special });
    return false;
  }
  for (let i = 0, arr = evt.locations, len = arr.length; i < len; ++i) {
    const loc = arr[i];
    if (loc.zone === zone) {
      ctx.send("cTeleportToVillage", 1, { id: loc.id });
      return false;
    }
  }
  ctx.cmd.message(`<font color="#ff0000">Zone ${zone} cannot be teleported to.</font>`);
  ctx.tpTo = undefined;
}

function onLoadTpList(evt) {
  const ctx = getCtx(this);
  ctx.tpTo = undefined;
  if (!ctx.enabled) return;
  for (let i = 0, arr = evt.locations, len = arr.length; i < len; ++i) {
    const loc = arr[i];
    if (!loc) continue;
    if (loc.name === "*\t*") {
      if (ctx.newCustom) {
        customLocations[customLocations.length] = newLocation(loc, ctx);
        queueSave(customLocations.sort(locationSort));
        ctx.cmd.message("Journal saved.");
        ctx.newCustom = "";
      }
      ctx.send("cDeleteTeleportToPosList", 1, { index: i });
      evt.locations.splice(i, 1); --i; --len;
      continue;
    }
    loc.name += " *";
  }
  ctx.serverLocations = evt.locations;
  evt.locations = [...evt.locations, ...getCustomLocations()];
  return true;
}

function onPcBangDatalist(evt) {
  const ctx = getCtx(this);
  ctx.slotAtlas = -1;
  for (let i = 0, arr = evt.inventory, len = arr.length; i < len; ++i) {
    const inv = arr[i];
    if (inv.item === 181116) {
      return void(ctx.slotAtlas = inv.slot);
    }
  }
}

function onActionEnd(evt) {
  const ctx = getCtx(this);
  if (evt.source.equals(ctx.gameId) && evt.type !== 37) {
    ctx.tpTo = ctx.currentContract = undefined;
  }
}

function onTpToPos(evt) {
  const ctx = getCtx(this);
  if (!ctx.enabled) return;
  const idx = evt.index;
  const len = ctx.serverLocations.length;
  if (idx >= len) {
    if (ctx.slotAtlas !== -1) {
      ctx.tpTo = customLocations[idx - len];
      ctx.send("cPcbanginventoryUseSlot", 1, { slot: ctx.slotAtlas });
    }
    else {
      ctx.cmd.message(`<font color="#ff0000">You must have Elite status to teleport to a custom location.</font>`);
    }
    return false;
  }
}

function onDelTpPos(evt) {
  const ctx = getCtx(this);
  if (!ctx.enabled) return;
  const idx = evt.index;
  const len = ctx.serverLocations.length;
  if (idx >= len) {
    queueSave(customLocations.splice(idx - len, 1));
    ctx.send("sLoadTeleportToPosList", 1, {
      locations: [...ctx.serverLocations, ...getCustomLocations()]
    });
    return false;
  }
}

/**
 * INIT
 */
function InfiniteJournalism(_) {
  const ctx = initCtx({ send: makeSender(_), cmd: command(_) });
  const hook = makeHook(_, ctx);
  webui(_, ctx);

  ctx.cmd.add("journal", journalOptions, ctx);

  const r = "raw";
  hook(                  "sLogin", 10,          onLogin);
  hook(                "sSpawnMe",  2,       teleportTo);
  hook(               "sLoadTopo",  3,       teleportTo);
  hook(              "sActionEnd",  1,      onActionEnd);
  hook(          "cTeleportToPos",  1,        onTpToPos);
  hook(         "cPlayerLocation",  r,  nullDestination);
  hook(         "sCancelContract",  r,     nullContract);
  hook(        "sRequestContract",  1,      getContract);
  hook(  "sVillageListToTeleport",  1,        onVilList);
  hook(  "sLoadTeleportToPosList",  1,     onLoadTpList);
  hook("cDeleteTeleportToPosList",  1,       onDelTpPos);
  hook("sPcbanginventoryDatalist",  1, onPcBangDatalist);
}

module.exports = InfiniteJournalism;
