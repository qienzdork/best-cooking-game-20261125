// config.js — every tunable number, ingredient and recipe of The Golden Skillet.
// One clear job: the game's data. No logic lives here.
export const VIEW_W = 1280;
export const VIEW_H = 720;
export const SHIFT_LENGTH = 150; // seconds per shift
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 4;
export const ORDER_EVERY = 11; // seconds between new orders
export const ORDER_PATIENCE = 48; // seconds before a customer walks out
export const CHOP_TIME = 1.6; // seconds on the chopping board
export const GRILL_TIME = 4.5; // seconds until a patty is cooked
export const BURN_TIME = 9.0; // seconds until a cooked patty burns
export const CHEF_SPEED = 265; // px per second

// Ingredients. A crate hands out the raw form; the board or grill turns it
// into the served form named in `served`. Bun and cheese need no prep.
export const INGREDIENTS = {
  tomato:  { name: 'Tomato',  color: '#e5484d', dark: '#a92c31', raw: 'tomato-raw',  served: 'tomato',  prep: 'chop', prepName: 'Chop' },
  lettuce: { name: 'Lettuce', color: '#7ac74f', dark: '#4c8a2f', raw: 'lettuce-raw', served: 'lettuce', prep: 'chop', prepName: 'Chop' },
  onion:   { name: 'Onion',   color: '#e8d8f0', dark: '#b08cc4', raw: 'onion-raw',   served: 'onion',   prep: 'chop', prepName: 'Chop' },
  patty:   { name: 'Patty',   color: '#b06a3b', dark: '#7c4522', raw: 'patty-raw',   served: 'patty',   prep: 'grill', prepName: 'Grill' },
  cheese:  { name: 'Cheese',  color: '#ffc93c', dark: '#d99a12', raw: 'cheese',      served: 'cheese',  prep: 'none', prepName: '' },
  bun:     { name: 'Bun',     color: '#e8a95c', dark: '#b57a2e', raw: 'bun',         served: 'bun',     prep: 'none', prepName: '' },
};

// A dish is a set of served-form ingredients. Order of items never matters.
export const RECIPES = [
  { id: 'salad',  name: 'Garden Salad',  items: ['lettuce', 'tomato', 'onion'],                 price: 18, tint: '#7ac74f' },
  { id: 'melt',   name: 'Cheesy Melt',   items: ['bun', 'cheese', 'tomato'],                     price: 20, tint: '#ffc93c' },
  { id: 'burger', name: 'Golden Burger', items: ['bun', 'patty', 'cheese', 'lettuce'],           price: 26, tint: '#e8a95c' },
  { id: 'stack',  name: 'Veggie Stack',  items: ['bun', 'lettuce', 'tomato', 'onion', 'cheese'], price: 30, tint: '#e5484d' },
];

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Kitchen floor plan. Counters hug the walls; the chef walks the open floor.
// Each station: id, label, rect, and the floor point the chef stands on to use it.
export const STATIONS = [
  { id: 'crate-tomato',  kind: 'crate', item: 'tomato',  label: 'Tomatoes', x: 30,  y: 150, w: 96, h: 76, stand: { x: 78,  y: 252 } },
  { id: 'crate-lettuce', kind: 'crate', item: 'lettuce', label: 'Lettuce',  x: 134, y: 150, w: 96, h: 76, stand: { x: 182, y: 252 } },
  { id: 'crate-onion',   kind: 'crate', item: 'onion',   label: 'Onions',   x: 238, y: 150, w: 96, h: 76, stand: { x: 286, y: 252 } },
  { id: 'crate-patty',   kind: 'crate', item: 'patty',   label: 'Patties',  x: 342, y: 150, w: 96, h: 76, stand: { x: 390, y: 252 } },
  { id: 'crate-cheese',  kind: 'crate', item: 'cheese',  label: 'Cheese',   x: 446, y: 150, w: 96, h: 76, stand: { x: 494, y: 252 } },
  { id: 'crate-bun',     kind: 'crate', item: 'bun',     label: 'Buns',     x: 550, y: 150, w: 96, h: 76, stand: { x: 598, y: 252 } },
  { id: 'board',          kind: 'board', label: 'Chopping Board', x: 690, y: 150, w: 150, h: 76, stand: { x: 765, y: 252 } },
  { id: 'grill',          kind: 'grill', label: 'Grill',  x: 884, y: 150, w: 190, h: 76, stand: { x: 979, y: 252 } },
  { id: 'plates',         kind: 'plates', label: 'Plates', x: 1118, y: 150, w: 96, h: 76, stand: { x: 1166, y: 252 } },
  { id: 'assembly',       kind: 'assembly', label: 'Assembly Counter', x: 690, y: 560, w: 240, h: 76, stand: { x: 810, y: 536 } },
  { id: 'serve',          kind: 'serve', label: 'Serving Window', x: 974, y: 560, w: 240, h: 76, stand: { x: 1094, y: 536 } },
  { id: 'trash',          kind: 'trash', label: 'Bin',    x: 30,  y: 560, w: 84, h: 76, stand: { x: 72,  y: 536 } },
];

// Walkable floor (inside the walls, below the order board).
export const FLOOR = { x: 16, y: 140, w: 1248, h: 564 };
export const CHEF_START = { x: 640, y: 420 };
