'use strict'

const object = require('./object')


function store (message, treeHash, parentHash) {
	return object.storeCommit({
		message,
		tree: treeHash,
		parent: parentHash,
	})
}

function retrieve (hash) {
	return object.retrieveCommit(hash)
}

module.exports = {
	store,
	retrieve,
}