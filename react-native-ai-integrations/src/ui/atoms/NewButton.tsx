import { Button, Text } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { useConversationStore } from 'src/store'
import { useNavigation } from '@react-navigation/native'

function NewConversationButton() {
  const { navigate } = useNavigation()

  const createNewConversation = useConversationStore(
    (state) => state.createNewConversation,
  )

  const createNewConversationAndNavigate = () => {
    createNewConversation()
    navigate('ChatScreen')
  }

  return (
    <Button
      onPress={createNewConversationAndNavigate}
      position="absolute"
      bottom="$6"
      right="$6"
      backgroundColor="$blue10Light"
      borderRadius="$12"
      alignItems="center"
      justifyContent="center"
      icon={Plus}
      scaleIcon={1.5}
      color={'white'}
    >
      <Text color="white" marginLeft="$2">
        New
      </Text>
    </Button>
  )
}

export { NewConversationButton }
