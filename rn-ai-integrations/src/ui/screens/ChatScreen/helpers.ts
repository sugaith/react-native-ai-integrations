import { MutableRefObject, useCallback, useEffect, useState } from 'react'
import { CameraType, CameraView, CameraCapturedPicture } from 'expo-camera'
import { useNavigation } from '@react-navigation/native'
import { IMessage } from 'react-native-gifted-chat'
import { create } from 'zustand'

import { fetchOpenAIResponse, IMessageBase64 } from 'src/apis/openAi'
import { AGENT_USER, MYSELF_USER } from 'src/utils'
import { startConversationMessage } from 'src/store/constants'
import { useConversationStore } from 'src/store'

type MessageAppenderFunc = (msgs: IMessageBase64[]) => IMessageBase64[]
type CameraStore = {
  image: CameraCapturedPicture | null
  setImage: (img: CameraCapturedPicture | null) => void
}

const useCameraStore = create<CameraStore>((set) => ({
  image: null,
  setImage: (img) => set({ image: img }),
}))

const useConversationStartUp = (
  shouldStartChat: boolean,
  messageAppender: MessageAppenderFunc,
) => {
  useEffect(() => {
    if (shouldStartChat) {
      const fetchInitialMessage = async () => {
        const aiResponse = await fetchOpenAIResponse(startConversationMessage)

        const aiMessage: IMessage = {
          _id: Math.random().toString(),
          text: aiResponse,
          createdAt: new Date(),
          user: AGENT_USER,
        }

        messageAppender([aiMessage])
      }

      fetchInitialMessage()
    }
  }, [messageAppender, shouldStartChat])
}

const useNewCameraPictureHandle = (messageAppender: MessageAppenderFunc) => {
  const newCameraPicture = useCameraStore((state) => state.image)

  useEffect(() => {
    if (newCameraPicture) {
      useCameraStore.getState().setImage(null)

      const imageMessage: IMessageBase64 = {
        _id: Math.random().toString(),
        text: '',
        createdAt: new Date(),
        image: newCameraPicture.uri,
        user: MYSELF_USER,
        base64: newCameraPicture.base64,
      }

      fetchOpenAIResponse(messageAppender([imageMessage]).reverse()).then(
        (aiResponse) => {
          const aiMessage: IMessage = {
            _id: Math.random().toString(),
            text: aiResponse,
            createdAt: new Date(),
            user: AGENT_USER,
          }

          messageAppender([aiMessage])
        },
      )
    }
  }, [messageAppender, newCameraPicture])
}

const useSaveConversationOnExit = (
  finalMessages: MutableRefObject<IMessageBase64[]>,
) => {
  const saveConversation = useConversationStore(
    (state) => state.saveConversation,
  )
  const currentConversation = useConversationStore(
    (state) => state.currentConversation,
  )

  useEffect(
    () => () => {
      saveConversation({
        id: currentConversation.id,
        messages: finalMessages.current,
      })
    },
    [currentConversation.id, finalMessages, saveConversation],
  )
}

const useOnSend = (messageAppender: MessageAppenderFunc) => {
  const onSend = useCallback(
    async (newMessages: IMessage[] = []) => {
      const newMsgs = messageAppender(newMessages)

      if (newMessages.length > 0) {
        const aiResponse = await fetchOpenAIResponse(newMsgs.reverse())

        const aiMessage: IMessage = {
          _id: Math.random().toString(),
          text: aiResponse,
          createdAt: new Date(),
          user: AGENT_USER,
        }

        messageAppender([aiMessage])
      }
    },
    [messageAppender],
  )

  return onSend
}

const useCameraActions = (
  cameraRef: MutableRefObject<CameraView | undefined>,
) => {
  const { goBack } = useNavigation()

  const takePicture = useCallback(async () => {
    try {
      if (!cameraRef.current) return

      const image = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.6,
      })

      if (!image) {
        console.warn(
          'Warning: Camera did not returned a picture for some reason',
        )
        return
      }

      useCameraStore.getState().setImage(image)
      goBack()
    } catch (error) {
      console.error('Error on takePictureAsync(): ', error)
    }
  }, [cameraRef, goBack])

  const [facing, setFacing] = useState<CameraType>('back')
  const toggleCameraFacing = useCallback(() => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'))
  }, [])

  return { takePicture, toggleCameraFacing, facing }
}

export {
  useNewCameraPictureHandle,
  useConversationStartUp,
  useSaveConversationOnExit,
  useOnSend,
  useCameraActions,
  useCameraStore,
}
