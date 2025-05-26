import { useNavigation } from '@react-navigation/native'
import { useCallback } from 'react'
import { Conversation, useConversationStore } from 'src/store/ConversationStore'
import { Avatar, Button, Spacer, Text, XStack, YStack } from 'tamagui'

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
    <Button
      height={'$6'}
      borderBottomWidth={1}
      borderColor="$gray5Light"
      justifyContent="flex-start"
      backgroundColor="$background0"
      borderRadius={0}
      onPress={openConversation}
      icon={
        <Avatar circular size="$3">
          <Avatar.Image
            accessibilityLabel="Cam"
            src="https://i.pravatar.cc/300"
          />
          <Avatar.Fallback backgroundColor="$blue10" />
        </Avatar>
      }
    >
      <YStack paddingLeft="$3">
        <XStack>
          <Text fontWeight="bold" color="$text" marginBottom="$1">
            {lastMessage?.user.name}
          </Text>

          <Spacer size={'$3'} />

          <Text fontSize="$2" color="$gray7">
            {lastMessage?.createdAt.toLocaleString() ||
              new Date().toLocaleString()}
          </Text>
        </XStack>

        <Text
          color="$gray8"
          marginBottom="$1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {lastMessage?.text.substring(0, 45) + '...'}
        </Text>
      </YStack>
    </Button>
  )
}

export { ConversationItem, ConversationItemProps }
