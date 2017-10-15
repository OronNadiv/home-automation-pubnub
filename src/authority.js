import md5 from 'md5'
import PubNub from 'pubnub'
import Promise from 'bluebird'
import DebugLib from 'debug'
import { publishKey, subscribeKey, secretKey } from './config'
import Joi from 'joi-browser'

const info = DebugLib('ha:pubnub:authority:info')
const error = DebugLib('ha:pubnub:authority:error')

const schema = Joi.object().keys({
  token: Joi.string().required(),
  tokenExpiresInMinutes: Joi.number().integer().min(1),
  groupId: Joi.any().required(),
  isTrusted: Joi.boolean().required(),
  uuid: Joi.string().required()
}).required()

export const grant = (options) => {
  return new Promise((resolve, reject) => {
    const {token, tokenExpiresInMinutes, groupId, isTrusted, uuid} = options
    Joi.validate(options, schema, (err) => {
      if (err) {
        error('Unexpected options.', 'err:', err)
        return reject(err)
      }

      const pubNub = new PubNub({
        publishKey,
        subscribeKey,
        secretKey: secretKey(),
        ssl: true,
        uuid
      })

      const authKey = md5(token)
      const authKeys = [authKey]
      const channels = [groupId.toString()]
      if (isTrusted) {
        channels.push(groupId.toString() + (isTrusted ? '-trusted' : ''))
      }

      pubNub.grant(
        {
          channels,
          authKeys,
          ttl: tokenExpiresInMinutes,
          read: true,
          write: true,
          ssl: true
        },
        (status) => {
          switch (status.statusCode) {
            case 200:
              info('Grant complete successfully.',
                'Hashed authKey:', md5(authKey),
                'channels:', channels)
              return resolve()
            default:
              error('Grant failed.',
                'Hashed authKey:', md5(authKey),
                'status:', status)
              reject(status)
          }
        }
      )
    })
  })
}
