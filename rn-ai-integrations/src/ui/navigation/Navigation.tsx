import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import {
  CameraScreen,
  ChatScreen,
  ConversationListScreen,
  SpeechToTextScreen,
  LiveAudioScreen, // Added import
} from '../screens/'
import { HomeScreen } from '../screens/HomeScreen'

type StackNavigatorScreens = {
  HomeScreen: undefined
  ConversationListScreen: undefined
  ChatScreen: undefined
  CameraScreen: undefined
  SpeechToTextScreen: undefined
  LiveAudioScreen: undefined // Added screen to type
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
      <Stack.Navigator initialRouteName="HomeScreen">
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: 'AI Integrations' }}
        />
        <Stack.Screen
          name="LiveAudioScreen"
          component={LiveAudioScreen}
          options={{ title: 'Live Audio' }}
        />
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
