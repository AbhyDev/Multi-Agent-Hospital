from gtts import gTTS
import pygame
import io
import speech_recognition as sr

def text_to_speech(text:str, lang='en'):
    """
    Generates speech from text and plays it directly without saving a file.
    """
    try:
        # Create an in-memory binary stream
        with io.BytesIO() as mp3_fp:
            # Create the gTTS object and write the audio data to the stream
            tts = gTTS(text=text, lang=lang)
            tts.write_to_fp(mp3_fp)
            
            # Rewind the stream to the beginning
            mp3_fp.seek(0)
            
            # Initialize pygame mixer and play the audio
            pygame.mixer.init()
            pygame.mixer.music.load(mp3_fp)
            pygame.mixer.music.play()
            
            # Wait for the audio to finish playing
            while pygame.mixer.music.get_busy():
                pygame.time.Clock().tick(10)
    
    except Exception as e:
        print(f"An error occurred: {e}")

def speech_to_text(lang='hi-IN'):
    """
    Listens to microphone input and converts it to text.
    Allows for longer pauses in speech.
    """
    r = sr.Recognizer()
    
    # Set the pause threshold to 2 seconds. 
    # The recognizer will wait for 2 seconds of silence before stopping.
    r.pause_threshold = 3.5
    
    with sr.Microphone() as source:
        print("Listening for up to 30 seconds...")
        r.adjust_for_ambient_noise(source, duration=0.5)
        
        # You can also add a timeout and phrase_time_limit
        # timeout: how long to wait for speech to start
        # phrase_time_limit: maximum length of a single phrase
        audio = r.listen(source, timeout=15, phrase_time_limit=30)

    try:
        print("Recognizing...")
        recognized_text = r.recognize_google(audio, language=lang)
        print(f"User said: {recognized_text}")
        return recognized_text.lower()

    except sr.UnknownValueError:
        return "Sorry, I could not understand the audio."
    except sr.RequestError as e:
        return f"API Error: {e}"
    except sr.WaitTimeoutError:
        return "No speech detected within the timeout period."
