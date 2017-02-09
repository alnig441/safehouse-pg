var chai = require('chai'),
    chaiHttp = require('chai-http');
    expect = chai.expect,
    should = chai.should(),
    assert = chai.assert;

chai.use(chaiHttp);

describe('Array', function() {
    before(function() {
        // ...
    });

    describe('#indexOf()', function() {
        context('when not present', function() {
            it('should not throw an error', function() {
                (function() {
                    [1,2,3].indexOf(4);
                }).should.not.throw();
            });
            it('should return -1', function() {
                [1,2,3].indexOf(4).should.equal(-1);
            });
        });
        context('when present', function() {
            it('should return the index where the element first appears in the array', function() {
                [1,2,3].indexOf(3).should.equal(2);
            });
        });
    });
});

describe('exif route', function(){

    describe('when exif is NOT present', function(){
        it('should return an empty object', function(){
            (function() {

            }).should.not.throw();
        })
    })

})
