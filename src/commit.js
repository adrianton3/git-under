'use strict'

const object = require('./object')


function store (message, treeHash, parentHash) {
	return object.storeCommit({
		tree: treeHash,
		parent: parentHash,
		author: {
			name: 'Author Name',
			email: 'author@example.com',
			time: {
				seconds: 1494221973,
				zone: '+0200',
			},
		},
		committer: {
			name: 'Committer Name',
			email: 'committer@example.com',
			time: {
				seconds: 1494221973,
				zone: '+0200',
			},
		},
		message,
	})
}

function retrieve (hash) {
	return object.retrieveCommit(hash)
}

module.exports = {
	store,
	retrieve,
}