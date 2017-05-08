'use strict'

const {
	init,
	add,
	commit,
	log,
	branch,
	checkout,
} = require('./main')


const handlers = {
	init,
	add,
	commit,
	log,
	branch,
	checkout,
}

const command = process.argv[2]

handlers[command](process.argv[3])