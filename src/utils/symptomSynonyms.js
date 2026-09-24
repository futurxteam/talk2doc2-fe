/**
 * Symptom & Body Area Synonym Dictionary
 * Maps natural, colloquial expressions (including Indian English) to structured triage keys
 */

export const SYMPTOM_SYNONYMS = {
  // ── Head & Neck ──────────────────────────────────────────────────────────
  headache: {
    bodyArea: 'head_and_neck', symptomId: 'headache',
    keywords: ['headache', 'head ache', 'migraine', 'throbbing head', 'temple pain',
      'forehead pain', 'head pressure', 'cranial pain', 'head hurts', 'hemicrania',
      'pounding head', 'head is pounding', 'head spinning', 'head heavy', 'heavy head', 'head pain', 'brow pain',
      'thalavedana', 'thala vedana', 'thala idikyunnu', 'thala peruppu', 'തലവേദന', 'തലപ്പെരുപ്പ്']
  },
  dizziness: {
    bodyArea: 'head_and_neck', symptomId: 'dizziness',
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'lightheaded', 'light headed',
      'loss of balance', 'unsteady', 'woozy', 'giddy', 'equilibrium', 'room spinning',
      'feel like falling', 'balance problem', 'thalakarakkam', 'thala karakkam', 'തലകറക്കം']
  },
  eye_pain: {
    bodyArea: 'head_and_neck', symptomId: 'eye_pain',
    keywords: ['eye pain', 'eyes hurt', 'blurry vision', 'blurred vision', 'vision loss',
      'red eye', 'pink eye', 'eye strain', 'ocular pain', 'double vision', 'seeing spots',
      'eyes watering', 'sore eye', 'kannu vedana', 'kannil vedana', 'കണ്ണുവേദന']
  },
  blurred_vision: {
    bodyArea: 'head_and_neck', symptomId: 'blurred_vision',
    keywords: ['blurred vision', 'blurry vision', 'double vision', 'fuzzy vision',
      'cant see clearly', 'visual disturbance', 'vision changes', 'vision problems', 'blind spot',
      'kazhcha kuravu', 'kazhcha mangal', 'കണ്ണുകാണാൻ ബുദ്ധിമുട്ട്']
  },
  red_eye: {
    bodyArea: 'head_and_neck', symptomId: 'red_eye',
    keywords: ['red eye', 'pink eye', 'bloodshot eye', 'conjunctivitis', 'sore red eye',
      'irritated eye', 'eye discharge', 'sticky eye', 'kannu chuvakkal', 'kannu chuvannu', 'കണ്ണ് ചുവക്കൽ']
  },
  ear_pain: {
    bodyArea: 'head_and_neck', symptomId: 'ear_pain',
    keywords: ['ear pain', 'earache', 'ear ache', 'hearing loss', 'ringing ear',
      'tinnitus', 'blocked ear', 'ear infection', 'ears plugged', 'can\'t hear well',
      'ear discharge', 'ear ringing', 'chevi vedana', 'chevi kuthal', 'ചെവിവേദന']
  },
  tinnitus: {
    bodyArea: 'head_and_neck', symptomId: 'tinnitus',
    keywords: ['tinnitus', 'ringing in ear', 'buzzing in ear', 'ear ringing', 'ear buzzing',
      'hissing sound in ear', 'ear noise', 'whooshing ear', 'chevi muzhakkam', 'ചെവി മുഴക്കം']
  },
  sore_throat: {
    bodyArea: 'head_and_neck', symptomId: 'sore_throat',
    keywords: ['sore throat', 'throat hurts', 'pain swallowing',
      'tonsil', 'tonsillitis', 'strep', 'scratchy throat', 'hoarse voice', 'pharyngitis',
      'throat pain', 'throat inflammation', 'swollen throat', 'thonda vedana', 'thondavedana', 'തൊണ്ടവേദന']
  },
  hoarseness: {
    bodyArea: 'head_and_neck', symptomId: 'hoarseness',
    keywords: ['hoarse', 'hoarseness', 'voice change', 'lost voice', 'voice loss', 'raspy voice',
      'voice gone', 'voice problem', 'can\'t speak properly', 'speaking difficulty', 'shabdam maral', 'ശബ്ദം അടയുക']
  },
  neck_pain: {
    bodyArea: 'head_and_neck', symptomId: 'neck_pain',
    keywords: ['neck pain', 'stiff neck', 'neck stiffness', 'cervical pain',
      'whiplash', 'wry neck', 'crick in neck', 'neck tight', 'neck sore', 'nape pain',
      'kazhuthu vedana', 'kazhuthu pidutham', 'കഴുത്തുവേദന']
  },
  blocked_nose: {
    bodyArea: 'head_and_neck', symptomId: 'blocked_nose',
    keywords: ['blocked nose', 'stuffy nose', 'nasal congestion', 'cant breathe through nose',
      'blocked nostrils', 'nasal block', 'nose blocked', 'nose stuffed', 'mookkadavu', 'മൂക്കടപ്പ്']
  },
  runny_nose: {
    bodyArea: 'head_and_neck', symptomId: 'runny_nose',
    keywords: ['runny nose', 'nose running', 'nasal discharge', 'snot', 'dripping nose',
      'watery nose', 'post nasal drip', 'mookkozhukkal', 'mookkil neeru', 'മൂക്കൊഴുക്ക്']
  },
  common_cold: {
    bodyArea: 'head_and_neck', symptomId: 'common_cold',
    keywords: ['common cold', 'cold', 'flu', 'catching cold', 'rhinitis', 'head cold',
      'jaladhosham', 'jaladosham', 'pani neer', 'neeroorcha', 'sheetham', 'chumma jaladhosham',
      'ജലദോഷം', 'തണുപ്പ്']
  },
  toothache: {
    bodyArea: 'head_and_neck', symptomId: 'toothache',
    keywords: ['toothache', 'tooth pain', 'teeth pain', 'molar pain', 'wisdom tooth',
      'cavity pain', 'dental pain', 'tooth hurts', 'pallu vedana', 'pall vedana',
      'dhantha vedana', 'pallu kuthal', 'dand vedana', 'പല്ലുവേദന']
  },
  mouth_ulcer: {
    bodyArea: 'head_and_neck', symptomId: 'mouth_ulcer',
    keywords: ['mouth ulcer', 'canker sore', 'mouth sore', 'tongue ulcer', 'lip sore',
      'canker', 'ulcer in mouth', 'vaayil kshatham', 'vaai punnu', 'naakkil kshatham',
      'vaayil pottal', 'vaayil chila', 'വായിൽ പുണ്ണ്', 'വായിൽ വ്രണം']
  },
  gum_pain_swelling: {
    bodyArea: 'head_and_neck', symptomId: 'gum_pain_swelling',
    keywords: ['gum pain', 'swollen gums', 'bleeding gums', 'gingivitis', 'gum infection',
      'gum swelling', 'painful gums', 'eenu vedana', 'eenu veekkam', 'mona vedana',
      'monayil veekkam', 'mona chuvakkal', 'മോണവീക്കം', 'ഈറ് വേദന']
  },
  difficulty_swallowing: {
    bodyArea: 'head_and_neck', symptomId: 'difficulty_swallowing',
    keywords: ['difficulty swallowing', 'dysphagia', 'painful swallowing', 'cant swallow',
      'food stuck in throat', 'hard to swallow', 'swallowing problem',
      'dhakshana irakkan budhimuttu', 'thondanirakkan vedana', 'irakkan pattunnilla',
      'vazhi adayunna pole', 'ഭക്ഷണം ഇറക്കാൻ ബുദ്ധിമുട്ട്']
  },
  loss_of_smell: {
    bodyArea: 'head_and_neck', symptomId: 'loss_of_smell',
    keywords: ['loss of smell', 'cant smell', 'lost smell', 'anosmia', 'no smell',
      'smell gone', 'cannot smell anything', 'manom ariyunnilla', 'manom pokal',
      'gandham ariyunnilla', 'mookk thurakkathilla', 'മണം അറിയുന്നില്ല']
  },
  loss_of_taste: {
    bodyArea: 'head_and_neck', symptomId: 'loss_of_taste',
    keywords: ['loss of taste', 'cant taste', 'lost taste', 'ageusia', 'no taste',
      'food has no taste', 'tasteless', 'taste gone', 'ruchi ariyunnilla',
      'ruchi illathavuka', 'naakkil ruchi illa', 'രുചി അറിയുന്നില്ല']
  },
  sneezing: {
    bodyArea: 'head_and_neck', symptomId: 'sneezing',
    keywords: ['sneezing', 'frequent sneezing', 'keep sneezing', 'sneezing a lot',
      'sneeze non-stop', 'allergy sneezing']
  },
  sinus_pressure: {
    bodyArea: 'head_and_neck', symptomId: 'sinus_pressure',
    keywords: ['sinus', 'sinusitis', 'sinus pain', 'sinus pressure', 'facial pressure',
      'face pain', 'cheek pain', 'forehead pressure', 'sinus headache', 'nasal pressure']
  },
  nosebleed: {
    bodyArea: 'head_and_neck', symptomId: 'nosebleed',
    keywords: ['nosebleed', 'nose bleeding', 'bleeding nose', 'blood from nose',
      'naak se khoon', 'epistaxis']
  },
  seizure: {
    bodyArea: 'head_and_neck', symptomId: 'seizure',
    keywords: ['seizure', 'convulsion', 'fit', 'epilepsy', 'shaking attack', 'body shaking',
      'fits', 'blackout fit', 'grand mal', 'epileptic fit']
  },
  speech_difficulty: {
    bodyArea: 'head_and_neck', symptomId: 'speech_difficulty',
    keywords: ['slurred speech', 'cant speak', 'speech difficulty', 'can\'t talk properly',
      'words mixed up', 'speech problem', 'sudden speech loss', 'aphasia']
  },
  facial_weakness: {
    bodyArea: 'head_and_neck', symptomId: 'facial_weakness',
    keywords: ['facial weakness', 'face drooping', 'face drop', 'smile crooked', 'mouth drooping',
      'facial paralysis', 'bell\'s palsy', 'one side face weak']
  },
  tremor: {
    bodyArea: 'head_and_neck', symptomId: 'tremor',
    keywords: ['tremor', 'trembling', 'shaking hands', 'hands shaking', 'shaky', 'trembling hands',
      'uncontrolled shaking', 'parkinson']
  },
  memory_confusion: {
    bodyArea: 'head_and_neck', symptomId: 'memory_confusion',
    keywords: ['memory loss', 'confused', 'confusion', 'forgetful', 'forgetfulness',
      'dementia', 'alzheimer', 'can\'t remember', 'disoriented', 'mentally confused']
  },

  // ── Chest ─────────────────────────────────────────────────────────────────
  chest_pain: {
    bodyArea: 'chest', symptomId: 'chest_pain',
    keywords: ['chest pain', 'chest pressure', 'chest tightness', 'heavy chest',
      'crushing chest', 'heart pain', 'angina', 'sternum pain', 'chest ache',
      'nenju vedana', 'nenjil vedana', 'nenjil kuthal', 'heart attack', 'chest squeezing',
      'നെഞ്ചുവേദന', 'നെഞ്ചിൽ ഭാരം']
  },
  burning_chest: {
    bodyArea: 'chest', symptomId: 'burning_chest',
    keywords: ['heartburn', 'heart burn', 'acid reflux', 'gerd', 'acidity',
      'burning in chest', 'sour burp', 'burning throat after eating', 'chest burn',
      'nenjerichal', 'nenjil erichal', 'നെഞ്ചെരിച്ചിൽ']
  },
  palpitations: {
    bodyArea: 'chest', symptomId: 'palpitations',
    keywords: ['palpitations', 'racing heart', 'heart racing', 'fast heartbeat',
      'fluttering heart', 'skipping beats', 'irregular pulse', 'tachycardia', 'heart pounding',
      'nenjidip', 'nenjil idip', 'heartbeat fast', 'irregular heartbeat', 'നെഞ്ചിടിപ്പ്']
  },
  breathing_difficulty: {
    bodyArea: 'chest', symptomId: 'breathing_difficulty',
    keywords: ['shortness of breath', 'cant breathe', 'can\'t breathe', 'breathless',
      'wheezing', 'asthma attack', 'gasping', 'dyspnea', 'hard to breathe', 'tight airways',
      'swasam muttal', 'swasamedukkan budhimuttu', 'breathlessness', 'difficulty breathing',
      'ശ്വാസംമുട്ടൽ', 'കിതപ്പ്']
  },
  persistent_cough: {
    bodyArea: 'chest', symptomId: 'persistent_cough',
    keywords: ['cough', 'coughing', 'chronic cough', 'dry cough', 'wet cough',
      'phlegm', 'bronchitis', 'hacking cough', 'chumma', 'chuma', 'kure naalaayi chuma',
      'persistent cough', 'cough for weeks', 'mucus cough', 'ചുമ']
  },
  chest_congestion: {
    bodyArea: 'chest', symptomId: 'chest_congestion',
    keywords: ['chest congestion', 'chest tightness', 'mucus in chest', 'phlegm', 'productive cough',
      'chest feels heavy', 'blocked chest', 'chest rattling', 'nenjil kaphakkettu', 'kaphakkettu', 'കഫക്കെട്ട്']
  },
  blood_in_sputum: {
    bodyArea: 'chest', symptomId: 'blood_in_sputum',
    keywords: ['coughing blood', 'blood in sputum', 'blood in phlegm', 'haemoptysis',
      'blood when coughing', 'spitting blood', 'cough up blood', 'chumayil chora', 'ചുമയ്ക്കുമ്പോൾ രക്തം']
  },
  fainting: {
    bodyArea: 'chest', symptomId: 'fainting',
    keywords: ['fainting', 'fainted', 'passed out', 'loss of consciousness', 'blackout',
      'syncope', 'fell unconscious', 'went blank', 'collapse', 'bodham kettu', 'bodhamillathe aayi', 'ബോധക്ഷയം']
  },

  // ── Upper Abdomen ─────────────────────────────────────────────────────────
  stomach_pain: {
    bodyArea: 'abdomen', symptomId: 'stomach_pain',
    keywords: ['stomach pain', 'stomach ache', 'belly pain', 'abdominal pain', 'tummy pain',
      'tummy ache', 'gut pain', 'epigastric pain', 'pain after eating', 'upper belly pain',
      'vayaru vedana', 'vayarvedana', 'vayattil vedana', 'vayattil kuthal', 'stomach cramps', 'gastric pain',
      'വയറുവേദന', 'വയറ്റിൽ കുത്തൽ']
  },
  abdominal_cramps: {
    bodyArea: 'abdomen', symptomId: 'abdominal_cramps',
    keywords: ['abdominal cramps', 'stomach cramps', 'tummy cramps', 'colic pain',
      'spasms in stomach', 'twisting stomach pain', 'gut cramps',
      'vayaru murukki vedana', 'vayaru valichil', 'vayattil koluthipidutham',
      'vayattil koluthal', 'vayattil pidutham', 'vayaru koluthal', 'വയറുവേദന', 'വയറു കൊളുത്തിപ്പിടുത്തം']
  },
  blood_in_vomit: {
    bodyArea: 'abdomen', symptomId: 'blood_in_vomit',
    keywords: ['blood in vomit', 'vomiting blood', 'coffee ground vomit', 'hematemesis',
      'throwing up blood', 'vomit blood', 'blood vomit',
      'chardiil chora', 'raktham chardhikkuka', 'chora chardi', 'chora poyathu',
      'രക്തം ഛർദ്ദിക്കൽ', 'ചോര ഛർദ്ദി']
  },
  nausea_vomiting: {
    bodyArea: 'abdomen', symptomId: 'nausea_vomiting',
    keywords: ['nausea', 'vomiting', 'throwing up', 'feel like vomiting', 'feel sick',
      'queasy', 'nauseated', 'puking', 'chardi', 'chardikkan varunnu', 'kayyikal', 'vomit',
      'upset stomach', 'want to vomit', 'sick to stomach', 'ഛർദ്ദി', 'ഓക്കാനം']
  },
  bloating_indigestion: {
    bodyArea: 'abdomen', symptomId: 'bloating_indigestion',
    keywords: ['bloating', 'bloated', 'indigestion', 'gas', 'flatulence', 'burping', 'belching',
      'full feeling', 'stomach bloated', 'heavy stomach', 'gas problem',
      'acidity problem', 'dyspepsia', 'stomach gas', 'vayaru veengal', 'vayattil gas', 'ദഹനക്കേട്']
  },
  diarrhea: {
    bodyArea: 'abdomen', symptomId: 'diarrhea',
    keywords: ['diarrhea', 'diarrhoea', 'loose motion', 'loose motions', 'loose stools',
      'watery stool', 'watery stools', 'watery poop', 'running stomach', 'stomach running',
      'vayattil ninnum pokal', 'vayarilakkam', 'loose potty', 'motions', 'frequent motions',
      'stomach upset stool', 'intestinal problem', 'gastroenteritis', 'loose bowel', 'വയറിളക്കം']
  },
  constipation: {
    bodyArea: 'abdomen', symptomId: 'constipation',
    keywords: ['constipation', 'constipated', 'hard stool', 'difficulty passing stool',
      'no bowel movement', 'cannot pass stool', 'stool problem', 'malabandham', 'constipation problem',
      'straining to pass stool', 'irregularity', 'not going to toilet', 'മലബന്ധം']
  },
  heartburn_acidity: {
    bodyArea: 'abdomen', symptomId: 'heartburn_acidity',
    keywords: ['heartburn', 'acidity', 'acid reflux', 'gerd', 'burning sensation stomach',
      'burning after food', 'sour taste', 'burp sour', 'stomach acid',
      'vayattil erichal', 'puli thettal', 'gas acidity', 'burning upper stomach', 'പുളിച്ചുതികട്ടൽ']
  },
  blood_in_stool: {
    bodyArea: 'abdomen', symptomId: 'blood_in_stool',
    keywords: ['blood in stool', 'bloody stool', 'rectal bleeding', 'blood in poop',
      'blood with bowel movement', 'blood when passing stool', 'haematochezia',
      'malathil chora', 'raktham pokal', 'മലത്തിൽ രക്തം']
  },
  black_stool: {
    bodyArea: 'abdomen', symptomId: 'black_stool',
    keywords: ['black stool', 'tarry stool', 'dark stool', 'black poop', 'melaena',
      'dark bowel movement', 'black colored stool', 'bleeding gut', 'karutha malam', 'കറുത്ത മളം']
  },
  jaundice: {
    bodyArea: 'abdomen', symptomId: 'jaundice',
    keywords: ['jaundice', 'yellow eyes', 'yellow skin', 'yellowing', 'skin yellow',
      'whites of eyes yellow', 'manja pitham', 'manjappitham', 'yellow urine', 'dark urine with yellow skin', 'മഞ്ഞപ്പിത്തം']
  },

  // ── Lower Abdomen ─────────────────────────────────────────────────────────
  lower_belly_pain: {
    bodyArea: 'lower_abdomen', symptomId: 'lower_belly_pain',
    keywords: ['lower abdominal pain', 'lower belly pain', 'lower tummy pain', 'pelvic pain',
      'appendix pain', 'lower right pain', 'lower left pain', 'adi vayaru vedana', 'adivayaru vedana', 'അടിവയറ്റിൽ വേദന']
  },
  burning_urination: {
    bodyArea: 'lower_abdomen', symptomId: 'burning_urination',
    keywords: ['burning urination', 'burning pee', 'painful urination', 'uti', 'urine infection',
      'frequent urination', 'passing urine hurts', 'moothram ozhikkumpol erichal', 'moothram erichal',
      'urine burning', 'urinary tract infection', 'bladder infection', 'dysuria', 'മൂത്രമൊഴിക്കുമ്പോൾ പുകച്ചിൽ']
  },
  flank_pain: {
    bodyArea: 'lower_abdomen', symptomId: 'flank_pain',
    keywords: ['flank pain', 'side pain', 'kidney pain', 'loin pain', 'back side pain',
      'kidney stones', 'renal colic', 'pain radiating to groin', 'waist pain', 'kidney vedana', 'vladukal vedana']
  },
  blood_in_urine: {
    bodyArea: 'lower_abdomen', symptomId: 'blood_in_urine',
    keywords: ['blood in urine', 'red urine', 'pink urine', 'haematuria', 'blood when urinating',
      'bloody urine', 'urine with blood', 'moothrathil chora', 'മൂത്രത്തിൽ രക്തം']
  },
  difficulty_urinating: {
    bodyArea: 'lower_abdomen', symptomId: 'difficulty_urinating',
    keywords: ['difficulty urinating', 'can\'t pee', 'trouble urinating', 'weak stream',
      'urine retention', 'unable to urinate', 'moothram varunnilla', 'moothram ozhikkan budhimuttu', 'urinary obstruction', 'മൂത്രതടസ്സം']
  },
  urinary_urgency: {
    bodyArea: 'lower_abdomen', symptomId: 'urinary_urgency',
    keywords: ['frequent urination', 'urinary urgency', 'urge to urinate', 'going to toilet often',
      'moothram idakkide ozhikkal', 'need to pee often', 'overactive bladder', 'ഇടയ്ക്കിടെ മൂത്രമൊഴിക്കുക']
  },
  urinary_incontinence: {
    bodyArea: 'lower_abdomen', symptomId: 'urinary_incontinence',
    keywords: ['urinary incontinence', 'urine leakage', 'bladder leakage', 'cant control urine',
      'wetting pants', 'involuntary urination', 'leaking urine',
      'moothram thadayan pattunnilla', 'moothram poyippovunnu', 'moothram nirthan aavunnilla',
      'moothram thangi veykaan aavunnilla', 'ariyathe moothram pokuka', 'moothram leak aavuka',
      'മൂത്രം ലീക്ക്', 'മൂത്രനിയന്ത്രണമില്ലായ്മ']
  },

  // ── Arms ──────────────────────────────────────────────────────────────────
  arm_fracture_trauma: {
    bodyArea: 'left_arm', symptomId: 'arm_fracture_trauma',
    keywords: [
      'broken arm', 'fractured arm', 'arm fracture', 'fell from bike', 'fell off bike',
      'bike fall', 'bike accident', 'fall on arm', 'fell on my arm', 'broken wrist',
      'fractured wrist', 'wrist fracture', 'broken shoulder', 'dislocated shoulder',
      'dislocated arm', 'collarbone', 'broken bone arm', 'bone cracked', 'kayyu potti', 'kayyilootti', 'കൈ ഒടിഞ്ഞു'
    ]
  },
  arm_joint_pain: {
    bodyArea: 'left_arm', symptomId: 'arm_joint_pain',
    keywords: ['shoulder pain', 'elbow pain', 'arm joint pain', 'rotator cuff', 'arm ache',
      'shoulder ache', 'joint pain arm', 'tholi vedana', 'kayyu vedana', 'കൈവേദന']
  },
  arm_numbness: {
    bodyArea: 'left_arm', symptomId: 'arm_numbness',
    keywords: ['arm numbness', 'numb arm', 'tingling arm', 'pins and needles arm',
      'carpal tunnel', 'hand numb', 'fingers numb', 'hand tingling', 'kayyu maravippu', 'കൈ മരവിപ്പ്']
  },

  // ── Legs ──────────────────────────────────────────────────────────────────
  leg_fracture_trauma: {
    bodyArea: 'left_leg', symptomId: 'leg_fracture_trauma',
    keywords: [
      'broken leg', 'fractured leg', 'leg fracture', 'broken bone leg', 'cannot put weight',
      'cant bear weight', 'unable to walk after fall', 'fractured foot', 'broken foot',
      'broken ankle', 'fractured ankle', 'bike fall leg', 'fall on leg', 'kaal odivu', 'kaalu potti', 'കാലൊടിഞ്ഞു'
    ]
  },
  knee_joint_pain: {
    bodyArea: 'left_leg', symptomId: 'knee_joint_pain',
    keywords: ['knee pain', 'knee swelling', 'knee ache', 'joint pain knee', 'mutti vedana',
      'mutteduthu vedana', 'knee problem', 'knee stiff', 'knee clicking', 'torn ligament', 'മുട്ടുവേദന']
  },
  ankle_foot_pain: {
    bodyArea: 'left_leg', symptomId: 'ankle_foot_pain',
    keywords: ['ankle pain', 'foot pain', 'sprained ankle', 'heel pain', 'plantar fasciitis',
      'foot ache', 'kaal vedana', 'paadam vedana', 'ankle swollen', 'foot swollen', 'കാൽവേദന']
  },
  lower_back_pain: {
    bodyArea: 'back', symptomId: 'lower_back_pain',
    keywords: ['lower back pain', 'back pain', 'back ache', 'backache', 'lumbar pain',
      'nadukku vedana', 'naduvvedana', 'spine pain', 'sciatica', 'disc problem', 'slipped disc',
      'lower back ache', 'back spasm', 'back stiff', 'നടുവേദന']
  },

  // ── Skin ──────────────────────────────────────────────────────────────────
  skin_rash: {
    bodyArea: 'skin', symptomId: 'skin_rash',
    keywords: ['rash', 'skin rash', 'itching', 'itchy skin', 'skin irritation',
      'redness skin', 'eczema', 'dermatitis', 'allergy rash', 'chori', 'chorichil', 'thadippu',
      'hives', 'urticaria', 'prickly heat', 'skin reaction', 'ചൊറിച്ചിൽ']
  },
  acne_lesions: {
    bodyArea: 'skin', symptomId: 'acne_lesions',
    keywords: ['acne', 'pimples', 'blemishes', 'breakout', 'zits', 'skin lesion', 'blackhead',
      'whitehead', 'cystic acne', 'mole', 'skin growth', 'spot on skin', 'kuru', 'mukhakuru']
  },
  itching: {
    bodyArea: 'skin', symptomId: 'itching',
    keywords: ['itching', 'itchy skin', 'severe itching', 'body itching', 'pruritus',
      'chorichil', 'chori', 'udal muzhuvan chori', 'meyyil chori', 'choriyunnu',
      'ചൊറിച്ചിൽ', 'അ ചൊറിച്ചിൽ']
  },
  hair_loss: {
    bodyArea: 'skin', symptomId: 'hair_loss',
    keywords: ['hair loss', 'hair fall', 'losing hair', 'hair thinning', 'alopecia', 'bald patches',
      'mudi kozhiyunnu', 'mudi povunnu', 'mudi kottal', 'thala mudi kozhichil', 'മുടി കൊഴിച്ചിൽ']
  },

  // ── General / Whole Body ──────────────────────────────────────────────────
  fever: {
    bodyArea: 'general', symptomId: 'fever',
    keywords: ['fever', 'feverish', 'high temperature', 'temperature', 'pani', 'choodu', 'panipole',
      'hot body', 'body hot', 'running a fever', 'pyrexia', 'febrile', 'chills and fever',
      'temperature high', '100 degree', '101 degree', 'high fever', 'mild fever', 'പനി']
  },
  fatigue: {
    bodyArea: 'general', symptomId: 'fatigue',
    keywords: ['fatigue', 'tired', 'tiredness', 'exhausted', 'exhaustion', 'extreme tiredness',
      'no energy', 'always tired', 'constantly tired', 'sheenam', 'ksheenam', 'nalla sheenam',
      'very tired', 'weak and tired', 'burnout', 'lethargy', 'lethargic', 'ക്ഷീണം']
  },
  general_weakness: {
    bodyArea: 'general', symptomId: 'general_weakness',
    keywords: ['weakness', 'weak', 'general weakness', 'body weakness', 'feeling weak',
      'low energy', 'energy loss', 'thalarcha', 'balam illa', 'energy illa', 'feel faint', 'debility', 'തളർച്ച']
  },
  body_ache: {
    bodyArea: 'general', symptomId: 'body_ache',
    keywords: ['body ache', 'body pain', 'muscle ache', 'muscle pain', 'myalgia', 'aching body',
      'all over pain', 'body hurts', 'udal vedana', 'meyyu vedana', 'sarira vedana', 'whole body pain', 'flu aches',
      'joints aching', 'everything hurts', 'ശരീരവേദന']
  },
  chills: {
    bodyArea: 'general', symptomId: 'chills',
    keywords: ['chills', 'shivering', 'rigors', 'feeling cold', 'cold shakes', 'teeth chattering',
      'kuliru', 'viralal', 'kulam', 'shaking with cold', 'കുളിര്', 'വിറയൽ']
  },
  loss_of_appetite: {
    bodyArea: 'general', symptomId: 'loss_of_appetite',
    keywords: ['loss of appetite', 'no appetite', 'not eating', 'not hungry', 'don\'t want to eat',
      'can\'t eat', 'food aversion', 'appetite lost', 'vishappilla', 'vishappu illa', 'bhakshanam kazhikkan thonnunnilla', 'വിശപ്പില്ലായ്മ']
  },
  unexplained_weight_loss: {
    bodyArea: 'general', symptomId: 'unexplained_weight_loss',
    keywords: ['weight loss', 'losing weight', 'unintentional weight loss', 'unexplained weight loss',
      'bharam kurayunnu', 'thookkam kurayunnu', 'thadi kurayunnu', 'body weight reducing', 'getting thin', 'sudden weight loss', 'തൂക്കം കുറയുന്നു']
  },
  weight_gain: {
    bodyArea: 'general', symptomId: 'weight_gain',
    keywords: ['weight gain', 'gaining weight', 'sudden weight gain', 'unexplained weight gain',
      'bharam koodunnu', 'thookkam koodunnu', 'thadi koodunnu', 'thadi vekkunnu', 'ഭാരം കൂടുന്നു', 'തൂക്കം കൂടുന്നു']
  },
  dehydration: {
    bodyArea: 'general', symptomId: 'dehydration',
    keywords: ['dehydration', 'dehydrated', 'not urinating', 'very thirsty', 'dry mouth',
      'no urine', 'extremely thirsty', 'extreme thirst with weakness', 'vellam kuraivu', 'thondavallal', 'nirjaleekaranam', 'നിർജ്ജലീകരണം']
  },
  joint_pain: {
    bodyArea: 'general', symptomId: 'joint_pain',
    keywords: ['joint pain', 'joints hurting', 'polyarthralgia', 'arthralgia', 'knee joint pain',
      'mutteduthu vedana', 'sandhi vedana', 'mutti vedana', 'ellaru vedana', 'സന്ധിവേദന', 'മുട്ടുവേദന']
  },
  muscle_cramps: {
    bodyArea: 'general', symptomId: 'muscle_cramps',
    keywords: ['muscle cramps', 'muscle spasm', 'cramp', 'charley horse', 'spasms',
      'penda vedana', 'kaal koluthal', 'mamsapeshikal koluthal', 'naramb valivu', 'പേശിവലിവ്']
  },
  swelling: {
    bodyArea: 'general', symptomId: 'swelling',
    keywords: ['swelling', 'edema', 'swollen body', 'face swelling', 'puffy', 'fluid retention',
      'veekkam', 'thadippu', 'veengal', 'mukham veekkam', 'udal veekkam', 'വീക്കം']
  },
  excessive_sweating: {
    bodyArea: 'general', symptomId: 'excessive_sweating',
    keywords: ['excessive sweating', 'sweating a lot', 'hyperhidrosis', 'sweating profusely', 'profuse sweat',
      'kooduthal viyarkkunnu', 'nalla viyarppu', 'viyarthezhunelkkuka', 'viyarkkal', 'അമിത വിയർപ്പ്']
  },
  excessive_sleepiness: {
    bodyArea: 'general', symptomId: 'excessive_sleepiness',
    keywords: ['excessive sleepiness', 'sleepy all day', 'somnolence', 'daytime drowsiness', 'drowsy',
      'urakkam thoongal', 'eppozhum urakkam', 'kooduthal urakkam', 'urakkam varunnu', 'അമിതമായ ഉറക്കം']
  },
  numbness_tingling: {
    bodyArea: 'general', symptomId: 'numbness_tingling',
    keywords: ['numbness', 'tingling', 'pins and needles', 'paresthesia', 'loss of sensation',
      'tharippu', 'maravippu', 'kai kaal tharippu', 'maravichupokal', 'തരിപ്പ്', 'മരവിപ്പ്']
  },
  night_sweats: {
    bodyArea: 'general', symptomId: 'night_sweats',
    keywords: ['night sweats', 'sweating at night', 'drenching sweats sleep', 'waking up sweating',
      'rathriyil viyarkkal', 'rathri nalla viyarppu', 'rathriyil viyarkkunnu', 'രാത്രിയിലെ വിയർപ്പ്']
  },

  // ── Reproductive / Women's Health ─────────────────────────────────────────
  missed_period: {
    bodyArea: 'reproductive', symptomId: 'missed_period',
    keywords: ['missed period', 'period missed', 'no period', 'period late', 'late period',
      'periods stopped', 'menstruation missed', 'periods delayed', 'period vannilla',
      'period thettipoyi', 'period late aayi', 'pregnancy test', 'മാസമുറ തെറ്റി']
  },
  irregular_periods: {
    bodyArea: 'reproductive', symptomId: 'irregular_periods',
    keywords: ['irregular periods', 'irregular menstruation', 'periods irregular', 'cycle irregular',
      'menses irregular', 'periods coming and going', 'period thettal', 'samayathu varunnilla', 'ക്രമരഹിതമായ ആർത്തവം']
  },
  heavy_periods: {
    bodyArea: 'reproductive', symptomId: 'heavy_periods',
    keywords: ['heavy periods', 'heavy bleeding period', 'heavy flow', 'menorrhagia',
      'excessive bleeding period', 'periods heavy', 'soaking pads', 'heavy menstruation',
      'kooduthal chora pokal', 'periodil kooduthal bleeding', 'അമിത രക്തസ്രാവം']
  },
  vaginal_discharge: {
    bodyArea: 'reproductive', symptomId: 'vaginal_discharge',
    keywords: ['vaginal discharge', 'white discharge', 'yellow discharge', 'green discharge',
      'abnormal discharge', 'vaginal itching', 'vaginal odour', 'leucorrhoea', 'vellapokku',
      'velutha sravam', 'discharge vaginal', 'itching vagina', 'vaginal smell', 'വെള്ളപോക്ക്']
  },
  vaginal_bleeding: {
    bodyArea: 'reproductive', symptomId: 'vaginal_bleeding',
    keywords: ['vaginal bleeding', 'bleeding between periods', 'spotting', 'unexpected bleeding',
      'abnormal bleeding', 'bleeding not period', 'inter-menstrual bleeding', 'vaginal blood']
  },
  breast_lump: {
    bodyArea: 'reproductive', symptomId: 'breast_lump',
    keywords: ['breast lump', 'lump in breast', 'breast pain', 'breast change', 'breast swelling',
      'breast tenderness', 'nipple discharge', 'breast hardness', 'breast mass']
  },

  // ── Metabolic / Diabetes ──────────────────────────────────────────────────
  excessive_thirst: {
    bodyArea: 'metabolic', symptomId: 'excessive_thirst',
    keywords: ['excessive thirst', 'very thirsty', 'always thirsty', 'can\'t stop drinking water',
      'extreme thirst', 'diabetes thirst', 'polydipsia', 'nalla daaham', 'daaham kooduthal',
      'vellam daaham', 'dry throat constantly', 'constantly thirsty', 'ദാഹം']
  },
  excessive_urination: {
    bodyArea: 'metabolic', symptomId: 'excessive_urination',
    keywords: ['excessive urination', 'urinating a lot', 'polyuria', 'peeing a lot',
      'lots of urine', 'increased urination', 'frequent peeing', 'diabetes urine',
      'moothram kooduthal ozhikkal', 'idakkide moothram ozhikkuka', 'അമിത മൂത്രം']
  },
  neck_swelling_thyroid: {
    bodyArea: 'metabolic', symptomId: 'neck_swelling_thyroid',
    keywords: ['thyroid', 'goitre', 'goiter', 'neck swelling', 'neck lump', 'thyroid swelling',
      'neck growth', 'throat swelling thyroid', 'thyroid problem', 'thyroid disorder',
      'hypothyroid', 'hyperthyroid', 'thyroid lump']
  },

  // ── Mental Health ─────────────────────────────────────────────────────────
  anxiety: {
    bodyArea: 'mental_health', symptomId: 'anxiety',
    keywords: ['anxiety', 'anxious', 'excessive worry', 'nervous', 'nervousness',
      'always worried', 'fear without reason', 'tension', 'pedi', 'aakulam',
      'padappu', 'nenjidippu', 'restless', 'cant stop worrying', 'overthinking', 'panic feeling', 'ആശങ്ക']
  },
  panic_attack: {
    bodyArea: 'mental_health', symptomId: 'panic_attack',
    keywords: ['panic attack', 'panic', 'sudden fear', 'intense fear', 'heart racing anxiety',
      'feel like dying suddenly', 'overwhelming fear', 'sudden dread']
  },
  depressed_mood: {
    bodyArea: 'mental_health', symptomId: 'depressed_mood',
    keywords: ['depression', 'depressed', 'low mood', 'feeling sad', 'hopeless', 'sad all the time',
      'no motivation', 'feeling empty', 'vishamam', 'sankadam', 'manovisham', 'mentally low', 'feel worthless',
      'anhedonia', 'lost interest in everything', 'persistent sadness', 'വിഷാദം']
  },
  sleep_problem: {
    bodyArea: 'mental_health', symptomId: 'sleep_problem',
    keywords: ['insomnia', 'can\'t sleep', 'sleep problem', 'not sleeping', 'sleeplessness',
      'poor sleep', 'waking up at night', 'urakkam varunnilla', 'urakkamilla', 'urakkakkuravu', 'restless sleep',
      'can\'t fall asleep', 'sleep disorder', 'unable to sleep', 'ഉറക്കമില്ലായ്മ']
  },
  suicidal_thoughts: {
    bodyArea: 'mental_health', symptomId: 'suicidal_thoughts',
    keywords: ['suicidal thoughts', 'want to die', 'thinking of suicide', 'self harm',
      'harming myself', 'thoughts of ending life', 'self-harm', 'hurt myself',
      'don\'t want to live', 'jeevitham maduthu', 'jeevikkan thonnunnilla', 'ആത്മഹത്യാ ചിന്ത']
  }
};

export const BODY_AREA_SYNONYMS = {
  head_and_neck: ['head', 'forehead', 'temple', 'neck', 'throat', 'eye', 'ear', 'face', 'cranial',
    'thala', 'kazhuthu', 'thonda', 'mookku', 'thalavedana', 'nose', 'sinus', 'scalp', 'തല', 'കഴുത്ത്'],
  chest: ['chest', 'heart', 'lungs', 'ribs', 'breast', 'ribcage', 'sternum', 'nenju', 'nenjil', 'shwasam', 'നെഞ്ച്'],
  abdomen: ['stomach', 'tummy', 'belly', 'abdomen', 'digestive', 'gut', 'epigastric', 'vayaru', 'vayar', 'vayattil', 'വയറ്'],
  lower_abdomen: ['lower abdomen', 'lower belly', 'pelvis', 'groin', 'bladder', 'urinary', 'reproductive',
    'adi vayaru', 'adivayaru', 'moothram', 'അടിവയർ'],
  left_arm: ['left arm', 'left shoulder', 'left hand', 'left wrist', 'left elbow', 'arm', 'shoulder', 'hand', 'elbow', 'wrist', 'kayyu', 'kai', 'tholi', 'കൈ'],
  right_arm: ['right arm', 'right shoulder', 'right hand', 'right wrist', 'right elbow'],
  left_leg: ['left leg', 'left knee', 'left foot', 'left ankle', 'leg', 'knee', 'foot', 'ankle', 'thigh', 'calf', 'kaalu', 'kaal', 'mutti', 'പാദം', 'കാൽ'],
  right_leg: ['right leg', 'right knee', 'right foot', 'right ankle'],
  skin: ['skin', 'rash', 'dermal', 'cutaneous', 'spots', 'itching all over', 'body rash', 'chori', 'chorichil', 'thadippu', 'ചൊറിച്ചിൽ', 'ചർമ്മം'],
  back: ['back', 'spine', 'lower back', 'upper back', 'vertebrae', 'spinal', 'nadukku', 'naduvvedana', 'puram', 'നടുവേദന'],
  general: ['general', 'whole body', 'fever', 'fatigue', 'weak', 'tired', 'pani', 'sheenam', 'ksheenam', 'udal vedana', 'പനി'],
  reproductive: ['periods', 'period', 'menstrual', 'pregnancy', 'women', 'vaginal', 'breast', 'aarthavam', 'മാസമുറ'],
  metabolic: ['diabetes', 'thyroid', 'thirst', 'sugar', 'metabolic', 'weight', 'endocrine'],
  mental_health: ['anxiety', 'depression', 'stress', 'mental', 'panic', 'insomnia', 'worry', 'tension', 'vishamam', 'padappu', 'ആശങ്ക']
};

export const DURATION_SYNONYMS = {
  hours: ['hours', 'hour', 'today', 'few hours', 'less than 24', 'just started', 'sudden', 'morning',
    'since morning', 'this morning', 'since today', 'innu', 'inn', 'innumuthal', 'inn muthal',
    'innu muthal', 'inn thudangi', 'innu thudangi', 'thudangi', 'thudangiyittu', 'thudangiyathu',
    'ravile', 'ravile muthal', 'ippol thudangi', 'ippol', 'kurachu neramayi', 'since last night',
    'tonight', 'this evening', 'this afternoon', 'past few hours', 'ippozhanu', 'ippo thudangi',
    'ee divasam', 'ee divasam muthal', 'today morning', 'today evening', 'today only',
    'just now', 'started today', 'from today', 'since this morning', 'ഇന്ന്'],
  days: ['days', 'day', 'yesterday', 'few days', 'couple days', '1-6 days', '3 days', '4 days',
    '2 days', 'since yesterday', 'two days', 'three days', 'four days', 'innale', 'innale muthal',
    'innalthe', 'innalthe muthal', 'randu divasam', 'moonnu divasam', 'naalu divasam', 'kurachu divasayi',
    'kurachu divasam', 'kurachu divasam aayi', '2-3 days', 'a couple of days',
    'couple of days', 'last day', 'past day', 'past two days', 'past 2 days', 'for past two days',
    'past few days', 'last 2 days', 'last two days', 'രണ്ട് ദിവസം', 'ഇന്നലെ'],
  weeks: ['weeks', 'week', '1-3 weeks', 'two weeks', 'a week', 'few weeks', 'orazhcha',
    'randazhcha', 'azhcha', 'last week', 'past week', 'one week', '10 days', '12 days',
    'oru azhcha', 'randu azhcha', 'aazhcha', 'oru azhchayi', 'oru azhcha aayi', 'ആഴ്ച'],
  chronic: ['month', 'months', 'year', 'years', 'long time', 'chronic', 'ongoing', 'masangalayi',
    'kure nalayi', 'kure divasam', 'kure divasam aayi', 'kollangalayi', 'always had', 'for a long time',
    'persistent', 'more than a month', 'several months', 'half a year', 'mase', 'oru mase',
    'randu mase', 'masam', 'masam aayi', 'masangal', 'varshangalayi', 'മാസങ്ങളായി']
};

export const SEVERITY_SYNONYMS = {
  mild: ['mild', 'smile', 'smiled', 'mile', 'miles', 'mildly', 'while', 'wild', 'slight', 'minor',
    'little bit', 'tolerable', 'noticeable', 'manageable', 'light', 'not too bad', 'bearable',
    'a bit', 'cheriya', 'cheriya vedana', 'kurachu vedana', 'kurachu', 'valiya preshnamilla',
    'okay-ish', 'small pain', 'low grade', 'dull ache', 'faint pain', 'kurachu mathi',
    'kurachu pole', 'cherutha vedana', 'ittu kollam', 'സഹിക്കാം', 'കുറച്ചു വേദന', 'ചെറിയ'],
  moderate: ['moderate', 'moderately', 'disrupts', 'disrupting', 'medium', 'uncomfortable',
    'hard to work', 'trouble sleeping', 'bothering me', 'quite bad', 'fairly bad',
    'affecting my routine', 'cant work properly', 'medium pain', 'sahikkan pattunnu',
    'nalla vedana', 'nallath', 'nalla kashtam', 'ithiri kashtam', 'valiya vedana aanu',
    'disturb cheyyunnu', 'urakkam kettu', 'work cheyyaan pattunnilla', 'കുറച്ചധികം'],
  severe: ['severe', 'severely', 'serious', 'it\'s serious', 'its serious', 'terrible',
    'unbearable', 'intense', 'extreme', 'killing me', 'excruciating', 'very bad', 'debilitating',
    'worst pain', 'horrible', 'can\'t move', 'really bad', 'pounding', 'throbbing bad',
    'bayankara', 'bayankara vedana', 'bhayankara', 'bhayankara vedana', 'sahikkan pattatha vedana',
    'kooduthal vedana', 'kashtam', 'nalla kashtam vedana', 'sahikkan pattunnilla', 'vedana sahikkan pattunnilla',
    'severe pain', 'emergency level', 'can\'t bear it', 'intolerable', 'so severe',
    'ഭയങ്കര വേദന', 'കഠിനമായ വേദന']
};


const NEGATIVE_PATTERNS = [
  'no', 'none', 'nope', 'nothing', 'neither', 'not really', 'not at all', 'no none',
  'none of those', 'none of them', 'none of the above', 'not any', 'no symptoms',
  'nothing like that', 'negative', 'i don\'t have any', 'don\'t have any of those'
];

export function matchFreeTextQuery(text) {
  if (!text || typeof text !== 'string') return { matchedType: null };
  const query = text.toLowerCase().trim();

  const generalKeywords = [
    'general', 'not sure', 'dont know', "don't know", 'unsure', 'not clear',
    'multiple problems', 'whole body', 'unwell', 'not feeling well', 'feeling off'
  ];
  if (generalKeywords.some(k => query.includes(k))) {
    return { matchedType: 'general' };
  }

  let bestMatch = null;
  let longestKeywordLength = 0;

  for (const [key, item] of Object.entries(SYMPTOM_SYNONYMS)) {
    for (const keyword of item.keywords) {
      if (query.includes(keyword)) {
        if (keyword.length > longestKeywordLength) {
          longestKeywordLength = keyword.length;
          bestMatch = {
            matchedType: 'symptom',
            symptomKey: key,
            bodyArea: item.bodyArea,
            symptomId: item.symptomId,
            matchedKeyword: keyword
          };
        }
      }
    }
  }

  if (bestMatch) {
    return bestMatch;
  }

  for (const [areaKey, keywords] of Object.entries(BODY_AREA_SYNONYMS)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        return { matchedType: 'body_area', bodyArea: areaKey, matchedKeyword: keyword };
      }
    }
  }

  return { matchedType: null };
}

export function matchDurationQuery(text) {
  const query = (text || '').toLowerCase().trim();
  for (const [durationId, keywords] of Object.entries(DURATION_SYNONYMS)) {
    if (keywords.some(k => query.includes(k))) return durationId;
  }
  return null;
}

// Detects if input is Manglish, Malayalam script, or English
// Used by ChatBox to maintain language continuity in follow-up questions
export function detectFrontendLanguage(text) {
  if (!text || typeof text !== 'string') return 'english';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'malayalam_script';
  const manglishSignals = [
    'enikku', 'eniku', 'enik', 'vedana', 'vedanikkunnu', 'pallu', 'thala', 'thalavedana',
    'vayaru', 'vayar', 'vayattil', 'kazhuthu', 'nenju', 'nenjil', 'chardi', 'chuma',
    'pani', 'sheenam', 'ksheenam', 'tharippu', 'veekkam', 'chori', 'chorichil',
    'moothram', 'innu', 'inn', 'innumuthal', 'innale', 'ravile', 'ippol',
    'kurachu', 'kure', 'neram', 'neramayi', 'divasam', 'divasamayi',
    'bayankara', 'bhayankara', 'cheriya', 'und', 'undu', 'undo', 'ind', 'indo',
    'illa', 'illanne', 'onnumilla', 'onnumillaa', 'vannu', 'poyi', 'aayi', 'aayo', 'aayilla',
    'kayyu', 'kaalu', 'potti', 'odivu', 'aano', 'aanu', 'alla', 'allayo', 'allaayo',
    'kooduthal', 'kooduthalaano', 'sahikkan', 'muthal', 'koluthipidutham', 'koluthal',
    'chora', 'raktham', 'kazhikkan', 'urakkam', 'maravippu', 'ayyo', 'ayyoo', 'kashtam',
    'prashnam', 'prashnangal', 'sambandhichu', 'sambandhicha', 'thudangi', 'thudangiyittu',
    'vedanayo', 'cheruthaano', 'cheruthano', 'budhimuttu', 'budhimuttundalle', 'ethra',
    'engane', 'ithu', 'thavana', 'thavano', 'thavanaayi', 'pravashyam', 'pravisham', 'vatam'
  ];
  const lower = text.toLowerCase();
  if (/\b\d+\s*(thavana|pravashyam|vatam)\b/i.test(lower)) return 'manglish';
  const words = lower.split(/[^a-zA-Z]+/);
  if (words.some(w => manglishSignals.includes(w))) return 'manglish';
  return 'english';
}

export function matchSeverityQuery(text) {
  const query = (text || '').toLowerCase().trim();
  for (const [sevId, keywords] of Object.entries(SEVERITY_SYNONYMS)) {
    if (keywords.some(k => query.includes(k))) return sevId;
  }
  return null;
}

export function isNegativeResponse(text) {
  const query = (text || '').toLowerCase().trim();
  return NEGATIVE_PATTERNS.some(p => query === p || query.startsWith(p + ' ') || query.endsWith(' ' + p) || query.includes(p));
}

export function extractFullTriageIntent(text) {
  if (!text || typeof text !== 'string') return null;
  const query = text.toLowerCase().trim();

  // 1. Check symptoms - prioritize longer keyword matches
  let matchedSymptom = null;
  let longestKeyword = '';

  for (const [key, item] of Object.entries(SYMPTOM_SYNONYMS)) {
    for (const keyword of item.keywords) {
      if (query.includes(keyword)) {
        if (keyword.length > longestKeyword.length) {
          matchedSymptom = {
            symptomKey: key,
            symptomId: item.symptomId,
            bodyArea: item.bodyArea
          };
          longestKeyword = keyword;
        }
      }
    }
  }

  // 2. Check duration
  const durationId = matchDurationQuery(query);
  let durationLabel = null;
  if (durationId === 'hours') durationLabel = 'Hours to a day (recently started)';
  else if (durationId === 'days') durationLabel = '1 to 3 days (e.g. since yesterday)';
  else if (durationId === 'weeks') durationLabel = '1 to 4 weeks';
  else if (durationId === 'chronic') durationLabel = 'More than a month (chronic)';

  // 3. Check severity
  const severityId = matchSeverityQuery(query);

  // 4. Check body area if not deduced from symptom
  let matchedBodyArea = matchedSymptom ? matchedSymptom.bodyArea : null;
  if (!matchedBodyArea) {
    for (const [areaKey, keywords] of Object.entries(BODY_AREA_SYNONYMS)) {
      if (keywords.some(k => query.includes(k))) {
        matchedBodyArea = areaKey;
        break;
      }
    }
  }

  const hasSymptom = Boolean(matchedSymptom?.symptomId);
  const hasDuration = Boolean(durationId);
  const hasSeverity = Boolean(severityId);

  return {
    hasSymptom,
    hasDuration,
    hasSeverity,
    isComplete: hasSymptom && hasDuration && hasSeverity,
    symptom: matchedSymptom,
    symptomId: matchedSymptom?.symptomId || null,
    bodyArea: matchedBodyArea,
    durationId,
    durationLabel,
    severityId
  };
}

export async function loadSynonymsFromApi(apiBaseUrl = 'https://talk2doc-be.onrender.com') {
  try {
    const res = await fetch(`${apiBaseUrl}/api/synonyms`);
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.success || !data.synonyms) return false;

    const { symptoms, durations, severities, bodyAreas } = data.synonyms;

    if (symptoms) {
      for (const [key, item] of Object.entries(symptoms)) {
        if (!SYMPTOM_SYNONYMS[key]) {
          SYMPTOM_SYNONYMS[key] = {
            bodyArea: item.bodyArea,
            symptomId: item.canonicalId,
            keywords: item.keywords || []
          };
        } else {
          SYMPTOM_SYNONYMS[key].keywords = Array.from(
            new Set([...SYMPTOM_SYNONYMS[key].keywords, ...(item.keywords || [])])
          );
        }
      }
    }

    if (durations) {
      for (const [dId, item] of Object.entries(durations)) {
        if (!DURATION_SYNONYMS[dId]) {
          DURATION_SYNONYMS[dId] = item.keywords || [];
        } else {
          DURATION_SYNONYMS[dId] = Array.from(
            new Set([...DURATION_SYNONYMS[dId], ...(item.keywords || [])])
          );
        }
      }
    }

    if (severities) {
      for (const [sId, item] of Object.entries(severities)) {
        if (!SEVERITY_SYNONYMS[sId]) {
          SEVERITY_SYNONYMS[sId] = item.keywords || [];
        } else {
          SEVERITY_SYNONYMS[sId] = Array.from(
            new Set([...SEVERITY_SYNONYMS[sId], ...(item.keywords || [])])
          );
        }
      }
    }

    if (bodyAreas) {
      for (const [bId, item] of Object.entries(bodyAreas)) {
        if (!BODY_AREA_SYNONYMS[bId]) {
          BODY_AREA_SYNONYMS[bId] = item.keywords || [];
        } else {
          BODY_AREA_SYNONYMS[bId] = Array.from(
            new Set([...BODY_AREA_SYNONYMS[bId], ...(item.keywords || [])])
          );
        }
      }
    }

    console.log('[Synonyms] Successfully loaded & merged live synonyms from MongoDB!');
    return true;
  } catch (err) {
    console.warn('[Synonyms] Failed to load synonyms from API, using offline dictionary:', err.message);
    return false;
  }
}


