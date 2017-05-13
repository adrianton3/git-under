'use strict'

const { join } = require('path')

const nfs = require('./nice-fs')
const object = require('./object')


const indexFile = '.ndr/index'

function add (file, hash) {
	if (nfs.exists(indexFile)) {
		const index = nfs.readJson(indexFile)

		index[file] = hash

		nfs.writeJson(indexFile, index)
	} else {
		nfs.writeJson(indexFile, { [file]: hash })
	}
}

function retrieve () {
	return nfs.readJson(indexFile)
}

function updateFromTree (treeHash) {
	const index = {}

	function traverse (treeHash, partialPath) {
		const nodes = object.retrieveTree(treeHash)

		nodes.forEach(({ file, type, hash }) => {
			const newPartial = join(partialPath, file)

			if (type === 'blob') {
				index[newPartial] = hash
			} else {
				traverse(hash, newPartial)
			}
		})
	}

	traverse(treeHash, '')

	nfs.writeJson(indexFile, index)
}

module.exports = {
	add,
	retrieve,
	updateFromTree,
}