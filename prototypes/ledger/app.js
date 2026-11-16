import { createStore, needsGrid, grids, horizonUnits } from '../shared/engine.js';
import { h, harness, pickActivity } from '../shared/widgets.js';
import { mountLedger } from '../shared/ledger-view.js';

const store = createStore();
harness('ledger', store);

const view = id => document.getElementById(id);
const amountInput = view('horizon-amount');
const unitSelect = view('horizon-unit');
const gridSelect = view('grid');

unitSelect.append(...Object.entries(horizonUnits).map(([id, unit]) => h('option', { value: id, text: unit.label.toLowerCase() })));
gridSelect.append(h('option', { value: '', text: 'Source figures only' }), ...grids.map(grid => h('option', { value: grid.id, text: grid.label })));

function sync() {
  const state = store.state;
  amountInput.value = String(state.horizon.amount);
  unitSelect.value = state.horizon.unit;
  view('grid-field').hidden = !needsGrid(state);
  gridSelect.value = state.grid;
}

function commitHorizon() {
  store.setHorizon({ amount: amountInput.valueAsNumber, unit: unitSelect.value });
  amountInput.value = String(store.state.horizon.amount);
}
amountInput.addEventListener('change', commitHorizon);
unitSelect.addEventListener('change', commitHorizon);
gridSelect.addEventListener('change', () => store.setGrid(gridSelect.value));

const add = () => pickActivity({ title: 'Add activity', store, onPick: entry => store.add(entry) });
view('add').addEventListener('click', add);
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || document.querySelector('dialog[open]')) return;
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
  event.preventDefault();
  add();
});

store.subscribe(sync);
sync();
mountLedger({ table: view('ledger'), notes: view('notes'), store });
