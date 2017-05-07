'use strict'

const object = require('./object')


function store (message, treeHash, parentHash) {
	const commit = {
		message,
		tree: treeHash,
		parent: parentHash,
	}

	return object.store(JSON.stringify(commit))
}

function retrieve (hash) {
	return JSON.parse(object.retrieve(hash))
}

module.exports = {
	store,
	retrieve,
}