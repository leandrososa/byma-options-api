const options = require("../utils/options.js");

test('getting Grupo Financiero Galicia data', () => {
    return options.getOptions('GGAL').then(data => {
      expect(data).toBeTruthy();
    });
  });