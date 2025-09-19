# Veri Analizi Özelliği

## Amaç
Kullanıcıların yükledikleri veri dosyalarını (CSV, JSON vb.) analiz ederek, istatistiksel bilgiler, grafikler ve raporlar üretmek. FiveM Lua projelerinde veri odaklı kararlar almak için kullanılabilir.

## Teknik Detaylar
- Kullanıcı dosya yüklediğinde, backend'de pandas ile veri işlenecek.
- Analiz sonuçları (ortalama, medyan, korelasyon vb.) ve grafikler (matplotlib ile) üretilecek.
- Sonuçlar frontend'de gösterilecek ve chat'e entegre edilebilecek.

## Gereksinimler
- Backend API: Veri yükleme ve analiz için endpoint'ler.
- Kütüphaneler: pandas, matplotlib, numpy.
- Frontend UI: Dosya yükleme, analiz sonuçlarını gösteren panel.

## Adımlar
1. Backend'de veri analiz endpoint'leri oluştur.
2. pandas ve matplotlib entegrasyonu.
3. Frontend'de dosya yükleme ve sonuç görüntüleme UI'si.
4. Chat entegrasyonu.
5. Test ve iyileştirme.

## Öncelik
Yüksek
