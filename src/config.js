import DebugLib from 'debug'

const error = DebugLib('ha:pubnub:config:error')

export const publishKey = process.env.PUBNUB_PUBLISH_KEY
if (!publishKey) {
  error('PubNub publish key could not be found in the environment variable.  Please set \'PUBNUB_PUBLISH_KEY\'.')
  if (process) {
    process.exit(100)
  }
}

export const subscribeKey = process.env.PUBNUB_SUBSCRIBE_KEY
if (!subscribeKey) {
  error('PubNub subscribe key could not be found in the environment variable.  Please set \'PUBNUB_SUBSCRIBE_KEY\'.')
  if (process) {
    process.exit(200)
  }
}

export const secretKey = () => {
  const res = process.env.PUBNUB_SECRET_KEY
  if (!res) {
    error('PubNub secret key could not be found in the environment variable.  Please set \'PUBNUB_SECRET_KEY\'.')
    if (process) {
      process.exit(300)
    }
  }
  return res
}
