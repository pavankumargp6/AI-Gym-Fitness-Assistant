import cv2
import numpy as np
import urllib.request
import os

# Download the pose landmarker model if not present
MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker.task")
if not os.path.exists(MODEL_PATH):
    url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
    print("Downloading MediaPipe pose model...")
    urllib.request.urlretrieve(url, MODEL_PATH)
    print("Model downloaded.")

from mediapipe import tasks
from mediapipe.tasks import python as mp_python
from mediapipe.tasks.python import vision as mp_vision
import mediapipe as mp

# Landmark indices for left arm
LEFT_SHOULDER = 11
LEFT_ELBOW = 13
LEFT_WRIST = 15

# Lazy initialization — detector is created on first use, not at import time
_detector = None

def get_detector():
    global _detector
    if _detector is None:
        base_options = mp_python.BaseOptions(model_asset_path=MODEL_PATH)
        options = mp_vision.PoseLandmarkerOptions(
            base_options=base_options,
            output_segmentation_masks=False,
            running_mode=mp_vision.RunningMode.IMAGE
        )
        _detector = mp_vision.PoseLandmarker.create_from_options(options)
    return _detector

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians * 180.0 / np.pi)
    if angle > 180.0:
        angle = 360 - angle
    return angle

def process_frame(image_bytes: bytes, stage: str, counter: int):
    nparr = np.frombuffer(image_bytes, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if image is None:
        return {"error": "Invalid image format"}

    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    import mediapipe as mp
    mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_image)

    results = get_detector().detect(mp_image)

    feedback = "No pose detected"
    landmarks_list = []

    if results.pose_landmarks and len(results.pose_landmarks) > 0:
        landmarks = results.pose_landmarks[0]
        try:
            shoulder = [landmarks[LEFT_SHOULDER].x, landmarks[LEFT_SHOULDER].y]
            elbow = [landmarks[LEFT_ELBOW].x, landmarks[LEFT_ELBOW].y]
            wrist = [landmarks[LEFT_WRIST].x, landmarks[LEFT_WRIST].y]

            angle = calculate_angle(shoulder, elbow, wrist)

            if angle > 160:
                stage = "down"
                feedback = "Good extension"
            if angle < 30 and stage == "down":
                stage = "up"
                counter += 1
                feedback = "Good curl!"
            elif angle > 30 and angle <= 160:
                feedback = "Keep going"

            for lm in landmarks:
                landmarks_list.append({
                    "x": lm.x, "y": lm.y,
                    "z": lm.z, "visibility": lm.visibility
                })
        except Exception as e:
            feedback = f"Error processing joints: {str(e)}"

    return {
        "counter": counter,
        "stage": stage,
        "feedback": feedback,
        "landmarks": landmarks_list
    }


