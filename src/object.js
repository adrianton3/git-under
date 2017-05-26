'use strict'

const path = require('path')
const zlib = require('zlib')

const sha1 = require('sha1')

const nfs = require('./nice-fs')


const basePath = '.ndr/objects'

function store (type, body) {
	const size = Buffer.byteLength(body)
	const content = Buffer.concat([
		Buffer.from(`${type} ${size}\0`),
		body,
	])

	const hash = sha1(content)
	const prefix = hash.slice(0, 2)
	const suffix = hash.slice(2)

	const deflated = zlib.deflateSync(content)

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

	const content = zlib.inflateSync(deflated)

	const typeEnd = content.indexOf(' ')
	const type = content.slice(0, typeEnd).toString()

	const sizeEnd = content.indexOf('\0', typeEnd + 1)
	const size = Number(content.slice(typeEnd, sizeEnd).toString())

	const body = content.slice(sizeEnd + 1)

	return {
		type,
		size,
		body,
	}
}

function storeBlob (body) {
	return store('blob', Buffer.from(body))
}

function retrieveBlob (hash) {
	return retrieve(hash).body.toString()
}

function storeTree (entries) {
	const body = entries.reduce(
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

	return store('tree', body)
}

function parseEntry (content, start) {
	const modeEnd = content.indexOf(' ', start)
	const mode = content.toString('utf8', start, modeEnd)

	const fileEnd = content.indexOf('\0', modeEnd + 1)
	const file = content.toString('utf8', modeEnd + 1, fileEnd)

	const hash = content.slice(fileEnd + 1, fileEnd + 1 + 20).toString('hex')

	return {
		mode,
		file,
		hash,
		index: fileEnd + 20,
	}
}

function retrieveTree (hash) {
	const { size, body } = retrieve(hash)

	const entries = []

	let index = 0
	while (true) {
		if (index >= size) {
			break
		}

		const entry = parseEntry(body, index)

		entries.push({
			type: entry.mode === '100644' ? 'blob' : 'tree',
			file: entry.file,
			hash: entry.hash,
		})

		index = entry.index + 1
	}

	return entries
}

function storeCommit ({ tree, parent, message, author, committer }) {
	const parentString = parent ? `parent ${parent}\n` : ``

	const content =
		`tree ${tree}\n` +
		parentString +
		`author ${author.name} <${author.email}> ${author.time.seconds} ${author.time.zone}\n` +
		`committer ${committer.name} <${committer.email}> ${committer.time.seconds} ${committer.time.zone}\n` +
		`\n` +
		message +
		`\n`

	return store('commit', Buffer.from(content))
}

function retrieveCommit (hash) {
	const body = retrieve(hash).body.toString()

	const commitRegex = /^(.+)\n(?:(.+)\n)?(.+)\n(.+)\n\n([^]+)\n$/

	const [
		,
		treeString,
		parentString,
		authorString,
		committerString,
		message,
	] = body.match(commitRegex)

	const treeRegex = /tree ([\da-f]{40})/
	const tree = treeString.match(treeRegex)[1]

	const parentRegex = /parent ([\da-f]{40})/
	const parent = parentString ? parentString.match(parentRegex)[1] : null

	const authorRegex = /author ([^<]+?) (?:<([^>]+)> )?(\d+) ([-+\d]+)/
	const authorMatch = authorString.match(authorRegex)

	const committerRegex = /committer ([^<]+?) (?:<([^>]+)> )?(\d+) ([-+\d]+)/
	const committerMatch = committerString.match(committerRegex)

	return {
		tree,
		parent,
		author: {
			name: authorMatch[1],
			email: authorMatch[2],
			time: {
				seconds: authorMatch[3],
				zone: authorMatch[4],
			},
		},
		committer: {
			name: committerMatch[1],
			email: committerMatch[2],
			time: {
				seconds: committerMatch[3],
				zone: committerMatch[4],
			},
		},
		message,
	}
}

module.exports = {
	retrieve,
	storeBlob,
	retrieveBlob,
	storeTree,
	retrieveTree,
	storeCommit,
	retrieveCommit,
}