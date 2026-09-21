/**
 * Clinical Symptom & Body Area Synonym Dictionary
 * Maps natural, colloquial expressions (including Indian English) to structured triage keys
 */

export const SYMPTOM_SYNONYMS = {
  // ── Head & Neck ──────────────────────────────────────────────────────────
  headache: {
    bodyArea: 'head_and_neck', symptomId: 'headache',
    keywords: ['headache', 'head ache', 'migraine', 'throbbing head', 'temple pain',
      'forehead pain', 'head pressure', 'cranial pain', 'head hurts', 'hemicrania',
      'pounding head', 'head is pounding', 'head spinning', 'head heavy', 'sir dard',
      'sar dard', 'heavy head', 'head pain', 'brow pain']
  },
  dizziness: {
    bodyArea: 'head_and_neck', symptomId: 'dizziness',
    keywords: ['dizzy', 'dizziness', 'vertigo', 'spinning', 'lightheaded', 'light headed',
      'loss of balance', 'unsteady', 'woozy', 'giddy', 'equilibrium', 'room spinning',
      'feel like falling', 'chakkar', 'chakkar aana', 'balance problem']
  },
  eye_pain: {
    bodyArea: 'head_and_neck', symptomId: 'eye_pain',
    keywords: ['eye pain', 'eyes hurt', 'blurry vision', 'blurred vision', 'vision loss',
      'red eye', 'pink eye', 'eye strain', 'ocular pain', 'double vision', 'seeing spots',
      'eyes watering', 'sore eye', 'aankh dard', 'aankhon mein dard']
  },
  blurred_vision: {
    bodyArea: 'head_and_neck', symptomId: 'blurred_vision',
    keywords: ['blurred vision', 'blurry vision', 'double vision', 'fuzzy vision',
      'cant see clearly', 'visual disturbance', 'vision changes', 'vision problems', 'blind spot']
  },
  red_eye: {
    bodyArea: 'head_and_neck', symptomId: 'red_eye',
    keywords: ['red eye', 'pink eye', 'bloodshot eye', 'conjunctivitis', 'sore red eye',
      'irritated eye', 'eye discharge', 'sticky eye', 'lal aankh']
  },
  ear_pain: {
    bodyArea: 'head_and_neck', symptomId: 'ear_pain',
    keywords: ['ear pain', 'earache', 'ear ache', 'hearing loss', 'ringing ear',
      'tinnitus', 'blocked ear', 'ear infection', 'ears plugged', 'can\'t hear well',
      'kaan dard', 'kaan mein dard', 'ear discharge', 'ear ringing']
  },
  tinnitus: {
    bodyArea: 'head_and_neck', symptomId: 'tinnitus',
    keywords: ['tinnitus', 'ringing in ear', 'buzzing in ear', 'ear ringing', 'ear buzzing',
      'hissing sound in ear', 'ear noise', 'whooshing ear']
  },
  sore_throat: {
    bodyArea: 'head_and_neck', symptomId: 'sore_throat',
    keywords: ['sore throat', 'throat hurts', 'difficulty swallowing', 'pain swallowing',
      'tonsil', 'tonsillitis', 'strep', 'scratchy throat', 'hoarse voice', 'pharyngitis',
      'gale mein dard', 'gala dard', 'throat pain', 'throat inflammation', 'swollen throat']
  },
  hoarseness: {
    bodyArea: 'head_and_neck', symptomId: 'hoarseness',
    keywords: ['hoarse', 'hoarseness', 'voice change', 'lost voice', 'voice loss', 'raspy voice',
      'voice gone', 'voice problem', 'can\'t speak properly', 'speaking difficulty']
  },
  neck_pain: {
    bodyArea: 'head_and_neck', symptomId: 'neck_pain',
    keywords: ['neck pain', 'stiff neck', 'neck stiffness', 'cervical pain',
      'whiplash', 'wry neck', 'crick in neck', 'gardan dard', 'gardan akad',
      'neck tight', 'neck sore', 'nape pain']
  },
  blocked_nose: {
    bodyArea: 'head_and_neck', symptomId: 'blocked_nose',
    keywords: ['blocked nose', 'stuffy nose', 'nasal congestion', 'cant breathe through nose',
      'blocked nostrils', 'nasal block', 'nose blocked', 'nose stuffed', 'naak band']
  },
  runny_nose: {
    bodyArea: 'head_and_neck', symptomId: 'runny_nose',
    keywords: ['runny nose', 'nose running', 'nasal discharge', 'snot', 'dripping nose',
      'naak beh rahi', 'watery nose', 'post nasal drip']
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
      'seene mein dard', 'dil ka dard', 'heart attack', 'chest squeezing']
  },
  burning_chest: {
    bodyArea: 'chest', symptomId: 'burning_chest',
    keywords: ['heartburn', 'heart burn', 'acid reflux', 'gerd', 'acidity',
      'burning in chest', 'sour burp', 'burning throat after eating', 'chest burn',
      'seene mein jalan']
  },
  palpitations: {
    bodyArea: 'chest', symptomId: 'palpitations',
    keywords: ['palpitations', 'racing heart', 'heart racing', 'fast heartbeat',
      'fluttering heart', 'skipping beats', 'irregular pulse', 'tachycardia', 'heart pounding',
      'dil tez dhadak', 'dil ki dhadkan', 'heartbeat fast', 'irregular heartbeat']
  },
  breathing_difficulty: {
    bodyArea: 'chest', symptomId: 'breathing_difficulty',
    keywords: ['shortness of breath', 'cant breathe', 'can\'t breathe', 'breathless',
      'wheezing', 'asthma attack', 'gasping', 'dyspnea', 'hard to breathe', 'tight airways',
      'saans nahi aa rahi', 'sans lena mushkil', 'breathlessness', 'difficulty breathing']
  },
  persistent_cough: {
    bodyArea: 'chest', symptomId: 'persistent_cough',
    keywords: ['cough', 'coughing', 'chronic cough', 'dry cough', 'wet cough',
      'phlegm', 'bronchitis', 'hacking cough', 'coughing blood', 'khasi', 'khansi',
      'persistent cough', 'cough for weeks', 'mucus cough']
  },
  chest_congestion: {
    bodyArea: 'chest', symptomId: 'chest_congestion',
    keywords: ['chest congestion', 'chest tightness', 'mucus in chest', 'phlegm', 'productive cough',
      'chest feels heavy', 'blocked chest', 'chest rattling']
  },
  blood_in_sputum: {
    bodyArea: 'chest', symptomId: 'blood_in_sputum',
    keywords: ['coughing blood', 'blood in sputum', 'blood in phlegm', 'haemoptysis',
      'blood when coughing', 'spitting blood', 'cough up blood']
  },
  fainting: {
    bodyArea: 'chest', symptomId: 'fainting',
    keywords: ['fainting', 'fainted', 'passed out', 'loss of consciousness', 'blackout',
      'syncope', 'fell unconscious', 'went blank', 'collapse', 'behoosh']
  },

  // ── Upper Abdomen ─────────────────────────────────────────────────────────
  stomach_pain: {
    bodyArea: 'abdomen', symptomId: 'stomach_pain',
    keywords: ['stomach pain', 'stomach ache', 'belly pain', 'abdominal pain', 'tummy pain',
      'tummy ache', 'gut pain', 'epigastric pain', 'pain after eating', 'upper belly pain',
      'pet dard', 'pait dard', 'pet mein dard', 'stomach cramps', 'gastric pain']
  },
  nausea_vomiting: {
    bodyArea: 'abdomen', symptomId: 'nausea_vomiting',
    keywords: ['nausea', 'vomiting', 'throwing up', 'feel like vomiting', 'feel sick',
      'queasy', 'nauseated', 'puking', 'ulti', 'ulti aana', 'ji machlana', 'vomit',
      'upset stomach', 'want to vomit', 'sick to stomach']
  },
  bloating_indigestion: {
    bodyArea: 'abdomen', symptomId: 'bloating_indigestion',
    keywords: ['bloating', 'bloated', 'indigestion', 'gas', 'flatulence', 'burping', 'belching',
      'full feeling', 'stomach bloated', 'heavy stomach', 'afara', 'gas problem',
      'acidity problem', 'dyspepsia', 'stomach gas', 'pet phula', 'gulping gas']
  },
  diarrhea: {
    bodyArea: 'abdomen', symptomId: 'diarrhea',
    keywords: ['diarrhea', 'diarrhoea', 'loose motion', 'loose motions', 'loose stools',
      'watery stool', 'watery stools', 'watery poop', 'running stomach', 'stomach running',
      'dast', 'dast lagna', 'pet kharab', 'loose potty', 'motions', 'frequent motions',
      'stomach upset stool', 'intestinal problem', 'gastroenteritis', 'loose bowel']
  },
  constipation: {
    bodyArea: 'abdomen', symptomId: 'constipation',
    keywords: ['constipation', 'constipated', 'hard stool', 'difficulty passing stool',
      'no bowel movement', 'cannot pass stool', 'stool problem', 'kabj', 'constipation problem',
      'straining to pass stool', 'irregularity', 'not going to toilet']
  },
  heartburn_acidity: {
    bodyArea: 'abdomen', symptomId: 'heartburn_acidity',
    keywords: ['heartburn', 'acidity', 'acid reflux', 'gerd', 'burning sensation stomach',
      'burning after food', 'sour taste', 'burp sour', 'stomach acid', 'jalan pet mein',
      'seene mein jalan khane ke baad', 'gas acidity', 'burning upper stomach']
  },
  blood_in_stool: {
    bodyArea: 'abdomen', symptomId: 'blood_in_stool',
    keywords: ['blood in stool', 'bloody stool', 'rectal bleeding', 'blood in poop',
      'blood with bowel movement', 'blood when passing stool', 'haematochezia',
      'potty mein khoon', 'motions mein khoon']
  },
  black_stool: {
    bodyArea: 'abdomen', symptomId: 'black_stool',
    keywords: ['black stool', 'tarry stool', 'dark stool', 'black poop', 'melaena',
      'dark bowel movement', 'black colored stool', 'bleeding gut']
  },
  jaundice: {
    bodyArea: 'abdomen', symptomId: 'jaundice',
    keywords: ['jaundice', 'yellow eyes', 'yellow skin', 'yellowing', 'skin yellow',
      'whites of eyes yellow', 'piliya', 'pilia', 'yellow urine', 'dark urine with yellow skin']
  },

  // ── Lower Abdomen ─────────────────────────────────────────────────────────
  lower_belly_pain: {
    bodyArea: 'lower_abdomen', symptomId: 'lower_belly_pain',
    keywords: ['lower abdominal pain', 'lower belly pain', 'lower tummy pain', 'pelvic pain',
      'appendix pain', 'lower right pain', 'lower left pain', 'niche pet dard']
  },
  burning_urination: {
    bodyArea: 'lower_abdomen', symptomId: 'burning_urination',
    keywords: ['burning urination', 'burning pee', 'painful urination', 'uti', 'urine infection',
      'frequent urination', 'passing urine hurts', 'peshab mein jalan', 'peshab jalan',
      'urine burning', 'urinary tract infection', 'bladder infection', 'dysuria']
  },
  flank_pain: {
    bodyArea: 'lower_abdomen', symptomId: 'flank_pain',
    keywords: ['flank pain', 'side pain', 'kidney pain', 'loin pain', 'back side pain',
      'kidney stones', 'renal colic', 'pain radiating to groin', 'waist pain']
  },
  blood_in_urine: {
    bodyArea: 'lower_abdomen', symptomId: 'blood_in_urine',
    keywords: ['blood in urine', 'red urine', 'pink urine', 'haematuria', 'blood when urinating',
      'bloody urine', 'urine with blood', 'peshab mein khoon']
  },
  difficulty_urinating: {
    bodyArea: 'lower_abdomen', symptomId: 'difficulty_urinating',
    keywords: ['difficulty urinating', 'can\'t pee', 'trouble urinating', 'weak stream',
      'urine retention', 'unable to urinate', 'peshab nahi aa raha', 'urinary obstruction']
  },
  urinary_urgency: {
    bodyArea: 'lower_abdomen', symptomId: 'urinary_urgency',
    keywords: ['frequent urination', 'urinary urgency', 'urge to urinate', 'going to toilet often',
      'peshab baar baar', 'need to pee often', 'overactive bladder']
  },

  // ── Arms ──────────────────────────────────────────────────────────────────
  arm_joint_pain: {
    bodyArea: 'left_arm', symptomId: 'arm_joint_pain',
    keywords: ['shoulder pain', 'elbow pain', 'arm joint pain', 'rotator cuff', 'arm ache',
      'shoulder ache', 'joint pain arm', 'kaandha dard']
  },
  arm_numbness: {
    bodyArea: 'left_arm', symptomId: 'arm_numbness',
    keywords: ['arm numbness', 'numb arm', 'tingling arm', 'pins and needles arm',
      'carpal tunnel', 'hand numb', 'fingers numb', 'hand tingling']
  },

  // ── Legs ──────────────────────────────────────────────────────────────────
  knee_joint_pain: {
    bodyArea: 'left_leg', symptomId: 'knee_joint_pain',
    keywords: ['knee pain', 'knee swelling', 'knee ache', 'joint pain knee', 'ghutna dard',
      'knee problem', 'knee stiff', 'knee clicking', 'torn ligament']
  },
  ankle_foot_pain: {
    bodyArea: 'left_leg', symptomId: 'ankle_foot_pain',
    keywords: ['ankle pain', 'foot pain', 'sprained ankle', 'heel pain', 'plantar fasciitis',
      'foot ache', 'paon dard', 'ankle swollen', 'foot swollen']
  },
  lower_back_pain: {
    bodyArea: 'back', symptomId: 'lower_back_pain',
    keywords: ['lower back pain', 'back pain', 'back ache', 'backache', 'lumbar pain',
      'kamar dard', 'spine pain', 'sciatica', 'disc problem', 'slipped disc',
      'lower back ache', 'back spasm', 'back stiff']
  },

  // ── Skin ──────────────────────────────────────────────────────────────────
  skin_rash: {
    bodyArea: 'skin', symptomId: 'skin_rash',
    keywords: ['rash', 'skin rash', 'itching', 'itchy skin', 'skin irritation',
      'redness skin', 'eczema', 'dermatitis', 'allergy rash', 'khujli', 'daane',
      'hives', 'urticaria', 'prickly heat', 'skin reaction']
  },
  acne_lesions: {
    bodyArea: 'skin', symptomId: 'acne_lesions',
    keywords: ['acne', 'pimples', 'blemishes', 'breakout', 'zits', 'skin lesion', 'blackhead',
      'whitehead', 'cystic acne', 'mole', 'skin growth', 'spot on skin']
  },

  // ── General / Whole Body ──────────────────────────────────────────────────
  fever: {
    bodyArea: 'general', symptomId: 'fever',
    keywords: ['fever', 'feverish', 'high temperature', 'temperature', 'bukhar', 'bukhaar',
      'hot body', 'body hot', 'running a fever', 'pyrexia', 'febrile', 'chills and fever',
      'temperature high', '100 degree', '101 degree', 'high fever', 'mild fever']
  },
  fatigue: {
    bodyArea: 'general', symptomId: 'fatigue',
    keywords: ['fatigue', 'tired', 'tiredness', 'exhausted', 'exhaustion', 'extreme tiredness',
      'no energy', 'always tired', 'constantly tired', 'thakaan', 'thaka hua',
      'very tired', 'weak and tired', 'burnout', 'lethargy', 'lethargic']
  },
  general_weakness: {
    bodyArea: 'general', symptomId: 'general_weakness',
    keywords: ['weakness', 'weak', 'general weakness', 'body weakness', 'feeling weak',
      'low energy', 'energy loss', 'kamzori', 'taqat nahi', 'feel faint', 'debility']
  },
  body_ache: {
    bodyArea: 'general', symptomId: 'body_ache',
    keywords: ['body ache', 'body pain', 'muscle ache', 'muscle pain', 'myalgia', 'aching body',
      'all over pain', 'body hurts', 'badan dard', 'whole body pain', 'flu aches',
      'joints aching', 'everything hurts']
  },
  chills: {
    bodyArea: 'general', symptomId: 'chills',
    keywords: ['chills', 'shivering', 'rigors', 'feeling cold', 'cold shakes', 'teeth chattering',
      'thanda lag raha', 'ठण्ड लग रही', 'shaking with cold']
  },
  loss_of_appetite: {
    bodyArea: 'general', symptomId: 'loss_of_appetite',
    keywords: ['loss of appetite', 'no appetite', 'not eating', 'not hungry', 'don\'t want to eat',
      'can\'t eat', 'food aversion', 'appetite lost', 'bhook nahi', 'bhookh nahi lag rahi']
  },
  unexplained_weight_loss: {
    bodyArea: 'general', symptomId: 'unexplained_weight_loss',
    keywords: ['weight loss', 'losing weight', 'unintentional weight loss', 'unexplained weight loss',
      'wazn kam ho raha', 'body weight reducing', 'getting thin', 'sudden weight loss']
  },
  dehydration: {
    bodyArea: 'general', symptomId: 'dehydration',
    keywords: ['dehydration', 'dehydrated', 'not urinating', 'very thirsty', 'dry mouth',
      'no urine', 'extremely thirsty', 'extreme thirst with weakness', 'pani ki kami']
  },

  // ── Reproductive / Women's Health ─────────────────────────────────────────
  missed_period: {
    bodyArea: 'reproductive', symptomId: 'missed_period',
    keywords: ['missed period', 'period missed', 'no period', 'period late', 'late period',
      'periods stopped', 'menstruation missed', 'periods delayed', 'mahwari nahi aayi',
      'pregnancy test', 'mc missing', 'mc late']
  },
  irregular_periods: {
    bodyArea: 'reproductive', symptomId: 'irregular_periods',
    keywords: ['irregular periods', 'irregular menstruation', 'periods irregular', 'cycle irregular',
      'menses irregular', 'periods coming and going', 'irregular mc', 'mahwari bekaida']
  },
  heavy_periods: {
    bodyArea: 'reproductive', symptomId: 'heavy_periods',
    keywords: ['heavy periods', 'heavy bleeding period', 'heavy flow', 'menorrhagia',
      'excessive bleeding period', 'periods heavy', 'soaking pads', 'heavy menstruation',
      'zyada khoon period mein', 'heavy mc']
  },
  vaginal_discharge: {
    bodyArea: 'reproductive', symptomId: 'vaginal_discharge',
    keywords: ['vaginal discharge', 'white discharge', 'yellow discharge', 'green discharge',
      'abnormal discharge', 'vaginal itching', 'vaginal odour', 'leucorrhoea', 'safed paani',
      'discharge vaginal', 'itching vagina', 'vaginal smell']
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
      'extreme thirst', 'diabetes thirst', 'polydipsia', 'bahut pyaas', 'zyada pyaas',
      'dry throat constantly', 'constantly thirsty']
  },
  excessive_urination: {
    bodyArea: 'metabolic', symptomId: 'excessive_urination',
    keywords: ['excessive urination', 'urinating a lot', 'polyuria', 'peeing a lot',
      'lots of urine', 'increased urination', 'frequent peeing', 'diabetes urine',
      'zyada peshab', 'bahut zyada peshab aana']
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
      'always worried', 'fear without reason', 'tension', 'ghabrahat', 'ghabrana',
      'restless', 'cant stop worrying', 'overthinking', 'panic feeling']
  },
  panic_attack: {
    bodyArea: 'mental_health', symptomId: 'panic_attack',
    keywords: ['panic attack', 'panic', 'sudden fear', 'intense fear', 'heart racing anxiety',
      'feel like dying suddenly', 'overwhelming fear', 'sudden dread']
  },
  depressed_mood: {
    bodyArea: 'mental_health', symptomId: 'depressed_mood',
    keywords: ['depression', 'depressed', 'low mood', 'feeling sad', 'hopeless', 'sad all the time',
      'no motivation', 'feeling empty', 'dukhi', 'udaas', 'mentally low', 'feel worthless',
      'anhedonia', 'lost interest in everything', 'persistent sadness']
  },
  sleep_problem: {
    bodyArea: 'mental_health', symptomId: 'sleep_problem',
    keywords: ['insomnia', 'can\'t sleep', 'sleep problem', 'not sleeping', 'sleeplessness',
      'poor sleep', 'waking up at night', 'neend nahi', 'neend nahi aati', 'restless sleep',
      'can\'t fall asleep', 'sleep disorder', 'unable to sleep']
  },
  suicidal_thoughts: {
    bodyArea: 'mental_health', symptomId: 'suicidal_thoughts',
    keywords: ['suicidal thoughts', 'want to die', 'thinking of suicide', 'self harm',
      'harming myself', 'thoughts of ending life', 'self-harm', 'hurt myself',
      'don\'t want to live', 'jeevan nahi chahiye']
  }
};

export const BODY_AREA_SYNONYMS = {
  head_and_neck: ['head', 'forehead', 'temple', 'neck', 'throat', 'eye', 'ear', 'face', 'cranial',
    'sar', 'sir', 'gardan', 'gala', 'naak', 'nose', 'sinus', 'scalp'],
  chest: ['chest', 'heart', 'lungs', 'ribs', 'breast', 'ribcage', 'sternum', 'seena', 'seene'],
  abdomen: ['stomach', 'tummy', 'belly', 'abdomen', 'digestive', 'gut', 'epigastric', 'pet', 'pait'],
  lower_abdomen: ['lower abdomen', 'lower belly', 'pelvis', 'groin', 'bladder', 'urinary', 'reproductive',
    'peshab', 'niche pet'],
  left_arm: ['left arm', 'left shoulder', 'left hand', 'left wrist', 'left elbow', 'arm', 'shoulder', 'hand', 'elbow', 'wrist', 'kaandha'],
  right_arm: ['right arm', 'right shoulder', 'right hand', 'right wrist', 'right elbow'],
  left_leg: ['left leg', 'left knee', 'left foot', 'left ankle', 'leg', 'knee', 'foot', 'ankle', 'thigh', 'calf', 'ghutna', 'paon'],
  right_leg: ['right leg', 'right knee', 'right foot', 'right ankle'],
  skin: ['skin', 'rash', 'dermal', 'cutaneous', 'spots', 'itching all over', 'body rash', 'khujli'],
  back: ['back', 'spine', 'lower back', 'upper back', 'vertebrae', 'spinal', 'kamar', 'kamar dard'],
  general: ['general', 'whole body', 'fever', 'fatigue', 'weak', 'tired', 'bukhar', 'thakaan', 'body ache'],
  reproductive: ['periods', 'period', 'menstrual', 'pregnancy', 'women', 'vaginal', 'breast', 'mahwari', 'mc'],
  metabolic: ['diabetes', 'thyroid', 'thirst', 'sugar', 'metabolic', 'weight', 'endocrine'],
  mental_health: ['anxiety', 'depression', 'stress', 'mental', 'panic', 'insomnia', 'worry', 'tension', 'ghabrahat', 'udaas']
};

export const DURATION_SYNONYMS = {
  hours: ['hours', 'hour', 'today', 'few hours', 'less than 24', 'just started', 'sudden', 'morning',
    'since morning', 'this morning', 'since today', 'aaj se', 'kuch ghante', 'since last night',
    'tonight', 'this evening', 'this afternoon', 'past few hours'],
  days: ['days', 'day', 'yesterday', 'few days', 'couple days', '1-6 days', '3 days', '4 days',
    '2 days', 'since yesterday', 'two days', 'three days', 'four days', 'kal se', 'do din se',
    'teen din se', '2-3 days', 'a couple of days', 'couple of days', 'last day', 'past day',
    'past two days', 'past 2 days', 'for past two days', 'past few days', 'last 2 days',
    'last two days', 'for holiday', 'off last day'],
  weeks: ['weeks', 'week', '1-3 weeks', 'two weeks', 'a week', 'few weeks', 'hafte se',
    'ek hafte se', 'do hafte se', 'last week', 'past week', 'one week', '10 days', '12 days'],
  chronic: ['month', 'months', 'year', 'years', 'long time', 'chronic', 'ongoing', 'mahine se',
    'saalon se', 'always had', 'for a long time', 'persistent', 'more than a month',
    'several months', 'half a year']
};

export const SEVERITY_SYNONYMS = {
  mild: ['mild', 'smile', 'smiled', 'mile', 'miles', 'mildly', 'while', 'wild', 'slight', 'minor',
    'little bit', 'tolerable', 'noticeable', 'manageable', 'light', 'not too bad', 'bearable',
    'a bit', 'thoda', 'thodi si', 'hafif', 'okay-ish', 'small pain', 'low grade', 'dull ache',
    'faint pain'],
  moderate: ['moderate', 'moderately', 'disrupts', 'disrupting', 'medium', 'uncomfortable',
    'hard to work', 'trouble sleeping', 'bothering me', 'quite bad', 'fairly bad',
    'affecting my routine', 'cant work properly', 'medium pain', 'theek theek', 'kafi dard'],
  severe: ['severe', 'severely', 'serious', 'it\'s serious', 'its serious', 'terrible',
    'unbearable', 'intense', 'extreme', 'killing me', 'excruciating', 'very bad', 'debilitating',
    'worst pain', 'horrible', 'can\'t move', 'really bad', 'pounding', 'throbbing bad',
    'bahut zyada dard', 'bahut bura', 'severe pain', 'emergency level', 'can\'t bear it',
    'intolerable', '50 severe', 'so severe']
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

  for (const [key, item] of Object.entries(SYMPTOM_SYNONYMS)) {
    for (const keyword of item.keywords) {
      if (query.includes(keyword)) {
        return {
          matchedType: 'symptom',
          symptomKey: key,
          bodyArea: item.bodyArea,
          symptomId: item.symptomId,
          matchedKeyword: keyword
        };
      }
    }
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

export async function loadSynonymsFromApi(apiBaseUrl = 'http://localhost:5000') {
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


