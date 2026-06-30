"""
Improved Blood Report Analyzer with better OCR parsing
"""

import re
import os
import json
import argparse
from typing import List, Dict, Optional, Tuple

try:
    from PIL import Image
    import pytesseract
except ImportError:
    raise ImportError('Install: pip install pillow pytesseract')

try:
    import fitz
except ImportError:
    fitz = None

try:
    from pdf2image import convert_from_path
except ImportError:
    convert_from_path = None

# Reference ranges
REFERENCE_RANGES = {
    'hemoglobin': {'unit': 'g/dL', 'male': (13.5, 17.5), 'female': (12.0, 15.5), 'default': (12.0, 17.0)},
    'rbc': {'unit': 'million/µL', 'default': (4.0, 6.0)},
    'wbc': {'unit': 'thousand/µL', 'default': (4.0, 11.0)},
    'platelets': {'unit': 'thousand/µL', 'default': (150, 450)},
    'mcv': {'unit': 'fL', 'default': (80, 100)},
    'mch': {'unit': 'pg', 'default': (27, 33)},
    'mchc': {'unit': 'g/dL', 'default': (32, 36)},
    'rdw': {'unit': '%', 'default': (11.5, 14.5)},
    'neutrophils': {'unit': '%', 'default': (40, 75)},
    'lymphocytes': {'unit': '%', 'default': (20, 45)},
    'monocytes': {'unit': '%', 'default': (2, 8)},
    'eosinophils': {'unit': '%', 'default': (1, 4)},
    'basophils': {'unit': '%', 'default': (0, 1)},
    'glucose_fasting': {'unit': 'mg/dL', 'default': (70, 100)},
    'glucose_random': {'unit': 'mg/dL', 'default': (70, 140)},
    'hba1c': {'unit': '%', 'default': (4.0, 5.6)},
    'urea': {'unit': 'mg/dL', 'default': (7, 20)},
    'creatinine': {'unit': 'mg/dL', 'male': (0.7, 1.3), 'female': (0.6, 1.1), 'default': (0.6, 1.3)},
    'cholesterol_total': {'unit': 'mg/dL', 'default': (0, 200)},
    'triglycerides': {'unit': 'mg/dL', 'default': (0, 150)},
    'hdl': {'unit': 'mg/dL', 'default': (40, 60)},
    'ldl': {'unit': 'mg/dL', 'default': (0, 100)},
    'tsh': {'unit': 'µIU/mL', 'default': (0.5, 5.0)},
    'vitamin_d': {'unit': 'ng/mL', 'default': (30, 100)},
    'vitamin_b12': {'unit': 'pg/mL', 'default': (200, 900)},
}

# Improved test name patterns
TEST_PATTERNS = {
    r'\b(?:hb|hemoglobin)\b.*?(\d+\.?\d*)\s*(?:g/dl|g/l)?': 'hemoglobin',
    r'\b(?:rbc|red blood cell)\b.*?(\d+\.?\d*)\s*(?:mill|m/|10\^6)?': 'rbc',
    r'\b(?:wbc|white blood cell|total wbc)\b.*?(\d+\.?\d*)\s*(?:thou|k/|10\^3)?': 'wbc',
    r'\b(?:platelet|plt)\s*count\b.*?(\d+\.?\d*)\s*(?:thou|k/|lakhs|10\^3)?': 'platelets',
    r'\bmcv\b.*?(\d+\.?\d*)\s*(?:fl)?': 'mcv',
    r'\bmch\b(?!c).*?(\d+\.?\d*)\s*(?:pg)?': 'mch',
    r'\bmchc\b.*?(\d+\.?\d*)\s*(?:g/dl)?': 'mchc',
    r'\brdw\b.*?(\d+\.?\d*)\s*(?:%)?': 'rdw',
    r'\b(?:neutrophil|neut)\b.*?(\d+\.?\d*)\s*(?:%)?': 'neutrophils',
    r'\b(?:lymphocyte|lymph)\b.*?(\d+\.?\d*)\s*(?:%)?': 'lymphocytes',
    r'\b(?:monocyte|mono)\b.*?(\d+\.?\d*)\s*(?:%)?': 'monocytes',
    r'\b(?:eosinophil|eos)\b.*?(\d+\.?\d*)\s*(?:%)?': 'eosinophils',
    r'\b(?:basophil|baso)\b.*?(\d+\.?\d*)\s*(?:%)?': 'basophils',
    r'\b(?:glucose|fbs|fasting blood sugar|blood sugar fasting)\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'glucose_fasting',
    r'\b(?:hba1c|a1c|glycated hemoglobin)\b.*?(\d+\.?\d*)\s*(?:%)?': 'hba1c',
    r'\b(?:creatinine|serum creatinine)\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'creatinine',
    r'\b(?:urea|bun|blood urea)\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'urea',
    r'\b(?:total cholesterol|cholesterol total|cholesterol)\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'cholesterol_total',
    r'\b(?:triglyceride|tg)\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'triglycerides',
    r'\bhdl\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'hdl',
    r'\bldl\b.*?(\d+\.?\d*)\s*(?:mg/dl)?': 'ldl',
    r'\btsh\b.*?(\d+\.?\d*)\s*(?:µiu/ml|uiu/ml)?': 'tsh',
    r'\b(?:vitamin d|vit d|25-oh d)\b.*?(\d+\.?\d*)\s*(?:ng/ml)?': 'vitamin_d',
    r'\b(?:vitamin b12|vit b12|b12)\b.*?(\d+\.?\d*)\s*(?:pg/ml)?': 'vitamin_b12',
}

def extract_text_from_pdf(path: str) -> str:
    texts = []
    if fitz:
        try:
            doc = fitz.open(path)
            for page in doc:
                txt = page.get_text("text")
                if txt and len(txt.strip()) > 20:
                    texts.append(txt)
            if texts:
                return "\n".join(texts)
        except:
            pass
    
    if convert_from_path:
        pages = convert_from_path(path)
        for p in pages:
            texts.append(pytesseract.image_to_string(p))
    
    return "\n".join(texts)

def extract_text_from_file(path: str) -> str:
    ext = os.path.splitext(path)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(path)
    else:
        img = Image.open(path).convert('RGB')
        return pytesseract.image_to_string(img)

def is_valid_value(test_name: str, value: float) -> bool:
    """Filter out obviously wrong values based on test type"""
    ranges = {
        'hemoglobin': (5, 25),
        'rbc': (2, 8),
        'wbc': (1, 50),
        'platelets': (10, 1000),
        'mcv': (50, 120),
        'mch': (20, 40),
        'mchc': (28, 40),
        'rdw': (10, 25),
        'neutrophils': (0, 100),
        'lymphocytes': (0, 100),
        'monocytes': (0, 20),
        'eosinophils': (0, 20),
        'basophils': (0, 5),
        'glucose_fasting': (40, 500),
        'hba1c': (3, 15),
        'creatinine': (0.3, 15),
        'urea': (5, 200),
        'cholesterol_total': (100, 600),
        'triglycerides': (30, 1000),
        'hdl': (20, 150),
        'ldl': (30, 400),
        'tsh': (0.01, 20),
        'vitamin_d': (5, 200),
        'vitamin_b12': (100, 2000),
    }
    
    if test_name in ranges:
        min_val, max_val = ranges[test_name]
        return min_val <= value <= max_val
    return True

def parse_blood_report(text: str) -> Dict[str, Dict]:
    """Extract blood test values using improved pattern matching"""
    text = text.lower()
    results = {}
    
    for pattern, test_name in TEST_PATTERNS.items():
        matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
        for match in matches:
            try:
                value = float(match.group(1))
                if is_valid_value(test_name, value):
                    # Keep the best value (avoid duplicates)
                    if test_name not in results or abs(value - get_reference_midpoint(test_name)) < abs(results[test_name]['value'] - get_reference_midpoint(test_name)):
                        results[test_name] = {
                            'value': value,
                            'unit': REFERENCE_RANGES.get(test_name, {}).get('unit', ''),
                            'raw_text': match.group(0)
                        }
            except:
                continue
    
    return results

def get_reference_midpoint(test_name: str) -> float:
    """Get midpoint of reference range for comparison"""
    ref = REFERENCE_RANGES.get(test_name, {}).get('default', (0, 100))
    return (ref[0] + ref[1]) / 2

def get_reference_range(test_name: str, patient: Optional[Dict] = None) -> Optional[Tuple[float, float]]:
    entry = REFERENCE_RANGES.get(test_name)
    if not entry:
        return None
    
    if patient and 'sex' in patient and patient['sex'] in entry:
        return tuple(entry[patient['sex']])
    
    return tuple(entry.get('default', (0, 0)))

def interpret_value(test_name: str, value: float, patient: Optional[Dict] = None) -> Dict:
    rng = get_reference_range(test_name, patient)
    status = 'unknown'
    note = ''
    
    if rng:
        low, high = rng
        if value < low:
            status = 'low'
            pct = ((low - value) / low * 100)
            note = f'{test_name.replace("_", " ").title()} is {pct:.1f}% below normal range'
        elif value > high:
            status = 'high'
            pct = ((value - high) / high * 100)
            note = f'{test_name.replace("_", " ").title()} is {pct:.1f}% above normal range'
        else:
            status = 'normal'
            note = 'Within normal range'
    
    return {'status': status, 'note': note, 'range': rng}

def generate_recommendations(results: Dict, patient: Optional[Dict] = None) -> List[str]:
    recs = []
    
    # Check for critical findings
    if 'hemoglobin' in results:
        interp = interpret_value('hemoglobin', results['hemoglobin']['value'], patient)
        if interp['status'] == 'low':
            recs.append('⚠️ Low hemoglobin detected - May indicate anemia. Recommend checking iron studies, vitamin B12, and folate levels.')
        elif interp['status'] == 'high':
            recs.append('⚠️ High hemoglobin - May indicate dehydration or polycythemia. Clinical correlation needed.')
    
    if 'glucose_fasting' in results:
        val = results['glucose_fasting']['value']
        if val >= 126:
            recs.append('🔴 CRITICAL: Fasting glucose ≥126 mg/dL suggests diabetes. Immediate medical consultation recommended.')
        elif val >= 100:
            recs.append('⚠️ Elevated fasting glucose (100-125 mg/dL) - Prediabetes range. Lifestyle modifications and monitoring needed.')
    
    if 'hba1c' in results:
        val = results['hba1c']['value']
        if val >= 6.5:
            recs.append('🔴 HbA1c ≥6.5% indicates diabetes. Medical consultation required for management.')
        elif val >= 5.7:
            recs.append('⚠️ HbA1c in prediabetes range (5.7-6.4%). Lifestyle changes recommended.')
    
    if 'creatinine' in results:
        interp = interpret_value('creatinine', results['creatinine']['value'], patient)
        if interp['status'] == 'high':
            recs.append('⚠️ Elevated creatinine - Kidney function assessment needed. Calculate eGFR and consult physician.')
    
    if 'cholesterol_total' in results and results['cholesterol_total']['value'] > 200:
        recs.append('⚠️ Total cholesterol >200 mg/dL - Cardiovascular risk assessment and lifestyle modifications recommended.')
    
    if 'platelets' in results:
        val = results['platelets']['value']
        if val < 150:
            recs.append('⚠️ Low platelet count - Bleeding risk assessment needed. Consider hematology referral if <100.')
    
    if 'wbc' in results:
        interp = interpret_value('wbc', results['wbc']['value'], patient)
        if interp['status'] == 'high':
            recs.append('⚠️ Elevated WBC - May indicate infection or inflammation. Clinical correlation needed.')
        elif interp['status'] == 'low':
            recs.append('⚠️ Low WBC - Increased infection risk. Follow-up testing recommended.')
    
    if not recs:
        recs.append('✅ No critical abnormalities detected in automated analysis.')
    
    recs.append('\n📋 IMPORTANT: This is an automated analysis for informational purposes only. Always consult with a qualified healthcare professional for proper diagnosis and treatment.')
    
    return recs

def print_report(results: Dict, patient: Optional[Dict] = None):
    print('\n' + '='*70)
    print('BLOOD REPORT ANALYSIS')
    print('='*70)
    
    if not results:
        print('\n⚠️ No blood test values were detected in the document.')
        print('This could be due to:')
        print('  - Poor image/PDF quality')
        print('  - Unusual report format')
        print('  - OCR reading errors')
        print('\nTry:')
        print('  - Using a clearer scan/image')
        print('  - Converting PDF to high-quality images first')
        return
    
    print(f'\nDetected {len(results)} test parameters:\n')
    
    for test_name, data in sorted(results.items()):
        value = data['value']
        unit = data['unit']
        interp = interpret_value(test_name, value, patient)
        
        status_symbol = {
            'low': '⬇️ LOW',
            'high': '⬆️ HIGH',
            'normal': '✓ NORMAL',
            'unknown': '? UNKNOWN'
        }[interp['status']]
        
        rng = interp['range']
        rng_text = f"[{rng[0]}-{rng[1]}]" if rng else "N/A"
        
        print(f"{test_name.replace('_', ' ').title():25s}: {value:8.2f} {unit:10s} {status_symbol:12s} Ref: {rng_text}")
    
    print('\n' + '='*70)
    print('RECOMMENDATIONS')
    print('='*70)
    
    recommendations = generate_recommendations(results, patient)
    for rec in recommendations:
        print(f'\n{rec}')
    
    print('\n' + '='*70)

def main():
    parser = argparse.ArgumentParser(description='Improved Blood Report Analyzer')
    parser.add_argument('--files', '-f', nargs='+', required=True, help='PDF or image files')
    parser.add_argument('--patient', '-p', type=str, default='{}', help='Patient info JSON')
    parser.add_argument('--output', '-o', type=str, help='Output JSON file')
    args = parser.parse_args()
    
    patient = None
    if args.patient and args.patient != '{}':
        try:
            patient = json.loads(args.patient)
        except:
            pass
    
    print(f'\nProcessing {len(args.files)} file(s)...')
    
    combined_text = []
    for file_path in args.files:
        print(f'  Reading: {file_path}')
        try:
            text = extract_text_from_file(file_path)
            combined_text.append(text)
        except Exception as e:
            print(f'  Error: {e}')
    
    full_text = '\n'.join(combined_text)
    results = parse_blood_report(full_text)
    
    print_report(results, patient)
    
    if args.output:
        report = {
            'patient': patient or {},
            'results': results,
            'recommendations': generate_recommendations(results, patient)
        }
        with open(args.output, 'w') as f:
            json.dump(report, f, indent=2)
        print(f'\n💾 Report saved to: {args.output}')

if __name__ == '__main__':
    main()