import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Button, Keyboard, View } from 'react-native'

function ChatHeader() {
  const { goBack } = useNavigation()

  const onGoBack = useCallback(() => {
    Keyboard.dismiss()
    goBack()
  }, [goBack])

  return (
    <View padding={'$2'}>
      <Button title="go-back" onPress={onGoBack} />
    </View>
  )
}

export { ChatHeader }
