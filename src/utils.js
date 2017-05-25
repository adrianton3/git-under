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
		const nodes = object.retrieveTree(hash)

		const children = nodes.map(
			({ type, hash }) =>
				type === 'tree'
					? traverseTree(hash)
					: { type: 'blob', hash }
		)

		return {
			type: 'tree',
			hash,
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
	if (!start) {
		return null
	}

	if (start.hash === needleHash) {
		return start
	}

	return findCommit(start.parent, needleHash)
}

function computeDelta (descendantHash, ancestorHash) {
	const descendant = buildTree(descendantHash)

	const ancestor = findCommit(descendant, ancestorHash)

	const descendantObjects = collectUntil(descendant, ancestor.hash)
	const ancestorObjects = collectUntil(ancestor, null)

	return diffSets(descendantObjects, ancestorObjects)
}

module.exports = {
	computeDelta,
}