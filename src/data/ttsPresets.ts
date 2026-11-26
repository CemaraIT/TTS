import type {
  MaleVoiceOption,
  SampleScript,
  SpeakingStylePreset,
} from "../types/tts";

export const MALE_VOICES: MaleVoiceOption[] = [
  {
    id: "Orus",
    name: "Orus",
    character: "Hangat & Natural",
    description:
      "Nada suara pria dewasa yang ramah, jernih, dan luwes seperti obrolan sehari-hari.",
    bestFor: "Narasi santai, konten edukasi, explainer",
  },
  {
    id: "Puck",
    name: "Puck",
    character: "Ringan & Ekspresif",
    description:
      "Intonasi lebih dinamis dan ceria dengan artikulasi ringan yang akrab di telinga.",
    bestFor: "Vlog, intro podcast, sapaan interaktif",
  },
  {
    id: "Charon",
    name: "Charon",
    character: "Dalam & Berwibawa",
    description:
      "Timbre berat yang tenang dan mantap, memberi kesan serius namun tetap alami.",
    bestFor: "Dokumenter, berita, audiobook",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    character: "Tegas & Bertenaga",
    description:
      "Vokal kuat dan penuh keyakinan dengan penekanan kata yang jelas dan hidup.",
    bestFor: "Presentasi, iklan layanan, pengumuman",
  },
];

export const SPEAKING_STYLES: SpeakingStylePreset[] = [
  {
    id: "natural-casual",
    label: "Natural & Santai",
    shortDesc: "Mengalir wajar seperti berbicara langsung dengan teman.",
    promptStyle:
      "Natural conversational Indonesian, relaxed pacing, warm everyday tone, authentic phrasing without sounding robotic or overly formal.",
  },
  {
    id: "warm-storyteller",
    label: "Ramah & Bercerita",
    shortDesc: "Intonasi hangat dan engaging untuk narasi atau cerita.",
    promptStyle:
      "Warm, engaging Indonesian storyteller, friendly inflection, clear articulation with natural pauses between sentences.",
  },
  {
    id: "clear-presenter",
    label: "Jelas & Profesional",
    shortDesc: "Artikulasi tegas dan rapi untuk berita atau presentasi.",
    promptStyle:
      "Clear, articulate Indonesian broadcast presenter, steady confident pace, crisp consonants, natural studio poise.",
  },
  {
    id: "calm-deep",
    label: "Tenang & Mendalam",
    shortDesc: "Tempo lebih pelan dan teduh untuk renungan atau dokumenter.",
    promptStyle:
      "Calm, composed, thoughtful Indonesian narrator, unhurried steady rhythm, gentle breathing pauses, soothing low-key warmth.",
  },
];

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: "santai",
    label: "Obrolan Santai",
    recommendedVoice: "Orus",
    recommendedStyleId: "natural-casual",
    text: "Halo semuanya, selamat datang kembali di catatan pagi hari ini. Sebelum mulai beraktivitas, yuk tarik napas sebentar dan siapkan secangkir kopi hangat. Kadang, hal-hal kecil yang kita lakukan dengan tenang justru bikin hari terasa jauh lebih ringan.",
  },
  {
    id: "podcast",
    label: "Intro Podcast",
    recommendedVoice: "Puck",
    recommendedStyleId: "warm-storyteller",
    text: "Apa kabar teman-teman pendengar? Senang banget rasanya bisa nemenin perjalanan kalian sore ini. Di episode kali ini, kita bakal ngobrol santai soal cara menjaga fokus di tengah padatnya jadwal kerja tanpa bikin kepala penat.",
  },
  {
    id: "berita",
    label: "Berita & Info",
    recommendedVoice: "Charon",
    recommendedStyleId: "clear-presenter",
    text: "Selamat malam pemirsa. Badan Meteorologi memprakirakan hujan dengan intensitas ringan hingga sedang masih berpotensi mengguyur sebagian wilayah Jabodetabek pada malam hari. Masyarakat diimbau tetap membawa payung saat beraktivitas di luar ruangan.",
  },
  {
    id: "promosi",
    label: "Voiceover Iklan",
    recommendedVoice: "Fenrir",
    recommendedStyleId: "clear-presenter",
    text: "Wujudkan ide besar Anda lebih cepat tanpa ribet. Dengan suara jernih, intonasi natural, dan hasil audio siap pakai dalam hitungan detik, setiap naskah kini terdengar lebih hidup dan meyakinkan.",
  },
];
