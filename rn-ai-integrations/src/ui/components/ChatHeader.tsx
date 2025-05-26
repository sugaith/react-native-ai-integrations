import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Keyboard, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

function ChatHeader() {
  const { goBack } = useNavigation()

  const onGoBack = useCallback(() => {
    Keyboard.dismiss()
    goBack()
  }, [goBack])

  const { top } = useSafeAreaInsets()

  return (
    <View style={{ paddingTop: top }}>
      <TouchableOpacity onPress={onGoBack}>
        <Text>back</Text>
      </TouchableOpacity>
    </View>
  )
}

export { ChatHeader }
