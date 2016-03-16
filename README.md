Take care
==========

Save the errors that you want to [take care](https://github.com/abyr/take-care).


----------


The idea is to have:
----------
 - free error tracker
 - background error logger
 - errors browsing


You need next things:
----------

1. **NPM**, NodeJS installed
2. **MongoDB** (local one or maybe [mongohq](), [monngolab]() for small ideas in development stage).
3. **Error logger** on your side.

Installation
----------

The server

    git clone git@github.com:abyr/take-care.git

Install dependencies

    cd take-care
    npm install

Create development configs

    cp config.production.js config.js
    cp ff.production.json ff.json

Configure DB connection

    vim config.js

For example, you can use **MongoHQ** connection like this

    db: {
        connection: 'mongodb://[user]:[password]@oceanic.mongohq.com:10031/[dbname]'
    }

Ready to run
----------

    npm start


Add error logger on your side
----------


Error loggers available:
----------

**[in progress]**
Track JS errors with [Take care JS client](https://github.com/abyr/take-care-client-js).


Read more [in progress]
---------

**[in progress]**
[Wiki page](https://github.com/abyr/take-care/wiki)

