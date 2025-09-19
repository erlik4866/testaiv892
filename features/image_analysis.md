# Görüntü Analizi Özelliği

## Amaç
Kullanıcıların yükledikleri görüntüleri analiz ederek, nesne tanıma, metin çıkarma (OCR), renk analizi vb. işlemler yapmak. FiveM Lua projelerinde görsel içerik analizi için kullanılabilir.

## Teknik Detaylar
- Kullanıcı görüntü yüklediğinde, backend'de PIL/OpenCV ile işlenecek.
- AI modelleri ile nesne tanıma veya OCR yapılabilir.
- Sonuçlar frontend'de gösterilecek.

## Gereksinimler
- Backend API: Görüntü yükleme ve analiz endpoint'i.
- Kütüphaneler: Pillow, OpenCV, Tesseract (OCR için).
- Frontend UI: Görüntü yükleme ve sonuç görüntüleme.

## Adımlar
1. Backend'de görüntü analiz endpoint'i oluştur.
2. PIL/OpenCV entegrasyonu.
3. OCR ve nesne tanıma ekle.
4. Frontend UI'si.
5. Test ve iyileştirme.

## Öncelik
Yüksek
