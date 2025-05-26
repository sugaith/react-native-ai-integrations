import { IMessage } from 'react-native-gifted-chat'
import { Conversation } from './ConversationStore'
import { MYSELF_USER } from '../utils'

const START_CONVO_SYSTEM_MSG = "You have a successful billionaire entrepreneurship career and now you coach leaders. You will coach me in this convo. Present yourself in few words, and use professional emojis, and as ask what can you serve your apprentice today"

const startConversationMessage: IMessage[] = [
  {
    _id: Math.random().toString(),
    text: START_CONVO_SYSTEM_MSG,
    createdAt: new Date(),
    user: MYSELF_USER,
  },
]

const newConversation: Conversation = {
  id: null,
  messages: [],
}

export { newConversation, startConversationMessage }
