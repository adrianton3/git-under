'use strict'

const {
	init,
	add,
	commit,
	log,
	branch,
	checkout,
	catFile,
	delta,
} = require('./main')


const handlers = {
	init,
	add,
	commit,
	log,
	branch,
	checkout,
	'cat-file': catFile,
	'objects-delta': delta,
}

const command = process.argv[2]

handlers[command](...process.argv.slice(3))