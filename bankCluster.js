const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const bcrypt = require('bcryptjs')
const fs = require('fs')
const pwGenerator = require('./pwGenerator.js')
let data = []
let hashes = []
const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

data.push(fs.readFileSync('passwords.txt', 'utf-8').split('\n'))
hashes.push(fs.readFileSync('test.hash','utf-8').split('\r\n'))

passwords = data.flat(Infinity).flat(1)
hashes = hashes.flat(Infinity).flat(1)

async function passwordGenerator(len, localHashes) {
    let  found = []
    let returnFound = []

    //searches for passwords matches
    for(let pw of pwGenerator(len, charSet)) {
        for(let h of localHashes) {
            let isMatch = await bcrypt.compare(pw, h)
            
            if(isMatch){
                console.log('match', h, pw)
                found.push(h)
                returnFound.push(h)
            }
        }

        //to shorten search list
        for(let f of found) {
            localHashes.splice(localHashes.indexOf(f), 1)
        }

        found = []
    }

    return returnFound
}

async function passwordChecker(localHashes) {
    let  found = []
    let returnFound = []

    //searches for passwords matches
    for(let pw of passwords) {
        for(let h of localHashes) {
            let isMatch = await bcrypt.compare(pw, h)
            
            if(isMatch){
                console.log('match', h, pw)
                found.push(h)
                returnFound.push(h)
            }
        }

        //to shorten search list
        for(let f of found) {
            localHashes.splice(localHashes.indexOf(f), 1)
        }

        found = []
    }

    return returnFound
}

if(cluster.isMaster) {
  
  for(let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork()
    let msg = {id: i, hashesWorker: []}

    for(let j = i; j < hashes.length; j += numCPUs) {
        msg.hashesWorker.push(hashes[j])
    }

    worker.send(msg)
    //master splits up hashes and send thems
  }
} else { //worker
    process.on('message',  async (message) => {
        console.time(`worker${message.id}`)

        let promiseArray = []

        promiseArray.push(passwordGenerator(1, message.hashesWorker))
        promiseArray.push(passwordChecker(message.hashesWorker))

        let found = await Promise.all(promiseArray)
        //to shorten search list
        for(let f of found) {
            message.hashesWorker.splice(message.hashesWorker.indexOf(f), 1)
        }

        found = []

        found = await passwordGenerator(2, message.hashesWorker)

        //to shorten search list
        for(let f of found) {
            message.hashesWorker.splice(message.hashesWorker.indexOf(f), 1)
        }

        found = []

        found = await passwordGenerator(3, message.hashesWorker)

        //to shorten search list
        for(let f of found) {
            message.hashesWorker.splice(message.hashesWorker.indexOf(f), 1)
        }

        found = []

        await passwordGenerator(4, message.hashesWorker)

        console.timeEnd(`worker${message.id}`)
        process.send('done')
        process.exit()
    })
}