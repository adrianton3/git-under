'use strict'

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

function update (index) {
	const root = build(index)
	return write(root)
}

module.exports = {
	update,
}