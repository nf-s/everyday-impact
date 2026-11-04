import { foodGroups } from './food.js';
import { genericFoodGroups, foodPortions } from './food-generics.js';
import { travelUseGroups } from './travel-use.js';
import { goodsGroups } from './goods.js';
import { applianceGroups } from './appliances.js';
import { materialGroups } from './materials.js';
import { energyTravelGroups } from './energy-travel.js';
import { withActivityGenerics } from './activity-generics.js';
import { aiDevelopmentGroups } from './ai-development.js';
import { aiTaskGroups } from './ai-tasks.js';
import { chatGroup } from './ai-chat.js';
import { everydayElectricity } from './everyday-electricity.js';

export const groups = withActivityGenerics([...genericFoodGroups, foodPortions, ...foodGroups, ...travelUseGroups, ...goodsGroups, ...applianceGroups, ...materialGroups, ...energyTravelGroups,
  chatGroup, ...aiDevelopmentGroups, ...aiTaskGroups, everydayElectricity]);
