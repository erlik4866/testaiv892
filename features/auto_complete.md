# Kod Otomatik Tamamlama ve Öneriler Özelliği

## Amaç
Kullanıcıların yazdığı FiveM Lua kodunu analiz ederek, AI destekli otomatik tamamlama ve öneriler sunmak. Böylece kod yazma hızı ve doğruluğu artırılacak.

## Teknik Detaylar
- Kullanıcı kodu frontend'de yazarken, belirli aralıklarla veya tuş vuruşlarında backend'e istek gönderilecek.
- Backend, mevcut kodu AI modeline göndererek devam eden kod parçaları veya öneriler alacak.
- Öneriler frontend'de açılır liste şeklinde gösterilecek.
- Kullanıcı öneriyi seçtiğinde, kod editörüne otomatik olarak eklenecek.

## Gereksinimler
- Kod editörü: Ace Editor, Monaco Editor veya CodeMirror gibi gelişmiş bir editör entegre edilecek.
- Backend API: Otomatik tamamlama için yeni bir endpoint oluşturulacak.
- AI Model: Mevcut GPT-3.5-turbo modeli kullanılabilir, prompt otomatik tamamlama için optimize edilecek.

## Adımlar
1. Frontend'e gelişmiş kod editörü entegre et.
2. Backend'de otomatik tamamlama endpoint'i oluştur.
3. AI prompt yapısını otomatik tamamlama için optimize et.
4. Frontend-backend iletişimini kur.
5. Test ve iyileştirme.

## Öncelik
Yüksek
