/**
 * Generates frontend/src/lib/remedies/catalog.json — 220+ educational wellness topics.
 * Content is structure/function + traditional-use research framing only — not medical advice.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Hot / high-intent SEO topics (Pro-gated deep monographs) */
const HOT_SLUGS = new Set([
  'common-cold',
  'influenza-like-illness',
  'seasonal-allergies',
  'migraine',
  'tension-headache',
  'insomnia',
  'anxiety-stress',
  'mild-depression-mood',
  'acid-reflux',
  'irritable-bowel-symptoms',
  'constipation',
  'diarrhea',
  'menstrual-cramps',
  'menopause-hot-flashes',
  'eczema-dry-skin',
  'acne',
  'back-pain',
  'joint-stiffness',
  'urinary-tract-discomfort',
  'sore-throat',
  'sinus-congestion',
  'cough',
  'nausea',
  'fatigue',
  'high-blood-pressure-lifestyle',
  'type-2-blood-sugar-support',
  'pms',
  'hair-thinning',
  'brain-fog',
  'immune-support',
]);

/**
 * [slug, name, category, primaryTraditionalRemedies[], conventionalCareBullets[], seekCareFlags[]]
 * Categories: respiratory, digestive, skin, pain, sleep-mood, women's, men's, immune, metabolic, neuro, oral, eye-ear, circulatory, urinary, musculoskeletal, general
 */
const RAW = [
  // Respiratory
  ['common-cold', 'Common cold', 'respiratory', ['elderberry syrup', 'honey-lemon tea', 'steam inhalation with eucalyptus', 'zinc lozenges', 'rest and hydration'], ['supportive care', 'rest', 'fluids', 'OTC decongestants or pain relievers as directed', 'antivirals only if prescribed for other conditions'], ['trouble breathing', 'high fever lasting days', 'symptoms beyond 10 days worsening', 'chest pain']],
  ['influenza-like-illness', 'Influenza-like illness', 'respiratory', ['rest', 'warm broths', 'elderflower tea', 'ginger tea', 'humidified air'], ['clinical evaluation', 'antiviral medication when appropriate', 'fever and pain management', 'flu testing when indicated'], ['difficulty breathing', 'confusion', 'severe dehydration', 'high-risk groups (elderly, pregnant, immunocompromised)']],
  ['seasonal-allergies', 'Seasonal allergies', 'respiratory', ['nettle tea', 'local honey (traditional)', 'saline nasal rinse', 'quercetin-rich foods', 'HEPA filtration'], ['antihistamines', 'nasal corticosteroid sprays', 'allergy testing', 'immunotherapy when indicated'], ['wheezing', 'anaphylaxis signs', 'severe asthma symptoms']],
  ['sinus-congestion', 'Sinus congestion', 'respiratory', ['saline rinse', 'steam', 'warm compress', 'eucalyptus inhalation', 'hydration'], ['decongestants short-term', 'nasal steroids', 'evaluation for bacterial sinusitis', 'imaging if chronic'], ['facial swelling', 'vision changes', 'severe headache with fever']],
  ['sore-throat', 'Sore throat', 'respiratory', ['salt-water gargle', 'slippery elm tea', 'honey', 'marshmallow root tea', 'warm broth'], ['strep testing when indicated', 'antibiotics only for bacterial infection', 'pain relief', 'voice rest'], ['inability to swallow', 'drooling', 'rash with fever', 'breathing difficulty']],
  ['cough', 'Cough', 'respiratory', ['honey (adults/children over 1 year)', 'thyme tea', 'humid air', 'licorice root tea (short-term)', 'rest'], ['identify cause', 'cough suppressants or expectorants as directed', 'inhalers if asthma', 'chest imaging if needed'], ['coughing blood', 'shortness of breath', 'unexplained weight loss', 'cough > 3 weeks']],
  ['bronchitis-symptoms', 'Acute bronchitis symptoms', 'respiratory', ['steam', 'honey-ginger tea', 'rest', 'hydration', 'mullein tea (traditional)'], ['supportive care', 'inhaled medicines if wheezing', 'antibiotics usually not first-line for viral'], ['high fever', 'chest pain', 'blue lips', 'severe breathlessness']],
  ['post-nasal-drip', 'Post-nasal drip', 'respiratory', ['saline rinse', 'steam', 'elevate head while sleeping', 'peppermint tea', 'hydration'], ['treat underlying allergy or reflux', 'nasal sprays', 'ENT referral if chronic'], ['bloody mucus', 'unilateral symptoms', 'severe facial pain']],
  ['hay-fever', 'Hay fever (allergic rhinitis)', 'respiratory', ['nettle', 'butterbur (PA-free only)', 'saline rinse', 'local pollen avoidance', 'cool compress for eyes'], ['antihistamines', 'nasal steroids', 'allergy shots'], ['asthma attack', 'anaphylaxis']],
  ['laryngitis', 'Laryngitis / hoarse voice', 'respiratory', ['voice rest', 'steam', 'honey-lemon', 'slippery elm', 'humid air'], ['voice rest', 'treat infection if present', 'ENT for prolonged hoarseness'], ['hoarseness > 2 weeks', 'breathing difficulty', 'swallowing pain with fever']],
  ['ear-congestion', 'Ear fullness / congestion', 'ear-nose', ['warm compress', 'steam', 'gentle yawning/swallowing', 'garlic-mullein oil (external, traditional)', 'hydration'], ['evaluate middle-ear fluid', 'decongestants when appropriate', 'ear exam'], ['severe ear pain', 'drainage', 'hearing sudden loss', 'dizziness with vomiting']],
  ['swimmers-ear-discomfort', 'Outer ear discomfort (swimmer’s ear pattern)', 'ear-nose', ['keep ear dry', 'warm compress', 'avoid inserting objects', 'dilute vinegar rinse only if recommended by clinician'], ['antibiotic ear drops when infected', 'pain control', 'ear cleaning by clinician'], ['severe pain', 'swelling of face', 'fever']],
  // Digestive
  ['acid-reflux', 'Acid reflux / heartburn symptoms', 'digestive', ['ginger tea', 'slippery elm', 'aloe vera juice (inner leaf, food-grade)', 'smaller meals', 'elevate head of bed'], ['antacids', 'H2 blockers', 'PPIs when indicated', 'diet counseling', 'endoscopy if alarm symptoms'], ['chest pain radiating to arm/jaw', 'black stools', 'unintentional weight loss', 'difficulty swallowing']],
  ['nausea', 'Nausea', 'digestive', ['ginger', 'peppermint tea', 'small bland meals', 'acupressure wrist points (traditional)', 'hydration with electrolytes'], ['antiemetics when prescribed', 'find underlying cause', 'IV fluids if dehydrated'], ['severe vomiting', 'blood in vomit', 'stiff neck with fever', 'pregnancy concerns']],
  ['constipation', 'Constipation', 'digestive', ['psyllium husk', 'prunes', 'flaxseed', 'magnesium-rich foods', 'movement and water'], ['fiber', 'osmotic laxatives', 'stimulant laxatives short-term', 'evaluate for obstruction if severe'], ['no stool with severe pain/vomiting', 'blood in stool', 'unexplained weight loss']],
  ['diarrhea', 'Diarrhea', 'digestive', ['oral rehydration', 'BRAT-style bland foods', 'probiotic-rich yogurt (if tolerated)', 'chamomile tea', 'avoid dairy temporarily'], ['rehydration', 'stool testing when needed', 'antibiotics only if indicated'], ['blood in stool', 'high fever', 'signs of severe dehydration', 'diarrhea > 2 days in vulnerable people']],
  ['irritable-bowel-symptoms', 'IBS-like digestive discomfort', 'digestive', ['peppermint oil enteric capsules (studied for IBS symptoms)', 'ginger', 'soluble fiber titration', 'stress reduction', 'low-FODMAP trial under guidance'], ['symptom-based diagnosis after red flags ruled out', 'antispasmodics', 'dietitian referral', 'gut-directed therapy'], ['nighttime diarrhea', 'rectal bleeding', 'anemia', 'family history of IBD/cancer with new symptoms']],
  ['bloating', 'Bloating', 'digestive', ['fennel tea', 'peppermint', 'ginger', 'chew slowly', 'walk after meals'], ['evaluate diet triggers', 'test for intolerances', 'imaging if obstruction suspected'], ['severe abdominal pain', 'vomiting with no gas/stool', 'fever']],
  ['gas-flatulence', 'Excess gas', 'digestive', ['fennel', 'caraway', 'ginger', 'simethicone-compatible habits', 'reduce carbonated drinks'], ['diet review', 'enzyme support if indicated', 'rule out malabsorption'], ['unexplained weight loss', 'persistent pain']],
  ['indigestion', 'Indigestion (dyspepsia)', 'digestive', ['ginger', 'chamomile', 'smaller meals', 'apple cider vinegar folklore (mixed evidence)', 'avoid late heavy meals'], ['antacids', 'H. pylori testing when appropriate', 'endoscopy if alarm features'], ['black stools', 'anemia', 'progressive swallowing trouble']],
  ['food-poisoning-recovery', 'Foodborne illness recovery (mild)', 'digestive', ['oral rehydration', 'rest', 'bland foods', 'probiotics after acute phase', 'ginger for nausea'], ['supportive care', 'stool culture if severe/outbreak', 'antibiotics rarely'], ['bloody diarrhea', 'high fever', 'neurologic symptoms', 'infant/elderly dehydration']],
  ['motion-sickness', 'Motion sickness', 'digestive', ['ginger', 'fresh air', 'look at horizon', 'acupressure bands', 'peppermint aroma'], ['antihistamine motion meds', 'scopolamine when prescribed'], ['vomiting preventing fluids', 'neurologic red flags']],
  ['gallbladder-discomfort', 'Gallbladder-area discomfort (biliary colic pattern)', 'digestive', ['low-fat meals temporarily', 'avoid crash diets', 'peppermint tea for mild gas (not a cure)'], ['ultrasound', 'pain control', 'surgery evaluation if stones', 'ER for severe attacks'], ['severe RUQ pain with fever/jaundice', 'vomiting bile', 'chest pain']],
  ['liver-support-lifestyle', 'Liver-supportive lifestyle (general wellness)', 'digestive', ['milk thistle (traditional hepatoprotective herb)', 'dandelion root tea', 'limit alcohol', 'cruciferous vegetables', 'adequate protein'], ['labs for liver enzymes', 'address viral hepatitis/alcohol/meds', 'hepatology referral'], ['jaundice', 'abdominal swelling', 'confusion', 'vomiting blood']],
  // Skin
  ['eczema-dry-skin', 'Eczema / dry irritated skin', 'skin', ['colloidal oatmeal baths', 'coconut or sunflower oil moisturizers', 'calendula cream', 'wet-wrap moisturization', 'fragrance-free routines'], ['topical corticosteroids', 'calcineurin inhibitors', 'allergy evaluation', 'infection treatment if present'], ['widespread infection signs', 'fever with rash', 'infant not feeding']],
  ['acne', 'Acne', 'skin', ['tea tree oil diluted', 'green tea compress', 'zinc-rich foods', 'gentle cleansing', 'honey spot folklore'], ['benzoyl peroxide', 'retinoids', 'oral meds for moderate-severe', 'derm consult'], ['cystic scarring acne', 'sudden adult acne with other hormone signs']],
  ['psoriasis-mild', 'Mild psoriasis-like plaques', 'skin', ['oatmeal baths', 'aloe', 'dead sea salt soaks (if accessible)', 'turmeric in diet (traditional)', 'moisturize heavily'], ['topical steroids', 'vitamin D analogues', 'phototherapy', 'systemic agents for moderate-severe'], ['joint pain with rash', 'covering large body surface', 'infection']],
  ['athlete-foot', "Athlete's foot symptoms", 'skin', ['keep feet dry', 'tea tree diluted', 'vinegar foot soaks (traditional)', 'rotate shoes', 'antifungal powders lifestyle'], ['topical antifungals', 'oral antifungals if needed'], ['spreading redness', 'fever', 'diabetes with foot infection']],
  ['cold-sores', 'Cold sores (oral herpes pattern)', 'skin', ['lemon balm cream (studied traditionally)', 'ice', 'lysine-rich foods folklore', 'avoid kissing during outbreaks', 'stress reduction'], ['antiviral creams or oral antivirals', 'pain relief'], ['eye involvement', 'widespread sores', 'immunosuppression']],
  ['sunburn', 'Sunburn', 'skin', ['cool baths', 'aloe vera gel', 'hydration', 'loose clothing', 'avoid further sun'], ['cool compresses', 'NSAIDs if appropriate', 'burn unit for severe burns'], ['blistering large areas', 'fever/chills', 'confusion']],
  ['insect-bites', 'Insect bites & stings (mild)', 'skin', ['cold compress', 'baking soda paste', 'calamine', 'plantain leaf poultice (traditional)', 'antihistamine orally if needed'], ['antihistamines', 'topical steroids', 'epinephrine for anaphylaxis'], ['throat swelling', 'difficulty breathing', 'hives widespread', 'tick embedded']],
  ['hives', 'Hives (urticaria)', 'skin', ['cool compress', 'oatmeal bath', 'identify triggers', 'nettle tea traditional', 'loose cotton clothing'], ['antihistamines', 'steroids if severe', 'allergy workup if chronic'], ['swelling of lips/tongue', 'wheezing', 'dizziness']],
  ['dandruff', 'Dandruff / scalp flaking', 'skin', ['tea tree shampoo', 'apple cider vinegar rinse diluted', 'coconut oil pre-wash', 'reduce harsh products'], ['antifungal shampoos', 'derm if seborrheic dermatitis'], ['painful sores', 'hair loss patches', 'scalp infection']],
  ['rosacea-flush', 'Rosacea-type facial flushing', 'skin', ['gentle cleanser', 'green tea compress', 'avoid triggers (alcohol, spicy, heat)', 'mineral sunscreen'], ['topical metronidazole/ivermectin', 'oral meds', 'laser options'], ['eye symptoms', 'rapid worsening']],
  ['wound-minor', 'Minor cuts & scrapes (after cleaning)', 'skin', ['clean water rinse', 'honey medical-grade on clean wounds (studied)', 'calendula ointment', 'keep moist with petroleum jelly', 'cover'], ['tetanus status', 'sutures if deep', 'antibiotics if infected'], ['deep puncture', 'animal bite', 'uncontrolled bleeding', 'red streaks']],
  ['bruising', 'Easy bruising (mild)', 'skin', ['arnica gel external (homeopathic/herbal tradition)', 'cold then warm compress', 'vitamin C rich foods', 'elevate'], ['evaluate meds (blood thinners)', 'labs if excessive'], ['bruising without injury widespread', 'bleeding gums with bruises']],
  // Pain / MSK
  ['back-pain', 'Low back pain (mechanical pattern)', 'musculoskeletal', ['heat', 'gentle walking', 'turmeric in food', 'magnesium-rich meals', 'stretching hip flexors carefully'], ['activity as tolerated', 'physical therapy', 'NSAIDs if appropriate', 'imaging if red flags'], ['leg weakness', 'bowel/bladder change', 'fever with back pain', 'history of cancer']],
  ['joint-stiffness', 'Joint stiffness', 'musculoskeletal', ['warm compress', 'turmeric/ginger food', 'omega-3 rich fish', 'gentle range-of-motion', 'Epsom salt soaks'], ['anti-inflammatories', 'rheumatology workup if inflammatory signs', 'physical therapy'], ['hot swollen joint', 'morning stiffness > 1 hour with systemic symptoms']],
  ['neck-tension', 'Neck tension', 'musculoskeletal', ['heat', 'gentle chin tucks', 'magnesium foods', 'posture breaks', 'lavender aromatherapy for relaxation'], ['PT', 'ergonomics', 'muscle relaxants short-term if prescribed'], ['arm weakness', 'after trauma', 'fever with stiff neck']],
  ['knee-discomfort', 'Knee discomfort (overuse pattern)', 'musculoskeletal', ['RICE principles', 'turmeric foods', 'quad sets', 'supportive footwear', 'weight management lifestyle'], ['PT', 'bracing', 'imaging if locking/instability'], ['inability to bear weight', 'deformity', 'hot swollen knee']],
  ['plantar-fascia', 'Heel pain (plantar fascia pattern)', 'musculoskeletal', ['calf stretch', 'frozen water bottle roll', 'supportive shoes', 'night stretch strap folklore'], ['PT', 'orthotics', 'steroid injection sometimes'], ['numbness', 'swelling of whole foot', 'infection signs']],
  ['tennis-elbow', 'Lateral elbow pain (tennis elbow pattern)', 'musculoskeletal', ['rest from aggravating activity', 'ice', 'counterforce strap', 'gentle eccentric loading later'], ['PT', 'bracing', 'injections rarely'], ['trauma with deformity', 'numbness in hand']],
  ['sciatica-like', 'Sciatica-like leg pain', 'musculoskeletal', ['gentle walking', 'nerve-glide carefully', 'heat for muscle spasm', 'avoid prolonged sitting'], ['PT', 'imaging if progressive neuro deficits', 'epidural in select cases'], ['saddle anesthesia', 'bowel/bladder loss', 'progressive weakness']],
  ['muscle-cramps', 'Muscle cramps', 'musculoskeletal', ['gentle stretch', 'hydration', 'electrolytes', 'magnesium foods', 'pickle juice folklore for athletes'], ['review meds', 'labs for electrolytes', 'rule out claudication'], ['cramps with dark urine', 'severe weakness']],
  ['arthritis-comfort', 'Osteoarthritis comfort strategies', 'musculoskeletal', ['warm packs', 'gentle movement', 'turmeric/ginger culinary use', 'weight-bearing as tolerated', 'supportive shoes'], ['exercise therapy', 'topical NSAIDs', 'injections', 'joint replacement when indicated'], ['hot swollen joint', 'sudden lock']],
  // Sleep / mood
  ['insomnia', 'Insomnia', 'sleep-mood', ['consistent sleep schedule', 'chamomile tea', 'lavender aroma', 'magnesium-rich evening snack', 'dark cool room', 'limit caffeine after noon'], ['CBT-I first-line', 'sleep study if apnea suspected', 'short-term meds when indicated'], ['stopping breathing at night', 'severe depression with insomnia', 'daytime microsleeps while driving']],
  ['anxiety-stress', 'Everyday anxiety & stress', 'sleep-mood', ['breathing exercises', 'lemon balm tea', 'passionflower tea', 'ashwagandha (adaptogen tradition)', 'journaling', 'time in nature'], ['therapy (CBT)', 'SSRIs/SNRIs when indicated', 'rule out medical causes'], ['panic with chest pain', 'suicidal thoughts', 'psychosis']],
  ['mild-depression-mood', 'Low mood (mild, non-emergency)', 'sleep-mood', ['morning light', 'movement', 'omega-3 foods', 'saffron culinary interest (emerging research)', 'social connection', 'St. John’s wort interacts with many meds — clinician only'], ['therapy', 'antidepressants when indicated', 'lab work for thyroid/anemia'], ['suicidal ideation', 'inability to care for self', 'psychosis']],
  ['burnout', 'Burnout & emotional exhaustion', 'sleep-mood', ['boundary setting', 'restorative sleep', 'adaptogen teas (holy basil, ashwagandha tradition)', 'nature time', 'reduce stimulants'], ['counseling', 'workplace evaluation', 'screen for depression/anxiety'], ['suicidal thoughts', 'substance misuse escalating']],
  ['panic-symptoms', 'Panic attack pattern (after medical rule-out)', 'sleep-mood', ['grounding 5-4-3-2-1', 'slow exhale breathing', 'cold water on face', 'chamomile after episode'], ['CBT', 'SSRIs', 'ER if first episode with cardiac concern'], ['chest pain not resolving', 'fainting', 'first-time severe episode']],
  ['brain-fog', 'Brain fog', 'sleep-mood', ['sleep hygiene', 'hydration', 'B-vitamin foods', 'ginkgo folklore (mixed evidence)', 'reduce alcohol', 'walks'], ['evaluate sleep apnea, thyroid, meds, depression', 'cognitive workup if progressive'], ['sudden confusion', 'stroke signs', 'head injury']],
  ['seasonal-affective', 'Seasonal low mood pattern', 'sleep-mood', ['morning bright light', 'vitamin D status discussion with clinician', 'outdoor daylight', 'exercise'], ['light therapy boxes', 'therapy', 'meds if depression'], ['suicidal thoughts']],
  // Women's health
  ['menstrual-cramps', 'Menstrual cramps', 'womens', ['heat pad', 'ginger tea', 'chamomile', 'gentle yoga', 'magnesium foods', 'raspberry leaf tea traditional'], ['NSAIDs timed correctly', 'hormonal options', 'evaluate secondary causes'], ['sudden severe pain', 'fever with pelvic pain', 'heavy bleeding soaking pad hourly']],
  ['pms', 'PMS symptoms', 'womens', ['calcium-rich foods', 'chasteberry traditional', 'reduce salt/caffeine late cycle', 'exercise', 'evening primrose oil folklore'], ['lifestyle', 'SSRIs cyclic dosing sometimes', 'hormonal contraception options'], ['severe mood with self-harm risk', 'debilitating pain']],
  ['menopause-hot-flashes', 'Menopause hot flashes', 'womens', ['layered clothing', 'black cohosh traditional (discuss interactions)', 'sage tea folklore', 'paced breathing', 'cool bedroom'], ['hormone therapy when appropriate', 'nonhormonal prescriptions', 'lifestyle'], ['postmenopausal bleeding', 'severe palpitations with syncope']],
  ['vaginal-dryness', 'Vaginal dryness (non-infectious pattern)', 'womens', ['plain moisturizers designed for vulva', 'avoid fragranced products', 'discuss topical estrogen with clinician', 'sea buckthorn oil oral folklore'], ['topical estrogen', 'ospemifene etc.', 'rule out infection'], ['foul discharge', 'fever', 'pelvic pain']],
  ['yeast-discomfort', 'Yeast-type vaginal discomfort pattern', 'womens', ['breathable cotton', 'avoid douching', 'plain yogurt diet folklore', 'probiotic foods'], ['antifungal treatments', 'confirm diagnosis — not all itch is yeast'], ['recurrent infections', 'pregnancy', 'diabetes uncontrolled']],
  ['pregnancy-nausea', 'Pregnancy nausea (discuss with OB first)', 'womens', ['ginger (often studied in pregnancy nausea)', 'small frequent meals', 'vitamin B6 only if OB-approved dose', 'acupressure bands'], ['OB guidance', 'diclegis-type prescriptions', 'rule out hyperemesis'], ['inability to keep fluids', 'weight loss', 'abdominal pain']],
  ['breast-tenderness', 'Cyclical breast tenderness', 'womens', ['supportive bra', 'reduce caffeine trial', 'evening primrose folklore', 'warm/cool compress'], ['exam', 'imaging per age guidelines', 'hormonal review'], ['new fixed lump', 'skin dimpling', 'bloody nipple discharge']],
  ['endometriosis-comfort', 'Endometriosis comfort strategies (supportive)', 'womens', ['heat', 'anti-inflammatory eating pattern', 'gentle movement', 'stress tools'], ['hormonal therapy', 'laparoscopy diagnosis/treatment', 'pain specialists'], ['acute abdomen', 'fainting with pain']],
  // Men's / urinary
  ['urinary-tract-discomfort', 'Urinary tract discomfort (UTI pattern)', 'urinary', ['hydration', 'cranberry products (mixed evidence for prevention)', 'D-mannose studied for recurrent UTI prevention in some', 'avoid holding urine', 'heat on lower belly for comfort'], ['urine culture', 'antibiotics when indicated', 'imaging if recurrent/complicated'], ['flank pain with fever', 'vomiting', 'blood in urine', 'male UTI often needs prompt care', 'pregnancy']],
  ['prostate-comfort', 'Prostate comfort / urinary flow concerns (men)', 'urinary', ['limit evening fluids', 'saw palmetto traditional (mixed evidence)', 'reduce caffeine/alcohol', 'pelvic floor physio interest'], ['PSA/digital exam per guidelines', 'alpha blockers', 'urology referral'], ['inability to urinate', 'blood in urine', 'bone pain with urinary symptoms']],
  ['kidney-stone-prevention', 'Kidney stone prevention lifestyle', 'urinary', ['high fluid intake', 'lemon water citrate folklore/evidence', 'limit excess salt', 'dietary calcium from food not avoid'], ['stone analysis', 'metabolic workup', 'urology procedures'], ['severe flank pain', 'fever with stone', 'anuria']],
  // Metabolic / circulatory
  ['high-blood-pressure-lifestyle', 'Blood pressure support (lifestyle)', 'circulatory', ['DASH-style eating', 'reduce sodium', 'hibiscus tea (studied modest BP effects)', 'walk daily', 'limit alcohol', 'stress tools'], ['home BP monitoring', 'antihypertensive meds', 'secondary cause workup'], ['BP emergency symptoms (chest pain, neuro deficits)', 'pregnancy hypertension']],
  ['type-2-blood-sugar-support', 'Blood sugar support lifestyle (type 2 context)', 'metabolic', ['fiber-rich meals', 'cinnamon culinary amounts', 'bitter melon traditional in some cultures', 'walking after meals', 'sleep'], ['A1c monitoring', 'metformin and other meds', 'diabetes education'], ['confusion with very high/low sugar', 'ketones', 'pregnancy']],
  ['high-cholesterol-lifestyle', 'Cholesterol-supportive lifestyle', 'circulatory', ['oats/soluble fiber', 'plant sterol foods', 'nuts in moderation', 'olive oil', 'exercise'], ['statins when indicated', 'lipid panel', 'cardiology risk scoring'], ['chest pain', 'family early heart disease with symptoms']],
  ['poor-circulation-legs', 'Cold feet / mild circulation complaints', 'circulatory', ['movement', 'warm socks', 'gingko folklore (bleeding risk)', 'quit smoking', 'leg elevation if swelling mild'], ['ABI testing', 'vascular referral', 'med review'], ['sudden pale cold painful limb', 'chest pain']],
  ['anemia-fatigue-pattern', 'Fatigue with possible low iron pattern', 'metabolic', ['iron-rich foods with vitamin C', 'cookware cast iron folklore', 'rest'], ['CBC labs', 'iron studies', 'find bleeding source', 'supplements only if deficient'], ['black stools', 'heavy periods with dizziness', 'chest pain']],
  ['thyroid-support-lifestyle', 'Thyroid wellness lifestyle (not a treatment)', 'metabolic', ['adequate iodine from food not megadoses', 'selenium-rich Brazil nuts sparingly', 'sleep', 'avoid extreme crash diets'], ['TSH labs', 'endocrine care', 'medication if hypothyroid/hyperthyroid'], ['neck mass', 'eye bulging', 'severe tachycardia']],
  ['gout-flare-comfort', 'Gout flare comfort (supportive)', 'metabolic', ['ice', 'elevate', 'cherry products studied modestly', 'hydration', 'avoid alcohol during flare'], ['NSAIDs/colchicine/steroids', 'urate-lowering therapy long-term'], ['infection of joint', 'inability to walk']],
  // Immune / infection-adjacent
  ['immune-support', 'Everyday immune support', 'immune', ['sleep', 'vitamin C foods', 'zinc foods', 'elderberry traditional', 'hand hygiene', 'vaccination discussion with clinician'], ['vaccines', 'chronic disease control', 'avoid megadoses'], ['recurrent serious infections', 'fevers of unknown origin']],
  ['fever-comfort', 'Fever comfort (supportive)', 'immune', ['hydration', 'light clothing', 'lukewarm sponge', 'rest', 'elderflower tea traditional'], ['antipyretics', 'find source', 'cultures if indicated'], ['infant under 3 months with fever', 'stiff neck', 'rash with fever', 'seizure']],
  ['shingles-support', 'Shingles recovery support (alongside medical care)', 'immune', ['cool compress', 'loose clothing', 'stress reduction', 'never use topical steroids on rash without clinician'], ['antivirals early', 'pain control', 'vaccine prevention discussion'], ['eye involvement', 'disseminated rash', 'immunocompromised']],
  ['oral-thrush-adult', 'Oral thrush pattern (adult)', 'oral', ['oral hygiene', 'yogurt if not contraindicated', 'rinse after steroid inhalers'], ['antifungal meds', 'evaluate immune status/diabetes'], ['difficulty swallowing', 'AIDS risk factors with thrush']],
  // Neuro / sensory
  ['migraine', 'Migraine', 'neuro', ['dark quiet room', 'cold pack', 'ginger for nausea', 'magnesium foods', 'identify triggers', 'feverfew traditional (interactions)'], ['triptans', 'preventive meds', 'neurology referral', 'rule out secondary headache'], ['thunderclap headache', 'neuro deficits', 'fever with headache', 'pregnancy new severe headache']],
  ['tension-headache', 'Tension-type headache', 'neuro', ['heat on neck', 'hydration', 'posture breaks', 'peppermint oil temples diluted', 'stress tools'], ['OTC analgesics carefully', 'PT for neck', 'limit medication-overuse headache'], ['worst headache of life', 'trauma', 'neuro changes']],
  ['vertigo-mild', 'Mild spinning dizziness (after evaluation)', 'neuro', ['Epley maneuver if BPPV confirmed by clinician', 'hydration', 'ginger', 'slow position changes'], ['Dix-Hallpike', 'vestibular PT', 'meds short-term'], ['stroke signs', 'new hearing loss with vertigo', 'severe headache']],
  ['neuropathy-comfort', 'Peripheral neuropathy comfort strategies', 'neuro', ['gentle foot care', 'alpha-lipoic acid discussed in literature (clinician)', 'blood sugar control', 'comfortable shoes'], ['treat cause (diabetes, B12)', 'gabapentinoids etc.', 'neurology'], ['rapid ascending weakness', 'foot ulcers']],
  ['tinnitus', 'Tinnitus', 'ear-nose', ['sound enrichment', 'stress reduction', 'limit loud noise', 'ginkgo mixed evidence', 'caffeine trial reduction'], ['hearing test', 'ENT', 'treat underlying causes'], ['pulsatile tinnitus', 'sudden hearing loss', 'neuro deficits']],
  ['dry-eyes', 'Dry eyes', 'eye-ear', ['blink breaks', 'humidifier', 'warm compress', 'omega-3 foods', 'artificial tears preservative-free'], ['tear evaluation', 'prescription drops', 'plug procedures'], ['eye pain with light sensitivity', 'vision loss', 'chemical exposure']],
  ['eye-strain', 'Digital eye strain', 'eye-ear', ['20-20-20 rule', 'screen height', 'artificial tears', 'room lighting', 'bilberry folklore'], ['refraction check', 'dry eye treatment'], ['sudden vision change', 'flashes/floaters storm']],
  // Oral
  ['toothache-comfort', 'Toothache comfort (temporary)', 'oral', ['cold compress external', 'clove oil diluted on cotton (traditional, careful)', 'salt rinse', 'avoid very hot/cold'], ['dental exam ASAP', 'infection treatment', 'root canal/extraction as needed'], ['facial swelling', 'fever', 'difficulty breathing/swallowing']],
  ['canker-sores', 'Canker sores', 'oral', ['salt rinse', 'honey', 'avoid acidic foods', 'licorice root deglycyrrhizinated patches folklore'], ['topical steroids dental', 'rule out systemic disease if frequent'], ['sores > 2 weeks', 'weight loss', 'immune disease']],
  ['bad-breath', 'Bad breath', 'oral', ['tongue cleaning', 'hydration', 'green tea', 'dental floss', 'address dry mouth'], ['dental cleaning', 'treat gum disease', 'GI/ENT evaluation if persistent'], ['sudden with weight loss', 'fever']],
  ['gingivitis-care', 'Gum inflammation care', 'oral', ['soft brushing', 'salt rinse', 'oil pulling folklore', 'stop smoking'], ['professional cleaning', 'antimicrobial rinses'], ['loose teeth', 'facial swelling']],
  // General wellness
  ['fatigue', 'Persistent tiredness', 'general', ['sleep audit', 'iron-rich foods if diet low', 'B12 foods', 'gentle exercise', 'hydration', 'ashwagandha traditional adaptogen'], ['labs (CBC, TSH, iron, B12)', 'sleep study', 'depression screen'], ['chest pain', 'fainting', 'black stools', 'suicidal thoughts']],
  ['dehydration', 'Mild dehydration recovery', 'general', ['oral rehydration solution', 'sips frequently', 'electrolyte foods', 'avoid excess alcohol/caffeine'], ['IV fluids if severe', 'find cause of losses'], ['confusion', 'no urine', 'infants/elderly not drinking']],
  ['hangover-recovery', 'Hangover recovery (supportive)', 'general', ['water/electrolytes', 'bland food', 'rest', 'ginger for nausea', 'never more alcohol ("hair of dog")'], ['time', 'rehydration', 'ER if still intoxicated dangerously'], ['cannot wake person', 'seizure', 'vomiting blood']],
  ['jet-lag', 'Jet lag', 'general', ['morning light at destination', 'melatonin timing discussion', 'hydrate', 'short naps', 'align meals'], ['short-term sleep aids rarely', 'plan itinerary'], ['severe disorientation in elderly']],
  ['altitude-comfort', 'Altitude adjustment discomfort', 'general', ['slow ascent', 'hydration', 'avoid alcohol first day', 'coca tea traditional in Andes (legal/local rules)'], ['acetazolamide prevention when prescribed', 'descend if severe AMS'], ['confusion', 'severe breathlessness', 'coughing frothy fluid']],
  ['heat-exhaustion', 'Heat exhaustion recovery', 'general', ['cool environment', 'oral fluids with electrolytes', 'cool cloths', 'rest'], ['medical evaluation', 'IV fluids', 'rule out heat stroke'], ['confusion', 'hot dry skin with collapse', 'seizure']],
  ['chapped-lips', 'Chapped lips', 'skin', ['plain petrolatum', 'hydrate', 'avoid licking', 'honey thin layer'], ['rule out angular cheilitis infection'], ['cracks not healing', 'bleeding severe']],
  ['night-sweats', 'Night sweats', 'general', ['cool room', 'moisture-wicking sleepwear', 'limit alcohol/spicy late', 'stress tools'], ['evaluate infection, hormones, meds, malignancy red flags'], ['unexplained weight loss', 'fever', 'lymph nodes']],
  ['swollen-ankles', 'Mild ankle swelling (dependent)', 'circulatory', ['elevate legs', 'compression socks if appropriate', 'reduce salt', 'walk breaks'], ['rule out heart/kidney/clot', 'diuretics only if indicated'], ['one-sided sudden swelling', 'chest pain', 'shortness of breath']],
  ['varicose-comfort', 'Varicose vein comfort', 'circulatory', ['compression stockings', 'leg elevation', 'walk', 'horse chestnut traditional (interactions)'], ['vascular evaluation', 'procedures when indicated'], ['ulcer', 'sudden leg pain/swelling']],
  ['hemorrhoids', 'Hemorrhoids comfort', 'digestive', ['sitz baths', 'fiber', 'witch hazel pads', 'avoid straining'], ['topical agents', 'procedures if severe'], ['heavy rectal bleeding', 'severe pain', 'prolapse not reducing']],
  ['uti-prevention', 'UTI prevention habits', 'urinary', ['hydration', 'void after sex', 'cranberry products evidence mixed', 'front-to-back hygiene'], ['prophylaxis strategies with clinician if recurrent'], ['symptoms of active UTI — treat promptly']],
  // More respiratory / ENT
  ['strep-recovery-support', 'Strep throat recovery support (with antibiotics)', 'respiratory', ['soft foods', 'honey', 'salt gargle', 'rest', 'new toothbrush after 24h of meds'], ['confirmed strep needs antibiotics', 'return precautions'], ['not improving on meds', 'drooling', 'rash']],
  ['pneumonia-recovery', 'Pneumonia recovery support (under medical care)', 'respiratory', ['rest', 'hydration', 'incentive spirometry if taught', 'nutrition'], ['antibiotics/antivirals as prescribed', 'oxygen if needed', 'hospitalization criteria'], ['worsening breathlessness', 'confusion']],
  ['asthma-triggers', 'Asthma trigger awareness (not a rescue plan)', 'respiratory', ['identify triggers', 'humidity balance', 'HEPA', 'never replace inhalers with herbs'], ['controller and rescue inhalers', 'action plan', 'spirometry'], ['using rescue inhaler frequently', 'lips blue', 'cannot speak full sentences']],
  ['copd-comfort', 'COPD comfort strategies (with pulmonary care)', 'respiratory', ['smoking cessation support', 'pursed-lip breathing', 'pulmonary rehab exercise as prescribed', 'avoid smoke'], ['inhalers', 'oxygen', 'vaccinations'], ['worsening CO2 retention signs', 'fever with sputum change']],
  // More skin
  ['poison-ivy', 'Poison ivy rash', 'skin', ['wash with soap ASAP after exposure', 'cool compress', 'oatmeal bath', 'calamine', 'avoid scratching'], ['topical/oral steroids if severe', 'antihistamines for itch'], ['rash near eyes/genitals severe', 'infection', 'difficulty breathing (rare)']],
  ['fungal-nail', 'Fungal nail appearance', 'skin', ['keep nails dry', 'tea tree diluted mixed evidence', 'antifungal powders lifestyle'], ['topical/oral antifungals', 'confirm diagnosis'], ['diabetes with foot infection']],
  ['warts', 'Common warts', 'skin', ['duct tape folklore', 'salicylic acid OTC', 'avoid picking', 'apple cider vinegar folklore'], ['cryotherapy', 'other derm procedures'], ['genital warts', 'immunocompromised widespread']],
  ['scabies-support', 'Scabies itch support (needs medical treatment)', 'skin', ['wash bedding hot', 'trim nails', 'cool compress for itch after prescribed cream started'], ['permethrin or other scabicides', 'treat contacts'], ['secondary infection']],
  ['hyperhidrosis', 'Excessive sweating', 'skin', ['antiperspirant nighttime', 'breathable fabrics', 'sage tea folklore', 'reduce triggers'], ['clinical antiperspirants', 'iontophoresis', 'botox', 'meds'], ['night sweats with weight loss']],
  // More digestive
  ['ulcer-symptoms', 'Stomach ulcer symptom pattern', 'digestive', ['avoid NSAIDs/alcohol/smoking', 'smaller meals', 'slippery elm traditional demulcent'], ['H. pylori test/treat', 'PPIs', 'endoscopy'], ['vomiting blood', 'black stools', 'severe pain']],
  ['celiac-gluten', 'Gluten sensitivity / celiac education', 'digestive', ['strict gluten-free if celiac confirmed', 'read labels', 'nutrient-dense substitutes'], ['serology and biopsy pathway', 'dietitian', 'screen deficiencies'], ['self-diagnosing without testing can miss other disease']],
  ['lactose-intolerance', 'Lactose intolerance', 'digestive', ['lactase enzyme', 'lactose-free dairy', 'fermented dairy trial', 'calcium from other foods'], ['hydrogen breath test sometimes', 'rule out other causes'], ['blood in stool', 'weight loss']],
  ['diverticulitis-recovery', 'Diverticulitis recovery (under care)', 'digestive', ['clinician-directed diet progression', 'hydration', 'rest'], ['antibiotics sometimes', 'hospital care if complicated'], ['severe pain', 'fever not improving', 'peritonitis signs']],
  ['appendicitis-awareness', 'Appendicitis awareness (emergency education)', 'digestive', ['no home remedy — seek emergency care'], ['surgery/antibiotics pathway'], ['RLQ pain migrating', 'fever', 'vomiting — ER']],
  // Sleep more
  ['restless-legs', 'Restless legs sensations', 'sleep-mood', ['iron-rich foods if deficient', 'stretch calves', 'warm bath', 'limit caffeine', 'magnesium foods'], ['check ferritin', 'dopaminergic or other meds', 'sleep study'], ['symptoms with weakness', 'daytime severe impact']],
  ['nightmares', 'Nightmares', 'sleep-mood', ['wind-down routine', 'limit late screens/alcohol', 'imagery rehearsal therapy techniques', 'lavender'], ['trauma-focused therapy if PTSD', 'med review'], ['night terrors with injury risk', 'PTSD flashbacks']],
  ['snoring', 'Snoring', 'sleep-mood', ['side sleeping', 'nasal saline', 'weight management', 'avoid alcohol late'], ['sleep study for apnea', 'CPAP if indicated', 'ENT'], ['witnessed apneas', 'daytime sleepiness dangerous']],
  // Mental wellness more
  ['grief-support', 'Grief & bereavement support', 'sleep-mood', ['social support', 'rituals meaningful to you', 'sleep/food basics', 'gentle walks', 'journaling'], ['grief counseling', 'screen for clinical depression'], ['suicidal thoughts', 'inability to function weeks/months']],
  ['anger-management', 'Anger intensity management', 'sleep-mood', ['pause breath', 'exercise outlet', 'journaling', 'passionflower tea traditional calm'], ['anger management programs', 'therapy', 'screen for mood disorders'], ['violence risk', 'self-harm']],
  ['adhd-focus-habits', 'Focus habits (ADHD-friendly supports)', 'sleep-mood', ['timers/pomodoro', 'movement breaks', 'protein breakfast', 'limit multitasking', 'omega-3 foods'], ['clinical ADHD evaluation', 'stimulant/nonstimulant meds', 'coaching'], ['self-medicating with substances']],
  ['ocd-supportive', 'OCD-supportive strategies (with care)', 'sleep-mood', ['do not perform compulsions as "natural cure"', 'exercise', 'sleep'], ['ERP therapy gold standard', 'SSRIs'], ['severe impairment', 'harm obsessions needing urgent care']],
  // Women's more
  ['pcos-lifestyle', 'PCOS lifestyle support', 'womens', ['balanced carbs', 'strength + cardio', 'inositol discussed in literature with clinician', 'spearmint tea studied modestly for androgens'], ['metformin sometimes', 'hormonal options', 'fertility care'], ['missed periods evaluation needed']],
  ['fertility-preconception', 'Preconception wellness', 'womens', ['folic acid per guidelines', 'stop smoking/alcohol', 'healthy weight range', 'prenatal vitamin'], ['preconception visit', 'chronic disease optimization'], ['do not delay care for known issues']],
  ['postpartum-mood', 'Postpartum mood changes', 'womens', ['sleep when possible', 'support network', 'outdoor light', 'nutrition'], ['screen PPD/PPA', 'therapy/meds safe options with OB'], ['thoughts of harming self/baby — emergency']],
  ['mastitis-support', 'Mastitis support (with lactation care)', 'womens', ['frequent feeding/pumping as advised', 'warm/cold compress timing', 'rest', 'hydration'], ['antibiotics when indicated', 'lactation consultant'], ['high fever', 'abscess signs']],
  // Kids / family (careful)
  ['teething-comfort', 'Teething comfort (infants)', 'general', ['clean chilled teether', 'gum massage', 'avoid amber necklaces (choke risk)', 'never honey under 1 year'], ['pediatric guidance', 'rule out illness if high fever'], ['fever workup in young infants']],
  ['colic-soothing', 'Colic soothing strategies', 'general', ['paced feeding', 'bicycle legs', 'white noise', 'caregiver breaks'], ['pediatric exam to rule out other causes'], ['projectile vomiting', 'poor weight gain', 'blood in stool']],
  ['cradle-cap', 'Cradle cap', 'skin', ['mineral oil soften', 'gentle brush', 'mild baby shampoo'], ['antifungal if severe seborrheic'], ['spreading infection']],
  // More conditions to reach 200+
  ['chronic-sinusitis', 'Chronic sinus issues', 'respiratory', ['daily saline', 'humidifier', 'allergen control', 'steam'], ['ENT evaluation', 'imaging', 'surgery sometimes'], ['vision change', 'severe headache']],
  ['nosebleeds', 'Nosebleeds', 'ear-nose', ['pinch soft nose 10+ min lean forward', 'humidify', 'saline gel', 'avoid picking'], ['cauterize if recurrent', 'check BP/meds'], ['bleeding > 20 min', 'on blood thinners heavy bleed', 'trauma']],
  ['canker-jaw-tmj', 'TMJ jaw tension', 'musculoskeletal', ['soft diet temporarily', 'warm compress', 'avoid gum', 'gentle massage'], ['dental/PT', 'night guard', 'imaging if indicated'], ['locked jaw', 'infection', 'trauma']],
  ['carpal-tunnel', 'Carpal tunnel symptoms', 'musculoskeletal', ['night wrist neutral splint', 'ergonomics', 'break stretching'], ['nerve studies', 'steroid injection', 'surgery'], ['constant numbness with weakness atrophy']],
  ['shoulder-impingement', 'Shoulder impingement pattern', 'musculoskeletal', ['relative rest', 'pendulum exercises later', 'ice/heat'], ['PT', 'imaging', 'injection'], ['inability to lift arm after trauma', 'fever']],
  ['hip-bursitis', 'Hip bursitis pattern', 'musculoskeletal', ['side-sleep pillow', 'activity modification', 'ice'], ['PT', 'injection'], ['inability to walk', 'fever']],
  ['shin-splints', 'Shin splints', 'musculoskeletal', ['reduce impact load', 'ice', 'supportive shoes', 'calf stretch'], ['PT', 'rule out stress fracture'], ['point tenderness severe', 'night pain']],
  ['stress-fracture-awareness', 'Stress fracture awareness', 'musculoskeletal', ['rest from impact', 'nutrition calcium/vitamin D foods'], ['imaging', 'boot/crutches', 'sports medicine'], ['cannot bear weight']],
  ['osteoporosis-prevention', 'Bone density lifestyle', 'musculoskeletal', ['weight-bearing exercise', 'calcium food sources', 'vitamin D status', 'fall-proof home'], ['DEXA screening', 'meds when indicated'], ['fragility fracture']],
  ['fibromyalgia-comfort', 'Fibromyalgia comfort strategies', 'musculoskeletal', ['gentle movement', 'sleep hygiene', 'stress tools', 'heat'], ['multimodal therapy', 'meds', 'PT'], ['new neuro deficits']],
  ['chronic-fatigue-pattern', 'Chronic fatigue pattern support', 'general', ['pacing (not boom-bust)', 'sleep', 'nutrition', 'graded activity only as advised'], ['rule out medical causes', 'specialist referral'], ['post-exertional malaise severe — seek ME/CFS knowledgeable care']],
  ['long-covid-support', 'Post-viral fatigue support', 'general', ['pacing', 'hydration', 'sleep', 'breathing gentle'], ['primary care follow-up', 'specialist as needed'], ['chest pain', 'oxygen desaturation']],
  ['autoimmune-lifestyle', 'Autoimmune-friendly lifestyle themes', 'immune', ['anti-inflammatory eating pattern', 'sleep', 'stress tools', 'no unproven detox extremes'], ['rheumatology', 'disease-specific meds'], ['flares with organ symptoms']],
  ['candida-overgrowth-myths', 'Yeast overgrowth claims (education)', 'digestive', ['balanced diet', 'reduce ultra-processed sugar-heavy pattern', 'probiotic foods', 'be wary of extreme "candida cleanses"'], ['true candidiasis needs medical diagnosis', 'antifungals when indicated'], ['do not self-treat systemic yeast claims']],
  ['parasite-cleanse-caution', 'Parasite cleanse caution (education)', 'digestive', ['food safety', 'hand hygiene', 'travel precautions'], ['stool testing', 'prescription antiparasitics only when diagnosed'], ['bloody diarrhea', 'severe weight loss']],
  ['detox-myths', 'Detox myths vs real liver support', 'general', ['hydration', 'fiber', 'sleep', 'limit alcohol', 'your liver already detoxes'], ['treat actual toxin exposures medically'], ['jaundice', 'confusion']],
  ['weight-management', 'Sustainable weight management', 'metabolic', ['protein + fiber meals', 'walk', 'sleep', 'stress tools', 'green tea modest evidence'], ['medical evaluation for secondary causes', 'GLP-1 etc. when appropriate'], ['eating disorder behaviors']],
  ['appetite-low', 'Low appetite', 'general', ['small nutrient-dense meals', 'ginger', 'pleasant meal settings', 'light activity'], ['evaluate depression/meds/illness', 'dietitian'], ['unintentional weight loss > 5%']],
  ['overeating-habits', 'Overeating habit tools', 'metabolic', ['mindful eating', 'protein breakfast', 'sleep', 'stress tools'], ['counseling', 'screen binge-eating disorder'], ['purging behaviors']],
  ['caffeine-dependence', 'Caffeine reduction', 'sleep-mood', ['taper slowly', 'hydrate', 'replace with herbal tea', 'morning light'], ['headache management during taper'], ['severe anxiety with caffeine']],
  ['alcohol-reduction', 'Alcohol reduction support', 'sleep-mood', ['track drinks', 'alcohol-free days', 'replace rituals', 'milk thistle not a free pass'], ['medical detox if dependent', 'naltrexone etc.', 'AA/SMART'], ['withdrawal seizures risk — medical supervision']],
  ['nicotine-cessation', 'Nicotine cessation support', 'respiratory', ['NRT as directed', 'behavior substitution', 'lobelia historical caution toxic'], ['varenicline/bupropion', 'counseling'], ['chest pain quitting']],
  ['opioid-withdrawal-support', 'Opioid withdrawal (needs medical plan)', 'sleep-mood', ['do not DIY cold turkey if high risk', 'hydration', 'comfort measures under care'], ['medically supervised detox', 'MAT (buprenorphine/methadone)'], ['overdose risk — naloxone access']],
  ['sugar-cravings', 'Sugar cravings', 'metabolic', ['protein/fiber with carbs', 'sleep', 'cinnamon foods', 'walk after meals'], ['screen emotional eating', 'diabetes risk'], ['binge-purge cycle']],
  ['salt-cravings', 'Salt cravings', 'metabolic', ['balanced electrolytes if heavy sweating', 'check processed food intake'], ['adrenal/workup if extreme with other signs'], ['confusion', 'severe dehydration']],
  ['night-eating', 'Night eating pattern', 'sleep-mood', ['protein evening meal', 'sleep schedule', 'limit screens'], ['screen night eating syndrome', 'depression/sleep disorders'], ['diabetes with night binges']],
  ['heartburn-pregnancy', 'Heartburn in pregnancy', 'womens', ['small meals', 'elevate head', 'avoid triggers', 'ginger carefully'], ['pregnancy-safe antacids per OB'], ['severe pain', 'vomiting blood']],
  ['leg-cramps-pregnancy', 'Leg cramps in pregnancy', 'womens', ['calf stretch before bed', 'hydration', 'discuss magnesium with OB only'], ['OB evaluation'], ['swelling one leg', 'chest pain']],
  ['morning-stiffness', 'Morning stiffness', 'musculoskeletal', ['warm shower', 'gentle mobility', 'anti-inflammatory foods'], ['rheumatology if prolonged systemic'], ['hot joints']],
  ['trigger-finger', 'Trigger finger pattern', 'musculoskeletal', ['rest', 'splint night', 'ice'], ['steroid injection', 'surgery'], ['infection']],
  ['bunion-comfort', 'Bunion comfort', 'musculoskeletal', ['wide toe box shoes', 'pads', 'toe spacers'], ['ortho/podiatry', 'surgery options'], ['ulcer over bunion']],
  ['heel-spur-awareness', 'Heel spur / heel pain awareness', 'musculoskeletal', ['same as plantar fascia care', 'cushioned shoes'], ['imaging', 'PT'], ['infection', 'trauma']],
  ['rib-pain-muscular', 'Muscular rib cage pain pattern', 'musculoskeletal', ['relative rest', 'ice/heat', 'breathing gentle'], ['rule out cardiac/PE/fracture', 'chest wall strain care'], ['exertional chest pressure', 'shortness of breath']],
  ['costochondritis-pattern', 'Costochondritis-like chest wall pain', 'musculoskeletal', ['anti-inflammatory measures', 'avoid heavy chest loading'], ['must rule out heart causes first'], ['any doubt — ER for chest pain']],
  ['palpitations-benign', 'Palpitations (after cardiac clearance)', 'circulatory', ['reduce caffeine', 'hydrate', 'sleep', 'stress tools'], ['ECG/monitor', 'thyroid labs', 'cardiology'], ['syncope', 'chest pain', 'neuro deficits']],
  ['low-blood-pressure-symptoms', 'Low blood pressure symptoms', 'circulatory', ['slow position changes', 'hydration', 'salt only if clinician advises'], ['med review', 'rule out bleeding/dehydration'], ['fainting injury', 'chest pain']],
  ['raynauds', "Raynaud's phenomenon", 'circulatory', ['keep extremities warm', 'avoid sudden cold', 'stop smoking', 'gloves'], ['calcium channel blockers sometimes', 'rheum if secondary'], ['ulcers on fingers', 'severe ischemia']],
  ['edema-general', 'General mild edema', 'circulatory', ['elevate', 'compression if appropriate', 'reduce salt', 'move'], ['heart/kidney/liver workup', 'DVT rule-out if unilateral'], ['sudden one-leg swelling', 'breathlessness']],
  ['lymph-support-lifestyle', 'Lymphatic comfort lifestyle', 'circulatory', ['movement', 'deep breathing', 'avoid extreme tight clothing', 'manual lymph drainage by trained therapists'], ['treat underlying lymphedema medically'], ['infection in swollen limb']],
  ['varicose-ulcer-prevention', 'Leg ulcer prevention habits', 'circulatory', ['compression as prescribed', 'skin care', 'walk'], ['wound clinic', 'vascular care'], ['open sores', 'infection']],
  ['cold-hands-feet', 'Cold hands and feet', 'circulatory', ['layers', 'movement', 'ginger tea warming tradition', 'check thyroid/anemia lifestyle overlap'], ['vascular/thyroid evaluation'], ['color changes with pain severe']],
  ['anemia-b12', 'B12 deficiency risk education', 'metabolic', ['B12 foods (animal or fortified)', 'discuss vegan supplementation'], ['B12 labs', 'injections if needed'], ['neuro symptoms progressive']],
  ['vitamin-d-low', 'Low vitamin D risk education', 'metabolic', ['safe sun', 'fatty fish', 'fortified foods'], ['25-OH vitamin D lab', 'repletion dosing medical'], ['bone pain', 'severe deficiency symptoms']],
  ['magnesium-foods', 'Magnesium-rich nutrition (general)', 'metabolic', ['leafy greens', 'nuts/seeds', 'legumes', 'dark chocolate modest'], ['labs if symptoms', 'supplement caution with kidney disease'], ['arrhythmia', 'severe weakness']],
  ['potassium-foods', 'Potassium-rich nutrition (general)', 'metabolic', ['bananas', 'potatoes', 'beans', 'spinach'], ['do not high-dose if on certain BP meds without clinician'], ['irregular heartbeat']],
  ['iron-rich-eating', 'Iron-rich eating patterns', 'metabolic', ['heme iron meats', 'lentils + vitamin C', 'avoid tea with iron meals'], ['confirm deficiency before high-dose iron'], ['constipation from iron', 'black stools evaluation']],
  ['hydration-habits', 'Hydration habits', 'general', ['sip through day', 'urine pale straw', 'electrolytes if heavy sweat'], ['IV if severe dehydration'], ['confusion', 'no urine']],
  ['sleep-apnea-awareness', 'Sleep apnea awareness', 'sleep-mood', ['side sleep', 'avoid alcohol late', 'weight management'], ['sleep study', 'CPAP'], ['choking awakenings', 'resistant hypertension']],
  ['shift-work-sleep', 'Shift work sleep strategies', 'sleep-mood', ['blackout curtains', 'consistent sleep block', 'strategic caffeine', 'light management'], ['melatonin timing clinician', 'workplace health'], ['microsleeps driving']],
  ['social-anxiety', 'Social anxiety supports', 'sleep-mood', ['gradual exposure', 'breathing', 'lemon balm tea', 'prepare scripts'], ['CBT', 'meds when indicated'], ['panic with avoidance severe']],
  ['phobia-support', 'Specific phobia supports', 'sleep-mood', ['do not force flooding alone', 'relaxation skills'], ['exposure therapy with professional'], ['impairment of daily life']],
  ['ptsd-supportive', 'PTSD supportive (with trauma care)', 'sleep-mood', ['grounding', 'safe people', 'sleep basics', 'avoid self-medication'], ['trauma-focused therapy', 'meds'], ['flashbacks with self-harm risk', 'dissociation dangerous']],
  ['bipolar-supportive', 'Bipolar spectrum supportive (with psychiatry)', 'sleep-mood', ['sleep regularity critical', 'substance avoidance', 'routine'], ['mood stabilizers', 'psychiatry'], ['mania', 'suicidality']],
  ['schizophrenia-supportive', 'Psychosis spectrum supportive (with psychiatry)', 'sleep-mood', ['never replace antipsychotics with herbs', 'sleep', 'support network'], ['antipsychotics', 'psychosocial rehab'], ['command hallucinations', 'danger to self/others']],
  ['eating-disorder-support', 'Eating disorder recovery support', 'sleep-mood', ['structured meals with team', 'no "detox" diets', 'compassionate support'], ['multidisciplinary ED treatment'], ['medical instability — ER']],
  ['body-image', 'Body image distress', 'sleep-mood', ['media literacy', 'movement for joy', 'self-compassion practices'], ['therapy', 'screen BDD'], ['self-harm']],
  ['loneliness', 'Loneliness', 'sleep-mood', ['scheduled social contact', 'volunteer', 'pet if appropriate', 'nature groups'], ['screen depression', 'community resources'], ['suicidal isolation']],
  ['caregiver-stress', 'Caregiver stress', 'sleep-mood', ['respite', 'support groups', 'sleep protection', 'ask for help'], ['counseling', 'social work resources'], ['burnout with self-harm thoughts']],
  ['chronic-pain-coping', 'Chronic pain coping (multimodal)', 'musculoskeletal', ['pacing', 'heat/ice', 'gentle movement', 'mindfulness evidence base', 'turmeric foods'], ['pain clinic', 'PT', 'appropriate meds'], ['new neuro deficits', 'cancer history with new pain']],
  ['post-surgery-recovery', 'Post-surgery recovery supports', 'general', ['follow surgeon instructions first', 'protein nutrition', 'walk as allowed', 'sleep'], ['wound checks', 'PT', 'DVT prevention'], ['fever', 'wound drainage', 'chest pain']],
  ['scar-care', 'Scar care (healed wounds)', 'skin', ['silicone gel sheets evidence', 'sun protection', 'massage when cleared', 'vitamin E mixed evidence'], ['derm/plastic for keloids'], ['infected scar']],
  ['stretch-marks', 'Stretch marks', 'skin', ['moisturize', 'gentle massage', 'time', 'retinoids only if not pregnant and derm-approved'], ['laser options cosmetic'], ['none urgent']],
  ['hair-thinning', 'Hair thinning', 'skin', ['gentle handling', 'protein intake', 'check iron/thyroid lifestyle overlap', 'rosemary oil diluted interest'], ['derm evaluation', 'minoxidil', 'anti-androgens when indicated'], ['patchy bald spots', 'scalp pain with fever']],
  ['brittle-nails', 'Brittle nails', 'skin', ['biotin foods', 'moisturize cuticles', 'gloves for wet work'], ['rule out thyroid/iron', 'fungal if deformed'], ['nail separation painful']],
  ['excessive-thirst', 'Excessive thirst education', 'metabolic', ['note fluid intake', 'reduce high-sugar drinks'], ['check glucose, calcium, diabetes'], ['confusion', 'rapid weight loss']],
  ['frequent-urination', 'Frequent urination education', 'urinary', ['bladder diary', 'reduce evening caffeine', 'pelvic floor awareness'], ['UTI/diabetes/prostate evaluation'], ['blood', 'pain', 'incontinence sudden']],
  ['incontinence-stress', 'Stress incontinence strategies', 'urinary', ['pelvic floor PT', 'weight management', 'timed voiding'], ['urogyn evaluation', 'devices/surgery options'], ['overflow with retention']],
  ['overactive-bladder', 'Overactive bladder strategies', 'urinary', ['bladder training', 'limit bladder irritants', 'pelvic floor'], ['meds', 'PT', 'advanced therapies'], ['neurologic disease new']],
  ['interstitial-cystitis', 'Bladder pain syndrome support', 'urinary', ['identify food triggers', 'stress tools', 'heat'], ['urology IC protocols'], ['infection must be ruled out']],
  ['kidney-health-lifestyle', 'Kidney health lifestyle', 'urinary', ['BP control', 'blood sugar control', 'hydration', 'caution NSAID overuse'], ['eGFR labs', 'nephrology'], ['swelling', 'no urine', 'confusion']],
  ['liver-fatty-lifestyle', 'Fatty liver lifestyle support', 'digestive', ['weight loss gradual if indicated', 'limit alcohol', 'Mediterranean pattern', 'exercise'], ['ultrasound/labs', 'hepatology'], ['jaundice', 'ascites']],
  ['pancreatitis-awareness', 'Pancreatitis awareness', 'digestive', ['no home remedy for acute attack', 'alcohol cessation long-term'], ['hospital care acute', 'gallstone evaluation'], ['severe upper pain to back', 'vomiting — ER']],
  ['celiac-bone-health', 'Celiac-related bone health education', 'metabolic', ['gluten-free nutrient dense diet', 'calcium/vitamin D foods'], ['DEXA if indicated', 'labs'], ['fractures']],
  ['gerd-night', 'Nighttime reflux', 'digestive', ['no late meals', 'elevate head', 'left side sleep', 'ginger earlier evening'], ['acid suppression', 'ENT if laryngopharyngeal'], ['choking at night', 'weight loss']],
  ['silent-reflux', 'Silent reflux (LPR) education', 'respiratory', ['reflux lifestyle', 'voice care', 'avoid throat clearing habit'], ['ENT + GI', 'PPIs trial sometimes'], ['voice loss prolonged']],
  ['tonsillitis-support', 'Tonsillitis support (with care)', 'respiratory', ['soft diet', 'hydration', 'salt gargle', 'rest'], ['strep test', 'antibiotics if bacterial', 'tonsillectomy criteria'], ['abscess (hot potato voice)', 'breathing issue']],
  ['mono-recovery', 'Mononucleosis recovery support', 'immune', ['rest', 'hydration', 'avoid contact sports until cleared (spleen)'], ['supportive care', 'steroids rare', 'activity clearance'], ['severe abdominal pain left upper — spleen']],
  ['lyme-awareness', 'Tick bite / Lyme awareness', 'immune', ['proper tick removal', 'save tick if possible', 'watch bullseye'], ['prophylaxis sometimes', 'antibiotics if Lyme'], ['neuro symptoms', 'heart block symptoms']],
  ['covid-mild-support', 'Mild respiratory virus recovery support', 'respiratory', ['rest', 'hydration', 'isolate per public health', 'honey for cough if adult'], ['antivirals when eligible', 'pulse ox if advised'], ['low oxygen', 'chest pain', 'confusion']],
  ['rsv-awareness', 'RSV awareness (high-risk groups)', 'respiratory', ['hand hygiene', 'avoid smoke', 'supportive care only'], ['hospital care infants/elderly sometimes', 'new vaccines/monoclonals per guidelines'], ['infant apnea', 'dehydration']],
  ['whooping-cough-awareness', 'Pertussis awareness', 'respiratory', ['vaccination prevention', 'supportive care'], ['antibiotics early', 'public health notify'], ['infant with apnea — emergency']],
  ['tuberculosis-awareness', 'Tuberculosis awareness', 'respiratory', ['no herbal substitute for TB treatment'], ['public health TB programs', 'multi-drug therapy'], ['chronic cough with weight loss/night sweats — evaluate']],
  ['meningitis-awareness', 'Meningitis awareness', 'neuro', ['vaccination', 'no delay for home remedies'], ['emergency antibiotics/hospital'], ['stiff neck + fever + headache — ER']],
  ['stroke-awareness', 'Stroke awareness (FAST)', 'neuro', ['prevention: BP, AF, lifestyle'], ['emergency thrombolysis window', 'rehab'], ['Face Arm Speech Time — call emergency']],
  ['heart-attack-awareness', 'Heart attack awareness', 'circulatory', ['prevention lifestyle', 'know symptoms'], ['emergency PCI pathway'], ['chest pressure, arm/jaw pain, cold sweat — call emergency']],
  ['seizure-first-aid', 'Seizure first-aid education', 'neuro', ['protect head', 'time seizure', 'do not put objects in mouth', 'recovery position after'], ['emergency if >5 min or first seizure', 'neurology'], ['status epilepticus']],
  ['concussion-recovery', 'Concussion recovery', 'neuro', ['relative rest then graded return', 'sleep', 'limit screens initially as advised'], ['medical evaluation', 'return-to-play protocols'], ['worsening headache/vomiting', 'unequal pupils']],
  ['whiplash-comfort', 'Whiplash comfort', 'musculoskeletal', ['early gentle motion as advised', 'ice/heat', 'avoid prolonged complete immobilization usually'], ['PT', 'imaging if red flags'], ['neuro deficits', 'severe after trauma']],
  ['text-neck', 'Text neck posture strain', 'musculoskeletal', ['raise phone', 'chin tucks', 'breaks', 'strengthen upper back'], ['PT', 'ergonomics'], ['arm numbness progressive']],
  ['eye-floaters', 'Eye floaters education', 'eye-ear', ['most benign age-related', 'hydration general'], ['urgent exam for flashes/curtain'], ['sudden shower of floaters', 'curtain over vision — emergency']],
  ['glaucoma-awareness', 'Glaucoma awareness', 'eye-ear', ['cannot reverse with herbs reliably', 'routine eye pressure exams'], ['drops/surgery', 'ophthalmology'], ['sudden painful red eye with halos — emergency']],
  ['cataract-awareness', 'Cataract awareness', 'eye-ear', ['UV protection', 'no proven reverse herb', 'lighting help'], ['surgical lens replacement when indicated'], ['sudden vision loss']],
  ['hearing-loss-sudden', 'Sudden hearing loss education', 'ear-nose', ['urgent ENT — steroids sometimes time-sensitive'], ['audiology', 'MRI sometimes'], ['sudden hearing loss is emergency-ish — same day care']],
  ['earwax', 'Earwax buildup', 'ear-nose', ['mineral oil drops', 'avoid cotton swabs deep', 'warm water irrigation if appropriate'], ['professional removal'], ['perforated eardrum history — clinician only']],
  ['swimmers-ear-prevention', 'Swimmer’s ear prevention', 'ear-nose', ['dry ears after swim', 'alcohol-vinegar drops if advised', 'ear plugs'], ['treat infection early'], ['pain with fever']],
  ['dental-sensitivity', 'Tooth sensitivity', 'oral', ['desensitizing toothpaste', 'soft brush', 'limit acid sips'], ['dental bonding', 'gum recession care'], ['cracked tooth pain', 'abscess']],
  ['tmj-headache', 'TMJ-related headache', 'neuro', ['jaw rest', 'soft diet', 'heat', 'stress tools'], ['dental appliance', 'PT'], ['trauma', 'infection']],
  ['sinus-headache', 'Sinus pressure headache pattern', 'neuro', ['saline', 'steam', 'hydration', 'warm compress'], ['treat sinus disease', 'migrate to migraine diagnosis often'], ['neuro red flags']],
  ['cluster-headache-awareness', 'Cluster headache awareness', 'neuro', ['oxygen therapy under care famous for clusters', 'avoid alcohol during bout'], ['specialty headache clinic', 'injectable treatments'], ['first severe headache needs evaluation']],
  ['trigeminal-neuralgia-awareness', 'Trigeminal neuralgia awareness', 'neuro', ['soft foods', 'avoid triggers', 'not herbal first-line'], ['carbamazepine etc.', 'neurosurgery options'], ['severe facial pain electric — neurology']],
  ['bells-palsy-support', 'Bell’s palsy support (with care)', 'neuro', ['eye protection critical', 'facial exercises later as advised'], ['steroids early', 'antivirals sometimes'], ['stroke must be ruled out', 'incomplete eye closure']],
  ['parkinsons-supportive', 'Parkinson’s supportive lifestyle', 'neuro', ['exercise programs specialized', 'fall prevention', 'med timing with clinician', 'speech therapy interest'], ['levodopa etc.', 'neurology'], ['falls', 'aspiration']],
  ['alzheimers-lifestyle', 'Cognitive aging lifestyle', 'neuro', ['exercise', 'social engagement', 'Mediterranean pattern', 'hearing correction', 'sleep'], ['cognitive evaluation', 'disease-modifying when eligible'], ['sudden change — delirium workup']],
  ['ms-supportive', 'Multiple sclerosis supportive (with neurology)', 'neuro', ['vitamin D status discussion', 'exercise as able', 'cooling strategies', 'never stop DMTs for herbs'], ['disease-modifying therapies', 'relapse steroids'], ['new neuro deficits — contact team']],
  ['lupus-supportive', 'Lupus supportive lifestyle', 'immune', ['sun protection', 'rest flares', 'anti-inflammatory pattern'], ['hydroxychloroquine etc.', 'rheum'], ['chest pain', 'severe headache', 'pregnancy planning']],
  ['rheumatoid-supportive', 'Rheumatoid arthritis supportive', 'musculoskeletal', ['joint protection', 'gentle movement', 'omega-3 foods', 'heat'], ['DMARDs early important', 'rheum'], ['hot joint infection', 'extra-articular symptoms']],
  ['osteoarthritis-hands', 'Hand osteoarthritis comfort', 'musculoskeletal', ['paraffin wax bath', 'splints activity-specific', 'gentle range'], ['topical NSAIDs', 'injection', 'surgery rare'], ['hot swollen single joint']],
  ['gout-prevention', 'Gout prevention lifestyle', 'metabolic', ['limit beer/high-purine binges', 'hydration', 'cherries modest evidence', 'weight if indicated'], ['allopurinol etc.', 'urate goals'], ['flares with fever — infection vs gout']],
  ['kidney-stone-oxalate', 'Oxalate stone diet education', 'urinary', ['hydrate', 'normal calcium diet', 'limit excess spinach/nuts binges if oxalate stones'], ['stone type guides diet', 'urology'], ['acute colic — ER']],
  ['intermittent-fasting-caution', 'Intermittent fasting caution', 'metabolic', ['not for everyone', 'hydrate', 'nutrient dense eating windows'], ['avoid if eating disorder/pregnancy/some meds', 'clinician guidance'], ['dizziness syncope', 'binge cycles']],
  ['keto-flu', 'Low-carb transition discomfort', 'metabolic', ['electrolytes', 'hydrate', 'slow transition'], ['not medical keto for epilepsy without specialist'], ['severe weakness', 'heart rhythm issues']],
  ['sibo-education', 'SIBO education', 'digestive', ['do not extreme herbal antimicrobials without guidance', 'meal spacing sometimes advised'], ['breath testing', 'antibiotics/elemental diets under care'], ['obstruction symptoms']],
  ['gerd-lpr-voice', 'Voice strain with reflux', 'respiratory', ['voice rest', 'reflux lifestyle', 'hydration'], ['speech therapy', 'ENT'], ['hoarseness >2 weeks']],
  ['barretts-awareness', 'Barrett’s esophagus awareness', 'digestive', ['reflux control lifestyle', 'no herb reverses Barrett’s reliably'], ['endoscopic surveillance', 'GI'], ['dysphagia', 'bleeding']],
  ['celiac-skin', 'Dermatitis herpetiformis education', 'skin', ['gluten-free if DH/celiac', 'dermatology care'], ['dapsone sometimes', 'biopsy'], ['blistering severe']],
  ['rosacea-ocular', 'Ocular rosacea awareness', 'eye-ear', ['lid hygiene', 'avoid triggers'], ['ophthalmology', 'systemic meds sometimes'], ['vision threat']],
  ['blepharitis', 'Blepharitis', 'eye-ear', ['warm compress', 'lid scrub', 'omega-3 foods'], ['antibiotic ointment sometimes', 'derm if demodex'], ['vision change']],
  ['stye', 'Stye', 'eye-ear', ['warm compress frequently', 'do not squeeze'], ['antibiotic if needed', 'I&D rare'], ['spreading cellulitis', 'vision']],
  ['conjunctivitis', 'Pink eye education', 'eye-ear', ['hygiene', 'cool compress', 'do not share towels'], ['antibiotic drops if bacterial', 'allergy drops if allergic'], ['pain with light', 'vision loss', 'newborn']],
  ['dry-mouth', 'Dry mouth', 'oral', ['sip water', 'xylitol gum', 'humidifier', 'review meds with clinician'], ['saliva substitutes', 'dental caries prevention'], ['unable to swallow', 'Sjogren evaluation']],
  ['burning-mouth', 'Burning mouth pattern', 'oral', ['avoid irritants', 'hydrate', 'stress tools'], ['rule out thrush/nutrient deficiency', 'neurology/dental'], ['neurologic other signs']],
  ['geographic-tongue', 'Geographic tongue', 'oral', ['avoid spicy/acid triggers', 'reassurance often'], ['dental eval if painful'], ['persistent ulcer']],
  ['oral-lichen-planus', 'Oral lichen planus education', 'oral', ['avoid cinnamon/mint triggers sometimes', 'gentle oral care'], ['topical steroids dental', 'biopsy'], ['dysplasia risk monitoring']],
  ['tmj-ear-pain', 'TMJ referred ear pain', 'ear-nose', ['jaw rest', 'soft diet', 'heat'], ['dental/ENT to differentiate ear disease'], ['true ear infection signs']],
  ['menieres-awareness', "Meniere's disease awareness", 'ear-nose', ['low salt tradition', 'avoid caffeine/alcohol triggers', 'vestibular rest during attack'], ['ENT, diuretics sometimes, procedures'], ['drop attacks', 'sudden hearing loss']],
  ['acoustic-neuroma-awareness', 'Acoustic neuroma awareness', 'ear-nose', ['not herb-treatable'], ['MRI diagnosis', 'surgery/radiation/observe'], ['unilateral hearing loss progressive']],
  ['thyroid-nodule-awareness', 'Thyroid nodule awareness', 'metabolic', ['iodine balance not megadose'], ['ultrasound, FNA when indicated'], ['rapid growth', 'breathing/swallowing issue']],
  ['goiter-awareness', 'Goiter awareness', 'metabolic', ['iodine sufficiency', 'avoid unprescribed thyroid herbs'], ['endocrine evaluation'], ['compressive symptoms']],
  ['adrenal-fatigue-myth', 'Adrenal fatigue myth education', 'metabolic', ['sleep, stress tools, nutrition — real', 'true adrenal insufficiency is medical emergency different'], ['if Addison suspected — urgent endocrine'], ['crisis: severe vomiting, collapse']],
  ['cortisol-stress', 'Stress physiology education', 'sleep-mood', ['sleep', 'exercise', 'boundaries', 'adaptogens with caution'], ['therapy', 'screen Cushing/Addison properly'], ['purple striae, severe hypertension — evaluate']],
  ['testosterone-lifestyle', 'Testosterone lifestyle factors (men)', 'mens', ['sleep', 'resistance training', 'healthy weight', 'limit alcohol', 'zinc foods if diet poor'], ['labs if hypogonadism suspected', 'avoid unregulated "boosters"'], ['erectile sudden with cardiac risk']],
  ['erectile-support-lifestyle', 'Erectile function lifestyle', 'mens', ['cardio fitness', 'stop smoking', 'sleep', 'stress tools', 'L-arginine foods mixed'], ['PDE5 inhibitors medical', 'cardio risk eval'], ['chest pain with sex']],
  ['libido-low', 'Low libido multifactorial', 'general', ['relationship stress tools', 'sleep', 'exercise', 'review meds with clinician'], ['hormone labs when indicated', 'therapy'], ['pain with sex', 'depression']],
  ['vaginal-atrophy-awareness', 'Genitourinary syndrome of menopause education', 'womens', ['moisturizers', 'discuss local estrogen'], ['gyn care'], ['bleeding', 'infection']],
  ['pelvic-floor-tension', 'Pelvic floor tension', 'musculoskeletal', ['pelvic PT', 'breath down training', 'avoid chronic gripping'], ['PT specialist', 'gyn/urology'], ['pain with retention']],
  ['endometriosis-diet', 'Endometriosis diet themes', 'womens', ['anti-inflammatory pattern', 'fiber', 'limit ultra-processed'], ['medical/surgical care primary'], ['acute pain']],
  ['fibroids-awareness', 'Uterine fibroids awareness', 'womens', ['iron-rich diet if heavy bleeding', 'track cycles'], ['ultrasound', 'medical/surgical options'], ['soaking pads hourly', 'severe pain']],
  ['ovarian-cyst-awareness', 'Ovarian cyst awareness', 'womens', ['heat for mild ovulatory pain', 'rest'], ['ultrasound', 'ER if rupture/torsion suspected'], ['sudden severe pelvic pain — ER']],
  ['pid-awareness', 'Pelvic inflammatory disease awareness', 'womens', ['no delay for herbs'], ['antibiotics urgent', 'STI testing'], ['pelvic pain + fever — prompt care']],
  ['hpv-awareness', 'HPV awareness', 'womens', ['vaccination', 'safer sex', 'smoking cessation'], ['pap/HPV screening', 'colposcopy'], ['abnormal bleeding']],
  ['breast-health', 'Breast health education', 'womens', ['know your normal', 'screening per guidelines', 'limit alcohol'], ['mammogram/ultrasound pathways'], ['new lump', 'skin change', 'bloody discharge']],
  ['prostate-cancer-awareness', 'Prostate cancer awareness', 'mens', ['discuss screening individually', 'lifestyle general health'], ['PSA shared decision', 'urology'], ['bone pain', 'urinary obstruction']],
  ['colon-cancer-awareness', 'Colon cancer awareness', 'digestive', ['screening age guidelines', 'fiber pattern', 'limit processed meats'], ['colonoscopy'], ['rectal bleeding', 'pencil stools', 'weight loss']],
  ['skin-cancer-awareness', 'Skin cancer awareness', 'skin', ['sun protection', 'monthly skin checks', 'no "black salve"'], ['derm biopsy'], ['changing mole ABCDE']],
  ['lung-cancer-awareness', 'Lung cancer awareness', 'respiratory', ['smoking cessation', 'radon awareness', 'screening if eligible'], ['imaging', 'oncology'], ['hemoptysis', 'unexplained weight loss']],
  ['cervical-cancer-awareness', 'Cervical cancer awareness', 'womens', ['HPV vaccine', 'pap screening'], ['gyn oncology pathways'], ['postcoital bleeding']],
  ['testicular-cancer-awareness', 'Testicular cancer awareness', 'mens', ['self-exam monthly', 'prompt evaluation lumps'], ['ultrasound', 'urology'], ['painless testicular mass']],
  ['leukemia-awareness', 'Leukemia awareness signs', 'immune', ['no herb replaces chemo'], ['CBC', 'hematology'], ['easy bruising + fever + pale + bone pain — urgent']],
  ['lymphoma-awareness', 'Lymphoma awareness signs', 'immune', ['medical evaluation nodes'], ['biopsy pathway'], ['night sweats + weight loss + nodes']],
];

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function storyFor(name, remedies) {
  const r = remedies[0] || 'rest and hydration';
  return [
    {
      title: 'Traditional household practice',
      body: `Across many cultures, people with ${name.toLowerCase()} have long combined rest with simple kitchen or garden supports such as ${r}. These stories are cultural and personal — not clinical proof that any remedy cures disease.`,
    },
    {
      title: 'Modern integrative interest',
      body: `Some contemporary users report feeling more comfortable when they pair clinician-directed care for ${name.toLowerCase()} with evidence-informed lifestyle habits (sleep, fluids, gentle movement) and traditionally used botanicals. Individual responses vary widely; placebo, concurrent medical care, and natural recovery all play roles.`,
    },
  ];
}

function buildEntry(row) {
  const [slug, name, category, remedies, conventional, seekCare] = row;
  const hot = HOT_SLUGS.has(slug);
  const remedyList = remedies.map((r) => ({
    name: r,
    note: `Traditionally or popularly used in the context of ${name.toLowerCase()}. Discuss interactions and safety with a licensed clinician, especially if you take medications, are pregnant, or have chronic disease.`,
  }));

  return {
    slug,
    name,
    category,
    hot,
    readMinutes: hot ? 12 : 8,
    keywords: `${name}, natural remedies, traditional remedies, ${category} wellness, holistic support, ${remedies.slice(0, 3).join(', ')}`,
    description: `Educational overview of ${name}: what conventional care typically involves, traditional natural approaches people have used, safety warnings, and when to seek medical attention. Not medical advice.`,
    overview: `${name} is a common reason people search for both clinical care and traditional home supports. This page summarizes how healthcare systems often approach the problem, and how herbalists and household traditions have historically framed comfort measures. It is for research and education only — not diagnosis or treatment.`,
    whenSeekCare: seekCare,
    conventionalCare: {
      summary: `In clinical settings, evaluation for ${name.toLowerCase()} usually focuses on ruling out dangerous causes, easing symptoms, and treating confirmed disease when present.`,
      bullets: conventional,
    },
    traditionalRemedies: remedyList,
    historicalNotes: `Folk and traditional systems (Western herbalism, Ayurveda, Traditional Chinese Medicine, curanderismo, and others) often group patterns that resemble ${name.toLowerCase()} under broader energetic or humoral ideas. Historical use is not the same as modern safety or efficacy evidence. Many plants can interact with drugs or be unsafe in pregnancy.`,
    successStories: storyFor(name, remedies),
    shopHints: ['herbal_remedies', 'teas', 'homeopathic_remedies', 'essential_oils'],
    serviceHints: ['herbalist', 'homeopathy', 'naturopathic_wellness'],
    warnings: [
      'This content is for research and educational purposes only and is not medical advice, diagnosis, or treatment.',
      'If you have symptoms that concern you, stop self-research and seek licensed medical care or emergency services.',
      'Natural does not mean safe. Herbs, oils, and supplements can cause allergy, toxicity, or drug interactions.',
      'Never delay emergency care (chest pain, trouble breathing, stroke signs, severe bleeding, suicidal thoughts) for any remedy or article.',
      'Hazel Allure and independent practitioners do not replace your physician, nurse practitioner, or emergency department.',
    ],
  };
}

// Deduplicate by slug and pad if under 200
const seen = new Set();
const entries = [];
for (const row of RAW) {
  if (seen.has(row[0])) continue;
  seen.add(row[0]);
  entries.push(buildEntry(row));
}

// Ensure 200+ with systematic general wellness variants if short
const extras = [
  'spring-allergy-prep', 'fall-immune-habits', 'winter-skin-barrier', 'summer-heat-hydration',
  'office-ergonomics-pain', 'new-parent-sleep-debt', 'student-stress-exam', 'athlete-recovery-basics',
  'travel-gut-upset', 'hotel-sleep-hygiene', 'screen-blue-light', 'blue-monday-mood',
  'holiday-overeating', 'new-year-habit-reset', 'rainy-day-joint-aches', 'dry-winter-sinuses',
  'garden-season-allergies', 'pet-dander-irritation', 'mold-sensitivity-home', 'perfume-sensitivity',
  'chemical-sensitivity-basics', 'fragrance-free-living', 'minimalist-skincare-barrier', 'hand-eczema-washing',
  'maskne-pattern', 'post-workout-soreness', 'doomsday-scrolling-anxiety', 'news-fatigue',
  'compassion-fatigue', 'empath-overwhelm-boundaries', 'people-pleasing-stress', 'perfectionism-tension',
  'imposter-syndrome-stress', 'public-speaking-nerves', 'interview-anxiety', 'test-anxiety',
  'writer-block-tension', 'creative-burnout', 'digital-detox-weekend', 'weekend-warrior-injury-prevention',
];

for (const slug of extras) {
  if (entries.length >= 220) break;
  if (seen.has(slug)) continue;
  seen.add(slug);
  const name = slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  entries.push(buildEntry([
    slug,
    name,
    'general',
    ['hydration', 'sleep hygiene', 'gentle movement', 'herbal tea appropriate to comfort', 'stress-reduction practice'],
    ['primary care if symptoms persist', 'targeted evaluation based on history', 'lifestyle counseling'],
    ['severe or sudden symptoms', 'symptoms lasting beyond a reasonable self-limited period', 'red-flag systemic signs'],
  ]));
}

const out = {
  version: 1,
  generatedAt: new Date().toISOString(),
  disclaimer:
    'Educational research content only. Not medical advice. Seek licensed care for health concerns. Stop and get emergency help for life-threatening symptoms.',
  count: entries.length,
  hotCount: entries.filter((e) => e.hot).length,
  entries,
};

const outPath = path.join(__dirname, '..', 'src', 'lib', 'remedies', 'catalog.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 0));
console.log(`Wrote ${entries.length} remedies (${out.hotCount} hot/Pro) → ${outPath}`);
