import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getLanguageByCode, Language } from '../i18n/languages';

export interface SpeechOptions {
  language?: string;
  pitch?: number;
  rate?: number;
  onStart?: () => void;
  onDone?: () => void;
  onError?: (error: any) => void;
}

class SpeechService {
  private isSpeaking: boolean = false;
  private currentRate: number = 1.0; // 0.75 = slow, 1.0 = normal, 1.25 = fast
  private currentPitch: number = 1.0;
  private webSpeechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    // Initialize Web Speech API for web platform
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      this.webSpeechSynthesis = window.speechSynthesis || null;
    }
  }

  // Speak text using Web Speech API (for web platform)
  private speakWeb(text: string, options?: SpeechOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.webSpeechSynthesis) {
        // Fallback: Web Speech API not available
        console.warn('Web Speech API not available');
        options?.onError?.({ message: 'Speech not available on this platform' });
        reject(new Error('Speech not available'));
        return;
      }

      try {
        // Stop any current speech
        this.webSpeechSynthesis.cancel();

        const languageCode = options?.language || 'ar';
        const language = getLanguageByCode(languageCode);
        const speechCode = language?.speechCode || 'ar-SA';

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = speechCode;
        utterance.pitch = options?.pitch || this.currentPitch;
        utterance.rate = options?.rate || this.currentRate;

        // Find a suitable voice for Arabic
        const voices = this.webSpeechSynthesis.getVoices();
        const arabicVoice = voices.find(v => 
          v.lang.startsWith(speechCode.split('-')[0]) || 
          v.lang.includes('ar')
        );
        if (arabicVoice) {
          utterance.voice = arabicVoice;
        }

        utterance.onstart = () => {
          this.isSpeaking = true;
          options?.onStart?.();
        };

        utterance.onend = () => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          options?.onDone?.();
          resolve();
        };

        utterance.onerror = (event) => {
          this.isSpeaking = false;
          this.currentUtterance = null;
          console.error('Speech error:', event);
          options?.onError?.(event);
          reject(event);
        };

        this.currentUtterance = utterance;
        this.isSpeaking = true;
        this.webSpeechSynthesis.speak(utterance);

      } catch (error) {
        console.error('Error with Web Speech:', error);
        options?.onError?.(error);
        reject(error);
      }
    });
  }

  // Speak text using Expo Speech (for native platforms)
  private speakNative(text: string, options?: SpeechOptions): Promise<void> {
    const languageCode = options?.language || 'ar';
    const language = getLanguageByCode(languageCode);
    const speechCode = language?.speechCode || 'ar-SA';

    return new Promise((resolve, reject) => {
      this.isSpeaking = true;

      Speech.speak(text, {
        language: speechCode,
        pitch: options?.pitch || this.currentPitch,
        rate: options?.rate || this.currentRate,
        onStart: () => {
          this.isSpeaking = true;
          options?.onStart?.();
        },
        onDone: () => {
          this.isSpeaking = false;
          options?.onDone?.();
          resolve();
        },
        onError: (error) => {
          this.isSpeaking = false;
          options?.onError?.(error);
          reject(error);
        },
      });
    });
  }

  // Speak text - automatically chooses the right method based on platform
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    // Stop any current speech
    await this.stop();

    if (Platform.OS === 'web') {
      return this.speakWeb(text, options);
    } else {
      return this.speakNative(text, options);
    }
  }

  // Speak Arabic text (for Adhkar)
  async speakArabic(text: string, options?: Omit<SpeechOptions, 'language'>): Promise<void> {
    return this.speak(text, { ...options, language: 'ar' });
  }

  // Speak translation
  async speakTranslation(text: string, languageCode: string, options?: Omit<SpeechOptions, 'language'>): Promise<void> {
    return this.speak(text, { ...options, language: languageCode });
  }

  // Stop speaking
  async stop(): Promise<void> {
    if (this.isSpeaking) {
      if (Platform.OS === 'web' && this.webSpeechSynthesis) {
        this.webSpeechSynthesis.cancel();
        this.currentUtterance = null;
      } else {
        await Speech.stop();
      }
      this.isSpeaking = false;
    }
  }

  // Pause speaking
  async pause(): Promise<void> {
    if (Platform.OS === 'web' && this.webSpeechSynthesis) {
      this.webSpeechSynthesis.pause();
    } else {
      // Note: Expo Speech doesn't support pause/resume directly
      await this.stop();
    }
  }

  // Resume speaking
  async resume(): Promise<void> {
    if (Platform.OS === 'web' && this.webSpeechSynthesis) {
      this.webSpeechSynthesis.resume();
    }
  }

  // Check if speaking
  getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  // Set playback rate
  setRate(rate: 'slow' | 'normal' | 'fast'): void {
    switch (rate) {
      case 'slow':
        this.currentRate = 0.75;
        break;
      case 'normal':
        this.currentRate = 1.0;
        break;
      case 'fast':
        this.currentRate = 1.25;
        break;
    }
  }

  // Set pitch
  setPitch(pitch: number): void {
    this.currentPitch = pitch;
  }

  // Get available voices for a language
  async getVoices(): Promise<Speech.Voice[] | SpeechSynthesisVoice[]> {
    if (Platform.OS === 'web' && this.webSpeechSynthesis) {
      return this.webSpeechSynthesis.getVoices();
    }
    return Speech.getAvailableVoicesAsync();
  }

  // Check if speech is available
  async isAvailable(): Promise<boolean> {
    try {
      if (Platform.OS === 'web') {
        return this.webSpeechSynthesis !== null;
      }
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch {
      return false;
    }
  }
}

export const speechService = new SpeechService();
