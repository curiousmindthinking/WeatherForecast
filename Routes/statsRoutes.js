var express = require('express');
var statsRouter = express.Router();
var validation = require('./validation.js');
var statService = require('./stats-service.js');
var url = require('url');


statsRouter.route('/')
    /**
     * /stats/timestamp?parameters:
     *   get:
     *     description: get the min,max and average for a given timeframe
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: timestamp
     *         description: timestamp
     *         required: true
     *         type: string
     *       - name: metric
     *         description: can be temperature, dewpoint or preciptiation
     *          required: true
     *         type: float
     *        - name: stats
     *         description: can be min, max or average
     *     responses:
     *       200:
     *         description: computed values for a given timeframe
     *       500:
     *          description: an error occurred
     */
    .get(function(req, res) {
        var url_params = url.parse(req.url, true);
        var query = url_params.query;
        console.log('entering the get');
        console.log('query' + query);
        statService.findAndSendResponse(query)
            .then(function(result) {
                console.log(result);
                res.status(200).send(result);
            })
            .catch(function(err) {
                console.log('Failed to post the data' + err);
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });
                return res.end(JSON.stringify({
                    error: 'Internal Error'
                }));
            })
    });

module.exports = statsRouter;