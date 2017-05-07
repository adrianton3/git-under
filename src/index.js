'use strict'

const nfs = require('./nice-fs')


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

module.exports = {
	add,
	retrieve,
}