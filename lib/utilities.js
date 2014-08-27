var _ = require('lodash'),
    Q = require('q'),
    crypto = require('crypto'),
    topojson = require('topojson');

exports.Err = require('./errors');
exports.err = exports.Err.new;

// Replaces values in a string
exports.replace = function(string, values) {
    if (!values) return string;
    if (typeof string !== 'string') return string;

    // Replace '%1 %2 %3' with [0, 1, 2]
    if (_.isArray(values)) {
        values.forEach(function(v,i) {
            string = string.replace(new RegExp("%" + (i+1),"g"), v);
        });

    // Replace ':a :b :c' with {a: '', b: 2, c: true}
    } else if (_.isPlainObject(values)) {
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

// Runs promise in series over an array
exports.promiseSeries = function(array, promise) {
    var newArray = [];
    return array.reduce(function(newPromise, value) {
        return newPromise.then(function() {
            return promise(value);
        }).then(function(newValue) {
            newArray.push(newValue);
            return newArray;
        });
    }, Q());
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
