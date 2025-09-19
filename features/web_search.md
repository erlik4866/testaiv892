# Web Arama Özelliği

## Amaç
Kullanıcıların web üzerinde arama yapabilmesini sağlayarak, FiveM Lua geliştirme sürecinde ihtiyaç duyulan bilgileri hızlıca bulmalarına yardımcı olmak.

## Teknik Detaylar
- Kullanıcı arama sorgusu girdiğinde, backend üzerinden web arama API'leri (örneğin Google Custom Search API veya DuckDuckGo) kullanılarak sonuçlar alınacak.
- Sonuçlar frontend'de listelenerek, kullanıcıların ilgili linklere erişmesi sağlanacak.
- Arama sonuçları chat geçmişine entegre edilebilir.

## Gereksinimler
- Backend API: Web arama için yeni bir endpoint oluşturulacak.
- Arama API: Ücretsiz veya ücretli web arama servisi entegrasyonu.
- Frontend UI: Arama sonuçlarını gösteren bir modal veya panel.

## Adımlar
1. Backend'de web arama endpoint'i oluştur.
2. Arama API entegrasyonu yap.
3. Frontend'de arama UI'si ekle.
4. Chat entegrasyonu sağla.
5. Test ve iyileştirme.

## Öncelik
Orta
