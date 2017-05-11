'use strict'

const commit = require('./commit')
const object = require('./object')


function buildTree (commitHash) {
	function traverseCommit (hash) {
		const { parent, tree } = commit.retrieve(hash)

		return {
			type: 'commit',
			hash,
			tree: traverseTree(tree),
			parent: parent && traverseCommit(parent)
		}
	}

	function traverseTree (hash) {
		const nodes = JSON.parse(object.retrieve(hash))

		const children = nodes.map(
			({ type, hash }) =>
				type === 'tree'
					? traverseTree(hash)
					: { type: 'blob', hash }
		)

		return {
			type: 'tree',
			children,
		}
	}

	return traverseCommit(commitHash)
}

function collectUntil (start, endHash) {
	const hashes = new Set()

	function traverseCommit ({ hash, tree, parent }) {
		if (hash === endHash) { return }

		hashes.add(hash)

		traverseTree(tree)

		if (parent) {
			traverseCommit(parent)
		}
	}

	function traverseTree ({ hash, type, children }) {
		hashes.add(hash)

		if (type === 'blob') { return }

		children.forEach(traverseTree)
	}

	traverseCommit(start)

	return hashes
}

function diffSets (a, b) {
	const diff = []

	a.forEach((aElement) => {
		if (!b.has(aElement)) {
			diff.push(aElement)
		}
	})

	return diff
}

function findCommit (start, needleHash) {
	if (start.hash === needleHash) {
		return start
	}

	if (parent) {
		findCommit(start.parent)
	}
}

function computeDelta (ancestorHash, descendantHash) {
	const ancestorTree = buildTree(ancestorHash)

	const ancestorObjects = collectUntil(ancestorTree, descendantHash)
	const descendantObjects = collectUntil(findCommit(ancestorTree, descendantHash))

	return diffSets(ancestorObjects, descendantObjects)
}

module.exports = {
	computeDelta,
}