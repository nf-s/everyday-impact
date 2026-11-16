// The dialogs both views open: choosing activities and alternatives, editing a schedule
// and showing the calculation behind a figure.
import { searchEntries } from './entries.js';
import { openActivityPicker } from './picker.js';
import { showMeasureDetails } from './measure-dialog.js';
import { editSchedule } from './schedule-dialog.js';
import { resolve, alternativePool, pickerCoverage, measureEntry, measureUnit } from './comparison.js';

export function createActions(store) {
  return {
    addActivity() {
      openActivityPicker(searchEntries, entry => store.add(entry.choice), {
        label: 'Add an activity', coverage: () => pickerCoverage(store.state, null)
      });
    },
    changeActivity(item) {
      openActivityPicker(searchEntries, entry => store.replaceActivity(item.uid, entry.choice), {
        label: 'Change ' + resolve(item, store.state).name, coverage: () => pickerCoverage(store.state, item.uid)
      });
    },
    chooseAlternative(item) {
      const pool = alternativePool(item);
      openActivityPicker(pool, entry => store.setAlternative(item.uid, 'swap', entry.choice), {
        label: 'Alternative to ' + resolve(item, store.state).name, flat: pool.length <= 12,
        coverage: () => pickerCoverage(store.state, item.uid, true),
        onSkip: () => store.setAlternative(item.uid, 'skip')
      });
    },
    editSchedule(item, anchor) {
      editSchedule({ item, store, anchor });
    },
    showDetails(item, key, opener, letter) {
      const state = store.state;
      const entry = measureEntry(item, key, state, letter);
      showMeasureDetails(key, [entry], opener, measureUnit(entry, key), state.horizon);
    }
  };
}
