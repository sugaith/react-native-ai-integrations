import React from 'react'
import { StatusBar } from 'expo-status-bar'
import config from './tamagui.config'
import { TamaguiProvider } from '@tamagui/core'
import { useFonts } from 'expo-font'
import { Navigation } from './src'
import { View, Text, StyleSheet } from 'react-native'

export default function App() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  })

  if (!loaded) {
    return (
      <View style={styles.loadingView}>
        <Text>Loading..</Text>
      </View>
    )
  }

  return (
    <TamaguiProvider config={config}>
      <Navigation />
      <StatusBar style="auto" />
    </TamaguiProvider>
  )
}

const styles = StyleSheet.create({
  loadingView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})
