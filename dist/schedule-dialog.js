import { periods, validAmount, horizonLabel } from './model.js';
import { defaultUsage } from './defaults.js';
import { h, refocus } from './dom.js';
import { resolve, estimate, format, amountUnit, usageText } from './comparison.js';

// Edits one activity's quantity and frequency. Valid changes apply as they are typed.
export function editSchedule({ item, store, anchor }) {
  const unit = amountUnit(item);
  const { group, before, name } = resolve(item, store.state);
  const suggested = defaultUsage(group, before);
  const live = () => store.state.choices.find(candidate => candidate.uid === item.uid) || item;
  const amount = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(Number((item.amount * unit.scale).toPrecision(12))) });
  const times = h('input', { type: 'number', min: '0', step: 'any', inputmode: 'decimal', value: String(item.times) });
  const period = h('select', {}, Object.entries(periods).map(([id, record]) => h('option', { value: id, text: record.label, selected: id === item.period })));
  const timesLabel = h('span');
  const timesField = h('label', { class: 'field' }, timesLabel, times);
  const summary = h('p', { class: 'schedule-summary' });
  const assumption = h('p', { class: 'schedule-assumption' });
  const error = h('p', { class: 'schedule-error', role: 'status', text: 'Enter a positive quantity and frequency.' });
  const node = h('dialog', { class: 'schedule-dialog', 'aria-label': 'Schedule for ' + name });

  function apply() {
    const nextAmount = amount.valueAsNumber / unit.scale;
    const nextTimes = period.value === 'once' ? 1 : times.valueAsNumber;
    timesField.hidden = period.value === 'once';
    timesLabel.textContent = 'Times per ' + ({ daily: 'day', weekly: 'week', monthly: 'month' }[period.value] || 'period');
    const valid = validAmount(nextAmount) && validAmount(nextTimes);
    amount.setAttribute('aria-invalid', String(!validAmount(nextAmount)));
    times.setAttribute('aria-invalid', String(!validAmount(nextTimes)));
    error.hidden = valid;
    const before = live();
    if (valid && (before.amount !== nextAmount || before.times !== nextTimes || before.period !== period.value)) {
      store.patch(item.uid, { amount: nextAmount, times: nextTimes, period: period.value });
    }
    const now = live();
    const state = store.state;
    const total = estimate(now, state.metric, state).current;
    summary.textContent = usageText(now) + (total === null ? '' : ' · ' + format(total, state.metric) + ' over ' + horizonLabel(state.horizon));
    assumption.textContent = ['amount', 'period', 'times'].every(key => now[key] === suggested[key]) ? suggested.description : '';
    assumption.hidden = !assumption.textContent;
  }

  for (const control of [amount, times, period]) control.addEventListener('input', apply);
  node.append(
    h('div', { class: 'dialog-header' }, h('h2', { text: name }),
      h('button', { type: 'button', class: 'dialog-close', text: 'Close', onclick: () => node.close() })),
    h('form', { method: 'dialog', class: 'schedule-form' },
      h('label', { class: 'field' }, h('span', { text: 'Quantity (' + unit.label + ')' }), amount),
      h('label', { class: 'field' }, h('span', { text: 'Frequency' }), period),
      timesField, error, summary, assumption,
      h('button', { type: 'submit', class: 'primary', text: 'Done' })));
  // The views rebuild their rows as the schedule changes, so focus returns by key.
  const focusKey = anchor?.dataset.focus;
  const box = anchor?.getBoundingClientRect();
  node.addEventListener('close', () => {
    node.remove();
    if (focusKey) refocus(focusKey);
  });
  document.body.append(node);
  apply();
  node.showModal();
  if (box && window.matchMedia('(min-width: 721px)').matches) {
    node.style.margin = '0';
    node.style.left = Math.max(12, Math.min(window.innerWidth - node.offsetWidth - 12, box.left)) + 'px';
    node.style.top = Math.max(12, Math.min(window.innerHeight - node.offsetHeight - 12, box.bottom + 8)) + 'px';
  }
  amount.select();
}
