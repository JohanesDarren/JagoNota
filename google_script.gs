/**
 * Google Apps Script untuk menerima data dari Aplikasi Generator Nota & Kwitansi
 * Pasang kode ini di Apps Script yang terhubung dengan Google Spreadsheet Anda.
 */

function doPost(e) {
  // Menggunakan LockService untuk mencegah race condition saat banyak data masuk bersamaan
  const lock = LockService.getScriptLock();
  lock.tryLock(10000); // Tunggu maksimal 10 detik

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    // Gunakan sheet bernama 'Data', jika tidak ada maka buat baru
    let sheet = doc.getSheetByName('Data');
    if (!sheet) {
      sheet = doc.insertSheet('Data');
    }

    // Ambil data JSON dari body request
    const data = JSON.parse(e.postData.contents);

    // Definisi header/kolom yang diharapkan (sesuai dengan App.tsx)
    const headers = [
      "timestamp", 
      "documentType", 
      "nomor_dokumen", 
      "tanggal",
      "nama_toko", 
      "jenis_nota", 
      "alamat_toko", 
      "nama_pelanggan", 
      "daftar_barang", 
      "total_harga", 
      "uang_muka", 
      "sisa_bayar",
      "sudah_terima_dari", 
      "terbilang", 
      "untuk_pembayaran", 
      "jumlah_angka",
      "penanda_tangan", 
      "tanda_tangan", 
      "stempel"
    ];

    // Jika sheet masih kosong, buat baris header
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers.map(h => {
        // Format header agar lebih rapi (huruf besar & ganti underscore dengan spasi)
        return h.replace(/_/g, ' ').toUpperCase();
      }));
      // Beri gaya pada header
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    }

    // Map data ke baris berdasarkan urutan header
    const row = headers.map(header => {
      let value = data[header];
      // Jika value adalah angka, pastikan tipenya number agar bisa diolah di spreadsheet
      if (typeof value === 'string' && !isNaN(value) && value !== "") {
        return Number(value);
      }
      return value || "";
    });

    // Tambahkan data ke baris terakhir
    sheet.appendRow(row);

    // Kembalikan respon sukses
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "row": sheet.getLastRow() }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Kembalikan respon error
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Fungsi pembantu untuk testing (opsional)
 */
function doGet() {
  return ContentService.createTextOutput("Script Aktif. Gunakan metode POST untuk mengirim data.")
    .setMimeType(ContentService.MimeType.TEXT);
}
