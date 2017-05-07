'use strict'

const nfs = require('./nice-fs')


const headFile = '.ndr/HEAD'

function init () {
	nfs.mkdir('.ndr')

	nfs.mkdir('.ndr/objects')
	nfs.mkdir('.ndr/refs')

	nfs.writeJson(headFile, { type: 'ref', ref: 'refs/master' })
}

module.exports = {
	init,
}