import type {
  SampleScript,
  SpeakingStylePreset,
  VoiceOption,
} from "../types/tts";

export const VOICE_OPTIONS: VoiceOption[] = [
  // Suara Cewek (Lembut & Bercerita)
  {
    id: "Vindemiatrix",
    name: "Vindemiatrix",
    gender: "female",
    character: "Lembut & Halus",
    description:
      "Vokal wanita yang sangat lembut, teduh, dan penuh kehangatan seolah sedang bercerita dari hati.",
    bestFor: "Cerita kehidupan, renungan, curahan hati, narasi puitis",
    isSoftStory: true,
  },
  {
    id: "Sulafat",
    name: "Sulafat",
    gender: "female",
    character: "Hangat & Menenangkan",
    description:
      "Nada suara wanita yang nyaman, ramah, dan meneduhkan hati seperti pendengar setia.",
    bestFor: "Kisah inspiratif, audiobook, podcast santai",
    isSoftStory: true,
  },
  {
    id: "Achernar",
    name: "Achernar",
    gender: "female",
    character: "Teduh & Pelan",
    description:
      "Suara wanita yang ringan, jernih, dan halus dengan pembawaan tenang tanpa terburu-buru.",
    bestFor: "Cerita malam, refleksi diri, monolog lembut",
    isSoftStory: true,
  },
  {
    id: "Aoede",
    name: "Aoede",
    gender: "female",
    character: "Mengalir & Akrab",
    description:
      "Intonasi wanita yang santai, natural, dan terasa akrab seperti teman lama bercerita.",
    bestFor: "Catatan harian, vlog santai, cerita keseharian",
  },

  // Suara Cowok (Lembut & Bercerita + Pilihan Lain)
  {
    id: "Achird",
    name: "Achird",
    gender: "male",
    character: "Ramah & Lembut",
    description:
      "Vokal pria yang bersahabat, hangat, dan tutur katanya halus saat mengisahkan cerita hidup.",
    bestFor: "Cerita kehidupan, podcast refleksi, obrolan tulus",
    isSoftStory: true,
  },
  {
    id: "Algieba",
    name: "Algieba",
    gender: "male",
    character: "Halus & Teduh",
    description:
      "Suara pria bernada rendah-menengah yang mulus, tenang, dan menenangkan pikiran.",
    bestFor: "Narasi kehidupan mendalam, audiobook, renungan malam",
    isSoftStory: true,
  },
  {
    id: "Enceladus",
    name: "Enceladus",
    gender: "male",
    character: "Lembut & Intim",
    description:
      "Pembawaan suara pria yang pelan, berbisik hangat, dan dekat seperti bercerita berdua.",
    bestFor: "Monolog malam, cerita menyentuh, kata-kata penenang",
    isSoftStory: true,
  },
  {
    id: "Orus",
    name: "Orus",
    gender: "male",
    character: "Hangat & Natural",
    description:
      "Nada suara pria dewasa yang ramah, jernih, dan luwes seperti obrolan sehari-hari.",
    bestFor: "Narasi santai, konten edukasi, explainer",
  },
  {
    id: "Puck",
    name: "Puck",
    gender: "male",
    character: "Ringan & Ekspresif",
    description:
      "Intonasi lebih dinamis dan ceria dengan artikulasi ringan yang akrab di telinga.",
    bestFor: "Vlog, intro podcast, sapaan interaktif",
  },
  {
    id: "Charon",
    name: "Charon",
    gender: "male",
    character: "Dalam & Berwibawa",
    description:
      "Timbre berat yang tenang dan mantap, memberi kesan serius namun tetap alami.",
    bestFor: "Dokumenter, berita, audiobook",
  },
  {
    id: "Fenrir",
    name: "Fenrir",
    gender: "male",
    character: "Tegas & Bertenaga",
    description:
      "Vokal kuat dan penuh keyakinan dengan penekanan kata yang jelas dan hidup.",
    bestFor: "Presentasi, iklan layanan, pengumuman",
  },
];

export const SPEAKING_STYLES: SpeakingStylePreset[] = [
  {
    id: "soft-life-story",
    label: "Cerita Kehidupan (Halus)",
    shortDesc:
      "Bertutur lembut, pelan, dan menyentuh seperti mengisahkan perjalanan hidup.",
    promptStyle:
      "Soft, gentle, heartfelt Indonesian storytelling voice. Speak slowly and tenderly with delicate emotional warmth, soothing natural breathing pauses, and an intimate reflective tone as if quietly sharing life stories from the heart.",
  },
  {
    id: "warm-storyteller",
    label: "Ramah & Bercerita",
    shortDesc: "Intonasi hangat dan engaging untuk narasi atau cerita.",
    promptStyle:
      "Warm, engaging Indonesian storyteller, friendly inflection, clear articulation with natural pauses between sentences.",
  },
  {
    id: "natural-casual",
    label: "Natural & Santai",
    shortDesc: "Mengalir wajar seperti berbicara langsung dengan teman.",
    promptStyle:
      "Natural conversational Indonesian, relaxed pacing, warm everyday tone, authentic phrasing without sounding robotic or overly formal.",
  },
  {
    id: "calm-deep",
    label: "Tenang & Mendalam",
    shortDesc: "Tempo lebih pelan dan teduh untuk renungan atau dokumenter.",
    promptStyle:
      "Calm, composed, thoughtful Indonesian narrator, unhurried steady rhythm, gentle breathing pauses, soothing low-key warmth.",
  },
  {
    id: "clear-presenter",
    label: "Jelas & Profesional",
    shortDesc: "Artikulasi tegas dan rapi untuk berita atau presentasi.",
    promptStyle:
      "Clear, articulate Indonesian broadcast presenter, steady confident pace, crisp consonants, natural studio poise.",
  },
];

export const SAMPLE_SCRIPTS: SampleScript[] = [
  {
    id: "kisah-cewek",
    label: "Kisah Hidup (Cewek)",
    recommendedVoice: "Vindemiatrix",
    recommendedStyleId: "soft-life-story",
    text: "Pernah nggak kamu duduk diam di sore hari, lalu sadar betapa jauhnya langkah yang sudah kamu tempuh sejauh ini? Kadang hidup memang tidak berjalan secepat yang kita harapkan. Ada hari-hari yang melelahkan, ada juga doa yang masih menunggu waktu. Tapi pelan-pelan, kamu tetap bertahan sampai hari ini, dan itu sudah cukup luar biasa.",
  },
  {
    id: "kisah-cowok",
    label: "Kisah Hidup (Cowok)",
    recommendedVoice: "Achird",
    recommendedStyleId: "soft-life-story",
    text: "Semakin dewasa, kita mulai belajar bahwa kebahagiaan ternyata sering bersembunyi di hal-hal yang sederhana. Pulang dengan tenang setelah hari yang panjang, secangkir teh hangat di meja, dan hati yang mulai berdamai dengan masa lalu. Tidak apa-apa kalau langkahmu pelan, yang penting kamu tetap jujur pada dirimu sendiri.",
  },
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
    recommendedVoice: "Sulafat",
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
];
