"use strict";
const {
  queueSave,
  customLocations
} = require("./utils");
const pathname = "/infinityjournal/";
const getId = (() => { let id = 0; return () => id++; })();
const paramRegex = /(\d*)(\D*)/;
const UI = (() => { try { return require("ui"); } catch(_) { /*  */ } })();
const staticServe = UI && UI.static(require("path").join(__dirname, "ui"));

function getData(param) {
  const data = param.match(paramRegex);
  data.shift();
  return data;
}

function api(req, res) {
  const api = getData(req.params[0]);
  switch(api[1]) {
   case "L":
    return res.status(200).json(customLocations);
   case "T":
    if (this.slotAtlas !== -1) {
      this.tpTo = customLocations[Number(api[0])];
      this.send("cPcbanginventoryUseSlot", 1, { slot: this.slotAtlas });
      return res.status(200).json({ close: 1 });
    }
    else {
      return res.status(200).json({ close: "You must have Elite status to teleport to a custom location." });
    }
   case "D":
    customLocations.splice(Number(api[0]), 1);
    queueSave();
    return res.status(200).json("ok");
   default:
    return res.status(404).send("404");
  }
}

function open() {
  this.ui.open(`${pathname}${this.id}/`);
}

function webui(dispatch, ctx) {
  if (!UI) return;
  const ui = UI(dispatch);
  const id = getId();

  ui.use(`${pathname}${id}/`, staticServe);
  ui.get(`${pathname}${id}/api/*`, function() { api.apply(ctx, arguments); });

  ctx.webui = { ui, id, open };
}

module.exports = webui;
