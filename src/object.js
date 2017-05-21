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

	return zlib.inflateSync(deflated)
}

function storeBlob (value) {
	const size = Buffer.byteLength(value, 'utf8')

	return store(`blob ${size}\0${value}`)
}

function retrieveBlob (hash) {
	const content = retrieve(hash)

	return content.slice(content.indexOf('\0') + 1).toString()
}

function storeTree (entries) {
	const content = entries.reduce(
		(buffer, { hash, file, type }) => {
			const mode = type === 'blob' ? '100644' : '40000'

			return Buffer.concat([
				buffer,
				Buffer.from(`${mode} ${file}\0`),
				Buffer.from(hash, 'hex'),
			])
		},
		Buffer.from('')
	)

	return store(Buffer.concat([
		Buffer.from(`tree ${content.length}\0`),
		content,
	]))
}

function parseHeader(content) {
	const typeEnd = content.indexOf(' ')
	const type = content.toString('utf8', 0, typeEnd)

	const sizeEnd = content.indexOf('\0', typeEnd + 1)
	const size = Number(content.toString('utf8', typeEnd, sizeEnd))

	return {
		type,
		size,
		index: sizeEnd,
	}
}

function parseEntry (content, start) {
	const modeEnd = content.indexOf(' ', start)
	const mode = content.toString('utf8', start, modeEnd)

	const fileEnd = content.indexOf('\0', modeEnd + 1)
	const file = content.toString('utf8', modeEnd + 1, fileEnd)

	const hash = content.slice(fileEnd + 1, fileEnd + 1 + 20)

	return {
		mode,
		file,
		hash,
		index: fileEnd + 20,
	}
}

function retrieveTree (hash) {
	const content = retrieve(hash)

	const header = parseHeader(content)

	if (header.size === 0) {
		return []
	}

	const entries = []

	let start = header.index + 1
	while (true) {
		const entry = parseEntry(content, start)

		entries.push({
			type: entry.mode === '100644' ? 'blob' : 'tree',
			file: entry.file,
			hash: entry.hash,
		})

		if (entry.index >= header.size) {
			break
		}

		start = entry.index + 1
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
		message +
		`\n`

	return store(`commit ${content.length}\0${content}`)
}

function retrieveCommit (hash) {
	const content = retrieve(hash).toString()

	const regex = /tree ([\da-f]{40})\n(parent ([\da-f]{40})\n)?author.+\ncommitter.+\n\n(.+)\n$/

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