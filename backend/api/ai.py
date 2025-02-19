from PIL import Image
import numpy as np
import onnxruntime as ort
import joblib
import os
import requests
from api.models import EmbeddingData

model_dir = os.path.join(os.path.dirname(__file__), 'ai_model')
face_classifier = joblib.load(os.path.join(model_dir, 'face_classifier.pkl'))

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

# Hàm tiền xử lý ảnh và chuyển đổi thành numpy array
def preprocess_image(img):
    img = img.resize((160, 160))
    img = np.array(img)
    img = ((img.astype(np.float32) / 255.0) - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    return np.expand_dims(np.transpose(img, (2, 0, 1)), axis=0).astype(np.float32)

def predict(image):
    face_input = preprocess_image(image)
    outputs = session.run(None, {session.get_inputs()[0].name: face_input})
    prediction = face_classifier.predict(outputs[0])
    print("Dự đoán:", prediction[0])
    return prediction[0]

def train(images_path, label):
    global face_classifier
    for image_path in images_path:
        image = Image.open(image_path)
        image = image.convert('RGB')
        face_input = preprocess_image(image)  
        output = session.run(None, {session.get_inputs()[0].name: face_input})
        embedding = output[0][0].tolist()
        instance = EmbeddingData(embedding=embedding, label=label)
        instance.save()
        print("Lưu embedding thành công")

    data = EmbeddingData.objects.all()
    embeddings = []
    labels = []
    for item in data:
        embeddings.append(item.embedding) 
        labels.append(item.label)

    face_classifier.fit(embeddings, labels)
    print(face_classifier.classes_)
    print("Huấn luyện lại thành công")
    return True

