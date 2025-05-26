import { Button } from 'react-native'
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

  return <Button title="New" onPress={createNewConversationAndNavigate} />
}

export { NewConversationButton }
