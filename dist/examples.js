// Example comparisons offered in the Examples menu and through ?example= links.
import { groups } from './data/catalogue.js';
import { defaultChoice } from './entries.js';

const byId = new Map(groups.map(group => [group.id, group]));
const pick = (group, before, after, amount = 1, period = 'once') => ({ group, before, after, amount, period, times: 1 });
const usual = (group, before, after = null) => {
  const record = byId.get(group);
  return { ...defaultChoice(record, record.options.find(option => option.id === before)), after, kind: after ? 'swap' : 'footprint' };
};
const presets = [
  { id: 'everyday', label: 'Flight, beef, commute, phone and AI prompts', mode: 'changes', choices: [
    usual('return-flight', 'paris-new-york-return'), usual('food-products', 'beef-steak', 'tofu'),
    usual('surface-travel', 'petrol-car-solo', 'national-rail'), usual('digital-devices', 'generic-smartphone'),
    usual('ai-request', 'gemini-text-2025')] },
  { id: 'ai-beef', label: 'AI prompts and beef', mode: 'footprints', choices: [
    defaultChoice(byId.get('ai-request'), byId.get('ai-request').options[0]),
    defaultChoice(byId.get('us-beef'), byId.get('us-beef').options[0])] },
  { id: 'web-app-kettle', label: 'Build a web app and run a kettle', mode: 'footprints', choices: [
    pick('ai-web-app-development', 'prototype-qwen3-coder-480b-fp8-b200', null),
    pick('everyday-electricity', 'kettle-three-minutes', null)] },
  { id: 'bug-fix-microwave', label: 'Attempt a bug fix and use a microwave', mode: 'footprints', choices: [
    pick('ai-coding-agent-bug-fix', 'autocoderover-qwen3-1-7b-attempt', null),
    pick('everyday-electricity', 'microwave-three-minutes', null)] },
  { id: 'image-light', label: 'Generate an image and light an LED bulb', mode: 'footprints', choices: [
    pick('ai-image-generation', 'luccioni-2024-image-generation', null),
    pick('everyday-electricity', 'led-hour', null)] },
  { id: 'video-laptop', label: 'Generate a video clip and use a laptop', mode: 'footprints', choices: [
    pick('ai-video-generation', 'video-2025-cogvideox-5b', null),
    pick('everyday-electricity', 'laptop-hour', null)] },
  { id: 'flight-diet', label: 'Flight and diet', mode: 'changes', choices: [
    pick('return-flight', 'paris-new-york-return', null), pick('uk-diets', 'low-meat', 'vegan', 1, 'daily')] },
  { id: 'food-water', label: 'Beef and tofu', mode: 'footprints', choices: [
    pick('food-products', 'beef-steak', null, 0.15), pick('food-products', 'tofu', null, 0.15)] },
  { id: 'household-water', label: 'Showering and laundry', mode: 'changes', choices: [
    pick('shower', 'higher-9l', 'efficient-6l', 4, 'daily'), pick('laundry-load', 'washer-6kg-3star', 'washer-6kg-4star', 4, 'weekly')] },
  { id: 'hobart', label: 'Hobart flights and meals', mode: 'changes', choices: [
    pick('australian-flight-routes', 'hobart-melbourne-economy', null, 2), pick('french-meals', 'beef', 'vegan', 1, 'weekly')] },
  { id: 'travel-meals', label: 'Commuting and meals', mode: 'changes', choices: [
    pick('surface-travel', 'petrol-car-solo', 'national-rail', 50, 'weekly'), pick('french-meals', 'beef', 'vegan', 3, 'weekly')] },
  { id: 'ai', label: 'AI use and a return flight', mode: 'footprints', choices: [
    pick('ai-request', 'gemini-text-2025', null, 20, 'daily'), pick('return-flight', 'paris-new-york-return', null)] },
  { id: 'goods', label: 'A T-shirt and a smartphone', mode: 'footprints', choices: [
    pick('apparel', 'cotton-tshirt', null), pick('digital-devices', 'smartphone', null)] },
  { id: 'dishwashers', label: 'Two 14-place dishwashers', mode: 'footprints', choices: [
    pick('dishwasher-cycles', 'adw1264', null, 1, 'daily'), pick('dishwasher-cycles', 'adw1142', null, 1, 'daily')] },
  { id: 'tomato-season', label: 'In-season and out-of-season tomatoes', mode: 'footprints', choices: [
    pick('agb-plants', 'agb-20047_2', null, 1), pick('agb-plants', 'agb-20047_3', null, 1)] },
  { id: 'materials', label: 'New and second-hand clothing', mode: 'footprints', choices: [
    pick('clothing-material', 'clothing-primary', null, 0.2), pick('clothing-material', 'clothing-reused', null, 0.2)] },
  { id: 'grids', label: 'Electricity in Tasmania and Victoria', mode: 'footprints', choices: [
    pick('au-grid-electricity', 'tasmania', null, 10, 'daily'), pick('au-grid-electricity', 'victoria', null, 10, 'daily')] }
];

export const defaultExample = 'everyday';
export const exampleOptions = presets.map(preset => [preset.id, preset.label]);

// In a "changes" example an activity without a set kind or replacement is compared with skipping it.
export function exampleChoices(id) {
  const preset = presets.find(item => item.id === id);
  if (!preset) return null;
  return preset.choices.map(item => ({
    ...item, kind: item.kind ?? (preset.mode === 'footprints' ? 'footprint' : item.after ? 'swap' : 'skip')
  }));
}
