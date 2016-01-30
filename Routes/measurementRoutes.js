/**
  Setting up the HTTP routes
  Receiving the request and sending the response.
  */
var express = require('express');
var measurementRouter = express.Router();
var validation = require('./validation.js');
var measurementService = require('./measurement-service.js');

measurementRouter.route('/')
    /**
     * /measurement:
     *   post:
     *     description: Add new measurement metrics for a specific timestamp
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: timestamp
     *         description: timestamp
     *         required: true
     *         type: string
     *       - name: temperature
     *         description: temperature
     *         type: float
     *       - name: dewpoint
     *         description: dewpoint
     *         type: float
     *       - name: precipitation
     *         description: precipitation
     *         type: float
     *     responses:
     *       201:
     *         description: new measurement metric created
     */
    .post(function(req, res, next) {
        console.log('entering the post' + JSON.stringify(req.body));
        measurementService.saveMeasurement(JSON.stringify(req.body))
            .then(function(result) {
                console.log('response of  the post' + result);
                res.status(201)
                    .setHeader('Location', '/measurements/' + req.body.timestamp);
                res.send(result);
                next();
            })
            .catch(function(err) {
                if (err === 'duplicate' || err === 'invalid') {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'invalid'
                    }));
                } else {
                    console.log('Failed to post the data' + err);
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'Internal Error'
                    }));
                }
            })
    })
    /**
     * /measurement:
     *   get:
     *     description: Returns sll the measurements that have ben recorded
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: measurement
     *         schema:
     *           type: array
     */
    .get(function(req, res) {
        console.log('entering the get');
        res.json(measurementService.measurement);
    });

measurementRouter.route('/:timestamp')
    /**
     * /measurement/timestamp:
     *   get:
     *     description: Returns sll the measurements that have ben recorded for a given timestamp of date
     *     produces:
     *      - application/json
     *     responses:
     *       200:
     *         description: measurement
     *         schema:
     *           type: array
     *       400:
     *         description: measurement not found or the parameters not in valid format
     *       500:
     *         description: an error occurred
     */
    .get(function(req, res, next) {
        console.log('entering the get by timestamp' + req.params.timestamp);
        measurementService.findAndSendResponse(req.params.timestamp)
            .then(function(result) {
                console.log(result);
                res.status(200).send(result);
                next();
            })
            .catch(function(err) {
                if (err === 'notfound' || err === 'invalid') {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'bad request'
                    }));
                } else {
                    console.log('Failed to post the data' + err);
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'Internal Error'
                    }));
                }
            })
    })
    /**
     * /measurement/timestamp:
     *   put:
     *     description: updates all the elements of the measurement array for a given timestamp
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: timestamp
     *         description: timestamp
     *         required: true
     *         type: string
     *       - name: temperature
     *         description: temperature
     *          required: true
     *         type: float
     *        - name: dewpoint
     *         description: dewpoint
     *         required: true
     *         type: float
     *        - name: precipitation
     *         description: precipitation
     *           required: true
     *         type: float
     *     responses:
     *       204:
     *         description: measurement for given timestamp is updated
     *       400:
     *         description: measurement metrics passed to be updated are not valid
     *       500:
     *         description: an error occurred
     */
    .put(function(req, res, next) {
        console.log('entering the put by timestamp' + req.params.timestamp);
        var measurementtoUpdate = JSON.stringify(req.body);
        measurementService.findandUpdateMeasurement(req.params.timestamp, measurementtoUpdate)
            .then(function(result) {
                console.log(result);
                res.status(204).send(result);
                next();
            })
            .catch(function(err) {
                if (err === 'notfound' || err === 'invalid') {
                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'bad request'
                    }));
                } else {
                    console.log('Failed to post the data' + err);
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });
                    return res.end(JSON.stringify({
                        error: 'Internal Error'
                    }));
                }
            })
    })
    /**
     * /measurement/timestamp:
     *   patch:
     *     description: Updates any metric of the measurement array for a given timestamp
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: timestamp
     *         description: timestamp
     *         required: true
     *         type: string
     *       - name: temperature
     *         description: temperature
     *         type: float
     * - name: dewpoint
     *         description: dewpoint
     *         type: float
     *   - name: precipitation
     *         description: precipitation
     *         type: float
     *     responses:
     *       204:
     *         description: measurement for the timestamp is deleted
     *       400:
     *         description: measurement metrics passed to be updated are not valid
     *       404:
     *         description: measurement not found
     *       500:
     *         description: an error occurred
     */
    .patch(function(req, res, next) {
        console.log('entering the patch by timestamp' + req.params.timestamp);
        var measurementtoPatch = JSON.stringify(req.body);
        console.log(measurementtoPatch);
        measurementService.findandPatchMeasurement(req.params.timestamp, measurementtoPatch)
            .then(function(result) {
                console.log(result);
                res.status(204).send(result);
                next();
            })
            .catch(function(err) {
                if (err === 'invalid') {
                    res.status(400).send("Invalid");
                } else if (err === 'notfound') {
                    res.status(404).send("Not Found");
                } else {
                    console.log('Failed to patch the data' + err);
                    res.status(500).send("An error occurred while patching the measurement");
                };
            })
    })
    /**
     * /measurement/timestamp:
     *   delete:
     *     description: Deletes the measurement array for a given timestamp
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: timestamp
     *         description: timestamp
     *         required: true
     *         type: string
     *       - name: temperature
     *     responses:
     *       204:
     *         description: measurement for the timestamp is deleted
     *       400:
     *         description: measurement not found
     *       500:
     *         description: an error occurred
     */
    .delete(function(req, res) {
        console.log('deleting the timestamp' + req.params.timestamp);
        measurementService.deleteMeasurement(req.params.timestamp)
            .then(function(result) {
                console.log(result);
                res.status(204).send(result);
            })
            .catch(function(err) {
                if (err === 'notfound') {
                    res.status(404).send("Not Found");
                } else {
                    console.log('Failed to delete the data' + err);
                    res.status(500).send("An error occurred while deleting the measurement");
                };
            })

    });

module.exports = measurementRouter;