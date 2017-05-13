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

function packHash (string) {
	return string.replace(/../g, (match) =>
		String.fromCharCode(parseInt(match, 16))
	)
}

function unpackHash (binary) {
	return binary.replace(/[^]/g, (match) => {
		const code = match.charCodeAt(0)

		return code < 16
			? `0${code.toString(16)}`
			: code.toString(16)
	})
}

function storeTree (entries) {
	const content = entries.map(
		({ hash, file, type }) => {
			const mode = type === 'blob' ? '100644' : '40000'

			return `${mode} ${file}\0${packHash(hash)}`
		}
	).join('')

	return store(`tree ${content.length}\0${content}`)
}

function retrieveTree (hash) {
	const content = retrieve(hash)

	const regex = /(100644|40000) ([^\0]+)\0([^]{20})/g

	const entries = []

	let match
	while (match = regex.exec(content)) {
		entries.push({
			type: match[1] === '100644' ? 'blob' : 'tree',
			file: match[2],
			hash: unpackHash(match[3]),
		})
	}

	return entries
}

function storeCommit ({ tree, parent, message }) {
	const time = 1494221973

	const parents = parent ? `parent ${parent}\n` : ``

	const content =
		`tree ${tree}\n` +
		parents +
		`author Author Name <author@example.com> ${time} +0000\n` +
		`committer Committer Name <committer@example.com> ${time} +0000\n` +
		`\n` +
		message

	return store(`commit ${content.length}\0${content}\n\n`)
}

function retrieveCommit (hash) {
	const content = retrieve(hash)

	const regex = /tree ([\da-f]{40})\n(parent ([\da-f]{40})\n)?author.+\ncommitter.+\n\n(.+)\n\n$/

	const match = content.match(regex)

	return {
		tree: match[1],
		parent: match[3],
		message: match[4],
	}
}

module.exports = {
	storeBlob,
	retrieveBlob,
	storeTree,
	retrieveTree,
	storeCommit,
	retrieveCommit,
}