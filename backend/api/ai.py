from PIL import Image
import numpy as np
import onnxruntime as ort
import joblib
import os
import requests
from sklearn.svm import SVC
from api.models import EmbeddingData
import mediapipe as mp


model_dir = os.path.join(os.path.dirname(__file__), 'ai_model')
model_path = os.path.join(model_dir, 'face_classifier.pkl')
if os.path.exists(model_path):
    face_classifier = joblib.load(model_path)
    print("Model đã được load từ file.")
else:
    print("Không tìm thấy model. Tạo model mới...")
    face_classifier = SVC()
    joblib.dump(face_classifier, model_path)

def download_file_from_google_drive(id, destination):
    URL = "https://docs.google.com/uc?export=download"

    session = requests.Session()

    response = session.get(URL, params = { 'id' : id }, stream = True)
    token = get_confirm_token(response)

    if token:
        params = { 'id' : id, 'confirm' : token }
        response = session.get(URL, params = params, stream = True)

    save_response_content(response, destination)    

def get_confirm_token(response):
    for key, value in response.cookies.items():
        if key.startswith('download_warning'):
            return value

    return None

def save_response_content(response, destination):
    CHUNK_SIZE = 32768

    with open(destination, "wb") as f:
        for chunk in response.iter_content(CHUNK_SIZE):
            if chunk: # filter out keep-alive new chunks
                f.write(chunk)

def load_model():
    output = os.path.join(model_dir, 'face_recognition.onnx')
    if not os.path.exists(output):
        print("Tải file từ Google Drive...")
        download_file_from_google_drive('1878GEipcUeS5IpDUSTN3dqee3dZ6PipG', output)
        print("File đã tải xuống thành công.")

    # Load model từ file
    return ort.InferenceSession(output)

session = load_model()

def detect_main_face(image):
        mp_face_detection = mp.solutions.face_detection
        face_detector = mp_face_detection.FaceDetection(min_detection_confidence=0.5)
        image = image.convert("RGB")
        image_np = np.array(image)
        results = face_detector.process(image_np)
        if results.detections:
            img_w, img_h = image.size
            best_detection = max(results.detections, key=lambda d: d.score[0])
            bboxC = best_detection.location_data.relative_bounding_box
            x, y, w, h = bboxC.xmin, bboxC.ymin, bboxC.width, bboxC.height
            x1, y1 = int(x * img_w), int(y * img_h)
            x2, y2 = int((x + w) * img_w), int((y + h) * img_h)
            face = image.crop((x1, y1, x2, y2))
            return face 
        return None


# Hàm tiền xử lý ảnh và chuyển đổi thành numpy array
def preprocess_image(img):
    img = detect_main_face(img)
    img = img.resize((160, 160))
    img = np.array(img)
    img = ((img.astype(np.float32) / 255.0) - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    return np.expand_dims(np.transpose(img, (2, 0, 1)), axis=0).astype(np.float32)

# def predict(image):
#     face_input = preprocess_image(image)
#     outputs = session.run(None, {session.get_inputs()[0].name: face_input})
#     prediction = face_classifier.predict(outputs[0])
#     print(face_classifier.predict_proba(outputs[0]))
#     print(face_classifier.classes_)
#     print("Dự đoán:", prediction[0])
#     return prediction[0]

import numpy as np

def predict(image):
    face_input = preprocess_image(image)
    outputs = session.run(None, {session.get_inputs()[0].name: face_input})

    probabilities = face_classifier.predict_proba(outputs[0]) 
    predicted_index = int(np.argmax(probabilities)) 
    max_prob = float(np.max(probabilities)) 
    predicted_label = face_classifier.classes_[predicted_index] 
    print("Xác suất từng lớp:", probabilities)
    print("Danh sách lớp:", face_classifier.classes_)
    print(f"Dự đoán: {predicted_label}, Xác suất: {max_prob:.4f}", max_prob >= 0.35)
    return predicted_label if max_prob >= 0.35 else False


def train(images_path, label):
    EmbeddingData.objects.filter(label=label).delete()

    global face_classifier
    for image_path in images_path:
        image = Image.open(image_path)
        image = image.convert('RGB')
        face_input = preprocess_image(image)  
        output = session.run(None, {session.get_inputs()[0].name: face_input})
        embedding = output[0][0].tolist()
        instance = EmbeddingData(embedding=embedding, label=label)
        instance.save()
        os.remove(image_path)
        print("Lưu embedding thành công")

    data = EmbeddingData.objects.all()
    embeddings = []
    labels = []
    for item in data:
        embeddings.append(item.embedding) 
        labels.append(item.label)

    if len(set(labels)) == 1:
        print("Chỉ có một nhãn duy nhất, thêm embedding giả...")
        dummy_embedding = np.random.rand(len(embeddings[0])).tolist()
        embeddings.append(dummy_embedding)
        labels.append("unknown")

    face_classifier = SVC(kernel='linear', probability=True)
    face_classifier.fit(embeddings, labels)
    joblib.dump(face_classifier, os.path.join(model_dir, 'face_classifier.pkl'))
    print("Các lớp trong mô hình mới:", face_classifier.classes_)
    print("Huấn luyện lại thành công")
    return True

