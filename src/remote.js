'use strict'

const request = require('request-promise-native')

const nfs = require('./nice-fs')
const utils = require('./utils')
const pkt = require('./pkt')
const pack = require('./pack')

const headFile = '.ndr/HEAD'


function getRemoteMaster (url) {
	return request(`${url}/info/refs?service=git-receive-pack`, {
		encoding: null,
		auth: {
			user: process.env.NDR_USERNAME,
			pass: process.env.NDR_PASSWORD,
		},
	}).then((body) => {
		const lines = pkt.decode(body)

		return lines[1].slice(0, 40).toString()
	}).catch((error) => {
		console.log('--- error while trying to retrieve master ---')
		console.log(error)
	})
}

function makePush (localHash, remoteHash) {
	const pktData = pkt.encode([
		`${remoteHash} ${localHash} refs/heads/master\0 report-status`,
	])

	const objectsDelta = utils.computeDelta(localHash, remoteHash)

	const packData = pack.encode(objectsDelta)

	return Buffer.concat([pktData, packData])
}

function push (url) {
	getRemoteMaster(url).then((remoteHash) => {
		const head = nfs.readJson(headFile)

		const localHash = head.type === 'ref'
			? nfs.read(`.ndr/${head.ref}`)
			: head.hash

		const content = makePush(localHash, remoteHash)

		request.post(`${url}/git-receive-pack`, {
			encoding: null,
			auth: {
				user: process.env.NDR_USERNAME,
				pass: process.env.NDR_PASSWORD,
			},
			body: content,
		}).then((response) => {
			console.log('--- push response ---')
			pkt.decode(response).forEach((line) => {
				console.log(line.toString())
			})
		}).catch((error) => {
			console.log('--- error while trying to push ---')
			console.log(error)
		})
	})
}

module.exports = {
	getRemoteMaster,
	push,
}
