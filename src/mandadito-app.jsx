import React, { useState, useMemo, useEffect, useRef } from "react";

/* ────────────────────────────────────────────────────────────────
   MANDADITO — prototipo funcional
   Construido sobre el esquema real de la base de datos:
     usuarios, tareas, pagos, calificaciones, mensajes, notificaciones
   Tablas añadidas (no existen en la BD original, marcadas como EXT):
     postulaciones, disputas, evidencias
   ──────────────────────────────────────────────────────────────── */

/* ═══════════ ESTILOS ═══════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

.mdt *, .mdt *::before, .mdt *::after { box-sizing: border-box; }
.mdt button { color: inherit; }
.mdt { 
  --nar:#FF6A00; --nar-osc:#C95100; --nar-luz:#FFF3E9;
  --neg:#111114; --carbon:#1C1C21; --grafito:#2E2E36;
  --bl:#FFFFFF; --hueso:#F7F7F8; --gris:#86868B; --linea:#E4E3E1;
  --ok:#1B9E5A; --alerta:#C98A0B; --err:#D64545; --info:#2F6FED;
  --r:14px;
  font-family:'DM Sans',-apple-system,system-ui,sans-serif;
  color:var(--neg);
  -webkit-font-smoothing:antialiased;
  display:flex; align-items:center; justify-content:center;
  min-height:100vh; min-height:100dvh; width:100%;
  background:#16171d;
  padding:20px;
}
.mdt .frame {
  width:100%; max-width:412px; height:min(88vh,860px); min-height:560px;
  background:var(--bl); border-radius:30px; overflow:hidden;
  display:flex; flex-direction:column; position:relative;
  box-shadow:0 1px 2px rgba(0,0,0,.05), 0 14px 44px rgba(0,0,0,.13);
}
@media (max-width:520px){ .mdt{padding:0} .mdt .frame{height:100vh;height:100dvh;max-width:none;border-radius:0;box-shadow:none} .mdt input,.mdt textarea,.mdt select{font-size:16px} }

/* tipografía */
.mdt h1,.mdt h2,.mdt h3,.mdt .disp{font-weight:700;letter-spacing:-.024em;margin:0;color:var(--neg)}
.mdt h1{font-size:27px;line-height:1.12;letter-spacing:-.032em}
.mdt h2{font-size:19px;line-height:1.2;letter-spacing:-.028em}
.mdt h3{font-size:15px;line-height:1.3}
.mdt p{margin:0}
.mdt .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:-.02em}
.mdt .eyebrow{font-size:11px;font-weight:600;letter-spacing:.01em;color:var(--gris)}
.mdt .muted{color:var(--gris);font-size:13px;line-height:1.45}
.mdt .tiny{font-size:11.5px;color:var(--gris)}

/* estructura */
.mdt .top{flex:0 0 auto;background:var(--neg);color:var(--bl);padding:14px 16px 12px;position:relative;z-index:3}
.mdt .body{flex:1 1 auto;min-height:0;overflow-y:auto;background:var(--hueso);-webkit-overflow-scrolling:touch}
.mdt .pad{padding:16px}
.mdt .tabs{flex:0 0 auto;display:flex;align-items:stretch;background:var(--bl);border-top:1px solid var(--linea);padding:8px 4px 10px}
.mdt .tab{flex:1;background:none;border:0;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;cursor:pointer;color:var(--gris);font:inherit;font-size:10.5px;font-weight:500;letter-spacing:-.01em;border-radius:10px;min-height:44px}
.mdt .tab.on{color:var(--nar)}
.mdt .tab.mid{justify-content:center}
.mdt .tab.mid .bulb{background:var(--nar);width:44px;height:44px;border-radius:14px;display:grid;place-items:center}
.mdt .tab.mid:active .bulb{background:var(--nar-osc)}

/* logo */
.mdt .wordmark{font-weight:700;letter-spacing:-.045em;display:inline-flex;align-items:center;gap:8px}

/* tarjetas */
.mdt .card{background:var(--bl);border:1px solid var(--linea);border-radius:var(--r);padding:14px;margin-bottom:10px}
.mdt .card.tap{cursor:pointer;transition:border-color .15s,background-color .15s}
.mdt .card.tap:active{background:var(--hueso)}
.mdt .card.tap:hover{border-color:#D5D3D0}
.mdt .row{display:flex;align-items:center;gap:10px}
.mdt .between{display:flex;align-items:center;justify-content:space-between;gap:10px}
.mdt .stack{display:flex;flex-direction:column;gap:2px;min-width:0}
.mdt .grow{flex:1;min-width:0}
.mdt .trunc{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* badges */
.mdt .badge{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:3px 9px;border-radius:999px;letter-spacing:-.005em;white-space:nowrap}
.mdt .b-pend{background:#FBF2DE;color:#8A6008}
.mdt .b-asig{background:#E9EEFA;color:#2B4E9E}
.mdt .b-paga{background:var(--nar-luz);color:var(--nar-osc)}
.mdt .b-prog{background:#E7F1FA;color:#155E8F}
.mdt .b-comp{background:#E8F4EC;color:#136B44}
.mdt .b-fin{background:#111114;color:#fff}
.mdt .b-disp{background:#FBE9E9;color:#9C2626}
.mdt .b-canc{background:#EDECEB;color:#6B6B70}

/* botones */
.mdt .btn{font:inherit;font-weight:600;font-size:14.5px;letter-spacing:-.01em;border:0;border-radius:999px;padding:13px 20px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;width:100%;transition:background-color .15s,opacity .15s}
.mdt .btn:active{opacity:.7}
.mdt .btn:disabled{opacity:.4;cursor:not-allowed}
.mdt .btn-pri{background:var(--nar);color:#fff}
.mdt .btn-pri:hover:not(:disabled){background:var(--nar-osc)}
.mdt .btn-neg{background:var(--neg);color:#fff}
.mdt .btn-out{background:transparent;color:var(--neg);box-shadow:inset 0 0 0 1px var(--linea)}
.mdt .btn-out:hover:not(:disabled){background:var(--hueso)}
.mdt .btn-err{background:#fff;color:var(--err);box-shadow:inset 0 0 0 1px #EFD2D2}
.mdt .btn-mp{background:#009EE3;color:#fff}
.mdt .btn-mp:hover:not(:disabled){background:#008FCC}
.mdt .btn-sm{padding:9px 14px;font-size:13px;width:auto}
.mdt .btn-row{display:flex;gap:8px}

/* footer */
.mdt .foot-link{display:inline-flex;align-items:center;justify-content:center;gap:6px;font-size:14.5px;font-weight:600;letter-spacing:-.01em;color:#fff;background:var(--nar);padding:13px 28px;border-radius:999px;text-decoration:none;transition:background-color .15s,gap .15s}
.mdt .foot-link:hover{background:var(--nar-osc);gap:10px}
.mdt .foot-link:active{opacity:.7}
.mdt .foot-link:focus-visible{outline:2px solid #fff;outline-offset:2px}

/* formularios */
.mdt label.f{display:block;margin-bottom:12px}
.mdt label.f .lb{font-size:12px;font-weight:700;display:block;margin-bottom:5px}
.mdt input,.mdt textarea,.mdt select{width:100%;font:inherit;font-size:14.5px;padding:12px 14px;border:1px solid var(--linea);border-radius:12px;background:var(--bl);color:var(--neg);outline:none;transition:border-color .15s}
.mdt input:focus,.mdt textarea:focus,.mdt select:focus{border-color:var(--neg)}
.mdt textarea{resize:vertical;min-height:88px}
.mdt .chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
.mdt .chips::-webkit-scrollbar{display:none}
.mdt .chip{font:inherit;font-size:12.5px;font-weight:500;white-space:nowrap;padding:7px 13px;border-radius:999px;border:1px solid var(--linea);background:var(--bl);color:var(--gris);cursor:pointer;transition:background-color .15s,color .15s,border-color .15s}
.mdt .chip.on{background:var(--neg);color:#fff;border-color:var(--neg)}

/* avatar */
.mdt .av{border-radius:50%;display:grid;place-items:center;font-weight:600;letter-spacing:-.02em;color:#fff;flex:0 0 auto}

/* escrow — elemento distintivo */
.mdt .escrow{background:var(--neg);color:#fff;border-radius:var(--r);padding:16px;margin-bottom:10px;position:relative;overflow:hidden}
.mdt .escrow .amt{font-family:'JetBrains Mono',monospace;font-size:27px;font-weight:500;letter-spacing:-.045em}
.mdt .track{display:flex;gap:3px;margin-top:14px}
.mdt .seg{flex:1;height:4px;border-radius:2px;background:#3A3A44}
.mdt .seg.on{background:var(--nar)}
.mdt .seg.done{background:var(--ok)}
.mdt .seg.bad{background:var(--err)}

/* varios */
.mdt .sep{height:1px;background:var(--linea);margin:12px 0}
.mdt .stars{display:inline-flex;gap:1px;align-items:center}
.mdt .empty{text-align:center;padding:44px 22px;color:var(--gris)}
.mdt .toast{position:absolute;left:16px;right:16px;bottom:82px;background:var(--neg);color:#fff;padding:12px 16px;border-radius:14px;font-size:13.5px;font-weight:500;z-index:60;animation:up .22s ease}
@keyframes up{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.mdt .sheet-bg{position:absolute;inset:0;background:rgba(10,10,12,.55);z-index:50;display:flex;align-items:flex-end;animation:fade .18s ease}
@keyframes fade{from{opacity:0}to{opacity:1}}
.mdt .sheet{background:var(--bl);width:100%;border-radius:20px 20px 0 0;padding:18px;max-height:88%;overflow-y:auto;animation:up .25s cubic-bezier(.2,.9,.3,1)}
.mdt .dot{width:8px;height:8px;border-radius:50%;background:var(--nar);flex:0 0 auto}
.mdt .bubble{max-width:78%;padding:9px 14px;border-radius:18px;font-size:14px;line-height:1.4}
.mdt .bu-me{background:var(--nar);color:#fff;border-bottom-right-radius:5px;align-self:flex-end}
.mdt .bu-ot{background:var(--bl);border:1px solid var(--linea);border-bottom-left-radius:5px;align-self:flex-start}
.mdt .kv{display:flex;justify-content:space-between;gap:12px;padding:8px 0;font-size:13.5px;border-bottom:1px solid var(--linea)}
.mdt .kv:last-child{border-bottom:0}
.mdt .kv b{font-weight:600}
.mdt .switch{display:flex;background:var(--grafito);border-radius:999px;padding:3px;gap:2px}
.mdt .switch button{flex:1;font:inherit;font-size:13px;font-weight:500;letter-spacing:-.01em;border:0;background:transparent;color:#A9A9B4;padding:8px 10px;border-radius:999px;cursor:pointer;transition:background .16s,color .16s}
.mdt .switch button.on{background:var(--nar);color:#fff;font-weight:600}
.mdt .switch button.on.adm{background:var(--bl);color:var(--neg)}
.mdt .splash{position:absolute;inset:0;background:var(--neg);z-index:99;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px}
.mdt .bar{width:120px;height:3px;background:#33333C;border-radius:2px;overflow:hidden}
.mdt .bar i{display:block;height:100%;background:var(--nar);animation:load 1.5s ease forwards}
@keyframes load{from{width:0}to{width:100%}}
.mdt .pop{animation:pop .4s cubic-bezier(.2,1.3,.4,1)}
@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:none}}
.mdt .corre{animation:corre .8s cubic-bezier(.2,.9,.3,1) both}
@keyframes corre{from{opacity:0;transform:translateX(-26px)}to{opacity:1;transform:none}}
.mdt .cat{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--gris)}
.mdt .catbox{width:26px;height:26px;border-radius:8px;background:var(--nar-luz);display:grid;place-items:center;flex:0 0 auto}
.mdt .dist{display:inline-flex;align-items:center;gap:3px;font-size:11px;font-weight:500;color:var(--nar-osc);background:var(--nar-luz);padding:2px 8px;border-radius:999px}
@media (prefers-reduced-motion:reduce){.mdt *{animation:none!important;transition:none!important}}
.mdt button:focus-visible,.mdt input:focus-visible,.mdt .card.tap:focus-visible{outline:2px solid var(--neg);outline-offset:2px}
`;

/* ═══════════ ICONOS ═══════════ */
const P = {
  home: "M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3",
  plus: "M12 5v14M5 12h14",
  chat: "M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12Z",
  user: "M20 21v-2a6 6 0 0 0-12 0v2M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  list: "M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01",
  bell: "M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  wallet: "M3 7h15a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Zm0 0a2 2 0 0 1 2-2h11M17 13h.01",
  lock: "M5 11h14v10H5V11Zm3 0V7a4 4 0 1 1 8 0v4",
  star: "m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z",
  back: "M15 5l-7 7 7 7",
  chevron: "M9 5l7 7-7 7",
  check: "M4 12.5 9.5 18 20 6.5",
  x: "M6 6l12 12M18 6L6 18",
  shield: "M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6l8-3Z",
  pin: "M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  gear: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5a8 8 0 0 0-.2-1.7l2-1.5-2-3.5-2.4 1a8 8 0 0 0-3-1.7L14 2h-4l-.4 2.6a8 8 0 0 0-3 1.7l-2.4-1-2 3.5 2 1.5a8 8 0 0 0 0 3.4l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 3 1.7L10 22h4l.4-2.6a8 8 0 0 0 3-1.7l2.4 1 2-3.5-2-1.5c.1-.6.2-1.1.2-1.7Z",
  send: "M4 12 20 4l-7 16-2-6-7-2Z",
  db: "M12 7c4.4 0 8-1.1 8-2.5S16.4 2 12 2 4 3.1 4 4.5 7.6 7 12 7Zm8-2.5v15c0 1.4-3.6 2.5-8 2.5s-8-1.1-8-2.5v-15M20 12c0 1.4-3.6 2.5-8 2.5S4 13.4 4 12",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3.5 2",
  paper: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Zm0 0v5h5",
  logout: "M15 17l5-5-5-5M20 12H9M11 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h5",
  trash: "M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13",
  edit: "M4 20h4L19 9a2.8 2.8 0 1 0-4-4L4 16v4Z",
  wrench: "M15.5 3.5a5.5 5.5 0 0 0-6.8 7L3 16.2V21h4.8l5.7-5.7a5.5 5.5 0 0 0 7-6.8l-3.2 3.2-2.8-.7-.7-2.8 3.2-3.2Z",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  leaf: "M4 20c0-9 6-14 16-15 1 10-4 16-12 16H4Zm2-2c3-4 6-6 9-8",
  paw: "M8.5 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm7 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-11 4a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Zm15 0a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6ZM12 13c-3 0-5 2.4-5 4.6C7 19.5 8.4 21 10 21c.8 0 1.4-.4 2-.4s1.2.4 2 .4c1.6 0 3-1.5 3-3.4C17 15.4 15 13 12 13Z",
  box: "M3 8 12 3l9 5v8l-9 5-9-5V8Zm0 0 9 5m0 0 9-5m-9 5v8",
};
const Ic = ({ n, s = 20, c = "currentColor", w = 1.9, fill = "none" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={P[n]} />
  </svg>
);

/* ═══════════ MARCA ═══════════
   Isotipo vectorizado a partir del logo original del equipo:
   la figura corriendo con la caja y la llave forma la M de Mandadito. */
const LOGO_D = "M 654 0.6 c-16.1 2.3-21.1 4.2-31.5 11.7-6.7 4.9-16.8 18-18.2 23.7-0.3 1.4-1 3-1.4 3.6-5.4 6.9-6.5 29.3-1.9 39.9 0.5 1.1 1.5 4 2.1 6.5 0.7 2.5 2.3 5.8 3.6 7.3 1.3 1.6 2.3 3.4 2.3 4 0 3.2 21.3 21.7 25 21.7 0.4-0 2.1 0.7 3.6 1.5 1.6 0.8 3.6 1.5 4.5 1.5 0.8-0 1.9 0.4 2.5 0.9 2.7 2.7 22.8 2.4 29.4-0.3 3.6-1.5 8-3.2 9.8-3.7 1.8-0.6 3.6-1.7 3.9-2.5 0.3-0.8 1.1-1.4 1.7-1.4 1.7-0 11.5-9.4 15.2-14.5 4-5.5 7.5-13.2 10.4-23.1 1.6-5.2 0.8-26.5-1.1-31.1-1.7-4.1 0.4-6.8 5.9-7.8 9.3-1.7 23.2-13.6 23.2-19.9 0-4.5-6.2-9.6-11.8-9.6-2.8-0-14.2 2.8-15.7 3.9-6.9 4.8-16.7 4.8-23.2-0-8.4-6.3-16.5-9.9-26.9-11.8-6-1.1-6.8-1.1-11.4-0.5 z M 566 51.6 c-4.7 1.4-12.8 3.6-18 5-5.2 1.3-13.5 3.7-18.5 5.3-11.1 3.6-35.2 10.8-42.3 12.7-3 0.8-6.3 2.1-7.5 2.9-4.6 3.2 1.1 3.2 24.8-0 18.5-2.4 41.1-4.5 51-4.6 5-0 12.4-0.6 16.5-1.3 l 7.5-1.2-0.4-9.9 c-0.5-13.4 0.5-12.8-13.1-8.9 z M 790.7 86.7 c-1.3 1.3-0.7 3.5 2.3 7.8 1.7 2.4 3 4.7 3 5 0 0.4 0.9 1.8 2 3.2 1.6 2 2 4.1 2 9.5 l 0 6.8-4.7 3 c-5.3 3.4-9.3 3.7-14.1 1.2-3.6-1.9-4.2-2.8-9.7-13.9-4.9-9.7-7.7-10.5-10.9-2.9-8 19.3 6.9 47.6 25.2 47.6 4.5-0 9.1 2.8 11.1 6.8 1.1 2.1 3.1 5.2 4.5 7.1 3.3 4.4 3.3 8 0.1 16.6-4 10.4-5.2 12.3-10.4 15.8-9.4 6.2-31.6 21-34.1 22.7-5 3.4-16.2 6.3-21.3 5.6-6.3-1-7-1.7-31.2-33-3.3-4.3-8.9-11.4-12.5-15.8-3.6-4.4-7.1-9-7.9-10.2-8.8-13.1-32.9-29.5-48.9-33.2-9.8-2.3-28-0.3-36.1 4-1.7 0.9-4.5 2.4-6.3 3.3-7.5 3.9-24.5 24.3-26.3 31.6-0.4 1.5-1 2.7-1.4 2.7-1.1-0-4.5 6.6-9.6 18.5-2.6 6-6.1 14.1-8 18-6.8 14.4-11.5 24.7-11.5 25.5 0 0.6-4.7 11.5-8.5 19.5-2.7 5.9-7.2 18.1-9.9 27-4.5 15-5.3 16-8.2 10.3-1.8-3.5-6.7-19.9-7.5-25.3 0-0.6-0.9-2.6-1.8-4.5-1-1.9-2.7-6.7-3.8-10.5-1.1-3.9-3.3-11.3-4.8-16.5-1.6-5.2-3.4-10.9-4.1-12.5-0.7-1.7-2.9-8.2-4.9-14.5-10.4-33.1-26-58.6-40.9-66.9-14.7-8.3-62.8-8.8-99.2-1.1-5.5 1.2-11.2 2.3-12.9 2.6-1.6 0.3-6.8 1.4-11.5 2.4-4.7 1-12.5 2.4-17.5 3-4.9 0.6-10.9 1.5-13.3 2-2.3 0.6-5.2 1-6.3 1-1.1-0-4.4 1.1-7.2 2.4-2.9 1.3-6.2 2.7-7.5 3-5.3 1.7-23.2 19-23.2 22.4 0 1.1-4.8 9.4-10.7 18.7-2.1 3.3-4.4 7.3-5.2 9-1.7 3.5-12.4 25.2-13.8 28.1-2.9 5.6-8.5 18-8.9 19.4-0.9 3.9-3.7 10.7-5 12.1-0.8 0.8-1.4 2.1-1.4 2.8 0 0.6-0.6 2.2-1.4 3.4-0.8 1.2-2.2 4.9-3.1 8.2-5.6 20.2-4.3 27.2 6.5 35.6 18.2 14 35.3 2.4 39.2-26.6 1.7-12.4 0.4-9.9 21-39 1.6-2.2 4.7-6.7 6.9-10 8.4-12.3 19-24 23.3-25.9 3.1-1.4 8.3-2.5 20.6-4.6 3.6-0.6 8.2-1.6 10.3-2.2 2.1-0.7 8.8-1.2 14.9-1.2 12.4-0.1 14.5 1 13.3 6.9-0.3 1.6-1 5.9-1.5 9.5-0.4 3.6-1.3 9-1.9 12-2.6 13.5-4.2 22.2-5.6 31-0.9 5.2-2.2 12.2-3 15.5-1.1 5-2.3 11.4-3 17-0.1 0.5-0.5 2.6-0.8 4.5-0.4 1.9-0.9 5.7-1.2 8.4-0.3 2.7-0.8 5.2-1 5.5-0.1 0.3-0.6 2.4-1 4.6-0.4 2.2-1 6.2-1.5 9-0.5 2.7-1.3 7.7-1.9 11-0.5 3.3-1.6 8.5-2.4 11.5-0.8 3-2 8.4-2.6 12-0.7 3.6-1.6 8.1-2.1 10-1.5 6.4-4.5 25.5-6 39-4.4 37.8-10.3 52.9-22.5 56.7-6.6 2-29.7 0.6-40.5-2.5-10.3-3-17.2-5.2-23-7.5-28.8-11.2-35-13.4-45.2-16.2 l-8.8-2.3-3 3.6 c-1.6 2-3 4.3-3 5.2 0 0.8-0.7 2.8-1.6 4.5-0.9 1.6-3.2 7-5.1 12-2 4.9-4 9.4-4.4 9.9-0.5 0.6-0.9 1.6-0.9 2.4 0 1.3-1.2 4.1-9.2 21.2-1.7 3.6-4.9 11.2-7.3 17-2.3 5.8-5.7 13.5-7.5 17.2-4.8 9.8-1.9 12 12.9 10 13.3-1.9 41.1-20.5 46.7-31.4 2.9-5.6 7.9-5.7 16.4-0.3 6.6 4.1 23.5 12.4 34.6 16.9 57.8 23.5 101 15 125-24.5 7.9-12.9 12.1-24.6 24.3-67.4 2.7-9.4 5.3-18.4 5.9-20 0.6-1.7 2-6.4 3.1-10.5 1.2-4.1 3.6-12.9 5.5-19.5 1.8-6.6 4.4-15.8 5.6-20.5 1.2-4.7 3-11.4 4-15 1-3.6 2.3-8.8 2.9-11.5 0.6-2.8 2.4-10.6 4.1-17.5 1.6-6.9 3.6-15.7 4.5-19.5 1.1-4.5 2.6-8 4.3-9.7 l 2.5-2.8 2.9 3.2 c 1.5 1.7 3 3.9 3.3 4.9 0.3 1 2.8 5.7 5.5 10.4 2.8 4.7 5 8.9 5 9.3 0 0.4 1.6 3.8 3.5 7.7 1.9 3.8 5.4 12.8 7.8 20 2.5 7.1 6.8 19.5 9.7 27.5 2.9 8 7.2 20.3 9.6 27.5 2.5 7.1 5.2 14.7 6.1 16.8 4.3 9.9 17.9 9.8 33.3-0.1 12.2-7.9 15.8-11.8 25.2-27.7 3.6-6.1 13.8-29.5 13.8-31.7 0-0.7 1.4-3.8 3.1-6.8 6.5-11.3 8.4-15 17.9-34 5.4-10.7 10.3-21.3 11-23.5 0.7-2.2 2.3-5.8 3.5-8 1.3-2.2 5.5-10.3 9.5-18 8.6-16.9 13.3-22.5 17.4-20.9 1.5 0.6 1.6 2.7 0.2 6.4-0.9 2.4-1.5 8.4-2.6 25-1 15.7-1.5 19.7-4.3 37.5-2.6 16.3-3.6 25.2-4.8 41-0.6 8.2-1.5 16.3-2 17.9-2.3 7.3-0.9 16.3 4 25.5 5.1 9.8 38.2 59.6 46.7 70.2 3.7 4.6 7.4 9.5 8.3 10.9 0.9 1.4 3 4.4 4.8 6.8 1.8 2.4 3.3 4.8 3.3 5.3 0 0.6 1 2.5 2.3 4.2 1.3 1.8 4.5 7.5 7.1 12.7 5 9.8 10.4 19.2 14.2 24.5 1.2 1.6 2.8 4.3 3.6 6 3.1 6.3 5.3 9.5 6.6 9.5 1-0 22.9-17.5 25.2-20.1 0.3-0.3 5.9-4.6 12.5-9.6 6.6-5.1 14.5-11.1 17.5-13.4 7.7-6 27-18.7 37.8-24.8 2.4-1.4 0-4.2-6.2-7.3-9.4-4.7-28.7-3-38.6 3.6-1.9 1.3-5.6 3.5-8.2 4.9 l-4.8 2.5-5.4-5.1 c-6.7-6.4-15.5-21.2-30.4-51.6-17.6-35.8-21-43.8-22.2-52.1-0.6-4.1-1.6-10.2-2.3-13.5-3.1-16-0.6-53.5 5-75.5 0.7-3 1.6-7.1 1.9-9 0.3-1.9 1-5.3 1.5-7.5 0.4-2.2 0.9-6.1 0.9-8.8 0-7.4 0-7.4 13.6 13.1 4.6 7.1 11.8 14.2 14.3 14.2 0.6-0 2 0.5 3 1.2 1.9 1.2 8.1 0.3 17.1-2.4 13.5-4 30-15.9 56.5-40.5 24.4-22.7 32-29.3 32.9-28.2 5.9 7.4 6.6 10.8 3.6 18.9-6.5 17.7 7.8 39.2 28.5 43.3 5.9 1.1 6.1-0.4 1.1-9.1-2.5-4.5-4.6-8.8-4.6-9.6 0-0.8-0.4-1.8-1-2.1-1.2-0.7-1.3-9.4-0.2-11.2 1.2-1.8 8.1-6.3 9.8-6.3 6.9-0 11.4 3.2 17 12 8.1 12.9 13.2 12.4 13.5-1.3 0.6-25.4-7.8-35.9-34-42.4-5-1.2-8.1-6.9-6.2-11.5 1.9-4.6 2.8-11.7 2-15.3-0.4-1.7-1-4.7-1.4-6.8-0.3-2-1.2-3.7-1.8-3.7-0.7-0-1.8-1.5-2.5-3.3-2.5-6.8-14.3-17.7-19.3-17.7-4.3-0-4.5-0.1-7.3-5.3-1.6-2.8-4.2-7.4-5.9-10.1 l-3.1-4.9 1.7-6.1 c 0.9-3.3 2-7 2.3-8.1 3.8-13-4.8-32-16.8-36.9-2.3-1-5.1-2.2-6-2.7-2.1-1-9.2-1.2-10.1-0.2 z M 567.5 94.6 c-4.9 1.4-14.6 3.8-21.5 5.5-14.2 3.4-19.6 5.1-24.8 7.9 l-3.7 1.9 35-0.5 c 45.3-0.6 45.4-0.6 39-8.2-1.4-1.7-2.5-3.7-2.5-4.5 0-4.9-8.2-5.7-21.5-2.1 z M 197.4 232 c-11.1 2.7-23.1 6.9-25.6 8.9-1.3 1-3.4 2.2-4.8 2.6-1.4 0.4-4.1 1.6-6 2.7-1.9 1.2-6.2 3.5-9.5 5.3-13.5 7.3-14.5 8.3-14.5 14.8 0 1.8-0.9 7.7-2.1 13.2-1.1 5.5-2.2 12.2-2.4 15-0.2 2.7-0.8 7.5-1.5 10.5-0.6 3-1.5 8-1.9 11-0.5 3-1.6 9.1-2.5 13.5-1.6 7.6-2.5 12.3-4.8 24-0.5 2.7-1.4 7-1.9 9.4-1.2 5.5 0.8 7.3 11.1 10.1 2.5 0.6 15.5 4.7 29 9.1 13.5 4.3 30.8 9.9 38.5 12.4 7.7 2.4 23.9 7.8 36 12 25.2 8.6 23.2 8.2 26.7 5.2 1.5-1.2 6.9-4.8 12-8 5.1-3.1 11.3-7.3 13.8-9.2 2.5-1.8 7.5-5.3 11.2-7.7 5.2-3.3 6.9-5 7.4-7.3 0.3-1.7 0.9-4.4 1.4-6 1.1-3.8 3.7-17.6 4.5-23.5 0.5-4.4 1-6.7 2.1-12 0.2-1.4 0.7-4.4 0.9-6.6 0.3-2.3 1.8-9.3 3.4-15.5 1.6-6.3 3.3-13.7 3.6-16.4 0.4-2.8 1.3-7 2-9.5 2.5-8.4 2.8-13.5 0.8-15.7-1.7-2.1-17.3-8.3-20.6-8.3-0.9-0-1.9-0.5-2.2-1-0.3-0.6-1.8-1-3.2-1-2.7-0-12-2.5-16.8-4.5-9.6-3.9-13.4-4.5-16-2.2-5.5 5-3.1 10.4 5.5 12.3 1.4 0.3 3.4 0.9 4.5 1.4 1.1 0.5 5.4 2.1 9.5 3.6 14.2 5.2 14.5 7.4 1.8 14-11.1 5.7-21.4 7-29.8 3.9-10-3.7-12-2.8-12 5.1 0 4.8 0.9 5.8 6.6 7.3 6.2 1.7 13.8 10.1 13 14.4-1.2 6.3-2.6 15.3-3.6 21.7-0.5 3.6-1.9 12.6-3 20-1.2 7.4-2.5 16.2-3 19.6-1.6 12.9-7.4 15.5-22.6 10-9.2-3.3-23.4-8.6-25.9-9.7-1.1-0.4-4.5-1.5-7.5-2.4-9.9-2.9-27.4-8.7-30.5-10-1.6-0.7-6.6-2.3-11-3.5-16.2-4.3-22.1-7.4-21-10.9 0.2-0.9 0.6-3.9 0.9-6.6 0.6-7.5 2.3-16.4 7.2-39.5 1.4-6.6 2.2-12.3 3.8-26.5 0.7-6.9 5.3-9 12.3-5.6 22.7 11.3 28 12 30.3 3.7 1.7-6.2 1.5-6.5-9-10.1-12.4-4.2-12.7-4.4-13.4-6.2-1.4-3.6 6.7-8.5 23.9-14.2 l 11.8-4 3.4-6.2 c 5-9.2 3.3-10.4-10.3-6.9 z M 109 261 c-1.9 0.5-9.4 2-16.7 3.4-7.3 1.4-14.9 3.2-17 4-2.1 0.7-6.3 1.9-9.3 2.6-6.3 1.3-26.2 7.6-30 9.3-3.7 1.8 8.9 2.1 27 0.8 8-0.6 23-1.3 33.3-1.7 12.7-0.4 19-1 19.2-1.8 0.2-0.6 0.5-4.8 0.7-9.4 0.4-9.1 0.5-9-7.2-7.2 z M 105.5 309.7 c-1.1 0.2-3.1 0.8-4.5 1.3-1.4 0.4-8.8 2.3-16.5 4.1-7.7 1.7-19.4 4.7-26 6.7-6.6 1.9-15.1 4.3-18.8 5.3-3.7 1-11.8 3.2-18 4.9-25.3 6.9-27.3 8.3-9.7 6.9 18.5-1.5 37.8-2.8 65.4-4.5 30.1-1.8 29.4-1.6 30.2-5.3 0.2-1.4 0.9-4.2 1.4-6.1 3.1-12.6 2.6-14.7-3.5-13.3 z M 152.5 400.4 c-4.4 1.3-14.1 4-21.5 6.1-7.4 2-16.6 4.7-20.5 6-12 3.8-20.7 6.3-28.5 8.1-4.1 0.9-11.3 2.8-16 4.1-4.7 1.4-10.3 2.9-12.5 3.4-2.2 0.6-4.4 1.5-5 2.1-0.7 0.7-0.2 0.9 1.5 0.5 3.6-0.9 30.5-2.6 57-3.8 12.4-0.5 26.1-1.4 30.5-1.9 4.4-0.5 13.4-1.4 20-1.9 6.6-0.6 16.1-1.5 21-2.1 5-0.6 13.1-1.4 18.1-1.9 9.4-0.8 11.4-1.4 11.4-3.5 0-2.1-20.1-10.5-32.5-13.6-2.7-0.7-6.2-1.9-7.7-2.7-3.6-1.7-5.8-1.6-15.3 1.1 z";

const Runner = ({ h = 24, c = "currentColor", style }) => (
  <svg height={h} viewBox="0 0 900 557" style={{ display: "block", overflow: "visible", ...style }} aria-hidden="true">
    <path fillRule="evenodd" fill={c} d={LOGO_D} />
  </svg>
);

/* líneas de velocidad del logo, reutilizadas como recurso gráfico */
const Lineas = ({ w = 40, c = "var(--nar)", o = 1, style }) => (
  <svg width={w} viewBox="0 0 80 46" fill={c} opacity={o} style={{ display: "block", ...style }} aria-hidden="true">
    <path d="M0 10 60 0 60 6Z" /><path d="M18 26 78 16 78 22Z" /><path d="M4 42 64 32 64 38Z" />
  </svg>
);

const Marca = ({ h = 24, c = "#fff", acento = "var(--nar)" }) => (
  <span className="row" style={{ gap: Math.round(h * 0.34) }}>
    <Runner h={h} c={acento} />
    <span className="wordmark" style={{ color: c, fontSize: Math.round(h * 0.92) }}>
      Mandad<span style={{ color: acento }}>i</span>to
    </span>
  </span>
);

/* ═══════════ UTILIDADES ═══════════ */
const AV = ["#FF6A00", "#111114", "#2F6FED", "#1B9E5A", "#8B3DBE", "#D64545"];
const money = (n) => "$U " + Number(n || 0).toLocaleString("es-UY", { maximumFractionDigits: 0 });
const iso = () => new Date().toISOString();
const fdate = (s, full) => {
  const d = new Date(s);
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}${full ? "/" + d.getFullYear() : ""} ${p(d.getHours())}:${p(d.getMinutes())}`;
};
const ago = (s) => {
  const m = Math.floor((Date.now() - new Date(s)) / 60000);
  if (m < 1) return "recién";
  if (m < 60) return `hace ${m} min`;
  if (m < 1440) return `hace ${Math.floor(m / 60)} h`;
  return `hace ${Math.floor(m / 1440)} d`;
};
const nextId = (arr, k) => arr.reduce((m, r) => Math.max(m, r[k]), 0) + 1;

/* distancia entre usuarios.latitud/longitud y tareas.latitud/longitud */
const km = (a, b, c, d) => {
  if ([a, b, c, d].some((v) => v == null)) return null;
  const R = 6371, r = Math.PI / 180;
  const dl = (c - a) * r, dg = (d - b) * r;
  const x = Math.sin(dl / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin(dg / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(x));
};
const fkm = (v) => (v == null ? "" : v < 1 ? `${Math.round(v * 1000)} m` : `${v.toFixed(1)} km`);

/* proyección local plana: convierte una diferencia de coordenadas en km al norte y al este */
const proyectar = (lat0, lng0, lat, lng) => {
  const kx = (lng - lng0) * 111.32 * Math.cos((lat0 * Math.PI) / 180);
  const ky = (lat - lat0) * 110.57;
  return { kx, ky, d: Math.hypot(kx, ky) };
};

/* zona operativa de la plataforma: la define el administrador y limita el resto */
const ZONA_0 = { nombre: "Maldonado y alrededores", latitud: -34.9011, longitud: -54.9581, radio_km: 30 };

const PUNTOS_DEMO = [
  { n: "Maldonado, centro", lat: -34.9011, lng: -54.9581 },
  { n: "Punta del Este", lat: -34.9598, lng: -54.9502 },
  { n: "San Carlos", lat: -34.7906, lng: -54.9207 },
  { n: "Piriápolis", lat: -34.8686, lng: -55.2769 },
];

/* categorías: mandados y oficios, según el planteo del proyecto */
const CATS = {
  Compras: "list", Trámites: "paper", Hogar: "home", Fontanería: "wrench",
  Electricidad: "bolt", Jardinería: "leaf", Mascotas: "paw", Mudanzas: "box", Otros: "star",
};
const mpId = () => String(Math.floor(1e11 + Math.random() * 8e11));
const prefId = () => `${Math.floor(1e8 + Math.random() * 8e8)}-${Math.random().toString(36).slice(2, 6)}-${Math.random().toString(36).slice(2, 6)}`;

/* estados de tarea → etiqueta, clase y posición en la línea de tiempo */
const EST = {
  pendiente:  { t: "Pendiente",   c: "b-pend", step: 0 },
  asignada:   { t: "Asignada",    c: "b-asig", step: 1 },
  pagada:     { t: "Pagada",      c: "b-paga", step: 2 },
  en_progreso:{ t: "En progreso", c: "b-prog", step: 2 },
  completada: { t: "Completada",  c: "b-comp", step: 3 },
  finalizada: { t: "Finalizada",  c: "b-fin",  step: 4 },
  en_disputa: { t: "En disputa",  c: "b-disp", step: 3 },
  cancelada:  { t: "Cancelada",   c: "b-canc", step: 0 },
};
const EST_PAGO = {
  pendiente:  { t: "Pendiente", col: "var(--alerta)" },
  aprobado:   { t: "Aprobado — retenido", col: "var(--nar)" },
  rechazado:  { t: "Rechazado", col: "var(--err)" },
  cancelado:  { t: "Cancelado", col: "var(--gris)" },
  retenido:   { t: "Retenido por disputa", col: "var(--err)" },
  liberado:   { t: "Liberado", col: "var(--ok)" },
  reembolsado:{ t: "Reembolsado", col: "var(--info)" },
};

/* ═══════════ DATOS INICIALES ═══════════ */
const T0 = Date.now();
const h = (n) => new Date(T0 - n * 3600000).toISOString();

const USUARIOS_0 = [
  { id_usuario: 1, nombre: "Lucía", apellido: "Ferrer", email: "lucia@mandadito.uy", password: "123456", telefono: "094 512 330", rol: "ambos", fecha_registro: h(2200), latitud: -34.9011, longitud: -54.9581, tareas_realizadas: 12, tareas_canceladas: 1, radio_km: 10 },
  { id_usuario: 2, nombre: "Martín", apellido: "Silva", email: "martin@mail.uy", password: "123456", telefono: "099 244 118", rol: "repartidor", fecha_registro: h(3400), latitud: -34.9088, longitud: -54.9445, tareas_realizadas: 47, tareas_canceladas: 2, radio_km: 15 },
  { id_usuario: 3, nombre: "Camila", apellido: "Rossi", email: "camila@mail.uy", password: "123456", telefono: "091 780 902", rol: "repartidor", fecha_registro: h(1500), latitud: -34.8951, longitud: -54.9702, tareas_realizadas: 23, tareas_canceladas: 0, radio_km: 8 },
  { id_usuario: 4, nombre: "Diego", apellido: "Pereira", email: "diego@mail.uy", password: "123456", telefono: "098 331 445", rol: "cliente", fecha_registro: h(900), latitud: -34.9123, longitud: -54.9388, tareas_realizadas: 0, tareas_canceladas: 0, radio_km: 12 },
  { id_usuario: 5, nombre: "Soporte", apellido: "Mandadito", email: "admin@mandadito.uy", password: "admin", telefono: "0800 6262", rol: "admin", fecha_registro: h(4000), latitud: -34.9011, longitud: -54.9581, tareas_realizadas: 0, tareas_canceladas: 0, radio_km: 30 },
  { id_usuario: 6, nombre: "Rodrigo", apellido: "Núñez", email: "rodrigo@mail.uy", password: "123456", telefono: "092 118 447", rol: "repartidor", fecha_registro: h(700), latitud: -34.7906, longitud: -54.9207, tareas_realizadas: 31, tareas_canceladas: 1, radio_km: 20 },
  { id_usuario: 7, nombre: "Valeria", apellido: "Duarte", email: "valeria@mail.uy", password: "123456", telefono: "095 662 019", rol: "repartidor", fecha_registro: h(1100), latitud: -34.9598, longitud: -54.9502, tareas_realizadas: 18, tareas_canceladas: 0, radio_km: 10 },
  { id_usuario: 8, nombre: "Nicolás", apellido: "Arce", email: "nicolas@mail.uy", password: "123456", telefono: "097 405 226", rol: "repartidor", fecha_registro: h(2600), latitud: -34.8686, longitud: -55.2769, tareas_realizadas: 9, tareas_canceladas: 3, radio_km: 25 },
  { id_usuario: 9, nombre: "Paula", apellido: "Méndez", email: "paula@mail.uy", password: "123456", telefono: "093 774 580", rol: "ambos", fecha_registro: h(1900), latitud: -34.7833, longitud: -55.2333, tareas_realizadas: 26, tareas_canceladas: 0, radio_km: 30 },
];

const TAREAS_0 = [
  { id_tarea: 1, titulo: "Retirar receta en farmacia del centro", descripcion: "Necesito que retiren una receta a nombre de Ferrer en la farmacia de Sarandí y Florida. Pago el medicamento aparte por transferencia.", direccion: "Sarandí 780, Maldonado", pago: 380, estado: "pendiente", cliente_id: 1, repartidor_id: null, fecha_creacion: h(3), latitud: -34.9018, longitud: -54.9562, categoria: "Trámites" },
  { id_tarea: 2, titulo: "Compra semanal en supermercado", descripcion: "Lista de 18 productos. Prefiero Ta-Ta de Roosevelt. Entrego lista por chat.", direccion: "Av. Roosevelt km 3, Punta del Este", pago: 900, estado: "asignada", cliente_id: 1, repartidor_id: 2, fecha_creacion: h(9), latitud: -34.9291, longitud: -54.9401, categoria: "Compras" },
  { id_tarea: 3, titulo: "Llevar documentación a la escribanía", descripcion: "Sobre cerrado, entrega en mano. Confirmar recepción con foto del sello.", direccion: "25 de Mayo 612, Maldonado", pago: 520, estado: "pagada", cliente_id: 4, repartidor_id: 3, fecha_creacion: h(20), latitud: -34.9042, longitud: -54.9587, categoria: "Trámites" },
  { id_tarea: 4, titulo: "Armar mueble de cocina", descripcion: "Mueble tipo alacena, 2 módulos. Herramienta propia necesaria.", direccion: "Barrio Cerro Pelado, Maldonado", pago: 1600, estado: "en_progreso", cliente_id: 1, repartidor_id: 3, fecha_creacion: h(28), latitud: -34.9155, longitud: -54.9264, categoria: "Hogar" },
  { id_tarea: 5, titulo: "Pasear dos perros por la tarde", descripcion: "Labrador y caniche, 45 minutos. Correa y bolsas las pongo yo.", direccion: "Rambla Claudio Williman", pago: 450, estado: "completada", cliente_id: 4, repartidor_id: 2, fecha_creacion: h(50), latitud: -34.9351, longitud: -54.9694, categoria: "Mascotas" },
  { id_tarea: 6, titulo: "Mudanza chica: 6 cajas y un escritorio", descripcion: "Del centro a Maldonado Nuevo. Se necesita vehículo utilitario.", direccion: "Ituzaingó 1102, Maldonado", pago: 2400, estado: "finalizada", cliente_id: 1, repartidor_id: 2, fecha_creacion: h(120), latitud: -34.9067, longitud: -54.9521, categoria: "Mudanzas" },
  { id_tarea: 7, titulo: "Buscar torta de cumpleaños encargada", descripcion: "Retiro a las 17:00 en punto. Transportar sin inclinar la caja.", direccion: "Confitería Los Aromos, Punta del Este", pago: 600, estado: "finalizada", cliente_id: 4, repartidor_id: 3, fecha_creacion: h(200), latitud: -34.9587, longitud: -54.9401, categoria: "Compras" },
  { id_tarea: 8, titulo: "Pintar reja del frente", descripcion: "6 metros lineales. Pintura y pincel los provee el cliente.", direccion: "Barrio Hipódromo, Maldonado", pago: 1800, estado: "en_disputa", cliente_id: 1, repartidor_id: 2, fecha_creacion: h(75), latitud: -34.8993, longitud: -54.9412, categoria: "Hogar" },
  { id_tarea: 9, titulo: "Destapar la pileta de la cocina", descripcion: "Desagota muy lento hace una semana. Ya probé con sopapa y no anda.", direccion: "Treinta y Tres 445, Maldonado", pago: 1100, estado: "pendiente", cliente_id: 4, repartidor_id: null, fecha_creacion: h(5), latitud: -34.9075, longitud: -54.9533, categoria: "Fontanería" },
  { id_tarea: 10, titulo: "Cortar el pasto del fondo", descripcion: "Terreno de 8 x 12 metros, pasto alto. Hay bordeadora en la casa.", direccion: "Barrio San Francisco, Maldonado", pago: 950, estado: "pendiente", cliente_id: 4, repartidor_id: null, fecha_creacion: h(11), latitud: -34.9214, longitud: -54.9147, categoria: "Jardinería" },
  { id_tarea: 11, titulo: "Cambiar dos tomacorrientes", descripcion: "Se aflojaron y hacen chispa al enchufar. Los materiales los compro yo.", direccion: "Rambla de Circunvalación, Maldonado", pago: 1350, estado: "pendiente", cliente_id: 4, repartidor_id: null, fecha_creacion: h(26), latitud: -34.8968, longitud: -54.9689, categoria: "Electricidad" },
  { id_tarea: 12, titulo: "Cuidar un gato el fin de semana", descripcion: "Dos visitas por día: comida, agua y limpiar la bandeja. Sábado y domingo.", direccion: "Maldonado Nuevo", pago: 800, estado: "pendiente", cliente_id: 4, repartidor_id: null, fecha_creacion: h(33), latitud: -34.9166, longitud: -54.9302, categoria: "Mascotas" },
  { id_tarea: 13, titulo: "Arreglar una canilla que pierde", descripcion: "Gotea de noche y no para. La casa queda a dos cuadras de la plaza.", direccion: "San Carlos, centro", pago: 1200, estado: "pendiente", cliente_id: 9, repartidor_id: null, fecha_creacion: h(6), latitud: -34.7912, longitud: -54.9188, categoria: "Fontanería" },
  { id_tarea: 14, titulo: "Podar dos árboles del jardín", descripcion: "Ramas bajas que dan a la vereda. Se necesita escalera y tijera de altura.", direccion: "Piriápolis, zona centro", pago: 2200, estado: "pendiente", cliente_id: 9, repartidor_id: null, fecha_creacion: h(14), latitud: -34.8674, longitud: -55.2751, categoria: "Jardinería" },
];

const PAGOS_0 = [
  { id: 1, tarea_id: 3, cliente_id: 4, repartidor_id: 3, monto: 520, estado: "aprobado", mercadopago_id: "112938475610", fecha: h(19) },
  { id: 2, tarea_id: 4, cliente_id: 1, repartidor_id: 3, monto: 1600, estado: "aprobado", mercadopago_id: "112938481022", fecha: h(27) },
  { id: 3, tarea_id: 5, cliente_id: 4, repartidor_id: 2, monto: 450, estado: "aprobado", mercadopago_id: "112938490033", fecha: h(49) },
  { id: 4, tarea_id: 6, cliente_id: 1, repartidor_id: 2, monto: 2400, estado: "liberado", mercadopago_id: "112938411890", fecha: h(119) },
  { id: 5, tarea_id: 7, cliente_id: 4, repartidor_id: 3, monto: 600, estado: "liberado", mercadopago_id: "112938402277", fecha: h(199) },
  { id: 6, tarea_id: 8, cliente_id: 1, repartidor_id: 2, monto: 1800, estado: "retenido", mercadopago_id: "112938455120", fecha: h(74) },
];

const CALIF_0 = [
  { id_calificaciones: 1, tarea_id: 6, cliente_id: 1, repartidor_id: 2, puntaje: 5, comentario: "Puntual y cuidadoso con todo. Cargó las cajas sin un rasguño.", fecha: h(118) },
  { id_calificaciones: 2, tarea_id: 7, cliente_id: 4, repartidor_id: 3, puntaje: 5, comentario: "Llegó antes de lo pactado y la torta impecable.", fecha: h(198) },
  { id_calificaciones: 3, tarea_id: 0, cliente_id: 4, repartidor_id: 2, puntaje: 4, comentario: "Buen trabajo, aunque avisó tarde que salía.", fecha: h(300) },
  { id_calificaciones: 4, tarea_id: 0, cliente_id: 1, repartidor_id: 3, puntaje: 5, comentario: "Muy prolija, la recomiendo.", fecha: h(420) },
  { id_calificaciones: 5, tarea_id: 0, cliente_id: 4, repartidor_id: 6, puntaje: 5, comentario: "Vino desde San Carlos sin drama y dejó todo funcionando.", fecha: h(340) },
  { id_calificaciones: 6, tarea_id: 0, cliente_id: 1, repartidor_id: 7, puntaje: 4, comentario: "Buen trabajo, se demoró un poco con el tránsito de la rambla.", fecha: h(260) },
  { id_calificaciones: 7, tarea_id: 0, cliente_id: 4, repartidor_id: 9, puntaje: 5, comentario: "Impecable. Cobra justo y explica lo que hace.", fecha: h(150) },
  { id_calificaciones: 8, tarea_id: 0, cliente_id: 1, repartidor_id: 8, puntaje: 3, comentario: "Resolvió, pero avisó tarde que llegaba.", fecha: h(500) },
];

const MENS_0 = [
  { id_mensaje: 1, emisor_id: 2, receptor_id: 1, mensaje: "Hola Lucía, ya acepté la compra. ¿Me pasás la lista?", fecha: h(8) },
  { id_mensaje: 2, emisor_id: 1, receptor_id: 2, mensaje: "Sí, te la mando ahora. Marca preferida de leche: Conaprole.", fecha: h(7.6) },
  { id_mensaje: 3, emisor_id: 2, receptor_id: 1, mensaje: "Perfecto. Salgo en 20 minutos.", fecha: h(7.2) },
  { id_mensaje: 4, emisor_id: 3, receptor_id: 1, mensaje: "Empecé con el mueble. Faltan las manijas, ¿las tenés?", fecha: h(2) },
];

const NOTIF_0 = [
  { id_notificacion: 1, id_usuario: 1, titulo: "Trabajo aceptado", mensaje: "Martín Silva aceptó tu tarea «Compra semanal en supermercado».", leida: false, fecha: h(8.5) },
  { id_notificacion: 2, id_usuario: 1, titulo: "Tarea en progreso", mensaje: "Camila Rossi comenzó «Armar mueble de cocina».", leida: false, fecha: h(2.4) },
  { id_notificacion: 3, id_usuario: 1, titulo: "Disputa abierta", mensaje: "El pago de «Pintar reja del frente» quedó retenido mientras se revisa el caso.", leida: true, fecha: h(70) },
];

const POSTUL_0 = [
  { id_postulacion: 1, tarea_id: 1, repartidor_id: 3, mensaje: "Vivo a cuatro cuadras de esa farmacia, lo hago en el día.", fecha: h(2), estado: "pendiente" },
];

const DISPUTAS_0 = [
  { id_disputa: 1, tarea_id: 8, abierta_por: 1, motivo: "El trabajo quedó incompleto: falta pintar el portón lateral y hay zonas sin cubrir.", estado: "abierta", resolucion: null, fecha: h(70) },
];
const EVID_0 = [
  { id_evidencia: 1, disputa_id: 1, usuario_id: 1, tipo: "foto", nota: "Foto del portón sin pintar.", fecha: h(70) },
  { id_evidencia: 2, disputa_id: 1, usuario_id: 2, tipo: "texto", nota: "El portón no estaba incluido en lo acordado por chat, solo la reja de 6 metros.", fecha: h(66) },
];

/* ═══════════ COMPONENTES CHICOS ═══════════ */
const Avatar = ({ u, s = 38 }) => (
  <div className="av" style={{ width: s, height: s, background: AV[(u?.id_usuario || 0) % AV.length], fontSize: s * 0.4 }}>
    {(u?.nombre?.[0] || "?") + (u?.apellido?.[0] || "")}
  </div>
);
const Badge = ({ e }) => {
  const x = EST[e] || EST.pendiente;
  return <span className={"badge " + x.c}>{x.t}</span>;
};
const Stars = ({ v, s = 13, editable, onPick }) => (
  <span className="stars">
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} onClick={editable ? () => onPick(i) : undefined} style={{ cursor: editable ? "pointer" : "default", lineHeight: 0 }}>
        <Ic n="star" s={editable ? 30 : s} c={i <= Math.round(v) ? "#FF6A00" : "#D9D6D2"} fill={i <= Math.round(v) ? "#FF6A00" : "none"} w={1.6} />
      </span>
    ))}
  </span>
);
const SinPermiso = () => (
  <div className="empty">
    <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><Ic n="lock" s={26} c="#C4C0BA" /></div>
    <h3>No tenés acceso a esta sección</h3>
    <p className="muted" style={{ marginTop: 6 }}>Está reservada al equipo de administración de Mandadito.</p>
  </div>
);

const Empty = ({ icon, t, d }) => (  <div className="empty">
    <div style={{ display: "flex", justifyContent: "center" }}><Runner h={38} c="#DAD7D3" /></div>
    <h3 style={{ marginTop: 14 }}>{t}</h3>
    <p className="muted" style={{ marginTop: 4 }}>{d}</p>
  </div>
);
const Field = ({ lb, hint, children }) => (
  <label className="f">
    <span className="lb">{lb}{hint && <span style={{ color: "var(--gris)", fontWeight: 400 }}> · {hint}</span>}</span>
    {children}
  </label>
);

/* ═══════════ RADAR DE COBERTURA ═══════════
   Mapa esquemático centrado en el usuario. No usa cartografía: proyecta
   las coordenadas reales de la base sobre un plano local, así el radio
   se entiende de un vistazo en vez de ser un número suelto. */
function Radar({ radio, escala, puntos = [], lado = 250, etiqueta }) {
  const c = lado / 2;
  const R = c - 22;
  /* escala no lineal (raíz cuadrada): amplía el centro, donde se acumula
     casi todo en una ciudad, sin perder de vista lo que está lejos */
  const rad = (d) => R * Math.sqrt(Math.min(d, escala) / escala);
  const anillos = [escala / 6, escala / 2, escala].map((a) => Math.round(a));
  const rr = rad(radio);
  return (
    <svg viewBox={`0 0 ${lado} ${lado}`} style={{ width: "100%", maxWidth: lado, display: "block", margin: "0 auto" }} role="img" aria-label={`Cobertura de ${radio} kilómetros`}>
      <circle cx={c} cy={c} r={R} fill="#F1EFEC" />
      {anillos.map((a, i) => (
        <g key={i}>
          <circle cx={c} cy={c} r={rad(a)} fill="none" stroke="#DCD8D3" strokeWidth="1" strokeDasharray="3 4" />
          <text x={c - rad(a) * 0.72} y={c + rad(a) * 0.72 + 4} fontSize="8" fill="#ADA9A3" fontFamily="JetBrains Mono, monospace" textAnchor="middle">{a}</text>
        </g>
      ))}
      <circle cx={c} cy={c} r={rr} fill="var(--nar)" fillOpacity=".14" stroke="var(--nar)" strokeWidth="2" />
      {puntos.map((p, i) => {
        const fuera = p.d > radio;
        const d = p.d || 0.001;
        const x = c + (p.kx / d) * rad(d), y = c - (p.ky / d) * rad(d);
        return p.tipo === "persona" ? (
          <circle key={i} cx={x} cy={y} r={fuera ? 3.6 : 5} fill={fuera ? "#C4C0BA" : "var(--neg)"} stroke="var(--bl)" strokeWidth="1.4">
            <title>{p.label} · {fkm(p.d)}</title>
          </circle>
        ) : (
          <rect key={i} x={x - 4} y={y - 4} width="8" height="8" rx="1.8" transform={`rotate(45 ${x} ${y})`}
            fill={fuera ? "#C4C0BA" : "var(--nar)"} stroke="var(--bl)" strokeWidth="1.4">
            <title>{p.label} · {fkm(p.d)}</title>
          </rect>
        );
      })}
      <circle cx={c} cy={c} r="5.5" fill="var(--bl)" stroke="var(--neg)" strokeWidth="2.4" />
      <g transform={`translate(${c + rr}, ${c})`}>
        <rect x="-19" y="-9" width="38" height="18" rx="9" fill="var(--nar)" />
        <text y="4" fontSize="10" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="JetBrains Mono, monospace">{radio}km</text>
      </g>
      {etiqueta && <text x={c} y={lado - 3} fontSize="8.5" textAnchor="middle" fill="#ADA9A3" fontFamily="JetBrains Mono, monospace">{etiqueta}</text>}
    </svg>
  );
}

/* control de radio reutilizable: radar + deslizador + resumen en vivo */
function ControlRadio({ radio, setRadio, max, puntos, resumen, etiqueta }) {
  const dentro = puntos.filter((p) => p.d <= radio);
  return (
    <div className="card">
      <Radar radio={radio} escala={max} puntos={puntos} etiqueta={etiqueta} />
      <div className="between" style={{ margin: "10px 0 6px" }}>
        <span className="eyebrow">Radio de búsqueda</span>
        <span className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--nar-osc)" }}>{radio} km</span>
      </div>
      <input type="range" min="1" max={max} value={radio} onChange={(e) => setRadio(Number(e.target.value))}
        style={{ padding: 0, border: 0, accentColor: "var(--nar)", height: 22 }} aria-label="Radio en kilómetros" />
      <div className="between" style={{ marginTop: 2 }}>
        <span className="tiny">1 km</span><span className="tiny">{max} km</span>
      </div>
      <div className="sep" />
      <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{resumen(dentro.length, puntos.length - dentro.length)}</p>
    </div>
  );
}

/* ═══════════ APLICACIÓN ═══════════ */
export default function MandaditoApp() {
  /* tablas */
  const [usuarios, setUsuarios] = useState(USUARIOS_0);
  const [tareas, setTareas] = useState(TAREAS_0);
  const [pagos, setPagos] = useState(PAGOS_0);
  const [califs, setCalifs] = useState(CALIF_0);
  const [mensajes, setMensajes] = useState(MENS_0);
  const [notifs, setNotifs] = useState(NOTIF_0);
  const [postuls, setPostuls] = useState(POSTUL_0);
  const [disputas, setDisputas] = useState(DISPUTAS_0);
  const [evids, setEvids] = useState(EVID_0);
  const [zona, setZona] = useState(ZONA_0);

  /* sesión y navegación */
  const [splash, setSplash] = useState(true);
  const [uid, setUid] = useState(null);
  const [rol, setRol] = useState("cliente");
  const [nav, setNav] = useState([{ s: "login" }]);
  const [toast, setToast] = useState(null);
  const [sheet, setSheet] = useState(null);
  const bodyRef = useRef(null);

  const cur = nav[nav.length - 1];
  const yo = usuarios.find((u) => u.id_usuario === uid);

  useEffect(() => { const t = setTimeout(() => setSplash(false), 1700); return () => clearTimeout(t); }, []);
  useEffect(() => { if (bodyRef.current) bodyRef.current.scrollTop = 0; }, [nav.length, cur.s]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t); }, [toast]);

  const go = (s, p = {}) => setNav((n) => [...n, { s, ...p }]);
  const back = () => setNav((n) => (n.length > 1 ? n.slice(0, -1) : n));
  const tabTo = (s) => setNav([{ s }]);
  const say = (m) => setToast(m);

  /* helpers de datos */
  const U = (id) => usuarios.find((u) => u.id_usuario === id);
  const nombreDe = (id) => { const u = U(id); return u ? `${u.nombre} ${u.apellido}` : "—"; };
  const pagoDe = (tid) => pagos.filter((p) => p.tarea_id === tid).slice(-1)[0] || null;
  const ratingDe = (rid) => {
    const r = califs.filter((c) => c.repartidor_id === rid);
    return r.length ? { prom: r.reduce((a, c) => a + c.puntaje, 0) / r.length, n: r.length } : { prom: 0, n: 0 };
  };
  const noLeidas = notifs.filter((n) => n.id_usuario === uid && !n.leida).length;

  /* ── radio y ubicación ── */
  const radioDe = (u) => Math.min(u?.radio_km ?? 10, zona.radio_km);
  const setRadio = (v) => setUsuarios((us) => us.map((u) => (u.id_usuario === uid ? { ...u, radio_km: v } : u)));
  const moverme = (lat, lng) => setUsuarios((us) => us.map((u) => (u.id_usuario === uid ? { ...u, latitud: lat, longitud: lng } : u)));
  const distA = (t) => km(yo?.latitud, yo?.longitud, t?.latitud, t?.longitud);

  /* Doble coincidencia: una tarea le aparece a un emprendedor solo si la
     distancia entra en el radio de los dos. El cliente decide hasta dónde
     quiere que lo atiendan; el emprendedor, hasta dónde quiere moverse. */
  const alcance = (t, u) => {
    const cli = usuarios.find((x) => x.id_usuario === t.cliente_id);
    const d = km(u?.latitud, u?.longitud, t.latitud, t.longitud);
    if (d == null) return { d, visible: true, limita: null };
    const rU = radioDe(u), rC = radioDe(cli);
    return { d, visible: d <= rU && d <= rC, limita: d > rU ? "vos" : d > rC ? "cliente" : null };
  };
  const enZona = (lat, lng) => km(zona.latitud, zona.longitud, lat, lng) <= zona.radio_km;

  const notificar = (idu, titulo, msg) =>
    setNotifs((ns) => [...ns, { id_notificacion: nextId(ns, "id_notificacion"), id_usuario: idu, titulo, mensaje: msg, leida: false, fecha: iso() }]);

  const setTarea = (tid, patch) => setTareas((ts) => ts.map((t) => (t.id_tarea === tid ? { ...t, ...patch } : t)));
  const setPago = (pid, patch) => setPagos((ps) => ps.map((p) => (p.id === pid ? { ...p, ...patch } : p)));

  /* ── acciones del dominio ── */
  const crearTarea = (d) => {
    const id = nextId(tareas, "id_tarea");
    setTareas((ts) => [...ts, { id_tarea: id, ...d, estado: "pendiente", cliente_id: uid, repartidor_id: null, fecha_creacion: iso(), latitud: -34.9011, longitud: -54.9581 }]);
    say("Tarea publicada");
    setNav([{ s: "home" }, { s: "tarea", id }]);
  };
  const editarTarea = (id, d) => { setTarea(id, d); say("Cambios guardados"); back(); };
  const eliminarTarea = (id) => { setTareas((ts) => ts.filter((t) => t.id_tarea !== id)); setSheet(null); say("Publicación eliminada"); setNav([{ s: "home" }]); };

  const postularse = (tid, msg) => {
    setPostuls((ps) => [...ps, { id_postulacion: nextId(ps, "id_postulacion"), tarea_id: tid, repartidor_id: uid, mensaje: msg, fecha: iso(), estado: "pendiente" }]);
    const t = tareas.find((x) => x.id_tarea === tid);
    notificar(t.cliente_id, "Nueva postulación", `${nombreDe(uid)} se postuló para «${t.titulo}».`);
    setSheet(null); say("Postulación enviada");
  };
  const aceptarPostulacion = (post) => {
    setTarea(post.tarea_id, { estado: "asignada", repartidor_id: post.repartidor_id });
    setPostuls((ps) => ps.map((p) => (p.id_postulacion === post.id_postulacion ? { ...p, estado: "aceptada" } : p.tarea_id === post.tarea_id ? { ...p, estado: "rechazada" } : p)));
    const t = tareas.find((x) => x.id_tarea === post.tarea_id);
    notificar(post.repartidor_id, "Te asignaron un trabajo", `Aceptaron tu postulación para «${t.titulo}».`);
    say("Emprendedor asignado. Ya podés pagar.");
  };
  const tomarTrabajo = (tid) => {
    const t = tareas.find((x) => x.id_tarea === tid);
    setTarea(tid, { estado: "asignada", repartidor_id: uid });
    notificar(t.cliente_id, "Trabajo aceptado", `${nombreDe(uid)} aceptó «${t.titulo}».`);
    say("Trabajo aceptado");
  };

  /* pagos con Mercado Pago (simulación del ciclo real) */
  const crearPreferencia = (t) => {
    const id = nextId(pagos, "id");
    const pref = prefId();
    setPagos((ps) => [...ps, { id, tarea_id: t.id_tarea, cliente_id: t.cliente_id, repartidor_id: t.repartidor_id, monto: t.pago, estado: "pendiente", mercadopago_id: null, fecha: iso(), preference_id: pref }]);
    go("checkout", { pagoId: id, id: t.id_tarea });
  };
  const resolverPago = (pagoId, resultado) => {
    const p = pagos.find((x) => x.id === pagoId);
    const t = tareas.find((x) => x.id_tarea === p.tarea_id);
    if (resultado === "aprobado") {
      setPago(pagoId, { estado: "aprobado", mercadopago_id: mpId() });
      setTarea(t.id_tarea, { estado: "pagada" });
      notificar(t.repartidor_id, "Pago acreditado", `El cliente pagó «${t.titulo}». El dinero queda retenido hasta que confirme la entrega.`);
      notificar(t.cliente_id, "Pago aprobado", `Se retuvieron ${money(p.monto)} para «${t.titulo}».`);
      say("Pago aprobado y retenido");
    } else if (resultado === "rechazado") {
      setPago(pagoId, { estado: "rechazado", mercadopago_id: mpId() });
      notificar(t.cliente_id, "Pago rechazado", `Mercado Pago rechazó el pago de «${t.titulo}».`);
      say("Pago rechazado");
    } else {
      setPago(pagoId, { estado: "cancelado" });
      say("Pago cancelado");
    }
    setNav((n) => [...n.filter((x) => x.s !== "checkout")]);
  };
  const iniciarTrabajo = (t) => { setTarea(t.id_tarea, { estado: "en_progreso" }); notificar(t.cliente_id, "Tarea en progreso", `${nombreDe(uid)} comenzó «${t.titulo}».`); say("Trabajo iniciado"); };
  const marcarCompletada = (t) => { setTarea(t.id_tarea, { estado: "completada" }); notificar(t.cliente_id, "Trabajo terminado", `${nombreDe(uid)} marcó «${t.titulo}» como completada. Confirmá para liberar el pago.`); say("Marcada como completada"); };
  const confirmarYLiberar = (t) => {
    const p = pagoDe(t.id_tarea);
    if (p) setPago(p.id, { estado: "liberado" });
    setTarea(t.id_tarea, { estado: "finalizada" });
    setUsuarios((us) => us.map((u) => (u.id_usuario === t.repartidor_id ? { ...u, tareas_realizadas: (u.tareas_realizadas || 0) + 1 } : u)));
    notificar(t.repartidor_id, "Pago liberado", `Se liberaron ${money(t.pago)} por «${t.titulo}».`);
    setSheet({ k: "calificar", t });
  };
  const abrirDisputa = (t, motivo) => {
    setDisputas((ds) => [...ds, { id_disputa: nextId(ds, "id_disputa"), tarea_id: t.id_tarea, abierta_por: uid, motivo, estado: "abierta", resolucion: null, fecha: iso() }]);
    setTarea(t.id_tarea, { estado: "en_disputa" });
    const p = pagoDe(t.id_tarea);
    if (p) setPago(p.id, { estado: "retenido" });
    const otro = uid === t.cliente_id ? t.repartidor_id : t.cliente_id;
    notificar(otro, "Se abrió una disputa", `«${t.titulo}» quedó en disputa. El pago sigue retenido hasta la revisión.`);
    setSheet(null); say("Disputa abierta. El pago queda retenido.");
  };
  const agregarEvidencia = (dispId, tipo, nota) => {
    setEvids((es) => [...es, { id_evidencia: nextId(es, "id_evidencia"), disputa_id: dispId, usuario_id: uid, tipo, nota, fecha: iso() }]);
    setSheet(null); say("Evidencia adjuntada");
  };
  const resolverDisputa = (d, aFavorDe) => {
    const t = tareas.find((x) => x.id_tarea === d.tarea_id);
    const p = pagoDe(d.tarea_id);
    if (aFavorDe === "repartidor") {
      if (p) setPago(p.id, { estado: "liberado" });
      setTarea(t.id_tarea, { estado: "finalizada" });
      setUsuarios((us) => us.map((u) => (u.id_usuario === t.repartidor_id ? { ...u, tareas_realizadas: (u.tareas_realizadas || 0) + 1 } : u)));
      notificar(t.repartidor_id, "Disputa resuelta a tu favor", `Se liberó el pago de «${t.titulo}».`);
      notificar(t.cliente_id, "Disputa resuelta", `Se liberó el pago de «${t.titulo}» al emprendedor.`);
    } else {
      if (p) setPago(p.id, { estado: "reembolsado" });
      setTarea(t.id_tarea, { estado: "cancelada" });
      setUsuarios((us) => us.map((u) => (u.id_usuario === t.repartidor_id ? { ...u, tareas_canceladas: (u.tareas_canceladas || 0) + 1 } : u)));
      notificar(t.cliente_id, "Reembolso emitido", `Se devolvieron ${money(t.pago)} por «${t.titulo}».`);
      notificar(t.repartidor_id, "Disputa resuelta", `Se reembolsó al cliente por «${t.titulo}».`);
    }
    setDisputas((ds) => ds.map((x) => (x.id_disputa === d.id_disputa ? { ...x, estado: "resuelta", resolucion: aFavorDe === "repartidor" ? "pago_liberado" : "reembolso" } : x)));
    say("Disputa resuelta");
  };
  const calificar = (t, puntaje, comentario) => {
    setCalifs((cs) => [...cs, { id_calificaciones: nextId(cs, "id_calificaciones"), tarea_id: t.id_tarea, cliente_id: t.cliente_id, repartidor_id: t.repartidor_id, puntaje, comentario, fecha: iso() }]);
    notificar(t.repartidor_id, "Nueva calificación", `Recibiste ${puntaje} estrellas por «${t.titulo}».`);
    setSheet(null); say("Calificación enviada");
  };
  const enviarMensaje = (para, txt) =>
    setMensajes((ms) => [...ms, { id_mensaje: nextId(ms, "id_mensaje"), emisor_id: uid, receptor_id: para, mensaje: txt, fecha: iso() }]);

  /* ═══ pantallas fuera de sesión ═══ */
  if (splash)
    return (
      <div className="mdt"><style>{CSS}</style>
        <div className="frame"><div className="splash">
          <div className="pop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, width: "100%", padding: "0 26px" }}>
            <div className="corre" style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center" }}>
              <Lineas w={54} c="var(--nar)" style={{ position: "absolute", left: 2, top: "34%" }} />
              <Runner h={104} c="#fff" />
            </div>
            <div className="wordmark" style={{ color: "#fff", fontSize: 38, marginTop: 4 }}>
              Mandad<span style={{ color: "var(--nar)" }}>i</span>to
            </div>
            <p style={{ color: "#7C7C88", fontSize: 11.5, letterSpacing: ".18em", textTransform: "uppercase", fontWeight: 700 }}> Pedí una mano · Ofrecé la tuya</p>
          </div>
          <div className="bar"><i /></div>
        </div></div>
      </div>
    );

  if (!uid) return <Auth {...{ nav, cur, go, back, usuarios, setUsuarios, setUid, setRol, setNav, say, toast }} />;

  /* ═══ sesión iniciada ═══ */
  const esAdmin = rol === "admin";
  const soyAdmin = yo?.rol === "admin";
  const tabsCliente = [
    { s: "home", i: "home", t: "Inicio" },
    { s: "mias", i: "list", t: "Mis tareas" },
    { s: "crear", i: "plus", t: "Publicar", mid: true },
    { s: "chats", i: "chat", t: "Mensajes" },
    { s: "perfil", i: "user", t: "Perfil" },
  ];
  const tabsRep = [
    { s: "home", i: "search", t: "Explorar" },
    { s: "mias", i: "list", t: "Trabajos" },
    { s: "ganancias", i: "wallet", t: "Ganancias" },
    { s: "chats", i: "chat", t: "Mensajes" },
    { s: "perfil", i: "user", t: "Perfil" },
  ];
  const tabsAdm = [
    { s: "admin", i: "shield", t: "Disputas" },
    { s: "zonaAdmin", i: "pin", t: "Zona" },
    { s: "datos", i: "db", t: "Datos" },
    { s: "perfil", i: "user", t: "Perfil" },
  ];
  const tabs = esAdmin ? tabsAdm : rol === "cliente" ? tabsCliente : tabsRep;

  const ctx = {
    yo, uid, rol, usuarios, tareas, pagos, califs, mensajes, notifs, postuls, disputas, evids,
    U, nombreDe, pagoDe, ratingDe, go, back, say, sheet, setSheet, cur, setNotifs, setUid, setNav, setRol,
    crearTarea, editarTarea, eliminarTarea, postularse, aceptarPostulacion, tomarTrabajo, crearPreferencia,
    resolverPago, iniciarTrabajo, marcarCompletada, confirmarYLiberar, abrirDisputa, agregarEvidencia,
    resolverDisputa, calificar, enviarMensaje, setPago, setTarea, setUsuarios,
    zona, setZona, radioDe, setRadio, moverme, distA, alcance, enZona,
  };

  const S = cur.s;
  const titulos = {
    home: rol === "cliente" ? "Inicio" : "Explorar tareas", mias: rol === "cliente" ? "Mis tareas" : "Mis trabajos",
    crear: cur.id ? "Editar tarea" : "Publicar tarea", chats: "Mensajes", perfil: "Perfil", tarea: "Detalle de tarea",
    ganancias: "Ganancias", notifs: "Notificaciones", config: "Configuración", califs: "Calificaciones",
    checkout: "Mercado Pago", historial: "Historial", admin: "Panel de disputas", datos: "Base de datos",
    disputa: "Disputa", chat: nombreDe(cur.con), perfilOtro: "Perfil público", pagosHist: "Historial de pagos",
    ubicacion: "Ubicación y radio", gente: "Gente cerca tuyo", zonaAdmin: "Zona operativa",
  };
  const conBack = !["home", "mias", "chats", "perfil", "ganancias", "admin", "datos", "zonaAdmin"].includes(S);

  return (
    <div className="mdt"><style>{CSS}</style>
      <div className="frame">
        {/* ── barra superior ── */}
        <header className="top">
          <div className="between" style={{ marginBottom: esAdmin || S === "checkout" ? 0 : 12 }}>
            <div className="row" style={{ gap: 9 }}>
              {conBack ? (
                <button onClick={back} className="btn btn-sm" style={{ background: "var(--grafito)", color: "#fff", padding: "7px 9px" }} aria-label="Volver">
                  <Ic n="back" s={17} />
                </button>
              ) : <Runner h={19} c="var(--nar)" />}
              <h2 style={{ color: "#fff", fontSize: 17 }}>{titulos[S] || "Mandadito"}</h2>
            </div>
            {!conBack && (
              <div className="row" style={{ gap: 6 }}>
                <button onClick={() => go("notifs")} className="btn btn-sm" style={{ background: "var(--grafito)", color: "#fff", padding: "8px", position: "relative" }} aria-label="Notificaciones">
                  <Ic n="bell" s={17} />
                  {noLeidas > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, background: "var(--nar)" }} />}
                </button>
                <button onClick={() => go("config")} className="btn btn-sm" style={{ background: "var(--grafito)", color: "#fff", padding: "8px" }} aria-label="Configuración">
                  <Ic n="gear" s={17} />
                </button>
              </div>
            )}
          </div>
          {!conBack && !esAdmin && yo?.rol !== "admin" && (
            <div className="switch">
              <button className={rol === "cliente" ? "on" : ""} onClick={() => { setRol("cliente"); setNav([{ s: "home" }]); }}>Cliente</button>
              <button className={rol === "repartidor" ? "on" : ""} onClick={() => { setRol("repartidor"); setNav([{ s: "home" }]); }}>Emprendedor</button>
            </div>
          )}
          {esAdmin && <div className="eyebrow" style={{ color: "var(--nar)", marginTop: 2 }}>Modo administrador</div>}
        </header>

        {/* ── contenido ── */}
        <main className="body" ref={bodyRef}>
          {S === "home" && (rol === "cliente" ? <HomeCliente {...ctx} /> : <HomeRepartidor {...ctx} />)}
          {S === "mias" && <MisTareas {...ctx} />}
          {S === "crear" && <FormTarea {...ctx} />}
          {S === "tarea" && <DetalleTarea {...ctx} id={cur.id} />}
          {S === "checkout" && <Checkout {...ctx} pagoId={cur.pagoId} id={cur.id} />}
          {S === "chats" && <Chats {...ctx} />}
          {S === "chat" && <Chat {...ctx} con={cur.con} />}
          {S === "perfil" && <Perfil {...ctx} />}
          {S === "perfilOtro" && <PerfilOtro {...ctx} id={cur.id} />}
          {S === "califs" && <Calificaciones {...ctx} id={cur.id || uid} />}
          {S === "ganancias" && <Ganancias {...ctx} />}
          {S === "pagosHist" && <HistorialPagos {...ctx} />}
          {S === "historial" && <Historial {...ctx} />}
          {S === "notifs" && <Notificaciones {...ctx} />}
          {S === "config" && <Config {...ctx} />}
          {S === "admin" && (soyAdmin ? <Admin {...ctx} /> : <SinPermiso />)}
          {S === "disputa" && <VistaDisputa {...ctx} id={cur.id} />}
          {S === "datos" && (soyAdmin ? <Datos {...ctx} /> : <SinPermiso />)}
          {S === "ubicacion" && <Ubicacion {...ctx} />}
          {S === "gente" && <Gente {...ctx} />}
          {S === "zonaAdmin" && (soyAdmin ? <ZonaAdmin {...ctx} /> : <SinPermiso />)}
        </main>

        {/* ── barra inferior ── */}
        {!["checkout", "chat"].includes(S) && (
          <nav className="tabs">
            {tabs.map((t) => (
              <button key={t.s} className={"tab " + (t.mid ? "mid " : "") + (S === t.s ? "on" : "")}
                aria-label={t.t} onClick={() => (t.s === "crear" ? setNav([{ s: "home" }, { s: "crear" }]) : tabTo(t.s))}>
                {t.mid ? <span className="bulb"><Ic n={t.i} s={24} c="#fff" w={2.2} /></span> : <><Ic n={t.i} s={21} /><span>{t.t}</span></>}
              </button>
            ))}
          </nav>
        )}

        {toast && <div className="toast">{toast}</div>}
        {sheet && <Sheet {...ctx} />}
      </div>
    </div>
  );
}

/* ═══════════ LOGIN Y REGISTRO ═══════════ */
function Auth({ cur, go, back, usuarios, setUsuarios, setUid, setRol, setNav, toast }) {
  const [email, setEmail] = useState("lucia@mandadito.uy");
  const [pass, setPass] = useState("123456");
  const [err, setErr] = useState("");
  const [f, setF] = useState({ nombre: "", apellido: "", email: "", telefono: "", password: "", rol: "ambos" });

  const entrar = () => {
    const u = usuarios.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === pass);
    if (!u) return setErr("Ese correo y contraseña no coinciden con ninguna cuenta.");
    setUid(u.id_usuario);
    setRol(u.rol === "admin" ? "admin" : u.rol === "repartidor" ? "repartidor" : "cliente");
    setNav([{ s: u.rol === "admin" ? "admin" : "home" }]);
  };
  const registrar = () => {
    if (!f.nombre || !f.email || f.password.length < 6) return setErr("Completá nombre, correo y una contraseña de al menos 6 caracteres.");
    if (usuarios.some((u) => u.email.toLowerCase() === f.email.toLowerCase())) return setErr("Ya existe una cuenta con ese correo.");
    const id = nextId(usuarios, "id_usuario");
    setUsuarios((us) => [...us, { id_usuario: id, ...f, fecha_registro: iso(), latitud: -34.9011, longitud: -54.9581, tareas_realizadas: 0, tareas_canceladas: 0 }]);
    setUid(id); setRol(f.rol === "repartidor" ? "repartidor" : "cliente"); setNav([{ s: "home" }]);
  };

  return (
    <div className="mdt"><style>{CSS}</style>
      <div className="frame">
          <div className="body" style={{ background: "var(--neg)", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "30px 22px 20px", position: "relative", flexShrink: 0 }}>
          <div className="row" style={{ gap: 10, marginBottom: 18 }}>
            <Lineas w={26} c="#3B3B45" />
            <Marca h={26} />
          </div>
            <h1 style={{ color: "#fff", fontSize: 30 }}>
              {cur.s === "registro" ? <>Creá tu<br />cuenta</> : <> Pedí una mano.<br />Ofrecé la tuya.</>}
            </h1>
            <p className="muted" style={{ marginTop: 8, color: "#8C8C98" }}>
              {cur.s === "registro" ? "Un solo perfil para pedir y para trabajar." : "Tareas cotidianas y oficios cerca tuyo, en Maldonado."}
            </p>
           
          </div>
            <div style={{ background: "var(--bl)", borderRadius: "22px 22px 0 0", padding: 22, minHeight: 360, flex: "1 0 auto" }}>
            {cur.s === "registro" ? (
              <>
                <div style={{ display: "flex", gap: 8 }}>
                  <Field lb="Nombre"><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} placeholder="Ana" /></Field>
                  <Field lb="Apellido"><input value={f.apellido} onChange={(e) => setF({ ...f, apellido: e.target.value })} placeholder="Gómez" /></Field>
                </div>
                <Field lb="Correo"><input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="ana@mail.uy" /></Field>
                <Field lb="Teléfono"><input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} placeholder="09X XXX XXX" /></Field>
                <Field lb="Contraseña" hint="mínimo 6 caracteres"><input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></Field>
                <Field lb="¿Cómo vas a usar Mandadito?">
                  <select value={f.rol} onChange={(e) => setF({ ...f, rol: e.target.value })}>
                    <option value="ambos">Las dos cosas: pedir y trabajar</option>
                    <option value="cliente">Solo pedir mandados</option>
                    <option value="repartidor">Solo trabajar</option>
                  </select>
                </Field>
                {err && <p style={{ color: "var(--err)", fontSize: 12.5, marginBottom: 10 }}>{err}</p>}
                <button className="btn btn-pri" onClick={registrar}>Crear cuenta</button>
                <button className="btn btn-out" style={{ marginTop: 8 }} onClick={back}>Ya tengo cuenta</button>
              </>
            ) : (
              <>
                <Field lb="Correo"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                <Field lb="Contraseña"><input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} /></Field>
                {err && <p style={{ color: "var(--err)", fontSize: 12.5, marginBottom: 10 }}>{err}</p>}
                <button className="btn btn-pri" onClick={entrar}>Iniciar sesión</button>
                <button className="btn btn-out" style={{ marginTop: 8 }} onClick={() => go("registro")}>Crear una cuenta</button>
                <div className="sep" />
                <p className="eyebrow" style={{ marginBottom: 8 }}>Cuentas de prueba</p>
                {[["lucia@mandadito.uy", "Cliente y emprendedora"], ["martin@mail.uy", "Emprendedor"], ["diego@mail.uy", "Cliente"], ["admin@mandadito.uy", "Administrador · clave admin"]].map(([m, d]) => (
                  <button key={m} className="card tap" style={{ width: "100%", textAlign: "left", padding: 10 }} onClick={() => { setEmail(m); setPass(m.includes("admin") ? "admin" : "123456"); setErr(""); }}>
                    <div className="between">
                      <div className="stack"><b style={{ fontSize: 13, color: "var(--neg)" }}>{m}</b><span className="tiny">{d}</span></div>
                      <Ic n="chevron" s={15} c="var(--gris)" />
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
          <footer style={{ flexShrink: 0, background: "var(--neg)", borderTop: "1px solid var(--grafito)", padding: "16px 22px 20px", textAlign: "center" }}>
             <p style={{ fontSize: 12, color: "#A9A9B4", lineHeight: 1.5, marginBottom: 10 }}>
              © 2026 Mi Sitio Web. Todos los derechos reservados.
            </p>
            <a href="#" className="foot-link">
              Membresías <Ic n="chevron" s={13} w={2.4} c="#fff" />
            </a>
          </footer>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

/* ═══════════ TARJETA DE TAREA ═══════════ */
function TareaCard({ t, ctx, mostrarCliente }) {
  const { go, nombreDe, U, yo } = ctx;
  const otro = mostrarCliente ? U(t.cliente_id) : U(t.repartidor_id);
  const d = km(yo?.latitud, yo?.longitud, t.latitud, t.longitud);
  return (
    <div className="card tap" tabIndex={0} onClick={() => go("tarea", { id: t.id_tarea })} onKeyDown={(e) => e.key === "Enter" && go("tarea", { id: t.id_tarea })}>
      <div className="between" style={{ alignItems: "flex-start" }}>
        <div className="row grow" style={{ alignItems: "flex-start" }}>
          {t.categoria && <span className="catbox"><Ic n={CATS[t.categoria] || "star"} s={14} c="var(--nar-osc)" /></span>}
          <div className="stack grow">
            <div className="row" style={{ gap: 6, marginBottom: 3 }}><Badge e={t.estado} />{d != null && <span className="dist"><Ic n="pin" s={10} w={2.4} />{fkm(d)}</span>}</div>
            <h3 className="trunc">{t.titulo}</h3>
            <span className="tiny trunc" style={{ marginTop: 2 }}>{t.direccion}</span>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{money(t.pago)}</div>
          <div className="tiny">{ago(t.fecha_creacion)}</div>
        </div>
      </div>
      {otro && (
        <>
          <div className="sep" />
          <div className="row">
            <Avatar u={otro} s={24} />
            <span className="tiny">{mostrarCliente ? "Cliente" : "Emprendedor"}: <b style={{ color: "var(--neg)" }}>{nombreDe(otro.id_usuario)}</b></span>
          </div>
        </>
      )}
    </div>
  );
}

/* ═══════════ INICIO CLIENTE ═══════════ */
function HomeCliente(ctx) {
  const { tareas, uid, yo, go, postuls, disputas, usuarios, radioDe } = ctx;
  const cerca = usuarios.filter((u) => u.id_usuario !== uid && ["repartidor", "ambos"].includes(u.rol) && km(yo.latitud, yo.longitud, u.latitud, u.longitud) <= radioDe(yo)).length;
  const mias = tareas.filter((t) => t.cliente_id === uid);
  const activas = mias.filter((t) => !["finalizada", "cancelada"].includes(t.estado));
  const retenido = ctx.pagos.filter((p) => mias.some((t) => t.id_tarea === p.tarea_id) && ["aprobado", "retenido"].includes(p.estado)).reduce((a, p) => a + Number(p.monto), 0);
  const postPend = postuls.filter((p) => p.estado === "pendiente" && mias.some((t) => t.id_tarea === p.tarea_id));
  const enDisp = disputas.filter((d) => d.estado === "abierta" && mias.some((t) => t.id_tarea === d.tarea_id));

  return (
    <div className="pad">
      <h1 style={{ marginBottom: 2 }}>Hola, {yo.nombre}</h1>
      <p className="muted" style={{ marginBottom: 14 }}>Tenés {activas.length} {activas.length === 1 ? "tarea activa" : "tareas activas"}.</p>

      <div className="escrow">
        <Runner h={92} c="#fff" style={{ position: "absolute", right: -14, bottom: -12, opacity: .07 }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="row between">
            <span className="eyebrow" style={{ color: "#9A9AA6" }}>Dinero retenido</span>
            <Ic n="lock" s={15} c="var(--nar)" />
          </div>
          <div className="amt" style={{ marginTop: 6 }}>{money(retenido)}</div>
          <p style={{ fontSize: 12, color: "#9A9AA6", marginTop: 6, lineHeight: 1.4 }}>
            Se libera al emprendedor cuando confirmás que el trabajo está terminado.
          </p>
        </div>
      </div>

      <button className="btn btn-pri" style={{ marginBottom: 10 }} onClick={() => go("crear")}>
        <Ic n="plus" s={18} w={2.4} /> Publicar una tarea
      </button>

      <div className="card tap" style={{ padding: "12px 14px" }} onClick={() => go("gente")}>
        <div className="between">
          <div className="row" style={{ gap: 9 }}>
            <span className="catbox"><Ic n="pin" s={14} c="var(--nar-osc)" /></span>
            <div className="stack">
              <b style={{ fontSize: 13.5 }}>{cerca} {cerca === 1 ? "emprendedor" : "emprendedores"} en {ctx.radioDe(yo)} km</b>
              <span className="tiny">Tocá para verlos o cambiar tu radio</span>
            </div>
          </div>
          <Ic n="chevron" s={15} c="var(--gris)" />
        </div>
      </div>

      {postPend.length > 0 && (
        <>
          <h3 style={{ marginBottom: 8 }}>Postulaciones nuevas</h3>
          {postPend.map((p) => {
            const t = tareas.find((x) => x.id_tarea === p.tarea_id);
            const r = ctx.ratingDe(p.repartidor_id);
            return (
             <div key={p.id_postulacion} className="card">
              <div className="between" style={{ alignItems: "flex-start" }}>
                <div className="stack">
                    <b style={{ fontSize: 14 }}>{ctx.nombreDe(p.repartidor_id)}</b>
                   <div className="row" style={{ gap: 5 }}><Stars v={r.prom} /><span className="tiny">{r.n} reseñas</span></div>
                  </div>
                  <Avatar u={ctx.U(p.repartidor_id)} s={28} />
                </div>
                <p className="muted" style={{ marginTop: 9 }}>{p.mensaje}</p>
                <p className="tiny" style={{ marginTop: 6 }}>Para: <b style={{ color: "var(--neg)" }}>{t.titulo}</b></p>
                <div className="btn-row" style={{ marginTop: 10 }}>
                  <button className="btn btn-out btn-sm" style={{ flex: 1 }} onClick={() => go("perfilOtro", { id: p.repartidor_id })}>Ver perfil</button>
                  <button className="btn btn-pri btn-sm" style={{ flex: 1 }} onClick={() => ctx.aceptarPostulacion(p)}>Aceptar</button>
                </div>
              </div>
            );
          })}
        </>
      )}

      {enDisp.length > 0 && (
        <div className="card" style={{ borderColor: "#F3C9C9", background: "#FFF7F7" }}>
          <div className="row"><Ic n="shield" s={17} c="var(--err)" /><b style={{ fontSize: 13.5 }}>Tenés {enDisp.length} disputa abierta</b></div>
          <p className="muted" style={{ marginTop: 6 }}>El pago sigue retenido mientras el equipo revisa el caso.</p>
          <button className="btn btn-out btn-sm" style={{ marginTop: 9, width: "100%" }} onClick={() => go("disputa", { id: enDisp[0].id_disputa })}>Ver la disputa</button>
        </div>
      )}

      <div className="between" style={{ margin: "18px 0 8px" }}>
        <h3>Tus tareas activas</h3>
        <button className="chip" onClick={() => ctx.setNav([{ s: "mias" }])}>Ver todas</button>
      </div>
      {activas.length === 0 ? <Empty icon="list" t="Todavía no publicaste nada" d="Publicá tu primer mandado y recibí postulaciones en minutos." /> :
        activas.slice(0, 4).map((t) => <TareaCard key={t.id_tarea} t={t} ctx={ctx} />)}
    </div>
  );
}

/* ═══════════ INICIO EMPRENDEDOR ═══════════ */
function HomeRepartidor(ctx) {
  const { tareas, uid, pagos, postuls, yo, alcance, radioDe, go } = ctx;
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [orden, setOrden] = useState("recientes");
  const rango = radioDe(yo);

  const cats = ["Todas", ...Array.from(new Set(tareas.map((t) => t.categoria).filter(Boolean)))];
  const { disponibles, cortadas } = useMemo(() => {
    let l = tareas.filter((t) => t.estado === "pendiente" && t.cliente_id !== uid);
    if (cat !== "Todas") l = l.filter((t) => t.categoria === cat);
    if (q.trim()) {
      const s = q.toLowerCase();
      l = l.filter((t) => (t.titulo + t.descripcion + t.direccion + t.categoria).toLowerCase().includes(s));
    }
    const con = l.map((t) => ({ t, a: alcance(t, yo) }));
    const dentro = con.filter((x) => x.a.visible).map((x) => x.t);
    const fuera = con.filter((x) => !x.a.visible);
    dentro.sort((a, b) => {
      if (orden === "pago") return b.pago - a.pago;
      if (orden === "cerca") return (km(yo.latitud, yo.longitud, a.latitud, a.longitud) ?? 99) - (km(yo.latitud, yo.longitud, b.latitud, b.longitud) ?? 99);
      return new Date(b.fecha_creacion) - new Date(a.fecha_creacion);
    });
    return {
      disponibles: dentro,
      cortadas: { mio: fuera.filter((x) => x.a.limita === "vos").length, cliente: fuera.filter((x) => x.a.limita === "cliente").length },
    };
  }, [tareas, q, cat, orden, uid, yo, rango]);

  const ganado = pagos.filter((p) => p.repartidor_id === uid && p.estado === "liberado").reduce((a, p) => a + Number(p.monto), 0);
  const pendiente = pagos.filter((p) => p.repartidor_id === uid && ["aprobado", "retenido"].includes(p.estado)).reduce((a, p) => a + Number(p.monto), 0);
  const misPost = postuls.filter((p) => p.repartidor_id === uid && p.estado === "pendiente");

  return (
    <div className="pad">
      <div className="escrow" style={{ marginBottom: 12 }}>
        <div style={{ position: "relative", zIndex: 1 }} className="between">
          <div>
            <span className="eyebrow" style={{ color: "#9A9AA6" }}>Cobrado</span>
            <div className="amt">{money(ganado)}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <span className="eyebrow" style={{ color: "#9A9AA6" }}>Por liberar</span>
            <div className="mono" style={{ fontSize: 18, fontWeight: 700, color: "var(--nar)" }}>{money(pendiente)}</div>
          </div>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 10 }}>
        <span style={{ position: "absolute", left: 12, top: 13 }}><Ic n="search" s={17} c="var(--gris)" /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por tarea, zona o palabra" style={{ paddingLeft: 37 }} />
      </div>
      <div className="chips" style={{ marginBottom: 8 }}>
        {cats.map((c) => <button key={c} className={"chip " + (cat === c ? "on" : "")} onClick={() => setCat(c)}>{c}</button>)}
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        <button className={"chip " + (orden === "recientes" ? "on" : "")} onClick={() => setOrden("recientes")}>Más recientes</button>
        <button className={"chip " + (orden === "pago" ? "on" : "")} onClick={() => setOrden("pago")}>Mejor pagas</button>
        <button className={"chip " + (orden === "cerca" ? "on" : "")} onClick={() => setOrden("cerca")}>Más cerca</button>
      </div>
      <div className="card tap" style={{ padding: "11px 14px" }} onClick={() => go("ubicacion")}>
        <div className="between">
          <span className="cat"><Ic n="pin" s={13} c="var(--nar)" /> Buscando hasta <b style={{ color: "var(--neg)" }}>{rango} km</b> de tu ubicación</span>
          <Ic n="chevron" s={15} c="var(--gris)" />
        </div>
      </div>

      {misPost.length > 0 && (
        <div className="card" style={{ borderColor: "var(--nar)", background: "var(--nar-luz)" }}>
          <div className="row"><Ic n="clock" s={16} c="var(--nar-osc)" /><b style={{ fontSize: 13.5 }}>{misPost.length} postulación en espera</b></div>
          <p className="muted" style={{ marginTop: 5 }}>Te avisamos apenas el cliente responda.</p>
        </div>
      )}

      <div className="between" style={{ marginBottom: 8 }}>
        <h3>Tareas disponibles</h3><span className="tiny">{disponibles.length} resultados</span>
      </div>
      {disponibles.length === 0 ? <Empty t="No hay tareas con ese filtro" d="Probá con otra categoría, limpiá la búsqueda o ampliá tu radio." /> :
        disponibles.map((t) => <TareaCard key={t.id_tarea} t={t} ctx={ctx} mostrarCliente />)}

      {(cortadas.mio > 0 || cortadas.cliente > 0) && (
        <div className="card" style={{ background: "#F1EFEC", borderStyle: "dashed" }}>
          <div className="row"><Ic n="pin" s={15} c="var(--gris)" /><b style={{ fontSize: 12.5 }}>Fuera de alcance</b></div>
          {cortadas.mio > 0 && (
            <p className="muted" style={{ marginTop: 6 }}>
              {cortadas.mio} {cortadas.mio === 1 ? "tarea queda" : "tareas quedan"} más lejos de tus {rango} km.
              <button className="chip" style={{ marginLeft: 6, padding: "3px 9px" }} onClick={() => go("ubicacion")}>Ampliar radio</button>
            </p>
          )}
          {cortadas.cliente > 0 && (
            <p className="muted" style={{ marginTop: 6 }}>
              {cortadas.cliente} {cortadas.cliente === 1 ? "está" : "están"} dentro de tu radio, pero el cliente pidió que lo atienda alguien más cerca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════ LISTA DE TAREAS PROPIAS ═══════════ */
function MisTareas(ctx) {
  const { tareas, uid, rol } = ctx;
  const [filtro, setFiltro] = useState("Activas");
  const base = tareas.filter((t) => (rol === "cliente" ? t.cliente_id === uid : t.repartidor_id === uid));
  const grupos = {
    Activas: base.filter((t) => !["finalizada", "cancelada"].includes(t.estado)),
    Terminadas: base.filter((t) => t.estado === "finalizada"),
    Canceladas: base.filter((t) => t.estado === "cancelada"),
    Todas: base,
  };
  const l = grupos[filtro].slice().sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
  return (
    <div className="pad">
      <div className="chips" style={{ marginBottom: 14 }}>
        {Object.keys(grupos).map((k) => (
          <button key={k} className={"chip " + (filtro === k ? "on" : "")} onClick={() => setFiltro(k)}>{k} · {grupos[k].length}</button>
        ))}
      </div>
      {l.length === 0 ? <Empty icon="list" t="Nada por acá" d={rol === "cliente" ? "Las tareas que publiques aparecen en esta lista." : "Postulate a una tarea para verla acá."} /> :
        l.map((t) => <TareaCard key={t.id_tarea} t={t} ctx={ctx} mostrarCliente={rol === "repartidor"} />)}
    </div>
  );
}

/* ═══════════ CREAR / EDITAR TAREA ═══════════ */
function FormTarea(ctx) {
  const { cur, tareas, crearTarea, editarTarea, usuarios, yo, uid, radioDe } = ctx;
  const alcanzados = usuarios.filter((u) => {
    if (u.id_usuario === uid || !["repartidor", "ambos"].includes(u.rol)) return false;
    const d = km(yo.latitud, yo.longitud, u.latitud, u.longitud);
    return d <= radioDe(yo) && d <= radioDe(u);
  }).length;
  const orig = cur.id ? tareas.find((t) => t.id_tarea === cur.id) : null;
  const [f, setF] = useState(orig || { titulo: "", descripcion: "", direccion: "", pago: "", categoria: "Compras" });
  const [err, setErr] = useState("");
  const ok = f.titulo.trim().length > 4 && f.direccion.trim() && Number(f.pago) > 0;

  const enviar = () => {
    if (!ok) return setErr("Falta el título, la dirección o el monto a pagar.");
    const d = { ...f, pago: Number(f.pago) };
    orig ? editarTarea(orig.id_tarea, d) : crearTarea(d);
  };

  return (
    <div className="pad">
      <Field lb="Título" hint="qué necesitás, en una línea">
        <input value={f.titulo} onChange={(e) => setF({ ...f, titulo: e.target.value })} placeholder="Retirar un paquete en el correo" />
      </Field>
      <Field lb="Descripción" hint="detalles, horarios, condiciones">
        <textarea value={f.descripcion} onChange={(e) => setF({ ...f, descripcion: e.target.value })} placeholder="Contá lo que el emprendedor necesita saber antes de aceptar." />
      </Field>
      <Field lb="Dirección">
        <input value={f.direccion} onChange={(e) => setF({ ...f, direccion: e.target.value })} placeholder="Calle, número, barrio" />
      </Field>
      <Field lb="Categoría">
        <select value={f.categoria} onChange={(e) => setF({ ...f, categoria: e.target.value })}>
          {Object.keys(CATS).map((c) => <option key={c}>{c}</option>)}
        </select>
      </Field>
      <Field lb="Cuánto pagás" hint="pesos uruguayos">
        <input type="number" inputMode="numeric" value={f.pago} onChange={(e) => setF({ ...f, pago: e.target.value })} placeholder="500" />
      </Field>

      <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
        <div className="row"><Ic n="pin" s={16} c="var(--nar-osc)" /><b style={{ fontSize: 13 }}>A quién le va a llegar</b></div>
        <p className="muted" style={{ marginTop: 6 }}>
          Con tu radio de {ctx.radioDe(ctx.yo)} km, esta tarea la van a ver <b style={{ color: "var(--neg)" }}>{alcanzados}</b> {alcanzados === 1 ? "emprendedor" : "emprendedores"}: son los que están dentro de tu radio y además te tienen dentro del suyo.
        </p>
        <button className="chip" style={{ marginTop: 8 }} onClick={() => ctx.go("ubicacion")}>Cambiar mi radio</button>
      </div>

      <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
        <div className="row"><Ic n="lock" s={16} c="var(--nar-osc)" /><b style={{ fontSize: 13 }}>Cómo funciona el pago</b></div>
        <p className="muted" style={{ marginTop: 6 }}>
          Publicar es gratis. Pagás por Mercado Pago recién cuando aceptás a un emprendedor, y el dinero queda retenido hasta que confirmes que el trabajo está hecho.
        </p>
      </div>

      {err && <p style={{ color: "var(--err)", fontSize: 12.5, margin: "4px 0 10px" }}>{err}</p>}
      <button className="btn btn-pri" onClick={enviar} disabled={!ok}>{orig ? "Guardar cambios" : "Publicar tarea"}</button>
    </div>
  );
}

/* ═══════════ DETALLE DE TAREA ═══════════ */
function DetalleTarea(ctx) {
  const { id, tareas, uid, rol, U, nombreDe, pagoDe, ratingDe, go, setSheet, postuls, disputas, crearPreferencia, iniciarTrabajo, marcarCompletada, confirmarYLiberar, tomarTrabajo } = ctx;
  const t = tareas.find((x) => x.id_tarea === id);
  if (!t) return <Empty icon="x" t="La tarea ya no existe" d="Puede que se haya eliminado." />;

  const pago = pagoDe(t.id_tarea);
  const soyCliente = t.cliente_id === uid;
  const soyRep = t.repartidor_id === uid;
  const step = EST[t.estado].step;
  const malo = ["en_disputa", "cancelada"].includes(t.estado);
  const misPost = postuls.find((p) => p.tarea_id === t.id_tarea && p.repartidor_id === uid);
  const postsTarea = postuls.filter((p) => p.tarea_id === t.id_tarea && p.estado === "pendiente");
  const disp = disputas.find((d) => d.tarea_id === t.id_tarea && d.estado === "abierta");
  const otro = soyCliente ? U(t.repartidor_id) : U(t.cliente_id);
  const rat = t.repartidor_id ? ratingDe(t.repartidor_id) : null;
  const yaCalifique = ctx.califs.some((c) => c.tarea_id === t.id_tarea);

  return (
    <div className="pad">
      <div className="row" style={{ gap: 6, marginBottom: 8 }}>
        <Badge e={t.estado} />
        {t.categoria && <span className="cat"><Ic n={CATS[t.categoria] || "star"} s={13} c="var(--nar)" /> {t.categoria}</span>}
        {km(ctx.yo?.latitud, ctx.yo?.longitud, t.latitud, t.longitud) != null && (
          <span className="dist"><Ic n="pin" s={10} w={2.4} />{fkm(km(ctx.yo.latitud, ctx.yo.longitud, t.latitud, t.longitud))}</span>
        )}
      </div>
      <h1 style={{ marginBottom: 8 }}>{t.titulo}</h1>

      <div className="escrow">
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="between">
            <div>
              <span className="eyebrow" style={{ color: "#9A9AA6" }}>{pago ? (pago.estado === "liberado" ? "Pagado al emprendedor" : pago.estado === "reembolsado" ? "Devuelto al cliente" : "Retenido en garantía") : "Monto acordado"}</span>
              <div className="amt">{money(t.pago)}</div>
            </div>
            <Ic n={pago && ["aprobado", "retenido"].includes(pago.estado) ? "lock" : pago?.estado === "liberado" ? "check" : "wallet"} s={20} c={pago ? EST_PAGO[pago.estado].col : "#6A6A76"} />
          </div>
          <div className="track">
            {["Publicada", "Asignada", "Pagada", "Entregada", "Cerrada"].map((s, i) => (
              <span key={s} className={"seg " + (malo && i >= step ? "bad" : i < step ? "done" : i === step ? "on" : "")} title={s} />
            ))}
          </div>
          <div className="between" style={{ marginTop: 7 }}>
            <span className="tiny" style={{ color: "#9A9AA6" }}>{["Publicada", "Asignada", "Pagada", "Entregada", "Cerrada"][step]}</span>
            {pago && <span className="mono" style={{ color: EST_PAGO[pago.estado].col }}>{EST_PAGO[pago.estado].t}</span>}
          </div>
        </div>
      </div>

      <div className="card">
        <p style={{ fontSize: 14, lineHeight: 1.55 }}>{t.descripcion}</p>
        <div className="sep" />
        <div className="kv"><span className="muted">Dirección</span><b>{t.direccion}</b></div>
        <div className="kv"><span className="muted">Publicada</span><b>{fdate(t.fecha_creacion, true)}</b></div>
        <div className="kv"><span className="muted">Cliente</span><b>{nombreDe(t.cliente_id)}</b></div>
        <div className="kv"><span className="muted">Coordenadas</span><span className="mono">{Number(t.latitud).toFixed(4)}, {Number(t.longitud).toFixed(4)}</span></div>
      </div>

      {otro && (
        <div className="card tap" onClick={() => go("perfilOtro", { id: otro.id_usuario })}>
          <div className="row">
            <Avatar u={otro} s={42} />
            <div className="stack grow">
              <span className="eyebrow">{soyCliente ? "Emprendedor asignado" : "Cliente"}</span>
              <b style={{ fontSize: 14.5 }}>{nombreDe(otro.id_usuario)}</b>
              {soyCliente && rat && <div className="row" style={{ gap: 5 }}><Stars v={rat.prom} /><span className="tiny">{rat.prom.toFixed(1)} · {rat.n} reseñas</span></div>}
            </div>
            <button className="btn btn-out btn-sm" onClick={(e) => { e.stopPropagation(); go("chat", { con: otro.id_usuario }); }}><Ic n="chat" s={15} /></button>
          </div>
        </div>
      )}

      {pago && (
        <div className="card">
          <div className="between" style={{ marginBottom: 6 }}><span className="eyebrow">Pago</span><span className="badge" style={{ background: "#F1EFEC", color: EST_PAGO[pago.estado].col }}>{EST_PAGO[pago.estado].t}</span></div>
          <div className="kv"><span className="muted">ID de transacción</span><span className="mono">{pago.mercadopago_id || "—"}</span></div>
          {pago.preference_id && <div className="kv"><span className="muted">Preferencia</span><span className="mono">{pago.preference_id}</span></div>}
          <div className="kv"><span className="muted">Fecha</span><b>{fdate(pago.fecha, true)}</b></div>
        </div>
      )}

      {/* acciones del cliente */}
      {soyCliente && (
        <>
          {t.estado === "pendiente" && (
            <>
              <div className="between" style={{ margin: "16px 0 8px" }}><h3>Postulaciones</h3><span className="tiny">{postsTarea.length}</span></div>
              {postsTarea.length === 0 ? <p className="muted" style={{ marginBottom: 12 }}>Todavía nadie se postuló. Suele tardar unos minutos.</p> :
                postsTarea.map((p) => (
                  <div key={p.id_postulacion} className="card">
                    <div className="row">
                      <Avatar u={U(p.repartidor_id)} s={34} />
                      <div className="stack grow"><b style={{ fontSize: 13.5 }}>{nombreDe(p.repartidor_id)}</b><Stars v={ratingDe(p.repartidor_id).prom} /></div>
                    </div>
                    <p className="muted" style={{ marginTop: 8 }}>{p.mensaje}</p>
                    <button className="btn btn-pri btn-sm" style={{ marginTop: 9, width: "100%" }} onClick={() => ctx.aceptarPostulacion(p)}>Aceptar a {U(p.repartidor_id).nombre}</button>
                  </div>
                ))}
              <div className="btn-row">
                <button className="btn btn-out" onClick={() => go("crear", { id: t.id_tarea })}><Ic n="edit" s={16} /> Editar</button>
                <button className="btn btn-err" onClick={() => setSheet({ k: "borrar", t })}><Ic n="trash" s={16} /> Eliminar</button>
              </div>
            </>
          )}
          {t.estado === "asignada" && (
            <>
              <button className="btn btn-mp" onClick={() => crearPreferencia(t)}>
                <svg width="20" height="15" viewBox="0 0 34 24" aria-hidden="true"><ellipse cx="17" cy="12" rx="16" ry="9.5" fill="#fff" /><path d="M6 12c3-3.4 6.4-5 11-5s8 1.6 11 5c-3 3.4-6.4 5-11 5s-8-1.6-11-5Z" fill="#009EE3" /><circle cx="17" cy="12" r="3" fill="#fff" /></svg>
                Pagar con Mercado Pago
              </button>
              <p className="tiny" style={{ textAlign: "center", marginTop: 8 }}>El dinero queda retenido hasta que confirmes la entrega.</p>
            </>
          )}
          {["pagada", "en_progreso"].includes(t.estado) && (
            <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
              <b style={{ fontSize: 13.5 }}>Trabajo en marcha</b>
              <p className="muted" style={{ marginTop: 5 }}>Cuando el emprendedor lo marque como terminado vas a poder confirmar y liberar el pago.</p>
            </div>
          )}
          {t.estado === "completada" && (
            <>
              <button className="btn btn-pri" onClick={() => confirmarYLiberar(t)}><Ic n="check" s={17} w={2.4} /> Confirmar y liberar {money(t.pago)}</button>
              <button className="btn btn-err" style={{ marginTop: 8 }} onClick={() => setSheet({ k: "disputa", t })}>El trabajo quedó incompleto</button>
            </>
          )}
          {t.estado === "finalizada" && !yaCalifique && (
            <button className="btn btn-pri" onClick={() => setSheet({ k: "calificar", t })}><Ic n="star" s={17} /> Calificar a {U(t.repartidor_id)?.nombre}</button>
          )}
        </>
      )}

      {/* acciones del emprendedor */}
      {rol === "repartidor" && !soyCliente && (
        <>
          {t.estado === "pendiente" && (misPost ? (
            <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
              <b style={{ fontSize: 13.5 }}>Ya te postulaste</b>
              <p className="muted" style={{ marginTop: 5 }}>{misPost.mensaje}</p>
            </div>
          ) : (
            <div className="btn-row">
              <button className="btn btn-out" onClick={() => setSheet({ k: "postular", t })}>Postularme</button>
              <button className="btn btn-pri" onClick={() => tomarTrabajo(t.id_tarea)}>Aceptar ya</button>
            </div>
          ))}
          {soyRep && t.estado === "asignada" && <div className="card"><b style={{ fontSize: 13.5 }}>Esperando el pago del cliente</b><p className="muted" style={{ marginTop: 5 }}>Vas a poder empezar apenas Mercado Pago acredite el dinero.</p></div>}
          {soyRep && t.estado === "pagada" && <button className="btn btn-pri" onClick={() => iniciarTrabajo(t)}>Empezar el trabajo</button>}
          {soyRep && t.estado === "en_progreso" && (
            <>
              <button className="btn btn-pri" onClick={() => marcarCompletada(t)}><Ic n="check" s={17} w={2.4} /> Marcar como completada</button>
              <button className="btn btn-out" style={{ marginTop: 8 }} onClick={() => setSheet({ k: "disputa", t })}>Reportar un problema</button>
            </>
          )}
          {soyRep && t.estado === "completada" && <div className="card"><b style={{ fontSize: 13.5 }}>Esperando la confirmación del cliente</b><p className="muted" style={{ marginTop: 5 }}>Cuando confirme, se liberan {money(t.pago)} a tu cuenta.</p></div>}
        </>
      )}

      {disp && (
        <button className="btn btn-err" style={{ marginTop: 8 }} onClick={() => go("disputa", { id: disp.id_disputa })}>
          <Ic n="shield" s={16} /> Ver la disputa abierta
        </button>
      )}
    </div>
  );
}

/* ═══════════ CHECKOUT MERCADO PAGO ═══════════ */
function Checkout(ctx) {
  const { pagoId, pagos, tareas, resolverPago, nombreDe } = ctx;
  const p = pagos.find((x) => x.id === pagoId);
  const t = tareas.find((x) => x.id_tarea === p?.tarea_id);
  const [metodo, setMetodo] = useState("tarjeta");
  const [cargando, setCargando] = useState(false);
  const [webhook, setWebhook] = useState(null);

  if (!p || !t) return <Empty icon="x" t="No encontramos el pago" d="Volvé a la tarea e intentá de nuevo." />;

  const pagar = (resultado) => {
    setCargando(true);
    setWebhook({ action: "payment.updated", type: "payment", data: { id: mpId() }, status: resultado });
    setTimeout(() => { setCargando(false); resolverPago(pagoId, resultado); }, 1400);
  };

  return (
    <div>
      <div style={{ background: "#009EE3", color: "#fff", padding: "22px 18px" }}>
        <div className="eyebrow" style={{ color: "rgba(255,255,255,.75)" }}>Checkout Pro · simulación</div>
        <div className="mono" style={{ fontSize: 30, fontWeight: 700, marginTop: 6 }}>{money(p.monto)}</div>
        <p style={{ fontSize: 13, marginTop: 4, opacity: .92 }}>{t.titulo}</p>
      </div>
      <div className="pad">
        <div className="card">
          <div className="kv"><span className="muted">Cobra</span><b>Mandadito S.A.S.</b></div>
          <div className="kv"><span className="muted">Emprendedor</span><b>{nombreDe(t.repartidor_id)}</b></div>
          <div className="kv"><span className="muted">preference_id</span><span className="mono">{p.preference_id}</span></div>
          <div className="kv"><span className="muted">external_reference</span><span className="mono">tarea_{t.id_tarea}</span></div>
        </div>

        <h3 style={{ margin: "14px 0 8px" }}>Medio de pago</h3>
        {[["tarjeta", "Tarjeta terminada en 4402", "Visa crédito · 1 cuota"], ["dinero", "Dinero en cuenta", "Saldo disponible en Mercado Pago"], ["debito", "Débito Santander", "Débito inmediato"]].map(([k, a, b]) => (
          <button key={k} className="card tap" style={{ width: "100%", textAlign: "left", borderColor: metodo === k ? "var(--nar)" : "var(--linea)" }} onClick={() => setMetodo(k)}>
            <div className="between">
              <div className="stack"><b style={{ fontSize: 13.5, color: "var(--neg)" }}>{a}</b><span className="tiny">{b}</span></div>
              {metodo === k && <Ic n="check" s={17} c="var(--nar)" w={2.6} />}
            </div>
          </button>
        ))}

        {cargando ? (
          <div className="card" style={{ textAlign: "center", padding: 22 }}>
            <div className="bar" style={{ margin: "0 auto 12px" }}><i /></div>
            <b style={{ fontSize: 13.5 }}>Procesando el pago…</b>
            <p className="tiny" style={{ marginTop: 8 }}>Esperando la notificación del webhook</p>
            {webhook && <pre className="mono" style={{ textAlign: "left", background: "var(--neg)", color: "#9BE8C0", padding: 10, borderRadius: 10, marginTop: 10, overflowX: "auto", fontSize: 10 }}>{JSON.stringify(webhook, null, 1)}</pre>}
          </div>
        ) : (
          <>
            <button className="btn btn-mp" style={{ marginTop: 6 }} onClick={() => pagar("aprobado")}>Pagar {money(p.monto)}</button>
            <div className="sep" />
            <p className="eyebrow" style={{ marginBottom: 8 }}>Simular otra respuesta</p>
            <div className="btn-row">
              <button className="btn btn-out btn-sm" style={{ flex: 1 }} onClick={() => pagar("rechazado")}>Rechazado</button>
              <button className="btn btn-out btn-sm" style={{ flex: 1 }} onClick={() => pagar("cancelado")}>Cancelado</button>
            </div>
            <p className="tiny" style={{ marginTop: 12, lineHeight: 1.5 }}>
              En producción este paso redirige al <span className="mono">init_point</span> devuelto por la API de preferencias, y el estado final llega por webhook a <span className="mono">/api/mp/webhook</span>.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════ MENSAJES ═══════════ */
function Chats(ctx) {
  const { mensajes, uid, U, nombreDe, go } = ctx;
  const conv = {};
  mensajes.filter((m) => m.emisor_id === uid || m.receptor_id === uid).forEach((m) => {
    const otro = m.emisor_id === uid ? m.receptor_id : m.emisor_id;
    if (!conv[otro] || new Date(m.fecha) > new Date(conv[otro].fecha)) conv[otro] = m;
  });
  const l = Object.entries(conv).sort((a, b) => new Date(b[1].fecha) - new Date(a[1].fecha));
  if (!l.length) return <Empty icon="chat" t="Sin conversaciones" d="Cuando trabajes con alguien, el chat aparece acá." />;
  return (
    <div className="pad">
      {l.map(([otro, m]) => (
        <div key={otro} className="card tap" onClick={() => go("chat", { con: Number(otro) })}>
          <div className="row">
            <Avatar u={U(Number(otro))} s={42} />
            <div className="stack grow">
              <div className="between"><b style={{ fontSize: 14 }}>{nombreDe(Number(otro))}</b><span className="tiny">{ago(m.fecha)}</span></div>
              <span className="muted trunc">{m.emisor_id === uid ? "Vos: " : ""}{m.mensaje}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function Chat(ctx) {
  const { con, mensajes, uid, U, enviarMensaje } = ctx;
  const [txt, setTxt] = useState("");
  const fin = useRef(null);
  const hilo = mensajes.filter((m) => (m.emisor_id === uid && m.receptor_id === con) || (m.emisor_id === con && m.receptor_id === uid)).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  useEffect(() => { fin.current?.scrollIntoView({ block: "end" }); }, [hilo.length]);
  const mandar = () => { if (!txt.trim()) return; enviarMensaje(con, txt.trim()); setTxt(""); };
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%" }}>
      <div className="pad" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {hilo.map((m) => (
          <div key={m.id_mensaje} className={"bubble " + (m.emisor_id === uid ? "bu-me" : "bu-ot")}>
            {m.mensaje}
            <div style={{ fontSize: 10, opacity: .65, marginTop: 3, textAlign: "right" }}>{fdate(m.fecha)}</div>
          </div>
        ))}
        <div ref={fin} />
      </div>
      <div style={{ position: "sticky", bottom: 0, background: "var(--bl)", borderTop: "1px solid var(--linea)", padding: 10, display: "flex", gap: 8 }}>
        <input value={txt} onChange={(e) => setTxt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && mandar()} placeholder={`Escribile a ${U(con)?.nombre}`} />
        <button className="btn btn-pri btn-sm" style={{ padding: "0 14px" }} onClick={mandar} aria-label="Enviar"><Ic n="send" s={18} /></button>
      </div>
    </div>
  );
}

/* ═══════════ PERFILES ═══════════ */
function Perfil(ctx) {
  const { yo, uid, go, ratingDe, tareas, pagos, rol, setUsuarios, say } = ctx;
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ nombre: yo.nombre, apellido: yo.apellido, telefono: yo.telefono, email: yo.email });
  const r = ratingDe(uid);
  const hechas = tareas.filter((t) => t.repartidor_id === uid && t.estado === "finalizada").length;
  const pedidas = tareas.filter((t) => t.cliente_id === uid).length;
  const cobrado = pagos.filter((p) => p.repartidor_id === uid && p.estado === "liberado").reduce((a, p) => a + Number(p.monto), 0);

  const guardar = () => { setUsuarios((us) => us.map((u) => (u.id_usuario === uid ? { ...u, ...f } : u))); setEdit(false); say("Perfil actualizado"); };

  return (
    <div className="pad">
      <div className="card" style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Avatar u={yo} s={72} /></div>
        <h2 style={{ marginTop: 10 }}>{yo.nombre} {yo.apellido}</h2>
        <p className="tiny">{yo.email}</p>
        <div className="row" style={{ justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Stars v={r.prom} s={15} />
          <span className="tiny">{r.n ? `${r.prom.toFixed(1)} · ${r.n} reseñas` : "Sin reseñas todavía"}</span>
        </div>
        <div className="sep" />
        <div className="row" style={{ justifyContent: "space-around" }}>
          {[[hechas, "Trabajos"], [pedidas, "Publicadas"], [yo.tareas_canceladas || 0, "Canceladas"]].map(([n, t]) => (
            <div key={t} className="stack" style={{ alignItems: "center" }}>
              <span className="disp" style={{ fontSize: 20 }}>{n}</span><span className="tiny">{t}</span>
            </div>
          ))}
        </div>
      </div>

      {rol === "repartidor" && (
        <div className="card" style={{ background: "var(--neg)", color: "#fff", borderColor: "var(--neg)" }}>
          <span className="eyebrow" style={{ color: "#9A9AA6" }}>Total cobrado</span>
          <div className="mono" style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}>{money(cobrado)}</div>
        </div>
      )}

      {edit ? (
        <div className="card">
          <h3 style={{ marginBottom: 10 }}>Editar datos</h3>
          <Field lb="Nombre"><input value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} /></Field>
          <Field lb="Apellido"><input value={f.apellido} onChange={(e) => setF({ ...f, apellido: e.target.value })} /></Field>
          <Field lb="Teléfono"><input value={f.telefono} onChange={(e) => setF({ ...f, telefono: e.target.value })} /></Field>
          <Field lb="Correo"><input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></Field>
          <div className="btn-row">
            <button className="btn btn-out" onClick={() => setEdit(false)}>Cancelar</button>
            <button className="btn btn-pri" onClick={guardar}>Guardar</button>
          </div>
        </div>
      ) : (
        <>
          {[
            ["Editar mis datos", "user", () => setEdit(true)],
            ["Calificaciones recibidas", "star", () => go("califs")],
            ["Historial de actividad", "clock", () => go("historial")],
            ["Historial de pagos", "wallet", () => go("pagosHist")],
            ["Configuración", "gear", () => go("config")],
          ].map(([t, i, fn]) => (
            <button key={t} className="card tap" style={{ width: "100%", textAlign: "left" }} onClick={fn}>
              <div className="row"><Ic n={i} s={18} c="var(--nar)" /><b className="grow" style={{ fontSize: 13.5 }}>{t}</b><Ic n="chevron" s={15} c="var(--gris)" /></div>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

function PerfilOtro(ctx) {
  const { id, U, ratingDe, califs, tareas, go, nombreDe } = ctx;
  const u = U(id);
  const r = ratingDe(id);
  const reseñas = califs.filter((c) => c.repartidor_id === id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const hechas = tareas.filter((t) => t.repartidor_id === id && t.estado === "finalizada").length;
  if (!u) return <Empty icon="user" t="Usuario no encontrado" d="" />;
  return (
    <div className="pad">
      <div className="card" style={{ textAlign: "center", paddingTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Avatar u={u} s={68} /></div>
        <h2 style={{ marginTop: 10 }}>{u.nombre} {u.apellido}</h2>
        <p className="tiny">Miembro desde {fdate(u.fecha_registro, true).slice(0, 8)}</p>
        <div className="row" style={{ justifyContent: "center", gap: 6, marginTop: 8 }}>
          <Stars v={r.prom} s={15} /><span className="tiny">{r.n ? `${r.prom.toFixed(1)} · ${r.n} reseñas` : "Sin reseñas"}</span>
        </div>
        <div className="sep" />
        <div className="row" style={{ justifyContent: "space-around" }}>
          {[[hechas, "Completados"], [u.tareas_canceladas || 0, "Cancelados"], [`${r.n ? Math.round((hechas / (hechas + (u.tareas_canceladas || 0) || 1)) * 100) : 100}%`, "Cumplimiento"]].map(([n, t]) => (
            <div key={t} className="stack" style={{ alignItems: "center" }}><span className="disp" style={{ fontSize: 19 }}>{n}</span><span className="tiny">{t}</span></div>
          ))}
        </div>
        <button className="btn btn-out btn-sm" style={{ marginTop: 12, width: "100%" }} onClick={() => go("chat", { con: id })}><Ic n="chat" s={15} /> Enviar mensaje</button>
      </div>
      <h3 style={{ margin: "16px 0 8px" }}>Reseñas</h3>
      {reseñas.length === 0 ? <p className="muted">Todavía no recibió reseñas.</p> : reseñas.map((c) => (
        <div key={c.id_calificaciones} className="card">
          <div className="between"><Stars v={c.puntaje} /><span className="tiny">{ago(c.fecha)}</span></div>
          <p style={{ fontSize: 13.5, marginTop: 7, lineHeight: 1.5 }}>{c.comentario}</p>
          <p className="tiny" style={{ marginTop: 6 }}>— {nombreDe(c.cliente_id)}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ CALIFICACIONES ═══════════ */
function Calificaciones(ctx) {
  const { id, califs, nombreDe, tareas } = ctx;
  const r = califs.filter((c) => c.repartidor_id === id).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  const prom = r.length ? r.reduce((a, c) => a + c.puntaje, 0) / r.length : 0;
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: r.filter((x) => x.puntaje === n).length }));
  return (
    <div className="pad">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="disp" style={{ fontSize: 46 }}>{prom.toFixed(1)}</div>
        <Stars v={prom} s={18} />
        <p className="tiny" style={{ marginTop: 5 }}>{r.length} calificaciones</p>
        <div className="sep" />
        {dist.map((d) => (
          <div key={d.n} className="row" style={{ gap: 8, marginBottom: 5 }}>
            <span className="tiny" style={{ width: 12 }}>{d.n}</span>
            <div style={{ flex: 1, height: 6, background: "var(--linea)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ width: `${r.length ? (d.c / r.length) * 100 : 0}%`, height: "100%", background: "var(--nar)" }} />
            </div>
            <span className="tiny" style={{ width: 16, textAlign: "right" }}>{d.c}</span>
          </div>
        ))}
      </div>
      {r.length === 0 ? <Empty icon="star" t="Sin calificaciones" d="Completá trabajos para empezar a construir tu reputación." /> :
        r.map((c) => {
          const t = tareas.find((x) => x.id_tarea === c.tarea_id);
          return (
            <div key={c.id_calificaciones} className="card">
              <div className="between"><Stars v={c.puntaje} /><span className="tiny">{fdate(c.fecha, true)}</span></div>
              <p style={{ fontSize: 13.5, marginTop: 7, lineHeight: 1.5 }}>{c.comentario}</p>
              <div className="sep" />
              <p className="tiny">{nombreDe(c.cliente_id)}{t ? ` · ${t.titulo}` : ""}</p>
            </div>
          );
        })}
    </div>
  );
}

/* ═══════════ GANANCIAS ═══════════ */
function Ganancias(ctx) {
  const { pagos, uid, tareas, go } = ctx;
  const mis = pagos.filter((p) => p.repartidor_id === uid);
  const liberado = mis.filter((p) => p.estado === "liberado");
  const retenido = mis.filter((p) => ["aprobado", "retenido"].includes(p.estado));
  const total = liberado.reduce((a, p) => a + Number(p.monto), 0);
  const espera = retenido.reduce((a, p) => a + Number(p.monto), 0);
  const prom = liberado.length ? total / liberado.length : 0;

  return (
    <div className="pad">
      <div className="escrow">
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" style={{ color: "#9A9AA6" }}>Cobrado en total</span>
          <div className="amt" style={{ marginTop: 4 }}>{money(total)}</div>
          <div className="row" style={{ marginTop: 14, gap: 20 }}>
            <div className="stack"><span className="tiny" style={{ color: "#9A9AA6" }}>Por liberar</span><span className="mono" style={{ fontSize: 15, color: "var(--nar)" }}>{money(espera)}</span></div>
            <div className="stack"><span className="tiny" style={{ color: "#9A9AA6" }}>Promedio</span><span className="mono" style={{ fontSize: 15 }}>{money(Math.round(prom))}</span></div>
          </div>
        </div>
      </div>

      <h3 style={{ margin: "16px 0 8px" }}>Movimientos</h3>
      {mis.length === 0 ? <Empty icon="wallet" t="Sin movimientos" d="Cuando cobres tu primer trabajo lo vas a ver acá." /> :
        mis.slice().sort((a, b) => new Date(b.fecha) - new Date(a.fecha)).map((p) => {
          const t = tareas.find((x) => x.id_tarea === p.tarea_id);
          return (
            <div key={p.id} className="card tap" onClick={() => t && go("tarea", { id: t.id_tarea })}>
              <div className="between">
                <div className="stack grow">
                  <b className="trunc" style={{ fontSize: 13.5 }}>{t?.titulo || "Tarea eliminada"}</b>
                  <span className="tiny">{fdate(p.fecha, true)} · <span className="mono">{p.mercadopago_id || "sin ID"}</span></span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: p.estado === "liberado" ? "var(--ok)" : "var(--neg)" }}>{money(p.monto)}</div>
                  <span className="tiny" style={{ color: EST_PAGO[p.estado].col }}>{EST_PAGO[p.estado].t}</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}

/* ═══════════ HISTORIAL DE PAGOS ═══════════ */
function HistorialPagos(ctx) {
  const { pagos, uid, tareas, go } = ctx;
  const mis = pagos.filter((p) => p.cliente_id === uid || p.repartidor_id === uid).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  if (!mis.length) return <Empty icon="wallet" t="Sin pagos registrados" d="Los pagos que hagas o recibas quedan acá." />;
  return (
    <div className="pad">
      {mis.map((p) => {
        const t = tareas.find((x) => x.id_tarea === p.tarea_id);
        const salida = p.cliente_id === uid;
        return (
          <div key={p.id} className="card tap" onClick={() => t && go("tarea", { id: t.id_tarea })}>
            <div className="between" style={{ marginBottom: 7 }}>
              <b className="trunc" style={{ fontSize: 13.5 }}>{t?.titulo || "—"}</b>
              <span className="mono" style={{ fontSize: 15, fontWeight: 700, color: salida ? "var(--neg)" : "var(--ok)" }}>{salida ? "−" : "+"}{money(p.monto)}</span>
            </div>
            <div className="kv"><span className="muted">Estado</span><b style={{ color: EST_PAGO[p.estado].col }}>{EST_PAGO[p.estado].t}</b></div>
            <div className="kv"><span className="muted">ID Mercado Pago</span><span className="mono">{p.mercadopago_id || "—"}</span></div>
            <div className="kv"><span className="muted">Fecha</span><b>{fdate(p.fecha, true)}</b></div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════ HISTORIAL DE ACTIVIDAD ═══════════ */
function Historial(ctx) {
  const { tareas, uid, califs, pagos } = ctx;
  const eventos = [];
  tareas.filter((t) => t.cliente_id === uid || t.repartidor_id === uid).forEach((t) => {
    eventos.push({ f: t.fecha_creacion, i: "list", t: t.cliente_id === uid ? "Publicaste una tarea" : "Trabajo asignado", d: t.titulo });
  });
  pagos.filter((p) => p.cliente_id === uid || p.repartidor_id === uid).forEach((p) => {
    const t = tareas.find((x) => x.id_tarea === p.tarea_id);
    eventos.push({ f: p.fecha, i: "wallet", t: p.cliente_id === uid ? `Pago de ${money(p.monto)}` : `Cobro de ${money(p.monto)}`, d: t?.titulo || "—" });
  });
  califs.filter((c) => c.cliente_id === uid || c.repartidor_id === uid).forEach((c) => {
    eventos.push({ f: c.fecha, i: "star", t: c.cliente_id === uid ? "Calificaste un trabajo" : `Recibiste ${c.puntaje} estrellas`, d: c.comentario });
  });
  eventos.sort((a, b) => new Date(b.f) - new Date(a.f));
  if (!eventos.length) return <Empty icon="clock" t="Sin actividad" d="Tu historial se arma solo a medida que usás la app." />;
  return (
    <div className="pad">
      {eventos.map((e, i) => (
        <div key={i} className="row" style={{ alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--bl)", border: "1px solid var(--linea)", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
            <Ic n={e.i} s={16} c="var(--nar)" />
          </div>
          <div className="stack grow">
            <b style={{ fontSize: 13.5 }}>{e.t}</b>
            <span className="muted trunc">{e.d}</span>
            <span className="tiny">{fdate(e.f, true)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ NOTIFICACIONES ═══════════ */
function Notificaciones(ctx) {
  const { notifs, uid, setNotifs } = ctx;
  const mias = notifs.filter((n) => n.id_usuario === uid).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  useEffect(() => { setNotifs((ns) => ns.map((n) => (n.id_usuario === uid ? { ...n, leida: true } : n))); }, []);
  if (!mias.length) return <Empty icon="bell" t="Sin notificaciones" d="Te avisamos cada vez que cambie el estado de una tarea o un pago." />;
  return (
    <div className="pad">
      {mias.map((n) => (
        <div key={n.id_notificacion} className="card">
          <div className="row" style={{ alignItems: "flex-start" }}>
            {!n.leida && <span className="dot" style={{ marginTop: 6 }} />}
            <div className="stack grow">
              <b style={{ fontSize: 13.5 }}>{n.titulo}</b>
              <p className="muted" style={{ marginTop: 2 }}>{n.mensaje}</p>
              <span className="tiny" style={{ marginTop: 4 }}>{ago(n.fecha)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════ CONFIGURACIÓN ═══════════ */
function Config(ctx) {
  const { yo, rol, setRol, setNav, setUid, go, say, setUsuarios, uid } = ctx;
  const [notif, setNotif] = useState({ estados: true, mensajes: true, pagos: true, promos: false });
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} style={{ width: 42, height: 24, borderRadius: 999, border: 0, background: on ? "var(--nar)" : "#D9D6D2", position: "relative", cursor: "pointer", flex: "0 0 auto" }} aria-pressed={on}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 18, height: 18, borderRadius: 9, background: "#fff", transition: "left .16s" }} />
    </button>
  );
  return (
    <div className="pad">
      <p className="eyebrow" style={{ marginBottom: 8 }}>Cuenta</p>
      <div className="card">
        <div className="kv"><span className="muted">Nombre</span><b>{yo.nombre} {yo.apellido}</b></div>
        <div className="kv"><span className="muted">Correo</span><b>{yo.email}</b></div>
        <div className="kv"><span className="muted">Teléfono</span><b>{yo.telefono}</b></div>
        <div className="kv"><span className="muted">Rol en la base</span><span className="mono">{yo.rol}</span></div>
      </div>

      <p className="eyebrow" style={{ margin: "16px 0 8px" }}>Perfil activo</p>
      <div className="card">
        <p className="muted" style={{ marginBottom: 10 }}>Podés cambiar de perfil en cualquier momento sin cerrar sesión.</p>
        <div className="switch" style={{ background: "#EDECEA" }}>
          <button className={rol === "cliente" ? "on" : ""} style={{ color: rol === "cliente" ? "#fff" : "var(--gris)" }} onClick={() => { setRol("cliente"); setNav([{ s: "home" }]); }}>Cliente</button>
          <button className={rol === "repartidor" ? "on" : ""} style={{ color: rol === "repartidor" ? "#fff" : "var(--gris)" }} onClick={() => { setRol("repartidor"); setNav([{ s: "home" }]); }}>Emprendedor</button>
        </div>
      </div>

      <p className="eyebrow" style={{ margin: "16px 0 8px" }}>Ubicación</p>
      <button className="card tap" style={{ width: "100%", textAlign: "left" }} onClick={() => go("ubicacion")}>
        <div className="row">
          <Ic n="pin" s={18} c="var(--nar)" />
          <div className="stack grow">
            <b style={{ fontSize: 13.5 }}>Ubicación y radio de búsqueda</b>
            <span className="tiny">Buscando hasta {ctx.radioDe(yo)} km</span>
          </div>
          <Ic n="chevron" s={15} c="var(--gris)" />
        </div>
      </button>

      <p className="eyebrow" style={{ margin: "16px 0 8px" }}>Notificaciones</p>
      <div className="card">
        {[["estados", "Cambios de estado de tareas"], ["mensajes", "Mensajes nuevos"], ["pagos", "Pagos y liberaciones"], ["promos", "Novedades de Mandadito"]].map(([k, t]) => (
          <div key={k} className="between" style={{ padding: "8px 0" }}>
            <span style={{ fontSize: 13.5 }}>{t}</span>
            <Toggle on={notif[k]} onClick={() => setNotif({ ...notif, [k]: !notif[k] })} />
          </div>
        ))}
      </div>

      {yo.rol === "admin" && (
        <>
          <p className="eyebrow" style={{ margin: "16px 0 8px" }}>Administración</p>
          <button className="card tap" style={{ width: "100%", textAlign: "left" }} onClick={() => go("datos")}>
            <div className="row"><Ic n="db" s={18} c="var(--nar)" /><b className="grow" style={{ fontSize: 13.5 }}>Ver la base de datos</b><Ic n="chevron" s={15} c="var(--gris)" /></div>
          </button>
          <button className="card tap" style={{ width: "100%", textAlign: "left" }} onClick={() => { setRol("admin"); setNav([{ s: "admin" }]); }}>
            <div className="row"><Ic n="shield" s={18} c="var(--nar)" /><b className="grow" style={{ fontSize: 13.5 }}>Panel de administración</b><Ic n="chevron" s={15} c="var(--gris)" /></div>
          </button>
        </>
      )}
      <button className="btn btn-err" style={{ marginTop: 10 }} onClick={() => { setUid(null); setNav([{ s: "login" }]); }}>
        <Ic n="logout" s={17} /> Cerrar sesión
      </button>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginTop: 22, opacity: .55 }}>
        <Runner h={26} c="var(--gris)" />
        <p className="tiny" style={{ textAlign: "center" }}>Mandadito · prototipo v1.0<br />Equipo Rotom · Maldonado, Uruguay</p>
      </div>
    </div>
  );
}

/* ═══════════ ADMINISTRACIÓN DE DISPUTAS ═══════════ */
function Admin(ctx) {
  const { disputas, tareas, nombreDe, go, pagoDe } = ctx;
  const abiertas = disputas.filter((d) => d.estado === "abierta");
  const cerradas = disputas.filter((d) => d.estado !== "abierta");
  const retenido = abiertas.reduce((a, d) => { const t = tareas.find((x) => x.id_tarea === d.tarea_id); return a + Number(t?.pago || 0); }, 0);
  return (
    <div className="pad">
      <div className="escrow">
        <div style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow" style={{ color: "#9A9AA6" }}>Dinero retenido en disputas</span>
          <div className="amt" style={{ marginTop: 4 }}>{money(retenido)}</div>
          <p className="tiny" style={{ color: "#9A9AA6", marginTop: 6 }}>{abiertas.length} casos esperando resolución</p>
        </div>
      </div>
      <h3 style={{ margin: "16px 0 8px" }}>Casos abiertos</h3>
      {abiertas.length === 0 ? <p className="muted">No hay disputas pendientes.</p> : abiertas.map((d) => {
        const t = tareas.find((x) => x.id_tarea === d.tarea_id);
        return (
          <div key={d.id_disputa} className="card tap" onClick={() => go("disputa", { id: d.id_disputa })}>
            <div className="between" style={{ marginBottom: 6 }}>
              <span className="badge b-disp">Abierta</span>
              <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{money(t?.pago)}</span>
            </div>
            <b style={{ fontSize: 13.5 }}>{t?.titulo}</b>
            <p className="muted trunc" style={{ marginTop: 4 }}>{d.motivo}</p>
            <p className="tiny" style={{ marginTop: 6 }}>Abrió {nombreDe(d.abierta_por)} · {ago(d.fecha)}</p>
          </div>
        );
      })}
      {cerradas.length > 0 && (
        <>
          <h3 style={{ margin: "16px 0 8px" }}>Resueltas</h3>
          {cerradas.map((d) => {
            const t = tareas.find((x) => x.id_tarea === d.tarea_id);
            return (
              <div key={d.id_disputa} className="card">
                <div className="between"><b style={{ fontSize: 13.5 }}>{t?.titulo}</b>
                  <span className="badge b-canc">{d.resolucion === "reembolso" ? "Reembolso" : "Pago liberado"}</span></div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

function VistaDisputa(ctx) {
  const { id, disputas, tareas, evids, U, nombreDe, uid, rol, setSheet, resolverDisputa, pagoDe, go } = ctx;
  const d = disputas.find((x) => x.id_disputa === id);
  if (!d) return <Empty icon="shield" t="Disputa no encontrada" d="" />;
  const t = tareas.find((x) => x.id_tarea === d.tarea_id);
  const p = pagoDe(d.tarea_id);
  const ev = evids.filter((e) => e.disputa_id === d.id_disputa).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const parte = uid === t.cliente_id || uid === t.repartidor_id;
  if (!parte && ctx.yo?.rol !== "admin") return <SinPermiso />;

  return (
    <div className="pad">
      <div className="card" style={{ background: "#FFF7F7", borderColor: "#F3C9C9" }}>
        <div className="row"><Ic n="lock" s={17} c="var(--err)" /><b style={{ fontSize: 13.5 }}>{d.estado === "abierta" ? "Pago retenido" : "Caso cerrado"}</b></div>
        <p className="muted" style={{ marginTop: 6 }}>
          {d.estado === "abierta"
            ? `Los ${money(t.pago)} quedan bloqueados hasta que el equipo revise la evidencia de ambas partes.`
            : d.resolucion === "reembolso" ? "Se reembolsó el dinero al cliente." : "Se liberó el pago al emprendedor."}
        </p>
      </div>

      <div className="card tap" onClick={() => go("tarea", { id: t.id_tarea })}>
        <span className="eyebrow">Tarea</span>
        <h3 style={{ marginTop: 4 }}>{t.titulo}</h3>
        <div className="kv" style={{ marginTop: 6 }}><span className="muted">Cliente</span><b>{nombreDe(t.cliente_id)}</b></div>
        <div className="kv"><span className="muted">Emprendedor</span><b>{nombreDe(t.repartidor_id)}</b></div>
        <div className="kv"><span className="muted">Pago</span><span className="mono">{p?.mercadopago_id || "—"}</span></div>
      </div>

      <div className="card">
        <span className="eyebrow">Motivo</span>
        <p style={{ fontSize: 13.5, marginTop: 6, lineHeight: 1.5 }}>{d.motivo}</p>
        <p className="tiny" style={{ marginTop: 6 }}>Abrió {nombreDe(d.abierta_por)} · {fdate(d.fecha, true)}</p>
      </div>

      <h3 style={{ margin: "16px 0 8px" }}>Descargos y evidencia</h3>
      {ev.map((e) => (
        <div key={e.id_evidencia} className="card">
          <div className="row" style={{ marginBottom: 6 }}>
            <Avatar u={U(e.usuario_id)} s={26} />
            <b className="grow" style={{ fontSize: 13 }}>{nombreDe(e.usuario_id)}</b>
            <span className="badge b-canc">{e.tipo}</span>
          </div>
          {e.tipo === "foto" && (
            <div style={{ height: 88, borderRadius: 10, background: "var(--hueso)", border: "1px solid var(--linea)", display: "grid", placeItems: "center", marginBottom: 8 }}>
              <Ic n="paper" s={20} c="#C4C0BA" />
            </div>
          )}
          <p style={{ fontSize: 13.5, lineHeight: 1.5 }}>{e.nota}</p>
          <p className="tiny" style={{ marginTop: 5 }}>{fdate(e.fecha, true)}</p>
        </div>
      ))}

      {d.estado === "abierta" && parte && (
        <button className="btn btn-out" onClick={() => setSheet({ k: "evidencia", d })}><Ic n="paper" s={16} /> Adjuntar evidencia</button>
      )}
      {d.estado === "abierta" && rol === "admin" && (
        <>
          <div className="sep" />
          <p className="eyebrow" style={{ marginBottom: 8 }}>Resolución del administrador</p>
          <button className="btn btn-pri" onClick={() => resolverDisputa(d, "repartidor")}>Liberar {money(t.pago)} al emprendedor</button>
          <button className="btn btn-out" style={{ marginTop: 8 }} onClick={() => resolverDisputa(d, "cliente")}>Reembolsar al cliente</button>
        </>
      )}
    </div>
  );
}

/* ═══════════ INSPECTOR DE BASE DE DATOS ═══════════ */
function Datos(ctx) {
  const { usuarios, tareas, pagos, califs, mensajes, notifs, postuls, disputas, evids, zona } = ctx;
  const [abierta, setAbierta] = useState("tareas");
  const tablas = {
    usuarios: { rows: usuarios, cols: ["id_usuario", "nombre", "rol", "latitud", "longitud", "radio_km"], ext: false },
    tareas: { rows: tareas, cols: ["id_tarea", "titulo", "pago", "estado", "cliente_id", "repartidor_id"], ext: false },
    pagos: { rows: pagos, cols: ["id", "tarea_id", "monto", "estado", "mercadopago_id"], ext: false },
    calificaciones: { rows: califs, cols: ["id_calificaciones", "tarea_id", "repartidor_id", "puntaje"], ext: false },
    mensajes: { rows: mensajes, cols: ["id_mensaje", "emisor_id", "receptor_id", "mensaje"], ext: false },
    notificaciones: { rows: notifs, cols: ["id_notificacion", "id_usuario", "titulo", "leida"], ext: false },
    postulaciones: { rows: postuls, cols: ["id_postulacion", "tarea_id", "repartidor_id", "estado"], ext: false },
    disputas: { rows: disputas, cols: ["id_disputa", "tarea_id", "abierta_por", "estado"], ext: false },
    evidencias: { rows: evids, cols: ["id_evidencia", "disputa_id", "usuario_id", "tipo"], ext: false },
  };
  return (
    <div className="pad">
      <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
        <div className="row"><Ic n="pin" s={15} c="var(--nar-osc)" /><b style={{ fontSize: 13 }}>Cambios para el radio</b></div>
        <p className="muted" style={{ marginTop: 6 }}>
          Una columna nueva en <span className="mono">usuarios</span>: <span className="mono">radio_km</span> (entero, por defecto 10). Las coordenadas ya existían.
        </p>
        <div className="sep" />
        <span className="eyebrow">Zona operativa (configuración global)</span>
        <div className="kv" style={{ marginTop: 4 }}><span className="muted">centro</span><span className="mono">{zona.latitud.toFixed(4)}, {zona.longitud.toFixed(4)}</span></div>
        <div className="kv"><span className="muted">radio_km</span><span className="mono">{zona.radio_km}</span></div>
      </div>
      {Object.entries(tablas).map(([n, tb]) => (
        <div key={n} className="card" style={{ padding: 0, overflow: "hidden" }}>
          <button style={{ width: "100%", border: 0, background: "none", padding: 13, font: "inherit", cursor: "pointer" }} onClick={() => setAbierta(abierta === n ? null : n)}>
            <div className="between">
              <div className="row" style={{ gap: 8 }}>
                <Ic n="db" s={15} c={tb.ext ? "var(--gris)" : "var(--nar)"} />
                <b className="mono" style={{ fontSize: 12.5 }}>{n}</b>
                {tb.ext && <span className="badge b-canc">ext</span>}
              </div>
              <span className="tiny">{tb.rows.length} filas</span>
            </div>
          </button>
          {abierta === n && (
            <div style={{ borderTop: "1px solid var(--linea)", overflowX: "auto", background: "var(--hueso)" }}>
              <table className="mono" style={{ borderCollapse: "collapse", width: "100%", fontSize: 10.5 }}>
                <thead><tr>{tb.cols.map((c) => <th key={c} style={{ textAlign: "left", padding: "7px 9px", color: "var(--gris)", whiteSpace: "nowrap", borderBottom: "1px solid var(--linea)" }}>{c}</th>)}</tr></thead>
                <tbody>
                  {tb.rows.slice(-8).map((r, i) => (
                    <tr key={i}>{tb.cols.map((c) => (
                      <td key={c} style={{ padding: "6px 9px", borderBottom: "1px solid var(--linea)", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {String(r[c] ?? "null").slice(0, 22)}
                      </td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ═══════════ UBICACIÓN Y RADIO (usuario) ═══════════ */
function Ubicacion(ctx) {
  const { yo, uid, rol, usuarios, tareas, zona, radioDe, setRadio, moverme, say, U, go } = ctx;
  const [buscando, setBuscando] = useState(false);
  const radio = radioDe(yo);
  const max = zona.radio_km;

  const puntos = useMemo(() => {
    const p = [];
    if (rol === "cliente") {
      usuarios.filter((u) => u.id_usuario !== uid && ["repartidor", "ambos"].includes(u.rol))
        .forEach((u) => p.push({ ...proyectar(yo.latitud, yo.longitud, u.latitud, u.longitud), tipo: "persona", label: `${u.nombre} ${u.apellido}` }));
    } else {
      tareas.filter((t) => t.estado === "pendiente" && t.cliente_id !== uid)
        .forEach((t) => p.push({ ...proyectar(yo.latitud, yo.longitud, t.latitud, t.longitud), tipo: "tarea", label: t.titulo }));
    }
    return p;
  }, [usuarios, tareas, yo, rol, uid]);

  const gps = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return say("Este dispositivo no comparte ubicación.");
    setBuscando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { moverme(pos.coords.latitude, pos.coords.longitude); setBuscando(false); say("Ubicación actualizada"); },
      () => { setBuscando(false); say("No se pudo leer el GPS. Elegí un punto de la lista."); },
      { timeout: 8000 }
    );
  };

  return (
    <div className="pad">
      <p className="muted" style={{ marginBottom: 12 }}>
        {rol === "cliente"
          ? "Definí hasta qué distancia querés que te atiendan. Los emprendedores que queden fuera de este radio no van a ver tus tareas."
          : "Definí hasta dónde estás dispuesto a moverte. Solo vas a ver tareas dentro de este radio."}
      </p>

      <ControlRadio
        radio={radio} setRadio={setRadio} max={max} puntos={puntos}
        etiqueta={(rol === "cliente" ? "● emprendedores" : "◆ tareas disponibles") + "   ·   centro ampliado"}
        resumen={(dentro, fuera) =>
          rol === "cliente"
            ? <>Hay <b>{dentro} {dentro === 1 ? "emprendedor" : "emprendedores"}</b> en tu radio{fuera > 0 && <> y {fuera} más allá del límite</>}.</>
            : <>Alcanzás <b>{dentro} {dentro === 1 ? "tarea" : "tareas"}</b> con este radio{fuera > 0 && <>; {fuera} quedan afuera</>}.</>}
      />

      <div className="card">
        <span className="eyebrow">Mi ubicación</span>
        <div className="row" style={{ marginTop: 8, marginBottom: 10 }}>
          <span className="catbox"><Ic n="pin" s={14} c="var(--nar-osc)" /></span>
          <div className="stack grow">
            <b style={{ fontSize: 13.5 }}>{PUNTOS_DEMO.reduce((m, p) => (km(p.lat, p.lng, yo.latitud, yo.longitud) < km(m.lat, m.lng, yo.latitud, yo.longitud) ? p : m)).n}</b>
            <span className="mono">{Number(yo.latitud).toFixed(4)}, {Number(yo.longitud).toFixed(4)}</span>
          </div>
        </div>
        <button className="btn btn-out btn-sm" style={{ width: "100%" }} onClick={gps} disabled={buscando}>
          <Ic n="pin" s={15} /> {buscando ? "Buscando señal…" : "Usar mi ubicación actual"}
        </button>
        <div className="sep" />
        <p className="eyebrow" style={{ marginBottom: 8 }}>O elegí un punto</p>
        <div className="chips">
          {PUNTOS_DEMO.map((p) => {
            const acá = km(p.lat, p.lng, yo.latitud, yo.longitud) < 0.5;
            return <button key={p.n} className={"chip " + (acá ? "on" : "")} onClick={() => { moverme(p.lat, p.lng); say(`Ubicación: ${p.n}`); }}>{p.n}</button>;
          })}
        </div>
      </div>

      <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
        <div className="row"><Ic n="shield" s={16} c="var(--nar-osc)" /><b style={{ fontSize: 13 }}>Cómo se cruzan los radios</b></div>
        <p className="muted" style={{ marginTop: 6 }}>
          Una tarea aparece solo si la distancia entra en los dos radios: el del cliente y el del emprendedor. Alcanza con que uno de los dos la deje afuera para que no se muestre.
        </p>
        <p className="tiny" style={{ marginTop: 8 }}>Tope de la plataforma: {zona.radio_km} km, fijado por la administración para {zona.nombre}.</p>
      </div>

      {rol === "cliente" && <button className="btn btn-pri" onClick={() => go("gente")}>Ver quién está en mi radio</button>}
    </div>
  );
}

/* ═══════════ GENTE CERCA (cliente) ═══════════ */
function Gente(ctx) {
  const { yo, uid, usuarios, ratingDe, radioDe, go, tareas } = ctx;
  const [orden, setOrden] = useState("cerca");
  const radio = radioDe(yo);
  const l = usuarios
    .filter((u) => u.id_usuario !== uid && ["repartidor", "ambos"].includes(u.rol))
    .map((u) => ({ u, d: km(yo.latitud, yo.longitud, u.latitud, u.longitud), r: ratingDe(u.id_usuario) }))
    .filter((x) => x.d <= radio)
    .sort((a, b) => (orden === "cerca" ? a.d - b.d : orden === "puntaje" ? b.r.prom - a.r.prom : b.u.tareas_realizadas - a.u.tareas_realizadas));

  return (
    <div className="pad">
      <div className="between" style={{ marginBottom: 10 }}>
        <p className="muted">Emprendedores dentro de {radio} km.</p>
        <button className="chip" onClick={() => go("ubicacion")}>Cambiar radio</button>
      </div>
      <div className="chips" style={{ marginBottom: 12 }}>
        {[["cerca", "Más cerca"], ["puntaje", "Mejor puntaje"], ["exp", "Más trabajos"]].map(([v, t]) => (
          <button key={v} className={"chip " + (orden === v ? "on" : "")} onClick={() => setOrden(v)}>{t}</button>
        ))}
      </div>
      {l.length === 0 ? <Empty t="Nadie en este radio" d="Ampliá el radio de búsqueda para encontrar más gente disponible." /> :
        l.map(({ u, d, r }) => (
          <div key={u.id_usuario} className="card tap" onClick={() => go("perfilOtro", { id: u.id_usuario })}>
            <div className="row">
              <Avatar u={u} s={44} />
              <div className="stack grow">
                <div className="between"><b style={{ fontSize: 14 }}>{u.nombre} {u.apellido}</b><span className="dist"><Ic n="pin" s={10} w={2.4} />{fkm(d)}</span></div>
                <div className="row" style={{ gap: 5 }}>
                  <Stars v={r.prom} />
                  <span className="tiny">{r.n ? `${r.prom.toFixed(1)} · ${r.n} reseñas` : "sin reseñas"}</span>
                </div>
                <span className="tiny">{u.tareas_realizadas} trabajos terminados · alcanza hasta {u.radio_km} km</span>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}

/* ═══════════ ZONA OPERATIVA (administrador) ═══════════ */
function ZonaAdmin(ctx) {
  const { zona, setZona, usuarios, tareas, say, nombreDe, go, disputas } = ctx;
  const [r, setR] = useState(zona.radio_km);

  const puntos = useMemo(() => [
    ...usuarios.filter((u) => u.rol !== "admin").map((u) => ({ ...proyectar(zona.latitud, zona.longitud, u.latitud, u.longitud), tipo: "persona", label: `${u.nombre} ${u.apellido}` })),
    ...tareas.filter((t) => t.estado === "pendiente").map((t) => ({ ...proyectar(zona.latitud, zona.longitud, t.latitud, t.longitud), tipo: "tarea", label: t.titulo })),
  ], [usuarios, tareas, zona]);

  const fueraUsuarios = usuarios.filter((u) => u.rol !== "admin" && km(zona.latitud, zona.longitud, u.latitud, u.longitud) > r);
  const excedidos = usuarios.filter((u) => (u.radio_km ?? 0) > r);
  const escala = 60;

  return (
    <div className="pad">
      <p className="muted" style={{ marginBottom: 12 }}>
        La zona operativa define dónde funciona Mandadito. Marca el tope máximo que cualquier usuario puede elegir como radio y deja fuera de servicio lo que quede más lejos.
      </p>

      <div className="card">
        <Radar radio={r} escala={escala} puntos={puntos} etiqueta="◆ tareas   ● usuarios   ·   centro ampliado" />
        <div className="between" style={{ margin: "10px 0 6px" }}>
          <span className="eyebrow">Radio de cobertura</span>
          <span className="mono" style={{ fontSize: 17, fontWeight: 700, color: "var(--nar-osc)" }}>{r} km</span>
        </div>
        <input type="range" min="5" max={escala} value={r} onChange={(e) => setR(Number(e.target.value))} style={{ padding: 0, border: 0, accentColor: "var(--nar)", height: 22 }} aria-label="Radio de la zona" />
        <div className="sep" />
        <div className="kv"><span className="muted">Centro</span><b>{zona.nombre}</b></div>
        <div className="kv"><span className="muted">Coordenadas</span><span className="mono">{zona.latitud.toFixed(4)}, {zona.longitud.toFixed(4)}</span></div>
        <div className="kv"><span className="muted">Usuarios cubiertos</span><b>{usuarios.filter((u) => u.rol !== "admin").length - fueraUsuarios.length} de {usuarios.filter((u) => u.rol !== "admin").length}</b></div>
        <div className="kv"><span className="muted">Tareas abiertas dentro</span><b>{puntos.filter((p) => p.tipo === "tarea" && p.d <= r).length}</b></div>
      </div>

      {r !== zona.radio_km && (
        <div className="btn-row">
          <button className="btn btn-out" onClick={() => setR(zona.radio_km)}>Descartar</button>
          <button className="btn btn-pri" onClick={() => { setZona({ ...zona, radio_km: r }); say(`Zona actualizada a ${r} km`); }}>Guardar zona</button>
        </div>
      )}

      {fueraUsuarios.length > 0 && (
        <>
          <h3 style={{ margin: "16px 0 8px" }}>Fuera de cobertura</h3>
          <p className="muted" style={{ marginBottom: 8 }}>Con {r} km, estas cuentas quedan sin servicio.</p>
          {fueraUsuarios.map((u) => (
            <div key={u.id_usuario} className="card tap" onClick={() => go("perfilOtro", { id: u.id_usuario })}>
              <div className="row">
                <Avatar u={u} s={34} />
                <div className="stack grow"><b style={{ fontSize: 13.5 }}>{u.nombre} {u.apellido}</b><span className="tiny">{u.rol}</span></div>
                <span className="badge b-canc">{fkm(km(zona.latitud, zona.longitud, u.latitud, u.longitud))}</span>
              </div>
            </div>
          ))}
        </>
      )}

      {excedidos.length > 0 && (
        <div className="card" style={{ background: "var(--nar-luz)", borderColor: "#F7D9BE" }}>
          <div className="row"><Ic n="shield" s={16} c="var(--nar-osc)" /><b style={{ fontSize: 13 }}>{excedidos.length} {excedidos.length === 1 ? "usuario pidió" : "usuarios pidieron"} más radio del permitido</b></div>
          <p className="muted" style={{ marginTop: 6 }}>
            Se les aplica el tope de {r} km sin cambiarles la preferencia guardada: si mañana ampliás la zona, vuelven a su valor original.
          </p>
          <p className="tiny" style={{ marginTop: 8 }}>{excedidos.map((u) => `${u.nombre} (${u.radio_km} km)`).join(" · ")}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════ HOJAS MODALES ═══════════ */
function Sheet(ctx) {
  const { sheet, setSheet, postularse, eliminarTarea, abrirDisputa, agregarEvidencia, calificar, U } = ctx;
  const [txt, setTxt] = useState("");
  const [pt, setPt] = useState(5);
  const [tipo, setTipo] = useState("texto");
  const k = sheet.k;
  const cerrar = () => setSheet(null);

  const cuerpo = {
    postular: {
      t: "Postularte a esta tarea",
      d: "Contale al cliente por qué sos la persona indicada.",
      body: <textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Tengo moto y estoy a diez minutos de esa dirección." />,
      cta: "Enviar postulación",
      go: () => postularse(sheet.t.id_tarea, txt.trim() || "Me interesa esta tarea."),
    },
    borrar: {
      t: "¿Eliminar la publicación?",
      d: "Se borra la tarea y las postulaciones que recibió. No se puede deshacer.",
      body: null,
      cta: "Eliminar la tarea",
      danger: true,
      go: () => eliminarTarea(sheet.t.id_tarea),
    },
    disputa: {
      t: "Abrir una disputa",
      d: "El pago queda retenido hasta que el equipo revise el caso. Explicá qué pasó.",
      body: <textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Falta pintar el portón lateral y hay zonas sin cubrir." />,
      cta: "Abrir la disputa",
      danger: true,
      disabled: txt.trim().length < 10,
      go: () => abrirDisputa(sheet.t, txt.trim()),
    },
    evidencia: {
      t: "Adjuntar evidencia",
      d: "Sumá una foto o una explicación al expediente.",
      body: (
        <>
          <div className="chips" style={{ marginBottom: 10 }}>
            {[["texto", "Explicación"], ["foto", "Foto"], ["archivo", "Archivo"]].map(([v, l]) => (
              <button key={v} className={"chip " + (tipo === v ? "on" : "")} onClick={() => setTipo(v)}>{l}</button>
            ))}
          </div>
          <textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Describí lo que estás adjuntando." />
        </>
      ),
      cta: "Adjuntar",
      disabled: !txt.trim(),
      go: () => agregarEvidencia(sheet.d.id_disputa, tipo, txt.trim()),
    },
    calificar: {
      t: `¿Cómo estuvo ${U(sheet.t?.repartidor_id)?.nombre || "el trabajo"}?`,
      d: "Tu reseña ayuda al resto de los clientes a elegir mejor.",
      body: (
        <>
          <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "6px 0 14px" }}>
            <Stars v={pt} editable onPick={setPt} />
          </div>
          <textarea value={txt} onChange={(e) => setTxt(e.target.value)} placeholder="Contá cómo fue la experiencia." />
        </>
      ),
      cta: "Enviar calificación",
      go: () => calificar(sheet.t, pt, txt.trim() || "Sin comentarios."),
    },
  }[k];

  return (
    <div className="sheet-bg" onClick={cerrar}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="between" style={{ marginBottom: 4 }}>
          <h2>{cuerpo.t}</h2>
          <button className="btn btn-sm" style={{ background: "var(--hueso)", padding: 8 }} onClick={cerrar} aria-label="Cerrar"><Ic n="x" s={16} /></button>
        </div>
        <p className="muted" style={{ marginBottom: 14 }}>{cuerpo.d}</p>
        {cuerpo.body}
        <button className={"btn " + (cuerpo.danger ? "btn-err" : "btn-pri")} style={{ marginTop: 12 }} disabled={cuerpo.disabled} onClick={cuerpo.go}>{cuerpo.cta}</button>
        <button className="btn btn-out" style={{ marginTop: 8 }} onClick={cerrar}>Cancelar</button>
      </div>
    </div>
  );
}
