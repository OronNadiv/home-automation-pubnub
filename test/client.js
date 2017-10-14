const {grant} = require('../dist/authority')
const {subscribe} = require('../dist/subscriber')
const {publish} = require('../dist/publisher')
const Chai = require('chai')
const {CONNECTED} = require('../dist/listener-statuses')

Chai.should()
const assert = Chai.assert

const clientToken = new Date().getTime().toString() + 'client'
const serverToken = new Date().getTime().toString() + 'server'
const groupId = new Date().getTime().toString() + 'group'
const isTrusted = true
const system = 'SYSTEM'
const type = 'type'
const payload = {a: 1, b: 2}
let _unsubscribe

describe('pubnub', () => {
  it('standard flow', () => {
    Promise
      .all([
        grant({
          token: clientToken,
          tokenExpiresInMinutes: 1,
          groupId,
          isTrusted
        }),
        grant({
          token: serverToken,
          tokenExpiresInMinutes: 10,
          groupId,
          isTrusted
        })
      ])
      .then(() => {
        return subscribe({groupId, isTrusted, token: clientToken},
          (msg) => {
            msg.should.eql({system, type, payload})
            _unsubscribe()
            console.log('done.')
          },
          ({category}) => {
            category.should.eql(CONNECTED)
          })
      })
      .then(({unsubscribe}) => {
        _unsubscribe = unsubscribe
        console.log('publishing')
        return publish({groupId, isTrusted: true, system, type, payload, token: serverToken})
      })
      .then(() => {
        console.log('published')
      })
      .catch((err) => {
        assert.fail('got an error', err)
      })
  })
})
