var util = require('./util.js'),
    _ = require('lodash');
var request = require('request').defaults({
    baseUrl: 'https://logo.clearbit.com/'
});

var pickInputs = {
        'domain': { key: 'domain', validate: { req: true }},
        'size': 'size',
        'format': { key: 'format', validate: { enum: ['png', 'jpg']} },
        'greyscale': { key: 'greyscale', type: 'boolean' }
    },
    pickOutputs = {
        'id': 'id',
        'name': 'name',
        'legalName': 'legalName',
        'domain': 'domain',
        'tags': 'tags',
        'description': 'description',
        'location': 'location',
        'metrics': 'metrics'
    };

module.exports = {

    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs),
            apiKey = dexter.environment('clearbit_api_key');

        if (!apiKey)
            return this.fail('A [clearbit_api_key] environment variable is required for this module');

        if (validateErrors)
            return this.fail(validateErrors);

        request.get({uri: inputs.domain, qs: _.omit(inputs, 'domain'), auth: { user: apiKey, pass: '' }, json: true}, function (error, response, body) {
            if (error)
                this.fail(error);
            else if (body && body.error)
                this.fail(body.error);
            else
                this.complete({ url: _.get(response, 'request.url.href') });
        }.bind(this));
    }
};
