export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};

export const numberToWords = (num: number): string => {
    const units = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
    if (num < 12) return units[num];
    if (num < 20) return numberToWords(num - 10) + " Belas";
    if (num < 100) return numberToWords(Math.floor(num / 10)) + " Puluh " + numberToWords(num % 10);
    if (num < 200) return "Seratus " + numberToWords(num - 100);
    if (num < 1000) return numberToWords(Math.floor(num / 100)) + " Ratus " + numberToWords(num % 100);
    if (num < 2000) return "Seribu " + numberToWords(num - 1000);
    if (num < 1000000) return numberToWords(Math.floor(num / 1000)) + " Ribu " + numberToWords(num % 1000);
    if (num < 1000000000) return numberToWords(Math.floor(num / 1000000)) + " Juta " + numberToWords(num % 1000000);
    return "Angka terlalu besar";
};
