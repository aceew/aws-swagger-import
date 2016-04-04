'use strict';
const fs = require('fs');
const pathExists = require('path-exists');
const pify = require('pify');
const APIGateway = require('./lib/apigateway');

const fsP = pify(fs);

/**
 * aws-swagger-import
 * @param  {string}  filePath  - JSON swagger definition file
 * @param  {object}  options  - Used for different classes in the AWS SDK
 *								Required: name, profile
 *								Optional: region, filename
 * @return  {function}  - Function call to import API gateway
 */
module.exports = function (filePath, options) {
	options = options || {};

	let err;

	if (typeof filePath !== 'string' || !pathExists.sync(filePath)) {
		err = new Error('Input file does not exist');
	} else if (!options.name) {
		err = new Error('No AWS API Gateway name');
	} else if (!options.profile) {
		err = new Error('No AWS profile provided');
	}

	if (err) {
		// Mark the error as friendly for the CLI
		err.friendly = true;
		return Promise.reject(err);
	}

	// Initialize the gateway
	const gateway = new APIGateway(options);

	return gateway.findRestApi(options.name)
		.then(api => {
			return fsP.readFile(filePath)
				.then(contents => JSON.parse(contents.toString()))
				.then(content => api.import(content));
		});
};
