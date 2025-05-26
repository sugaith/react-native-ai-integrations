import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { useConversationStore } from 'src/store/ConversationStore'
import { useCameraPermissions } from 'expo-camera'
import { NewConversationButton } from 'src/ui/components/NewButton'
import { ConversationItem, SearchInput } from 'src/ui/components'
import { SafeAreaView } from 'react-native-safe-area-context'

function ConversationListScreen() {
  const [permission, requestPermission] = useCameraPermissions()
  useEffect(() => {
    if (!permission) {
      requestPermission()
    }
  }, [permission, requestPermission])

  const conversationList = useConversationStore(
    (state) => state.conversationList,
  )

  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = conversationList.filter((conversation) => {
    const lastMessageText = conversation.messages.at(-1)?.text || ''
    return lastMessageText.toLowerCase().includes(searchQuery.toLowerCase())
  })

  return (
    <SafeAreaView style={{ padding: 4, flex: 1 }}>
      {!conversationList.length ? (
        <View
          style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}
        >
          <Text>Start a new conversation</Text>
        </View>
      ) : (
        <>
          <SearchInput
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />

          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={({ item: conversation }) => (
              <ConversationItem conversation={conversation} />
            )}
          />
        </>
      )}

      <NewConversationButton />
    </SafeAreaView>
  )
}

export { ConversationListScreen }
