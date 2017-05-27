'use strict'

const fs = require('fs')


function read (file) {
	return fs.readFileSync(file, { encoding: 'utf8' })
}

function readJson (file) {
	return JSON.parse(read(file))
}

function readBinary (file) {
	return fs.readFileSync(file)
}

function readdir (file) {
	return fs.readdirSync(file)
}

function write (file, value) {
	fs.writeFileSync(file, value)
}

function writeJson (file, value) {
	write(file, JSON.stringify(value))
}

function exists (file) {
	return fs.existsSync(file)
}

function mkdir (file) {
	if (exists(file)) { return }

	fs.mkdirSync(file)
}

module.exports = {
	read,
	readJson,
	readBinary,
	readdir,
	write,
	writeJson,
	exists,
	mkdir,
}