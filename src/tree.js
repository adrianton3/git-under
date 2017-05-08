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
	const entries = Object.keys(node).map((key) =>
		typeof node[key] === 'string'
			? { file: key, type: 'blob', hash: node[key] }
			: { file: key, type: 'tree', hash: write(node[key]) }
	)

	return object.store(JSON.stringify(entries))
}

function store (index) {
	const root = build(index)
	return write(root)
}

function retrieve (rootHash) {
	function traverse (hash, partialPath) {
		const nodes = JSON.parse(object.retrieve(hash))

		nodes.forEach(({ type, hash, file }) => {
			const newPartial = join(partialPath, file)

			if (type === 'tree') {
				nfs.mkdir(newPartial)
				traverse(hash, newPartial)
			} else {
				const contents = object.retrieve(hash)
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