import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Conversation, useConversationStore } from 'src/store/ConversationStore'
import { Spacer } from './Spacer'

type ConversationItemProps = {
  conversation: Conversation
}

const ConversationItem = ({ conversation }: ConversationItemProps) => {
  const { navigate } = useNavigation()
  const setCurrentConversation = useConversationStore(
    (state) => state.setCurrentConversation,
  )
  const openConversation = useCallback(() => {
    setCurrentConversation(conversation)
    navigate('ChatScreen')
  }, [conversation, navigate, setCurrentConversation])

  const lastMessage = conversation.messages.at(0)

  return (
    <TouchableOpacity
      onPress={openConversation}
      // icon={
      //   <Avatar circular size="$3">
      //     <Avatar.Image
      //       accessibilityLabel="Cam"
      //       src="https://i.pravatar.cc/300"
      //     />
      //     <Avatar.Fallback backgroundColor="$blue10" />
      //   </Avatar>
      // }
    >
      <View >
        <View>
          <Text >
            {lastMessage?.user.name}
          </Text>

          <Spacer size={3} />

          <Text >
            {lastMessage?.createdAt.toLocaleString() ||
              new Date().toLocaleString()}
          </Text>
        </View>

        <Text
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastMessage?.text.substring(0, 45) + '...'}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export { ConversationItem, ConversationItemProps }
