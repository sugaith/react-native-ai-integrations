import OpenAI from 'openai'
import {
  ChatCompletionContentPart,
  ChatCompletionCreateParamsBase,
} from 'openai/resources/chat/completions'
import { IMessage } from 'react-native-gifted-chat'
import { MYSELF_USER } from 'src/utils'

const client = new OpenAI({
  apiKey: process.env.OPENAI_KEY || process.env.EXPO_PUBLIC_OPENAI_KEY,
  timeout: 9000,
})

type IMessageBase64 = IMessage & { base64?: string }

const AI_IMAGE_COMMAND =
  'Please can you shortly and enthusiastically describe this image?'

async function fetchOpenAIResponse(
  messages: IMessageBase64[],
): Promise<string> {
  try {
    const formattedMessages: ChatCompletionCreateParamsBase['messages'] =
      messages.map((message) => {
        if (message.user._id === MYSELF_USER._id) {
          let content: ChatCompletionContentPart[]
          if (message.image) {
            content = [
              { type: 'text', text: AI_IMAGE_COMMAND },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpg;base64,${message.base64}` },
              },
            ]
          } else {
            content = [{ type: 'text', text: message.text }]
          }

          return {
            role: 'user',
            content: content,
          }
        }

        return {
          role: 'assistant',
          content: message.text,
        }
      })

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: formattedMessages,
    })

    return response.choices[0]?.message?.content?.trim() || ''
  } catch (error) {
    console.error('Error fetching AI response:', error)
    return 'Sorry, could not communicate with the api. Are you in a VPN?'
  }
}

export type { IMessageBase64 }
export { fetchOpenAIResponse }
