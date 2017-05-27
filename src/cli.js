'use strict'

const yargs = require('yargs')

const {
	init,
	add,
	commit,
	log,
	branch,
	branchList,
	checkout,
	catFile,
	delta,
	push,
} = require('./main')

yargs
	.command({
		command: 'init',
		desc: 'initialise an ndr repository',
		handler () {
			init()
		},
	})
	.command({
		command: 'add <file>',
		desc: 'add a file to the index',
		handler ({file}) {
			add(file)
		},
	})
	.command({
		command: 'commit <message>',
		aliases: ['ci'],
		desc: 'commits the current state of the index',
		handler ({message}) {
			commit(message)
		},
	})
	.command({
		command: 'log',
		desc: 'traverse and print commits starting from HEAD',
		handler () {
			log()
		},
	})
	.command({
		command: 'branch [name]',
		aliases: ['br'],
		desc: 'create a new branch and set HEAD to it',
		handler ({ name }) {
			if (name) {
				branch(name)
			} else {
				branchList()
			}
		},
	})
	.command({
		command: 'checkout <branch|hash>',
		aliases: ['co'],
		desc: 'switch to a branch or hash and update the working tree',
		handler ({ hash }) {
			checkout(hash)
		},
	})
	.command({
		command: 'cat-file <type> <hash>',
		desc: 'display the content of <hash> interpreted as <type>',
		handler ({ type, hash }) {
			catFile(type, hash)
		},
	})
	.command({
		command: 'objects-delta <descendant> <ancestor>',
		desc: 'list the objects reachable from <descentant> that are not reachable from <ancestor>',
		handler ({ descendant, ancestor }) {
			delta(descendant, ancestor)
		},
	})
	.command({
		command: 'push <url>',
		desc: 'update <url> with the latest commits',
		handler ({ url }) {
			push(url)
		},
	})
	.help()
	.demandCommand()
	.strict()
	.argv