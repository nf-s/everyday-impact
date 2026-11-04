import { foodGroups } from './food.js';
import { travelUseGroups } from './travel-use.js';
import { goodsGroups } from './goods.js';
import { applianceGroups } from './appliances.js';
import { materialGroups } from './materials.js';
import { energyTravelGroups } from './energy-travel.js';

export const groups = [...foodGroups, ...travelUseGroups, ...goodsGroups, ...applianceGroups, ...materialGroups, ...energyTravelGroups];
