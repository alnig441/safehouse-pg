var testCase = require('mocha').describe;
var pre = require('mocha').before;
var assertions = require('mocha').it;
var chai = require('chai'),
    chaiHttp = require('chai-http');
    expect = chai.expect,
    should = chai.should(),
    assert = chai.assert;

testCase('Array', function() {
    pre(function() {
        // ...
    });

    testCase('#indexOf()', function() {
        assertions('should return -1 when not present', function() {
            assert.equal([1,2,3].indexOf(4), -1);
        });
    });
});