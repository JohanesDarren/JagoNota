from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import cv2
import numpy as np
import random
import urllib.request
import urllib.parse
import urllib.error
import json
from fontTools.ttLib import TTFont
import io
import base64

app = Flask(__name__)
CORS(app)

GOOGLE_FONTS_TTF_MAP = {
    "Caveat": "https://github.com/google/fonts/raw/main/ofl/caveat/Caveat-Regular.ttf",
    "Indie Flower": "https://github.com/google/fonts/raw/main/ofl/indieflower/IndieFlower-Regular.ttf",
    "Kalam": "https://github.com/google/fonts/raw/main/ofl/kalam/Kalam-Regular.ttf",
    "Pacifico": "https://github.com/google/fonts/raw/main/ofl/pacifico/Pacifico-Regular.ttf",
    "Dancing Script": "https://github.com/google/fonts/raw/main/ofl/dancingscript/DancingScript-Regular.ttf",
    "Shadows Into Light": "https://github.com/google/fonts/raw/main/ofl/shadowsintolight/ShadowsIntoLight.ttf",
    "Permanent Marker": "https://github.com/google/fonts/raw/main/apache/permanentmarker/PermanentMarker-Regular.ttf",
    "Amatic SC": "https://github.com/google/fonts/raw/main/ofl/amaticsc/AmaticSC-Regular.ttf",
    "Satisfy": "https://github.com/google/fonts/raw/main/apache/satisfy/Satisfy-Regular.ttf",
    "Handlee": "https://github.com/google/fonts/raw/main/ofl/handlee/Handlee-Regular.ttf",
    "Rock Salt": "https://github.com/google/fonts/raw/main/apache/rocksalt/RockSalt-Regular.ttf",
    "Patrick Hand SC": "https://github.com/google/fonts/raw/main/ofl/patrickhandsc/PatrickHandSC-Regular.ttf",
    "Delius": "https://github.com/google/fonts/raw/main/ofl/delius/Delius-Regular.ttf",
    "Homemade Apple": "https://github.com/google/fonts/raw/main/apache/homemadeapple/HomemadeApple-Regular.ttf",
    "Caveat Brush": "https://github.com/google/fonts/raw/main/ofl/caveatbrush/CaveatBrush-Regular.ttf",
    "Gloria Hallelujah": "https://github.com/google/fonts/raw/main/ofl/gloriahallelujah/GloriaHallelujah.ttf"
}

def analyze_handwriting_bytes(file_bytes):
    nparr = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    default_metrics = {'jaggedness': 1.0, 'aspect_ratio': 1.0, 'slant': 0.0, 'unevenness': 0.0}
    if img is None: return default_metrics
    
    _, thresh = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours: return default_metrics
         
    total_jaggedness, total_aspect, total_slant = 0, 0, 0
    y_centers = []
    heights = []
    valid_contours = 0
    
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area < 50: continue
            
        perimeter = cv2.arcLength(cnt, True)
        jaggedness = (perimeter * perimeter) / (4 * np.pi * area) if area > 0 else 1.0
            
        x, y, w, h = cv2.boundingRect(cnt)
        aspect = w / h if h > 0 else 1.0
        
        rect = cv2.minAreaRect(cnt)
        angle = rect[2]
        if angle > 45: angle = 90 - angle
            
        total_jaggedness += jaggedness
        total_aspect += aspect
        total_slant += angle
        y_centers.append(y + h/2)
        heights.append(h)
        valid_contours += 1
        
    if valid_contours == 0: return default_metrics
    
    # Calculate unevenness (variance of y centers normalized by median height)
    median_h = np.median(heights) if heights else 1.0
    y_variance = np.var(y_centers) if len(y_centers) > 1 else 0
    unevenness = min(y_variance / (median_h * median_h + 1), 2.0) # Cap to 2.0
        
    return {
        'jaggedness': min(total_jaggedness / valid_contours, 15.0),
        'aspect_ratio': total_aspect / valid_contours,
        'slant': total_slant / valid_contours,
        'unevenness': unevenness
    }

def get_gemini_font_match(api_key, file_bytes, prompt_note=""):
    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"
        b64_img = base64.b64encode(file_bytes).decode('utf-8')
        font_list = ", ".join(GOOGLE_FONTS_TTF_MAP.keys())
        
        prompt = (f"Kamu adalah pakar tipografi digital. Analisis gambar tulisan tangan ini. "
                  f"Pesan pengguna: {prompt_note}\n\n"
                  f"Pilih SATU font terbaik dari daftar: {font_list}. "
                  "HANYA kembalikan JSON valid tanpa markdown, dengan format: "
                  '{"fontFamilyName": "<nama font>", "reason": "<alasan>"}')
                  
        payload = {
            "contents": [{"parts": [{"text": prompt}, {"inlineData": {"mimeType": "image/jpeg", "data": b64_img}}]}],
            "generationConfig": {"responseMimeType": "application/json"}
        }
        
        req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            text = res_data.get('candidates', [{}])[0].get('content', {}).get('parts', [{}])[0].get('text', '{}')
            parsed = json.loads(text)
            
            font_name = parsed.get("fontFamilyName", "Caveat")
            if font_name not in GOOGLE_FONTS_TTF_MAP: font_name = "Caveat"
            return font_name
    except Exception as e:
        print(f"[AI Engine] Gemini fallback: {e}")
        return "Caveat"

def generate_custom_ttf_bytes(cv_metrics, base_font_name):
    base_font_url = GOOGLE_FONTS_TTF_MAP.get(base_font_name, GOOGLE_FONTS_TTF_MAP["Caveat"])
    base_font_path = f"base_{base_font_name.replace(' ', '')}.ttf"
    
    if not os.path.exists(base_font_path):
        print(f"[AI Engine] Downloading base font {base_font_name}...")
        try:
            req = urllib.request.Request(base_font_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response, open(base_font_path, 'wb') as out_file:
                out_file.write(response.read())
        except Exception as e:
            print(f"[AI Engine] Failed to download {base_font_url}. Using PatrickHand fallback. Error: {e}")
            base_font_path = "base_PatrickHand.ttf"
            if not os.path.exists(base_font_path):
                fallback_url = "https://github.com/google/fonts/raw/main/ofl/patrickhand/PatrickHand-Regular.ttf"
                req = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=5) as response, open(base_font_path, 'wb') as out_file:
                    out_file.write(response.read())

    font = TTFont(base_font_path)
    glyf = font.get('glyf')
    
    if glyf:
        # 1. Map CV metrics to Advanced FontTools Transform parameters
        aspect_ratio = cv_metrics.get('aspect_ratio', 1.0)
        slant = cv_metrics.get('slant', 0.0)
        jaggedness = cv_metrics.get('jaggedness', 1.0)
        unevenness = cv_metrics.get('unevenness', 0.0)
        
        # Scaling limits (avoid illegibility)
        width_scale = max(0.8, min(aspect_ratio / 0.8, 1.3)) 
        shear_factor = (slant / 90.0) * 0.3 # Reduced shear for readability
        noise_level = min(int(jaggedness), 3) # Jitter up to 3 units max
        baseline_bounce = int(unevenness * 50) # Shift entire glyph Y by up to N units
            
        for glyph_name in glyf.keys():
            glyph = glyf[glyph_name]
            
            # Simulate jumpy baseline on a per-glyph level
            glyph_y_offset = random.randint(-baseline_bounce, baseline_bounce) if baseline_bounce > 0 else 0
            
            if getattr(glyph, 'coordinates', None) is not None:
                for i in range(len(glyph.coordinates)):
                    x, y = glyph.coordinates[i]
                    
                    # Apply horizontal scaling, shearing, and per-glyph baseline bounce
                    nx = int((x * width_scale) + (y * shear_factor))
                    ny = int(y + glyph_y_offset)
                    
                    # Apply path shakiness (jaggedness)
                    if noise_level > 0:
                        nx += random.randint(-noise_level, noise_level)
                        ny += random.randint(-noise_level, noise_level)
                        
                    glyph.coordinates[i] = (nx, ny)
                    
    out_io = io.BytesIO()
    font.save(out_io)
    return out_io.getvalue()

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "service": "JagoNota AI Font Engine (Advanced Style Perturbation)",
        "endpoints": {"POST /api/generate-font": "Upload 'image' to generate styled TTF Base64"}
    })

@app.route('/api/generate-font', methods=['POST'])
def generate_font():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    gemini_key = request.form.get('geminiKey', '')
    prompt_note = request.form.get('prompt', '')
    
    if file.filename == '':
        return jsonify({"error": "Empty file"}), 400
        
    file_bytes = file.read()
    print("[AI Engine] Analyzing handwriting image...")
    
    font_name = "Caveat"
    if gemini_key:
        print("[AI Engine] Querying Gemini Vision API...")
        font_name = get_gemini_font_match(gemini_key, file_bytes, prompt_note)
        print(f"[AI Engine] AI Selected Base Font: {font_name}")
    
    print("[AI Engine] Computing advanced CV metrics (Aspect, Slant, Jaggedness, Unevenness)...")
    cv_metrics = analyze_handwriting_bytes(file_bytes)
    print(f"[AI Engine] Metrics: {cv_metrics}")
    
    print(f"[AI Engine] Sculpting TTF dynamically based on {font_name}...")
    ttf_bytes = generate_custom_ttf_bytes(cv_metrics, font_name)
    
    b64_str = base64.b64encode(ttf_bytes).decode('utf-8')
    data_url = f"data:font/ttf;base64,{b64_str}"
    
    return jsonify({
        "status": "success",
        "message": f"Font berhasil dikustomisasi secara advanced berbasis {font_name}!",
        "font_name": font_name,
        "font_url": data_url
    }), 200

if __name__ == '__main__':
    print("JagoNota AI Font Engine (Advanced) berjalan di port 5000...")
    app.run(debug=True, port=5000)
