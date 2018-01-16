import DebugLib from 'debug'

const error = DebugLib('ha:pubnub:config:error')

export const publishKey = process.env.PUBNUB_PUBLISH_KEY || process.env.REACT_APP_PUBNUB_PUBLISH_KEY
if (!publishKey) {
  const message = 'PubNub publish key could not be found in the environment variable.  Please set \'PUBNUB_PUBLISH_KEY\' or \'REACT_APP_PUBNUB_PUBLISH_KEY\'.'
  error(message)
  if (process && process.exit) {
    process.exit(100)
  }
  console.error(message)
}

export const subscribeKey = process.env.PUBNUB_SUBSCRIBE_KEY || process.env.REACT_APP_PUBNUB_SUBSCRIBE_KEY
if (!subscribeKey) {
  const message = 'PubNub subscribe key could not be found in the environment variable.  Please set \'PUBNUB_SUBSCRIBE_KEY\' or \'REACT_APP_PUBNUB_SUBSCRIBE_KEY\'.'
  error(message)
  if (process && process.exit) {
    process.exit(200)
  }
  console.error(message)
}

export const secretKey = () => {
  const res = process.env.PUBNUB_SECRET_KEY
  if (!res) {
    const message = 'PubNub secret key could not be found in the environment variable.  Please set \'PUBNUB_SECRET_KEY\'.'
    error(message)
    if (process && process.exit) {
      process.exit(300)
    }
    console.error(message)
  }
  return res
}
