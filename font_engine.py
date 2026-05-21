import os
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client
from werkzeug.utils import secure_filename
from fontTools.ttLib import TTFont
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
import io
import uuid
import base64

load_dotenv()
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

app = Flask(__name__)
CORS(app)

# Character set to map sequentially (A-Z, a-z, 0-9)
CHAR_SET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

def extract_character_contours(image_bytes):
    """
    Extracts individual character contours from an image and sorts them left-to-right, top-to-bottom.
    Returns a list of contour lists (each character can have multiple contours like holes).
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
    
    if img is None:
        raise ValueError("Gambar tidak valid")
        
    _, thresh = cv2.threshold(img, 128, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
    
    # Gunakan RETR_EXTERNAL untuk kesederhanaan pemisahan karakter 
    # (Untuk hasil produksi yang mendalam, Anda bisa gunakan RETR_CCOMP untuk menangani lubang huruf O/A)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    if not contours:
        raise ValueError("Tidak ada tulisan yang ditemukan")
        
    # Saring noise (ukuran terlalu kecil)
    valid_contours = []
    bounding_boxes = []
    
    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        if w > 10 and h > 10: # Filter debu/noise
            valid_contours.append(cnt)
            bounding_boxes.append((x, y, w, h))
            
    if not valid_contours:
        raise ValueError("Karakter terlalu kecil atau tidak jelas")
            
    # Urutkan karakter dari kiri ke kanan berdasarkan kotak batas (X)
    # Anda dapat meningkatkan logika ini menjadi Atas-Bawah -> Kiri-Kanan jika multi-baris
    sorted_data = sorted(zip(bounding_boxes, valid_contours), key=lambda b: b[0][0])
    
    return [cnt for _, cnt in sorted_data]

def build_ttf_font(contours_list, font_name="GeneratedFont"):
    """
    Kompilasi kontur OpenCV menjadi file TTF fisik (Byte Array).
    """
    fb = FontBuilder(1024, isTTF=True)
    
    # Batasi mapping sesuai jumlah karakter yang tersedia di CHAR_SET
    num_chars = min(len(contours_list), len(CHAR_SET))
    used_chars = list(CHAR_SET[:num_chars])
    
    fb.setupGlyphOrder([".notdef"] + used_chars)
    fb.setupCharacterMap({ord(c): c for c in used_chars})
    
    glyphs = {}
    
    # Buat glyph default kosong
    pen = TTGlyphPen(None)
    glyphs[".notdef"] = pen.glyph()
    
    # Tinggi standar font untuk inversi Y
    ASCENT = 800
    
    for i, char in enumerate(used_chars):
        pen = TTGlyphPen(None)
        cnt = contours_list[i]
        
        # Ekstrak titik-titik polygon
        pts = cnt.reshape(-1, 2)
        
        # Hitung bounding box karakter untuk menggesernya ke Origin (0,0) lokal glyph
        x, y, w, h = cv2.boundingRect(cnt)
        
        # Scaling agar fit di dalam font
        scale = 600.0 / max(h, 1) # Normalisasi tinggi menjadi 600 unit
        
        if len(pts) > 2:
            start_pt = pts[0]
            # Geser ke origin (x, y) dan invert sumbu Y, lalu scale
            px = (start_pt[0] - x) * scale
            py = ASCENT - ((start_pt[1] - y) * scale)
            pen.moveTo((px, py))
            
            for pt in pts[1:]:
                px = (pt[0] - x) * scale
                py = ASCENT - ((pt[1] - y) * scale)
                pen.lineTo((px, py))
                
            pen.closePath()
            
        glyphs[char] = pen.glyph()
        
    fb.setupGlyf(glyphs)
    
    # Setup Metrics
    metrics = {".notdef": (500, 0)}
    for i, char in enumerate(used_chars):
        # Lebar menyesuaikan bounding box
        x, y, w, h = cv2.boundingRect(contours_list[i])
        scale = 600.0 / max(h, 1)
        scaled_width = int(w * scale) + 100 # +100 untuk sedikit ruang kosong
        metrics[char] = (scaled_width, 0)
        
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(ascent=ASCENT, descent=-200)
    fb.setupNameTable({"familyName": font_name, "styleName": "Regular"})
    fb.setupOS2(sTypoAscender=ASCENT, sTypoDescender=-200)
    fb.setupPost()
    
    output_stream = io.BytesIO()
    fb.save(output_stream)
    return output_stream.getvalue()

@app.route('/api/generate-font', methods=['POST'])
def generate_font():
    print("[AI Engine] Memulai True Vector Font Generation...")
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    user_id = request.form.get('user_id')
    font_name = request.form.get('font_name', 'My Handwriting')
    
    if not supabase:
        return jsonify({"error": "Supabase Service Role Key is missing in .env"}), 500
        
    if not user_id:
        return jsonify({"error": "user_id is missing from request"}), 400
        
    try:
        image_bytes = file.read()
        
        # 1 & 2. Glyph Segmentation & Polygon Extraction (OpenCV)
        print("[AI Engine] Mengekstrak kontur karakter dari gambar...")
        contours_list = extract_character_contours(image_bytes)
        print(f"[AI Engine] Ditemukan {len(contours_list)} karakter.")
        
        # 3. Kompilasi Font (FontTools)
        print("[AI Engine] Mengompilasi kontur menjadi file TTF...")
        ttf_bytes = build_ttf_font(contours_list, font_name)
        
        # 4. Supabase Storage Integration
        bucket_name = "custom_fonts"
        safe_font_name = secure_filename(f"JagoCustom_{font_name.replace(' ', '')}.ttf")
        storage_path = f"{user_id}/{str(uuid.uuid4())[:8]}_{safe_font_name}"
        
        print(f"[AI Engine] Mengunggah file .ttf fisik ke Storage: {storage_path}...")
        try:
            supabase.storage.from_(bucket_name).upload(
                file=ttf_bytes,
                path=storage_path,
                file_options={"content-type": "font/ttf"}
            )
        except Exception as upload_err:
            if "Bucket not found" in str(upload_err):
                print(f"[AI Engine] Bucket '{bucket_name}' belum ada. Membuat bucket secara otomatis...")
                try:
                    # Attempt to create bucket
                    supabase.storage.create_bucket(bucket_name, {"public": True})
                    # Retry upload
                    supabase.storage.from_(bucket_name).upload(
                        file=ttf_bytes,
                        path=storage_path,
                        file_options={"content-type": "font/ttf"}
                    )
                except Exception as create_err:
                    raise Exception(f"Gagal membuat bucket '{bucket_name}' secara otomatis. Anda mungkin harus membuatnya secara manual di Supabase Dashboard. Detail: {str(create_err)}")
            else:
                raise upload_err
        
        public_url = supabase.storage.from_(bucket_name).get_public_url(storage_path)
        
        # 5. Insert ke Supabase Database
        print(f"[AI Engine] Menyimpan metadata ke tabel 'fonts'...")
        db_res = supabase.table("fonts").insert({
            "user_id": user_id,
            "name": f"JagoCustom {font_name}",
            "font_url": public_url
        }).execute()
        
        if not db_res.data:
            raise Exception("Gagal insert ke tabel fonts.")
            
        font_record = db_res.data[0]
        
        return jsonify({
            "status": "success",
            "message": "True Vector Font Generated & Stored Successfully",
            "font_name": font_record['name'],
            "font_url": public_url,
            "font_id": font_record['id']
        }), 200
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("JagoNota True Vector Font Engine berjalan di port 5000...")
    app.run(debug=True, port=5000)
