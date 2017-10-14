import { publishKey, subscribeKey } from './config'
import md5 from 'md5'
import PubNub from 'pubnub'
import Promise from 'bluebird'
import DebugLib from 'debug'

const verbose = DebugLib('ha:pubnub:publisher:verbose')
const warn = DebugLib('ha:pubnub:publisher:warn')

export const publish = ({groupId, isTrusted, system, type, payload, token}) => {
  const authKey = md5(token)
  const publisher = new PubNub({
    publishKey,
    subscribeKey,
    authKey,
    ssl: true
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

  return new Promise((resolve, reject) => {
    publisher.publish(publishConfig, ({error}) => {
      if (error) {
        warn(`Publish failed.
Channel:' ${channel}
error: ${error}`)
        return reject(error)
      }
      verbose(`Publish complete successfully.
Channel: ${channel}`)
      return resolve(channel)
    })
  })
}
