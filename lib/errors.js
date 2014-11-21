var _ = require('lodash');
var Q = require('q');
var config = require('../config/config');

Error.prototype = _.extend(Error.prototype, {
    toJSON: function() {
        var obj = {},
            props = Object.getOwnPropertyNames(this);
        props.forEach(function(key) {
            obj[key] = this[key];
        }, this);

        return obj;
    },
    toString: function() {
        var head = 'Error',
            body = '',
            details = '';
        if (this.code) head += ' ' + this.code;
        if (this.action) head += ' ' + this.action;
        if (this.message || this.details) head += ': ';
        if (this.message) body += this.message;
        if (this.details) details = ' ('+this.details+')';

        return head + body + details;
    }
});

/*
 * err.new('error message string', 'action')
 * err.new(err.new('passed error'))
 * err.new({error properties object})
     code     INT
     action   STRING
     message  STRING
     details  STRING

err.new(error, action)
return callback(err.new(err, "getting shape nodes"))
 */

exports.new = function(err, action) {
    var debug = config.debug;

    if (typeof err === 'string') {
        err = new Error(err);
    } else if (err instanceof Error) {
        err = err;
    } else if (_.isPlainObject(err)) {
        if (err.action) action = err.action;
        err = _.assign(new Error(), err);
    }

    if (typeof err.stack === 'string')
        err.stack = err.stack.split('\n    ');

    err.stack = _(err.stack).reduce(function(stack, level) {
        if (level.indexOf('(module.js') <0  &&
                level.indexOf('at node.js:') <0 &&
                level.indexOf('at startup') <0) {

            if (level.match(/^>\s/)) {
                stack.push(level);
            } else if (level.match(/\:\d+\:\d+\)/)) {
                level = level.replace(/^Error:?\s/, '> ');
                if (debug && !level.match(/errors.js/)) stack.push(level);
            } else {
                level = level.replace(/^at\s|^Error:?\s/, '> ');
                if (debug) stack.push(level);
            }
        }
        return stack;
    }, []);

    if (action) err.action = action;
    err.stack.unshift(err);

    err.stack = err.stack.join('\n    ');
    return err;
};

// Sends a promise error
// if (problem) return err.reject('Problem!')
exports.reject = function(err, action) {
    return Q.reject(exports.new(err, action));
};

// Parses promise-chain error
// Q().catch(err.catch('action'))
exports.catch = function(action) {
    return function(err) {
        err = exports.new(err, action);
        return Q.reject(err);
    };
};

/* Sends error to http response
 * err.send(res, code, type)(error)
 *
 * .fail(err.send(res))
 * return err.invalid(res)('Invalid input')
 */

// Sends an error response
exports.send = function(res, code, type) {
    code = code || 500;
    return function(err) {
        error = exports.new(err);
        error = {
            error: true,
            code: code,
            type: type,
            message: error.message,
            stack: error.stack
        };
        if (!type) delete error.type;
        if (config.env == 'production') delete error.stack;
        return res.send(code, error);
    };
};

exports.invalid = function(res) {
    return this.send(res, 400, 'invalid_request');
};

exports.notFound = function(res) {
    return this.send(res, 404, 'not_found');
};

exports.failed = function(res) {
    return this.send(res, 402, 'request_failed');
};

exports.forbidden = function(res) {
    return this.send(res, 403, 'request_forbidden');
};
