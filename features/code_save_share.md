# Kod Parçalarını Kaydetme ve Paylaşma Özelliği

## Amaç
Kullanıcıların oluşturdukları FiveM Lua kod parçalarını kaydedip, daha sonra tekrar kullanabilmeleri veya başkalarıyla paylaşabilmeleri için bir kütüphane oluşturmak.

## Teknik Detaylar
- Kullanıcıların kodlarını backend üzerinde kullanıcı hesabına bağlı olarak saklama.
- Kod parçalarına isim, açıklama ve etiket ekleme imkanı.
- Kaydedilen kod parçalarının listelenmesi, düzenlenmesi ve silinmesi.
- Paylaşım için özel bağlantılar veya erişim izinleri.
- Frontend'de kullanıcı dostu arayüz ile kod kütüphanesine erişim.

## Gereksinimler
- Kullanıcı hesap sistemi (kimlik doğrulama ve yetkilendirme).
- Backend veri tabanı (örneğin SQLite, PostgreSQL).
- API endpointleri: kod kaydetme, listeleme, düzenleme, silme.
- Frontend: kod kütüphanesi arayüzü.

## Adımlar
1. Kullanıcı hesap sistemi oluştur.
2. Veri tabanı tasarımı ve entegrasyonu.
3. API endpointlerini geliştir.
4. Frontend arayüzünü oluştur.
5. Test ve iyileştirme.

## Öncelik
Orta
