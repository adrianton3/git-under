'use strict'

const {
	init,
} = require('./main')


const handlers = {
	init,
}

const command = process.argv[2]

handlers[command]()