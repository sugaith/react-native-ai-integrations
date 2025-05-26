import { IMessage } from 'react-native-gifted-chat'
import { create } from 'zustand'
import { newConversation } from './constants'

type Conversation = {
  id: string | null
  messages: IMessage[]
}

type ConversationStore = {
  conversationList: Conversation[]
  saveConversation: (conversationList: Conversation) => void

  currentConversation: Conversation
  setCurrentConversation: (currentConversation: Conversation) => void
  createNewConversation: () => void
}

const useConversationStore = create<ConversationStore>((set, get) => ({
  conversationList: [],
  saveConversation: (conversation: Conversation) => {
    if (!conversation.messages.length) return

    const { conversationList } = get()

    if (conversation.id) {
      set({
        conversationList: conversationList.map((convo) =>
          convo.id === conversation.id ? conversation : convo,
        ),
      })
    } else {
      const newConvo = { ...conversation, id: Math.random().toString() }
      set({
        conversationList: [...conversationList, newConvo],
      })
    }
  },

  currentConversation: newConversation,
  setCurrentConversation: (currentConversation) => set({ currentConversation }),
  createNewConversation: () => set({ currentConversation: newConversation }),
}))

export type { Conversation, ConversationStore }
export { useConversationStore }
