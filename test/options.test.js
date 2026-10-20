const options = require("../utils/options.js");

const tableRow = cells => `<tr class="GGAL accion-Call">${cells
  .map(value => `<td>${value}</td>`)
  .join("")}</tr>`;

const html = `
  <table id="tableOpcionesAcciones">
    <thead>
      <tr>
        <th></th><th></th><th></th>
        <th>Vencimiento</th>
        <th>Precio Ejercicio</th>
        <th>Último Precio Prima</th>
        <th></th><th></th><th></th><th></th><th></th><th></th>
        <th>Volumen Monto</th>
      </tr>
    </thead>
    <tbody>
      ${tableRow(["", "", "", "19/02/2026", "1.234,50", "2,80", "", "", "", "", "", "", "11.632.641,25"])}
      <tr class="BMA accion-Call">${Array(13).fill("ignored").map(value => `<td>${value}</td>`).join("")}</tr>
    </tbody>
  </table>`;

describe("options", () => {
  test("parses call options for the requested underlying", () => {
    expect(options.parseOptions(html, "GGAL")).toEqual([
      {
        expiration_date: "2026-02-19",
        strike_price: 1234.5,
        option_last_price: 2.8,
        volume: 11632641.25
      }
    ]);
  });

  test("fetches and parses the upstream page", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => html
    });

    await expect(options.getOptions("GGAL", { fetchImpl })).resolves.toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringContaining("allaria.com.ar"),
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  test("reports an upstream HTTP error", async () => {
    const fetchImpl = jest.fn().mockResolvedValue({ ok: false, status: 403 });

    await expect(options.getOptions("GGAL", { fetchImpl })).rejects.toThrow(
      "Options source returned HTTP 403"
    );
  });

  test("loads options from a fixture source", async () => {
    const fixture = {
      GGAL: [{
        expiration_date: "2026-08-21",
        strike_price: 8200,
        option_last_price: 145.5,
        volume: 1250000
      }]
    };
    const readFileImpl = jest.fn().mockResolvedValue(JSON.stringify(fixture));

    await expect(options.getOptions("GGAL", {
      source: "fixture",
      fixturePath: "test-options.json",
      readFileImpl
    })).resolves.toEqual(fixture.GGAL);
    expect(readFileImpl).toHaveBeenCalledWith(
      expect.stringMatching(/test-options\.json$/),
      "utf8"
    );
  });

  test("returns an empty list for a ticker absent from the fixture", async () => {
    const readFileImpl = jest.fn().mockResolvedValue(JSON.stringify({ GGAL: [] }));

    await expect(options.getOptions("BMA", {
      source: "fixture",
      readFileImpl
    })).resolves.toEqual([]);
  });

  test("rejects malformed fixture data", () => {
    expect(() => options.validateOptions([
      { expiration_date: "not-a-date", strike_price: "8200" }
    ], "GGAL")).toThrow("Invalid fixture option at GGAL[0]");
  });

  test("rejects an unknown source", async () => {
    await expect(options.getOptions("GGAL", { source: "unknown" })).rejects.toThrow(
      "Unsupported options source: unknown"
    );
  });
});
