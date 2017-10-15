import { publishKey, subscribeKey } from './config'
import md5 from 'md5'
import PubNub from 'pubnub'
import Promise from 'bluebird'
import DebugLib from 'debug'
import Joi from 'joi-browser'

const schema = Joi.object().keys({
  token: Joi.string().required(),
  groupId: Joi.any().required(),
  isTrusted: Joi.boolean().required(),
  system: Joi.string().required(),
  type: Joi.string().required(),
  payload: Joi.any(),
  uuid: Joi.string().required()
}).required()

const verbose = DebugLib('ha:pubnub:publisher:verbose')
const warn = DebugLib('ha:pubnub:publisher:warn')
const error = DebugLib('ha:pubnub:publisher:error')

export const publish = (options) => {
  return new Promise((resolve, reject) => {
    const {token, groupId, isTrusted, system, type, payload, uuid} = options
    Joi.validate(options, schema, (err) => {
      if (err) {
        error('Unexpected options.', 'err:', err)
        return reject(err)
      }

      const authKey = md5(token)
      const publisher = new PubNub({
        publishKey,
        subscribeKey,
        authKey,
        ssl: true,
        uuid
      })

      let channel
      if (isTrusted) {
        channel = groupId.toString() + '-trusted'
      } else {
        channel = groupId.toString()
      }

      const publishConfig = {
        channel,
        message: {
          system,
          type,
          payload
        }
      }

      publisher.publish(publishConfig, (status) => {
        const {error} = status
        if (error) {
          warn('Publish failed.',
            'Channel:', channel,
            'status:', status,
            'payload:', payload)
          return reject(error)
        }
        verbose('Publish complete successfully.',
          'Channel:', channel)
        return resolve(channel)
      })
    })
  })
}
