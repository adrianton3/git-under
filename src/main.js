'use strict'

const nfs = require('./nice-fs')
const object = require('./object')
const index = require('./index')


const headFile = '.ndr/HEAD'

function init () {
	nfs.mkdir('.ndr')

	nfs.mkdir('.ndr/objects')
	nfs.mkdir('.ndr/refs')

	nfs.writeJson(headFile, { type: 'ref', ref: 'refs/master' })
}

function add (file) {
	const contents = nfs.read(file)
	const hash = object.store(contents)
	index.add(file, hash)
}

module.exports = {
	init,
	add,
}