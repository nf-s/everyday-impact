import { validCatalogueChoice } from './entries.js';
import { comparisonMetrics, horizonLabel, horizonUnits, validHorizon } from './model.js';
import { h } from './dom.js';
import { createStore, grids, metricKeys, needsGrid, usesGroup, shareState } from './comparison.js';
import { exampleOptions, exampleChoices, defaultExample } from './examples.js';
import { createActions } from './actions.js';
import { mountWords } from './words-view.js';
import { mountTable } from './table-view.js';
import { mountLibrary, mountLabour } from './library.js';
import { setupQuestionForm } from './question.js';
import { comparisonFromURL } from './share-state.js';
import { setupSharing } from './share.js';

const view = id => document.getElementById(id);
const store = createStore();
const actions = createActions(store);
const gridIds = grids.map(grid => grid.id);

const metricSelect = view('measure');
const amountInput = view('horizon-amount');
const unitSelect = view('horizon-unit');
const gridSelect = view('estimate-grid');
const examples = view('examples');

unitSelect.replaceChildren(...Object.entries(horizonUnits).map(([id, unit]) => new Option(unit.label.toLowerCase(), id)));
gridSelect.replaceChildren(new Option('Source figures only', ''), ...grids.map(grid => new Option(grid.label, grid.id)));
examples.replaceChildren(new Option('Custom comparison', 'custom'), ...exampleOptions.map(([id, label]) => new Option(label, id)));
examples.options[0].disabled = true;

function syncControls(state) {
  metricSelect.replaceChildren(...metricKeys(state).map(key => h('option', { value: key, text: comparisonMetrics[key].label, selected: key === state.metric })));
  metricSelect.disabled = !metricSelect.options.length;
  if (document.activeElement !== amountInput) amountInput.value = String(state.horizon.amount);
  unitSelect.value = state.horizon.unit;
  gridSelect.value = state.grid;
  view('grid-scenario').hidden = !needsGrid(state);
  view('electronics-credit').hidden = !usesGroup(state, 'digital-devices');
}

function updateHorizon() {
  const valid = store.setHorizon({ amount: amountInput.valueAsNumber, unit: unitSelect.value });
  amountInput.setAttribute('aria-invalid', String(!valid));
  view('horizon-error').hidden = valid;
  if (!valid) view('horizon-error').textContent = 'Enter a whole number from 1 to 1,000. Results still use ' + horizonLabel(store.state.horizon) + '.';
}

metricSelect.addEventListener('change', () => store.setMetric(metricSelect.value));
gridSelect.addEventListener('change', () => store.setGrid(gridSelect.value));
view('comparison-horizon').addEventListener('input', event => { if (event.target === amountInput || event.target === unitSelect) updateHorizon(); });
view('comparison-horizon').addEventListener('submit', event => {
  event.preventDefault();
  updateHorizon();
});
view('add-choice').addEventListener('click', actions.addActivity);

const renderWords = mountWords({
  section: view('words-view'), rail: view('rail'), plot: view('plot'), tip: view('tip'), list: view('rows'), notes: view('words-notes'), store, actions
});
mountTable({ section: view('numbers-view'), table: view('numbers-table'), notes: view('numbers-notes'), sharedOnly: view('shared-only'), store, actions });
const renderLibrary = mountLibrary({
  search: view('search'), category: view('filter-category'), list: view('library-groups'), count: view('library-count'),
  onUse(choice) {
    store.add(choice);
    location.hash = 'compare';
  }
});
mountLabour(view('labour-records'));

// A loaded example or question result stays selected until the comparison is edited.
let applying = false;
function load(comparison) {
  applying = true;
  store.load(comparison);
  applying = false;
}

const questionForm = setupQuestionForm(({ choices, horizon }) => {
  if (!choices.every(validCatalogueChoice) || (horizon !== undefined && !validHorizon(horizon))) {
    throw new Error('The suggested choices could not be applied.');
  }
  load({ choices, horizon });
  examples.value = 'custom';
});
const sharing = setupSharing(() => shareState(store.state), validCatalogueChoice, gridIds);

store.subscribe(state => {
  syncControls(state);
  sharing.invalidate();
  if (applying) return;
  questionForm.invalidate();
  examples.value = 'custom';
});

function loadExample(id) {
  const choices = exampleChoices(id);
  if (!choices) return;
  questionForm.invalidate();
  load({ choices });
  examples.value = id;
}
examples.addEventListener('change', () => loadExample(examples.value));

const pages = { compare: 'compare', numbers: 'compare', library: 'library', labour: 'labour' };
function navigate() {
  const hash = Object.hasOwn(pages, location.hash.slice(1)) ? location.hash.slice(1) : 'compare';
  for (const name of new Set(Object.values(pages))) view(name).hidden = name !== pages[hash];
  view('words-view').hidden = hash !== 'compare';
  view('numbers-view').hidden = hash !== 'numbers';
  for (const link of document.querySelectorAll('.top a[href^="#"]:not(.brand)')) {
    if (link.getAttribute('href') === '#' + hash) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  if (hash === 'compare') renderWords();
  if (hash === 'library') renderLibrary();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navigate);

let shared = null;
try {
  shared = comparisonFromURL(location.href, validCatalogueChoice, gridIds);
} catch {
  sharing.showError('This comparison link could not be restored. The selected example is shown instead.');
}
navigate();
if (shared) {
  load({ ...shared, choices: shared.choices.filter(Boolean) });
  examples.value = 'custom';
} else {
  const requested = new URLSearchParams(location.search).get('example');
  loadExample(exampleChoices(requested) ? requested : defaultExample);
}
