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
# Model setup
# ----------------------------------------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"✅ Using device: {device}")

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

# ----------------------------------------------------------
# Load trained model
# ----------------------------------------------------------
try:
    model = EfficientNet.from_pretrained("efficientnet-b3", num_classes=num_classes)
    model.load_state_dict(torch.load("best_model.pth", map_location=device))
    model = model.to(device)
    model.eval()
    print("✅ Model loaded successfully")
except Exception as e:
    print(f"❌ Model loading failed: {e}")

# ----------------------------------------------------------
# Load Knowledge Base (CSV)
# ----------------------------------------------------------
KB_PATH = "/Users/pandu/Documents/disease_knowledge_base.csv"
print(f"📁 Loading knowledge base from: {KB_PATH}")

try:
    kb_df = pd.read_csv(KB_PATH)
    print(f"📊 Knowledge base records loaded: {len(kb_df)}")
    kb_df.columns = kb_df.columns.str.strip().str.lower()

    expected_columns = ["disease_name", "description", "treatments", "precautions", "references", "last_updated"]
    for col in expected_columns:
        if col not in kb_df.columns:
            kb_df[col] = "Not provided"
except Exception as e:
    print(f"❌ Failed to load knowledge base CSV: {e}")
    kb_df = pd.DataFrame(columns=["disease_name", "description", "treatments", "precautions", "references", "last_updated"])

# ----------------------------------------------------------
# Disease info lookup
# ----------------------------------------------------------
def get_disease_info(disease_name: str):
    row = kb_df[kb_df['disease_name'].str.lower().str.strip() == disease_name.lower().strip()]
    if row.empty:
        print(f"⚠️ No info found for disease: {disease_name}")
        return {
            "disease": disease_name,
            "description": "Information not available.",
            "treatments": "Information not available.",
            "precautions": "Information not available.",
            "references": "Information not available.",
            "last_updated": "N/A"
        }
    info = row.iloc[0]
    return {
        "disease": info.get('disease_name', disease_name),
        "description": info.get('description', "Information not available."),
        "treatments": info.get('treatments', "Information not available."),
        "precautions": info.get('precautions', "Information not available."),
        "references": info.get('references', "Information not available."),
        "last_updated": info.get('last_updated', "N/A")
    }

# ----------------------------------------------------------
# Prediction helper
# ----------------------------------------------------------
def predict_image(img_path):
    img = Image.open(img_path).convert("RGB")
    img = val_transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(img)
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
# Run the app
# ----------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
