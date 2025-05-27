import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  CameraScreen,
  ChatScreen,
  ConversationListScreen,
  SpeechToTextScreen,
} from '../screens/'

type StackNavigatorScreens = {
  ConversationListScreen: undefined
  ChatScreen: undefined
  CameraScreen: undefined
  SpeechToTextScreen: undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends StackNavigatorScreens {}
  }
}

const Stack = createNativeStackNavigator<StackNavigatorScreens>()

function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SpeechToTextScreen">
        <Stack.Screen
          name="ConversationListScreen"
          component={ConversationListScreen}
          options={{ title: 'Your Chats' }}
        />

        <Stack.Screen
          name="ChatScreen"
          component={ChatScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="SpeechToTextScreen"
          component={SpeechToTextScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="CameraScreen" component={CameraScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export type { StackNavigatorScreens }
export { Navigation }
