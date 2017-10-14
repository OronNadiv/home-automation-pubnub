import {
  NETWORK_UP,
  NETWORK_DOWN,
  NETWORK_ISSUES,
  ACCESS_DENIED,
  CONNECTED,
  DECRYPTION_ERROR,
  MALFORMED_RESPONSE,
  RECONNECTED,
  TIMEOUT,
  BAD_REQUEST
} from './listener-statuses'
import { publishKey, subscribeKey } from './config'
import md5 from 'md5'
import PubNub from 'pubnub'
import DebugLib from 'debug'

const verbose = DebugLib('ha:pubnub:subscriber:verbose')
const info = DebugLib('ha:pubnub:subscriber:info')
const warn = DebugLib('ha:pubnub:subscriber:warn')

export const subscribe = ({groupId, isTrusted, token}, onMessage, onStatus) => {
  const subscriber = new PubNub({
    publishKey,
    subscribeKey,
    authKey: md5(token),
    ssl: true
  })

  const channels = [groupId.toString() + (isTrusted ? '-trusted' : '')]

  const listener = {
    status: (status) => {
      const {statusCode, operation, category} = status
      switch (category) {
        case CONNECTED:
          info(`subscriber.status:
statusCode: ${statusCode}
operation:' ${operation}
category: ${category}`)
          break
        case NETWORK_UP:
        case NETWORK_DOWN:
        case NETWORK_ISSUES:
        case RECONNECTED:
        case ACCESS_DENIED:
        case MALFORMED_RESPONSE:
        case BAD_REQUEST:
        case DECRYPTION_ERROR:
        case TIMEOUT:
        default:
          warn(`subscriber.status
statusCode: ${statusCode}
operation: ${operation}
category: ${category}`)
      }
      onStatus(status)
    },
    message: (message) => {
      verbose('message:', !!message)
      onMessage(message.message)
    }
  }
  subscriber.addListener(listener)

  verbose('Subscribing...')
  subscriber.subscribe({channels})
  verbose('Subscribed')

  return Promise.resolve({
    unsubscribe: () => {
      verbose('Unsubscribing...')

      subscriber.removeListener(listener)
      subscriber.unsubscribe(channels)
      verbose('Unsubscribed')
    }
  })
}
