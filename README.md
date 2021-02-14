# byma-options-api

![Heroku](https://heroku-badge.herokuapp.com/?app=heroku-badge)


Simple API to get options data from a specific BYMA security, made in Express.js and using Cheerio, Request and Jest.
Currently retrieves expiration date, strike price, option price and volume for <b>call options</b> only.

### Install

    npm install

### Run the app

    npm start or node bin/www

### Run the tests (Jest)

    npm test or jest

## API routes

### Get call options data from underlying stock ticker:

#### Request    
`GET /api/ticker`