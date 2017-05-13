'use strict'

const { join } = require('path')

const nfs = require('./nice-fs')
const object = require('./object')


function build (index) {
	const files = Object.keys(index)

	const root = {}

	files.forEach((file) => {
		const segments = file.split('/')

		function add (node, i) {
			const segment = segments[i]

			if (i >= segments.length - 1) {
				node[segment] = index[file]
			} else {
				if (node[segment] == null) {
					node[segment] = {}
				}
				add(node[segment], i + 1)
			}
		}

		add(root, 0)
	})

	return root
}

function write (node) {
	const entries = Object.entries(node).map(([key, value]) =>
		typeof value === 'string'
			? { file: key, type: 'blob', hash: value }
			: { file: key, type: 'tree', hash: write(value) }
	)

	return object.storeTree(entries)
}

function store (index) {
	const root = build(index)
	return write(root)
}

function retrieve (rootHash) {
	function traverse (hash, partialPath) {
		const nodes = object.retrieveTree(hash)

		nodes.forEach(({ type, hash, file }) => {
			const newPartial = join(partialPath, file)

			if (type === 'tree') {
				nfs.mkdir(newPartial)
				traverse(hash, newPartial)
			} else {
				const contents = object.retrieveBlob(hash)
				nfs.write(newPartial, contents)
			}
		})
	}

	traverse(rootHash, './')
}

module.exports = {
	store,
	retrieve,
}