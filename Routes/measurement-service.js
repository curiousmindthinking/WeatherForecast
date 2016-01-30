 var promise = require('promise');
 var q = require('q');
 var _ = require('underscore');
 var validation = require('./validation.js');
 var measurement = [];

 var errorCodes = {
     Invalid: 'invalid',
     Mismatch: 'mismatch',
     NotFound: 'notfound',
     Duplicate: 'duplicate'
 };

 /**
  * checkIfDuplicateExists: If there is an already existing timestamp then it should not insert.
  * @param {string} measurementArray The measurementArray contains all the measurements that have been recorded.
  * @param {timeStampToInsert} The new timestamp that needs to be inserted.
  * @returns {boolean}
  */
 var checkIfDuplicateExists = function(measurementArray, timeStampToInsert) {
     console.log('measurementarray', measurementArray);
     if (_.isEmpty(measurementArray)) {
         return false;
     } else {
         var isDuplicate = measurementArray.reduce(function(previous, current) {
             console.log('current' + current.timestamp);
             return (timeStampToInsert === current.timestamp) || previous;
         }, false);
         if (!isDuplicate) return false;
         else {
             return true;
         }
     }
 };
 /**
  * findMeasurement: If there is an already existing measurement then it should be sent.
  * @param {timeStampToInsert} The timestamp that was sent in the request.
  * @returns {Json} The corresponding measurement to the timestamp.
  */
 var findMeasurement = function(timestampToFind) {
     var metric = [];
     var time = new Date(timestampToFind);
     console.log('request' + timestampToFind);
     if (validation.dateTimeregex.test(timestampToFind)) {
         metric = _.find(measurement, function(value) {
             return value.timestamp === timestampToFind
         })
         console.log('metric found' + JSON.stringify(metric));
         return metric;
     }
     if (validation.dateRegex.test(timestampToFind)) {
         metric = _.filter(measurement, function(v) {
             console.log(v.timestamp);
             return (time.getUTCFullYear() === new Date(v.timestamp).getUTCFullYear() &&
                 time.getUTCMonth() === new Date(v.timestamp).getUTCMonth() &&
                 time.getUTCDate() === new Date(v.timestamp).getUTCDate());

         });
         return metric;
     }

 };

 module.exports = {
     /**
      * saveMeasurement: Save the new measurement that is sent in the request body to the measurement array.
      * @param {Json} The request body is sent.
      * @returns {Json}  The measurement array with the new inserted values or error message if any error.
      */


     saveMeasurement: function(request) {
         var parsedRequest = JSON.parse(request);
         console.log('request');
         if (validation.isFloat(parsedRequest.temperature) && validation.isvalidTimestamp(parsedRequest.timestamp)) {
             if (!checkIfDuplicateExists(measurement, parsedRequest.timestamp)) {
                 measurement.push({
                     timestamp: parsedRequest.timestamp,
                     temperature: parsedRequest.temperature,
                     dewpoint: parsedRequest.dewpoint,
                     precipitation: parsedRequest.precipitation
                 });
                 return q.when(JSON.stringify(measurement));
             } else {
                 return q.reject(errorCodes.Duplicate);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }
         console.log('after req' + JSON.stringify(measurement));
     },
     /**
      * findAndSendResponse: Find the measurements based on date or date-time in timestamp
      * @param {timestampToFind : DateTime} The timestamp  sent in the request.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */

     findAndSendResponse: function(timestampToFind) {
         var foundMetric = findMeasurement(timestampToFind);
         if (_.isEmpty(foundMetric) || _.isUndefined(foundMetric)) {
             return q.reject(errorCodes.NotFound);
         } else {
             console.log('metric' + foundMetric);
             return q.when(foundMetric);
         }
     },
     /**
      * findandUpdateMeasurement: Update the measurement value with the values sent in the request body .
      * @param {timeStampToFind : DateTime} The timestamp sent in the request.
      *@param {measurementtoUpdate: JSON} The measurement array object which has new values and should replace the old values.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */
     findandUpdateMeasurement: function(timestampToFind, measurementtoUpdate) {
         var metricFound = [];
         var measurementtoUpdate = JSON.parse(measurementtoUpdate);
         var originalMeasurementArrayKeysLength = _.allKeys(measurement[0]).length;
         var measurementtoUpdateKeysLength = _.allKeys(measurementtoUpdate).length;
         var defer = q.defer();
         console.log('put operation on the temperature' + measurementtoUpdate.temperature);
         if (originalMeasurementArrayKeysLength === measurementtoUpdateKeysLength) {
             if (validation.dateTimeregex.test(timestampToFind) && validation.isFloat(measurementtoUpdate.temperature)) {
                 var metricFoundIndex = _.findIndex(measurement, function(item) {
                     return item.timestamp === timestampToFind
                 });
                 metricFound = _.findWhere(measurement, {
                     timestamp: timestampToFind
                 });
                 console.log('metric for updating' + metricFound);
                 if (metricFound !== null && metricFound.timestamp===measurementtoUpdate.timestamp) {
                     metricFound.timestamp = measurementtoUpdate.timestamp;
                     metricFound.temperature = measurementtoUpdate.temperature;
                     metricFound.dewpoint = measurementtoUpdate.dewpoint;
                     metricFound.precipitation = measurementtoUpdate.precipitation;
                     measurement[metricFoundIndex] = metricFound;
                     return q.when(JSON.stringify(metricFound));
                 } else {
                     return q.reject(errorCodes.NotFound);
                 }
             } else {
                 return q.reject(errorCodes.Invalid);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }
     },
     /**
      * findandPatchMeasurement: Perform partial updated to the measurement values.
      * @param {timeStampToFind: DateTime} The timestamp  in the request.
      *@param {measurementtoPatch: JSON} The partial measurement array object with only some objects whose values need to be updated.
      * @returns {Json} The corresponding measurement to the timestamp or error message if not found/invalid.
      */
     findandPatchMeasurement: function(timestampToFind, measurementtoPatch) {

         var measurementToPatch = JSON.parse(measurementtoPatch);
         var measurementToPatchKey = _.findKey(measurementToPatch);
         var measurementToPatchValue = measurementToPatch[measurementToPatchKey];
         if (validation.dateTimeregex.test(timestampToFind) && validation.isFloat(measurementToPatchValue)) {
             var patchedMetric = _.findWhere(measurement, {
                 timestamp: timestampToFind
             });
             patchedMetric[measurementToPatchKey] = measurementToPatchValue;
             console.log('metric updated' + JSON.stringify(patchedMetric));
             if (JSON.stringify(patchedMetric) !== null || !_.isEmpty(JSON.stringify(patchedMetric))) {
                 console.log('metric updated' + 'true');
                 return q.when(JSON.stringify(patchedMetric));
             } else {
                 return q.reject(errorCodes.NotFound);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }

     },

     /**
      * deleteMeasurement: Delete the measurement from the measurement array.
      * @param {timeStampToFind: DateTime} The timestamp  in the request.
      * @returns {Json} The remaining measurement array  error message if not found/invalid.
      */
     deleteMeasurement: function(timestampToFind) {
         var timestampToFind = JSON.stringify(timestampToFind);
         var measurementinjson = JSON.stringify(measurement);
         console.log('timestampToFind' + measurementinjson);
         if (validation.dateTimeregex.test(timestampToFind)) {
             var remainingMetric = measurement.splice(_.indexOf(measurement,
                 _.findWhere(measurement, {
                     timestamp: timestampToFind
                 })), 1);
             if (JSON.stringify(remainingMetric) !== null || !_.isEmpty(JSON.stringify(remainingMetric))) {
                 return q.when(JSON.stringify(remainingMetric));
             } else {
                 return q.reject(errorCodes.NotFound);
             }
         } else {
             return q.reject(errorCodes.Invalid);
         }

     }

 };
 module.exports.measurement = measurement;