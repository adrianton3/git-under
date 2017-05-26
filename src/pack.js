'use strict'

const zlib = require('zlib')

const sha1 = require('sha1')

const object = require('./object')


function encodeObjectHeader (type, size) {
	const typeNumber = { 'commit': 1, 'tree': 2, 'blob': 3 }[type]
	const bytes = []

	let byte = (typeNumber << 4) | (size & 0x0f)

	size >>= 4

	if (size === 0) {
		bytes.push(byte)
	} else {
		bytes.push(byte | 0x80)

		do {
			byte = size & 0x7f

			size >>= 7

			if (size > 0) {
				byte |= 0x80
			}

			bytes.push(byte)
		} while (size > 0)
	}

	return bytes
}

function encodeObject (hash) {
	const { type, size, body } = object.retrieve(hash)

	const header = encodeObjectHeader(type, size)

	return Buffer.concat([
		Buffer.from(header),
		zlib.deflateSync(body),
	])
}

function encode (hashes) {
	const header = Buffer.alloc(12)
	header.write('PACK')
	header.writeUInt32BE(2, 4)
	header.writeUInt32BE(hashes.length, 8)

	const objects = hashes.slice().sort().map(encodeObject)
	const contents = Buffer.concat([header, ...objects])

	return Buffer.concat([
		contents,
		Buffer.from(sha1(contents), 'hex'),
	])
}

module.exports = {
	encode,
}