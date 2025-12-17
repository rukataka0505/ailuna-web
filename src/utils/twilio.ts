import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID

export async function sendSMS(to: string, body: string, from?: string) {
    if (!accountSid || !authToken) {
        console.warn('Twilio credentials are missing in environment variables.')
        return null
    }

    try {
        const client = twilio(accountSid, authToken)
        const messageOption: any = {
            body,
            to,
        }

        // if 'from' is provided (and is a valid number), use it.
        // otherwise use Messaging Service SID if available.
        if (from) {
            messageOption.from = from
        } else if (messagingServiceSid) {
            messageOption.messagingServiceSid = messagingServiceSid
        } else {
            console.warn('No "from" number or Messaging Service SID configured for Twilio.')
            // proceeding might fail if no default is set in Twilio console, but we try
        }

        const message = await client.messages.create(messageOption)
        console.log('SMS sent successfully:', message.sid)
        return message
    } catch (error) {
        console.error('Error sending SMS:', error)
        // We throw error so caller can know it failed, or we can return null.
        // Requirement said: "Fail DB update? Recommendation: Sustain DB update, show error in UI"
        // So we might want to just return failure info or throw and catch in action.
        throw error
    }
}
