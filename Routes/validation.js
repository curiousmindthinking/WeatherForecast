/**
  Setting up the validation rules.
*/

var dateTimeregex = /(\d{4})(-)?(\d{2})(-)?(\d{2})(T)?(\d{2})(:)?(\d{2})(:)?(\d{2})(\.\d+)?(Z|([+-])(\d{2})(:)?(\d{2}))/;
var dateRegex = /(\d{4})(-)?(\d{2})(-)?(\d{2})/;
var isFloat = function isFloat(n) {
    return n != "" && !isNaN(n) && Math.round(n) != n;
};
var isvalidTimestamp = function isvalidTimestamp(timestamp) {
    return !(typeof timestamp === "undefined" || timestamp === null);
};

module.exports = {
    isFloat: isFloat,
    isvalidTimestamp: isvalidTimestamp,
    dateRegex: dateRegex,
    dateTimeregex: dateTimeregex
};