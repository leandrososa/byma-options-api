const cheerio = require("cheerio");
const { readFile } = require("node:fs/promises");
const path = require("node:path");

const URL_TO_SCRAPE = "https://www.allaria.com.ar/Opcion";
const REQUEST_TIMEOUT_MS = 10_000;
const DEFAULT_FIXTURE_PATH = path.join(__dirname, "..", "fixtures", "options.json");

const HEADER_NAMES = {
    vencimiento: "expiration_date",
    precioejercicio: "strike_price",
    ultimoprecioprima: "option_last_price",
    volumenmonto: "volume"
};

function normalizeHeader(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z]/g, "");
}

function parseNumber(value) {
    const normalized = value.trim().replace(/\./g, "").replace(",", ".");
    return normalized === "" ? 0 : Number.parseFloat(normalized);
}

function validateOptions(data, underlying) {
    if (!Array.isArray(data)) {
        throw new Error(`Fixture data for ${underlying} must be an array`);
    }

    return data.map((option, index) => {
        const isValid = option
            && /^\d{4}-\d{2}-\d{2}$/.test(option.expiration_date)
            && Number.isFinite(option.strike_price)
            && Number.isFinite(option.option_last_price)
            && Number.isFinite(option.volume);

        if (!isValid) {
            throw new Error(`Invalid fixture option at ${underlying}[${index}]`);
        }

        return {
            expiration_date: option.expiration_date,
            strike_price: option.strike_price,
            option_last_price: option.option_last_price,
            volume: option.volume
        };
    });
}

function parseOptions(html, underlying) {
    const $ = cheerio.load(html);
    const tableHeaders = [];

    $("table#tableOpcionesAcciones > thead > tr").first()
        .find("th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(13)")
        .each((_index, element) => {
            tableHeaders.push(HEADER_NAMES[normalizeHeader($(element).text())]);
        });

    if (tableHeaders.some(header => header === undefined)) {
        throw new Error("The upstream options table has an unexpected format");
    }

    const scrapedData = [];
    $("table#tableOpcionesAcciones > tbody > tr.accion-Call")
        .filter((_index, element) => $(element).hasClass(underlying))
        .each((_index, element) => {
            const cells = $(element).find(
                "td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(13)"
            );
            const row = {};

            cells.each((index, cell) => {
                const value = $(cell).text().trim();
                if (index === 0) {
                    const [day, month, year] = value.replace(/\s/g, "").split("/", 3);
                    row[tableHeaders[index]] = `${year}-${month}-${day}`;
                } else {
                    row[tableHeaders[index]] = parseNumber(value);
                }
            });

            scrapedData.push(row);
        });

    return scrapedData;
}

async function getAllariaOptions(underlying, fetchImpl) {
    const response = await fetchImpl(process.env.OPTIONS_SOURCE_URL || URL_TO_SCRAPE, {
        headers: {
            accept: "text/html",
            "user-agent": "byma-options-api/1.0"
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    });

    if (!response.ok) {
        throw new Error(`Options source returned HTTP ${response.status}`);
    }

    return parseOptions(await response.text(), underlying);
}

async function getFixtureOptions(underlying, readFileImpl, fixturePath) {
    const contents = await readFileImpl(path.resolve(fixturePath), "utf8");
    const fixtures = JSON.parse(contents);
    return validateOptions(fixtures[underlying] || [], underlying);
}

async function getOptions(underlying, {
    source = process.env.OPTIONS_SOURCE || "allaria",
    fetchImpl = globalThis.fetch,
    readFileImpl = readFile,
    fixturePath = process.env.OPTIONS_FIXTURE_PATH || DEFAULT_FIXTURE_PATH
} = {}) {
    if (source === "allaria") {
        return getAllariaOptions(underlying, fetchImpl);
    }

    if (source === "fixture") {
        return getFixtureOptions(underlying, readFileImpl, fixturePath);
    }

    throw new Error(`Unsupported options source: ${source}`);
}

exports.getOptions = getOptions;
exports.parseOptions = parseOptions;
exports.validateOptions = validateOptions;
