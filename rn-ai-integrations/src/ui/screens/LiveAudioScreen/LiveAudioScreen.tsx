import React, { useEffect, useState, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { AudioContext, AudioBufferSourceNode } from 'react-native-audio-api'
import * as FileSystem from 'expo-file-system'

const LiveAudioScreen = () => {
  const [status, setStatus] = useState('Connecting...')
  const [audioQueue, setAudioQueue] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null)

  useEffect(() => {
    audioContextRef.current = new AudioContext()

    // ws.current = new WebSocket('ws://localhost:9083')
    ws.current = new WebSocket('ws://192.168.1.107:9083') // Updated WebSocket URL

    ws.current.onopen = () => {
      setStatus('Connected to WebSocket. Waiting for audio...')
      ws.current?.send(JSON.stringify({ setup: {} }))
    }

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string)
        if (message.audio) {
          console.log('Audio data received')
          setAudioQueue((prevQueue) => [...prevQueue, message.audio])
        } else if (message.text) {
          console.log('Text message received:', message.text)
          // setStatus(`Received text: ${message.text}`)
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
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.stop()
          sourceNodeRef.current.disconnect()
        } catch (e) {
          console.warn(
            'Error stopping/disconnecting source node on unmount:',
            e,
          )
        }
      }
      audioContextRef.current
        ?.close()
        .catch((e) =>
          console.error('Failed to close audio context on unmount', e),
        )
    }
  }, [])

  useEffect(() => {
    const playNextAudio = async () => {
      if (audioQueue.length > 0 && !isPlaying && audioContextRef.current) {
        setIsPlaying(true)
        const base64Audio = audioQueue[0]
        const audioContext = audioContextRef.current
        const tempFileUri = `${FileSystem.cacheDirectory}temp_audio_chunk_${Date.now()}.mp3`

        try {
          console.log(
            'Attempting to play audio chunk via react-native-audio-api...',
          )

          await FileSystem.writeAsStringAsync(tempFileUri, base64Audio, {
            encoding: FileSystem.EncodingType.Base64,
          })
          console.log('Audio chunk saved to temporary file:', tempFileUri)

          const audioBuffer =
            await audioContext.decodeAudioDataSource(tempFileUri)

          console.log('Audio chunk decoded.')

          if (!audioBuffer) {
            throw new Error('Failed to decode audio data source.')
          }

          if (sourceNodeRef.current) {
            try {
              sourceNodeRef.current.stop()
              sourceNodeRef.current.disconnect()
            } catch (e) {
              console.warn(
                'Error stopping/disconnecting previous source node:',
                e,
              )
            }
          }

          const sourceNode = audioContext.createBufferSource()
          sourceNodeRef.current = sourceNode
          sourceNode.buffer = audioBuffer
          sourceNode.connect(audioContext.destination)

          sourceNode.onended = () => {
            console.log('Audio chunk finished playing.')
            setIsPlaying(false)
            setAudioQueue((prevQueue) => prevQueue.slice(1))
            try {
              sourceNode.disconnect()
            } catch (e) {
              console.warn('Error disconnecting source node onended:', e)
            }
            sourceNodeRef.current = null
            FileSystem.deleteAsync(tempFileUri, { idempotent: true })
              .then(() =>
                console.log('Temporary audio file deleted:', tempFileUri),
              )
              .catch((e) =>
                console.error('Error deleting temporary audio file:', e),
              )
          }

          sourceNode.start()
          setStatus('Playing audio...')
        } catch (error: any) {
          console.error(
            'Error playing audio with react-native-audio-api:',
            error,
          )
          setStatus(`Error playing audio: ${error.message || error}`)
          setIsPlaying(false)
          setAudioQueue((prevQueue) => prevQueue.slice(1))
          FileSystem.deleteAsync(tempFileUri, { idempotent: true }).catch((e) =>
            console.error('Error deleting temp file on error:', e),
          )
        }
      }
    }

    playNextAudio()
  }, [audioQueue, isPlaying])

  return (
    <View style={styles.container}>
      <Text style={styles.statusText}>{status}</Text>
      <Text style={styles.queueText}>
        Audio chunks in queue: {audioQueue.length}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  statusText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  queueText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
})

export { LiveAudioScreen }
