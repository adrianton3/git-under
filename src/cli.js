'use strict'

const {
	init,
	add,
} = require('./main')


const handlers = {
	init,
	add,
}

const command = process.argv[2]

handlers[command](process.argv[3])