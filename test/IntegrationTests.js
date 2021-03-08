import { server } from '../src/server/index.js';

var assert = require('assert');
var request = require('request');

before(function () {
    
});

after(function () {
    // This would be the nicer way, however soundsworks exposes no option to stop the server
    // server.close();
});

describe('IntegrationTests', function () {
    describe('Webserver', function () {
      it('Check if webserver is compiling an running', function (done) {
        request('http://localhost:8000' , function(error, response, body) {
            assert.equal(response.statusCode, 200)
            done();
        });
      });
    });
  });