import { equal } from 'assert';

describe('BaseTests', function () {
    describe('Check if tests are running at all', function () {
      it('Array#indexOf(): should return -1 when the value is not present', function (done) {
        equal([1, 2, 3].indexOf(4), -1);
        done();
      });
    });
  });