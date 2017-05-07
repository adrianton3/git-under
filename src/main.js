'use strict'

const nfs = require('./nice-fs')
const object = require('./object')
const index = require('./index')
const tree = require('./tree')
const commit = require('./commit')


const headFile = '.ndr/HEAD'

function init () {
	nfs.mkdir('.ndr')

	nfs.mkdir('.ndr/objects')
	nfs.mkdir('.ndr/refs')

	nfs.writeJson(headFile, { type: 'ref', ref: 'refs/master' })
}

function add (file) {
	const contents = nfs.read(file)
	const hash = object.store(contents)
	index.add(file, hash)
}

function commitInitial (message) {
	const indexValue = index.retrieve()
	const treeHash = tree.update(indexValue)

	const commitHash = commit.store(message, treeHash, null)

	const head = nfs.readJson(headFile)

	nfs.write(`.ndr/${head.ref}`, commitHash)
}

function commitNoninitial (message) {
	const indexValue = index.retrieve()
	const candidateTreeHash = tree.update(indexValue)

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
		nfs.write(headFile, newCommitHash)
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

module.exports = {
	init,
	add,
	commit: commitCommand,
}