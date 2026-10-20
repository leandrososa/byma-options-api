const request = require("supertest");

jest.mock("../utils/options.js", () => ({
  getOptions: jest.fn()
}));

const options = require("../utils/options.js");
const app = require("../app");

describe("API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("returns options for a valid ticker", async () => {
    options.getOptions.mockResolvedValue([{ strike_price: 1234.5 }]);

    const response = await request(app).get("/api/ggal");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ strike_price: 1234.5 }]);
    expect(options.getOptions).toHaveBeenCalledWith("GGAL");
  });

  test("rejects an invalid ticker", async () => {
    const response = await request(app).get("/api/not-valid!");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "Invalid ticker" });
    expect(options.getOptions).not.toHaveBeenCalled();
  });

  test("returns JSON when the upstream source fails", async () => {
    options.getOptions.mockRejectedValue(new Error("upstream failed"));

    const response = await request(app).get("/api/GGAL");

    expect(response.status).toBe(502);
    expect(response.body).toEqual({ error: "Options data is temporarily unavailable" });
  });
});
