// EventTarget polyfill is required for the Flow SDK to work in React Native
import 'event-target-polyfill'
import { Button, StyleSheet, Text, View } from 'react-native'
import {
  type MicrophoneDataCallback,
  initialize,
  playPCMData,
  toggleRecording,
  useExpoTwoWayAudioEventListener,
  useIsRecording,
  useMicrophonePermissions,
} from '@speechmatics/expo-two-way-audio'
import { Buffer } from 'buffer'

import { useCallback, useEffect, useState, useRef } from 'react'

// Helper function to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return Buffer.from(binary, 'binary').toString('base64')
}

function FlowTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false) // Added for connection attempt
  const [audioInitialized, setAudioInitialized] = useState(false)
  const [serverResponseText, setServerResponseText] = useState('') // Added for server text messages
  const wsRef = useRef<WebSocket | null>(null)
  const acc_buffer = useRef('')

  const isRecording = useIsRecording()

  // Initialize Expo Two Way Audio
  useEffect(() => {
    const initializeAudio = async () => {
      await initialize()
      setAudioInitialized(true)
    }

    initializeAudio()

    // Cleanup WebSocket on component unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Setup a handler for the "onMicrophoneData" event from Expo Two Way Audio module
  useExpoTwoWayAudioEventListener(
    'onMicrophoneData',
    useCallback<MicrophoneDataCallback>((event) => {
      // console.log('onMicrophoneData', event) // Keep for debugging if needed

      if (
        wsRef.current &&
        wsRef.current.readyState === WebSocket.OPEN &&
        event.data.buffer
      ) {
        try {
          const base64Audio = arrayBufferToBase64(event.data.buffer)
          const message = {
            realtime_input: {
              media_chunks: [{ mime_type: 'audio/pcm', data: base64Audio }],
            },
          }
          // console.log('-- sending audio (base64 chunk) --')

          wsRef.current.send(JSON.stringify(message))
          // console.log('-- audio sent!! --')
        } catch (error) {
          console.error('Error sending audio data:', error)
        }
      }
    }, []),
  )

  // // this is just here for convenience / experimentation. use if needed
  // useExpoTwoWayAudioEventListener(
  //   'onInputVolumeLevelData',
  //   useCallback<VolumeLevelCallback>((event) => {
  //     console.log('onInputVolumeLevelData...', event)
  //   }, []),
  // )

  // // this is just here for convenience / experimentation. use if needed
  // useExpoTwoWayAudioEventListener(
  //   'onOutputVolumeLevelData',
  //   useCallback<VolumeLevelCallback>((event) => {
  //     console.log('onOutputVolumeLevelData...', event)
  //   }, []),
  // )

  // Handle clicks to the 'Connect/Disconnect' button
  const handleToggleConnect = useCallback(async () => {
    if (isConnected) {
      if (wsRef.current) {
        wsRef.current.close()
        // wsRef.current will be set to null in the onclose handler
      }
      setIsConnected(false)
    } else {
      setIsConnecting(true)
      setServerResponseText('') // Clear previous responses
      // Replace 'localhost' with your machine's network IP if running on a physical device
      // or if localhost doesn't resolve correctly from the emulator.
      const ws = new WebSocket('ws://192.168.1.123:9083')
      wsRef.current = ws

      ws.onopen = () => {
        console.log('WebSocket connected')
        setIsConnected(true)
        setIsConnecting(false)
        // Send config message
        ws.send(JSON.stringify({ setup: {} }))
      }

      ws.onmessage = (event) => {
        console.log(
          'WebSocket message received!!!!! look down!!!\n',
          event?.data?.startsWith(`{"audio"`) ? event.data.length : event.data,
        ) // Keep for debugging
        try {
          const message = JSON.parse(event.data as string)
          if (message.text) {
            setServerResponseText((prev) => prev + message.text + '\n')
          }
          if (message.audio) {
            acc_buffer.current += message.audio

            const buffer = Buffer.from(message.audio, 'base64')
            const pcmData = new Uint8Array(buffer)
            playPCMData(pcmData, 24000)
          }
          if (message.turn_complete) {
            // if (!acc_buffer.current) return
            acc_buffer.current = ''

            console.log('🤐 Turn complete.. Gemini shut-up...')
          }
        } catch (error) {
          console.error('Error processing message from server:', error)
          setServerResponseText(
            (prev) => prev + 'Error processing server message.' + '\n',
          )
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setServerResponseText(
          (prev) => prev + 'WebSocket error. Check console.' + '\n',
        )
        setIsConnected(false)
        setIsConnecting(false)
        if (isRecording) {
          toggleRecording(false)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        setIsConnected(false)
        setIsConnecting(false)
        wsRef.current = null
        if (isRecording) {
          // Optionally stop recording on disconnect
          // toggleRecording(false)
        }
      }
    }
  }, [isConnected, isRecording])

  // Handle clicks to the 'Mute/Unmute' button
  const handleToggleMute = useCallback(() => {
    const newRecordingState = !isRecording
    toggleRecording(newRecordingState)
    if (!newRecordingState) {
      // Means we just stopped recording (muted)
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('-- sending end_of_turn --')
        wsRef.current.send(JSON.stringify({ action: 'end_of_turn' }))
      }
    }
  }, [isRecording])

  return (
    <View className={'flex-1 items-center p-3 bg-background text-accent'}>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <Text className={`text-${!isConnected ? 'accent' : 'accent-second'}`}>
          {isConnecting
            ? 'Connecting...'
            : isConnected
              ? isRecording
                ? 'Listening... Try saying something!'
                : 'Muted. Unmute to start talking.'
              : 'Disconnfdfdfected. Press Connect.'}
        </Text>

        <Text className={'text-body'} numberOfLines={10}>
          {serverResponseText || 'Server responses will appear here...'}
        </Text>
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.buttonContainer}>
          <Button
            title={isConnected ? 'Disconnect' : 'Connect'}
            disabled={!audioInitialized || isConnecting}
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

export { LiveAudioScreen }
