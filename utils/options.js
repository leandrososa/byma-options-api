const request = require("request-promise");
const cheerio = require("cheerio");

const URL_TO_SCRAPE = "https://www.allaria.com.ar/Opcion";

exports.getOptions = async function (underlying) {
    const result = await request.get(URL_TO_SCRAPE);
    const $ = cheerio.load(result);
    const scrapedData = [];
    const tableHeaders = [];

    $(`table#tableOpcionesAcciones > thead > tr, table#tableOpcionesAcciones > tbody > tr.${underlying}.accion-Call`).each((index, element) => {
        if (index === 0) {
            const ths = $(element).find("th:nth-child(4), th:nth-child(5), th:nth-child(6), th:nth-child(13)");
            $(ths).each((i, element) => {
                tableHeaders.push(
                    $(element)
                    .text()
                    .toLowerCase()
                    .replace(/\s/g, '')
                    .replace(/[^a-zA-Z ]/g, "")
                );
            });
            return true;
        }

        const tds = $(element).find("td:nth-child(4), td:nth-child(5), td:nth-child(6), td:nth-child(13)"); // Get desired grid fields
        const tableRow = {};
        $(tds).each((i, element) => {
            //tableRow[tableHeaders[i]] = $(element).text().replace(/\s/g,'');
            if (i === 0) {
                var arrayFecha = $(element).text().replace(/\s/g, '').split("/", 3);
                tableRow[tableHeaders[i]] = arrayFecha[2] + '-' + arrayFecha[1] + '-' + arrayFecha[0];
                //tableRow[tableHeaders[i]] = new Date(arrayFecha[2], parseInt(arrayFecha[1]) - 1, arrayFecha[0]);
                //tableRow[tableHeaders[i]] = $(element).text().replace(/\s/g,'');
            } else if (i === 1) {
                var stringBase = $(element).text().replace(/\s/g, '');
                tableRow[tableHeaders[i]] = parseInt(stringBase);
            } else if (i == 2) {
                var stringBase2 = $(element).text().replace(/\s/g, '').replace(',', '.');
                tableRow[tableHeaders[i]] = parseFloat(stringBase2);
            } else {
                var stringBase3 = $(element).text().replace(/\s/g, '').replace('.', '').replace('.', '').replace(',', '.');
                tableRow[tableHeaders[i]] = parseFloat(stringBase3);

            }
        });
        scrapedData.push(tableRow);
    });
    //console.log(scrapedData);
    let data = JSON.stringify(scrapedData);
    return data;
    //fs.writeFileSync('calls-ggal.json', data);

    //let date_ob = new Date();
    //let hours = date_ob.getHours();
    //let minutes = date_ob.getMinutes();

    //console.log('\x1b[36m%s\x1b[0m', 'Archivo JSON generado');
    //console.log('\x1b[33m%s\x1b[0m', hours + ":" + minutes);
    //console.log("Esperando próxima ejecucion");
}

//main();