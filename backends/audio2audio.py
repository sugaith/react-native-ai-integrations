import asyncio
import traceback
import pyaudio
from collections import deque
import json
import websockets
import base64
import wave
import io
from pydub import AudioSegment
from google import genai
from google.genai import types
import google.generativeai as generative
from dotenv import load_dotenv
import os


# Load environment variables from .env file
load_dotenv()

# Load API key from environment
# Use os.getenv to avoid KeyError if the variable is not set
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

generative.configure(api_key=GOOGLE_API_KEY)

PROJECT_ID = "sugaith"
LOCATION = "us-central1"
MODEL = "gemini-2.0-flash-live-preview-04-09"
TRANSCRIPTION_MODEL = "gemini-2.0-flash-lite"

client = genai.Client(vertexai=True, project=PROJECT_ID, location=LOCATION)

FORMAT = pyaudio.paInt16
RECEIVE_SAMPLE_RATE = 24000
SEND_SAMPLE_RATE = 16000
CHUNK_SIZE = 512
CHANNELS = 1

from google.genai.types import (
    LiveConnectConfig,
    SpeechConfig,
    VoiceConfig,
    PrebuiltVoiceConfig, Modality,
)

CONFIG = LiveConnectConfig(
    response_modalities=[Modality.AUDIO],
    # session_resumption=types.SessionResumptionConfig(
    # The handle of the session to resume is passed here,
    # or else None to start a new session.
    # handle="93f6ae1d-2420-40e9-828c-776cf553b7a6"
    # ),
    speech_config=SpeechConfig(
        voice_config=VoiceConfig(
            prebuilt_voice_config=PrebuiltVoiceConfig(voice_name="Puck")
        )
    ),
    system_instruction="You are a helpful customer service assistant for an online store. You can help customers check the status of their orders. When asked about an order, you should ask for the order ID and then use the get_order_status tool to retrieve the information. Be courteous, professional, and provide all relevant details about shipping, delivery dates, and current status.",
)


async def audio_loop(client_websocket: websockets):
    # audio_manager = AudioManager(
    #     input_sample_rate=SEND_SAMPLE_RATE, output_sample_rate=RECEIVE_SAMPLE_RATE
    # )
    #
    # await audio_manager.initialize()
    config_message = await client_websocket.recv()

    async with (
        client.aio.live.connect(model=MODEL, config=CONFIG) as session,
        asyncio.TaskGroup() as tg,
    ):
        print('---- Connected to Gemini ----->')
        # Queue for user audio chunks to control flow
        audio_queue = asyncio.Queue()

        async def listen_clients_pcm():
            """Just captures audio and puts it in the queue"""
            async for message in client_websocket:
                print('Receiving message from client...')
                try:
                    data = json.loads(message)
                    if "realtime_input" not in data:
                        continue

                    for chunk_info in data["realtime_input"]["media_chunks"]:
                        if chunk_info["mime_type"] != "audio/pcm":
                            continue

                        print(f"Received audio/pcm chunk (str len =  {len(str(chunk_info['data']))}...")

                        try:
                            pcm_chunk_bytes = base64.b64decode(chunk_info['data'])
                            await audio_queue.put(pcm_chunk_bytes)

                        except Exception as base64_decode_except:
                            print(f"Error decoding base64 audio data: {base64_decode_except}")
                            traceback.print_exc()
                except Exception as receive_wsmsg_except:
                    print(f"Error decoding base64 audio data: {receive_wsmsg_except}")
                    traceback.print_exc()

        async def send_pcm_to_gemini():
            """Processes audio from queue and sends to Gemini"""
            while True:
                data = await audio_queue.get()

                # Always send the audio data to Gemini
                await session.send_realtime_input(
                    media={
                        "data": data,
                        "mime_type": f"audio/pcm;rate={SEND_SAMPLE_RATE}",
                    }
                )
                audio_queue.task_done()

        async def listen_gemini_send_client():
            accumulated_audio_for_transcription = b''

            while True:
                async for response in session.receive():
                    try:
                        # retrieve continously resumable session ID
                        if response.session_resumption_update:
                            update = response.session_resumption_update
                            if update.resumable and update.new_handle:
                                # The handle should be retained and linked to the session.
                                print(f"new SESSION: {update.new_handle}")

                        # Check if the connection will be soon terminated
                        if response.go_away is not None:
                            print(response.go_away.time_left)

                        server_content = response.server_content

                        if (
                            hasattr(server_content, "interrupted")
                            and server_content.interrupted
                        ):
                            print(f"🤐 INTERRUPTION DETECTED")
                            print(f"🤐 TODO- SEND INTERRUPT SIGNAL TO CLIENT")
                            # audio_manageraudio_manager.interrupt()

                        if server_content and server_content.model_turn:
                            for part in server_content.model_turn.parts:
                                if part.inline_data:
                                    base64_audio = base64.b64encode(part.inline_data.data).decode('utf-8')
                                    await client_websocket.send(json.dumps({"audio": base64_audio}))
                                    print(f"Sent audio data to client (length: {len(base64_audio)})")
                                    # audio_manager.add_audio(part.inline_data.data)
                                    accumulated_audio_for_transcription += part.inline_data.data

                                elif part.text:
                                    print(f"Sending text to client: {part.text}")
                                    await client_websocket.send(json.dumps({"text": part.text}))

                        if server_content and server_content.turn_complete:
                            print("✅ Gemini done talking.. Transcribing and sending text to client...")
                            await client_websocket.send(json.dumps({"turn_complete": True}))

                            transcribed_text = transcribe_audio(accumulated_audio_for_transcription)
                            if transcribed_text:
                                print(f"Sending transcribed text to client: {transcribed_text}")
                                await client_websocket.send(json.dumps({"text": transcribed_text}))

                            accumulated_audio_for_transcription = b''
                    except Exception(BaseException) as receive_from_gemini_except:
                        print(f"Error receiving from Gemini")
                        traceback.print_exc()

        # Start all tasks with proper task creation
        tg.create_task(listen_clients_pcm())
        tg.create_task(send_pcm_to_gemini())
        tg.create_task(listen_gemini_send_client())

def transcribe_audio(audio_data):
    """Transcribes audio using Gemini 1.5 Flash."""
    try:
        # Make sure we have valid audio data
        if not audio_data:
            return "No audio data received."

        # Convert PCM to MP3
        mp3_audio_base64 = convert_pcm_to_mp3(audio_data)
        if not mp3_audio_base64:
            return "Audio conversion failed."

        # Create a client specific for transcription (assuming Gemini 1.5 flash)
        transcription_client = generative.GenerativeModel(model_name=TRANSCRIPTION_MODEL)

        prompt = """Generate a transcript of the speech. 
        Please do not include any other text in the response. 
        If you cannot hear the speech, please only say '<Not recognizable>'."""

        response = transcription_client.generate_content(
            [
                prompt,
                {
                    "mime_type": "audio/mp3",
                    "data": base64.b64decode(mp3_audio_base64),
                }
            ]
        )

        return response.text

    except Exception as e:
        print(f"Transcription error: {e}")
        traceback.print_exc()
        return "Transcription failed."


def convert_pcm_to_mp3(pcm_data, rate=16000): # Updated default rate
    """Converts PCM audio to base64 encoded MP3."""
    try:
        # Create a WAV in memory first
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(rate)  # 24kHz
            wav_file.writeframes(pcm_data)

        # Reset buffer position
        wav_buffer.seek(0)

        # Convert WAV to MP3
        audio_segment = AudioSegment.from_wav(wav_buffer)

        # Export as MP3
        mp3_buffer = io.BytesIO()
        audio_segment.export(mp3_buffer, format="mp3", codec="libmp3lame")

        # Convert to base64
        mp3_base64 = base64.b64encode(mp3_buffer.getvalue()).decode('utf-8')
        return mp3_base64

    except Exception as e:
        print(f"Error converting PCM to MP3: {e}")
        return None


async def serve_websockets() -> None:
    async with websockets.serve(
        audio_loop,
        "0.0.0.0",
        9083,
        ping_interval=60,  # Send a ping every 60 seconds
        ping_timeout=30    # Wait 30 seconds for a pong response
    ):
        print("Running websocket server on 0.0.0.0:9083 with increased keepalive timeouts...") # Updated print statement
        await asyncio.Future()  # Keep the server running indefinitely


if __name__ == "__main__":
    try:
        asyncio.run(serve_websockets(), debug=True)
    except KeyboardInterrupt:
        print("Exiting application via KeyboardInterrupt...")
    except Exception as e:
        print(f"Unhandled exception in main: {e}")
        traceback.print_exc()