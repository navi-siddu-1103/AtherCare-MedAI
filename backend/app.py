from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import torch
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
from PIL import Image
import pandas as pd
import tempfile
from blood_report_analyzer import extract_text_from_file, parse_blood_report, generate_recommendations
import requests, re

# ----------------------------------------------------------
# App setup
# ----------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # Allow all endpoints
load_dotenv()

# ----------------------------------------------------------
# Model setup & Memory Optimization (Render 512MB RAM safe)
# ----------------------------------------------------------
import gc

torch.set_num_threads(1)
torch.set_grad_enabled(False)
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device} (threads=1)")

IMAGE_SIZE = 224
val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485]*3, [0.229]*3),
])

classes = [
    "Acne", "Bullous", "Candidiasis", "DrugEruption", "Infestations_Bites",
    "Lichen", "Lupus", "Moles", "Rosacea", "Seborrh_Keratoses",
    "Sun_Sunlight_Damage", "Unknown_Normal", "Vascular_Tumors",
    "Vasculitis", "Vitiligo", "Warts"
]
num_classes = len(classes)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "best_model.pth")

_model = None

def get_model():
    """Lazy load model to ensure fast startup and avoid OOM crash on Render."""
    global _model
    if _model is None:
        print("⏳ Loading EfficientNet model for prediction...")
        try:
            # from_name instantiates architecture without downloading 45MB ImageNet weights
            m = EfficientNet.from_name("efficientnet-b3", num_classes=num_classes)
            if os.path.exists(MODEL_PATH):
                state_dict = torch.load(MODEL_PATH, map_location=device)
                m.load_state_dict(state_dict)
                del state_dict
            else:
                print(f"⚠️ MODEL_PATH not found at {MODEL_PATH}, using uninitialized weights")
            m = m.to(device)
            m.eval()
            gc.collect()
            _model = m
            print("✅ Model loaded successfully into memory")
        except Exception as e:
            print(f"❌ Model loading failed: {e}")
            raise e
    return _model

# ----------------------------------------------------------
# Load Knowledge Base (CSV with in-memory fallback)
# ----------------------------------------------------------
KB_PATH = os.path.join(BASE_DIR, "disease_knowledge_base.csv")

DISEASE_FALLBACK = {
    "Acne": {
        "description": "A common inflammatory skin condition that occurs when hair follicles become plugged with oil and dead skin cells.",
        "treatments": "Topical retinoids, benzoyl peroxide, salicylic acid, and gentle non-comedogenic cleansing.",
        "precautions": "Avoid squeezing or picking lesions, wash face twice daily with mild cleanser, avoid oil-based cosmetics.",
        "references": "American Academy of Dermatology (AAD)"
    },
    "Bullous": {
        "description": "A group of rare autoimmune blistering diseases where the immune system attacks proteins in the skin.",
        "treatments": "Oral corticosteroids, immunosuppressive agents, and wound care under specialist supervision.",
        "precautions": "Protect skin from trauma, maintain sterile blister care, seek immediate dermatologist evaluation.",
        "references": "British Association of Dermatologists (BAD)"
    },
    "Candidiasis": {
        "description": "A fungal infection caused by Candida yeasts, often affecting warm, moist skin folds and mucous membranes.",
        "treatments": "Topical antifungal creams (clotrimazole, miconazole, nystatin) or oral fluconazole.",
        "precautions": "Keep affected areas dry and clean, wear breathable cotton fabrics, manage blood sugar if diabetic.",
        "references": "Centers for Disease Control and Prevention (CDC)"
    },
    "DrugEruption": {
        "description": "An adverse skin reaction caused by an ingested or injected medication.",
        "treatments": "Discontinuation of offending drug under doctor supervision, oral antihistamines, and topical soothing agents.",
        "precautions": "Identify and record offending medication, consult your prescribing physician immediately.",
        "references": "World Health Organization (WHO)"
    },
    "Infestations_Bites": {
        "description": "Skin lesions caused by insect bites, stings, or parasitic infestations such as scabies or lice.",
        "treatments": "Permethrin cream for scabies, hydrocortisone cream for itching, oral antihistamines.",
        "precautions": "Wash bedding in hot water, avoid scratching to prevent secondary bacterial infection.",
        "references": "AAD Guidelines"
    },
    "Lichen": {
        "description": "Lichen planus is a chronic inflammatory disorder causing purplish, itchy, flat-topped bumps on skin or mouth.",
        "treatments": "High-potency topical corticosteroids, antihistamines for itching, phototherapy.",
        "precautions": "Avoid scrubbing skin, use cool compresses to relieve itching, manage stress levels.",
        "references": "National Institutes of Health (NIH)"
    },
    "Lupus": {
        "description": "Cutaneous lupus erythematosus causes skin lesions, often including the characteristic butterfly rash across cheeks and nose.",
        "treatments": "Sun protection, topical calcineurin inhibitors, antimalarial medications (hydroxychloroquine).",
        "precautions": "Strict UV sun protection (SPF 50+), wear wide-brimmed hats, regular rheumatology checkups.",
        "references": "Lupus Foundation of America"
    },
    "Moles": {
        "description": "Common skin growths composed of clusters of pigment-producing melanocytes.",
        "treatments": "Routine dermatologic monitoring. Biopsy or surgical excision if atypical changes appear.",
        "precautions": "Perform monthly skin self-exams using ABCDE criteria (Asymmetry, Border, Color, Diameter, Evolving).",
        "references": "Skin Cancer Foundation"
    },
    "Rosacea": {
        "description": "A chronic inflammatory skin condition causing facial redness, visible blood vessels, and small red bumps.",
        "treatments": "Topical metronidazole, azelaic acid, brimonidine gel, or oral doxycycline.",
        "precautions": "Avoid known triggers (spicy food, alcohol, extreme temperatures), use mineral sunscreen daily.",
        "references": "National Rosacea Society"
    },
    "Seborrh_Keratoses": {
        "description": "A very common non-cancerous benign skin growth that appears waxy, scaly, or slightly raised.",
        "treatments": "Treatment usually unnecessary unless irritated; cryotherapy, curettage, or laser removal.",
        "precautions": "Do not scratch or rub lesions, have any rapidly changing or bleeding lesions examined.",
        "references": "AAD Guidelines"
    },
    "Sun_Sunlight_Damage": {
        "description": "Actinic changes caused by chronic ultraviolet radiation exposure, including actinic keratosis and photoaging.",
        "treatments": "Topical 5-fluorouracil, imiquimod, cryotherapy, and retinoid creams.",
        "precautions": "Wear broad-spectrum sunscreen daily, wear UV-protective clothing, avoid peak sun hours (10 AM - 4 PM).",
        "references": "Skin Cancer Foundation"
    },
    "Unknown_Normal": {
        "description": "No significant abnormal skin pathology was detected in the scanned image.",
        "treatments": "Continue standard skin hygiene and hydration.",
        "precautions": "Maintain regular sun protection and monitor for any new or evolving spots.",
        "references": "General Dermatology Guidelines"
    },
    "Vascular_Tumors": {
        "description": "Benign growths of blood vessels such as hemangiomas or cherry angiomas.",
        "treatments": "Observation for infants, pulsed dye laser or surgical excision for problematic lesions.",
        "precautions": "Protect from trauma to prevent bleeding, consult a pediatric or general dermatologist.",
        "references": "International Society for the Study of Vascular Anomalies"
    },
    "Vasculitis": {
        "description": "Inflammation of blood vessels in the skin, often presenting as palpable purpura or reddish-purple spots.",
        "treatments": "Treat underlying cause, rest, leg elevation, corticosteroids, or immunosuppressants.",
        "precautions": "Seek medical evaluation to rule out systemic organ involvement, elevate affected limbs.",
        "references": "Vasculitis Foundation"
    },
    "Vitiligo": {
        "description": "A long-term condition where pale white patches develop on the skin due to loss of melanocyte pigment cells.",
        "treatments": "Topical corticosteroids, tacrolimus ointment, narrowband UVB phototherapy, or JAK inhibitors.",
        "precautions": "Protect depigmented areas with high-SPF sunscreen as they burn easily.",
        "references": "Vitiligo Support International"
    },
    "Warts": {
        "description": "Benign skin growths caused by human papillomavirus (HPV) infection in the top skin layer.",
        "treatments": "Salicylic acid, cryotherapy (liquid nitrogen), or minor dermatological removal.",
        "precautions": "Do not pick or bite warts to prevent spreading, keep hands clean and dry.",
        "references": "AAD Guidelines"
    }
}

try:
    if os.path.exists(KB_PATH):
        kb_df = pd.read_csv(KB_PATH)
        kb_df.columns = kb_df.columns.str.strip().str.lower()
        expected_columns = ["disease_name", "description", "treatments", "precautions", "references", "last_updated"]
        for col in expected_columns:
            if col not in kb_df.columns:
                kb_df[col] = "Not provided"
        print(f"📊 Knowledge base records loaded from CSV: {len(kb_df)}")
    else:
        kb_df = pd.DataFrame()
except Exception as e:
    print(f"⚠️ Note on knowledge base: {e}")
    kb_df = pd.DataFrame()

# ----------------------------------------------------------
# Disease info lookup
# ----------------------------------------------------------
def get_disease_info(disease_name: str):
    if not kb_df.empty and 'disease_name' in kb_df.columns:
        row = kb_df[kb_df['disease_name'].str.lower().str.strip() == disease_name.lower().strip()]
        if not row.empty:
            info = row.iloc[0]
            return {
                "disease": info.get('disease_name', disease_name),
                "description": info.get('description', "Information not available."),
                "treatments": info.get('treatments', "Information not available."),
                "precautions": info.get('precautions', "Information not available."),
                "references": info.get('references', "Information not available."),
                "last_updated": info.get('last_updated', "N/A")
            }

    # Use comprehensive in-memory fallback
    normalized = disease_name.strip()
    data = DISEASE_FALLBACK.get(normalized, {})
    return {
        "disease": disease_name,
        "description": data.get("description", "A skin condition requiring professional dermatological evaluation."),
        "treatments": data.get("treatments", "Consult a certified healthcare provider for a customized treatment plan."),
        "precautions": data.get("precautions", "Avoid scratching or irritating the area, protect from sun exposure."),
        "references": data.get("references", "Standard Clinical Dermatology Guidelines"),
        "last_updated": "2026"
    }

# ----------------------------------------------------------
# Prediction helper
# ----------------------------------------------------------
def predict_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = val_transform(img).unsqueeze(0).to(device)
    m = get_model()
    with torch.no_grad():
        output = m(img)
        pred_class = output.argmax(1).item()
    return classes[pred_class]

# ----------------------------------------------------------
# Prediction API
# ----------------------------------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", file.filename)
    file.save(file_path)

    try:
        prediction = predict_image(file_path)
        print(f"🔍 Predicted disease: {prediction}")
        info = get_disease_info(prediction)
        response_json = {
            "prediction": prediction,
            "info": info,
            "disclaimer": "⚠️ These are AI-based suggestions for educational use only; consult a certified dermatologist for diagnosis and treatment."
        }
        return jsonify(response_json), 200
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.remove(file_path)
        except Exception:
            pass

# ----------------------------------------------------------
# Chatbot + Hospital Finder
# ----------------------------------------------------------
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route("/get", methods=["POST"])
def chatbot_response():
    user_message = request.json.get("msg", "")

    if "hospital" in user_message.lower() and any(
        x in user_message.lower() for x in ["near", "around", "in", "pin", "zip", "code"]
    ):
        return jsonify({"response": locate_hospitals(user_message)})

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "gpt-3.5-turbo",
        "messages": [
            {
                "role": "system",
                "content": "You are MediConnect's AI Health Assistant. Answer health-related queries and give helpful advice."
            },
            {"role": "user", "content": user_message}
        ]
    }

    try:
        res = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        result = res.json()
        reply = result["choices"][0]["message"]["content"]
        return jsonify({"response": reply})
    except Exception as e:
        print("Error:", e)
        return jsonify({"response": "⚠️ Could not connect to the AI service."})

def locate_hospitals(query):
    pin_match = re.search(r'\b\d{6}\b', query)
    location = pin_match.group() if pin_match else "Bangalore"
    try:
        url = f"https://nominatim.openstreetmap.org/search?format=json&q=hospital+near+{location}&limit=5"
        res = requests.get(url, headers={"User-Agent": "MediConnectBot"})
        data = res.json()
        if not data:
            return f"Sorry, I couldn't find hospitals near {location}."
        hospitals = []
        for place in data:
            name = place.get("display_name", "Unnamed Hospital")
            lat = place.get("lat")
            lon = place.get("lon")
            hospitals.append(f"🏥 {name}\n📍 https://www.google.com/maps?q={lat},{lon}")
        return "Here are some hospitals I found:\n\n" + "\n\n".join(hospitals)
    except Exception as e:
        return f"Error finding hospitals: {str(e)}"

# ----------------------------------------------------------
# /analyze Blood Report Analyzer Endpoint
# ----------------------------------------------------------
@app.route('/analyze', methods=['POST'])
def analyze_report():
    """
    Endpoint: /analyze
    Accepts: Multipart form-data with 'file' (PDF/Image)
    Returns: JSON analysis results
    """
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file uploaded"}), 400
    
    uploaded_file = request.files['file']
    
    if uploaded_file.filename == '':
        return jsonify({"status": "error", "message": "Empty filename"}), 400
    
    allowed_extensions = ('.pdf', '.jpg', '.jpeg', '.png')
    ext = os.path.splitext(uploaded_file.filename.lower())[1]
    if ext not in allowed_extensions:
        return jsonify({"status": "error", "message": "Invalid file format. Please upload PDF or image."}), 400

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        uploaded_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        text = extract_text_from_file(tmp_path)
        results = parse_blood_report(text)
        recs = generate_recommendations(results)

        response = {
            "status": "success",
            "file": uploaded_file.filename,
            "results": results,
            "recommendations": recs
        }
    except Exception as e:
        response = {"status": "error", "message": str(e)}
    finally:
        os.remove(tmp_path)
    
    return jsonify(response)

# ----------------------------------------------------------
# Root / Health check endpoint
# ----------------------------------------------------------
@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AtherCare-MedAI Backend",
        "endpoints": ["/predict", "/get", "/analyze"]
    }), 200

# ----------------------------------------------------------
# Run the app
# ----------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port)
