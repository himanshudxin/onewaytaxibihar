/**
 * OneWayTaxiBihar (onewaytaxibihar.com) - Comprehensive Bihar & Pan-India Database
 * Complete 38 Districts Database with Divisions, Landmark POIs, Major Intercity Routes,
 * Fleet Pricing, Passenger Reviews, Corporate Solutions & FAQs.
 */

// 1. Complete Database of all 38 Districts of Bihar + Major Connecting Outstation Hubs
const OTB_CITIES = [
  // ============================================================================
  // 1. PATNA DISTRICT & METROPOLITAN REGION
  // ============================================================================
  { id: "patna", name: "Patna", hindiName: "पटना", type: "district", typeLabel: "District HQ", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5941, lng: 85.1376, popular: true, keywords: ["patna", "patliputra", "capital", "high court", "dak bunglow", "gandhi maidan"], tag: "Capital City & Administrative Center", airport: "Jay Prakash Narayan International (PAT)", tollEst: 0 },
  { id: "danapur", name: "Danapur", hindiName: "दानापुर", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.6333, lng: 85.0500, popular: true, keywords: ["danapur", "cantt", "khagaul", "railway division", "subdivision"], tag: "Patna Metropolitan & Railway Cantonment", tollEst: 0 },
  { id: "patna-airport", name: "Patna Airport (PAT)", hindiName: "पटना एयरपोर्ट (जयप्रकाश नारायण)", type: "airport", typeLabel: "Airport Terminal", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5913, lng: 85.0880, popular: true, keywords: ["patna airport", "pat", "jay prakash narayan", "flight", "domestic terminal"], tag: "Jay Prakash Narayan International Terminal", tollEst: 0 },
  { id: "patna-junction", name: "Patna Junction (PNBE)", hindiName: "पटना जंक्शन", type: "railway", typeLabel: "Railway Hub", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.6022, lng: 85.1346, popular: true, keywords: ["patna junction", "pnbe", "railway station", "dak bunglow", "central"], tag: "Central Railway Terminal & Metro Hub", tollEst: 0 },
  { id: "patliputra-junction", name: "Patliputra Junction (PPTA)", hindiName: "पाटलिपुत्र जंक्शन", type: "railway", typeLabel: "Railway Hub", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.6419, lng: 85.0936, popular: true, keywords: ["patliputra junction", "ppta", "digha", "north bihar trains"], tag: "Digha Bridge Connecting Terminal", tollEst: 0 },
  { id: "rajendra-nagar-terminal", name: "Rajendra Nagar Terminal (RJPB)", hindiName: "राजेंद्र नगर टर्मिनल", type: "railway", typeLabel: "Railway Hub", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5976, lng: 85.1611, popular: false, keywords: ["rajendra nagar terminal", "rjpb", "kankarbagh"], tag: "East Patna Railway Terminal", tollEst: 0 },
  { id: "bihta", name: "Bihta", hindiName: "बिहटा", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5683, lng: 84.8697, popular: true, keywords: ["bihta", "upcoming airport", "iit bihta", "esic hospital", "subdivision"], tag: "Upcoming Int'l Airport & IIT Tech Hub", tollEst: 0 },
  { id: "barh", name: "Barh", hindiName: "बाढ़", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.4800, lng: 85.7100, popular: true, keywords: ["barh", "ntpc barh", "subdivision", "ganga ghat"], tag: "NTPC Super Thermal Power & Ganga Ghat", tollEst: 55 },
  { id: "bakhtiyarpur", name: "Bakhtiyarpur", hindiName: "बख्तियारपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.4567, lng: 85.5256, popular: true, keywords: ["bakhtiyarpur", "expressway", "rajgir fork", "subdivision"], tag: "Expressway Junction to Rajgir & Mokama", tollEst: 40 },
  { id: "mokama", name: "Mokama", hindiName: "मोकामा", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.3983, lng: 85.9189, popular: true, keywords: ["mokama", "rajendra setu", "ganga bridge", "bharat wagon", "subdivision"], tag: "Historic Ganga Bridge & Industrial Hub", tollEst: 75 },
  { id: "fatuha", name: "Fatuha", hindiName: "फतुहा", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5083, lng: 85.3117, popular: false, keywords: ["fatuha", "punpun sangam", "industrial area", "subdivision"], tag: "Punpun River Confluence & Industrial Belt", tollEst: 25 },
  { id: "masaurhi", name: "Masaurhi (Taregna)", hindiName: "मसौढ़ी (तारेगना)", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.3500, lng: 85.0333, popular: false, keywords: ["masaurhi", "taregna", "aryabhata", "subdivision"], tag: "Aryabhata Ancient Solar Observatory", tollEst: 20 },
  { id: "paliganj", name: "Paliganj", hindiName: "पालीगंज", type: "subdivision", typeLabel: "Sub-Division", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.3333, lng: 84.8167, popular: false, keywords: ["paliganj", "son canal", "subdivision"], tag: "Son River Agriculture Sub-Division", tollEst: 30 },
  { id: "aiims-patna", name: "AIIMS Patna (Phulwari Sharif)", hindiName: "एम्स पटना (फुलवारी शरीफ)", type: "town", typeLabel: "Medical Hub", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5606, lng: 85.0456, popular: true, keywords: ["aiims", "phulwari sharif", "hospital", "medical institute"], tag: "National Premier Medical Institute", tollEst: 0 },
  { id: "boring-road", name: "Boring Road (Patna)", hindiName: "बोरिंग रोड (पटना)", type: "town", typeLabel: "City Center", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.6178, lng: 85.1189, popular: false, keywords: ["boring road", "patna central", "coaching hub"], tag: "Commercial, Coaching & Residential Hub", tollEst: 0 },
  { id: "kankarbagh", name: "Kankarbagh (Patna)", hindiName: "कंकड़बाग (पटना)", type: "town", typeLabel: "City Center", district: "Patna", districtId: "patna", division: "Patna", state: "Bihar", lat: 25.5967, lng: 85.1556, popular: false, keywords: ["kankarbagh", "patna south", "residential colony"], tag: "Major Medical & Residential Hub", tollEst: 0 },

  // ============================================================================
  // 2. NALANDA DISTRICT
  // ============================================================================
  { id: "nalanda", name: "Nalanda (Bihar Sharif)", hindiName: "नालंदा (बिहारशरीफ)", type: "district", typeLabel: "District HQ", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.1978, lng: 85.5186, popular: true, keywords: ["nalanda", "bihar sharif", "smart city", "silk weaving"], tag: "District Seat & Handloom Silk Smart City", tollEst: 65 },
  { id: "rajgir", name: "Rajgir", hindiName: "राजगीर", type: "subdivision", typeLabel: "Sub-Division", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.0300, lng: 85.4200, popular: true, keywords: ["rajgir", "glass bridge", "vishwa shanti stupa", "hot springs", "ropeway", "subdivision"], tag: "Glass Bridge, Ropeway & Peace Pagoda", tollEst: 75 },
  { id: "hilsa", name: "Hilsa", hindiName: "हिलसा", type: "subdivision", typeLabel: "Sub-Division", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.3167, lng: 85.2833, popular: false, keywords: ["hilsa", "nalanda", "subdivision"], tag: "Historic Market & Agricultural Hub", tollEst: 45 },
  { id: "islampur", name: "Islampur", hindiName: "इस्लामपुर", type: "town", typeLabel: "Town", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.1500, lng: 85.2000, popular: false, keywords: ["islampur", "nalanda", "railway terminus"], tag: "Southern Nalanda Trading Center", tollEst: 50 },
  { id: "silao", name: "Silao", hindiName: "सिलाव", type: "town", typeLabel: "Heritage Town", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.0833, lng: 85.4167, popular: false, keywords: ["silao", "khaja", "gi tag sweets"], tag: "Famous GI-Tagged Silao Khaja Hub", tollEst: 70 },
  { id: "harnaut", name: "Harnaut", hindiName: "हरनौत", type: "town", typeLabel: "Town", district: "Nalanda", districtId: "nalanda", division: "Patna", state: "Bihar", lat: 25.3667, lng: 85.5333, popular: false, keywords: ["harnaut", "railway carriage workshop"], tag: "Railway Carriage Maintenance Hub", tollEst: 55 },

  // ============================================================================
  // 3. BHOJPUR (ARA) DISTRICT
  // ============================================================================
  { id: "bhojpur", name: "Bhojpur (Ara)", hindiName: "भोजपुर (आरा)", type: "district", typeLabel: "District HQ", district: "Bhojpur", districtId: "bhojpur", division: "Patna", state: "Bihar", lat: 25.5541, lng: 84.6644, popular: true, keywords: ["ara", "bhojpur", "veer kunwar singh", "junction"], tag: "Historic Land of Veer Kunwar Singh", airport: "Patna Airport", tollEst: 50 },
  { id: "jagdishpur", name: "Jagdishpur", hindiName: "जगदीशपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Bhojpur", districtId: "bhojpur", division: "Patna", state: "Bihar", lat: 25.4667, lng: 84.4167, popular: false, keywords: ["jagdishpur", "kunwar singh fort", "subdivision"], tag: "1857 Uprising Heritage Fort", tollEst: 65 },
  { id: "piro", name: "Piro", hindiName: "पीरो", type: "subdivision", typeLabel: "Sub-Division", district: "Bhojpur", districtId: "bhojpur", division: "Patna", state: "Bihar", lat: 25.3333, lng: 84.4167, popular: false, keywords: ["piro", "bhojpur", "subdivision"], tag: "South Bhojpur Commercial Center", tollEst: 65 },
  { id: "koilwar", name: "Koilwar", hindiName: "कोइलवर", type: "town", typeLabel: "Town", district: "Bhojpur", districtId: "bhojpur", division: "Patna", state: "Bihar", lat: 25.5833, lng: 84.8000, popular: false, keywords: ["koilwar", "abdul bari bridge", "son river sand"], tag: "Historic Son River Rail-Road Bridge", tollEst: 40 },

  // ============================================================================
  // 4. BUXAR DISTRICT
  // ============================================================================
  { id: "buxar", name: "Buxar", hindiName: "बक्सर", type: "district", typeLabel: "District HQ", district: "Buxar", districtId: "buxar", division: "Patna", state: "Bihar", lat: 25.5647, lng: 83.9777, popular: true, keywords: ["buxar", "battle of buxar", "ramrekha ghat", "ganga"], tag: "Historic Ganga Ghats & Battle of Buxar", airport: "Patna / Varanasi Airport", tollEst: 110 },
  { id: "dumraon", name: "Dumraon", hindiName: "डुमरांव", type: "subdivision", typeLabel: "Sub-Division", district: "Buxar", districtId: "buxar", division: "Patna", state: "Bihar", lat: 25.5500, lng: 84.1500, popular: false, keywords: ["dumraon", "bismillah khan", "subdivision"], tag: "Birthplace of Bharat Ratna Bismillah Khan", tollEst: 95 },
  { id: "brahmpur", name: "Brahmpur", hindiName: "ब्रह्मपुर", type: "town", typeLabel: "Town", district: "Buxar", districtId: "buxar", division: "Patna", state: "Bihar", lat: 25.6000, lng: 84.3000, popular: false, keywords: ["brahmpur", "baba brahmeshwar nath", "shiva dham"], tag: "Ancient Baba Brahmeshwar Nath Mandir", tollEst: 85 },

  // ============================================================================
  // 5. ROHTAS DISTRICT
  // ============================================================================
  { id: "rohtas", name: "Rohtas (Sasaram)", hindiName: "रोहतास (सासाराम)", type: "district", typeLabel: "District HQ", district: "Rohtas", districtId: "rohtas", division: "Patna", state: "Bihar", lat: 24.9536, lng: 84.0159, popular: true, keywords: ["sasaram", "rohtas", "sher shah suri tomb", "grand trunk road"], tag: "Sher Shah Suri Mausoleum & GT Road", airport: "Gaya / Varanasi Airport", tollEst: 140 },
  { id: "dehri-on-sone", name: "Dehri-on-Sone", hindiName: "डेहरी-ऑन-सोन", type: "subdivision", typeLabel: "Sub-Division", district: "Rohtas", districtId: "rohtas", division: "Patna", state: "Bihar", lat: 24.9167, lng: 84.1833, popular: true, keywords: ["dehri", "dehri on sone", "dalmianagar", "indrapuri barrage", "subdivision"], tag: "Industrial Capital, Mining & Indrapuri Barrage", tollEst: 135 },
  { id: "bikramganj", name: "Bikramganj", hindiName: "बिक्रमगंज", type: "subdivision", typeLabel: "Sub-Division", district: "Rohtas", districtId: "rohtas", division: "Patna", state: "Bihar", lat: 25.2000, lng: 84.2500, popular: false, keywords: ["bikramganj", "rice bowl", "subdivision"], tag: "Rice Bowl Agricultural Trading Center", tollEst: 110 },
  { id: "nokha", name: "Nokha", hindiName: "नोखा", type: "town", typeLabel: "Town", district: "Rohtas", districtId: "rohtas", division: "Patna", state: "Bihar", lat: 25.0667, lng: 84.1333, popular: false, keywords: ["nokha", "rohtas", "rice mills"], tag: "Major Agro-Processing & Rice Mill Center", tollEst: 125 },

  // ============================================================================
  // 6. KAIMUR DISTRICT
  // ============================================================================
  { id: "kaimur", name: "Kaimur (Bhabua)", hindiName: "कैमूर (भभुआ)", type: "district", typeLabel: "District HQ", district: "Kaimur", districtId: "kaimur", division: "Patna", state: "Bihar", lat: 25.0450, lng: 83.6144, popular: false, keywords: ["bhabua", "kaimur", "hills", "mundeshwari"], tag: "Maa Mundeshwari Temple & Kaimur Hills", airport: "Varanasi Airport", tollEst: 160 },
  { id: "mohania", name: "Mohania", hindiName: "मोहनिया", type: "subdivision", typeLabel: "Sub-Division", district: "Kaimur", districtId: "kaimur", division: "Patna", state: "Bihar", lat: 25.1667, lng: 83.6167, popular: true, keywords: ["mohania", "gt road", "nh19", "railway station", "subdivision"], tag: "Grand Trunk Road NH-19 Transit Center", tollEst: 145 },
  { id: "kudra", name: "Kudra", hindiName: "कुदरा", type: "town", typeLabel: "Town", district: "Kaimur", districtId: "kaimur", division: "Patna", state: "Bihar", lat: 25.0500, lng: 83.8167, popular: false, keywords: ["kudra", "rice mill", "kaimur"], tag: "Rice Processing & Highway Industrial Hub", tollEst: 135 },

  // ============================================================================
  // 7. GAYA DISTRICT
  // ============================================================================
  { id: "gaya", name: "Gaya", hindiName: "गया", type: "district", typeLabel: "District HQ", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.7914, lng: 85.0002, popular: true, keywords: ["gaya", "vishnupad", "pitrapaksha", "junction", "falgu"], tag: "Sacred Vishnupad Temple & Pitrapaksha Hub", airport: "Gaya International Airport (GAY)", tollEst: 110 },
  { id: "bodh-gaya", name: "Bodh Gaya", hindiName: "बोधगया", type: "subdivision", typeLabel: "Sub-Division", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.6961, lng: 84.9870, popular: true, keywords: ["bodh gaya", "mahabodhi", "buddha", "unesco", "monasteries", "subdivision"], tag: "Mahabodhi Temple UNESCO World Heritage", tollEst: 115 },
  { id: "gaya-airport", name: "Gaya Airport (GAY)", hindiName: "गया अंतर्राष्ट्रीय हवाई अड्डा", type: "airport", typeLabel: "Airport Terminal", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.7441, lng: 84.9512, popular: true, keywords: ["gaya airport", "gay", "international flight", "buddhist pilgrim flights"], tag: "Gaya International Buddhist Airport", tollEst: 115 },
  { id: "sherghati", name: "Sherghati", hindiName: "शेरघाटी", type: "subdivision", typeLabel: "Sub-Division", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.5667, lng: 84.7833, popular: false, keywords: ["sherghati", "gt road", "nh19", "subdivision"], tag: "Grand Trunk Road Commercial Gateway", tollEst: 140 },
  { id: "tekari", name: "Tekari", hindiName: "टिकारी", type: "subdivision", typeLabel: "Sub-Division", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.9333, lng: 84.8333, popular: false, keywords: ["tekari", "historic fort", "subdivision"], tag: "Tekari Raj Palace & Agricultural Center", tollEst: 100 },
  { id: "dobhi", name: "Dobhi", hindiName: "डोभी", type: "town", typeLabel: "Highway Junction", district: "Gaya", districtId: "gaya", division: "Magadh", state: "Bihar", lat: 24.5333, lng: 84.9667, popular: false, keywords: ["dobhi", "golden quadrilateral", "patna gaya highway junction"], tag: "Golden Quadrilateral & NH-22 Interchange", tollEst: 130 },

  // ============================================================================
  // 8. AURANGABAD DISTRICT
  // ============================================================================
  { id: "aurangabad-bihar", name: "Aurangabad (Bihar)", hindiName: "औरंगाबाद (बिहार)", type: "district", typeLabel: "District HQ", district: "Aurangabad", districtId: "aurangabad-bihar", division: "Magadh", state: "Bihar", lat: 24.7534, lng: 84.3736, popular: true, keywords: ["aurangabad", "gt road", "deo sun temple", "chittorgarh of bihar"], tag: "Grand Trunk Road Corridor & Heritage", airport: "Gaya Airport", tollEst: 125 },
  { id: "daudnagar", name: "Daudnagar", hindiName: "दाउदनगर", type: "subdivision", typeLabel: "Sub-Division", district: "Aurangabad", districtId: "aurangabad-bihar", division: "Magadh", state: "Bihar", lat: 25.0333, lng: 84.4000, popular: false, keywords: ["daudnagar", "son river", "carpet weaving", "subdivision"], tag: "Historic Son River Fort & Textile Hub", tollEst: 95 },
  { id: "deo", name: "Deo (Sun Temple)", hindiName: "देव (सूर्य मंदिर)", type: "town", typeLabel: "Pilgrimage Center", district: "Aurangabad", districtId: "aurangabad-bihar", division: "Magadh", state: "Bihar", lat: 24.6500, lng: 84.4333, popular: true, keywords: ["deo", "sun temple", "surya mandir", "chhath puja dham"], tag: "Ancient Sun Temple & Major Chhath Dham", tollEst: 135 },
  { id: "nabinagar", name: "Nabinagar", hindiName: "नवीनगर", type: "town", typeLabel: "Town", district: "Aurangabad", districtId: "aurangabad-bihar", division: "Magadh", state: "Bihar", lat: 24.6167, lng: 84.1333, popular: false, keywords: ["nabinagar", "ntpc thermal power"], tag: "Super Thermal Power Generation Plant", tollEst: 145 },

  // ============================================================================
  // 9. NAWADA DISTRICT
  // ============================================================================
  { id: "nawada", name: "Nawada", hindiName: "नवादा", type: "district", typeLabel: "District HQ", district: "Nawada", districtId: "nawada", division: "Magadh", state: "Bihar", lat: 24.8878, lng: 85.5414, popular: true, keywords: ["nawada", "silk", "tussar", "kakolat"], tag: "Silk Weaving & Mineral Resource Hub", airport: "Gaya / Patna Airport", tollEst: 95 },
  { id: "rajauli", name: "Rajauli", hindiName: "रजौली", type: "subdivision", typeLabel: "Sub-Division", district: "Nawada", districtId: "nawada", division: "Magadh", state: "Bihar", lat: 24.6500, lng: 85.5000, popular: false, keywords: ["rajauli", "jharkhand border", "nh20", "subdivision"], tag: "Jharkhand Border Forest Gateway", tollEst: 120 },
  { id: "kakolat", name: "Kakolat Falls", hindiName: "ककोलत जलप्रपात", type: "town", typeLabel: "Eco-Tourism", district: "Nawada", districtId: "nawada", division: "Magadh", state: "Bihar", lat: 24.7167, lng: 85.6000, popular: true, keywords: ["kakolat", "waterfall", "picnic", "cooling natural springs"], tag: "Scenic Cold Water Spring & Waterfall", tollEst: 115 },
  { id: "hisua", name: "Hisua", hindiName: "हिसुआ", type: "town", typeLabel: "Town", district: "Nawada", districtId: "nawada", division: "Magadh", state: "Bihar", lat: 24.8333, lng: 85.4167, popular: false, keywords: ["hisua", "nawada", "rajgir road"], tag: "Rajgir-Nawada Highway Commercial Town", tollEst: 85 },

  // ============================================================================
  // 10. JEHANABAD DISTRICT
  // ============================================================================
  { id: "jehanabad", name: "Jehanabad", hindiName: "जहानाबाद", type: "district", typeLabel: "District HQ", district: "Jehanabad", districtId: "jehanabad", division: "Magadh", state: "Bihar", lat: 25.2133, lng: 84.9867, popular: false, keywords: ["jehanabad", "patna gaya route", "barabar"], tag: "Patna-Gaya Expressway Mid-Station", airport: "Patna Airport", tollEst: 45 },
  { id: "makhdumpur", name: "Makhdumpur (Barabar)", hindiName: "मखदुमपुर (बराबर गुफाएं)", type: "town", typeLabel: "Heritage Town", district: "Jehanabad", districtId: "jehanabad", division: "Magadh", state: "Bihar", lat: 25.1000, lng: 84.9833, popular: false, keywords: ["makhdumpur", "barabar caves", "ashokan caves", "siddhnath temple"], tag: "Barabar Rock-Cut Caves & Siddhnath Mandir", tollEst: 65 },

  // ============================================================================
  // 11. ARWAL DISTRICT
  // ============================================================================
  { id: "arwal", name: "Arwal", hindiName: "अरवल", type: "district", typeLabel: "District HQ", district: "Arwal", districtId: "arwal", division: "Magadh", state: "Bihar", lat: 25.2444, lng: 84.6789, popular: false, keywords: ["arwal", "son river", "agriculture"], tag: "Son River Valley Agricultural Center", airport: "Patna Airport", tollEst: 55 },

  // ============================================================================
  // 12. MUZAFFARPUR DISTRICT
  // ============================================================================
  { id: "muzaffarpur", name: "Muzaffarpur", hindiName: "मुजफ्फरपुर", type: "district", typeLabel: "District HQ", district: "Muzaffarpur", districtId: "muzaffarpur", division: "Tirhut", state: "Bihar", lat: 26.1209, lng: 85.3647, popular: true, keywords: ["muzaffarpur", "litchi", "commercial capital", "junction", "garibnath"], tag: "Commercial Capital of North Bihar & Shahi Litchi", airport: "Patna / Darbhanga Airport", tollEst: 85 },
  { id: "kanti", name: "Kanti", hindiName: "कांटी", type: "town", typeLabel: "Industrial Hub", district: "Muzaffarpur", districtId: "muzaffarpur", division: "Tirhut", state: "Bihar", lat: 26.2000, lng: 85.3000, popular: false, keywords: ["kanti", "thermal power", "ntpc kanti"], tag: "Kanti Bijlee Utpadan Nigam (NTPC)", tollEst: 95 },
  { id: "motipur", name: "Motipur", hindiName: "मोतीपुर", type: "town", typeLabel: "Town", district: "Muzaffarpur", districtId: "muzaffarpur", division: "Tirhut", state: "Bihar", lat: 26.2833, lng: 85.1833, popular: false, keywords: ["motipur", "mega food park", "sugar mill"], tag: "Mega Food Park & Sugar Production", tollEst: 110 },
  { id: "saraiya", name: "Saraiya", hindiName: "सरैया", type: "town", typeLabel: "Town", district: "Muzaffarpur", districtId: "muzaffarpur", division: "Tirhut", state: "Bihar", lat: 25.9667, lng: 85.1667, popular: false, keywords: ["saraiya", "vaishali border", "buddha stupa route"], tag: "Gandak Basin Agro Trade Center", tollEst: 70 },

  // ============================================================================
  // 13. VAISHALI (HAJIPUR) DISTRICT
  // ============================================================================
  { id: "vaishali", name: "Vaishali (Hajipur)", hindiName: "वैशाली (हाजीपुर)", type: "district", typeLabel: "District HQ", district: "Vaishali", districtId: "vaishali", division: "Tirhut", state: "Bihar", lat: 25.6858, lng: 85.2155, popular: true, keywords: ["hajipur", "vaishali", "banana", "ecr headquarters", "jp setu"], tag: "East Central Railway Zonal HQ & Banana Trade", airport: "Patna Airport", tollEst: 40 },
  { id: "mahua", name: "Mahua", hindiName: "महुआ", type: "subdivision", typeLabel: "Sub-Division", district: "Vaishali", districtId: "vaishali", division: "Tirhut", state: "Bihar", lat: 25.8667, lng: 85.4000, popular: false, keywords: ["mahua", "vaishali", "subdivision"], tag: "Eastern Vaishali Agricultural Market", tollEst: 65 },
  { id: "vaishali-town", name: "Vaishali Town (Ruins)", hindiName: "वैशाली (ऐतिहासिक स्थल)", type: "town", typeLabel: "Heritage Site", district: "Vaishali", districtId: "vaishali", division: "Tirhut", state: "Bihar", lat: 25.9867, lng: 85.1256, popular: true, keywords: ["vaishali ruins", "ashoka pillar", "mahavira birthplace", "first republic"], tag: "Birthplace of Lord Mahavira & World's 1st Republic", tollEst: 75 },
  { id: "sonepur", name: "Sonepur", hindiName: "सोनपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Saran", districtId: "saran", division: "Saran", state: "Bihar", lat: 25.7000, lng: 85.1833, popular: true, keywords: ["sonepur", "cattle fair", "harihar nath", "gandak ganga sangam", "subdivision"], tag: "World Famous Cattle Fair & Harihar Nath Mandir", tollEst: 40 },

  // ============================================================================
  // 14. EAST CHAMPARAN (MOTIHARI) DISTRICT
  // ============================================================================
  { id: "east-champaran", name: "East Champaran (Motihari)", hindiName: "पूर्वी चंपारण (मोतिहारी)", type: "district", typeLabel: "District HQ", district: "East Champaran", districtId: "east-champaran", division: "Tirhut", state: "Bihar", lat: 26.6469, lng: 84.9089, popular: true, keywords: ["motihari", "champaran", "gandhi satyagraha", "central university"], tag: "Mahatma Gandhi Champaran Satyagraha Land", airport: "Patna / Darbhanga Airport", tollEst: 135 },
  { id: "raxaul", name: "Raxaul (Nepal Border)", hindiName: "रक्सौल (नेपाल सीमा)", type: "subdivision", typeLabel: "Border Port", district: "East Champaran", districtId: "east-champaran", division: "Tirhut", state: "Bihar", lat: 26.9800, lng: 84.8500, popular: true, keywords: ["raxaul", "nepal border", "birgunj", "icp", "subdivision", "customs"], tag: "Primary Indo-Nepal Commercial Trade Gateway", tollEst: 175 },
  { id: "areraj", name: "Areraj", hindiName: "अरेराज", type: "subdivision", typeLabel: "Sub-Division", district: "East Champaran", districtId: "east-champaran", division: "Tirhut", state: "Bihar", lat: 26.5500, lng: 84.6833, popular: false, keywords: ["areraj", "someshwar nath temple", "subdivision"], tag: "Historic Someshwar Nath Mahadev Mandir", tollEst: 125 },
  { id: "kesaria", name: "Kesaria Stupa", hindiName: "केसरिया स्तूप", type: "town", typeLabel: "Heritage Site", district: "East Champaran", districtId: "east-champaran", division: "Tirhut", state: "Bihar", lat: 26.3500, lng: 84.8833, popular: true, keywords: ["kesaria", "buddhist stupa", "tallest stupa"], tag: "World's Tallest Ancient Buddhist Stupa", tollEst: 110 },
  { id: "chakia", name: "Chakia", hindiName: "चकिया", type: "subdivision", typeLabel: "Sub-Division", district: "East Champaran", districtId: "east-champaran", division: "Tirhut", state: "Bihar", lat: 26.4167, lng: 85.0500, popular: false, keywords: ["chakia", "nh27", "subdivision"], tag: "NH-27 East-West Corridor Transit Town", tollEst: 115 },

  // ============================================================================
  // 15. WEST CHAMPARAN (BETTIAH) DISTRICT
  // ============================================================================
  { id: "west-champaran", name: "West Champaran (Bettiah)", hindiName: "पश्चिमी चंपारण (बेतिया)", type: "district", typeLabel: "District HQ", district: "West Champaran", districtId: "west-champaran", division: "Tirhut", state: "Bihar", lat: 26.8024, lng: 84.5028, popular: true, keywords: ["bettiah", "west champaran", "bettiah raj"], tag: "Historic Bettiah Raj Estate & Agricultural Belt", airport: "Gorakhpur / Patna Airport", tollEst: 180 },
  { id: "bagaha", name: "Bagaha", hindiName: "बगहा", type: "subdivision", typeLabel: "Sub-Division", district: "West Champaran", districtId: "west-champaran", division: "Tirhut", state: "Bihar", lat: 27.1000, lng: 84.0833, popular: false, keywords: ["bagaha", "police district", "gandak", "subdivision"], tag: "Gandak River Valley Police District", tollEst: 215 },
  { id: "narkatiaganj", name: "Narkatiaganj", hindiName: "नरकटियागंज", type: "subdivision", typeLabel: "Sub-Division", district: "West Champaran", districtId: "west-champaran", division: "Tirhut", state: "Bihar", lat: 27.1167, lng: 84.4667, popular: false, keywords: ["narkatiaganj", "railway junction", "sugar mill", "subdivision"], tag: "Major Railway Junction & Sugar Production", tollEst: 200 },
  { id: "valmiki-nagar", name: "Valmiki Nagar", hindiName: "वाल्मीकि नगर", type: "town", typeLabel: "Tiger Reserve", district: "West Champaran", districtId: "west-champaran", division: "Tirhut", state: "Bihar", lat: 27.4333, lng: 83.9167, popular: true, keywords: ["valmiki nagar", "tiger reserve", "national park", "gandak barrage"], tag: "Valmiki National Tiger Reserve & Eco-Tourism", tollEst: 240 },

  // ============================================================================
  // 16. SITAMARHI DISTRICT
  // ============================================================================
  { id: "sitamarhi", name: "Sitamarhi", hindiName: "सीतामढ़ी", type: "district", typeLabel: "District HQ", district: "Sitamarhi", districtId: "sitamarhi", division: "Tirhut", state: "Bihar", lat: 26.5978, lng: 85.4892, popular: true, keywords: ["sitamarhi", "punaura dham", "sita birthplace", "ramayana circuit"], tag: "Birthplace of Mata Sita & Punaura Dham", airport: "Darbhanga Airport", tollEst: 120 },
  { id: "bairgania", name: "Bairgania", hindiName: "बैरगनिया", type: "subdivision", typeLabel: "Sub-Division", district: "Sitamarhi", districtId: "sitamarhi", division: "Tirhut", state: "Bihar", lat: 26.7833, lng: 85.2833, popular: false, keywords: ["bairgania", "nepal border", "subdivision"], tag: "Indo-Nepal Cross-Border Trading Center", tollEst: 140 },
  { id: "pupri", name: "Pupri (Janakpur Road)", hindiName: "पुपरी (जनकपुर रोड)", type: "subdivision", typeLabel: "Sub-Division", district: "Sitamarhi", districtId: "sitamarhi", division: "Tirhut", state: "Bihar", lat: 26.5500, lng: 85.7000, popular: false, keywords: ["pupri", "janakpur road", "subdivision"], tag: "Janakpur Road Pilgrimage Highway", tollEst: 115 },

  // ============================================================================
  // 17. SHEOHAR DISTRICT
  // ============================================================================
  { id: "sheohar", name: "Sheohar", hindiName: "शिवहर", type: "district", typeLabel: "District HQ", district: "Sheohar", districtId: "sheohar", division: "Tirhut", state: "Bihar", lat: 26.5167, lng: 85.2833, popular: false, keywords: ["sheohar", "bagmati river"], tag: "Bagmati River Agriculture District", airport: "Darbhanga Airport", tollEst: 95 },

  // ============================================================================
  // 18. DARBHANGA DISTRICT
  // ============================================================================
  { id: "darbhanga", name: "Darbhanga", hindiName: "दरभंगा", type: "district", typeLabel: "District HQ", district: "Darbhanga", districtId: "darbhanga", division: "Darbhanga", state: "Bihar", lat: 26.1542, lng: 85.8918, popular: true, keywords: ["darbhanga", "mithila", "raj darbhanga", "airport hub", "aiims darbhanga"], tag: "Cultural Capital of Mithila & Aviation Hub", airport: "Darbhanga Airport (DMB)", tollEst: 130 },
  { id: "darbhanga-airport", name: "Darbhanga Airport (DMB)", hindiName: "दरभंगा एयरपोर्ट", type: "airport", typeLabel: "Airport Terminal", district: "Darbhanga", districtId: "darbhanga", division: "Darbhanga", state: "Bihar", lat: 26.1969, lng: 85.9142, popular: true, keywords: ["darbhanga airport", "dmb", "flight", "north bihar airport"], tag: "North Bihar Operational Commercial Airport", tollEst: 135 },
  { id: "benipur", name: "Benipur", hindiName: "बेनीपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Darbhanga", districtId: "darbhanga", division: "Darbhanga", state: "Bihar", lat: 26.0833, lng: 86.1333, popular: false, keywords: ["benipur", "darbhanga", "subdivision"], tag: "Central Mithila Commercial Market", tollEst: 145 },
  { id: "biraul", name: "Biraul", hindiName: "बिरौल", type: "subdivision", typeLabel: "Sub-Division", district: "Darbhanga", districtId: "darbhanga", division: "Darbhanga", state: "Bihar", lat: 25.9667, lng: 86.1833, popular: false, keywords: ["biraul", "subdivision", "kusheshwar asthan route"], tag: "Eastern Darbhanga Sub-Division Center", tollEst: 155 },
  { id: "kusheshwar-asthan", name: "Kusheshwar Asthan", hindiName: "कुशेश्वरस्थान", type: "town", typeLabel: "Pilgrimage Center", district: "Darbhanga", districtId: "darbhanga", division: "Darbhanga", state: "Bihar", lat: 25.8500, lng: 86.2500, popular: false, keywords: ["kusheshwar asthan", "shiva temple", "bird sanctuary"], tag: "Famous Shiva Temple & Migratory Bird Wetland", tollEst: 160 },

  // ============================================================================
  // 19. MADHUBANI DISTRICT
  // ============================================================================
  { id: "madhubani", name: "Madhubani", hindiName: "मधुबनी", type: "district", typeLabel: "District HQ", district: "Madhubani", districtId: "madhubani", division: "Darbhanga", state: "Bihar", lat: 26.3533, lng: 86.0718, popular: true, keywords: ["madhubani", "mithila painting", "art", "makhana"], tag: "World Renowned Madhubani Folk Art & Makhana", airport: "Darbhanga Airport", tollEst: 145 },
  { id: "jhanjharpur", name: "Jhanjharpur", hindiName: "झंझारपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Madhubani", districtId: "madhubani", division: "Darbhanga", state: "Bihar", lat: 26.2667, lng: 86.2833, popular: true, keywords: ["jhanjharpur", "nh27", "east west corridor", "subdivision"], tag: "NH-27 East-West Expressway Corridor Town", tollEst: 155 },
  { id: "benipatti", name: "Benipatti", hindiName: "बेनीपट्टी", type: "subdivision", typeLabel: "Sub-Division", district: "Madhubani", districtId: "madhubani", division: "Darbhanga", state: "Bihar", lat: 26.4667, lng: 85.9167, popular: false, keywords: ["benipatti", "uchchaith bhagwati", "kalidasa sthan", "subdivision"], tag: "Uchchaith Bhagwati Mandir (Kalidasa Sthan)", tollEst: 140 },
  { id: "jainagar", name: "Jainagar (Nepal Gateway)", hindiName: "जयनगर (नेपाल सीमा)", type: "subdivision", typeLabel: "Border Terminal", district: "Madhubani", districtId: "madhubani", division: "Darbhanga", state: "Bihar", lat: 26.5833, lng: 86.1333, popular: true, keywords: ["jainagar", "nepal rail", "kurtha train", "customs", "subdivision"], tag: "Indo-Nepal Cross-Border Passenger Rail Gateway", tollEst: 165 },

  // ============================================================================
  // 20. SAMASTIPUR DISTRICT
  // ============================================================================
  { id: "samastipur", name: "Samastipur", hindiName: "समस्तीपुर", type: "district", typeLabel: "District HQ", district: "Samastipur", districtId: "samastipur", division: "Darbhanga", state: "Bihar", lat: 25.8628, lng: 85.7811, popular: true, keywords: ["samastipur", "railway division", "agriculture university", "junction"], tag: "Major Railway Junction & Agricultural Center", airport: "Darbhanga / Patna Airport", tollEst: 85 },
  { id: "dalsinghsarai", name: "Dalsinghsarai", hindiName: "दलसिंहसराय", type: "subdivision", typeLabel: "Sub-Division", district: "Samastipur", districtId: "samastipur", division: "Darbhanga", state: "Bihar", lat: 25.6667, lng: 85.8333, popular: false, keywords: ["dalsinghsarai", "tobacco trade", "subdivision"], tag: "Commercial Agro-Trading & Highway Hub", tollEst: 95 },
  { id: "rosera", name: "Rosera", hindiName: "रोसड़ा", type: "subdivision", typeLabel: "Sub-Division", district: "Samastipur", districtId: "samastipur", division: "Darbhanga", state: "Bihar", lat: 25.7500, lng: 86.0167, popular: false, keywords: ["rosera", "budhi gandak", "subdivision"], tag: "Budhi Gandak River Trade Center", tollEst: 105 },
  { id: "shahpur-patori", name: "Shahpur Patori", hindiName: "शाहपुर पटोरी", type: "subdivision", typeLabel: "Sub-Division", district: "Samastipur", districtId: "samastipur", division: "Darbhanga", state: "Bihar", lat: 25.6000, lng: 85.5833, popular: false, keywords: ["patori", "shahpur patori", "subdivision"], tag: "Ganga Basin Agricultural Sub-Division", tollEst: 75 },
  { id: "pusa", name: "Pusa (Agri University)", hindiName: "पूसा (कृषि विश्वविद्यालय)", type: "town", typeLabel: "University Town", district: "Samastipur", districtId: "samastipur", division: "Darbhanga", state: "Bihar", lat: 25.9833, lng: 85.6667, popular: false, keywords: ["pusa", "rajendra prasad central agricultural university"], tag: "Dr. Rajendra Prasad Central Agricultural University", tollEst: 90 },

  // ============================================================================
  // 21. SARAN (CHHAPRA) DISTRICT
  // ============================================================================
  { id: "saran", name: "Saran (Chhapra)", hindiName: "सारण (छपरा)", type: "district", typeLabel: "District HQ", district: "Saran", districtId: "saran", division: "Saran", state: "Bihar", lat: 25.7796, lng: 84.7499, popular: true, keywords: ["chhapra", "saran", "ambika bhavani", "railway junction"], tag: "Ambika Bhavani Dham & Major Junction", airport: "Patna Airport", tollEst: 60 },
  { id: "marhaura", name: "Marhaura", hindiName: "मढ़ौरा", type: "subdivision", typeLabel: "Sub-Division", district: "Saran", districtId: "saran", division: "Saran", state: "Bihar", lat: 25.9667, lng: 84.8667, popular: false, keywords: ["marhaura", "diesel locomotive plant", "subdivision"], tag: "GE Indian Railways Diesel Locomotive Factory", tollEst: 75 },

  // ============================================================================
  // 22. SIWAN DISTRICT
  // ============================================================================
  { id: "siwan", name: "Siwan", hindiName: "सीवान", type: "district", typeLabel: "District HQ", district: "Siwan", districtId: "siwan", division: "Saran", state: "Bihar", lat: 26.2196, lng: 84.3567, popular: true, keywords: ["siwan", "rajendra prasad", "ziradei", "commercial"], tag: "Birthplace of 1st President Dr. Rajendra Prasad", airport: "Gorakhpur / Patna Airport", tollEst: 115 },
  { id: "maharajganj", name: "Maharajganj", hindiName: "महाराजगंज", type: "subdivision", typeLabel: "Sub-Division", district: "Siwan", districtId: "siwan", division: "Saran", state: "Bihar", lat: 26.1167, lng: 84.5000, popular: false, keywords: ["maharajganj", "siwan", "subdivision"], tag: "Eastern Siwan Commercial Trade Market", tollEst: 95 },
  { id: "mairwa", name: "Mairwa", hindiName: "मैरवा", type: "town", typeLabel: "Town", district: "Siwan", districtId: "siwan", division: "Saran", state: "Bihar", lat: 26.2333, lng: 84.1500, popular: false, keywords: ["mairwa", "baba hari ram brahma dham"], tag: "Baba Hari Ram Brahma Ji Pilgrimage Dham", tollEst: 130 },

  // ============================================================================
  // 23. GOPALGANJ DISTRICT
  // ============================================================================
  { id: "gopalganj", name: "Gopalganj", hindiName: "गोपालगंज", type: "district", typeLabel: "District HQ", district: "Gopalganj", districtId: "gopalganj", division: "Saran", state: "Bihar", lat: 26.4687, lng: 84.4442, popular: true, keywords: ["gopalganj", "thawe", "hathwa", "nh27"], tag: "Maa Thawe Durga Temple & Sugarcane Hub", airport: "Gorakhpur Airport", tollEst: 140 },
  { id: "hathwa", name: "Hathwa", hindiName: "हथुआ", type: "subdivision", typeLabel: "Sub-Division", district: "Gopalganj", districtId: "gopalganj", division: "Saran", state: "Bihar", lat: 26.3500, lng: 84.3000, popular: false, keywords: ["hathwa", "hathwa raj palace", "sainik school", "subdivision"], tag: "Historic Hathwa Raj Estate & Sainik School", tollEst: 135 },
  { id: "thawe", name: "Thawe (Durga Temple)", hindiName: "थावे (दुर्गा मंदिर)", type: "town", typeLabel: "Pilgrimage Center", district: "Gopalganj", districtId: "gopalganj", division: "Saran", state: "Bihar", lat: 26.4167, lng: 84.3833, popular: true, keywords: ["thawe", "thawe bhavani", "durga mandir", "shakti peeth"], tag: "Maa Thawe Bhavani Sacred Shakti Dham", tollEst: 135 },

  // ============================================================================
  // 24. BHAGALPUR DISTRICT
  // ============================================================================
  { id: "bhagalpur", name: "Bhagalpur", hindiName: "भागलपुर", type: "district", typeLabel: "District HQ", district: "Bhagalpur", districtId: "bhagalpur", division: "Bhagalpur", state: "Bihar", lat: 25.2425, lng: 87.0125, popular: true, keywords: ["bhagalpur", "silk city", "tussar silk", "vikramshila", "ganga dolphin"], tag: "Silk City of India & Vikramshila Heritage", airport: "Patna / Deoghar Airport", tollEst: 195 },
  { id: "kahalgaon", name: "Kahalgaon", hindiName: "कहलगांव", type: "subdivision", typeLabel: "Sub-Division", district: "Bhagalpur", districtId: "bhagalpur", division: "Bhagalpur", state: "Bihar", lat: 25.2667, lng: 87.2333, popular: true, keywords: ["kahalgaon", "ntpc kahalgaon", "thermal power", "bateshwar sthan", "subdivision"], tag: "NTPC Super Thermal Power & Bateshwar Sthan", tollEst: 220 },
  { id: "naugachia", name: "Naugachia", hindiName: "नवगछिया", type: "subdivision", typeLabel: "Sub-Division", district: "Bhagalpur", districtId: "bhagalpur", division: "Bhagalpur", state: "Bihar", lat: 25.3833, lng: 87.1000, popular: true, keywords: ["naugachia", "banana capital", "nh31", "subdivision"], tag: "Banana Capital of Bihar & NH-31 Junction", tollEst: 185 },
  { id: "sultanganj", name: "Sultanganj", hindiName: "सुल्तानगंज", type: "town", typeLabel: "Pilgrimage Center", district: "Bhagalpur", districtId: "bhagalpur", division: "Bhagalpur", state: "Bihar", lat: 25.2500, lng: 86.7333, popular: true, keywords: ["sultanganj", "ajgaibinath", "ganga jal", "kanwar yatra to deoghar"], tag: "Baba Ajgaibinath Dham & Kanwar Yatra Origin", tollEst: 175 },

  // ============================================================================
  // 25. BANKA DISTRICT
  // ============================================================================
  { id: "banka", name: "Banka", hindiName: "बांका", type: "district", typeLabel: "District HQ", district: "Banka", districtId: "banka", division: "Bhagalpur", state: "Bihar", lat: 24.8833, lng: 86.9167, popular: false, keywords: ["banka", "mandar hill", "chandan river"], tag: "Chandan River Basin & Mining District", airport: "Deoghar Airport", tollEst: 180 },
  { id: "bounsi", name: "Bounsi (Mandar Hill)", hindiName: "बौसी (मंदार पर्वत)", type: "town", typeLabel: "Heritage Site", district: "Banka", districtId: "banka", division: "Bhagalpur", state: "Bihar", lat: 24.8000, lng: 87.0167, popular: true, keywords: ["mandar hill", "bounsi", "ropeway", "samudra manthan", "jain tirth"], tag: "Historic Mandar Hill Ropeway & Jain Tirth", tollEst: 195 },

  // ============================================================================
  // 26. MUNGER DISTRICT
  // ============================================================================
  { id: "munger", name: "Munger", hindiName: "मुंगेर", type: "district", typeLabel: "District HQ", district: "Munger", districtId: "munger", division: "Munger", state: "Bihar", lat: 25.3757, lng: 86.4744, popular: true, keywords: ["munger", "bihar school of yoga", "fort", "ganga bridge", "gun factory"], tag: "Bihar School of Yoga & Historic Fort", airport: "Patna / Deoghar Airport", tollEst: 155 },
  { id: "jamalpur", name: "Jamalpur", hindiName: "जमालपुर", type: "town", typeLabel: "Railway Hub", district: "Munger", districtId: "munger", division: "Munger", state: "Bihar", lat: 25.3167, lng: 86.5000, popular: true, keywords: ["jamalpur", "railway workshop", "irimee", "locomotive"], tag: "Asia's Oldest Indian Railway Locomotive Workshop", tollEst: 160 },
  { id: "haveli-kharagpur", name: "Haveli Kharagpur", hindiName: "हवेली खड़गपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Munger", districtId: "munger", division: "Munger", state: "Bihar", lat: 25.1167, lng: 86.5500, popular: false, keywords: ["kharagpur", "lake", "subdivision"], tag: "Scenic Kharagpur Lake Eco-Reserve", tollEst: 170 },

  // ============================================================================
  // 27. BEGUSARAI DISTRICT
  // ============================================================================
  { id: "begusarai", name: "Begusarai", hindiName: "बेगूसराय", type: "district", typeLabel: "District HQ", district: "Begusarai", districtId: "begusarai", division: "Munger", state: "Bihar", lat: 25.4182, lng: 86.1272, popular: true, keywords: ["begusarai", "industrial capital", "refinery", "dinkar", "kanwar lake"], tag: "Industrial Capital of Bihar & Kanwar Lake", airport: "Patna Airport", tollEst: 110 },
  { id: "barauni", name: "Barauni", hindiName: "बरौनी", type: "town", typeLabel: "Industrial Hub", district: "Begusarai", districtId: "begusarai", division: "Munger", state: "Bihar", lat: 25.4667, lng: 85.9667, popular: true, keywords: ["barauni", "refinery", "fertilizer", "thermal power", "railway junction"], tag: "IOCL Oil Refinery & Major Railway Junction", tollEst: 100 },

  // ============================================================================
  // 28. KHAGARIA DISTRICT
  // ============================================================================
  { id: "khagaria", name: "Khagaria", hindiName: "खगड़िया", type: "district", typeLabel: "District HQ", district: "Khagaria", districtId: "khagaria", division: "Munger", state: "Bihar", lat: 25.5036, lng: 86.4828, popular: false, keywords: ["khagaria", "confluence of 7 rivers", "maize hub"], tag: "Land of Seven Rivers & Major Maize Market", airport: "Darbhanga / Patna Airport", tollEst: 140 },
  { id: "gogri-jamalpur", name: "Gogri Jamalpur", hindiName: "गोगरी जमालपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Khagaria", districtId: "khagaria", division: "Munger", state: "Bihar", lat: 25.4167, lng: 86.6000, popular: false, keywords: ["gogri", "subdivision"], tag: "Ganga-Kosi Confluence Agriculture Center", tollEst: 155 },

  // ============================================================================
  // 29. JAMUI DISTRICT
  // ============================================================================
  { id: "jamui", name: "Jamui", hindiName: "जमुई", type: "district", typeLabel: "District HQ", district: "Jamui", districtId: "jamui", division: "Munger", state: "Bihar", lat: 24.9211, lng: 86.2256, popular: false, keywords: ["jamui", "mahavira nirvana", "jain", "gold reserve"], tag: "Jain Tirthankar Mahavira Sacred Land", airport: "Deoghar Airport", tollEst: 160 },
  { id: "jhajha", name: "Jhajha", hindiName: "झाझा", type: "subdivision", typeLabel: "Sub-Division", district: "Jamui", districtId: "jamui", division: "Munger", state: "Bihar", lat: 24.7667, lng: 86.3833, popular: true, keywords: ["jhajha", "railway junction", "main line", "subdivision"], tag: "Major Howrah-Delhi Mainline Railway Junction", tollEst: 175 },

  // ============================================================================
  // 30. LAKHISARAI DISTRICT
  // ============================================================================
  { id: "lakhisarai", name: "Lakhisarai", hindiName: "लखीसराय", type: "district", typeLabel: "District HQ", district: "Lakhisarai", districtId: "lakhisarai", division: "Munger", state: "Bihar", lat: 25.1764, lng: 85.9056, popular: false, keywords: ["lakhisarai", "kiul junction", "buddhist monasteries", "ashringi"], tag: "Kiul Railway Junction & Buddhist Heritage", airport: "Patna Airport", tollEst: 105 },
  { id: "barahiya", name: "Barahiya", hindiName: "बड़हिया", type: "subdivision", typeLabel: "Sub-Division", district: "Lakhisarai", districtId: "lakhisarai", division: "Munger", state: "Bihar", lat: 25.2833, lng: 86.0333, popular: false, keywords: ["barahiya", "famous rasgulla", "maharani mandir", "subdivision"], tag: "Famous Barahiya Rasgulla & Maharani Mandir", tollEst: 95 },

  // ============================================================================
  // 31. SHEIKHPURA DISTRICT
  // ============================================================================
  { id: "sheikhpura", name: "Sheikhpura", hindiName: "शेखपुरा", type: "district", typeLabel: "District HQ", district: "Sheikhpura", districtId: "sheikhpura", division: "Munger", state: "Bihar", lat: 25.1333, lng: 85.8500, popular: false, keywords: ["sheikhpura", "girihinda hill", "stone quarries"], tag: "Girihinda Hill & Stone Crushing Industry", airport: "Patna Airport", tollEst: 90 },
  { id: "barbigha", name: "Barbigha", hindiName: "बरबीघा", type: "town", typeLabel: "Town", district: "Sheikhpura", districtId: "sheikhpura", division: "Munger", state: "Bihar", lat: 25.2333, lng: 85.7333, popular: false, keywords: ["barbigha", "srikrishna singh", "education center"], tag: "Birthplace of Bihar First CM Dr. Srikrishna Singh", tollEst: 80 },

  // ============================================================================
  // 32. PURNIA DISTRICT
  // ============================================================================
  { id: "purnia", name: "Purnia", hindiName: "पूर्णिया", type: "district", typeLabel: "District HQ", district: "Purnia", districtId: "purnia", division: "Purnia", state: "Bihar", lat: 25.7771, lng: 87.4753, popular: true, keywords: ["purnia", "seemanchal", "medical hub", "line bazar", "makhana"], tag: "Heart of Seemanchal & Premier Medical Hub", airport: "Bagdogra / Darbhanga Airport", tollEst: 230 },
  { id: "banmankhi", name: "Banmankhi", hindiName: "बनमनखी", type: "subdivision", typeLabel: "Sub-Division", district: "Purnia", districtId: "purnia", division: "Purnia", state: "Bihar", lat: 25.9000, lng: 87.1667, popular: false, keywords: ["banmankhi", "sugar mill", "prahlad stambh", "subdivision"], tag: "Prahlad Stambh & Sugar Mill Center", tollEst: 215 },
  { id: "baisi", name: "Baisi", hindiName: "बायसी", type: "subdivision", typeLabel: "Sub-Division", district: "Purnia", districtId: "purnia", division: "Purnia", state: "Bihar", lat: 25.8333, lng: 87.7333, popular: false, keywords: ["baisi", "nh31", "mahananda", "subdivision"], tag: "Mahananda River NH-31 Gateway to Bengal", tollEst: 245 },

  // ============================================================================
  // 33. KATIHAR DISTRICT
  // ============================================================================
  { id: "katihar", name: "Katihar", hindiName: "कटिहार", type: "district", typeLabel: "District HQ", district: "Katihar", districtId: "katihar", division: "Purnia", state: "Bihar", lat: 25.5394, lng: 87.5706, popular: true, keywords: ["katihar", "railway division", "nfr", "jute mills"], tag: "Northeast Frontier Railway Division & Jute Hub", airport: "Bagdogra Airport", tollEst: 240 },
  { id: "barsoi", name: "Barsoi", hindiName: "बारसोई", type: "subdivision", typeLabel: "Sub-Division", district: "Katihar", districtId: "katihar", division: "Purnia", state: "Bihar", lat: 25.6833, lng: 87.8833, popular: false, keywords: ["barsoi", "railway junction", "subdivision"], tag: "Major Railway Junction to North East", tollEst: 260 },
  { id: "manihari", name: "Manihari", hindiName: "मनिहारी", type: "subdivision", typeLabel: "Sub-Division", district: "Katihar", districtId: "katihar", division: "Purnia", state: "Bihar", lat: 25.3500, lng: 87.6333, popular: false, keywords: ["manihari", "ganga ferry to sahibganj", "subdivision"], tag: "Ganga Port & Ferry to Sahibganj Jharkhand", tollEst: 255 },

  // ============================================================================
  // 34. ARARIA DISTRICT
  // ============================================================================
  { id: "araria", name: "Araria", hindiName: "अररिया", type: "district", typeLabel: "District HQ", district: "Araria", districtId: "araria", division: "Purnia", state: "Bihar", lat: 26.1500, lng: 87.5200, popular: false, keywords: ["araria", "renu", "nh27"], tag: "Phanishwar Nath Renu Land & NH-27 Corridor", airport: "Bagdogra Airport", tollEst: 260 },
  { id: "forbesganj", name: "Forbesganj", hindiName: "फारबिसगंज", type: "subdivision", typeLabel: "Sub-Division", district: "Araria", districtId: "araria", division: "Purnia", state: "Bihar", lat: 26.3000, lng: 87.2667, popular: true, keywords: ["forbesganj", "business hub", "nh27", "subdivision"], tag: "Premier North Bihar Trade & Commercial City", tollEst: 250 },
  { id: "jogbani", name: "Jogbani (Nepal Gate)", hindiName: "जोगबनी (नेपाल सीमा)", type: "town", typeLabel: "Border Port", district: "Araria", districtId: "araria", division: "Purnia", state: "Bihar", lat: 26.4167, lng: 87.2833, popular: true, keywords: ["jogbani", "biratnagar", "nepal border", "icp customs"], tag: "Indo-Nepal Biratnagar Border Integrated Checkpost", tollEst: 265 },

  // ============================================================================
  // 35. KISHANGANJ DISTRICT
  // ============================================================================
  { id: "kishanganj", name: "Kishanganj", hindiName: "किशनगंज", type: "district", typeLabel: "District HQ", district: "Kishanganj", districtId: "kishanganj", division: "Purnia", state: "Bihar", lat: 26.0969, lng: 87.9439, popular: true, keywords: ["kishanganj", "tea gardens", "chicken neck", "siliguri corridor"], tag: "Tea Plantations & Chicken's Neck Gateway", airport: "Bagdogra Airport (IXB)", tollEst: 290 },
  { id: "thakurganj", name: "Thakurganj", hindiName: "ठाकुरगंज", type: "town", typeLabel: "Town", district: "Kishanganj", districtId: "kishanganj", division: "Purnia", state: "Bihar", lat: 26.4500, lng: 88.1333, popular: false, keywords: ["thakurganj", "tea gardens", "nepal border road"], tag: "Tea Estates & Bengal-Nepal Border Corridor", tollEst: 310 },

  // ============================================================================
  // 36. SAHARSA DISTRICT
  // ============================================================================
  { id: "saharsa", name: "Saharsa", hindiName: "सहरसा", type: "district", typeLabel: "District HQ", district: "Saharsa", districtId: "saharsa", division: "Kosi", state: "Bihar", lat: 25.8833, lng: 86.6000, popular: true, keywords: ["saharsa", "kosi division", "matsyagandha", "tara mandir"], tag: "Kosi Division Seat & Matsyagandha Lake", airport: "Darbhanga Airport", tollEst: 175 },
  { id: "simri-bakhtiarpur", name: "Simri Bakhtiarpur", hindiName: "सिमरी बख्तियारपुर", type: "subdivision", typeLabel: "Sub-Division", district: "Saharsa", districtId: "saharsa", division: "Kosi", state: "Bihar", lat: 25.7167, lng: 86.5833, popular: false, keywords: ["simri bakhtiarpur", "subdivision"], tag: "Historic Estate & Agricultural Trading Center", tollEst: 165 },
  { id: "mahishi", name: "Mahishi (Ugra Tara)", hindiName: "महिषी (उग्रतारा मंदिर)", type: "town", typeLabel: "Pilgrimage Center", district: "Saharsa", districtId: "saharsa", division: "Kosi", state: "Bihar", lat: 25.9500, lng: 86.4667, popular: false, keywords: ["mahishi", "ugra tara mandir", "mandan mishra shastrarth"], tag: "Mata Ugra Tara Mandir & Mandan Mishra Sthan", tollEst: 170 },

  // ============================================================================
  // 37. SUPAUL DISTRICT
  // ============================================================================
  { id: "supaul", name: "Supaul", hindiName: "सुपौल", type: "district", typeLabel: "District HQ", district: "Supaul", districtId: "supaul", division: "Kosi", state: "Bihar", lat: 26.1261, lng: 86.6053, popular: false, keywords: ["supaul", "kosi river", "barrage"], tag: "Kosi River Corridor & Agricultural District", airport: "Darbhanga Airport", tollEst: 190 },
  { id: "birpur", name: "Birpur (Kosi Barrage)", hindiName: "बीरपुर (कोसी बैराज)", type: "subdivision", typeLabel: "Sub-Division", district: "Supaul", districtId: "supaul", division: "Kosi", state: "Bihar", lat: 26.5167, lng: 87.0167, popular: false, keywords: ["birpur", "kosi barrage", "nepal border", "subdivision"], tag: "Historic Indo-Nepal Kosi River Control Barrage", tollEst: 230 },
  { id: "nirmali", name: "Nirmali", hindiName: "निर्मली", type: "subdivision", typeLabel: "Sub-Division", district: "Supaul", districtId: "supaul", division: "Kosi", state: "Bihar", lat: 26.3167, lng: 86.6000, popular: false, keywords: ["nirmali", "kosi mega bridge", "subdivision"], tag: "New Kosi Mega Rail Bridge Connection", tollEst: 195 },

  // ============================================================================
  // 38. MADHEPURA DISTRICT
  // ============================================================================
  { id: "madhepura", name: "Madhepura", hindiName: "मधेपुरा", type: "district", typeLabel: "District HQ", district: "Madhepura", districtId: "madhepura", division: "Kosi", state: "Bihar", lat: 25.9264, lng: 86.7936, popular: false, keywords: ["madhepura", "alstom locomotive", "electric engine", "singheshwar"], tag: "Alstom Electric Locomotive Factory & University", airport: "Darbhanga Airport", tollEst: 185 },
  { id: "singheshwar", name: "Singheshwar Asthan", hindiName: "सिंहेश्वर अस्थान", type: "town", typeLabel: "Pilgrimage Center", district: "Madhepura", districtId: "madhepura", division: "Kosi", state: "Bihar", lat: 26.0167, lng: 86.8167, popular: true, keywords: ["singheshwar", "shiva dham", "maha shivratri mela"], tag: "Sacred Ancient Singheshwar Mahadev Mandir", tollEst: 195 },
  { id: "uda-kishanganj", name: "Uda Kishanganj", hindiName: "उदाकिशुनगंज", type: "subdivision", typeLabel: "Sub-Division", district: "Madhepura", districtId: "madhepura", division: "Kosi", state: "Bihar", lat: 25.6833, lng: 86.9667, popular: false, keywords: ["uda kishanganj", "subdivision"], tag: "Southern Madhepura Agricultural Market", tollEst: 180 },

  // ============================================================================
  // 39. MAJOR CONNECTED OUTSTATION HUBS (PAN-INDIA DIRECT HIGHWAY ROUTES)
  // ============================================================================
  { id: "varanasi", name: "Varanasi (Kashi)", hindiName: "वाराणसी (काशी)", type: "outstation", typeLabel: "Outstation Express", district: "Varanasi", districtId: "varanasi", division: "Outstation", state: "Uttar Pradesh", lat: 25.3176, lng: 82.9739, popular: true, keywords: ["varanasi", "kashi", "banaras", "kashi vishwanath", "assighat", "cantt", "airport"], tag: "Kashi Vishwanath Corridor & Airport", airport: "Lal Bahadur Shastri International (VNS)", tollEst: 280 },
  { id: "kolkata", name: "Kolkata (Howrah)", hindiName: "कोलकाता (हावड़ा)", type: "outstation", typeLabel: "Outstation Express", district: "Kolkata", districtId: "kolkata", division: "Outstation", state: "West Bengal", lat: 22.5726, lng: 88.3639, popular: true, keywords: ["kolkata", "calcutta", "howrah", "airport", "metro"], tag: "Metro Gateway to East & Netaji Airport", airport: "Netaji Subhash Chandra Bose (CCU)", tollEst: 580 },
  { id: "ranchi", name: "Ranchi", hindiName: "राँची", type: "outstation", typeLabel: "Outstation Express", district: "Ranchi", districtId: "ranchi", division: "Outstation", state: "Jharkhand", lat: 23.3441, lng: 85.3096, popular: true, keywords: ["ranchi", "jharkhand", "capital", "waterfalls", "birsa munda"], tag: "Capital of Jharkhand & Birsa Munda Airport", airport: "Birsa Munda Airport (IXR)", tollEst: 320 },
  { id: "deoghar", name: "Deoghar (Baidyanath Dham)", hindiName: "देवघर (बाबा बैद्यनाथ धाम)", type: "outstation", typeLabel: "Outstation Express", district: "Deoghar", districtId: "deoghar", division: "Outstation", state: "Jharkhand", lat: 24.4826, lng: 86.7001, popular: true, keywords: ["deoghar", "baidyanath dham", "jyotirlinga", "airport", "shravani mela"], tag: "12 Jyotirlinga Sacred Dham & Airport", airport: "Deoghar Airport (DGH)", tollEst: 210 },
  { id: "siliguri", name: "Siliguri / Bagdogra", hindiName: "सिलीगुड़ी / बागडोगरा", type: "outstation", typeLabel: "Outstation Express", district: "Darjeeling", districtId: "siliguri", division: "Outstation", state: "West Bengal", lat: 26.7271, lng: 88.3953, popular: true, keywords: ["siliguri", "bagdogra", "darjeeling", "north east gateway", "airport"], tag: "North East & Darjeeling Hills Gateway Airport", airport: "Bagdogra Airport (IXB)", tollEst: 450 },
  { id: "gorakhpur", name: "Gorakhpur", hindiName: "गोरखपुर", type: "outstation", typeLabel: "Outstation Express", district: "Gorakhpur", districtId: "gorakhpur", division: "Outstation", state: "Uttar Pradesh", lat: 26.7606, lng: 83.3732, popular: true, keywords: ["gorakhpur", "gorakhnath temple", "airport", "nepal gateway"], tag: "Gorakhnath Temple & Eastern UP Hub", airport: "Gorakhpur Airport (GOP)", tollEst: 240 },
  { id: "lucknow", name: "Lucknow", hindiName: "लखनऊ", type: "outstation", typeLabel: "Outstation Express", district: "Lucknow", districtId: "lucknow", division: "Outstation", state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462, popular: true, keywords: ["lucknow", "purvanchal expressway", "airport", "up capital"], tag: "Purvanchal Expressway Direct Corridor", airport: "Chaudhary Charan Singh (LKO)", tollEst: 520 },
  { id: "delhi", name: "Delhi NCR", hindiName: "दिल्ली एनसीआर", type: "outstation", typeLabel: "Outstation Express", district: "Delhi", districtId: "delhi", division: "Outstation", state: "Delhi", lat: 28.6139, lng: 77.2090, popular: true, keywords: ["delhi", "noida", "gurgaon", "ncr", "national capital"], tag: "National Capital Expressway Network", airport: "Indira Gandhi International (DEL)", tollEst: 950 },
  { id: "dhanbad", name: "Dhanbad", hindiName: "धनबाद", type: "outstation", typeLabel: "Outstation Express", district: "Dhanbad", districtId: "dhanbad", division: "Outstation", state: "Jharkhand", lat: 23.7957, lng: 86.4304, popular: false, keywords: ["dhanbad", "coal capital", "iit ism"], tag: "Coal Capital of India & Grand Trunk Road", tollEst: 280 },
  { id: "jamshedpur", name: "Jamshedpur (Tatanagar)", hindiName: "जमशेदपुर (टाटानगर)", type: "outstation", typeLabel: "Outstation Express", district: "East Singhbhum", districtId: "jamshedpur", division: "Outstation", state: "Jharkhand", lat: 22.8046, lng: 86.2029, popular: false, keywords: ["jamshedpur", "tatanagar", "steel city", "tata"], tag: "Steel City & Industrial Metropolis", tollEst: 360 },
  { id: "bokaro", name: "Bokaro Steel City", hindiName: "बोकारो स्टील सिटी", type: "outstation", typeLabel: "Outstation Express", district: "Bokaro", districtId: "bokaro", division: "Outstation", state: "Jharkhand", lat: 23.6693, lng: 86.1511, popular: false, keywords: ["bokaro", "steel plant", "sail"], tag: "Major Steel Industrial Center", tollEst: 290 }
];

// Alias for backwards compatibility
const BIHAR_DISTRICTS = OTB_CITIES;

// 2. High-Demand OneWayTaxiBihar Intercity & Outstation Routes
const OTB_POPULAR_ROUTES = [
  {
    id: "patna-hajipur",
    from: "Patna",
    to: "Hajipur (Vaishali)",
    fromId: "patna",
    toId: "hajipur",
    distanceKm: 25,
    duration: "45m",
    highway: "NH-22 / JP Setu Corridor",
    toll: 0,
    baseFareSedan: 799,
    baseFareHatchback: 699,
    baseFareSuv: 1199,
    savingsVsReturnCab: 1100,
    tripsDone: "1,65,000+",
    featured: true
  },
  {
    id: "patna-arrah",
    from: "Patna",
    to: "Arrah (Bhojpur)",
    fromId: "patna",
    toId: "bhojpur",
    distanceKm: 55,
    duration: "1h 15m",
    highway: "NH-922 via Koilwar Bridge",
    toll: 50,
    baseFareSedan: 999,
    baseFareHatchback: 899,
    baseFareSuv: 1399,
    savingsVsReturnCab: 1200,
    tripsDone: "1,20,000+",
    featured: true
  },
  {
    id: "patna-muzaffarpur",
    from: "Patna",
    to: "Muzaffarpur",
    fromId: "patna",
    toId: "muzaffarpur",
    distanceKm: 75,
    duration: "1h 45m",
    highway: "NH-22 via JP Setu / Hajipur",
    toll: 85,
    baseFareSedan: 1249,
    baseFareHatchback: 1099,
    baseFareSuv: 1749,
    savingsVsReturnCab: 1350,
    tripsDone: "1,40,000+",
    featured: true
  },
  {
    id: "patna-chapra",
    from: "Patna",
    to: "Chapra (Saran)",
    fromId: "patna",
    toId: "chapra",
    distanceKm: 70,
    duration: "1h 30m",
    highway: "NH-19 via Digha Bridge",
    toll: 60,
    baseFareSedan: 1199,
    baseFareHatchback: 1099,
    baseFareSuv: 1699,
    savingsVsReturnCab: 1300,
    tripsDone: "92,000+",
    featured: true
  },
  {
    id: "patna-gaya",
    from: "Patna",
    to: "Gaya (Bodh Gaya)",
    fromId: "patna",
    toId: "gaya",
    distanceKm: 110,
    duration: "2h 15m",
    highway: "NH-22 (Patna-Gaya 4-lane Highway)",
    toll: 110,
    baseFareSedan: 1549,
    baseFareHatchback: 1399,
    baseFareSuv: 2149,
    savingsVsReturnCab: 1650,
    tripsDone: "1,15,000+",
    featured: true
  },
  {
    id: "patna-darbhanga",
    from: "Patna",
    to: "Darbhanga",
    fromId: "patna",
    toId: "darbhanga",
    distanceKm: 140,
    duration: "2h 50m",
    highway: "NH-27 / NH-527 via Samastipur",
    toll: 130,
    baseFareSedan: 1799,
    baseFareHatchback: 1599,
    baseFareSuv: 2549,
    savingsVsReturnCab: 1800,
    tripsDone: "88,000+",
    featured: true
  },
  {
    id: "patna-rajgir",
    from: "Patna",
    to: "Rajgir (Nalanda)",
    fromId: "patna",
    toId: "nalanda",
    distanceKm: 100,
    duration: "2h 00m",
    highway: "SH-4 / NH-20 (Bakhtiyarpur-Rajgir 4-lane)",
    toll: 65,
    baseFareSedan: 1449,
    baseFareHatchback: 1299,
    baseFareSuv: 1999,
    savingsVsReturnCab: 1550,
    tripsDone: "95,000+",
    featured: true
  },
  {
    id: "patna-bhagalpur",
    from: "Patna",
    to: "Bhagalpur",
    fromId: "patna",
    toId: "bhagalpur",
    distanceKm: 235,
    duration: "4h 45m",
    highway: "NH-31 & NH-80 via Mokama-Munger",
    toll: 195,
    baseFareSedan: 2999,
    baseFareHatchback: 2699,
    baseFareSuv: 4199,
    savingsVsReturnCab: 3000,
    tripsDone: "62,000+",
    featured: true
  },
  {
    id: "patna-varanasi",
    from: "Patna",
    to: "Varanasi (Kashi)",
    fromId: "patna",
    toId: "varanasi",
    distanceKm: 245,
    duration: "4h 30m",
    highway: "NH-19 / Purvanchal Connector via Mohania",
    toll: 280,
    baseFareSedan: 5598,
    baseFareHatchback: 4798,
    baseFareSuv: 7998,
    savingsVsReturnCab: 6000,
    tripsDone: "72,000+",
    featured: true
  },
  {
    id: "patna-deoghar",
    from: "Patna",
    to: "Deoghar (Baba Baidyanath)",
    fromId: "patna",
    toId: "deoghar",
    distanceKm: 255,
    duration: "5h 15m",
    highway: "SH-82 / NH-333 via Jamui-Chakai",
    toll: 210,
    baseFareSedan: 5998,
    baseFareHatchback: 5198,
    baseFareSuv: 8598,
    savingsVsReturnCab: 6400,
    tripsDone: "54,000+",
    featured: true
  },
  {
    id: "patna-ranchi",
    from: "Patna",
    to: "Ranchi",
    fromId: "patna",
    toId: "ranchi",
    distanceKm: 320,
    duration: "6h 15m",
    highway: "NH-22 & NH-20 (Patna-Ranchi Expressway)",
    toll: 320,
    baseFareSedan: 6998,
    baseFareHatchback: 5998,
    baseFareSuv: 9998,
    savingsVsReturnCab: 7600,
    tripsDone: "48,000+",
    featured: true
  },
  {
    id: "patna-purnia",
    from: "Patna",
    to: "Purnea",
    fromId: "patna",
    toId: "purnia",
    distanceKm: 290,
    duration: "5h 30m",
    highway: "NH-31 (East-West Highway via Begusarai-Khagaria)",
    toll: 230,
    baseFareSedan: 3649,
    baseFareHatchback: 3299,
    baseFareSuv: 5099,
    savingsVsReturnCab: 3500,
    tripsDone: "39,000+",
    featured: false
  },
  {
    id: "patna-motihari",
    from: "Patna",
    to: "East Champaran (Motihari)",
    fromId: "patna",
    toId: "east-champaran",
    distanceKm: 155,
    duration: "3h 10m",
    highway: "NH-22 & NH-27 via Muzaffarpur Bypass",
    toll: 135,
    baseFareSedan: 1999,
    baseFareHatchback: 1799,
    baseFareSuv: 2799,
    savingsVsReturnCab: 1800,
    tripsDone: "44,000+",
    featured: false
  },
  {
    id: "patna-sasaram",
    from: "Patna",
    to: "Rohtas (Sasaram)",
    fromId: "patna",
    toId: "rohtas",
    distanceKm: 155,
    duration: "3h 20m",
    highway: "NH-119 / SH-15 via Ara-Bikramganj",
    toll: 140,
    baseFareSedan: 1999,
    baseFareHatchback: 1799,
    baseFareSuv: 2799,
    savingsVsReturnCab: 2000,
    tripsDone: "36,000+",
    featured: false
  },
  {
    id: "patna-buxar",
    from: "Patna",
    to: "Buxar",
    fromId: "patna",
    toId: "buxar",
    distanceKm: 130,
    duration: "2h 45m",
    highway: "NH-922 (Patna-Buxar 4-lane Expressway)",
    toll: 110,
    baseFareSedan: 1699,
    baseFareHatchback: 1499,
    baseFareSuv: 2349,
    savingsVsReturnCab: 1800,
    tripsDone: "51,000+",
    featured: false
  }
];

// 3. OneWayTaxiBihar Fleet Categories & Pricing Structure
const OTB_FLEET = [
  {
    id: "hatchback",
    category: "Go Hatchback",
    badge: "Budget Outstation",
    models: "WagonR, Tiago, Celerio or similar",
    seats: 4,
    luggage: "2 Large Bags",
    ac: "100% AC Guaranteed",
    ratePerKm: 21.0,
    baseFareMultiplier: 1.0,
    rating: 4.3,
    reviewsCount: "850+",
    features: ["Deep Sanitized Hatchback", "Air Conditioned", "Verified Highway Captain", "Luggage Boot"],
    description: "Economical AC ride for up to 4 passengers with light luggage across all districts."
  },
  {
    id: "sedan",
    category: "Prime Sedan",
    badge: "Most Popular in Bihar",
    models: "Dzire, Etios, Amaze or similar",
    seats: 4,
    luggage: "3-4 Bags (Large Boot)",
    ac: "Chilled AC",
    ratePerKm: 25.0,
    baseFareMultiplier: 1.18,
    rating: 4.3,
    reviewsCount: "1,250+",
    features: ["Spacious Legroom", "Spacious Boot for Heavy Bags", "Highway Cruise Control", "Mobile Charging"],
    description: "The gold standard for family visits, marriage trips, and business travel between Patna and districts."
  },
  {
    id: "sedan_prime",
    category: "Executive Sedan",
    badge: "Executive Comfort",
    models: "Honda City, Ciaz or similar",
    seats: 4,
    luggage: "4 Bags",
    ac: "Climate Controlled AC",
    ratePerKm: 29.0,
    baseFareMultiplier: 1.35,
    rating: 4.3,
    reviewsCount: "350+",
    features: ["Luxury Leather Seating", "Top-Rated Senior Captain", "Mineral Water Bottles", "Quiet Cabin"],
    description: "Premium sedan for executives, VIP delegates, and long highway journeys."
  },
  {
    id: "suv",
    category: "Family SUV (6+1)",
    badge: "Best for Family & Pilgrimage",
    models: "Maruti Ertiga, Kia Carens, Triber",
    seats: 6,
    luggage: "5-6 Bags + Roof Carrier",
    ac: "Dual AC Row Blowers",
    ratePerKm: 33.0,
    baseFareMultiplier: 1.55,
    rating: 4.3,
    reviewsCount: "420+",
    features: ["6 Passenger Capacity", "Roof Carrier for Chhath/Wedding Luggage", "Dual AC Blowers", "High Ground Clearance"],
    description: "Spacious multi-seater ideal for joint families travelling to Bodh Gaya, Rajgir, Deoghar, or village homes."
  },
  {
    id: "innova_crysta",
    category: "Toyota Innova Crysta",
    badge: "VIP Luxury",
    models: "Toyota Innova Crysta",
    seats: 7,
    luggage: "6-7 Large Bags",
    ac: "Triple Row Climate AC",
    ratePerKm: 44.0,
    baseFareMultiplier: 2.1,
    rating: 4.3,
    reviewsCount: "180+",
    features: ["Captain Recliner Chairs", "Supreme Highway Stability", "VIP Highway Protocol", "Senior Highway Expert Captain"],
    description: "Top-tier outstation travel experience with maximum comfort and safety across Bihar highways."
  }
];

// 4. Hourly / Local Rental Packages for Patna & Major Bihar Cities
const OTB_LOCAL_PACKAGES = [
  { id: "pkg_4hr_40km", name: "4 Hours / 40 KM (Patna City Tour)", hours: 4, km: 40, baseSedan: 2398, baseHatch: 1998, baseSuv: 3598, extraKmRate: 24, extraHourRate: 300 },
  { id: "pkg_8hr_80km", name: "8 Hours / 80 KM (Full Day Darshan)", hours: 8, km: 80, baseSedan: 3998, baseHatch: 3398, baseSuv: 5798, extraKmRate: 24, extraHourRate: 300 },
  { id: "pkg_12hr_120km", name: "12 Hours / 120 KM (Extended Tour)", hours: 12, km: 120, baseSedan: 5598, baseHatch: 4798, baseSuv: 7998, extraKmRate: 24, extraHourRate: 300 }
];

// 5. Authentic Verified Passenger Reviews & Ratings for OneWayTaxiBihar (1.0 - 5.0 Star Feedback)
const OTB_PASSENGER_REVIEWS = [
  {
    id: "otb_rev_01",
    initials: "RK",
    name: "Rajeshwar Kumar",
    avatarBg: "#059669",
    city: "Patna",
    route: "Patna → Bodh Gaya",
    car: "Prime Sedan (Dzire)",
    rating: 4.5,
    badge: "Verified Outstation Trip",
    verified: true,
    date: "2026-10-14",
    dateFormatted: "14 Oct 2026",
    timestamp: 1791936000000,
    comment: "Booked Dzire from Patna Junction to Bodh Gaya for family pilgrimage. Clean AC cab, driver reached 15 mins before time. Charged exactly ₹2,998 with toll included. Zero return fare!"
  },
  {
    id: "otb_rev_02",
    initials: "SV",
    name: "Dr. Sneha Verma",
    avatarBg: "#2563eb",
    city: "Muzaffarpur",
    route: "Patna Airport → Muzaffarpur",
    car: "Go Hatchback (WagonR)",
    rating: 4.8,
    badge: "Verified Airport Transfer",
    verified: true,
    date: "2026-10-12",
    dateFormatted: "12 Oct 2026",
    timestamp: 1791763200000,
    comment: "Flight landed late at Patna Airport. OneWayTaxiBihar captain was waiting outside with AC already on. Smooth driving over Gandhi Setu and reached safely."
  },
  {
    id: "otb_rev_03",
    initials: "AS",
    name: "Alok Sinha",
    avatarBg: "#7c3aed",
    city: "Darbhanga",
    route: "Patna → Darbhanga",
    car: "Family SUV (Ertiga)",
    rating: 4.3,
    badge: "Verified Family Booking",
    verified: true,
    date: "2026-10-10",
    dateFormatted: "10 Oct 2026",
    timestamp: 1791590400000,
    comment: "Travelled with 5 family members and heavy luggage for festival. Ertiga had roof carrier and the driver knew the newly widened expressway route. Saved ₹3,800!"
  },
  {
    id: "otb_rev_04",
    initials: "MP",
    name: "Manish Pandey",
    avatarBg: "#d97706",
    city: "Bhagalpur",
    route: "Patna → Bhagalpur",
    car: "Prime Sedan (Etios)",
    rating: 4.6,
    badge: "Verified Intercity Ride",
    verified: true,
    date: "2026-10-07",
    dateFormatted: "07 Oct 2026",
    timestamp: 1791331200000,
    comment: "Excellent highway cruise via Mokama. Transparent fixed pricing with zero hidden charges. OneWayTaxiBihar is our first choice for monthly district travel."
  },
  {
    id: "otb_rev_05",
    initials: "AA",
    name: "Amit Anand",
    avatarBg: "#64748b",
    city: "Purnia",
    route: "Patna → Purnia",
    car: "Prime Sedan (Dzire)",
    rating: 3.5,
    badge: "Verified Highway Trip",
    verified: true,
    date: "2026-10-04",
    dateFormatted: "04 Oct 2026",
    timestamp: 1791072000000,
    comment: "Punctual pickup from Kankarbagh and honest pricing with toll included. However AC cooling was moderate during peak afternoon heat. Overall decent service."
  },
  {
    id: "otb_rev_06",
    initials: "PJ",
    name: "Pooja Jha",
    avatarBg: "#db2777",
    city: "Madhubani",
    route: "Patna → Madhubani",
    car: "Innova Crysta",
    rating: 4.7,
    badge: "Verified Outstation Booking",
    verified: true,
    date: "2026-09-29",
    dateFormatted: "29 Sep 2026",
    timestamp: 1790640000000,
    comment: "Booked Innova Crysta for wedding travel. Super comfortable captain seats and peaceful driving. 24x7 helpdesk +91 77394 06400 is very responsive."
  },
  {
    id: "otb_rev_07",
    initials: "DC",
    name: "Deepak Choudhary",
    avatarBg: "#f59e0b",
    city: "Saran",
    route: "Patna → Chhapra",
    car: "Go Hatchback",
    rating: 3.0,
    badge: "Verified Outstation Ride",
    verified: true,
    date: "2026-09-24",
    dateFormatted: "24 Sep 2026",
    timestamp: 1790208000000,
    comment: "Driver was delayed by 10 mins due to traffic jam near Digha, but informed beforehand. Highway driving was safe and fixed fare policy was honored without extra charges."
  },
  {
    id: "otb_rev_08",
    initials: "VK",
    name: "Vikash Kashyap",
    avatarBg: "#0284c7",
    city: "Nalanda",
    route: "Patna → Rajgir Glass Bridge",
    car: "Prime Sedan (Dzire)",
    rating: 4.4,
    badge: "Verified Pilgrimage Trip",
    verified: true,
    date: "2026-09-18",
    dateFormatted: "18 Sep 2026",
    timestamp: 1789689600000,
    comment: "Weekend tour to Rajgir Nature Safari and Vishwa Shanti Stupa. Driver guided us through scenic Bakhtiyarpur-Rajgir 4-lane. Seamless experience!"
  },
  {
    id: "otb_rev_09",
    initials: "RT",
    name: "Ravi Tiwari",
    avatarBg: "#4f46e5",
    city: "Rohtas",
    route: "Patna → Sasaram",
    car: "Go Hatchback",
    rating: 4.3,
    badge: "Verified Outstation Trip",
    verified: true,
    date: "2026-09-12",
    dateFormatted: "12 Sep 2026",
    timestamp: 1789171200000,
    comment: "Fast, reliable and very economical. Paid only ₹3,198 for a one-way trip to Sasaram. No need to negotiate with offline taxi stands."
  },
  {
    id: "otb_rev_10",
    initials: "SM",
    name: "Saurabh Mishra",
    avatarBg: "#0d9488",
    city: "Varanasi",
    route: "Patna → Varanasi",
    car: "Family SUV (Ertiga)",
    rating: 4.8,
    badge: "Verified Intercity Ride",
    verified: true,
    date: "2026-09-05",
    dateFormatted: "05 Sep 2026",
    timestamp: 1788566400000,
    comment: "Took early morning 5 AM outstation cab from Boring Road Patna to Kashi Vishwanath Temple. Smooth driving and reached in 4.5 hours."
  }
];

const OTB_FRIENDS_REVIEWS = OTB_PASSENGER_REVIEWS;

// 6. The OneWayTaxiBihar Advantage (10 Core Pillars)
const OTB_WHY_CHOOSE_US = [
  {
    num: "01",
    title: "Doorstep Pickup Across All 38 Districts",
    desc: "OneWayTaxiBihar picks you up from your exact home, airport, or railway platform in Patna or any district and drops you gate-to-gate at fixed rates."
  },
  {
    num: "02",
    title: "100% Guaranteed Cab (Zero Cancellation)",
    desc: "Booked an outstation cab? Your ride is 100% confirmed with zero cancellations from our side. On-time doorstep arrival guaranteed."
  },
  {
    num: "03",
    title: "Transparent Fares (Tolls & GST Included)",
    desc: "All highway toll charges, state road taxes, driver allowance, and GST are clearly displayed before booking. Zero hidden cash demands."
  },
  {
    num: "04",
    title: "Zero Cancellation Fee Policy",
    desc: "Plans changed due to train/flight delay or emergency? Cancel your ride anytime with zero cancellation charges and 100% instant refund."
  },
  {
    num: "05",
    title: "24/7 Patna Helpdesk & SOS Assistance",
    desc: "Need immediate assistance or custom route routing? Call our 24/7 Patna central helpline at +91 80021 41816."
  },
  {
    num: "06",
    title: "Police-Verified Highway Captains",
    desc: "All drivers are background-checked, commercially licensed, and verified on 8+ safety, courteous behavior, and smooth driving parameters."
  },
  {
    num: "07",
    title: "Flexible Payment Modes",
    desc: "Pay 100% Cash/UPI to the driver only upon reaching your destination safely, or pay via Google Pay, PhonePe, Paytm, Cards, or Wallet."
  },
  {
    num: "08",
    title: "Diverse & Clean Outstation Fleet",
    desc: "Choose from Hatchback, Dzire/Etios Sedans, Executive Sedans, Ertiga 6-seaters with roof carriers, and luxury Toyota Innova Crysta."
  },
  {
    num: "09",
    title: "Instant Booking via Web & App",
    desc: "Book your one-way taxi in under 30 seconds with instant SMS and WhatsApp ticket dispatch with driver and vehicle plate numbers."
  },
  {
    num: "10",
    title: "100% AC & Sanitized Vehicles",
    desc: "We ensure all fleet cabs are mechanically certified, air-conditioning always working, and cabins deeply cleaned before every journey."
  }
];

// 7. Official Frequently Asked Questions (OneWayTaxiBihar FAQ)
const OTB_FAQS = [
  {
    q: "What is OneWayTaxiBihar and how does one-way pricing work?",
    a: "OneWayTaxiBihar (onewaytaxibihar.com) is Bihar's dedicated intercity one-way cab service. Traditional taxi stands in Patna charge return fares (both ways) even when you travel one-way. OneWayTaxiBihar eliminates dead-mileage charges, saving you up to 50% by charging only for the distance you travel."
  },
  {
    q: "Which districts and cities in Bihar do you cover?",
    a: "We provide doorstep pickup and drop across all 38 districts of Bihar (Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, Nalanda/Rajgir, Vaishali, Purnia, Motihari, Bettiah, Buxar, Sasaram, Begusarai, Samastipur, etc.) as well as connecting outstation routes to Varanasi, Kolkata, Ranchi, Deoghar, and Delhi."
  },
  {
    q: "Are toll taxes and GST included in the fare?",
    a: "Yes! OneWayTaxiBihar offers 100% transparent pricing. The displayed fare includes base cab fare, estimated highway fastag toll charges, driver allowance, and 5% GST. No extra cash demands on the highway."
  },
  {
    q: "Can I book a cab from Patna Airport (PAT) or Patna Junction (PNBE)?",
    a: "Yes! We specialize in airport and railway station pickups 24x7. You can enter your flight or train number during booking, and our captain will track your arrival to ensure zero waiting time."
  },
  {
    q: "I need to cancel my booking. Will I be charged a cancellation penalty?",
    a: "No. OneWayTaxiBihar follows a strict Zero Cancellation Fee policy. We understand that travel schedules can change, so you will never be penalized for cancelling a ride."
  },
  {
    q: "Can I book a multi-day round trip or hourly rental in Patna?",
    a: "Yes. In addition to One-Way drops, we offer Round Trip Outstation (with 12% built-in discount) and Local Hourly Packages (4Hr/40KM, 8Hr/80KM, 12Hr/120KM) for Patna local sightseeing, meetings, and darshan."
  },
  {
    q: "Is it safe for solo women travellers and senior citizens?",
    a: "Absolutely. Passenger safety is our topmost priority. All captains are police-verified, vehicles are GPS-tracked in real-time, and you receive driver details with start OTP and a 24x7 SOS emergency helpline."
  },
  {
    q: "What payment methods are supported?",
    a: "We accept all payment methods: 100% Cash or UPI to driver on arrival, UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, NetBanking, and OTB Wallet balance."
  },
  {
    q: "Can I get an official GST tax invoice for corporate business travel expense claims?",
    a: "Yes. Every booking receives an automated GST tax invoice with company GSTIN and breakdown that you can download or print directly from our 'Request Invoice' portal."
  },
  {
    q: "How do I contact customer support if I need assistance?",
    a: "Our Patna central customer support team is available 24x7. Call our helpline at +91 80021 41816, WhatsApp us at +91 77394 06400, or click the Call button on the website."
  }
];

// 9. Corporate Travel Desk for Bihar Enterprises & Government
const OTB_CORPORATE_DATA = {
  title: "OneWayTaxiBihar for Business & Corporate Travel",
  subtitle: "Streamline outstation employee and executive travel across all 38 districts of Bihar with centralized billing & GST compliance",
  trustedBy: ["Bihar State Tourism Development", "AIIMS Patna", "L&T Construction (Bihar Projects)", "Bajaj Allianz", "HDFC Bank Bihar Hub", "NTPC Barh / Kahalgaon"],
  features: [
    { title: "Consolidated Monthly GST Invoicing", desc: "Monthly statement with automated GST tax credit pass-through for company expenses." },
    { title: "Priority Dispatch in Patna & Districts", desc: "Guaranteed outstation cabs for urgent government, medical, and corporate delegations." },
    { title: "Zero Cancellation Penalty Fees", desc: "Meeting rescheduled? Modify or cancel bookings with zero penalty." },
    { title: "Dedicated Bihar Account Manager", desc: "Single point of contact for corporate rentals, event fleets, and airport transfers." },
    { title: "Real-Time Travel Radar & SOS", desc: "Safety dashboard for company administration to monitor employee travel live." }
  ]
};

// 10. Official Patna Master Costing & Fixed Fare Matrix (98 Destinations)
const OTB_PATNA_FARES = [
  {
    "id": "patna-araria",
    "origin": "Patna",
    "destination": "Araria",
    "destCity": "Araria",
    "district": "Araria",
    "region": "Bihar districts",
    "distanceKm": 300,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 12.66,
      "sedan": 13.33,
      "suv": 14.66
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.134Z"
  },
  {
    "id": "patna-arwal",
    "origin": "Patna",
    "destination": "Arwal",
    "destCity": "Arwal",
    "district": "Arwal",
    "region": "Bihar districts",
    "distanceKm": 90,
    "hatchback": 1599,
    "sedan": 1799,
    "execSedan": 2049,
    "suv": 2199,
    "luxSuv": 2499,
    "twoWay": {
      "hatchback": 2798,
      "sedan": 3198,
      "execSedan": 3698,
      "suv": 3998,
      "luxSuv": 4598
    },
    "perKm": {
      "hatchback": 17.77,
      "sedan": 19.99,
      "suv": 24.43
    },
    "marketComparison": "3238–3958",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-aurangabad",
    "origin": "Patna",
    "destination": "Aurangabad",
    "destCity": "Aurangabad",
    "district": "Aurangabad",
    "region": "Bihar districts",
    "distanceKm": 140,
    "hatchback": 2599,
    "sedan": 2799,
    "execSedan": 3049,
    "suv": 3199,
    "luxSuv": 3499,
    "twoWay": {
      "hatchback": 4798,
      "sedan": 5198,
      "execSedan": 5698,
      "suv": 5998,
      "luxSuv": 6598
    },
    "perKm": {
      "hatchback": 18.56,
      "sedan": 19.99,
      "suv": 22.85
    },
    "marketComparison": "5038–6158",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-banka",
    "origin": "Patna",
    "destination": "Banka",
    "destCity": "Banka",
    "district": "Banka",
    "region": "Bihar districts",
    "distanceKm": 250,
    "hatchback": 3099,
    "sedan": 3299,
    "execSedan": 3549,
    "suv": 3699,
    "luxSuv": 3999,
    "twoWay": {
      "hatchback": 5798,
      "sedan": 6198,
      "execSedan": 6698,
      "suv": 6998,
      "luxSuv": 7598
    },
    "perKm": {
      "hatchback": 12.4,
      "sedan": 13.2,
      "suv": 14.8
    },
    "marketComparison": "5938–7258",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-begusarai",
    "origin": "Patna",
    "destination": "Begusarai",
    "destCity": "Begusarai",
    "district": "Begusarai",
    "region": "Bihar districts",
    "distanceKm": 125,
    "hatchback": 2399,
    "sedan": 2599,
    "execSedan": 2849,
    "suv": 2999,
    "luxSuv": 3299,
    "twoWay": {
      "hatchback": 4398,
      "sedan": 4798,
      "execSedan": 5298,
      "suv": 5598,
      "luxSuv": 6198
    },
    "perKm": {
      "hatchback": 19.19,
      "sedan": 20.79,
      "suv": 23.99
    },
    "marketComparison": "4678–5718",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-bhagalpur",
    "origin": "Patna",
    "destination": "Bhagalpur",
    "destCity": "Bhagalpur",
    "district": "Bhagalpur",
    "region": "Bihar districts",
    "distanceKm": 235,
    "hatchback": 3299,
    "sedan": 3499,
    "execSedan": 3749,
    "suv": 3899,
    "luxSuv": 4199,
    "twoWay": {
      "hatchback": 6198,
      "sedan": 6598,
      "execSedan": 7098,
      "suv": 7398,
      "luxSuv": 7998
    },
    "perKm": {
      "hatchback": 14.04,
      "sedan": 14.89,
      "suv": 16.59
    },
    "marketComparison": "6298–7698",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-bhojpur",
    "origin": "Patna",
    "destination": "Bhojpur (Ara)",
    "destCity": "Bhojpur",
    "district": "Ara",
    "region": "Bihar districts",
    "distanceKm": 60,
    "hatchback": 1600,
    "sedan": 1800,
    "execSedan": 2050,
    "suv": 2200,
    "luxSuv": 2500,
    "twoWay": {
      "hatchback": 2800,
      "sedan": 3200,
      "execSedan": 3700,
      "suv": 4000,
      "luxSuv": 4600
    },
    "perKm": {
      "hatchback": 26.67,
      "sedan": 30,
      "suv": 36.67
    },
    "marketComparison": "3240–3960",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-buxar",
    "origin": "Patna",
    "destination": "Buxar",
    "destCity": "Buxar",
    "district": "Buxar",
    "region": "Bihar districts",
    "distanceKm": 125,
    "hatchback": 2599,
    "sedan": 2799,
    "execSedan": 3049,
    "suv": 3199,
    "luxSuv": 3499,
    "twoWay": {
      "hatchback": 4798,
      "sedan": 5198,
      "execSedan": 5698,
      "suv": 5998,
      "luxSuv": 6598
    },
    "perKm": {
      "hatchback": 20.79,
      "sedan": 22.39,
      "suv": 25.59
    },
    "marketComparison": "5038–6158",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-darbhanga",
    "origin": "Patna",
    "destination": "Darbhanga",
    "destCity": "Darbhanga",
    "district": "Darbhanga",
    "region": "Bihar districts",
    "distanceKm": 145,
    "hatchback": 2399,
    "sedan": 2599,
    "execSedan": 2849,
    "suv": 2999,
    "luxSuv": 3299,
    "twoWay": {
      "hatchback": 4398,
      "sedan": 4798,
      "execSedan": 5298,
      "suv": 5598,
      "luxSuv": 6198
    },
    "perKm": {
      "hatchback": 16.54,
      "sedan": 17.92,
      "suv": 20.68
    },
    "marketComparison": "4678–5718",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.135Z"
  },
  {
    "id": "patna-eastchamparan",
    "origin": "Patna",
    "destination": "East Champaran (Motihari)",
    "destCity": "East Champaran",
    "district": "Motihari",
    "region": "Bihar districts",
    "distanceKm": 160,
    "hatchback": 2399,
    "sedan": 2599,
    "execSedan": 2849,
    "suv": 2999,
    "luxSuv": 3299,
    "twoWay": {
      "hatchback": 4398,
      "sedan": 4798,
      "execSedan": 5298,
      "suv": 5598,
      "luxSuv": 6198
    },
    "perKm": {
      "hatchback": 14.99,
      "sedan": 16.24,
      "suv": 18.74
    },
    "marketComparison": "4678–5718",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-gaya",
    "origin": "Patna",
    "destination": "Gaya",
    "destCity": "Gaya",
    "district": "Gaya",
    "region": "Bihar districts",
    "distanceKm": 120,
    "hatchback": 1799,
    "sedan": 1999,
    "execSedan": 2249,
    "suv": 2399,
    "luxSuv": 2699,
    "twoWay": {
      "hatchback": 3198,
      "sedan": 3598,
      "execSedan": 4098,
      "suv": 4398,
      "luxSuv": 4998
    },
    "perKm": {
      "hatchback": 14.99,
      "sedan": 16.66,
      "suv": 19.99
    },
    "marketComparison": "3598–4398",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-gopalganj",
    "origin": "Patna",
    "destination": "Gopalganj",
    "destCity": "Gopalganj",
    "district": "Gopalganj",
    "region": "Bihar districts",
    "distanceKm": 165,
    "hatchback": 2599,
    "sedan": 2799,
    "execSedan": 3049,
    "suv": 3199,
    "luxSuv": 3499,
    "twoWay": {
      "hatchback": 4798,
      "sedan": 5198,
      "execSedan": 5698,
      "suv": 5998,
      "luxSuv": 6598
    },
    "perKm": {
      "hatchback": 15.75,
      "sedan": 16.96,
      "suv": 19.39
    },
    "marketComparison": "5038–6158",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-jamui",
    "origin": "Patna",
    "destination": "Jamui",
    "destCity": "Jamui",
    "district": "Jamui",
    "region": "Bihar districts",
    "distanceKm": 185,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 15.13,
      "sedan": 16.21,
      "suv": 18.37
    },
    "marketComparison": "5398–6598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-jehanabad",
    "origin": "Patna",
    "destination": "Jehanabad",
    "destCity": "Jehanabad",
    "district": "Jehanabad",
    "region": "Bihar districts",
    "distanceKm": 55,
    "hatchback": 1499,
    "sedan": 1699,
    "execSedan": 1949,
    "suv": 2099,
    "luxSuv": 2399,
    "twoWay": {
      "hatchback": 2598,
      "sedan": 2998,
      "execSedan": 3498,
      "suv": 3798,
      "luxSuv": 4398
    },
    "perKm": {
      "hatchback": 27.25,
      "sedan": 30.89,
      "suv": 38.16
    },
    "marketComparison": "3058–3738",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-kaimur",
    "origin": "Patna",
    "destination": "Kaimur (Bhabua)",
    "destCity": "Kaimur",
    "district": "Bhabua",
    "region": "Bihar districts",
    "distanceKm": 200,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 13.99,
      "sedan": 14.99,
      "suv": 17
    },
    "marketComparison": "5398–6598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-katihar",
    "origin": "Patna",
    "destination": "Katihar",
    "destCity": "Katihar",
    "district": "Katihar",
    "region": "Bihar districts",
    "distanceKm": 300,
    "hatchback": 4299,
    "sedan": 4499,
    "execSedan": 4749,
    "suv": 4899,
    "luxSuv": 5199,
    "twoWay": {
      "hatchback": 8198,
      "sedan": 8598,
      "execSedan": 9098,
      "suv": 9398,
      "luxSuv": 9998
    },
    "perKm": {
      "hatchback": 14.33,
      "sedan": 15,
      "suv": 16.33
    },
    "marketComparison": "8098–9898",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-khagaria",
    "origin": "Patna",
    "destination": "Khagaria",
    "destCity": "Khagaria",
    "district": "Khagaria",
    "region": "Bihar districts",
    "distanceKm": 180,
    "hatchback": 3099,
    "sedan": 3299,
    "execSedan": 3549,
    "suv": 3699,
    "luxSuv": 3999,
    "twoWay": {
      "hatchback": 5798,
      "sedan": 6198,
      "execSedan": 6698,
      "suv": 6998,
      "luxSuv": 7598
    },
    "perKm": {
      "hatchback": 17.22,
      "sedan": 18.33,
      "suv": 20.55
    },
    "marketComparison": "5938–7258",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-kishanganj",
    "origin": "Patna",
    "destination": "Kishanganj",
    "destCity": "Kishanganj",
    "district": "Kishanganj",
    "region": "Bihar districts",
    "distanceKm": 400,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 12,
      "sedan": 12.5,
      "suv": 13.5
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-lakhisarai",
    "origin": "Patna",
    "destination": "Lakhisarai",
    "destCity": "Lakhisarai",
    "district": "Lakhisarai",
    "region": "Bihar districts",
    "distanceKm": 125,
    "hatchback": 2299,
    "sedan": 2499,
    "execSedan": 2749,
    "suv": 2899,
    "luxSuv": 3199,
    "twoWay": {
      "hatchback": 4198,
      "sedan": 4598,
      "execSedan": 5098,
      "suv": 5398,
      "luxSuv": 5998
    },
    "perKm": {
      "hatchback": 18.39,
      "sedan": 19.99,
      "suv": 23.19
    },
    "marketComparison": "4498–5498",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-madhepura",
    "origin": "Patna",
    "destination": "Madhepura",
    "destCity": "Madhepura",
    "district": "Madhepura",
    "region": "Bihar districts",
    "distanceKm": 230,
    "hatchback": 3299,
    "sedan": 3499,
    "execSedan": 3749,
    "suv": 3899,
    "luxSuv": 4199,
    "twoWay": {
      "hatchback": 6198,
      "sedan": 6598,
      "execSedan": 7098,
      "suv": 7398,
      "luxSuv": 7998
    },
    "perKm": {
      "hatchback": 14.34,
      "sedan": 15.21,
      "suv": 16.95
    },
    "marketComparison": "6298–7698",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-madhubani",
    "origin": "Patna",
    "destination": "Madhubani",
    "destCity": "Madhubani",
    "district": "Madhubani",
    "region": "Bihar districts",
    "distanceKm": 185,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 15.13,
      "sedan": 16.21,
      "suv": 18.37
    },
    "marketComparison": "5398–6598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-munger",
    "origin": "Patna",
    "destination": "Munger",
    "destCity": "Munger",
    "district": "Munger",
    "region": "Bihar districts",
    "distanceKm": 190,
    "hatchback": 2699,
    "sedan": 2899,
    "execSedan": 3149,
    "suv": 3299,
    "luxSuv": 3599,
    "twoWay": {
      "hatchback": 4998,
      "sedan": 5398,
      "execSedan": 5898,
      "suv": 6198,
      "luxSuv": 6798
    },
    "perKm": {
      "hatchback": 14.21,
      "sedan": 15.26,
      "suv": 17.36
    },
    "marketComparison": "5218–6378",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-muzaffarpur",
    "origin": "Patna",
    "destination": "Muzaffarpur",
    "destCity": "Muzaffarpur",
    "district": "Muzaffarpur",
    "region": "Bihar districts",
    "distanceKm": 78,
    "hatchback": 1600,
    "sedan": 1800,
    "execSedan": 2050,
    "suv": 2200,
    "luxSuv": 2500,
    "twoWay": {
      "hatchback": 2800,
      "sedan": 3200,
      "execSedan": 3700,
      "suv": 4000,
      "luxSuv": 4600
    },
    "perKm": {
      "hatchback": 20.51,
      "sedan": 23.08,
      "suv": 28.21
    },
    "marketComparison": "3240–3960",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-nalanda",
    "origin": "Patna",
    "destination": "Nalanda (Bihar Sharif)",
    "destCity": "Nalanda",
    "district": "Bihar Sharif",
    "region": "Bihar districts",
    "distanceKm": 95,
    "hatchback": 1799,
    "sedan": 1999,
    "execSedan": 2249,
    "suv": 2399,
    "luxSuv": 2699,
    "twoWay": {
      "hatchback": 3198,
      "sedan": 3598,
      "execSedan": 4098,
      "suv": 4398,
      "luxSuv": 4998
    },
    "perKm": {
      "hatchback": 18.94,
      "sedan": 21.04,
      "suv": 25.25
    },
    "marketComparison": "3598–4398",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-nawada",
    "origin": "Patna",
    "destination": "Nawada",
    "destCity": "Nawada",
    "district": "Nawada",
    "region": "Bihar districts",
    "distanceKm": 110,
    "hatchback": 2399,
    "sedan": 2599,
    "execSedan": 2849,
    "suv": 2999,
    "luxSuv": 3299,
    "twoWay": {
      "hatchback": 4398,
      "sedan": 4798,
      "execSedan": 5298,
      "suv": 5598,
      "luxSuv": 6198
    },
    "perKm": {
      "hatchback": 21.81,
      "sedan": 23.63,
      "suv": 27.26
    },
    "marketComparison": "4678–5718",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-patna",
    "origin": "Patna",
    "destination": "Patna",
    "destCity": "Patna",
    "district": "Patna",
    "region": "Bihar districts",
    "distanceKm": 50,
    "hatchback": 999,
    "sedan": 1199,
    "execSedan": 1449,
    "suv": 1599,
    "luxSuv": 1899,
    "twoWay": {
      "hatchback": 1598,
      "sedan": 1998,
      "execSedan": 2498,
      "suv": 2798,
      "luxSuv": 3398
    },
    "perKm": {
      "hatchback": 19.98,
      "sedan": 23.98,
      "suv": 31.98
    },
    "marketComparison": "2158–2638",
    "note": "Quotation required; per-km rate not calculated",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-purnia",
    "origin": "Patna",
    "destination": "Purnia",
    "destCity": "Purnia",
    "district": "Purnia",
    "region": "Bihar districts",
    "distanceKm": 300,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 12.66,
      "sedan": 13.33,
      "suv": 14.66
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-rohtas",
    "origin": "Patna",
    "destination": "Rohtas (Sasaram)",
    "destCity": "Rohtas",
    "district": "Sasaram",
    "region": "Bihar districts",
    "distanceKm": 152,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 18.41,
      "sedan": 19.73,
      "suv": 22.36
    },
    "marketComparison": "5398–6598",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-saharsa",
    "origin": "Patna",
    "destination": "Saharsa",
    "destCity": "Saharsa",
    "district": "Saharsa",
    "region": "Bihar districts",
    "distanceKm": 220,
    "hatchback": 3299,
    "sedan": 3499,
    "execSedan": 3749,
    "suv": 3899,
    "luxSuv": 4199,
    "twoWay": {
      "hatchback": 6198,
      "sedan": 6598,
      "execSedan": 7098,
      "suv": 7398,
      "luxSuv": 7998
    },
    "perKm": {
      "hatchback": 15,
      "sedan": 15.9,
      "suv": 17.72
    },
    "marketComparison": "6298–7698",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-samastipur",
    "origin": "Patna",
    "destination": "Samastipur",
    "destCity": "Samastipur",
    "district": "Samastipur",
    "region": "Bihar districts",
    "distanceKm": 100,
    "hatchback": 1699,
    "sedan": 1899,
    "execSedan": 2149,
    "suv": 2299,
    "luxSuv": 2599,
    "twoWay": {
      "hatchback": 2998,
      "sedan": 3398,
      "execSedan": 3898,
      "suv": 4198,
      "luxSuv": 4798
    },
    "perKm": {
      "hatchback": 16.99,
      "sedan": 18.99,
      "suv": 22.99
    },
    "marketComparison": "3418–4178",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-saran",
    "origin": "Patna",
    "destination": "Saran (Chapra)",
    "destCity": "Saran",
    "district": "Chapra",
    "region": "Bihar districts",
    "distanceKm": 70,
    "hatchback": 1600,
    "sedan": 1800,
    "execSedan": 2050,
    "suv": 2200,
    "luxSuv": 2500,
    "twoWay": {
      "hatchback": 2800,
      "sedan": 3200,
      "execSedan": 3700,
      "suv": 4000,
      "luxSuv": 4600
    },
    "perKm": {
      "hatchback": 22.86,
      "sedan": 25.71,
      "suv": 31.43
    },
    "marketComparison": "3240–3960",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-sheikhpura",
    "origin": "Patna",
    "destination": "Sheikhpura",
    "destCity": "Sheikhpura",
    "district": "Sheikhpura",
    "region": "Bihar districts",
    "distanceKm": 115,
    "hatchback": 2099,
    "sedan": 2299,
    "execSedan": 2549,
    "suv": 2699,
    "luxSuv": 2999,
    "twoWay": {
      "hatchback": 3798,
      "sedan": 4198,
      "execSedan": 4698,
      "suv": 4998,
      "luxSuv": 5598
    },
    "perKm": {
      "hatchback": 18.25,
      "sedan": 19.99,
      "suv": 23.47
    },
    "marketComparison": "4138–5058",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-sheohar",
    "origin": "Patna",
    "destination": "Sheohar",
    "destCity": "Sheohar",
    "district": "Sheohar",
    "region": "Bihar districts",
    "distanceKm": 125,
    "hatchback": 2299,
    "sedan": 2499,
    "execSedan": 2749,
    "suv": 2899,
    "luxSuv": 3199,
    "twoWay": {
      "hatchback": 4198,
      "sedan": 4598,
      "execSedan": 5098,
      "suv": 5398,
      "luxSuv": 5998
    },
    "perKm": {
      "hatchback": 18.39,
      "sedan": 19.99,
      "suv": 23.19
    },
    "marketComparison": "4498–5498",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-sitamarhi",
    "origin": "Patna",
    "destination": "Sitamarhi",
    "destCity": "Sitamarhi",
    "district": "Sitamarhi",
    "region": "Bihar districts",
    "distanceKm": 135,
    "hatchback": 2299,
    "sedan": 2499,
    "execSedan": 2749,
    "suv": 2899,
    "luxSuv": 3199,
    "twoWay": {
      "hatchback": 4198,
      "sedan": 4598,
      "execSedan": 5098,
      "suv": 5398,
      "luxSuv": 5998
    },
    "perKm": {
      "hatchback": 17.03,
      "sedan": 18.51,
      "suv": 21.47
    },
    "marketComparison": "4498–5498",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-siwan",
    "origin": "Patna",
    "destination": "Siwan",
    "destCity": "Siwan",
    "district": "Siwan",
    "region": "Bihar districts",
    "distanceKm": 135,
    "hatchback": 2299,
    "sedan": 2499,
    "execSedan": 2749,
    "suv": 2899,
    "luxSuv": 3199,
    "twoWay": {
      "hatchback": 4198,
      "sedan": 4598,
      "execSedan": 5098,
      "suv": 5398,
      "luxSuv": 5998
    },
    "perKm": {
      "hatchback": 17.03,
      "sedan": 18.51,
      "suv": 21.47
    },
    "marketComparison": "4498–5498",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-supaul",
    "origin": "Patna",
    "destination": "Supaul",
    "destCity": "Supaul",
    "district": "Supaul",
    "region": "Bihar districts",
    "distanceKm": 225,
    "hatchback": 3499,
    "sedan": 3699,
    "execSedan": 3949,
    "suv": 4099,
    "luxSuv": 4399,
    "twoWay": {
      "hatchback": 6598,
      "sedan": 6998,
      "execSedan": 7498,
      "suv": 7798,
      "luxSuv": 8398
    },
    "perKm": {
      "hatchback": 15.55,
      "sedan": 16.44,
      "suv": 18.22
    },
    "marketComparison": "6658–8138",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.136Z"
  },
  {
    "id": "patna-vaishali",
    "origin": "Patna",
    "destination": "Vaishali (Hajipur)",
    "destCity": "Vaishali",
    "district": "Hajipur",
    "region": "Bihar districts",
    "distanceKm": 25,
    "hatchback": 1299,
    "sedan": 1499,
    "execSedan": 1749,
    "suv": 1899,
    "luxSuv": 2199,
    "twoWay": {
      "hatchback": 2198,
      "sedan": 2598,
      "execSedan": 3098,
      "suv": 3398,
      "luxSuv": 3998
    },
    "perKm": {
      "hatchback": 51.96,
      "sedan": 59.96,
      "suv": 75.96
    },
    "marketComparison": "2698–3298",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-westchamparan",
    "origin": "Patna",
    "destination": "West Champaran (Bettiah)",
    "destCity": "West Champaran",
    "district": "Bettiah",
    "region": "Bihar districts",
    "distanceKm": 240,
    "hatchback": 3099,
    "sedan": 3299,
    "execSedan": 3549,
    "suv": 3699,
    "luxSuv": 3999,
    "twoWay": {
      "hatchback": 5798,
      "sedan": 6198,
      "execSedan": 6698,
      "suv": 6998,
      "luxSuv": 7598
    },
    "perKm": {
      "hatchback": 12.91,
      "sedan": 13.75,
      "suv": 15.41
    },
    "marketComparison": "5938–7258",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-rajgir",
    "origin": "Patna",
    "destination": "Rajgir",
    "destCity": "Rajgir",
    "district": "Rajgir",
    "region": "Bihar tourist destinations",
    "distanceKm": 110,
    "hatchback": 1799,
    "sedan": 1999,
    "execSedan": 2249,
    "suv": 2399,
    "luxSuv": 2699,
    "twoWay": {
      "hatchback": 3198,
      "sedan": 3598,
      "execSedan": 4098,
      "suv": 4398,
      "luxSuv": 4998
    },
    "perKm": {
      "hatchback": 16.35,
      "sedan": 18.17,
      "suv": 21.81
    },
    "marketComparison": "3598–4398",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-bodhgaya",
    "origin": "Patna",
    "destination": "Bodh Gaya",
    "destCity": "Bodh Gaya",
    "district": "Bodh Gaya",
    "region": "Bihar tourist destinations",
    "distanceKm": 135,
    "hatchback": 1999,
    "sedan": 2199,
    "execSedan": 2449,
    "suv": 2599,
    "luxSuv": 2899,
    "twoWay": {
      "hatchback": 3598,
      "sedan": 3998,
      "execSedan": 4498,
      "suv": 4798,
      "luxSuv": 5398
    },
    "perKm": {
      "hatchback": 14.81,
      "sedan": 16.29,
      "suv": 19.25
    },
    "marketComparison": "3958–4838",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-pawapuri",
    "origin": "Patna",
    "destination": "Pawapuri",
    "destCity": "Pawapuri",
    "district": "Pawapuri",
    "region": "Bihar tourist destinations",
    "distanceKm": 90,
    "hatchback": 1599,
    "sedan": 1799,
    "execSedan": 2049,
    "suv": 2199,
    "luxSuv": 2499,
    "twoWay": {
      "hatchback": 2798,
      "sedan": 3198,
      "execSedan": 3698,
      "suv": 3998,
      "luxSuv": 4598
    },
    "perKm": {
      "hatchback": 17.77,
      "sedan": 19.99,
      "suv": 24.43
    },
    "marketComparison": "3238–3958",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-nalandauniversity",
    "origin": "Patna",
    "destination": "Nalanda University",
    "destCity": "Nalanda University",
    "district": "Nalanda University",
    "region": "Bihar tourist destinations",
    "distanceKm": 95,
    "hatchback": 1799,
    "sedan": 1999,
    "execSedan": 2249,
    "suv": 2399,
    "luxSuv": 2699,
    "twoWay": {
      "hatchback": 3198,
      "sedan": 3598,
      "execSedan": 4098,
      "suv": 4398,
      "luxSuv": 4998
    },
    "perKm": {
      "hatchback": 18.94,
      "sedan": 21.04,
      "suv": 25.25
    },
    "marketComparison": "3598–4398",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-vaishalistupa",
    "origin": "Patna",
    "destination": "Vaishali Stupa",
    "destCity": "Vaishali Stupa",
    "district": "Vaishali Stupa",
    "region": "Bihar tourist destinations",
    "distanceKm": 56,
    "hatchback": 1299,
    "sedan": 1499,
    "execSedan": 1749,
    "suv": 1899,
    "luxSuv": 2199,
    "twoWay": {
      "hatchback": 2198,
      "sedan": 2598,
      "execSedan": 3098,
      "suv": 3398,
      "luxSuv": 3998
    },
    "perKm": {
      "hatchback": 23.2,
      "sedan": 26.77,
      "suv": 33.91
    },
    "marketComparison": "2698–3298",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-kesariastupa",
    "origin": "Patna",
    "destination": "Kesaria Stupa",
    "destCity": "Kesaria Stupa",
    "district": "Kesaria Stupa",
    "region": "Bihar tourist destinations",
    "distanceKm": 125,
    "hatchback": 2599,
    "sedan": 2799,
    "execSedan": 3049,
    "suv": 3199,
    "luxSuv": 3499,
    "twoWay": {
      "hatchback": 4798,
      "sedan": 5198,
      "execSedan": 5698,
      "suv": 5998,
      "luxSuv": 6598
    },
    "perKm": {
      "hatchback": 20.79,
      "sedan": 22.39,
      "suv": 25.59
    },
    "marketComparison": "5038–6158",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-valmikitigerreserve",
    "origin": "Patna",
    "destination": "Valmiki Tiger Reserve",
    "destCity": "Valmiki Tiger Reserve",
    "district": "Valmiki Tiger Reserve",
    "region": "Bihar tourist destinations",
    "distanceKm": 310,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 12.25,
      "sedan": 12.9,
      "suv": 14.19
    },
    "marketComparison": "7198–8798",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-kakolatwaterfall",
    "origin": "Patna",
    "destination": "Kakolat Waterfall",
    "destCity": "Kakolat Waterfall",
    "district": "Kakolat Waterfall",
    "region": "Bihar tourist destinations",
    "distanceKm": 150,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 18.66,
      "sedan": 19.99,
      "suv": 22.66
    },
    "marketComparison": "5398–6598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-barabarcaves",
    "origin": "Patna",
    "destination": "Barabar Caves",
    "destCity": "Barabar Caves",
    "district": "Barabar Caves",
    "region": "Bihar tourist destinations",
    "distanceKm": 100,
    "hatchback": 1799,
    "sedan": 1999,
    "execSedan": 2249,
    "suv": 2399,
    "luxSuv": 2699,
    "twoWay": {
      "hatchback": 3198,
      "sedan": 3598,
      "execSedan": 4098,
      "suv": 4398,
      "luxSuv": 4998
    },
    "perKm": {
      "hatchback": 17.99,
      "sedan": 19.99,
      "suv": 23.99
    },
    "marketComparison": "3598–4398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-vikramshilauniversity",
    "origin": "Patna",
    "destination": "Vikramshila University",
    "destCity": "Vikramshila University",
    "district": "Vikramshila University",
    "region": "Bihar tourist destinations",
    "distanceKm": 260,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 14.61,
      "sedan": 15.38,
      "suv": 16.92
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-simultala",
    "origin": "Patna",
    "destination": "Simultala",
    "destCity": "Simultala",
    "district": "Simultala",
    "region": "Bihar tourist destinations",
    "distanceKm": 220,
    "hatchback": 3099,
    "sedan": 3299,
    "execSedan": 3549,
    "suv": 3699,
    "luxSuv": 3999,
    "twoWay": {
      "hatchback": 5798,
      "sedan": 6198,
      "execSedan": 6698,
      "suv": 6998,
      "luxSuv": 7598
    },
    "perKm": {
      "hatchback": 14.09,
      "sedan": 15,
      "suv": 16.81
    },
    "marketComparison": "5938–7258",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-sonepur",
    "origin": "Patna",
    "destination": "Sonepur",
    "destCity": "Sonepur",
    "district": "Sonepur",
    "region": "Bihar tourist destinations",
    "distanceKm": 30,
    "hatchback": 1299,
    "sedan": 1499,
    "execSedan": 1749,
    "suv": 1899,
    "luxSuv": 2199,
    "twoWay": {
      "hatchback": 2198,
      "sedan": 2598,
      "execSedan": 3098,
      "suv": 3398,
      "luxSuv": 3998
    },
    "perKm": {
      "hatchback": 43.3,
      "sedan": 49.97,
      "suv": 63.3
    },
    "marketComparison": "2698–3298",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-manersharif",
    "origin": "Patna",
    "destination": "Maner Sharif",
    "destCity": "Maner Sharif",
    "district": "Maner Sharif",
    "region": "Bihar tourist destinations",
    "distanceKm": 30,
    "hatchback": 999,
    "sedan": 1199,
    "execSedan": 1449,
    "suv": 1599,
    "luxSuv": 1899,
    "twoWay": {
      "hatchback": 1598,
      "sedan": 1998,
      "execSedan": 2498,
      "suv": 2798,
      "luxSuv": 3398
    },
    "perKm": {
      "hatchback": 33.3,
      "sedan": 39.97,
      "suv": 53.3
    },
    "marketComparison": "2158–2638",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-mundeshwaritemple",
    "origin": "Patna",
    "destination": "Mundeshwari Temple",
    "destCity": "Mundeshwari Temple",
    "district": "Mundeshwari Temple",
    "region": "Bihar tourist destinations",
    "distanceKm": 200,
    "hatchback": 2799,
    "sedan": 2999,
    "execSedan": 3249,
    "suv": 3399,
    "luxSuv": 3699,
    "twoWay": {
      "hatchback": 5198,
      "sedan": 5598,
      "execSedan": 6098,
      "suv": 6398,
      "luxSuv": 6998
    },
    "perKm": {
      "hatchback": 13.99,
      "sedan": 14.99,
      "suv": 17
    },
    "marketComparison": "5398–6598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-dehrionsone",
    "origin": "Patna",
    "destination": "Dehri-on-Sone",
    "destCity": "Dehri-on-Sone",
    "district": "Dehri-on-Sone",
    "region": "Bihar tourist destinations",
    "distanceKm": 145,
    "hatchback": 2599,
    "sedan": 2799,
    "execSedan": 3049,
    "suv": 3199,
    "luxSuv": 3499,
    "twoWay": {
      "hatchback": 4798,
      "sedan": 5198,
      "execSedan": 5698,
      "suv": 5998,
      "luxSuv": 6598
    },
    "perKm": {
      "hatchback": 17.92,
      "sedan": 19.3,
      "suv": 22.06
    },
    "marketComparison": "5038–6158",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-patnasahibgurudwara",
    "origin": "Patna",
    "destination": "Patna Sahib Gurudwara",
    "destCity": "Patna Sahib Gurudwara",
    "district": "Patna Sahib Gurudwara",
    "region": "Bihar tourist destinations",
    "distanceKm": 10,
    "hatchback": 999,
    "sedan": 1199,
    "execSedan": 1449,
    "suv": 1599,
    "luxSuv": 1899,
    "twoWay": {
      "hatchback": 1598,
      "sedan": 1998,
      "execSedan": 2498,
      "suv": 2798,
      "luxSuv": 3398
    },
    "perKm": {
      "hatchback": 99.9,
      "sedan": 119.9,
      "suv": 159.9
    },
    "marketComparison": "2158–2638",
    "note": "Quotation required; per-km rate not calculated",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-varanasi",
    "origin": "Patna",
    "destination": "Varanasi",
    "destCity": "Varanasi",
    "district": "Varanasi",
    "region": "Uttar Pradesh",
    "distanceKm": 246,
    "hatchback": 3299,
    "sedan": 3499,
    "execSedan": 3749,
    "suv": 3899,
    "luxSuv": 4199,
    "twoWay": {
      "hatchback": 6198,
      "sedan": 6598,
      "execSedan": 7098,
      "suv": 7398,
      "luxSuv": 7998
    },
    "perKm": {
      "hatchback": 13.41,
      "sedan": 14.22,
      "suv": 15.85
    },
    "marketComparison": "6298–7698",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-sarnath",
    "origin": "Patna",
    "destination": "Sarnath",
    "destCity": "Sarnath",
    "district": "Sarnath",
    "region": "Uttar Pradesh",
    "distanceKm": 260,
    "hatchback": 3299,
    "sedan": 3499,
    "execSedan": 3749,
    "suv": 3899,
    "luxSuv": 4199,
    "twoWay": {
      "hatchback": 6198,
      "sedan": 6598,
      "execSedan": 7098,
      "suv": 7398,
      "luxSuv": 7998
    },
    "perKm": {
      "hatchback": 12.69,
      "sedan": 13.46,
      "suv": 15
    },
    "marketComparison": "6298–7698",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-gorakhpur",
    "origin": "Patna",
    "destination": "Gorakhpur",
    "destCity": "Gorakhpur",
    "district": "Gorakhpur",
    "region": "Uttar Pradesh",
    "distanceKm": 290,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 13.1,
      "sedan": 13.79,
      "suv": 15.17
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-ayodhya",
    "origin": "Patna",
    "destination": "Ayodhya",
    "destCity": "Ayodhya",
    "district": "Ayodhya",
    "region": "Uttar Pradesh",
    "distanceKm": 430,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 11.16,
      "sedan": 11.63,
      "suv": 12.56
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-prayagraj",
    "origin": "Patna",
    "destination": "Prayagraj",
    "destCity": "Prayagraj",
    "district": "Prayagraj",
    "region": "Uttar Pradesh",
    "distanceKm": 370,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 12.97,
      "sedan": 13.51,
      "suv": 14.59
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-lucknow",
    "origin": "Patna",
    "destination": "Lucknow",
    "destCity": "Lucknow",
    "district": "Lucknow",
    "region": "Uttar Pradesh",
    "distanceKm": 540,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 12.59,
      "sedan": 12.96,
      "suv": 13.7
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-kanpur",
    "origin": "Patna",
    "destination": "Kanpur",
    "destCity": "Kanpur",
    "district": "Kanpur",
    "region": "Uttar Pradesh",
    "distanceKm": 620,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 14.19,
      "sedan": 14.51,
      "suv": 15.16
    },
    "marketComparison": "16198–19798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-agra",
    "origin": "Patna",
    "destination": "Agra",
    "destCity": "Agra",
    "district": "Agra",
    "region": "Uttar Pradesh",
    "distanceKm": 900,
    "hatchback": 11799,
    "sedan": 11999,
    "execSedan": 12249,
    "suv": 12399,
    "luxSuv": 12699,
    "twoWay": {
      "hatchback": 23198,
      "sedan": 23598,
      "execSedan": 24098,
      "suv": 24398,
      "luxSuv": 24998
    },
    "perKm": {
      "hatchback": 13.11,
      "sedan": 13.33,
      "suv": 13.78
    },
    "marketComparison": "21598–26398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-mathura",
    "origin": "Patna",
    "destination": "Mathura",
    "destCity": "Mathura",
    "district": "Mathura",
    "region": "Uttar Pradesh",
    "distanceKm": 1000,
    "hatchback": 12799,
    "sedan": 12999,
    "execSedan": 13249,
    "suv": 13399,
    "luxSuv": 13699,
    "twoWay": {
      "hatchback": 25198,
      "sedan": 25598,
      "execSedan": 26098,
      "suv": 26398,
      "luxSuv": 26998
    },
    "perKm": {
      "hatchback": 12.8,
      "sedan": 13,
      "suv": 13.4
    },
    "marketComparison": "23398–28598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-vrindavan",
    "origin": "Patna",
    "destination": "Vrindavan",
    "destCity": "Vrindavan",
    "district": "Vrindavan",
    "region": "Uttar Pradesh",
    "distanceKm": 1000,
    "hatchback": 12799,
    "sedan": 12999,
    "execSedan": 13249,
    "suv": 13399,
    "luxSuv": 13699,
    "twoWay": {
      "hatchback": 25198,
      "sedan": 25598,
      "execSedan": 26098,
      "suv": 26398,
      "luxSuv": 26998
    },
    "perKm": {
      "hatchback": 12.8,
      "sedan": 13,
      "suv": 13.4
    },
    "marketComparison": "23398–28598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-chitrakoot",
    "origin": "Patna",
    "destination": "Chitrakoot",
    "destCity": "Chitrakoot",
    "district": "Chitrakoot",
    "region": "Uttar Pradesh",
    "distanceKm": 450,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 15.11,
      "sedan": 15.55,
      "suv": 16.44
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-vindhyachal",
    "origin": "Patna",
    "destination": "Vindhyachal",
    "destCity": "Vindhyachal",
    "district": "Vindhyachal",
    "region": "Uttar Pradesh",
    "distanceKm": 300,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 12.66,
      "sedan": 13.33,
      "suv": 14.66
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-kushinagar",
    "origin": "Patna",
    "destination": "Kushinagar",
    "destCity": "Kushinagar",
    "district": "Kushinagar",
    "region": "Uttar Pradesh",
    "distanceKm": 300,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 16,
      "sedan": 16.66,
      "suv": 18
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-shravasti",
    "origin": "Patna",
    "destination": "Shravasti",
    "destCity": "Shravasti",
    "district": "Shravasti",
    "region": "Uttar Pradesh",
    "distanceKm": 520,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 13.07,
      "sedan": 13.46,
      "suv": 14.23
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-noida",
    "origin": "Patna",
    "destination": "Noida",
    "destCity": "Noida",
    "district": "Noida",
    "region": "Uttar Pradesh",
    "distanceKm": 1000,
    "hatchback": 11799,
    "sedan": 11999,
    "execSedan": 12249,
    "suv": 12399,
    "luxSuv": 12699,
    "twoWay": {
      "hatchback": 23198,
      "sedan": 23598,
      "execSedan": 24098,
      "suv": 24398,
      "luxSuv": 24998
    },
    "perKm": {
      "hatchback": 11.8,
      "sedan": 12,
      "suv": 12.4
    },
    "marketComparison": "21598–26398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-ranchi",
    "origin": "Patna",
    "destination": "Ranchi",
    "destCity": "Ranchi",
    "district": "Ranchi",
    "region": "Jharkhand",
    "distanceKm": 335,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 14.33,
      "sedan": 14.92,
      "suv": 16.12
    },
    "marketComparison": "8998–10998",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-deoghar",
    "origin": "Patna",
    "destination": "Deoghar",
    "destCity": "Deoghar",
    "district": "Deoghar",
    "region": "Jharkhand",
    "distanceKm": 270,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 14.07,
      "sedan": 14.81,
      "suv": 16.29
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.137Z"
  },
  {
    "id": "patna-dhanbad",
    "origin": "Patna",
    "destination": "Dhanbad",
    "destCity": "Dhanbad",
    "district": "Dhanbad",
    "region": "Jharkhand",
    "distanceKm": 300,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 12.66,
      "sedan": 13.33,
      "suv": 14.66
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-bokarosteelcity",
    "origin": "Patna",
    "destination": "Bokaro Steel City",
    "destCity": "Bokaro Steel City",
    "district": "Bokaro Steel City",
    "region": "Jharkhand",
    "distanceKm": 320,
    "hatchback": 4299,
    "sedan": 4499,
    "execSedan": 4749,
    "suv": 4899,
    "luxSuv": 5199,
    "twoWay": {
      "hatchback": 8198,
      "sedan": 8598,
      "execSedan": 9098,
      "suv": 9398,
      "luxSuv": 9998
    },
    "perKm": {
      "hatchback": 13.43,
      "sedan": 14.06,
      "suv": 15.31
    },
    "marketComparison": "8098–9898",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-jamshedpur",
    "origin": "Patna",
    "destination": "Jamshedpur",
    "destCity": "Jamshedpur",
    "district": "Jamshedpur",
    "region": "Jharkhand",
    "distanceKm": 440,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 15.45,
      "sedan": 15.91,
      "suv": 16.82
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-hazaribagh",
    "origin": "Patna",
    "destination": "Hazaribagh",
    "destCity": "Hazaribagh",
    "district": "Hazaribagh",
    "region": "Jharkhand",
    "distanceKm": 260,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 14.61,
      "sedan": 15.38,
      "suv": 16.92
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-giridih",
    "origin": "Patna",
    "destination": "Giridih",
    "destCity": "Giridih",
    "district": "Giridih",
    "region": "Jharkhand",
    "distanceKm": 260,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 14.61,
      "sedan": 15.38,
      "suv": 16.92
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-parasnathhills",
    "origin": "Patna",
    "destination": "Parasnath Hills",
    "destCity": "Parasnath Hills",
    "district": "Parasnath Hills",
    "region": "Jharkhand",
    "distanceKm": 280,
    "hatchback": 4299,
    "sedan": 4499,
    "execSedan": 4749,
    "suv": 4899,
    "luxSuv": 5199,
    "twoWay": {
      "hatchback": 8198,
      "sedan": 8598,
      "execSedan": 9098,
      "suv": 9398,
      "luxSuv": 9998
    },
    "perKm": {
      "hatchback": 15.35,
      "sedan": 16.07,
      "suv": 17.5
    },
    "marketComparison": "8098–9898",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-netarhat",
    "origin": "Patna",
    "destination": "Netarhat",
    "destCity": "Netarhat",
    "district": "Netarhat",
    "region": "Jharkhand",
    "distanceKm": 430,
    "hatchback": 7799,
    "sedan": 7999,
    "execSedan": 8249,
    "suv": 8399,
    "luxSuv": 8699,
    "twoWay": {
      "hatchback": 15198,
      "sedan": 15598,
      "execSedan": 16098,
      "suv": 16398,
      "luxSuv": 16998
    },
    "perKm": {
      "hatchback": 18.14,
      "sedan": 18.6,
      "suv": 19.53
    },
    "marketComparison": "14398–17598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-betlanationalpark",
    "origin": "Patna",
    "destination": "Betla National Park",
    "destCity": "Betla National Park",
    "district": "Betla National Park",
    "region": "Jharkhand",
    "distanceKm": 400,
    "hatchback": 7799,
    "sedan": 7999,
    "execSedan": 8249,
    "suv": 8399,
    "luxSuv": 8699,
    "twoWay": {
      "hatchback": 15198,
      "sedan": 15598,
      "execSedan": 16098,
      "suv": 16398,
      "luxSuv": 16998
    },
    "perKm": {
      "hatchback": 19.5,
      "sedan": 20,
      "suv": 21
    },
    "marketComparison": "14398–17598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-dumka",
    "origin": "Patna",
    "destination": "Dumka",
    "destCity": "Dumka",
    "district": "Dumka",
    "region": "Jharkhand",
    "distanceKm": 300,
    "hatchback": 4299,
    "sedan": 4499,
    "execSedan": 4749,
    "suv": 4899,
    "luxSuv": 5199,
    "twoWay": {
      "hatchback": 8198,
      "sedan": 8598,
      "execSedan": 9098,
      "suv": 9398,
      "luxSuv": 9998
    },
    "perKm": {
      "hatchback": 14.33,
      "sedan": 15,
      "suv": 16.33
    },
    "marketComparison": "8098–9898",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-ramgarh",
    "origin": "Patna",
    "destination": "Ramgarh",
    "destCity": "Ramgarh",
    "district": "Ramgarh",
    "region": "Jharkhand",
    "distanceKm": 300,
    "hatchback": 4299,
    "sedan": 4499,
    "execSedan": 4749,
    "suv": 4899,
    "luxSuv": 5199,
    "twoWay": {
      "hatchback": 8198,
      "sedan": 8598,
      "execSedan": 9098,
      "suv": 9398,
      "luxSuv": 9998
    },
    "perKm": {
      "hatchback": 14.33,
      "sedan": 15,
      "suv": 16.33
    },
    "marketComparison": "8098–9898",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-patratuvalley",
    "origin": "Patna",
    "destination": "Patratu Valley",
    "destCity": "Patratu Valley",
    "district": "Patratu Valley",
    "region": "Jharkhand",
    "distanceKm": 320,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 15,
      "sedan": 15.62,
      "suv": 16.87
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-baidyanathdham",
    "origin": "Patna",
    "destination": "Baidyanath Dham",
    "destCity": "Baidyanath Dham",
    "district": "Baidyanath Dham",
    "region": "Jharkhand",
    "distanceKm": 270,
    "hatchback": 3799,
    "sedan": 3999,
    "execSedan": 4249,
    "suv": 4399,
    "luxSuv": 4699,
    "twoWay": {
      "hatchback": 7198,
      "sedan": 7598,
      "execSedan": 8098,
      "suv": 8398,
      "luxSuv": 8998
    },
    "perKm": {
      "hatchback": 14.07,
      "sedan": 14.81,
      "suv": 16.29
    },
    "marketComparison": "7198–8798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-hundrufalls",
    "origin": "Patna",
    "destination": "Hundru Falls",
    "destCity": "Hundru Falls",
    "district": "Hundru Falls",
    "region": "Jharkhand",
    "distanceKm": 360,
    "hatchback": 4799,
    "sedan": 4999,
    "execSedan": 5249,
    "suv": 5399,
    "luxSuv": 5699,
    "twoWay": {
      "hatchback": 9198,
      "sedan": 9598,
      "execSedan": 10098,
      "suv": 10398,
      "luxSuv": 10998
    },
    "perKm": {
      "hatchback": 13.33,
      "sedan": 13.89,
      "suv": 15
    },
    "marketComparison": "8998–10998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-kolkata",
    "origin": "Patna",
    "destination": "Kolkata",
    "destCity": "Kolkata",
    "district": "Kolkata",
    "region": "West Bengal",
    "distanceKm": 653,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 13.47,
      "sedan": 13.78,
      "suv": 14.39
    },
    "marketComparison": "16198–19798",
    "note": "Source-checked reference; route may vary",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-howrah",
    "origin": "Patna",
    "destination": "Howrah",
    "destCity": "Howrah",
    "district": "Howrah",
    "region": "West Bengal",
    "distanceKm": 658,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 13.37,
      "sedan": 13.68,
      "suv": 14.28
    },
    "marketComparison": "16198–19798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-durgapur",
    "origin": "Patna",
    "destination": "Durgapur",
    "destCity": "Durgapur",
    "district": "Durgapur",
    "region": "West Bengal",
    "distanceKm": 400,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 17,
      "sedan": 17.5,
      "suv": 18.5
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-asansol",
    "origin": "Patna",
    "destination": "Asansol",
    "destCity": "Asansol",
    "district": "Asansol",
    "region": "West Bengal",
    "distanceKm": 330,
    "hatchback": 5799,
    "sedan": 5999,
    "execSedan": 6249,
    "suv": 6399,
    "luxSuv": 6699,
    "twoWay": {
      "hatchback": 11198,
      "sedan": 11598,
      "execSedan": 12098,
      "suv": 12398,
      "luxSuv": 12998
    },
    "perKm": {
      "hatchback": 17.57,
      "sedan": 18.18,
      "suv": 19.39
    },
    "marketComparison": "10798–13198",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-siliguri",
    "origin": "Patna",
    "destination": "Siliguri",
    "destCity": "Siliguri",
    "district": "Siliguri",
    "region": "West Bengal",
    "distanceKm": 560,
    "hatchback": 11799,
    "sedan": 11999,
    "execSedan": 12249,
    "suv": 12399,
    "luxSuv": 12699,
    "twoWay": {
      "hatchback": 23198,
      "sedan": 23598,
      "execSedan": 24098,
      "suv": 24398,
      "luxSuv": 24998
    },
    "perKm": {
      "hatchback": 21.07,
      "sedan": 21.43,
      "suv": 22.14
    },
    "marketComparison": "21598–26398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-darjeeling",
    "origin": "Patna",
    "destination": "Darjeeling",
    "destCity": "Darjeeling",
    "district": "Darjeeling",
    "region": "West Bengal",
    "distanceKm": 650,
    "hatchback": 14799,
    "sedan": 14999,
    "execSedan": 15249,
    "suv": 15399,
    "luxSuv": 15699,
    "twoWay": {
      "hatchback": 29198,
      "sedan": 29598,
      "execSedan": 30098,
      "suv": 30398,
      "luxSuv": 30998
    },
    "perKm": {
      "hatchback": 22.77,
      "sedan": 23.08,
      "suv": 23.69
    },
    "marketComparison": "26998–32998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-digha",
    "origin": "Patna",
    "destination": "Digha",
    "destCity": "Digha",
    "district": "Digha",
    "region": "West Bengal",
    "distanceKm": 650,
    "hatchback": 11799,
    "sedan": 11999,
    "execSedan": 12249,
    "suv": 12399,
    "luxSuv": 12699,
    "twoWay": {
      "hatchback": 23198,
      "sedan": 23598,
      "execSedan": 24098,
      "suv": 24398,
      "luxSuv": 24998
    },
    "perKm": {
      "hatchback": 18.15,
      "sedan": 18.46,
      "suv": 19.08
    },
    "marketComparison": "21598–26398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-shantiniketan",
    "origin": "Patna",
    "destination": "Shantiniketan",
    "destCity": "Shantiniketan",
    "district": "Shantiniketan",
    "region": "West Bengal",
    "distanceKm": 500,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 17.6,
      "sedan": 18,
      "suv": 18.8
    },
    "marketComparison": "16198–19798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-malda",
    "origin": "Patna",
    "destination": "Malda",
    "destCity": "Malda",
    "district": "Malda",
    "region": "West Bengal",
    "distanceKm": 350,
    "hatchback": 7799,
    "sedan": 7999,
    "execSedan": 8249,
    "suv": 8399,
    "luxSuv": 8699,
    "twoWay": {
      "hatchback": 15198,
      "sedan": 15598,
      "execSedan": 16098,
      "suv": 16398,
      "luxSuv": 16998
    },
    "perKm": {
      "hatchback": 22.28,
      "sedan": 22.85,
      "suv": 24
    },
    "marketComparison": "14398–17598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-murshidabad",
    "origin": "Patna",
    "destination": "Murshidabad",
    "destCity": "Murshidabad",
    "district": "Murshidabad",
    "region": "West Bengal",
    "distanceKm": 400,
    "hatchback": 7799,
    "sedan": 7999,
    "execSedan": 8249,
    "suv": 8399,
    "luxSuv": 8699,
    "twoWay": {
      "hatchback": 15198,
      "sedan": 15598,
      "execSedan": 16098,
      "suv": 16398,
      "luxSuv": 16998
    },
    "perKm": {
      "hatchback": 19.5,
      "sedan": 20,
      "suv": 21
    },
    "marketComparison": "14398–17598",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-tarapith",
    "origin": "Patna",
    "destination": "Tarapith",
    "destCity": "Tarapith",
    "district": "Tarapith",
    "region": "West Bengal",
    "distanceKm": 350,
    "hatchback": 6799,
    "sedan": 6999,
    "execSedan": 7249,
    "suv": 7399,
    "luxSuv": 7699,
    "twoWay": {
      "hatchback": 13198,
      "sedan": 13598,
      "execSedan": 14098,
      "suv": 14398,
      "luxSuv": 14998
    },
    "perKm": {
      "hatchback": 19.43,
      "sedan": 20,
      "suv": 21.14
    },
    "marketComparison": "12598–15398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-bishnupur",
    "origin": "Patna",
    "destination": "Bishnupur",
    "destCity": "Bishnupur",
    "district": "Bishnupur",
    "region": "West Bengal",
    "distanceKm": 500,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 17.6,
      "sedan": 18,
      "suv": 18.8
    },
    "marketComparison": "16198–19798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-mayapur",
    "origin": "Patna",
    "destination": "Mayapur",
    "destCity": "Mayapur",
    "district": "Mayapur",
    "region": "West Bengal",
    "distanceKm": 500,
    "hatchback": 8799,
    "sedan": 8999,
    "execSedan": 9249,
    "suv": 9399,
    "luxSuv": 9699,
    "twoWay": {
      "hatchback": 17198,
      "sedan": 17598,
      "execSedan": 18098,
      "suv": 18398,
      "luxSuv": 18998
    },
    "perKm": {
      "hatchback": 17.6,
      "sedan": 18,
      "suv": 18.8
    },
    "marketComparison": "16198–19798",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-kalimpong",
    "origin": "Patna",
    "destination": "Kalimpong",
    "destCity": "Kalimpong",
    "district": "Kalimpong",
    "region": "West Bengal",
    "distanceKm": 650,
    "hatchback": 14799,
    "sedan": 14999,
    "execSedan": 15249,
    "suv": 15399,
    "luxSuv": 15699,
    "twoWay": {
      "hatchback": 29198,
      "sedan": 29598,
      "execSedan": 30098,
      "suv": 30398,
      "luxSuv": 30998
    },
    "perKm": {
      "hatchback": 22.77,
      "sedan": 23.08,
      "suv": 23.69
    },
    "marketComparison": "26998–32998",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  },
  {
    "id": "patna-newjalpaiguri",
    "origin": "Patna",
    "destination": "New Jalpaiguri",
    "destCity": "New Jalpaiguri",
    "district": "New Jalpaiguri",
    "region": "West Bengal",
    "distanceKm": 560,
    "hatchback": 11799,
    "sedan": 11999,
    "execSedan": 12249,
    "suv": 12399,
    "luxSuv": 12699,
    "twoWay": {
      "hatchback": 23198,
      "sedan": 23598,
      "execSedan": 24098,
      "suv": 24398,
      "luxSuv": 24998
    },
    "perKm": {
      "hatchback": 21.07,
      "sedan": 21.43,
      "suv": 22.14
    },
    "marketComparison": "21598–26398",
    "note": "Planning estimate; verify with live route planner",
    "active": true,
    "updatedAt": "2026-10-19T07:27:58.138Z"
  }
];

function findPatnaRouteFare(origin, dest) {
  if (!origin && !dest) return null;
  const o = String(origin || "").toLowerCase().trim();
  const d = String(dest || "").toLowerCase().trim();

  let targetStr = "";
  if (o.includes("patna") || o.includes("pnbe") || o === "patna" || !origin) {
    targetStr = d;
  } else if (d.includes("patna") || d.includes("pnbe") || d === "patna" || !dest) {
    targetStr = o;
  } else {
    return null;
  }

  const cleanTarget = targetStr.replace(/\(.*?\)/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
  if (!cleanTarget) return null;

  const list = (typeof window !== "undefined" && Array.isArray(window.OTB_PATNA_FARES) && window.OTB_PATNA_FARES.length > 0)
    ? window.OTB_PATNA_FARES
    : OTB_PATNA_FARES;

  return list.find(r => {
    if (r.active === false) return false;
    const destName = (r.destination || "").toLowerCase();
    const cleanDest = destName.replace(/\(.*?\)/g, "").replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
    if (cleanDest === cleanTarget || destName.includes(cleanTarget) || cleanTarget.includes(cleanDest)) return true;
    if (r.destCity && (r.destCity.toLowerCase() === cleanTarget || cleanTarget.includes(r.destCity.toLowerCase()))) return true;
    if (r.district && (r.district.toLowerCase() === cleanTarget || cleanTarget.includes(r.district.toLowerCase()))) return true;
    return false;
  }) || null;
}

// Export to window
if (typeof window !== "undefined") {
  window.OTB_CITIES = OTB_CITIES;
  window.BIHAR_DISTRICTS = BIHAR_DISTRICTS;
  window.OTB_POPULAR_ROUTES = OTB_POPULAR_ROUTES;
  window.OTB_FLEET = OTB_FLEET;
  window.OTB_LOCAL_PACKAGES = OTB_LOCAL_PACKAGES;
  window.OTB_FRIENDS_REVIEWS = OTB_FRIENDS_REVIEWS;
  window.OTB_WHY_CHOOSE_US = OTB_WHY_CHOOSE_US;
  window.OTB_FAQS = OTB_FAQS;
  window.OTB_CORPORATE_DATA = OTB_CORPORATE_DATA;
  window.OTB_PATNA_FARES = OTB_PATNA_FARES;
  window.findPatnaRouteFare = findPatnaRouteFare;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    OTB_CITIES,
    BIHAR_DISTRICTS,
    OTB_POPULAR_ROUTES,
    OTB_FLEET,
    OTB_LOCAL_PACKAGES,
    OTB_FRIENDS_REVIEWS,
    OTB_WHY_CHOOSE_US,
    OTB_FAQS,
    OTB_CORPORATE_DATA,
    OTB_PATNA_FARES,
    findPatnaRouteFare
  };
}

