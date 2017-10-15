const {grant} = require('../dist/authority')
const {subscribe} = require('../dist/subscriber')
const {publish} = require('../dist/publisher')
const Chai = require('chai')
const {CONNECTED} = require('../dist/listener-statuses')
const Chance = require('chance')
const chance = Chance()
const expect = Chai.expect

const clientToken = `server-token-${chance.guid()}`
const serverToken = `client-token-${chance.guid()}`
const groupId = `group-id-${chance.guid()}`
const isTrusted = true
const system = 'SYSTEM'
const type = 'type'
const payload = {a: 1, b: 2}
const uuid = 'unit-tests'
let _unsubscribe

describe('pubnub', () => {
  it('standard flow', (done) => {
    Promise
      .all([
        grant({
          token: clientToken,
          tokenExpiresInMinutes: 1,
          groupId,
          isTrusted,
          uuid
        }),
        grant({
          token: serverToken,
          tokenExpiresInMinutes: 10,
          groupId,
          isTrusted,
          uuid
        })
      ])
      .then(() => {
        return subscribe({groupId, isTrusted, token: clientToken, uuid},
          (msg) => {
            expect(msg).to.eql({system, type, payload})
            _unsubscribe()
            done()
            console.log('done.')
          },
          ({category}) => {
            expect(category).to.eql(CONNECTED)
            console.log('publishing')
            return publish({groupId, isTrusted: true, system, type, payload, token: serverToken, uuid})
              .then(() => {
                console.log('published')
              })
          })
      })
      .then(({unsubscribe}) => {
        _unsubscribe = unsubscribe
      })
      .catch((err) => {
        done(err)
      })
  })
})
