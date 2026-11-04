import { foodGroups } from './food.js';
import { genericFoodGroups } from './food-generics.js';
import { travelUseGroups } from './travel-use.js';
import { goodsGroups } from './goods.js';
import { applianceGroups } from './appliances.js';
import { materialGroups } from './materials.js';
import { energyTravelGroups } from './energy-travel.js';
import { withActivityGenerics } from './activity-generics.js';

export const groups = withActivityGenerics([...genericFoodGroups, ...foodGroups, ...travelUseGroups, ...goodsGroups, ...applianceGroups, ...materialGroups, ...energyTravelGroups]);
