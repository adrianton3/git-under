'use strict'

const {
	init,
	add,
	commit,
	log,
	branch,
} = require('./main')


const handlers = {
	init,
	add,
	commit,
	log,
	branch,
}

const command = process.argv[2]

handlers[command](process.argv[3])