import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
} from 'react-native'
// import * as FileSystem from 'expo-file-system' // No longer needed for audioStreamOptions here
import LiveAudioStream from 'react-native-live-audio-stream'
import { Buffer } from 'buffer'

const audioStreamOptions = {
  sampleRate: 16000,
  channels: 1,
  bitsPerSample: 16,
  audioSource: 1,
  bufferSize: 16000,
}

const LiveAudioScreen = () => {
  const [status, setStatus] = useState('Connecting...')
  const [isRecording, setIsRecording] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const audioBuffer = useRef<number[]>([]) // For live recording, this remains number[] as per current logic

  useEffect(() => {
    ws.current = new WebSocket('ws://192.168.1.107:9083')

    ws.current.onopen = () => {
      setStatus('Connected to WebSocket. Waiting for audio...')
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string)
        if (message.audio) {
          console.log('Audio data received')
        } else if (message.text) {
          console.log('Text message received:', message.text)
        }
      } catch (error) {
        console.error('Error processing message:', error)
        setStatus('Error processing message.')
      }
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      setStatus(`WebSocket error: ${(error as any).message || 'Unknown error'}`)
    }

    ws.current.onclose = () => {
      setStatus('WebSocket connection closed.')
      console.log('WebSocket connection closed')
    }

    return () => {
      ws.current?.close()
    }
  }, [])

  const sendAudio = (data: number[]) => {
    console.log(
      `LiveAudioScreen: onChunk called. Data length: ${data.length}, WS readyState: ${ws.current?.readyState}`,
    )
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log('LiveAudioScreen: Sending audio chunk to WebSocket server...')
      ws.current.send(
        JSON.stringify({
          realtime_input: {
            media_chunks: [{ mime_type: 'audio/pcm', data: data }],
          },
        }),
      )
    } else {
      console.log(
        'LiveAudioScreen: onChunk called, but WebSocket is not open or not available.',
      )
      if (ws.current) {
        console.log(
          `LiveAudioScreen: WebSocket actual readyState: ${ws.current.readyState}, WebSocket URL: ${ws.current.url}`,
        )
      } else {
        console.log('LiveAudioScreen: WebSocket (ws.current) is null.')
      }
    }
  }

  const float32ArrayFromPCMBinaryBuffer = (b64EncodedBuffer: string) => {
    const b64DecodedChunk = Buffer.from(b64EncodedBuffer, 'base64')
    const int16Array = new Int16Array(b64DecodedChunk.buffer)

    const float32Array = new Float32Array(int16Array.length)
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = Math.max(
        -1,
        Math.min(1, (int16Array[i] / audioStreamOptions.bufferSize) * 8),
      )
    }
    return float32Array
  }

  const onChunk = (data) => {
    console.log('on chunk...', data.length)

    // const float32Chunk = float32ArrayFromPCMBinaryBuffer(data)

    console.log('will transcribe stream!!!!')

    // streamingTranscribe(STREAMING_ACTION.DATA, Array.from(float32Chunk))

    console.log('--> did transcribe stream!!!!')

    sendAudio(data)

    // audioBuffer.current?.push(...Array.from(float32Chunk)) // Spreads Float32Array into number[]
    audioBuffer.current?.push(data as unknown as number) // Spreads Float32Array into number[]
    // this is obviously wrong....
  }

  const handleRecordPress = async () => {
    if (Platform.OS === 'android') {
      const permission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      )
      if (!permission) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        )
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Microphone permission denied')
          return
        }
      }
    }

    if (isRecording) {
      LiveAudioStream.stop()
      setIsRecording(false)
      console.log('will transcribe!!!!')

      sendAudio(audioBuffer.current)

      console.log('--> done transcribing!!!!!!')

      audioBuffer.current = []

      //   streamingTranscribe(STREAMING_ACTION.STOP)
    } else {
      ws.current?.send(JSON.stringify({ setup: {} }))

      setIsRecording(true)
      console.log('startStreamingAudio')

      LiveAudioStream.init(audioStreamOptions as any)

      console.log('steam audio initiated....')

      LiveAudioStream.on('data', onChunk)
      console.log('event added')

      LiveAudioStream.start()

      console.log('stream started')
      //   startStreamingAudio(audioStreamOptions, onChunk)
      //   streamingTranscribe(STREAMING_ACTION.START)
    }
  }

  const recordingButtonDisabled =
    !ws.current || ws.current.readyState !== WebSocket.OPEN

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Live Audio Stream</Text>
      <Text style={styles.status}>{status}</Text>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording ? styles.recording : styles.notRecording,
        ]}
        onPress={handleRecordPress}
        disabled={recordingButtonDisabled}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.instructions}>
        {isRecording
          ? 'Recording audio and sending to server...'
          : 'Press the button to start recording audio.'}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 16,
    marginBottom: 20,
  },
  recordButton: {
    width: 200,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  recording: {
    backgroundColor: 'red',
  },
  notRecording: {
    backgroundColor: 'green',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructions: {
    textAlign: 'center',
    paddingHorizontal: 20,
    fontSize: 16,
  },
})

export { LiveAudioScreen }
