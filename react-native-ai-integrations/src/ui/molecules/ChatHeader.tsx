import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Keyboard } from 'react-native'
import { Button, XStack } from 'tamagui'
import { ArrowLeft } from '@tamagui/lucide-icons'

function ChatHeader() {
  const { goBack } = useNavigation()

  const onGoBack = useCallback(() => {
    Keyboard.dismiss()
    goBack()
  }, [goBack])

  return (
    <XStack padding={'$2'}>
      <Button
        onPress={onGoBack}
        icon={ArrowLeft}
        scaleIcon={2}
        padding={'$1'}
      />
    </XStack>
  )
}

export { ChatHeader }
