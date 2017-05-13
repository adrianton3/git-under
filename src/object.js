'use strict'

const path = require('path')
const zlib = require('zlib')

const sha1 = require('sha1')

const nfs = require('./nice-fs')


const basePath = '.ndr/objects'

function store (value) {
	const hash = sha1(value)
	const prefix = hash.slice(0, 2)
	const suffix = hash.slice(2)

	const deflated = zlib.deflateSync(value)

	const directory = path.join(basePath, prefix)
	if (!nfs.exists(directory)) {
		nfs.mkdir(directory)
	}

	const file = path.join(directory, suffix)
	if (!nfs.exists(file)) {
		nfs.write(file, deflated)
	}

	return hash
}

function retrieve (hash) {
	const prefix = hash.slice(0, 2)
	const suffix = hash.slice(2)

	const file = path.join(basePath, prefix, suffix)

	const deflated = nfs.readBinary(file)

	return zlib.inflateSync(deflated).toString()
}

function storeBlob (value) {
	const size = Buffer.byteLength(value, 'utf8')

	return store(`blob ${size}\0${value}`)
}

function retrieveBlob (hash) {
	const content = retrieve(hash)

	return content.slice(content.indexOf('\0') + 1)
}

module.exports = {
	storeBlob,
	retrieveBlob,
}