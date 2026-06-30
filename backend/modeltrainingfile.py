import os
import shutil
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, datasets
from torch.utils.data import DataLoader, WeightedRandomSampler
from efficientnet_pytorch import EfficientNet
from sklearn.utils.class_weight import compute_class_weight
from sklearn.metrics import classification_report, ConfusionMatrixDisplay
import matplotlib.pyplot as plt

# --------------------------
# 1. Hyper-parameters
# --------------------------
IMAGE_SIZE = 224
BATCH_SIZE = 32
EPOCHS     = 25
LR         = 1e-4
DATA_DIR   = "/content/drive/MyDrive/unzipped_data_SkinDisease/SkinDisease/SkinDisease"

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# --------------------------
# 2. Data Augmentation
# --------------------------
train_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomVerticalFlip(),
    transforms.RandomRotation(20),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize([0.485]*3, [0.229]*3),
])

val_transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485]*3, [0.229]*3),
])

# --------------------------
# 3. Load Dataset
# --------------------------
def get_datasets():
    train_ds = datasets.ImageFolder(os.path.join(DATA_DIR, "train"), transform=train_transform)
    val_ds   = datasets.ImageFolder(os.path.join(DATA_DIR, "test"),  transform=val_transform)
    return train_ds, val_ds

train_ds, val_ds = get_datasets()

# --------------------------
# 4. Class Weights + Sampler
# --------------------------
labels = [label for _, label in train_ds.samples]
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.arange(len(train_ds.classes)),
    y=labels
)
class_weights = torch.tensor(class_weights, dtype=torch.float).to(device)
criterion = nn.CrossEntropyLoss(weight=class_weights)

class_count = np.bincount(labels)
weights_per_sample = 1. / class_count[labels]
sampler = WeightedRandomSampler(weights_per_sample,
                                num_samples=len(weights_per_sample),
                                replacement=True)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE,
                          sampler=sampler, num_workers=4)
val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE,
                          shuffle=False, num_workers=4)

# --------------------------
# 5. Model
# --------------------------
model = EfficientNet.from_pretrained("efficientnet-b3", num_classes=len(train_ds.classes))
model = model.to(device)

optimizer = optim.AdamW(model.parameters(), lr=LR)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

# --------------------------
# 6. Training Loop
# --------------------------
best_acc = 0
for epoch in range(1, EPOCHS + 1):
    model.train()
    running_loss, correct, total = 0, 0, 0

    for imgs, targets in train_loader:
        imgs, targets = imgs.to(device), targets.to(device)
        optimizer.zero_grad()
        outputs = model(imgs)
        loss = criterion(outputs, targets)
        loss.backward()
        optimizer.step()

        running_loss += loss.item() * imgs.size(0)
        correct += (outputs.argmax(1) == targets).sum().item()
        total += targets.size(0)

    train_loss = running_loss / total
    train_acc  = correct / total

    # validation
    model.eval()
    val_loss, val_correct, val_total = 0, 0, 0
    with torch.no_grad():
        for imgs, targets in val_loader:
            imgs, targets = imgs.to(device), targets.to(device)
            outputs = model(imgs)
            loss = criterion(outputs, targets)
            val_loss += loss.item() * imgs.size(0)
            val_correct += (outputs.argmax(1) == targets).sum().item()
            val_total += targets.size(0)

    val_loss /= val_total
    val_acc  = val_correct / val_total
    scheduler.step()

    print(f"Epoch {epoch:02d}: "
          f"Train loss {train_loss:.4f}, acc {train_acc:.4f} | "
          f"Val loss {val_loss:.4f}, acc {val_acc:.4f}")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), "best_model.pth")
        print("  ✅ Saved best model")

print("Training complete. Best Val Accuracy:", best_acc)

# --------------------------
# 7. Evaluation (F1 Scores)
# --------------------------
model.load_state_dict(torch.load("best_model.pth"))
model.eval()
all_preds, all_labels = [], []
with torch.no_grad():
    for imgs, targets in val_loader:
        imgs = imgs.to(device)
        preds = model(imgs).argmax(1)
        all_preds.extend(preds.cpu().tolist())
        all_labels.extend(targets.tolist())

report = classification_report(all_labels, all_preds,
                               target_names=train_ds.classes, digits=3,
                               output_dict=True)

# Print report
for cls, metrics in report.items():
    if isinstance(metrics, dict):
        print(f"{cls}: F1={metrics['f1-score']:.3f}")

# --------------------------
# 8. Remove low-F1 classes automatically
# --------------------------
THRESHOLD = 0.5   # keep classes with F1 >= 0.5
bad_classes = [cls for cls, m in report.items() if isinstance(m, dict) and m["f1-score"] < THRESHOLD]
print("Dropping classes:", bad_classes)

# Make filtered dataset
def filter_classes(dataset_dir, keep_classes):
    for split in ["train", "test"]:
        split_dir = os.path.join(dataset_dir, split)
        for cls in os.listdir(split_dir):
            if cls not in keep_classes:
                shutil.rmtree(os.path.join(split_dir, cls), ignore_errors=True)

keep_classes = [cls for cls in train_ds.classes if cls not in bad_classes]
filter_classes(DATA_DIR, keep_classes)

print("Filtered dataset created with classes:", keep_classes)

# --------------------------
# 9. Retrain on remaining classes
# --------------------------
train_ds, val_ds = get_datasets()
labels = [label for _, label in train_ds.samples]
class_weights = compute_class_weight("balanced", classes=np.arange(len(train_ds.classes)), y=labels)
class_weights = torch.tensor(class_weights, dtype=torch.float).to(device)
criterion = nn.CrossEntropyLoss(weight=class_weights)

class_count = np.bincount(labels)
weights_per_sample = 1. / class_count[labels]
sampler = WeightedRandomSampler(weights_per_sample, num_samples=len(weights_per_sample), replacement=True)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, sampler=sampler, num_workers=4)
val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE, shuffle=False, num_workers=4)

model = EfficientNet.from_pretrained("efficientnet-b3", num_classes=len(train_ds.classes)).to(device)
optimizer = optim.AdamW(model.parameters(), lr=LR)
scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=EPOCHS)

print("✅ Now retraining on filtered classes:", train_ds.classes)
