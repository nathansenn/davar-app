/**
 * Audio Service
 * Text-to-speech for Bible reading
 * 
 * Uses expo-speech for TTS functionality.
 * Future: Could integrate with audio Bible APIs for professional recordings.
 */

import * as Speech from 'expo-speech';

export type VoiceLanguage = 'en' | 'he' | 'el';

export interface AudioSettings {
  rate: number;      // Speech rate (0.5 - 2.0, default 1.0)
  pitch: number;     // Voice pitch (0.5 - 2.0, default 1.0)
  language: VoiceLanguage;
  voice?: string;    // Specific voice ID if available
}

export interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentVerse: number;
  totalVerses: number;
}

export type AudioCallback = (state: AudioState) => void;

const DEFAULT_SETTINGS: AudioSettings = {
  rate: 0.9,    // Slightly slower for scripture reading
  pitch: 1.0,
  language: 'en',
};

// Language codes for different text types
const LANGUAGE_MAP: Record<string, string> = {
  'en': 'en-US',
  'he': 'he-IL',   // Hebrew
  'el': 'el-GR',   // Greek
};

class AudioService {
  private settings: AudioSettings = DEFAULT_SETTINGS;
  private isSpeaking: boolean = false;
  private currentVerseIndex: number = 0;
  private verses: string[] = [];
  private stateCallback: AudioCallback | null = null;
  private isPaused: boolean = false;

  /**
   * Set audio settings
   */
  setSettings(settings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...settings };
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Check if TTS is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get available voices
   */
  async getVoices(): Promise<Speech.Voice[]> {
    try {
      return await Speech.getAvailableVoicesAsync();
    } catch {
      return [];
    }
  }

  /**
   * Get voices for a specific language
   */
  async getVoicesForLanguage(language: VoiceLanguage): Promise<Speech.Voice[]> {
    const voices = await this.getVoices();
    const languageCode = LANGUAGE_MAP[language] || language;
    return voices.filter(v => v.language.startsWith(languageCode.split('-')[0]));
  }

  /**
   * Speak a single text
   */
  async speak(text: string, language?: VoiceLanguage): Promise<void> {
    await this.stop();
    
    this.isSpeaking = true;
    
    return new Promise((resolve, reject) => {
      Speech.speak(text, {
        language: LANGUAGE_MAP[language || this.settings.language],
        rate: this.settings.rate,
        pitch: this.settings.pitch,
        voice: this.settings.voice,
        onDone: () => {
          this.isSpeaking = false;
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          reject(error);
        },
        onStopped: () => {
          this.isSpeaking = false;
          resolve();
        },
      });
    });
  }

  /**
   * Speak multiple verses sequentially
   */
  async speakVerses(
    verses: Array<{ number: number; text: string }>,
    options?: {
      startIndex?: number;
      onProgress?: AudioCallback;
    }
  ): Promise<void> {
    await this.stop();
    
    this.verses = verses.map(v => 
      `Verse ${v.number}. ${v.text.replace(/[""]/g, '"').replace(/['']/g, "'")}`
    );
    this.currentVerseIndex = options?.startIndex || 0;
    this.stateCallback = options?.onProgress || null;
    this.isPaused = false;
    
    await this.speakNextVerse();
  }

  /**
   * Speak the next verse in the queue
   */
  private async speakNextVerse(): Promise<void> {
    if (this.currentVerseIndex >= this.verses.length || this.isPaused) {
      this.isSpeaking = false;
      this.notifyState();
      return;
    }

    const text = this.verses[this.currentVerseIndex];
    this.isSpeaking = true;
    this.notifyState();

    try {
      await this.speak(text);
      
      if (!this.isPaused) {
        this.currentVerseIndex++;
        await this.speakNextVerse();
      }
    } catch (error) {
      console.error('Error speaking verse:', error);
      this.isSpeaking = false;
      this.notifyState();
    }
  }

  /**
   * Notify the state callback
   */
  private notifyState() {
    if (this.stateCallback) {
      this.stateCallback({
        isPlaying: this.isSpeaking,
        isPaused: this.isPaused,
        currentVerse: this.currentVerseIndex + 1,
        totalVerses: this.verses.length,
      });
    }
  }

  /**
   * Pause speech
   */
  async pause(): Promise<void> {
    this.isPaused = true;
    await Speech.stop();
    this.isSpeaking = false;
    this.notifyState();
  }

  /**
   * Resume speech from current position
   */
  async resume(): Promise<void> {
    if (this.isPaused && this.verses.length > 0) {
      this.isPaused = false;
      await this.speakNextVerse();
    }
  }

  /**
   * Stop all speech
   */
  async stop(): Promise<void> {
    this.isPaused = false;
    this.isSpeaking = false;
    this.currentVerseIndex = 0;
    this.verses = [];
    await Speech.stop();
    this.notifyState();
  }

  /**
   * Check if currently speaking
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  /**
   * Skip to a specific verse
   */
  async skipToVerse(index: number): Promise<void> {
    if (index >= 0 && index < this.verses.length) {
      await Speech.stop();
      this.currentVerseIndex = index;
      if (!this.isPaused) {
        await this.speakNextVerse();
      } else {
        this.notifyState();
      }
    }
  }

  /**
   * Skip to next verse
   */
  async nextVerse(): Promise<void> {
    if (this.currentVerseIndex < this.verses.length - 1) {
      await this.skipToVerse(this.currentVerseIndex + 1);
    }
  }

  /**
   * Skip to previous verse
   */
  async previousVerse(): Promise<void> {
    if (this.currentVerseIndex > 0) {
      await this.skipToVerse(this.currentVerseIndex - 1);
    }
  }
}

export const audioService = new AudioService();
export default audioService;
