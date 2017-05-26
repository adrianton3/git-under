'use strict'

const nfs = require('./nice-fs')
const object = require('./object')
const index = require('./index')
const tree = require('./tree')
const commit = require('./commit')
const utils = require('./utils')
const remote = require('./remote')


const headFile = '.ndr/HEAD'

Error.stackTraceLimit = Infinity

function init () {
	nfs.mkdir('.ndr')

	nfs.mkdir('.ndr/objects')
	nfs.mkdir('.ndr/refs')

	nfs.writeJson(headFile, { type: 'ref', ref: 'refs/master' })
}

function add (file) {
	const contents = nfs.read(file)
	const hash = object.storeBlob(contents)
	index.add(file, hash)
}

function catFile (type, hash) {
	console.log({
		blob: object.retrieveBlob,
		tree: object.retrieveTree,
		commit: object.retrieveCommit,
	}[type](hash))
}

function commitInitial (message) {
	const indexValue = index.retrieve()
	const treeHash = tree.store(indexValue)

	const commitHash = commit.store(message, treeHash, null)

	const head = nfs.readJson(headFile)

	nfs.write(`.ndr/${head.ref}`, commitHash)
}

function commitNoninitial (message) {
	const indexValue = index.retrieve()

	const candidateTreeHash = tree.store(indexValue)

	const head = nfs.readJson(headFile)

	const commitHash = head.type === 'ref'
		? nfs.read(`.ndr/${head.ref}`)
		: head.hash

	const commitObject = commit.retrieve(commitHash)

	const currentTreeHash = commitObject.tree

	if (candidateTreeHash === currentTreeHash) {
		console.log('nothing to commit')
		return
	}

	const newCommitHash = commit.store(message, candidateTreeHash, commitHash)

	if (head.type === 'ref') {
		nfs.write(`.ndr/${head.ref}`, newCommitHash)
	} else {
		nfs.writeJson(headFile, { type: 'hash', hash: newCommitHash })
	}
}

function commitCommand (message) {
	const head = nfs.readJson(headFile)

	if (head.type === 'ref' && !nfs.exists(`.ndr/${head.ref}`)) {
		commitInitial(message)
	} else {
		commitNoninitial(message)
	}
}

function log () {
	const head = nfs.readJson(headFile)

	if (head.type === 'ref' && !nfs.exists(`.ndr/${head.ref}`)) {
		console.log('your branch does not have any commits yet')
		return
	}

	function traverse (commitHash) {
		const commitObject = commit.retrieve(commitHash)

		console.log(
			commitHash.slice(0, 7),
			commitHash,
			commitObject.message
		)

		if (commitObject.parent) {
			traverse(commitObject.parent)
		}
	}

	const commitHash = head.type === 'ref'
		? nfs.read(`.ndr/${head.ref}`)
		: head.hash

	traverse(commitHash)
}

function branch (name) {
	const head = nfs.readJson(headFile)

	const commitHash = head.type === 'ref'
		? nfs.read(`.ndr/${head.ref}`)
		: head.hash

	nfs.write(`.ndr/refs/${name}`, commitHash)
}

function checkout (hashOrBranch) {
	const isHash = /[\da-f]{7}/.test(hashOrBranch)

	const commitHash = isHash
		? hashOrBranch
		: nfs.read(`.ndr/refs/${hashOrBranch}`)

	const commitObject = commit.retrieve(commitHash)

	tree.retrieve(commitObject.tree)

	index.updateFromTree(commitObject.tree)

	if (isHash) {
		nfs.writeJson(headFile, { type: 'hash', hash: commitHash })
	} else {
		nfs.writeJson(headFile, { type: 'ref', ref: `refs/${hashOrBranch}` })
	}
}

function delta (ancestorHash, descendantHash) {
	const objects = utils.computeDelta(ancestorHash, descendantHash)

	objects.forEach((hash) => {
		console.log(hash)
	})
}

function push (url) {
	remote.push(url)
}

module.exports = {
	init,
	add,
	commit: commitCommand,
	log,
	branch,
	checkout,
	catFile,
	delta,
	push,
}