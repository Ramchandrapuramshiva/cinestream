export type LanguageCode = "en" | "te" | "hi" | "mr" | "kn";

export type UiText = {
  navTrending: string;
  navPopular: string;
  navUpcoming: string;
  navTelugu: string;
  navEnglish: string;
  searchPlaceholder: string;
  refreshMovies: string;
  menu: string;
  language: string;
  featuredTrending: string;
  rating: string;
  playTrailer: string;
  moreInfo: string;
  searchResults: string;
  trendingNow: string;
  popular: string;
  upcoming: string;
  popularTelugu: string;
  popularEnglish: string;
  latestTelugu: string;
  latestEnglish: string;
  teluguMovies: string;
  hindiMovies: string;
  marathiMovies: string;
  kannadaMovies: string;
  searchUnavailable: string;
  noSearchResults: string;
  noTrending: string;
  noPopular: string;
  noUpcoming: string;
  noLanguageMovies: string;
  footer: string;
  setupReady: string;
  trailer: string;
  overview: string;
  cast: string;
  director: string;
  producers: string;
  recommendations: string;
  noTrailer: string;
  noOverview: string;
  loadingCast: string;
  noRecommendations: string;
  loading: string;
  notListed: string;
  detailsUnavailable: string;
  close: string;
};

export const languageOptions: { code: LanguageCode; label: string; nativeLabel: string; tmdbLanguage: string }[] = [
  { code: "en", label: "English", nativeLabel: "English", tmdbLanguage: "en-US" },
  { code: "te", label: "Telugu", nativeLabel: "Telugu", tmdbLanguage: "te-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "Hindi", tmdbLanguage: "hi-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "Marathi", tmdbLanguage: "mr-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "Kannada", tmdbLanguage: "kn-IN" }
];

export const translations: Record<LanguageCode, UiText> = {
  en: {
    navTrending: "Trending",
    navPopular: "Popular",
    navUpcoming: "Upcoming",
    navTelugu: "Telugu",
    navEnglish: "English",
    searchPlaceholder: "Search",
    refreshMovies: "Refresh movies",
    menu: "Menu",
    language: "Language",
    featuredTrending: "Featured Trending",
    rating: "Rating",
    playTrailer: "Play Trailer",
    moreInfo: "More Info",
    searchResults: "Search Results",
    trendingNow: "Trending Now",
    popular: "Popular on CineStream",
    upcoming: "Coming Soon",
    popularTelugu: "Popular Telugu Movies",
    popularEnglish: "Popular English Movies",
    latestTelugu: "Latest Telugu Movies",
    latestEnglish: "Latest English Movies",
    teluguMovies: "Telugu Movies",
    hindiMovies: "Hindi Movies",
    marathiMovies: "Marathi Movies",
    kannadaMovies: "Kannada Movies",
    searchUnavailable: "Search is temporarily unavailable.",
    noSearchResults: "No TMDB titles match your search.",
    noTrending: "Trending movies will appear here.",
    noPopular: "Popular movies will appear here.",
    noUpcoming: "Upcoming movies will appear here.",
    noLanguageMovies: "Movies for this language will appear here.",
    footer: "CineStream uses TMDB for movie data, trailers, credits, and artwork.",
    setupReady: "CineStream is running with the configured `.env` file and will load live TMDB data when the key value is valid.",
    trailer: "Trailer",
    overview: "Overview",
    cast: "Cast",
    director: "Director",
    producers: "Producers",
    recommendations: "Recommended Next",
    noTrailer: "No trailer found for this title.",
    noOverview: "No overview is available.",
    loadingCast: "Loading cast...",
    noRecommendations: "No recommendations are listed for this title yet.",
    loading: "Loading...",
    notListed: "Not listed by TMDB.",
    detailsUnavailable: "Movie details are unavailable right now.",
    close: "Close"
  },
  te: {
    navTrending: "ట్రెండింగ్",
    navPopular: "పాపులర్",
    navUpcoming: "త్వరలో",
    navTelugu: "తెలుగు",
    navEnglish: "ఇంగ్లీష్",
    searchPlaceholder: "వెతకండి",
    refreshMovies: "సినిమాలు రిఫ్రెష్ చేయండి",
    menu: "మెను",
    language: "భాష",
    featuredTrending: "ప్రత్యేక ట్రెండింగ్",
    rating: "రేటింగ్",
    playTrailer: "ట్రైలర్ ప్లే చేయండి",
    moreInfo: "మరింత సమాచారం",
    searchResults: "శోధన ఫలితాలు",
    trendingNow: "ఇప్పుడు ట్రెండింగ్",
    popular: "CineStream లో పాపులర్",
    upcoming: "త్వరలో రానున్నవి",
    popularTelugu: "పాపులర్ తెలుగు సినిమాలు",
    popularEnglish: "పాపులర్ ఇంగ్లీష్ సినిమాలు",
    latestTelugu: "తాజా తెలుగు సినిమాలు",
    latestEnglish: "తాజా ఇంగ్లీష్ సినిమాలు",
    teluguMovies: "తెలుగు సినిమాలు",
    hindiMovies: "హిందీ సినిమాలు",
    marathiMovies: "మరాఠీ సినిమాలు",
    kannadaMovies: "కన్నడ సినిమాలు",
    searchUnavailable: "శోధన తాత్కాలికంగా అందుబాటులో లేదు.",
    noSearchResults: "మీ శోధనకు TMDB టైటిల్స్ లేవు.",
    noTrending: "ట్రెండింగ్ సినిమాలు ఇక్కడ కనిపిస్తాయి.",
    noPopular: "పాపులర్ సినిమాలు ఇక్కడ కనిపిస్తాయి.",
    noUpcoming: "త్వరలో రానున్న సినిమాలు ఇక్కడ కనిపిస్తాయి.",
    noLanguageMovies: "ఈ భాష సినిమాలు ఇక్కడ కనిపిస్తాయి.",
    footer: "CineStream సినిమా డేటా, ట్రైలర్లు, క్రెడిట్లు, ఆర్ట్‌వర్క్ కోసం TMDB ను ఉపయోగిస్తుంది.",
    setupReady: "CineStream `.env` ఫైల్‌తో నడుస్తోంది. సరైన కీ ఉన్నప్పుడు లైవ్ TMDB డేటా లోడ్ అవుతుంది.",
    trailer: "ట్రైలర్",
    overview: "సారాంశం",
    cast: "నటీనటులు",
    director: "దర్శకుడు",
    producers: "నిర్మాతలు",
    recommendations: "తరువాత చూడండి",
    noTrailer: "ఈ టైటిల్‌కు ట్రైలర్ దొరకలేదు.",
    noOverview: "సారాంశం అందుబాటులో లేదు.",
    loadingCast: "నటీనటులు లోడ్ అవుతున్నారు...",
    noRecommendations: "ఈ టైటిల్‌కు సిఫార్సులు ఇంకా లేవు.",
    loading: "లోడ్ అవుతోంది...",
    notListed: "TMDB లో లిస్ట్ కాలేదు.",
    detailsUnavailable: "సినిమా వివరాలు ప్రస్తుతం అందుబాటులో లేవు.",
    close: "మూసివేయండి"
  },
  hi: {
    navTrending: "ट्रेंडिंग",
    navPopular: "लोकप्रिय",
    navUpcoming: "जल्द आ रहा है",
    navTelugu: "तेलुगु",
    navEnglish: "अंग्रेजी",
    searchPlaceholder: "खोजें",
    refreshMovies: "फिल्में रीफ्रेश करें",
    menu: "मेनू",
    language: "भाषा",
    featuredTrending: "फीचर्ड ट्रेंडिंग",
    rating: "रेटिंग",
    playTrailer: "ट्रेलर चलाएं",
    moreInfo: "अधिक जानकारी",
    searchResults: "खोज परिणाम",
    trendingNow: "अभी ट्रेंडिंग",
    popular: "CineStream पर लोकप्रिय",
    upcoming: "जल्द आने वाली",
    popularTelugu: "लोकप्रिय तेलुगु फिल्में",
    popularEnglish: "लोकप्रिय अंग्रेजी फिल्में",
    latestTelugu: "नई तेलुगु फिल्में",
    latestEnglish: "नई अंग्रेजी फिल्में",
    teluguMovies: "तेलुगु फिल्में",
    hindiMovies: "हिंदी फिल्में",
    marathiMovies: "मराठी फिल्में",
    kannadaMovies: "कन्नड़ फिल्में",
    searchUnavailable: "खोज अभी उपलब्ध नहीं है.",
    noSearchResults: "आपकी खोज से मिलते TMDB शीर्षक नहीं मिले.",
    noTrending: "ट्रेंडिंग फिल्में यहां दिखेंगी.",
    noPopular: "लोकप्रिय फिल्में यहां दिखेंगी.",
    noUpcoming: "आने वाली फिल्में यहां दिखेंगी.",
    noLanguageMovies: "इस भाषा की फिल्में यहां दिखेंगी.",
    footer: "CineStream फिल्म डेटा, ट्रेलर, क्रेडिट और आर्टवर्क के लिए TMDB का उपयोग करता है.",
    setupReady: "CineStream configured `.env` file के साथ चल रहा है और सही key होने पर live TMDB data load करेगा.",
    trailer: "ट्रेलर",
    overview: "सारांश",
    cast: "कलाकार",
    director: "निर्देशक",
    producers: "निर्माता",
    recommendations: "आगे देखें",
    noTrailer: "इस शीर्षक के लिए ट्रेलर नहीं मिला.",
    noOverview: "सारांश उपलब्ध नहीं है.",
    loadingCast: "कलाकार लोड हो रहे हैं...",
    noRecommendations: "इस शीर्षक के लिए सिफारिशें अभी नहीं हैं.",
    loading: "लोड हो रहा है...",
    notListed: "TMDB में सूचीबद्ध नहीं.",
    detailsUnavailable: "फिल्म विवरण अभी उपलब्ध नहीं हैं.",
    close: "बंद करें"
  },
  mr: {
    navTrending: "ट्रेंडिंग",
    navPopular: "लोकप्रिय",
    navUpcoming: "लवकरच",
    navTelugu: "तेलुगू",
    navEnglish: "इंग्रजी",
    searchPlaceholder: "शोधा",
    refreshMovies: "चित्रपट रिफ्रेश करा",
    menu: "मेनू",
    language: "भाषा",
    featuredTrending: "फीचर्ड ट्रेंडिंग",
    rating: "रेटिंग",
    playTrailer: "ट्रेलर प्ले करा",
    moreInfo: "अधिक माहिती",
    searchResults: "शोध परिणाम",
    trendingNow: "सध्या ट्रेंडिंग",
    popular: "CineStream वर लोकप्रिय",
    upcoming: "लवकरच येणारे",
    popularTelugu: "लोकप्रिय तेलुगू चित्रपट",
    popularEnglish: "लोकप्रिय इंग्रजी चित्रपट",
    latestTelugu: "नवीन तेलुगू चित्रपट",
    latestEnglish: "नवीन इंग्रजी चित्रपट",
    teluguMovies: "तेलुगू चित्रपट",
    hindiMovies: "हिंदी चित्रपट",
    marathiMovies: "मराठी चित्रपट",
    kannadaMovies: "कन्नड चित्रपट",
    searchUnavailable: "शोध तात्पुरता उपलब्ध नाही.",
    noSearchResults: "तुमच्या शोधासाठी TMDB शीर्षके सापडली नाहीत.",
    noTrending: "ट्रेंडिंग चित्रपट येथे दिसतील.",
    noPopular: "लोकप्रिय चित्रपट येथे दिसतील.",
    noUpcoming: "येणारे चित्रपट येथे दिसतील.",
    noLanguageMovies: "या भाषेतील चित्रपट येथे दिसतील.",
    footer: "CineStream चित्रपट डेटा, ट्रेलर, क्रेडिट्स आणि आर्टवर्कसाठी TMDB वापरते.",
    setupReady: "CineStream configured `.env` file सह चालू आहे आणि योग्य key असताना live TMDB data load करेल.",
    trailer: "ट्रेलर",
    overview: "आढावा",
    cast: "कलाकार",
    director: "दिग्दर्शक",
    producers: "निर्माते",
    recommendations: "पुढे पाहा",
    noTrailer: "या शीर्षकासाठी ट्रेलर सापडला नाही.",
    noOverview: "आढावा उपलब्ध नाही.",
    loadingCast: "कलाकार लोड होत आहेत...",
    noRecommendations: "या शीर्षकासाठी शिफारसी अद्याप नाहीत.",
    loading: "लोड होत आहे...",
    notListed: "TMDB मध्ये नोंद नाही.",
    detailsUnavailable: "चित्रपट तपशील सध्या उपलब्ध नाहीत.",
    close: "बंद करा"
  },
  kn: {
    navTrending: "ಟ್ರೆಂಡಿಂಗ್",
    navPopular: "ಜನಪ್ರಿಯ",
    navUpcoming: "ಶೀಘ್ರದಲ್ಲೇ",
    navTelugu: "ತೆಲುಗು",
    navEnglish: "ಇಂಗ್ಲಿಷ್",
    searchPlaceholder: "ಹುಡುಕಿ",
    refreshMovies: "ಚಲನಚಿತ್ರಗಳನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ",
    menu: "ಮೆನು",
    language: "ಭಾಷೆ",
    featuredTrending: "ವಿಶೇಷ ಟ್ರೆಂಡಿಂಗ್",
    rating: "ರೇಟಿಂಗ್",
    playTrailer: "ಟ್ರೇಲರ್ ಪ್ಲೇ ಮಾಡಿ",
    moreInfo: "ಹೆಚ್ಚಿನ ಮಾಹಿತಿ",
    searchResults: "ಹುಡುಕಾಟ ಫಲಿತಾಂಶಗಳು",
    trendingNow: "ಈಗ ಟ್ರೆಂಡಿಂಗ್",
    popular: "CineStream ನಲ್ಲಿ ಜನಪ್ರಿಯ",
    upcoming: "ಶೀಘ್ರದಲ್ಲೇ ಬರುವವು",
    popularTelugu: "ಜನಪ್ರಿಯ ತೆಲುಗು ಚಲನಚಿತ್ರಗಳು",
    popularEnglish: "ಜನಪ್ರಿಯ ಇಂಗ್ಲಿಷ್ ಚಲನಚಿತ್ರಗಳು",
    latestTelugu: "ಹೊಸ ತೆಲುಗು ಚಲನಚಿತ್ರಗಳು",
    latestEnglish: "ಹೊಸ ಇಂಗ್ಲಿಷ್ ಚಲನಚಿತ್ರಗಳು",
    teluguMovies: "ತೆಲುಗು ಚಲನಚಿತ್ರಗಳು",
    hindiMovies: "ಹಿಂದಿ ಚಲನಚಿತ್ರಗಳು",
    marathiMovies: "ಮರಾಠಿ ಚಲನಚಿತ್ರಗಳು",
    kannadaMovies: "ಕನ್ನಡ ಚಲನಚಿತ್ರಗಳು",
    searchUnavailable: "ಹುಡುಕಾಟ ತಾತ್ಕಾಲಿಕವಾಗಿ ಲಭ್ಯವಿಲ್ಲ.",
    noSearchResults: "ನಿಮ್ಮ ಹುಡುಕಾಟಕ್ಕೆ TMDB ಶೀರ್ಷಿಕೆಗಳು ಸಿಗಲಿಲ್ಲ.",
    noTrending: "ಟ್ರೆಂಡಿಂಗ್ ಚಲನಚಿತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    noPopular: "ಜನಪ್ರಿಯ ಚಲನಚಿತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    noUpcoming: "ಬರುವ ಚಲನಚಿತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    noLanguageMovies: "ಈ ಭಾಷೆಯ ಚಲನಚಿತ್ರಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.",
    footer: "CineStream ಚಲನಚಿತ್ರ ಡೇಟಾ, ಟ್ರೇಲರ್, ಕ್ರೆಡಿಟ್ಸ್ ಮತ್ತು ಆર્ટ್‌ವರ್ಕ್‌ಗಾಗಿ TMDB ಬಳಸುತ್ತದೆ.",
    setupReady: "CineStream configured `.env` file ಜೊತೆ ಚಾಲನೆಯಲ್ಲಿದೆ ಮತ್ತು ಸರಿಯಾದ key ಇದ್ದಾಗ live TMDB data load ಆಗುತ್ತದೆ.",
    trailer: "ಟ್ರೇಲರ್",
    overview: "ಸಾರಾಂಶ",
    cast: "ಪಾತ್ರವರ್ಗ",
    director: "ನಿರ್ದೇಶಕ",
    producers: "ನಿರ್ಮಾಪಕರು",
    recommendations: "ಮುಂದೆ ನೋಡಿ",
    noTrailer: "ಈ ಶೀರ್ಷಿಕೆಗೆ ಟ್ರೇಲರ್ ಸಿಗಲಿಲ್ಲ.",
    noOverview: "ಸಾರಾಂಶ ಲಭ್ಯವಿಲ್ಲ.",
    loadingCast: "ಪಾತ್ರವರ್ಗ ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    noRecommendations: "ಈ ಶೀರ್ಷಿಕೆಗೆ ಇನ್ನೂ ಶಿಫಾರಸುಗಳಿಲ್ಲ.",
    loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    notListed: "TMDB ನಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿಲ್ಲ.",
    detailsUnavailable: "ಚಲನಚಿತ್ರ ವಿವರಗಳು ಈಗ ಲಭ್ಯವಿಲ್ಲ.",
    close: "ಮುಚ್ಚಿ"
  }
};

export function getStoredLanguage(): LanguageCode {
  const stored = window.localStorage.getItem("cinestream-language");
  return languageOptions.some((option) => option.code === stored) ? (stored as LanguageCode) : "en";
}

export function getTmdbLanguage(language: LanguageCode) {
  return languageOptions.find((option) => option.code === language)?.tmdbLanguage ?? "en-US";
}
