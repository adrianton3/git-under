'use strict'

const {
	init,
	add,
	commit,
	log,
} = require('./main')


const handlers = {
	init,
	add,
	commit,
	log,
}

const command = process.argv[2]

handlers[command](process.argv[3])