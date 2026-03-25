import * as Speech from 'expo-speech';
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

  // Speak text
  async speak(text: string, options?: SpeechOptions): Promise<void> {
    // Stop any current speech
    await this.stop();

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
      await Speech.stop();
      this.isSpeaking = false;
    }
  }

  // Pause speaking
  async pause(): Promise<void> {
    // Note: Expo Speech doesn't support pause/resume directly
    await this.stop();
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
  async getVoices(): Promise<Speech.Voice[]> {
    return Speech.getAvailableVoicesAsync();
  }

  // Check if speech is available
  async isAvailable(): Promise<boolean> {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      return voices.length > 0;
    } catch {
      return false;
    }
  }
}

export const speechService = new SpeechService();
