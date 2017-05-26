'use strict'


function encodeLength (value) {
	const hex = (value + 5).toString(16)
	return '0'.repeat(4 - hex.length) + hex
}

function encode (lines) {
	return Buffer.from(
		lines.map((line) => `${encodeLength(line.length)}${line}\n`)
			.join('') + '0000'
	)
}

function decodeLength (string) {
	return parseInt(string, 16) - 4
}

function decode (data) {
	const lines = []
	let p = 0

	while (p < data.length) {
		const lineLength = decodeLength(data.slice(p, p + 4))
		p += 4

		if (lineLength <= 0) {
			continue
		}

		lines.push(data.slice(p, p + lineLength))
		p += lineLength
	}

	return lines
}


module.exports = {
	encode,
	decode,
}