import cv2
import numpy as np
from deepface import DeepFace
import os
from PIL import Image
import base64
import io

class FaceMatcher:
    def __init__(self):
        # Initialize face detector
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def detect_face(self, image_path):
        """
        Detect if there is a face in the image and return True/False
        """
        try:
            image = cv2.imread(image_path)
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.1, 4)
            return len(faces) > 0
        except Exception as e:
            print(f"Error in face detection: {str(e)}")
            return False

    def verify_faces(self, image1_path, image2_path):
        """
        Verify if two face images match
        Returns: dict containing match result and confidence score
        """
        try:
            # First check if both images contain faces
            if not self.detect_face(image1_path):
                return {"success": False, "error": "No face detected in first image"}

            if not self.detect_face(image2_path):
                return {"success": False, "error": "No face detected in second image"}

            # Verify faces using DeepFace
            result = DeepFace.verify(
                img1_path=image1_path,
                img2_path=image2_path,
                model_name='VGG-Face',
                enforce_detection=True,
                detector_backend='opencv'
            )

            return {
                "success": True,
                "matched": result['verified'],
                "distance": float(result['distance']),
                "threshold": float(result['threshold']),
                "model": "VGG-Face"
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }

    def base64_to_image(self, base64_string, save_path):
        """
        Convert base64 string to image and save it
        """
        try:
            # Remove header if present
            if 'data:image' in base64_string:
                base64_string = base64_string.split(',')[1]

            image_data = base64.b64decode(base64_string)
            image = Image.open(io.BytesIO(image_data))
            image.save(save_path)
            return True
        except Exception as e:
            print(f"Error converting base64 to image: {str(e)}")
            return False