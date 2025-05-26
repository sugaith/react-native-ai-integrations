import { useState, useCallback, useRef } from 'react'
import { GiftedChat, MessageProps } from 'react-native-gifted-chat'
import { IMessageBase64 } from 'src/apis/openAi'
import { useConversationStore } from 'src/store/ConversationStore'
import { MYSELF_USER } from 'src/utils'
import { Button } from 'tamagui'
import { Camera } from '@tamagui/lucide-icons'
import { useNavigation } from '@react-navigation/native'
import {
  useConversationStartUp,
  useNewCameraPictureHandle,
  useOnSend,
  useSaveConversationOnExit,
} from './helpers'
import { MessageBubble } from './MessageBubble'
import { ChatHeader } from 'src/ui/molecules'

type IMessageLike = IMessageBase64 & { like?: boolean }

function ChatScreen() {
  const { navigate } = useNavigation()

  const initialChat = useConversationStore((state) => state.currentConversation)
  const messagesRef = useRef(initialChat.messages)
  const [messages, setMessages] = useState(messagesRef.current)

  const appendMessage = useCallback(
    (newMessages: IMessageBase64[]): IMessageBase64[] => {
      messagesRef.current = GiftedChat.append(messagesRef.current, newMessages)

      setMessages(messagesRef.current)

      return [...messagesRef.current]
    },
    [],
  )

  const toggleLikeAction = useCallback((messageToLike: IMessageLike) => {
    messagesRef.current = messagesRef.current.map((message: IMessageLike) =>
      message._id === messageToLike._id
        ? { ...message, like: !message.like }
        : message,
    )

    setMessages(messagesRef.current)
  }, [])

  const onSend = useOnSend(appendMessage)
  useConversationStartUp(!initialChat.messages.length, appendMessage)
  useNewCameraPictureHandle(appendMessage)
  useSaveConversationOnExit(messagesRef)

  const renderCameraButton = useCallback(
    () => (
      <Button
        icon={Camera}
        scaleIcon={1.5}
        onPress={() => navigate('CameraScreen')}
      />
    ),
    [navigate],
  )

  const renderMessage = useCallback(
    (props: MessageProps<IMessageLike>) => (
      <MessageBubble {...props} toggleLikeAction={toggleLikeAction} />
    ),
    [toggleLikeAction],
  )

  return (
    <>
      <ChatHeader />

      <GiftedChat
        messages={messages}
        renderAvatarOnTop={true}
        onSend={onSend}
        user={MYSELF_USER}
        renderActions={renderCameraButton}
        keyboardShouldPersistTaps="handled"
        renderMessage={renderMessage}
      />
    </>
  )
}

export type { IMessageLike }
export { ChatScreen }
