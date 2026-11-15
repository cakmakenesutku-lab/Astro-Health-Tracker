# AstroHealth Tracker

**NASA Space Apps Challenge projesi:** ISS'in anlık konumu, uzay havası (güneş fırtınaları, proton akısı, jeomanyetik fırtına) ve NASA OSDR biyolojik verilerini birleştirip ISS'teki astronotların sağlık risklerini tek bir web panelinde gösterir.


---

## 1. Çalıştırma (2 dakika)

### Windows
1. Bilgisayarda **Python 3** yoksa kurun: <https://www.python.org/downloads/>
   (kurulumun ilk ekranında **"Add python.exe to PATH"** kutusunu işaretleyin).
2. Zip'i bir klasöre çıkarın.
3. **`baslat.bat`** dosyasına çift tıklayın. Tarayıcı kendiliğinden `http://localhost:8000` adresini açar.
   Windows'un **Akıllı Uygulama Denetimi** `.bat` dosyasını engellerse: klasörde adres çubuğuna `cmd` yazıp Enter'a basın ve şunu çalıştırın:
   ```
   python server\sunucu.py
   ```
4. Kapatmak için siyah pencerede `Ctrl + C` tuşlarına basın ya da pencereyi kapatın.

### macOS / Linux
```bash
./baslat.sh        # veya: python3 server/sunucu.py
```

> **Ek paket (pip install) gerekmez.** Sunucu yalnızca Python'un kendi kütüphaneleriyle çalışır; harita ve grafik kütüphaneleri `web/vendor/` içinde hazırdır.

---

## 2. Sunumdan önce mutlaka yapın

1. **Kendi NASA API anahtarınızı alın** (ücretsiz, 1 dakika): <https://api.nasa.gov> → formu doldurun → e-postanıza gelen anahtarı `ayarlar.json` dosyasına yazın:
   ```json
   { "nasa_api_key": "BURAYA_ANAHTARINIZ", "port": 8000, "gorev_gunu": 120 }
   ```
   `DEMO_KEY` saatte yalnızca ~30 isteğe izin verir. Etkinlikte herkes aynı ağdan `DEMO_KEY` kullanırsa limit hemen dolar.
2. **Yedek verileri tazeleyin:** Uygulamayı internete bağlıyken **2-3 dakika açık bırakın**. Sunucu her başarılı API yanıtını `data/yedek/` klasörüne kaydeder. Sahnede internet giderse uygulama bu en son verilerle çalışmaya devam eder. Uygulama açılırken internetten yanıt beklemez: önce bu yedeklerle anında açılır, yeni veriyi arka planda çeker ve birkaç saniye içinde rozet "Canlı veri"ye döner.
3. **Sunum ağını test edin:** Etkinlik ağı bazı siteleri engelleyebilir. Sayfanın altındaki **"Veri kaynakları ve bağlantı durumu"** tablosunda her kaynağın "Canlı" göründüğünü kontrol edin. Yedek olarak telefon hotspot'u hazır tutun.
4. **Uzay havası sakinse:** üstteki **"Mayıs 2024 fırtınasını oynat"** düğmesiyle gerçek bir G5 süper fırtınasını (Kp 9) oynatın; panel kritik seviyeye geçer.
5. İnternetsiz denemek için **`cevrimdisi_baslat.bat`** dosyasını kullanın (yalnızca yedek veriler kullanılır).

---

## 3. Paneldeki sayfalar

Sol menüden 7 sayfaya geçilir. Üstteki uyarı bandı ve **"Önümüzdeki 3 saat" yörünge şeridi** (ISS'in geçeceği radyasyon bölgeleri ve gece-gündüz durumu) her sayfada görünür.

| Sayfa | İçerik |
|---|---|
| **Genel bakış** | 0–100 risk skoru, bugünkü doz, kariyer sınırı, Kp ve proton akısı; ISS'in altındaki ülke veya okyanus; sonraki SAA girişi ve gün doğumu için geri sayım; şimdi yapılacaklar; en çok etkilenen sistemler; son olaylar; oturumdaki uyarı geçmişi |
| **Yörünge** | Büyük harita (45 dk geçmiş, 50 dk gelecek iz; internet varsa NASA Blue Marble uydu görüntüsü ve ISS'in görüş alanı, SAA, yüksek enlem, gece tarafı), konum bilgisi, radyasyon bölgelerinin açıklamaları |
| **Uzay havası** | NOAA G, S, R ölçekleri ve anlamları, Kp gözlem ve 3 günlük tahmin grafiği, GOES proton grafiği, CME varış tablosu, DONKI olayları |
| **Mürettebat sağlığı** | Doz (anlık, günlük, birikimli, emilen), NASA 600 mSv sınırına oran, DNA hasar skoru, telomer, kemik kaybı, 7 organ ve sistem (tıklayınca açıklama ve OSDR kanıtı), 4 günlük organ risk takvimi, tüm öneriler |
| **Hastalık öyküsü olan mürettebat** | Uçuşa engel olmayan ama ortama göre kötüleşebilecek sağlık öyküsü olan 6 kurgusal astronot: kemik iliği kanseri (remisyonda), kan pıhtılaşması, düzensiz kalp atışı (atriyal fibrilasyon), kemik erimesi (osteopeni), böbrek taşı, erken evre katarakt. Son 10 günün gözlenen uzay havası + bugünkü ISS yörüngesi (SAA ve yüksek enlem süresi) + 7 günlük tahminle her biri için günlük kişisel risk, tarihli uyarılar, yapılacaklar ve yapılmayacaklar, Dünya'ya dönüş önerisi (görevde kal / yakın izlem / erken dönüşü planla / acil değerlendirme), dönüş için en sakin gün ve kaçınılacak günler. Her hastalık için yayın kaynakları |
| **EVA planlayıcı** | 12 saatlik risk ve bilişsel performans grafiği, en uygun pencereler, SAA geçişleri, uygunluk kuralları |
| **Araştırma (OSDR)** | Serbest OSDR araması, 8 hazır konu, çalışma listesi, Biyolojik Veri API'sinden çalışma ayrıntısı, konu ve organizma istatistikleri |
| **Yöntem ve kaynaklar** | Nasıl çalıştığı, risk formülü, kullanılan değerler ve kaynakları, veri kaynaklarının canlı bağlantı durumu, terimler sözlüğü, sınırlamalar |

**Üst çubuk:** Türkçe/İngilizce dil seçimi, UTC/yerel saat, açık/koyu tema (projeksiyonda açık tema daha iyi okunur), Mayıs 2024 fırtına senaryosu ve **Rapor indir (PDF)** düğmesi. Rapor düğmesi tek sayfalık kısa bir durum raporu hazırlar: anlık risk, doz, Kp, proton, ISS bölgesi ve en uygun EVA penceresi; altı astronotun risk, karar, önerilen dönüş tarihi ve anlık bulguları; aktif alarmlar için yardım edecek kişiler ve ilk adımlar. Yazdırma penceresinde "PDF olarak kaydet"i seçin.

**Sol menü altı:** Görev günü (kutu veya kaydırıcı) birikimli dozu ve mikroyerçekimi etkilerini değiştirir. **EVA modu** uzay yürüyüşünde daha zayıf koruma varsayar (risk × 1,5, doz × 2).

Seçilen dil, tema, saat biçimi ve görev günü tarayıcıda hatırlanır.

## 4. Kullanılan API'ler

| API | Uç nokta | Anahtar | Yenileme |
|---|---|---|---|
| ISS konumu | `https://api.wheretheiss.at/v1/satellites/25544/positions` | Yok | 4 sn |
| Kp indeksi | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json` | Yok | 5 dk |
| 3 günlük Kp tahmini | `https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json` | Yok | 30 dk |
| GOES proton akısı | `https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json` | Yok | 5 dk |
| GOES X-ışını | `https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json` | Yok | 5 dk |
| NASA DONKI (son 10 gün) | `https://api.nasa.gov/DONKI/{FLR,CME,SEP,GST}` | api.nasa.gov | 30 dk |
| GOES proton akısı (7 gün, günlük en yüksek değere indirgenir) | `https://services.swpc.noaa.gov/json/goes/primary/integral-protons-7-day.json` | Yok | 30 dk |
| NOAA 1–3 günlük olay olasılıkları (M/X patlaması, proton) | `https://services.swpc.noaa.gov/json/solar_probabilities.json` | Yok | 1 sa |
| NOAA 27 günlük görünüm (günlük en büyük Kp) | `https://services.swpc.noaa.gov/text/27-day-outlook.txt` | Yok | 6 sa |
| OSDR arama | `https://osdr.nasa.gov/osdr/data/search?term=…&type=cgene` | Yok | 24 sa |
| OSDR Biyolojik Veri API: çalışma | `https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-46/` | Yok | 24 sa |
| OSDR Biyolojik Veri API: sorgu | `https://visualization.osdr.nasa.gov/biodata/api/v2/query/datasets/?study.characteristics.organism=Homo%20sapiens&format=json.records` | Yok | 24 sa |

GeneLab ve Life Sciences (ALSDA) verileri OSDR'nin parçasıdır, yani yukarıdaki OSDR API'leri bu ikisini de kapsar.

**Kendi sunucumuzun uç noktaları** (tarayıcıda açıp JSON'u görebilirsiniz):
`/api/iss`, `/api/risk?gorev_gunu=120&eva=0`, `/api/hastalik?eva=0`, `/api/vital`, `/api/vital/simule?id=a3`, `/api/hastalik?senaryo=mayis2024`, `/api/risk?senaryo=mayis2024`, `/api/osdr/konu?id=kemik`, `/api/osdr/ara?q=microgravity`, `/api/osdr/calisma?id=OSD-46`, `/api/osdr/istatistik`, `/api/meta`, `/api/durum`

API yanıtları dilden bağımsızdır (kodlar ve sayılar); metinler arayüzde `web/i18n.js` ile Türkçe veya İngilizce yazılır.

---

## 5. Risk modeli ve dürüstlük notu

Risk skorları, doz ve DNA tahminleri **eğitsel bir modeldir**; tıbbi teşhis ya da gerçek dozimetre ölçümü değildir. Jüriye bunu açıkça söyleyin.

```
Risk = min(100, 10 × K_bölge × K_uzay_havası × (EVA ise 1,5))
K_bölge: ekvator 1 · orta enlem 1,4 · yüksek enlem 1,8 (fırtınada ×1,3) · SAA 3
K_uzay_havası = en büyüğü( S ölçeği: 2,5–4 · G ölçeği: 1,6–3,5 · R ölçeği: 1,2–2 )
```

**Kaynaklı sabitler**
- ISS'te günlük doz ~0,5 mSv (STCE: 286 günlük ISS görevi için ~150–250 mSv tahmini)
- NASA kariyer sınırı **600 mSv**, güneş parçacık olayı başına **250 mSv** (NASA-STD-3001)
- Kemik yoğunluğu kaybı ayda **%1–1,5** (NASA İnsan Araştırma Programı)
- Uçuşta telomer uzaması ve dönüşte hızlı kısalma (NASA İkizler Çalışması, Inspiration4)
- NOAA uzay havası ölçekleri: S1 = ≥10 MeV proton ≥10 pfu; G1 = Kp 5; R1 = M1 patlama

**Varsayımlar (model)**
- Bölge ve fırtına katsayıları, mSv → mGy dönüşümü (kalite faktörü ~2), hücre başına ~35 çift zincir kırığı/Gy
- SAA sınırı yaklaşıktır; gerçekte irtifaya göre değişir ve zamanla kayar
- Yörünge modeli dairesel bir yaklaşımdır (canlı konuma sabitlenir); birkaç saatlik tahmin için yeterlidir, SGP4 kadar hassas değildir
- Bilişsel performans eğrisi, ISS'in GMT çalışma düzenine göre basit bir sirkadiyen modeldir

---

## 5b. Yaşamsal bulgular ve sağlık alarmları

"Hastalık öyküsü olan mürettebat" sayfasında her astronotun nabzı, tansiyonu (kan basıncı), solunumu, kandaki oksijeni (SpO2) ve vücut ısısı 5 saniyede bir güncellenir. Bu değerler **simülasyondur** (ISS'in gerçek biyometrik verisi herkese açık değildir):

| Astronot | Yaş | Dinlenme değerleri |
|---|---|---|
| Deniz Aksoy (K) | 38 | 66/dk · 112/72 mmHg · 14/dk · %98 |
| Marcus Hale (E) | 47 | 64/dk · 122/80 mmHg · 13/dk · %98 |
| Yuki Tanaka (E) | 54 | 70/dk · 128/82 mmHg · 15/dk · %97 |
| Sofia Marín (K) | 51 | 68/dk · 124/80 mmHg · 14/dk · %98 |
| Lars Eriksen (E) | 36 | 58/dk · 118/76 mmHg · 12/dk · %99 |
| Amara Okafor (K) | 57 | 72/dk · 132/84 mmHg · 15/dk · %97 |

Değerler uyku, egzersiz, uzay havası (proton olayında sığınakta bekleme, fırtına ve CME günü iş yükü) ve hastalığa özgü ataklarla değişir. Bir astronotun kişisel risk puanı **70 ve üstüne** çıkınca hastalığına özgü atak kendiliğinden başlar ve alarm açılır; risk 70'in altına inince atak biter, alarm yaklaşık 1 dakika sonra kapanır ve kayıt dosyasına "DÜZELDİ" satırı düşer. Risk 70'in altındayken rastgele atak olmaz (`server/yasamsal.py` içinde `RISK_ESIK` ve `RASTGELE_OLAY` ile değiştirilebilir).

**Zararlı aralık** (dinlenmede): nabız > 120 ya da < 40, büyük tansiyon > 160 ya da < 90, küçük tansiyon > 100, solunum > 24 ya da < 8, SpO2 < %92, ateş ≥ 38,0 °C. Egzersizde nabız ve tansiyon sınırları yaşa göre genişler.

Bir bulgu zararlı aralığa girince:
1. Sayfanın en üstünde kırmızı **ALARM** kartı çıkar, menüde kırmızı sayaç yanar. Kart, mürettebattan kimin yardım edeceğini (sağlık görevlisi), yapılacakları, uçuş hekimi onayıyla kullanılabilecek ilaçları ve ne zaman acil olduğunu yazar. "Gördüm" düğmesiyle kapanır.
2. **Metin dosyasına** kayıt düşülür: tarih, astronotun adı, yaşı, sorunu, bulgular, ortam ve öneriler. Bulgular düzelince "DÜZELDİ" satırı eklenir. Kayıt, tarayıcı kapalıyken de (sunucu açık olduğu sürece) çalışır.

Dosyanın yeri `ayarlar.json` içindeki `saglik_kayit_dosyasi` ile belirlenir (varsayılan: `kayitlar/saglik_alarmlari.txt`). Tam yol da yazabilirsiniz; Windows'ta ters bölüyü iki kez yazın:

```json
"saglik_kayit_dosyasi": "C:\\Users\\Ad\\Desktop\\astronot_alarmlari.txt"
```

Sunumda alarm göstermek için **Mayıs 2024 fırtınasını oynat** düğmesine basın: bu fırtınada Yuki Tanaka (risk 71) ve Amara Okafor (risk 72) eşiği aştığı için alarmlar kendiliğinden açılır. Canlı veriye dönünce kaybolur.

## 6. Proje yapısı

```
AstroHealth/
├── baslat.bat              ← Windows: çift tıkla
├── cevrimdisi_baslat.bat   ← internetsiz test
├── baslat.sh               ← macOS / Linux
├── ayarlar.json            ← NASA API anahtarı, port, varsayılan görev günü
├── server/
│   ├── sunucu.py           ← web sunucusu ve /api uç noktaları
│   ├── kaynaklar.py        ← API çağrıları, önbellek, yedek dosyalar
│   ├── analiz.py           ← risk, doz, DNA, organ, takvim, EVA, önlem, OSDR işleme
│   ├── yasamsal.py         ← nabız, tansiyon, solunum, SpO2, ısı simülasyonu; alarm kaydı ve öneriler
│   ├── hastalik.py         ← hastalık öyküsü olan mürettebat: 10 günlük geçmiş, 7 günlük tahmin, kişisel risk, dönüş önerisi
│   ├── yorunge.py          ← yörünge modeli, Güneş konumu, SAA ve bölgeler
│   └── senaryo.py          ← Mayıs 2024 G5 fırtınası demo verisi
├── web/
│   ├── index.html, style.css
│   ├── app.js              ← arayüz uygulaması
│   ├── i18n.js             ← Türkçe ve İngilizce metinler (yeni dil buraya eklenir)
│   └── vendor/             ← Leaflet, Chart.js, Barlow yazı tipi, ülke haritası ve adları (çevrimdışı)
└── data/yedek/             ← API yanıtlarının son kopyaları (otomatik güncellenir)
```

---

## 7. Sorun giderme

| Sorun | Çözüm |
|---|---|
| "Python bulunamadı" | Python 3'ü kurun ve "Add python.exe to PATH" seçeneğini işaretleyin. Ardından bilgisayarı yeniden başlatın. |
| Tarayıcı açılmadı | Tarayıcıda elle `http://localhost:8000` yazın. Port doluysa sunucu 8001, 8002… dener; siyah penceredeki adrese bakın. |
| Açılışta rozet birkaç saniye "YEDEK VERİ" gösteriyor | Normal: uygulama hızlı açılmak için önce yedekle başlar, canlı veri gelince "Canlı veri"ye döner. |
| Rozet "YEDEK VERİ" gösteriyor | İnternet yok ya da ağ engelliyor. Uygulama yedek verilerle çalışmaya devam eder. Hotspot deneyin. |
| DONKI "İstek limiti aşıldı (429)" | `ayarlar.json` içine kendi NASA API anahtarınızı yazın. |
| macOS'ta SSL hatası | Uygulamalar → Python 3.x klasöründeki `Install Certificates.command` dosyasını çalıştırın. |
| Windows "Akıllı Uygulama Denetimi" `baslat.bat`'ı engelledi | Klasörde adres çubuğuna `cmd` yazıp Enter'a basın, sonra `python server\sunucu.py` yazın. Ya da VS Code'da klasörü açıp terminalde aynı komutu çalıştırın. |

---

## 8. Kaynaklar

- NASA DONKI: <https://ccmc.gsfc.nasa.gov/tools/DONKI>
- NASA OSDR Biyolojik Veri API: <https://visualization.osdr.nasa.gov/biodata/api>
- NASA OSDR: <https://www.nasa.gov/osdr/>
- NOAA SWPC veri servisleri: <https://services.swpc.noaa.gov/>
- Where the ISS at? API: <https://wheretheiss.at/w/developer>
- NASA radyasyon standardı (NASA-STD-3001): <https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf>
- NASA kemik kaybı riski: <https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/>
