# Kullanıcı Hesapları ve Oturum Açma Özelliği

## Amaç
Kullanıcıların kendi projelerini, sohbet geçmişlerini ve ayarlarını saklayabileceği hesap sistemi oluşturmak.

## Teknik Detaylar
- Kullanıcı kayıt, giriş, çıkış işlemleri.
- Parola güvenliği (hashing, salt).
- Oturum yönetimi (JWT veya session tabanlı).
- Kullanıcıya özel veri saklama (projeler, sohbet geçmişi, ayarlar).
- Yetkilendirme ve erişim kontrolü.

## Gereksinimler
- Backend: Kimlik doğrulama ve yetkilendirme API'leri.
- Veri tabanı: Kullanıcı bilgileri ve ilişkili veriler.
- Frontend: Kayıt, giriş, profil ve ayar sayfaları.

## Adımlar
1. Kullanıcı modelini ve veri tabanını oluştur.
2. Kimlik doğrulama API'lerini geliştir.
3. Frontend'de kullanıcı yönetimi arayüzünü oluştur.
4. Test ve iyileştirme.

## Öncelik
Orta
