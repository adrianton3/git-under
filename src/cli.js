'use strict'

const {
	init,
	add,
	commit,
} = require('./main')


const handlers = {
	init,
	add,
	commit,
}

const command = process.argv[2]

handlers[command](process.argv[3])