# Dosya Analizi Özelliği

## Amaç
Kullanıcıların yükledikleri dosyaları (kod dosyaları, loglar vb.) analiz ederek, syntax kontrolü, güvenlik açıkları taraması, boyut analizi vb. yapmak.

## Teknik Detaylar
- Dosya yüklenince, backend'de uygun kütüphanelerle analiz edilecek.
- Kod dosyaları için syntax check, loglar için pattern matching.
- Sonuçlar rapor olarak sunulacak.

## Gereksinimler
- Backend API: Dosya yükleme ve analiz endpoint'i.
- Kütüphaneler: Dosya işleme için Python standart kütüphaneleri.
- Frontend UI: Dosya yükleme ve rapor görüntüleme.

## Adımlar
1. Backend'de dosya analiz endpoint'i.
2. Analiz mantığı ekle.
3. Frontend UI'si.
4. Test.

## Öncelik
Orta
