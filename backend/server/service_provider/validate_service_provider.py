import cv2
from deepface import DeepFace

class FaceMatcher:
    def __init__(self, threshold_multiplier=1.0):
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        self.threshold_multiplier = threshold_multiplier

    def detect_face(self, image_path):
        try:
            image = cv2.imread(image_path)
            if image is None:
                return False, "Image not found."
            
            height, width = image.shape[:2]
            min_face_size = min(height, width) // 8
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(
                gray, scaleFactor=1.1, minNeighbors=5, minSize=(min_face_size, min_face_size)
            )
            
            if len(faces) == 1:
                return True, None
            elif len(faces) == 0:
                return False, "No face detected."
            else:
                return False, "Multiple faces detected."
        except Exception as e:
            return False, f"Error in face detection: {str(e)}"

    
    def verify_faces(self, image1_path, image2_path):
        """
        Match two face images using multiple models for improved accuracy.
        Returns a dictionary containing the match result and confidence details.
        """
        try:
            # Check faces in both images
            face1_valid, error1 = self.detect_face(image1_path)
            face2_valid, error2 = self.detect_face(image2_path)

            if not face1_valid:
                return {"success": False, "error": f"First image issue: {error1}"}
            if not face2_valid:
                return {"success": False, "error": f"Second image issue: {error2}"}

            # Use multiple models for verification
            models = ['VGG-Face', 'Facenet', 'ArcFace', 'Dlib']
            results = []

            for model in models:
                result = DeepFace.verify(
                    img1_path=image1_path,
                    img2_path=image2_path,
                    model_name=model,
                    enforce_detection=False  # Assume faces are already detected
                )

                adjusted_threshold = result['threshold'] * self.threshold_multiplier
                is_verified = result['distance'] < adjusted_threshold

                results.append({
                    'model': model,
                    'verified': is_verified,
                    'distance': result['distance'],
                    'threshold': adjusted_threshold
                })

            # Analyze results
            all_verified = all(res['verified'] for res in results)
            avg_distance = sum(res['distance'] for res in results) / len(results)

            return {
                "success": True,
                "matched": all_verified,
                "results": results,
                "average_distance": avg_distance,
                "message": "Faces matched successfully" if all_verified else "Faces did not match."
            }

        except Exception as e:
            return {"success": False, "error": str(e)}