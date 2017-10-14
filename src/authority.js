import md5 from 'md5'
import PubNub from 'pubnub'
import Promise from 'bluebird'
import DebugLib from 'debug'
import { publishKey, subscribeKey, secretKey } from './config'

const info = DebugLib('ha:pubnub:authority:info')
const error = DebugLib('ha:pubnub:authority:error')

export const grant = ({token, tokenExpiresInMinutes, groupId, isTrusted}) => {
  const pubNub = new PubNub({
    publishKey,
    subscribeKey,
    secretKey: secretKey()
  })
  return new Promise((resolve, reject) => {
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
}
