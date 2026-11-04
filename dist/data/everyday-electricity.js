const method = { label: 'US Energy Information Administration · measuring electricity', url: 'https://www.eia.gov/energyexplained/electricity/measuring-electricity.php' };

// Power and duration are explicit scenario inputs. Electricity is calculated at the socket.
const uses = [
  ['led-hour', 'Light an LED bulb for an hour', 10, 60],
  ['kettle-three-minutes', 'Run an electric kettle for three minutes', 2000, 3],
  ['microwave-three-minutes', 'Use a microwave for three minutes', 1200, 3],
  ['laptop-hour', 'Use a laptop for an hour', 35, 60]
];

export const everydayElectricity = {
  id: 'everyday-electricity', label: 'Everyday appliance use', category: 'Appliances',
  energyScope: 'At the socket',
  unit: 'per use at the stated input power and duration', singular: 'use', plural: 'uses', defaultAmount: 1,
  sourceNote: 'These examples model electricity drawn at the socket. Input power and running time are illustrative assumptions. Actual draw varies with the device, load and settings.',
  sources: [method],
  options: uses.map(([id, label, watts, minutes]) => ({
    id, label, evidenceLabel: 'Modelled scenario',
    values: { energy: watts * minutes / 60000 },
    reasoning: 'Assume a steady electrical input of ' + watts.toLocaleString('en-AU') + ' W for ' + minutes + ' minutes. ' +
      watts.toLocaleString('en-AU') + ' W ÷ 1,000 × ' + minutes + '/60 hours = ' + (watts * minutes / 60000) + ' kWh per use.',
    defaultUsage: { amount: 1, times: 1, period: 'once', description: 'Assumes one use at ' + watts.toLocaleString('en-AU') + ' W for ' + minutes + ' minutes during the year.' }
  }))
};
