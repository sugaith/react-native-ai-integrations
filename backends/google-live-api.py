## pip install --upgrade google-genai==0.3.0 google-generativeai==0.8.3 python-dotenv##
import asyncio
import json
import os
import websockets
import websockets.protocol
from google import genai
import base64
import io
from pydub import AudioSegment
import google.generativeai as generative
import wave
from dotenv import load_dotenv
import traceback # Added import

# Load environment variables from .env file
load_dotenv()

# Load API key from environment
# Use os.getenv to avoid KeyError if the variable is not set
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY not found in environment variables. Please set it in your .env file.")

generative.configure(api_key=GOOGLE_API_KEY)
MODEL = "gemini-2.0-flash-exp"  # use your model ID
TRANSCRIPTION_MODEL = "gemini-1.5-flash-8b"

client = genai.Client(
  http_options={
    'api_version': 'v1alpha',
  }
)

async def gemini_session_handler(client_websocket: websockets):
    """Handles the interaction with Gemini API within a websocket session."""
    print(f"New client connection from: {client_websocket.remote_address}")
    try:
        print("Waiting for config message from client...")
        config_message = await client_websocket.recv()
        print(f"Received config message from client: {config_message}")
        config_data = json.loads(config_message)
        config = config_data.get("setup", {})
        print(f"Parsed config: {config}")

        print("Attempting to connect to Gemini API...")
        async with client.aio.live.connect(model=MODEL, config=config) as session:
            print("Successfully connected to Gemini API")

            async def send_to_gemini():
                """Sends messages from the client websocket to the Gemini API."""
                print("send_to_gemini task started")
                try:
                  async for message in client_websocket:
                      print(f"Relaying message from client to Gemini: {message[:200]}...") # Log first 200 chars
                      try:
                          data = json.loads(message)
                          if "realtime_input" in data:
                              for chunk in data["realtime_input"]["media_chunks"]:
                                  if chunk["mime_type"] == "audio/pcm":
                                      await session.send({"mime_type": "audio/pcm", "data": chunk["data"]})
                                      print("SENT AUDIO--- audio/pcm chunk to Gemini")
                                  elif chunk["mime_type"] == "image/jpeg":
                                      await session.send({"mime_type": "image/jpeg", "data": chunk["data"]})
                                      print("Sent image/jpeg chunk to Gemini")
                      except Exception as e:
                          print(f"Error processing/sending client message to Gemini: {e}")
                  print("Client connection closed (send_to_gemini loop ended)")
                except websockets.exceptions.ConnectionClosed as e:
                    print(f"send_to_gemini: WebSocket connection closed by client - {e}")
                except Exception as e:
                     print(f"Error in send_to_gemini: {e}")
                finally:
                   print("send_to_gemini task finished")

            async def receive_from_gemini():
                """Receives responses from the Gemini API and forwards them to the client, looping until turn is complete."""
                print("DEBUG: Running receive_from_gemini with aiter/anext v3") # New debug line
                print("receive_from_gemini task started")
                try:
                    # Get an async iterator from the session.receive() async iterable
                    response_aiter = aiter(session.receive())
                    while True:
                        try:
                            print("Waiting for response from Gemini...")
                            # Use anext() with asyncio.wait_for to get the next item with a timeout
                            response = await asyncio.wait_for(anext(response_aiter), timeout=10.0) 
                            
                            if response is None: # Should ideally be caught by StopAsyncIteration
                                print("Received NADAAAAAAAAAAAAAAAA..None from Gemini (should be StopAsyncIteration if ended), continuing...")
                                continue

                            if response.server_content is None:
                                print(f'Unhandled server message type from Gemini! - {response}')
                                continue

                            print('RECEIVED FROM MF GEMINI!!!!!!')
                            model_turn = response.server_content.model_turn
                            if model_turn:
                                print("Processing model_turn from Gemini...")
                                for part in model_turn.parts:
                                    if hasattr(part, 'text') and part.text is not None:
                                        print(f"Sending text to client: {part.text}")
                                        await client_websocket.send(json.dumps({"text": part.text}))
                                    elif hasattr(part, 'inline_data') and part.inline_data is not None:
                                        print(f"Received inline_data (audio) from Gemini, mime_type: {part.inline_data.mime_type}")
                                        base64_audio = base64.b64encode(part.inline_data.data).decode('utf-8')
                                        await client_websocket.send(json.dumps({"audio": base64_audio}))
                                        print(f"Sent audio data to client (length: {len(base64_audio)})")
                                        
                                        if not hasattr(session, 'audio_data'):
                                            session.audio_data = b''
                                        session.audio_data += part.inline_data.data
                                        print("Accumulated audio data from Gemini")

                            if response.server_content.turn_complete:
                                print('\\\\n<Turn complete received from Gemini>')
                                if hasattr(session, 'audio_data') and session.audio_data:
                                    print("Transcribing accumulated audio...")
                                    transcribed_text = transcribe_audio(session.audio_data)
                                    if transcribed_text:
                                        print(f"Sending transcribed text to client: {transcribed_text}")
                                        await client_websocket.send(json.dumps({"text": transcribed_text}))
                                    session.audio_data = b'' # Clear accumulated audio
                                else:
                                    print("Turn complete, but no audio_data to transcribe.")
                        except asyncio.TimeoutError:
                            print("receive_from_gemini: Timeout waiting for Gemini response. Still alive...")
                            # Check if client websocket is still open using .state and websockets.protocol.State
                            if client_websocket.state != websockets.protocol.State.OPEN: # MODIFIED HERE
                                print(f"receive_from_gemini: Client websocket is no longer OPEN (state: {client_websocket.state}). Breaking loop.")
                                break
                            continue 
                        except StopAsyncIteration:
                            print("receive_from_gemini: Gemini stream ended.")
                            break # Exit the loop, as the stream is complete
                        except websockets.exceptions.ConnectionClosedOK:
                            print("receive_from_gemini: Client connection closed normally. Breaking loop.")
                            break
                        except websockets.exceptions.ConnectionClosedError as e:
                            print(f"receive_from_gemini: Client connection closed with error - {e}. Breaking loop.")
                            break
                        except Exception as e:
                            print(f"Error in receive_from_gemini inner loop: {e}")
                            break 
                except Exception as e: # Outer exception block
                      print(f"Error in receive_from_gemini outer loop (repr): {repr(e)}")
                      print("Traceback for outer loop error:")
                      traceback.print_exc() # Print the full traceback
                finally:
                      print("receive_from_gemini task finished")


            # Start send loop
            send_task = asyncio.create_task(send_to_gemini())
            # Launch receive loop as a background task
            receive_task = asyncio.create_task(receive_from_gemini())
            await asyncio.gather(send_task, receive_task)


    except Exception as e:
        print(f"Error in Gemini session: {e}")
    finally:
        print("Gemini session closed.")

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
        return "Transcription failed.", None

def convert_pcm_to_mp3(pcm_data):
    """Converts PCM audio to base64 encoded MP3."""
    try:
        # Create a WAV in memory first
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(24000)  # 24kHz
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


async def main() -> None:
    async with websockets.serve(gemini_session_handler, "0.0.0.0", 9083): # Changed "localhost" to "0.0.0.0"
        print("Running websocket server on 0.0.0.0:9083...") # Updated print statement
        await asyncio.Future()  # Keep the server running indefinitely


if __name__ == "__main__":
    asyncio.run(main())