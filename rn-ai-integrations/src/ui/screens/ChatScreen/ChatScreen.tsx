import { useState, useCallback, useRef } from 'react'
import { GiftedChat, MessageProps } from 'react-native-gifted-chat'
import { IMessageBase64 } from 'src/apis/openAi'
import { useConversationStore } from 'src/store/ConversationStore'
import { Button } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import {
  useConversationStartUp,
  useNewCameraPictureHandle,
  useOnSend,
  useSaveConversationOnExit,
} from './helpers'
import { MessageBubble } from './MessageBubble'
import { Spacer } from 'src/ui/components'
import { MYSELF_USER } from 'src/utils'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useThemeStore } from '../../../store'

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
    () => <Button title="camera" onPress={() => navigate('CameraScreen')} />,
    [navigate],
  )

  const renderMessage = useCallback(
    (props: MessageProps<IMessageLike>) => (
      <MessageBubble {...props} toggleLikeAction={toggleLikeAction} />
    ),
    [toggleLikeAction],
  )

  const { bottom } = useSafeAreaInsets()

  const colorTheme = useThemeStore((state) => state.colorTheme)

  return (
    <>
      <GiftedChat
        messages={messages}
        renderAvatarOnTop={true}
        onSend={onSend}
        user={MYSELF_USER}
        renderActions={renderCameraButton}
        keyboardShouldPersistTaps="handled"
        renderMessage={renderMessage}
        messagesContainerStyle={{
          backgroundColor: colorTheme === 'dark' ? '#313030' : '#ffffff',
        }}
      />

      <Spacer size={bottom} />
    </>
  )
}

export type { IMessageLike }
export { ChatScreen }
