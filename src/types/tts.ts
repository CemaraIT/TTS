export type VoiceGender = "female" | "male";

export type VoiceId =
  | "Vindemiatrix"
  | "Sulafat"
  | "Achernar"
  | "Aoede"
  | "Achird"
  | "Algieba"
  | "Enceladus"
  | "Orus"
  | "Puck"
  | "Charon"
  | "Fenrir";

export interface VoiceOption {
  id: VoiceId;
  name: string;
  gender: VoiceGender;
  character: string;
  description: string;
  bestFor: string;
  isSoftStory?: boolean;
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
  recommendedVoice: VoiceId;
  recommendedStyleId: string;
  text: string;
}

export interface GeneratedAudioTake {
  id: string;
  createdAt: string;
  text: string;
  voiceName: VoiceId;
  styleLabel: string;
  sampleRate: number;
  durationSeconds: number;
  wavBytes: number;
  mp3Bytes: number;
  wavBase64: string;
  mp3Base64: string;
  waveform: number[];
}
