var _ = require('lodash'),
    Q = require('q'),
    crypto = require('crypto'),
    topojson = require('topojson'),
    db = require('../db/db');

/* Error handling in the form of:
 * util.err('error message string', 'action')
 * util.err(util.err('passed error'))
 * util.err({error properties object})
     code     INT
     action   STRING
     message  STRING
     details  STRING

util.err(error, action)
return callback(util.err(err, "getting shape nodes"))
return util.errcb(callback, err, "getting shape nodes")

 */

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

exports.err = function(err, action) {
    var env = process.env.ENV_VARIABLE || process.env.NODE_ENV;
    var showLines = (env != 'production');

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
                if (showLines && !level.match(/utilities.js/)) stack.push(level);
            } else {
                level = level.replace(/^at\s|^Error:?\s/, '> ');
                if (showLines) stack.push(level);
            }
        }
        return stack;
    }, []);

    if (action) err.action = action;
    err.stack.unshift(err);

    err.stack = err.stack.join('\n    ');
    return err;
};

var Err = exports.Err = {};
Err.new = exports.err;

// Sends an error response
Err.send = function(res, code, action) {
    code = code || 500;
    return function(err) {
        error = exports.err(err);
        error.code = code;
        if (action) error.action = action;
        return res.send(code, error);
    };
};
Err.invalid = function(res) {
    return Err.send(res, 400, 'invalid_request');
};
Err.notFound = function(res) {
    return Err.send(res, 404, 'not_found');
};
Err.failed = function(res) {
    return Err.send(res, 402, 'request_failed');
};

// Replaces values in a string
exports.replace = function(string, values) {
    if (!values) return string;
    if (typeof string !== 'string') return string;

    // Replace '%1 %2 %3' with [0, 1, 2]
    if (Array.isArray(values)) {
        values.forEach(function(v,i){
            i++;
            string = string.replace(new RegExp("%"+i,"g"),v);
        }.bind(this));

    // Replace ':a :b :c' with {a: '', b: 2, c: true}
    } else if (typeof values === 'object') {
        string = string.replace(/\:(\w+)/g, function (txt, key) {
            if (values.hasOwnProperty(key)) return values[key];
            return txt;
        });
    }
    return string;
};

// Creates crypto hash
exports.createHash = function(number) {
    var now = (new Date()).toString() + '-' + number;
    return crypto.createHash('md4')
        .update(now).digest("hex");
};

// Allows promise function to accept callbacks
exports.addCallbackTo = function(func) {
    return function() {
        // Call the func and get a promise
        var promise = func.apply(null, arguments);
        // Callback is last argument
        var callback = arguments[arguments.length - 1];

        var isPromise = (arguments.length === func.length || !_.isFunction(callback));
        if (isPromise) {
            // Allow #run() to be called without error
            promise.run = function() {
                return promise;
            };
            return promise;
        }

        promise.then(function(value) {
            callback(null, value);
        }, callback);
    };
};

// Allows callback function to accept promises
exports.addPromisesTo = function(func) {
    func = Q.denodeify(func);
    return exports.addCallbackTo(func);
};

// Verify a coordinate's legit-ness
exports.verifyCoord = function(coord) {
    if (!Array.isArray(coord)) return false;
    if (typeof coord[0] !== "number") return false;
    if (typeof coord[1] !== "number") return false;
    if (coord[0] < -180 || coord[0] > 180) return false;
    if (coord[1] < -85.05112878 || coord[1] > 85) return false;
    return true;
};

// Format shape data
exports.cleanShapeData = function(data) {
    // Create new data object w/ fixed columns
    var newData = {
        type_id:      data.type_id,
        periods:      data.periods,
        start_day:    data.start_day || 1,
        start_month:  data.start_month || 1,
        start_year:   data.start_year,
        end_day:      data.end_day || 1,
        end_month:    data.end_month || 1,
        end_year:     data.end_year,
        tags:         data.tags || [],
        data: null,
    },  hstore = [],
        keys = _.keys(newData);

    // Create hstore with extra data
    for (var key in data) {
        var value;
        if (!_.contains(keys, key)) {
            value = db.pg.engine.escape(data[key]);
            value = value.replace(/'/g, "\"");
            hstore.push(key + ' => ' + value);
        }
    }
    newData.data = { noEscape: "'"+hstore.join(", ")+"'" };

    return newData;
};

// Creates an SQL columns string from an object
exports.columnString = function(object) {
    var columns = [];
    for (var col in object) {
        columns.push(object[col] + ' AS ' + col);
    }
    return columns.join(', ');
};

// Lodash mixin for finding duplicates
_.mixin({ duplicates: function (list) {
    return _.chain(list).reduce(function(accu, x) {
        accu[x] = (accu[x] || 0) + 1;
        return accu;
    }, {})
    .map(function(count, key) {
        return count > 1 ? key : null;
    }).compact().value();
}});

// Get nodes that are duplicated
exports.getDuplicateNodes = function(features) {
    return _.chain(features).map(function(f) {
        var coords = _.flatten(f.geometry.coordinates);
        return _.zip(
            coords.filter(function(x, i) { return i % 2 === 0;}),
            coords.filter(function(x, i) { return i % 2 === 1;})
        ).map(function(pair) {
            return pair.join(',');
        });
    }).flatten()
      .duplicates()
      .value();
};

// Separates GeoJSON features into buckets that share nodes
exports.getShareBuckets = function(features) {
    var intersect = _.memoize(function(c1, c2) {
        return !_.isEmpty(_.intersection(c1, c2));
    }, function(c1, c2) {
        return _.pluck(_.sortBy([c1, c2], 'id'), 'id').join(':');
    });

    var combineOverlap = function(buckets) {
        function combine(knownBuckets, bucket) {
            var idx = _.findIndex(knownBuckets, function(knownBucket) {
                return !_.isEmpty(_.intersection(knownBucket, bucket));
            });

            if(idx === -1) knownBuckets.push(bucket);
            else knownBuckets[idx] = _.uniq(knownBuckets[idx].concat(bucket));

            return _.compact(knownBuckets);
        }

        function hasDuplicates(arr) {
            var flat = _.flatten(arr);
            return flat.length !== _.uniq(flat).length;
        }

        while(hasDuplicates(buckets)) {
            buckets = _.reduce(buckets, combine, []);
        }

        return buckets;
    };

    // Make bag
    var bag = features.map(function(f) {
        var coords = _.flatten(f.geometry.coordinates);
        return _.zip(
            coords.filter(function(x, i) { return i % 2 === 0;}),
            coords.filter(function(x, i) { return i % 2 === 1;})
        ).map(function(pair) {
            return pair.join(',');
        });
    })
    // Add names
    .map(function(feature, i) {
        feature.id = i;
        return feature;
    });

    // Find intersections
    var buckets = bag.map(function(feature) {
        return _.filter(bag, function(feature2) {
            return intersect(feature, feature2);
        });
    })
    // Get names
    .map(function(bucket) {
        return _.pluck(bucket, 'id');
    });

    // Maps IDs > features
    return combineOverlap(buckets).map(function(bucket) {
        return bucket.map(function(id) {
            return features[id];
        });
    });
};

// Convert GeoJSON to TopoJSON
exports.convertTopoJSON = function(geojson) {
    return topojson.topology({
        collection: geojson
    }, {
        "id": function(d){ return d.id || d.gid; },
        "quantization": 1e4,
        "property-transform": function(p,k,v) {
            p[k] = v;
            return true;
        }
    });
};

// Formats 2-d key/value array to JSON
exports.arrayToJson = function(array) {
    var json = {};
    array.forEach(function(a) {
        json[a[0]] = a[1];
    });
    return json;
};

// Converts 'data' column in array of rows into JSON
exports.convertData = function(rows) {
    rows.forEach(function(row) {
        if (row.hasOwnProperty('data')) row.data = exports.arrayToJson(row.data);
    });
    return rows;
};


// OLD UTILITIES =========================================
//========================================================

// Utility for building a GeoJSON object
exports.buildGeoJSON = function(shapes, extras) {
    extras = extras || {};
    if (!Array.isArray(shapes)) shapes = [shapes];
    var geoJSON = {
        "type": "FeatureCollection",
        "features": []
    };

    shapes.forEach(function(shape) {
        var geom = JSON.parse(shape.geom);
            delete shape.geom;
            delete shape.shape;
        var feature = {
            "type": "Feature",
            "properties": _.extend(shape, extras),
            "geometry": geom
        };
        geoJSON.features.push(feature);
    });

    return geoJSON;
};
