const ASSAULT = [
  'assault', 'assaulted', 'attacked', 'attack', 'punched', 'punch',
  'shoved', 'pushed me', 'stabbed', 'stabbing', 'knife', 'box cutter',
  'weapon', 'gun', 'firearm', 'bleeding', 'blood', 'spit', 'spat on',
  'hit me', 'struck me', 'threw at me',
];

const THREATENED = [
  'threatened', 'threatening', 'following me', 'followed me to',
  'surrounding me', 'surrounded', 'in my face', 'going to hurt me',
  'gonna hurt me', 'kill me', 'knows where i live', 'filming my face',
];

const MEDICAL = [
  'collapsed', 'collapse', 'unconscious', 'not moving', 'unresponsive',
  'not breathing', 'stopped breathing', 'overdose', 'overdosed',
  'seizure', 'seizing', 'heart attack', 'not waking up', 'needle on floor',
];

const ACTIVE = [
  'gun', 'firearm', 'handgun', 'knife pulled', 'pulled a knife',
  'weapon on premises', 'shooting', 'shot fired', 'shots fired', 'bomb', 'suspicious device',
];

function checkKeywordOverride(message) {
  const msg = message.toLowerCase();
  if (ASSAULT.some((k) => msg.includes(k))) {
    return { intent: 'GUARD_ASSAULT', severity: 'critical', source: 'keyword_override' };
  }
  if (THREATENED.some((k) => msg.includes(k))) {
    return { intent: 'GUARD_THREATENED', severity: 'critical', source: 'keyword_override' };
  }
  if (ACTIVE.some((k) => msg.includes(k))) {
    return { intent: 'ACTIVE_THREAT', severity: 'critical', source: 'keyword_override' };
  }
  if (MEDICAL.some((k) => msg.includes(k))) {
    return { intent: 'MEDICAL_EMERGENCY', severity: 'critical', source: 'keyword_override' };
  }
  return null;
}

module.exports = { checkKeywordOverride };
