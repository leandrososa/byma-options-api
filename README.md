# byma-options-api

![Heroku](http://heroku-badge.herokuapp.com/?app=byma-options-api&style=flat&svg=1)


Simple API to get options data from a specific BYMA security, made with Express.js, Cheerio and Jest.
Currently retrieves expiration date, strike price, last option price and volume for **call options** only.

## Live

[Test the API](https://byma-options-api.herokuapp.com/api/GGAL)

## Develop

### Install

Requires Node.js 20.18.1 or newer.

    npm install

### Run the app

    npm start or node bin/www

### Run the tests (Jest)

    npm test or jest

### Data sources

Allaria remains the default data source:

    npm start

For local development and integration tests, use the bundled fixture data:

    OPTIONS_SOURCE=fixture npm start

Then requests such as `GET /api/GGAL` and `GET /api/BMA` return the records from
`fixtures/options.json`. A different JSON fixture can be selected without changing code:

    OPTIONS_SOURCE=fixture OPTIONS_FIXTURE_PATH=./my-options.json npm start

The fixture must be a JSON object keyed by ticker. Each value is an array containing
`expiration_date`, `strike_price`, `option_last_price` and `volume` fields. Unknown tickers
return an empty array. The Allaria HTML endpoint can still be overridden with
`OPTIONS_SOURCE_URL`.

## API routes

### Get call options data from underlying stock ticker

Info about BYMA stock tickers [here](https://www.byma.com.ar/en/options/).

#### Request    
`GET /api/:ticker`

#### Response
    [
        {
            "expiration_date": "2021-02-19",
            "strike_price": 123,
            "option_last_price": 2.8,
            "volume": 11632641
        },
        {
            "expiration_date": "2021-02-19",
            "strike_price": 11881,
            "option_last_price": 5.8,
            "volume": 6768939
        }
    ]
