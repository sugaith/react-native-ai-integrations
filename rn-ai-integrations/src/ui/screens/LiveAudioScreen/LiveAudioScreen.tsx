// EventTarget polyfill is required for the Flow SDK to work in React Native
import 'event-target-polyfill'
import { Button, StyleSheet, Text, View } from 'react-native'
import { GoogleGenAI, Modality } from '@google/genai'
import {
  type MicrophoneDataCallback,
  type VolumeLevelCallback,
  initialize,
  playPCMData,
  toggleRecording,
  useExpoTwoWayAudioEventListener,
  useIsRecording,
  useMicrophonePermissions,
} from '@speechmatics/expo-two-way-audio'

import { useCallback, useEffect, useState } from 'react'

const model = 'gemini-2.5-flash-preview-native-audio-dialog'

const config = {
  responseModalities: [Modality.AUDIO],
  systemInstruction:
    'You are a helpful assistant and answer in a friendly tone.',
}

function FlowTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [audioInitialized, setAudioInitialized] = useState(false)

  const isRecording = useIsRecording()

  // Initialize Expo Two Way Audio
  useEffect(() => {
    const initializeAudio = async () => {
      await initialize()
      setAudioInitialized(true)
    }

    initializeAudio()
  }, [])

  // Setup a handler for the "onMicrophoneData" event from Expo Two Way Audio module
  useExpoTwoWayAudioEventListener(
    'onMicrophoneData',
    useCallback<MicrophoneDataCallback>((event) => {
      console.log('onMicrophoneData', event)

      // in here, we have to probably send the PCM data to Google's Live Api
      // sendAudio(event.data.buffer) // implement this methid
    }, []),
  )

  // this is just here for convenience / experimentation. use if needed
  useExpoTwoWayAudioEventListener(
    'onInputVolumeLevelData',
    useCallback<VolumeLevelCallback>((event) => {
      console.log('volume level Output fired... ', event)
    }, []),
  )

  // this is just here for convenience / experimentation. use if needed
  useExpoTwoWayAudioEventListener(
    'onOutputVolumeLevelData',
    useCallback<VolumeLevelCallback>((event) => {
      console.log('volume level Output fired... ', event)
    }, []),
  )

  // Handle clicks to the 'Connect/Disconnect' button
  const handleToggleConnect = useCallback(async () => {
    if (isConnected) {
      setIsConnected(false)
      // perform disconnection logic
    } else {
      // perform connection logic here
      setIsConnected(true)
    }
  }, [isConnected])

  // Handle clicks to the 'Mute/Unmute' button
  const handleToggleMute = useCallback(() => {
    toggleRecording(!isRecording)
  }, [isRecording])

  return (
    <View style={styles.container}>
      <View style={styles.VolumeDisplayContainer}></View>
      <View>
        <Text>
          {isConnected
            ? isRecording
              ? "I'm ready to listen. Try saying something!"
              : 'Muted. Unmute to start a conversation'
            : 'Disconnected'}
        </Text>
      </View>
      <View style={styles.bottomBar}>
        <View style={styles.buttonContainer}>
          <Button
            title={isConnected ? 'Disconnect' : 'Connect'}
            disabled={!audioInitialized}
            onPress={handleToggleConnect}
          />

          <Button
            title={isRecording ? 'Mute' : 'Unmute'}
            disabled={!isConnected || !audioInitialized}
            onPress={handleToggleMute}
          />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  VolumeDisplayContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeDisplay: {
    position: 'absolute',
  },
})

function LiveAudioScreen() {
  const [micPermission, requestMicPermission] = useMicrophonePermissions()

  console.log(micPermission)

  if (!micPermission?.granted) {
    return (
      <View style={styles.container}>
        <Text>Mic permission: {micPermission?.status}</Text>
        <Button
          title={
            micPermission?.canAskAgain
              ? 'Request permission'
              : 'Cannot request permissions'
          }
          disabled={!micPermission?.canAskAgain}
          onPress={requestMicPermission}
        />
      </View>
    )
  }

  return <FlowTest />
}

const styles2 = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    padding: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  VolumeDisplayContainer: {
    position: 'relative',
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeDisplay: {
    position: 'absolute',
  },
})

export { LiveAudioScreen }
