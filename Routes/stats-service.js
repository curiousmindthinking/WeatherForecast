var promise = require('promise');
var q = require('q');
var _ = require('underscore');
var validation = require('./validation.js');
var measurementService = require('./measurement-service.js');
var stats = [];
var errorCodes = {
    Invalid: 'invalid',
    Mismatch: 'mismatch',
    NotFound: 'notfound',
    Duplicate: 'duplicate'
};
/**
 * findMinMaxAverage: Calcutes the min,max and average of a given metric for a given time period.
 * @param {metric:String} Metric can be any of the key in the measurement array.
 * @param {stat:String} Stat can be min, max or average.
 * @param {fromDate:DateTime} From date for the time period.
 * @param {toDate:DateTime} To date for the time period.d
 * @returns {JSON} Computed values based on the stats.
 */


var findMinMaxAverage = function(metric, stat, fromDate, toDate) {
    if (stat === 'min')
        return findMin(metric, fromDate, toDate);
    if (stat === 'max')
        return findMax(metric, fromDate, toDate);
    if (stat === 'average')
        return findAverage(metric, fromDate, toDate);
};
/**
 * findValuesByMetric: Given a type of metric, find all the values for a given time period
 * @param {metric:String} Metric can be any of the key in the measurement array.
 * @param {fromDate:DateTime} From date for the time period.
 * @param {toDate:DateTime} To date for the time period.d
 * @returns  {Number|Array} Values based on the metric
 */

var findValuesByMetric = function(metric, fromDate, toDate) {
    var startDate = new Date(fromDate);
    var endDate = new Date(toDate);
    var requiredData = _.filter(measurementService.measurement, function(data) {
        return new Date(data.timestamp) >= startDate && new Date(data.timestamp) <= endDate;
    });
    console.log(requiredData);
    var valueArray = _.pluck(requiredData, metric);
    return valueArray;
};

/**
 * findMin: Given a type of metric, find the minimum value for a given time period
 * @param {metric:String} Metric can be any of the key in the measurement array.
 * @param {fromDate:DateTime} From date for the time period.
 * @param {toDate:DateTime} To date for the time period.d
 * @returns  {Number} Minimum value of a given metric
 */
var findMin = function(metric, fromDate, toDate) {
    var jsonData = {};
    var minvalueArray = findValuesByMetric(metric, fromDate, toDate);
    if (!_.isUndefined(minvalueArray) || _.isNull(minvalueArray)) {
        var minVal = _.min(minvalueArray);
        console.log('minval' + JSON.stringify(minVal));
        jsonData[metric] = minVal;
        jsonData['stat'] = 'min';
        return jsonData;
    } else {
        return null;
    }
};
/**
 * findMax: Given a type of metric, find the maximum value for a given time period
 * @param {metric:String} Metric can be any of the key in the measurement array.
 * @param {fromDate:DateTime} From date for the time period.
 * @param {toDate:DateTime} To date for the time period.d
 * @returns  {Number} Maximum value of a given metric
 */

var findMax = function(metric, fromDate, toDate) {
    var jsonData = {};
     console.log('metric' + metric);
    var maxvalueArray = findValuesByMetric(metric, fromDate, toDate);
    var maxVal = _.max(maxvalueArray);
    console.log('valueArray' + JSON.stringify(maxvalueArray));
    console.log('maxval' + maxVal);
    jsonData[metric] = maxVal;
    jsonData['stat'] = 'max';
    return jsonData;
};

/**
 * findAverage: Given a type of metric, find the average value for a given time period
 * @param {metric:String} Metric can be any of the key in the measurement array.
 * @param {fromDate:DateTime} From date for the time period.
 * @param {toDate:DateTime} To date for the time period.d
 * @returns  {Number} Average value of a given metric
 */
var findAverage = function(metric, fromDate, toDate) {
    var jsonData = {};
    var averageValueArray = findValuesByMetric(metric, fromDate, toDate);
    var sum = 0;
    var totalSumArray = _.map(averageValueArray, function(num) {
        sum += num;
        return sum;
    });
    var totalSum = totalSumArray.slice(-1)[0];
    var average = totalSum / averageValueArray.length;
    console.log('avg' + JSON.stringify(average));
    jsonData[metric] = average;
    jsonData['stat'] = 'average';
    return jsonData;
};

/**
 * findAndSendResponse: Find the computed values based on a given set of metric params, stat params , from date and to date.
 * @param {queryParams:JSON} Query parameters passed in the Get request(metric, stats, fromDate,toDate).
 * @returns {JSON} Computed values based on the stats.
 */

module.exports = {
    findAndSendResponse: function(queryParams) {
        var valToSend = [];
        console.log(queryParams);
        var metrics = queryParams.metric;
        var stats = queryParams.stats;
        if (_.isArray(metrics)) {
            _.each(metrics, function(metric) {
                _.each(stats, function(stat) {
                    var receivedVal = findMinMaxAverage(metric, stat, queryParams.fromDate, queryParams.toDate);
                    if (!_.isNull(receivedVal) || _.isUndefined(receivedVal))
                        valToSend.push(receivedVal);
                    else {
                        valToSend = [];
                    }
                });
            });
        } else {
            _.each(stats, function(stat) {
                var receivedVal = findMinMaxAverage(metrics, stat, queryParams.fromDate, queryParams.toDate);
                console.log(receivedVal);
                if (!_.isNull(receivedVal) || _.isUndefined(receivedVal))
                    valToSend.push(receivedVal);
                else {
                    valToSend = [];
                }
            });
        }
        console.log(valToSend);
        return q.when(valToSend);
    }
};