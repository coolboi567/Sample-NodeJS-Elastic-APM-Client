const apm = require('elastic-apm-node').start({
    serviceName: 'test-node-app',
    serviceVersion: "0.1",
    secretToken: '',
    serverUrl: 'http://localhost:8200',
    transactionSampleRate: 0.5,     // Sampling rate to 50%
    /*ignoreUrls: [     // Add urls which need not be traced here (those 404 floods perhaps)
        '/',
        '/ping',
        '/sanity',
        /^\/admin\//i
        ],*/
    logLevel: "debug",  // Possible levels are: trace, debug, info (default), warn, error, and fatal
    /*    logger: require('pino')({ level: 'info' }, './elastic-apm.log')*/
})
const express = require("express");
const bodyParser = require("body-parser");
const http = require('http');
const app = express();
const ip = "0.0.0.0"
const port = 8080;

app.use(bodyParser.json()); // for parsing application/json

// GET method route
app.get('/get-success', function (req, res) {
    query = {"somefield": {"someinnerfield":"somevalue"}}
    apm.addTags({"request-url": "/get-success", "query": JSON.stringify(query)});
    apm.setCustomContext(query);
    apm.setUserContext({
        id: 12345,
        username: "test-user",
        email: "test-user@rapido.bike"
    })
    res.json({
        status: "success",
        response: 'GET request to the success api'
    })
})

// POST method route
app.post('/post-success', function (req, res) {
    res.json({
        status: "success",
        response: 'POST request to the success api'
    })
})

// GET method route
app.get('/get-failure', function (req, res) {
    res.status(500).send({
        message: 'Route'+req.url+' Not found.'
    });
})

// POST method route
app.post('/post-failure', function (req, res) {
    /*throw new Error("/post-failure Some random error")*/
    /*return res.send("...")*/
    res.status(500).send({
        status: 'Route'+req.url+' Not found.'
    });
})

// 404
// 500 - Any server error
app.use(function(err, req, res, next) {
    if (err.status === 404) {
        console.error(err.stack);
        res.status(404).send({
            message: 'Route'+req.url+' Not found.'
        });
    } else if (err.status == 500) {
        console.error(err.stack);
        res.status(500).send({
            error: err
        });
    }
});

app.listen(port, ip, function () {
    console.log('Express server listening on %d', port);
});