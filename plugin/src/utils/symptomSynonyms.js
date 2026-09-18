/**
 * Clinical Symptom & Body Area Synonym Dictionary
 * Maps natural, colloquial expressions to structured triage keys
 */

export const SYMPTOM_SYNONYMS = {
  // Head & Neck
  headache: {
    bodyArea: 'head_and_neck',
    symptomId: 'headache',
    keywords: [
      'headache', 'head ache', 'migraine', 'throbbing head', 'temple pain',
      'forehead pain', 'head pressure', 'cranial pain', 'head hurts', 'hemicrania'
    ]
  },
  dizziness: {
    bodyArea: 'head_and_neck',
    symptomId: 'dizziness',
    keywords: [
      'dizzy', 'dizziness', 'vertigo', 'spinning', 'lightheaded', 'light headed',
      'loss of balance', 'unsteady', 'woozy', 'giddy', 'equilibrium'
    ]
  },
  eye_pain: {
    bodyArea: 'head_and_neck',
    symptomId: 'eye_pain',
    keywords: [
      'eye pain', 'eyes hurt', 'blurry vision', 'blurred vision', 'vision loss',
      'red eye', 'pink eye', 'eye strain', 'ocular pain', 'double vision', 'seeing spots'
    ]
  },
  ear_pain: {
    bodyArea: 'head_and_neck',
    symptomId: 'ear_pain',
    keywords: [
      'ear pain', 'earache', 'ear ache', 'hearing loss', 'ringing ear',
      'tinnitus', 'blocked ear', 'ear infection', 'ears plugged'
    ]
  },
  sore_throat: {
    bodyArea: 'head_and_neck',
    symptomId: 'sore_throat',
    keywords: [
      'sore throat', 'throat hurts', 'difficulty swallowing', 'pain swallowing',
      'tonsil', 'tonsillitis', 'strep', 'scratchy throat', 'hoarse voice', 'pharyngitis'
    ]
  },
  neck_pain: {
    bodyArea: 'head_and_neck',
    symptomId: 'neck_pain',
    keywords: [
      'neck pain', 'stiff neck', 'neck stiffness', 'cervical pain',
      'whiplash', 'wry neck', 'crick in neck'
    ]
  },

  // Chest
  chest_pain: {
    bodyArea: 'chest',
    symptomId: 'chest_pain',
    keywords: [
      'chest pain', 'chest pressure', 'chest tightness', 'heavy chest',
      'crushing chest', 'heart pain', 'angina', 'sternum pain', 'chest ache'
    ]
  },
  burning_chest: {
    bodyArea: 'chest',
    symptomId: 'burning_chest',
    keywords: [
      'heartburn', 'heart burn', 'acid reflux', 'gerd', 'acidity',
      'burning in chest', 'sour burp', 'burning throat after eating', 'chest burn'
    ]
  },
  palpitations: {
    bodyArea: 'chest',
    symptomId: 'palpitations',
    keywords: [
      'palpitations', 'racing heart', 'heart racing', 'fast heartbeat',
      'fluttering heart', 'skipping beats', 'irregular pulse', 'tachycardia', 'heart pounding'
    ]
  },
  breathing_difficulty: {
    bodyArea: 'chest',
    symptomId: 'breathing_difficulty',
    keywords: [
      'shortness of breath', 'cant breathe', "can't breathe", 'breathless',
      'wheezing', 'asthma attack', 'gasping', 'dyspnea', 'hard to breathe', 'tight airways'
    ]
  },
  persistent_cough: {
    bodyArea: 'chest',
    symptomId: 'persistent_cough',
    keywords: [
      'cough', 'coughing', 'chronic cough', 'dry cough', 'wet cough',
      'phlegm', 'bronchitis', 'hacking cough', 'coughing blood'
    ]
  },

  // Upper Abdomen
  stomach_pain: {
    bodyArea: 'abdomen',
    symptomId: 'stomach_pain',
    keywords: [
      'stomach pain', 'stomach ache', 'belly pain', 'tummy ache',
      'tummy pain', 'gastritis', 'ulcer', 'cramping in stomach', 'upper abdomen pain', 'gut pain'
    ]
  },
  nausea_vomiting: {
    bodyArea: 'abdomen',
    symptomId: 'nausea_vomiting',
    keywords: [
      'nausea', 'nauseous', 'vomiting', 'throwing up', 'puking',
      'queasy', 'vomit', 'food poisoning', 'motion sickness'
    ]
  },
  bloating_indigestion: {
    bodyArea: 'abdomen',
    symptomId: 'bloating_indigestion',
    keywords: [
      'bloating', 'bloated', 'indigestion', 'gas', 'gassy',
      'burping', 'flatulence', 'feeling overly full', 'dyspepsia'
    ]
  },

  // Lower Abdomen & Pelvis
  lower_belly_pain: {
    bodyArea: 'lower_abdomen',
    symptomId: 'lower_belly_pain',
    keywords: [
      'lower abdominal pain', 'lower stomach', 'lower belly', 'appendix pain',
      'appendicitis', 'right lower quadrant', 'diverticulitis', 'lower gut ache'
    ]
  },
  burning_urination: {
    bodyArea: 'lower_abdomen',
    symptomId: 'burning_urination',
    keywords: [
      'burning urination', 'painful urination', 'uti', 'urinary infection',
      'pee hurts', 'burning pee', 'frequent urination', 'peeing often', 'blood in urine', 'dysuria'
    ]
  },
  pelvic_pain: {
    bodyArea: 'lower_abdomen',
    symptomId: 'pelvic_pain',
    keywords: [
      'pelvic pain', 'pelvis hurts', 'menstrual cramps', 'period pain',
      'ovary pain', 'groin pain', 'endometriosis', 'pelvic cramps'
    ]
  },

  // Arms
  arm_joint_pain: {
    bodyArea: 'left_arm',
    symptomId: 'arm_joint_pain',
    keywords: [
      'shoulder pain', 'elbow pain', 'rotator cuff', 'frozen shoulder',
      'arm joint', 'dislocated shoulder', 'tennis elbow'
    ]
  },
  arm_numbness: {
    bodyArea: 'left_arm',
    symptomId: 'arm_numbness',
    keywords: [
      'numb hand', 'numb fingers', 'tingling arm', 'pins and needles in hand',
      'carpal tunnel', 'hand falling asleep', 'arm neuropathy'
    ]
  },
  arm_muscle_pain: {
    bodyArea: 'left_arm',
    symptomId: 'arm_muscle_pain',
    keywords: [
      'arm strain', 'bicep pain', 'tricep pain', 'muscle weakness arm',
      'pulled arm muscle', 'arm ache'
    ]
  },

  // Legs
  knee_joint_pain: {
    bodyArea: 'left_leg',
    symptomId: 'knee_joint_pain',
    keywords: [
      'knee pain', 'swollen knee', 'knee injury', 'meniscus tear',
      'acl', 'runner knee', 'kneecap pain', 'patella'
    ]
  },
  ankle_foot_pain: {
    bodyArea: 'left_leg',
    symptomId: 'ankle_foot_pain',
    keywords: [
      'ankle pain', 'twisted ankle', 'sprained ankle', 'foot pain',
      'heel pain', 'plantar fasciitis', 'toe pain', 'swollen ankle'
    ]
  },
  walking_difficulty: {
    bodyArea: 'left_leg',
    symptomId: 'walking_difficulty',
    keywords: [
      'difficulty walking', 'cant walk', "can't walk", 'limping',
      'sciatica', 'shooting pain down leg', 'leg numbness', 'unsteady gait'
    ]
  },

  // Skin
  skin_rash: {
    bodyArea: 'skin',
    symptomId: 'skin_rash',
    keywords: [
      'rash', 'skin rash', 'itching', 'itchy skin', 'hives',
      'eczema', 'dermatitis', 'red spots on skin', 'allergy rash', 'skin redness'
    ]
  },
  acne_lesions: {
    bodyArea: 'skin',
    symptomId: 'acne_lesions',
    keywords: [
      'acne', 'pimples', 'pimple', 'blackheads', 'skin blemishes',
      'cyst on skin', 'mole change', 'skin bump', 'boil'
    ]
  },

  // Back
  lower_back_pain: {
    bodyArea: 'back',
    symptomId: 'lower_back_pain',
    keywords: [
      'lower back pain', 'low back pain', 'lumbago', 'slipped disc',
      'herniated disc', 'back strain', 'lumbar pain', 'lower back spasm'
    ]
  },
  upper_back_pain: {
    bodyArea: 'back',
    symptomId: 'upper_back_pain',
    keywords: [
      'upper back pain', 'shoulder blade pain', 'between shoulder blades',
      'thoracic back', 'upper spine pain', 'rib back pain'
    ]
  }
};

export const BODY_AREA_SYNONYMS = {
  head_and_neck: ['head', 'forehead', 'temple', 'neck', 'throat', 'eye', 'ear', 'face', 'cranial'],
  chest: ['chest', 'heart', 'lungs', 'ribs', 'breast', 'ribcage', 'sternum'],
  abdomen: ['stomach', 'tummy', 'belly', 'abdomen', 'digestive', 'gut', 'epigastric'],
  lower_abdomen: ['lower abdomen', 'lower belly', 'pelvis', 'groin', 'bladder', 'urinary', 'reproductive'],
  left_arm: ['left arm', 'left shoulder', 'left hand', 'left wrist', 'left elbow', 'arm', 'shoulder', 'hand', 'elbow', 'wrist'],
  right_arm: ['right arm', 'right shoulder', 'right hand', 'right wrist', 'right elbow'],
  left_leg: ['left leg', 'left knee', 'left foot', 'left ankle', 'leg', 'knee', 'foot', 'ankle', 'thigh', 'calf'],
  right_leg: ['right leg', 'right knee', 'right foot', 'right ankle'],
  skin: ['skin', 'rash', 'dermal', 'cutaneous', 'spots', 'itching all over'],
  back: ['back', 'spine', 'lower back', 'upper back', 'vertebrae', 'spinal']
};

export const DURATION_SYNONYMS = {
  hours: ['hours', 'hour', 'today', 'few hours', 'less than 24', 'just started', 'sudden', 'morning', 'since morning'],
  days: ['days', 'day', 'yesterday', 'few days', 'couple days', '1-6 days', '3 days', '4 days', '2 days'],
  weeks: ['weeks', 'week', '1-3 weeks', 'two weeks', 'a week', 'few weeks'],
  chronic: ['month', 'months', 'year', 'years', 'long time', 'chronic', 'ongoing for months']
};

export const SEVERITY_SYNONYMS = {
  mild: ['mild', 'slight', 'minor', 'little bit', 'tolerable', 'noticeable', 'manageable', 'light'],
  moderate: ['moderate', 'disrupts', 'disrupting', 'medium', 'uncomfortable', 'hard to work', 'trouble sleeping'],
  severe: ['severe', 'terrible', 'unbearable', 'intense', 'extreme', 'killing me', 'excruciating', 'very bad', 'debilitating']
};

/**
 * Match a raw free-text query against known symptoms and body parts.
 * Returns: { matchedType: 'symptom' | 'body_area' | 'general' | null, data: ... }
 */
export function matchFreeTextQuery(text) {
  if (!text || typeof text !== 'string') return { matchedType: null };
  const query = text.toLowerCase().trim();

  // 1. General Medicine / Non-specific trigger check
  const generalKeywords = [
    'general', 'not sure', 'dont know', "don't know", 'unsure', 'not clear',
    'fever', 'weak', 'weakness', 'fatigue', 'tired all over', 'feeling sick',
    'sick all over', 'multiple problems', 'whole body', 'unwell'
  ];
  if (generalKeywords.some(k => query.includes(k))) {
    return { matchedType: 'general' };
  }

  // 2. Direct Symptom match (Highest specificity)
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

  // 3. Body Area match
  for (const [areaKey, keywords] of Object.entries(BODY_AREA_SYNONYMS)) {
    for (const keyword of keywords) {
      if (query.includes(keyword)) {
        return {
          matchedType: 'body_area',
          bodyArea: areaKey,
          matchedKeyword: keyword
        };
      }
    }
  }

  // 4. Cannot detect
  return { matchedType: null };
}

/**
 * Match duration text
 */
export function matchDurationQuery(text) {
  const query = (text || '').toLowerCase().trim();
  for (const [durationId, keywords] of Object.entries(DURATION_SYNONYMS)) {
    if (keywords.some(k => query.includes(k))) {
      return durationId;
    }
  }
  return null;
}

/**
 * Match severity text
 */
export function matchSeverityQuery(text) {
  const query = (text || '').toLowerCase().trim();
  for (const [sevId, keywords] of Object.entries(SEVERITY_SYNONYMS)) {
    if (keywords.some(k => query.includes(k))) {
      return sevId;
    }
  }
  return null;
}
