export type MaleVoiceId = "Puck" | "Charon" | "Fenrir" | "Orus";

export interface MaleVoiceOption {
  id: MaleVoiceId;
  name: string;
  character: string;
  description: string;
  bestFor: string;
}

export interface SpeakingStylePreset {
  id: string;
  label: string;
  shortDesc: string;
  promptStyle: string;
}

export interface SampleScript {
  id: string;
  label: string;
  recommendedVoice: MaleVoiceId;
  recommendedStyleId: string;
  text: string;
}

export interface GeneratedAudioTake {
  id: string;
  createdAt: string;
  text: string;
  voiceName: MaleVoiceId;
  styleLabel: string;
  sampleRate: number;
  durationSeconds: number;
  wavBytes: number;
  mp3Bytes: number;
  wavBase64: string;
  mp3Base64: string;
  waveform: number[];
}
