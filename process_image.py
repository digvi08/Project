import cv2
import os
import sys
import numpy as np
from skimage.metrics import structural_similarity as ssim
import json  # Ensure you're using JSON module

# Input arguments
image_path = sys.argv[1]
fruit_type = sys.argv[2]

# Define dataset paths based on fruit type
dataset_dir = os.path.join('fruit dataset (2)', 'images', fruit_type + ' fruit')

# Check if dataset exists
if not os.path.exists(dataset_dir):
    result = {
        "error": f"No dataset found for fruit type: {fruit_type}"
    }
    print(json.dumps(result))  # Convert Python dict to JSON string
    sys.exit(1)

# Load the input image
input_image = cv2.imread(image_path)
if input_image is None:
    result = {
        "error": "Invalid input image."
    }
    print(json.dumps(result))  # Convert Python dict to JSON string
    sys.exit(1)

input_image_gray = cv2.cvtColor(input_image, cv2.COLOR_BGR2GRAY)

# Initialize best match variables
best_match_image = None
best_similarity = 0

# Compare input image with each image in the dataset
for filename in os.listdir(dataset_dir):
    dataset_image_path = os.path.join(dataset_dir, filename)
    dataset_image = cv2.imread(dataset_image_path)
    if dataset_image is None:
        continue

    dataset_image_gray = cv2.cvtColor(dataset_image, cv2.COLOR_BGR2GRAY)

    # Resize the dataset image to match the input image
    dataset_image_gray_resized = cv2.resize(dataset_image_gray, (input_image_gray.shape[1], input_image_gray.shape[0]))

    # Calculate structural similarity index (SSIM)
    similarity = ssim(input_image_gray, dataset_image_gray_resized)

    # Keep track of the best match
    if similarity > best_similarity:
        best_similarity = similarity
        best_match_image = dataset_image_path

# If no matches found
if best_match_image is None:
    result = {
        "error": "No matching image found in the dataset."
    }
else:
    # Return the result as JSON
    result = {
        "matchedImage": best_match_image,
        "similarity": best_similarity
    }

# Ensure valid JSON output
print(json.dumps(result))  # Convert result dict to JSON string
