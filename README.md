# byma-options-api

![Heroku](http://heroku-badge.herokuapp.com/?app=byma-options-api&style=flat&svg=1)


Simple API to get options data from a specific BYMA security, made in Express.js and using Cheerio, Request and Jest.
Currently retrieves expiration date, strike price, last option price and volume for **call options** only.

## Live

[Test the API](https://byma-options-api.herokuapp.com/api/GGAL)

## Develop

### Install

    npm install

### Run the app

    npm start or node bin/www

### Run the tests (Jest)

    npm test or jest

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
