# --------------------------
# 0. Install required packages (if not already)
# --------------------------


# --------------------------
# 1. Imports
# --------------------------
import torch
from torchvision import transforms
from efficientnet_pytorch import EfficientNet
from PIL import Image
import os

# --------------------------
# 2. Device
# --------------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --------------------------
# 3. Image preprocessing (same as validation)
# --------------------------
IMAGE_SIZE = 224
val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485]*3, [0.229]*3),
])

# --------------------------
# 4. Class names (from your classification report)
# --------------------------
classes = [
    "Acne",
    "Bullous",
    "Candidiasis",
    "DrugEruption",
    "Infestations_Bites",
    "Lichen",
    "Lupus",
    "Moles",
    "Rosacea",
    "Seborrh_Keratoses",
    "Sun_Sunlight_Damage",
    "Unknown_Normal",
    "Vascular_Tumors",
    "Vasculitis",
    "Vitiligo",
    "Warts"
]

num_classes = len(classes)

# --------------------------
# 5. Load trained model
# --------------------------
model = EfficientNet.from_pretrained("efficientnet-b3", num_classes=num_classes)
model.load_state_dict(torch.load("best_model.pth", map_location=device))
model = model.to(device)
model.eval()

# --------------------------
# 6. Prediction function
# --------------------------
def predict_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = val_transform(img).unsqueeze(0).to(device)
    with torch.no_grad():
        output = model(img)
        pred_class = output.argmax(1).item()
    return classes[pred_class]

# --------------------------
# 7. User input & prediction
# --------------------------
image_path = input("Enter the path of the image to predict: ").strip()

if os.path.exists(image_path):
    predicted_class = predict_image(image_path)
    print(f"✅ Predicted disease class: {predicted_class}")
else:
    print("❌ Error: File not found. Please check the path and try again.")
