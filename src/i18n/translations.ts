import type { LanguageCode, NavSectionId, CricketRole } from '../types';

export interface TranslationBundle {
  brandName: string;
  nav: Record<NavSectionId, string>;
  groups: {
    learn: string;
    connect: string;
    compete: string;
    commerce: string;
  };
  actions: {
    bookSession: string;
    alerts: string;
    cart: string;
    syncWearables: string;
    checkout: string;
    language: string;
  };
  roles: Record<CricketRole, string>;
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  sections: {
    trainingHeadline: string;
    certHeadline: string;
    analyticsHeadline: string;
    coachingHeadline: string;
    tournamentsHeadline: string;
    clubHeadline: string;
    socialHeadline: string;
    podcastsHeadline: string;
    marketplaceHeadline: string;
  };
}

export const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
];

export const TRANSLATIONS: Record<LanguageCode, TranslationBundle> = {
  en: {
    brandName: 'TossMore',
    nav: {
      overview: 'Overview',
      training: 'Training Studio',
      certifications: 'Degrees & Certs',
      analytics: 'Analytics & Wearables',
      coaching: 'Coaches & Live Class',
      tournaments: 'Matches & Leaderboard',
      club: 'Club & Scouting',
      social: 'Athlete Feed',
      podcasts: 'Podcasts & News',
      marketplace: 'Sports Store',
    },
    groups: {
      learn: 'Academy & Skill Lab',
      connect: 'Coaching & Community',
      compete: 'Tournaments & Clubs',
      commerce: 'Equipment Exchange',
    },
    actions: {
      bookSession: 'Book Coach',
      alerts: 'Alerts',
      cart: 'Cart',
      syncWearables: 'Sync Wearables',
      checkout: 'Checkout',
      language: 'Language',
    },
    roles: {
      batsman: 'Batsman',
      wicketkeeper: 'Wicketkeeper',
      bowler: 'Bowler',
      'all-rounder': 'All-Rounder',
    },
    hero: {
      title: 'Train from Grassroots to Pro Nationals in One Ecosystem',
      subtitle: 'Master cricket and multi-sport mechanics across written guides, video breakdown, VR reaction pods, and AR biomechanics with accredited degrees and live coach feedback.',
      primaryCta: 'Launch Training Studio',
      secondaryCta: 'Book Private Coach',
    },
    sections: {
      trainingHeadline: 'Multi-Sport Written, Video, VR & AR Training Studio',
      certHeadline: 'Accredited Athletic Degrees, Coaching & Umpire Certifications',
      analyticsHeadline: 'Session Biomechanics, Wearable Telemetry & Coach Feedback',
      coachingHeadline: 'Private Coaches, Turf Institutes & Live Doubt-Clearing Classes',
      tournamentsHeadline: 'Nationwide Tournaments, Live Match Telemetry & Leaderboard',
      clubHeadline: 'Club Roster Management, Match Scheduling & Talent Scouting',
      socialHeadline: 'Athlete Achievements & Training Milestones Feed',
      podcastsHeadline: 'TossMore Player Interview Podcasts & Multi-Sport News',
      marketplaceHeadline: 'TossMore Sports Ecommerce — Bats, Balls, Gloves & Pro Gear for Every Sport',
    },
  },
  hi: {
    brandName: 'TossMore',
    nav: {
      overview: 'ओवरव्यू',
      training: 'ट्रेनिंग स्टूडियो',
      certifications: 'डिग्री और सर्टिफिकेट',
      analytics: 'एनालिटिक्स और वियरेबल्स',
      coaching: 'कोच और लाइव क्लास',
      tournaments: 'मैच और लीडरबोर्ड',
      club: 'क्लब और स्काउटिंग',
      social: 'एथलीट फीड',
      podcasts: 'पॉडकास्ट और न्यूज़',
      marketplace: 'गियर मार्केटप्लेस',
    },
    groups: {
      learn: 'अकादमी और स्किल लैब',
      connect: 'कोचिंग और कम्युनिटी',
      compete: 'टूर्नामेंट और क्लब',
      commerce: 'इक्विपमेंट स्टोर',
    },
    actions: {
      bookSession: 'कोच बुक करें',
      alerts: 'अलर्ट',
      cart: 'कार्ट',
      syncWearables: 'वियरेबल्स सिंक',
      checkout: 'पेमेंट करें',
      language: 'भाषा',
    },
    roles: {
      batsman: 'बल्लेबाज़ (Batsman)',
      wicketkeeper: 'विकेटकीपर (Wicketkeeper)',
      bowler: 'गेंदबाज़ (Bowler)',
      'all-rounder': 'ऑल-राउंडर (All-Rounder)',
    },
    hero: {
      title: 'ग्रासरूट से नेशनल प्रो तक संपूर्ण स्पोर्ट्स ट्रेनिंग इकोसिस्टम',
      subtitle: 'लिखित गाइड, वीडियो ड्रिल्स, VR पिच सिम्युलेटर और AR बायोमैकेनिक्स के साथ क्रिकेट व हर खेल में महारत हासिल करें, सर्टिफिकेट पाएं और लाइव कोच फीडबैक लें।',
      primaryCta: 'ट्रेनिंग स्टूडियो खोलें',
      secondaryCta: 'प्राइवेट कोच बुक करें',
    },
    sections: {
      trainingHeadline: 'लिखित, वीडियो, VR और AR ट्रेनिंग मॉड्यूल',
      certHeadline: 'खिलाड़ी डिग्री, कोच और अंपायर सर्टिफिकेशन',
      analyticsHeadline: 'परफॉरमेंस एनालिटिक्स, वियरेबल सिंक और कोच फीडबैक',
      coachingHeadline: 'प्राइवेट कोच, इंस्टीट्यूट बुकिंग और लाइव डाउट क्लास',
      tournamentsHeadline: 'नेशनल टूर्नामेंट, लाइव मैच और लीडरबोर्ड',
      clubHeadline: 'क्लब रोस्टर, शेड्यूलिंग और टैलेंट स्काउटिंग',
      socialHeadline: 'एथलीट अचीवमेंट सोशल फीड',
      podcastsHeadline: 'प्लेयर इंटरव्यू पॉडकास्ट और स्पोर्ट्स न्यूज़',
      marketplaceHeadline: 'स्पोर्ट्स इक्विपमेंट खरीदें और बेचें',
    },
  },
  es: {
    brandName: 'TossMore',
    nav: {
      overview: 'Resumen',
      training: 'Estudio VR/AR',
      certifications: 'Títulos y Certs',
      analytics: 'Analítica y Sensores',
      coaching: 'Entrenadores y Vivo',
      tournaments: 'Torneos y Tabla',
      club: 'Club y Scouting',
      social: 'Red de Atletas',
      podcasts: 'Podcasts y Noticias',
      marketplace: 'Mercado Deportivo',
    },
    groups: {
      learn: 'Academia y Técnica',
      connect: 'Entrenamiento y Red',
      compete: 'Competición y Clubes',
      commerce: 'Equipamiento',
    },
    actions: {
      bookSession: 'Reservar Coach',
      alerts: 'Alertas',
      cart: 'Carrito',
      syncWearables: 'Sincronizar',
      checkout: 'Pagar',
      language: 'Idioma',
    },
    roles: {
      batsman: 'Bateador',
      wicketkeeper: 'Receptor (WK)',
      bowler: 'Lanzador',
      'all-rounder': 'Polivalente',
    },
    hero: {
      title: 'Del Nivel Base al Profesional Nacional en Un Solo Ecosistema',
      subtitle: 'Domina críquet y múltiples deportes con guías escritas, video, simulación VR y biomecánica AR junto a entrenadores certificados.',
      primaryCta: 'Abrir Estudio',
      secondaryCta: 'Reservar Entrenador',
    },
    sections: {
      trainingHeadline: 'Módulos Escritos, Video, VR y Biomecánica AR',
      certHeadline: 'Certificaciones para Atletas, Entrenadores y Árbitros',
      analyticsHeadline: 'Analítica por Sesión, Wearables y Feedback',
      coachingHeadline: 'Entrenadores Privados, Academias y Clases en Vivo',
      tournamentsHeadline: 'Torneos Nacionales, Marcador en Vivo y Ranking',
      clubHeadline: 'Gestión de Plantilla, Calendario y Scouting',
      socialHeadline: 'Logros y Comunidad de Atletas',
      podcastsHeadline: 'Podcasts con Atletas y Noticias Deportivas',
      marketplaceHeadline: 'Compra y Venta de Equipamiento Deportivo',
    },
  },
  fr: {
    brandName: 'TossMore',
    nav: {
      overview: 'Vue d’ensemble',
      training: 'Studio VR/AR',
      certifications: 'Diplômes & Certs',
      analytics: 'Analytique & Capteurs',
      coaching: 'Coachs & Direct',
      tournaments: 'Matchs & Classement',
      club: 'Club & Recrutement',
      social: 'Fil Athlètes',
      podcasts: 'Podcasts & Actus',
      marketplace: 'Boutique Équipement',
    },
    groups: {
      learn: 'Académie & Compétences',
      connect: 'Coaching & Réseau',
      compete: 'Tournois & Clubs',
      commerce: 'Matériel Sportif',
    },
    actions: {
      bookSession: 'Réserver Coach',
      alerts: 'Alertes',
      cart: 'Panier',
      syncWearables: 'Synchroniser',
      checkout: 'Payer',
      language: 'Langue',
    },
    roles: {
      batsman: 'Batteur',
      wicketkeeper: 'Gardien de guichet',
      bowler: 'Lanceur',
      'all-rounder': 'Polyvalent',
    },
    hero: {
      title: 'De la Formation Amateur aux Nationaux Pro dans Un Écosystème',
      subtitle: 'Maîtrisez le cricket et le multisport via guides écrits, vidéo, simulateur VR et biomécanique AR avec diplômes certifiés.',
      primaryCta: 'Ouvrir le Studio',
      secondaryCta: 'Réserver un Coach',
    },
    sections: {
      trainingHeadline: 'Modules Écrits, Vidéo, VR & Biomécanique AR',
      certHeadline: 'Diplômes Athlétiques, Coachs & Arbitres Officiels',
      analyticsHeadline: 'Analytique de Séance, Capteurs & Retours Coach',
      coachingHeadline: 'Coachs Privés, Instituts & Classes en Direct',
      tournamentsHeadline: 'Tournois Nationaux, Matchs en Direct & Classement',
      clubHeadline: 'Gestion d’Équipe, Calendrier & Détection',
      socialHeadline: 'Fil Social & Réussites des Athlètes',
      podcastsHeadline: 'Podcasts d’Athlètes & Actualités Sportives',
      marketplaceHeadline: 'Achat et Vente d’Équipement Sportif',
    },
  },
  ta: {
    brandName: 'TossMore',
    nav: {
      overview: 'முகப்பு',
      training: 'பயிற்சி ஸ்டுடியோ',
      certifications: 'பட்டங்கள் & சான்றிதழ்',
      analytics: 'பகுப்பாய்வு & சாதனங்கள்',
      coaching: 'பயிற்சியாளர் & நேரலை',
      tournaments: 'போட்டிகள் & தரவரிசை',
      club: 'கிளப் & தேர்வு',
      social: 'வீரர் சமூகம்',
      podcasts: 'பாட்காஸ்ட் & செய்திகள்',
      marketplace: 'உபகரண சந்தை',
    },
    groups: {
      learn: 'அகாடமி & திறன் மையம்',
      connect: 'பயிற்சி & சமூகம்',
      compete: 'போட்டிகள் & கிளப்',
      commerce: 'விளையாட்டு பொருட்கள்',
    },
    actions: {
      bookSession: 'பயிற்சி முன்பதிவு',
      alerts: 'அறிவிப்புகள்',
      cart: 'கூடை',
      syncWearables: 'சாதனம் இணை',
      checkout: 'பணம் செலுத்து',
      language: 'மொழி',
    },
    roles: {
      batsman: 'பேட்ஸ்மேன்',
      wicketkeeper: 'விக்கெட் கீப்பர்',
      bowler: 'பந்துவீச்சாளர்',
      'all-rounder': 'ஆல்-ரவுண்டர்',
    },
    hero: {
      title: 'அடிப்படை நிலை முதல் தேசிய அளவிலான போட்டி வரை ஒரே தளம்',
      subtitle: 'எழுத்து, வீடியோ, VR மற்றும் AR பயிற்சி தொகுதிகள் மூலம் கிரிக்கெட் மற்றும் அனைத்து விளையாட்டுகளிலும் சிறந்து விளங்குங்கள்.',
      primaryCta: 'பயிற்சி தொடங்கு',
      secondaryCta: 'பயிற்சியாளர் முன்பதிவு',
    },
    sections: {
      trainingHeadline: 'எழுத்து, வீடியோ, VR & AR பயிற்சி ஸ்டுடியோ',
      certHeadline: 'வீரர், பயிற்சியாளர் & நடுவர் சான்றிதழ்கள்',
      analyticsHeadline: 'செயல்திறன் பகுப்பாய்வு & பயிற்சியாளர் கருத்து',
      coachingHeadline: 'தனிப்பட்ட பயிற்சியாளர்கள் & நேரலை வகுப்புகள்',
      tournamentsHeadline: 'தேசிய போட்டிகள் & நேரலை புள்ளிவிவரம்',
      clubHeadline: 'கிளப் அணி மேலாண்மை & வீரர் தேர்வு',
      socialHeadline: 'வீரர்களின் சாதனைகள் & பகிர்வுகள்',
      podcastsHeadline: 'வீரர் நேர்காணல் பாட்காஸ்ட் & விளையாட்டு செய்திகள்',
      marketplaceHeadline: 'விளையாட்டு உபகரணங்கள் வாங்க & விற்க',
    },
  },
};
