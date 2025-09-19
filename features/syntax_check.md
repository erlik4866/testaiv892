# Kod Hatalarını ve Uyarılarını Anında Gösterme Özelliği

## Amaç
Yazılan FiveM Lua kodunda sözdizimi hatalarını veya potansiyel sorunları anında tespit edip kullanıcıya bildiren bir sistem geliştirmek.

## Teknik Detaylar
- Frontend'de kod yazılırken belirli aralıklarla veya kullanıcı isteğiyle kod backend'e gönderilecek.
- Backend, Lua sözdizimi kontrolü yapacak (örneğin Lua parser veya linter kullanarak).
- Hatalar ve uyarılar JSON formatında frontend'e dönecek.
- Frontend, hataları kod editöründe işaretleyecek ve kullanıcıya açıklamalar sunacak.

## Gereksinimler
- Lua sözdizimi kontrolü için uygun kütüphane veya araç (örneğin luacheck).
- Backend API: Sözdizimi kontrolü için yeni bir endpoint.
- Frontend: Hata gösterimi için kod editörü entegrasyonu.

## Adımlar
1. Backend'e Lua sözdizimi kontrolü endpoint'i ekle.
2. Frontend'de hata gösterimi için kod editörü entegrasyonu yap.
3. Frontend-backend iletişimini kur.
4. Test ve iyileştirme.

## Öncelik
Yüksek
