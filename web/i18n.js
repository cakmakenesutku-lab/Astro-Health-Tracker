/* AstroHealth Tracker - TR / EN metinleri
   Yeni bir dil eklemek için bu nesneye aynı anahtarlarla yeni bir blok ekleyin. */
window.I18N = {
  tr: {
    app: { ad: "AstroHealth Tracker", alt: "ISS mürettebatı için uzay havası ve sağlık risk konsolu", atla: "İçeriğe geç" },
    bolgeCumle: { SAA: "Güney Atlantik Anomalisi içinde", YUKSEK_ENLEM: "yüksek enlem bölgesinde", EKVATOR: "ekvator kuşağında", ORTA_ENLEM: "orta enlem bölgesinde" },
    nav: {
      genel: "Genel bakış", yorunge: "Yörünge", hava: "Uzay havası", saglik: "Mürettebat sağlığı",
      hastalik: "Hastalık öyküsü olan mürettebat", eva: "EVA planlayıcı", arastirma: "Araştırma (OSDR)", yontem: "Yöntem ve kaynaklar", menu: "Menü"
    },
    ctl: {
      gorev: "Görev günü", gorevIpucu: "Astronotun uzayda geçirdiği gün sayısı. Birikimli dozu ve mikroyerçekimi etkilerini değiştirir.",
      eva: "EVA modu", evaIpucu: "Uzay yürüyüşü varsayılır: giysi, istasyon duvarından daha az korur (risk × 1,5, doz × 2).",
      senaryoAc: "Mayıs 2024 fırtınasını oynat", senaryoKapat: "Canlı veriye dön",
      rapor: "Rapor indir (PDF)", dil: "Dil", tema: "Tema", acik: "Açık", koyu: "Koyu", saat: "Saat", utc: "UTC", yerel: "Yerel"
    },
    durum: {
      canli: "Canlı veri", yedek: "Yedek veri", senaryo: "Senaryo", baglaniyor: "Bağlanıyor…",
      kapali: "Sunucuya ulaşılamıyor. Sunucu penceresinin açık olduğundan emin olun.",
      guncel: "{s} sn önce güncellendi", demo: "DEMO_KEY kullanılıyor: ayarlar.json dosyasına kendi NASA anahtarınızı yazın."
    },
    seviye: { DUSUK: "Düşük", ORTA: "Orta", YUKSEK: "Yüksek", KRITIK: "Kritik" },
    seviyeRisk: "{s} risk",
    bolge: { SAA: "Güney Atlantik Anomalisi", YUKSEK_ENLEM: "Yüksek enlem", EKVATOR: "Ekvator kuşağı", ORTA_ENLEM: "Orta enlem" },
    bolgeKisa: { SAA: "SAA", YUKSEK_ENLEM: "Yüksek enlem", EKVATOR: "Ekvator", ORTA_ENLEM: "Orta enlem" },
    bolgeAciklama: {
      SAA: "Dünya'nın manyetik alanının zayıf olduğu bölge. Radyasyon kuşağı ISS'in irtifasına iner; istasyonun aldığı dozun büyük kısmı buradan gelir.",
      YUKSEK_ENLEM: "45°'nin üzerindeki enlemler. Manyetik kalkan kutuplara doğru incelir, jeomanyetik fırtınada parçacık akısı artar.",
      EKVATOR: "Manyetik kalkanın en güçlü olduğu kuşak. Doz en düşük düzeydedir.",
      ORTA_ENLEM: "20° ile 45° arası. Orta düzeyde koruma."
    },
    ozet: {
      S: "S{S} proton fırtınası ({pfu} pfu)", G: "G{G} jeomanyetik fırtına (Kp {kp})",
      R: "R{R} düzeyinde güneş patlaması", CME_GELIYOR: "bir CME'nin Dünya'ya varmasına yaklaşık {saat} saat var",
      CME_ULASTI: "yakın zamanda bir CME Dünya'ya ulaştı", SAKIN: "uzay havası sakin"
    },
    genel: {
      riskBaslik: "Şu anki risk", carpan: "Konum çarpanı {b} × uzay havası çarpanı {h}{e}", evaCarpan: " × EVA 1,5",
      konumCumle: "ISS {yer} üzerinde, {bolge}.", ozetCumle: "{ozet}.",
      yapilacak: "Şimdi yapılacaklar", etkilenen: "En çok etkilenen sistemler", gecmis: "Uyarı geçmişi",
      gecmisBos: "Bu oturumda risk seviyesi değişmedi.", gecmisSatir: "{seviye} ({skor})",
      tumOneriler: "Tüm önerileri gör", tumSistemler: "Tüm sistemleri gör", tumHava: "Uzay havası ayrıntıları",
      dozBugun: "Bugünkü doz", dozBugunAlt: "Dünya'daki yaklaşık {g} günlük doğal doza eşit",
      kariyer: "Kariyer sınırı", kariyerAlt: "{d} mSv birikti, sınır 600 mSv",
      kp: "Jeomanyetik durum", proton: "Proton akısı",
      sonrakiSaa: "Sonraki SAA girişi", saaIcinde: "Şu an SAA içinde, çıkışa", sonrakiIsik: "Sonraki gün doğumu", sonrakiKaranlik: "Sonraki gün batımı",
      yok3s: "3 saat içinde yok"
    },
    serit: {
      baslik: "Önümüzdeki 3 saat", aciklama: "ISS'in geçeceği radyasyon bölgeleri ve gece-gündüz durumu. Dikey çizgi şu anı gösterir.",
      gunduz: "Gündüz", gece: "Gece", simdi: "Şimdi"
    },
    harita: { iss: "ISS", gecmis: "Son 45 dk", gelecek: "Sonraki 50 dk", gorus: "Görüş alanı", uyduKaynak: "Uydu görüntüsü: NASA Blue Marble (GIBS)", saa: "SAA (yaklaşık sınır)", kutup: "Yüksek enlem", gece: "Gece tarafı", okyanus: "{o} Okyanusu" },
    okyanus: { Pasifik: "Pasifik", Atlantik: "Atlantik", Hint: "Hint", Guney: "Güney", Arktik: "Arktik" },
    yorunge: {
      baslik: "ISS canlı konum ve radyasyon bölgeleri", bilgi: "Konum bilgisi",
      enlem: "Enlem", boylam: "Boylam", irtifa: "İrtifa", hiz: "Hız", uzerinde: "Altındaki yer", bolge: "Bölge",
      isik: "Işık", gunduz: "Gündüz (Güneş ışığında)", gece: "Gece (Dünya'nın gölgesinde)", yon: "Yön",
      kuzey: "Kuzeye ilerliyor", guney: "Güneye ilerliyor", kaynak: "Veri kaynağı",
      kaynakCanli: "Canlı (wheretheiss.at)", kaynakModel: "Yörünge modeli (son bilinen konumdan)", kaynakSim: "Simülasyon (internet yok)", iz: "Rota verisi", izCanli: "Gerçek konumlar (wheretheiss.at)", izModel: "Yörünge modeli", gorus: "Görüş yarıçapı",
      bolgelerBaslik: "Radyasyon bölgeleri", carpan: "Risk çarpanı × {k}"
    },
    hava: {
      baslik: "Uzay havası", kpBaslik: "Kp indeksi: gözlem ve 3 günlük tahmin", protonBaslik: "GOES ≥10 MeV proton akısı, son 24 saat",
      kpEksen: "Kp", protonEksen: "pfu (log ölçek)", s1Esik: "S1 eşiği (10 pfu)", gozlem: "gözlem", tahmin: "tahmin",
      jeo: "Jeomanyetik fırtına", radyasyon: "Radyasyon fırtınası", radyo: "Güneş patlaması",
      g0: "Fırtına yok", s0: "Normal düzey", r0: "Büyük patlama yok",
      gAcik: "Kp ölçeği. G1 (Kp 5) ve üzeri yüksek enlem geçişlerinde dozu artırır.",
      sAcik: "≥10 MeV proton akısı. S1 (10 pfu) ve üzeri astronot dozunu doğrudan artırır.",
      rAcik: "X-ışını sınıfı. M ve X sınıfı patlamalar parçacık olaylarının habercisi olabilir.",
      cmeBaslik: "Koronal kütle atımları (CME)", cmeVaris: "Tahmini varış", cmeKalan: "Kalan", cmeHiz: "Hız",
      cmeYok: "DONKI'de Dünya'ya yönelik yaklaşan CME tahmini yok.", cmeUlasti: "Ulaştı (tahmini)",
      olaylar: "Son olaylar (NASA DONKI)", olayYok: "Son 7 günde kayıtlı olay yok.",
      anlam: "Mürettebat için anlamı",
      anlamSakin: "Uzay havası sakin. Doz, ISS'in normal düzeyinde (~0,5 mSv/gün) seyreder; asıl fark SAA geçişlerinden gelir.",
      anlamFirtina: "Fırtına koşulları var. Proton fırtınasında mürettebat korunaklı bölümlere geçer; jeomanyetik fırtınada yüksek enlem geçişlerinde doz artar ve uzay yürüyüşleri ertelenir."
    },
    olay: {
      FLR: "{s} sınıfı güneş patlaması", FLR0: "Güneş patlaması", SEP: "Güneş enerjik parçacık olayı",
      GST: "Jeomanyetik fırtına, en yüksek Kp {kp}", GST0: "Jeomanyetik fırtına", CME: "Koronal kütle atımı, {hiz} km/sn", CME0: "Koronal kütle atımı"
    },
    saglik: {
      dozBaslik: "Radyasyon dozu", anlik: "Anlık doz hızı", gunluk: "Bugünkü tahmini doz", birikimli: "Görev boyunca birikimli doz",
      emilen: "Emilen doz (tahmini)", kariyerBar: "NASA kariyer sınırına göre (600 mSv)", spe: "Tek bir güneş olayı için NASA sınırı: {l} mSv",
      dnaBaslik: "DNA hasarı ve telomer", dnaSkor: "DNA hasar skoru", dsb: "Hücre başına tahmini çift zincir kırığı", dsbAlt: "Kırıkların çoğu hücre tarafından onarılır.",
      telomer: "Telomer", mgBaslik: "Mikroyerçekimi etkileri", kemikKayip: "Kalça kemik yoğunluğu kaybı (egzersizsiz)",
      kemikAlt: "NASA: uzun görevlerde ayda %1–1,5", organBaslik: "Organ ve sistem riskleri",
      organAlt: "Her sistemin skoru üç etkenden oluşur: anlık radyasyon, birikimli doz ve mikroyerçekimi süresi. Ayrıntı için satıra tıklayın.",
      etkenler: "Katkılar: anlık radyasyon {r}, birikimli doz {k}, mikroyerçekimi {m}", kanit: "OSDR'deki çalışmaları gör",
      takvimBaslik: "Önümüzdeki 4 gün", takvimAlt: "NOAA Kp tahmini ve DONKI CME varışlarına göre gün gün organ riskleri.",
      genelRisk: "Genel risk", sistem: "Sistem"
    },
    telomer: {
      ERKEN: "Görevin erken dönemi: telomer değişimi henüz belirgin olmayabilir.",
      UZUN: "Uzun görev: uçuşta telomerlerin uzadığı, dönüşte hızla kısaldığı gözlendi (NASA İkizler Çalışması, Inspiration4).",
      COK_UZUN: "Çok uzun görev: telomerler ve DNA onarım genleri yakından izlenmeli."
    },
    organ: {
      kan: { ad: "Kemik iliği ve kan", d: "Kan yapan hücreler radyasyona en duyarlı dokular arasındadır. Ani doz artışında ilk etkilenen sistemdir." },
      goz: { ad: "Göz (lens ve retina)", d: "Kataraktın erken başlaması, radyasyonla ilişkilendirilen etkilerden biridir. SANS denilen göz-sinir sendromu ise mikroyerçekimine bağlıdır." },
      beyin: { ad: "Beyin ve bilişsel işlev", d: "Ağır iyonlar sinir dokusunu etkileyebilir. Uyku ve ritim bozukluğu bilişsel performansı düşürür." },
      kalp: { ad: "Kalp ve damarlar", d: "Uzun vadede radyasyon kalp-damar hastalığı riskini artırabilir. Mikroyerçekiminde vücut sıvıları başa doğru kayar." },
      bagisiklik: { ad: "Bağışıklık ve telomer", d: "Uçuşta bağışıklık genlerinin ifadesi değişir; telomer uzunluğu uçuşta artıp dönüşte kısalır." },
      kemik: { ad: "İskelet (kemik yoğunluğu)", d: "Yük taşıyan kemikler uzun görevlerde ayda ortalama %1–1,5 yoğunluk kaybeder." },
      kas: { ad: "Kaslar", d: "Yük taşımayan kaslar hızla zayıflar. Günlük direnç egzersizi bu kaybı yavaşlatır." }
    },
    takvimNot: {
      G: "Kp {kp} bekleniyor (G{G}): yüksek enlem geçişlerinde EVA yapılmamalı.", CME: "CME'nin tahmini varışı {saat}.",
      S: "S{S} proton fırtınası sürüyor: korunaklı bölümde kalın.", OLAGAN: "Olağan gün."
    },
    eva: {
      baslik: "EVA planlayıcı ve bilişsel performans", alt: "Önümüzdeki 12 saat. Yeşil alanlar uzay yürüyüşü için uygun zamanları gösterir.",
      risk: "EVA radyasyon riski", bilissel: "Bilişsel performans", uygun: "EVA'ya uygun zaman", eksen: "0–100",
      zamanEksen: "Saat ({z})", pencereler: "En uygun pencereler", pencereYok: "Önümüzdeki {saat} saatte koşulları sağlayan 20 dakikalık pencere yok.",
      pencereSatir: "{sure} dk, ortalama risk {risk}, bilişsel performans {bil}", saaBaslik: "Yaklaşan SAA geçişleri",
      saaSatir: "yaklaşık {sure} dk SAA içinde", saaYok: "Önümüzdeki {saat} saatte SAA geçişi yok.",
      ozet: "Zamanın %{y}'i SAA içinde geçecek, {g} kez gün doğumu yaşanacak.",
      kurallar: "Bir zaman dilimi şu koşulların hepsini sağlıyorsa uygun sayılır:",
      k1: "ISS, Güney Atlantik Anomalisi dışında", k2: "EVA çarpanıyla hesaplanan radyasyon riski 45'in altında",
      k3: "Mürettebat uyanık (ISS GMT düzeni: yaklaşık 06:00–21:30)", k4: "Bilişsel performans 70 ve üzeri", k5: "En az 20 dakika kesintisiz",
      uyku: "uyku saati", gunduz: "gündüz", gece: "gece"
    },
    onlem: {
      baslik: "Önlem önerileri",
      KORUNAK: { b: "Korunaklı bölüme geçin", d: "Proton fırtınasında mürettebat, su ve polietilen kalkanı daha kalın olan bölümlerde kalır. Uzay yürüyüşleri ertelenir." },
      DOZ_SINIRI: { b: "Kısa süreli doz sınırını izleyin", d: "Bugünkü tahmini doz {doz} mSv. NASA'nın tek bir güneş olayı için sınırı {limit} mSv." },
      SAA_SIMDI: { b: "ISS şu an SAA içinde", d: "Bu geçiş sırasında dış görev ve robotik kol çalışması planlanmaz. Kişisel dozimetre kayıtları kontrol edilir." },
      JEOMANYETIK: { b: "Jeomanyetik fırtına (G{G})", d: "Yüksek enlem geçişlerinde parçacık akısı artar. Uzay yürüyüşlerini ekvator ve orta enlem pencerelerine kaydırın." },
      CME_GERI_SAYIM: { b: "CME yaklaşıyor: yaklaşık {saat} saat", d: "Uzay yürüyüşü takvimini tahmini varış zamanının dışına alın ve fırtına planını gözden geçirin." },
      EVA_PENCERE: { b: "En uygun EVA penceresi: {bas}–{bit}", d: "{sure} dakika boyunca SAA dışında. Ortalama risk {risk}, bilişsel performans {bilissel}." },
      EVA_YOK: { b: "{saat} saat içinde uygun EVA penceresi yok", d: "Koşullar düzelene kadar zorunlu olmayan dış görevleri erteleyin." },
      EGZERSIZ: { b: "Günde yaklaşık 2 saat egzersiz", d: "Direnç egzersizi, koşu bandı ve bisiklet. Egzersiz yapılmazsa bu görev süresinde kalçada %{min}–{max} kemik yoğunluğu kaybı beklenir." },
      SANS: { b: "Göz taraması (SANS)", d: "Uzun görevlerde periyodik göz muayenesi ve retina görüntülemesi yapılır." },
      UYKU: { b: "Uyku ve ışık düzeni", d: "ISS önümüzdeki {saat} saatte {gun_dogumu} kez gün doğumu yaşayacak. GMT programı ve kabin aydınlatması vücut ritmini korur." },
      BESLENME: { b: "Beslenme", d: "Yeterli kalsiyum, D vitamini ve enerji alımı uçuş hekimi takibinde sürdürülür." },
      ILAC: { b: "İlaç kararları uçuş hekimine aittir", d: "Radyasyona karşı koruyucu ilaçlar hâlâ araştırma aşamasındadır. Bu panel ilaç önermez." }
    },
    oncelik: { acil: "Acil", yuksek: "Önemli", rutin: "Rutin", bilgi: "Bilgi" },
    osdr: {
      baslik: "NASA OSDR araştırma gezgini", alt: "Uzay uçuşunun canlılar üzerindeki etkisine dair NASA çalışmaları. Ayrıntılar OSDR Biyolojik Veri API'sinden çekilir.",
      ara: "OSDR'de ara", araIpucu: "İngilizce terim yazın, örneğin: microgravity liver", araBtn: "Ara", konular: "Hazır konular",
      sonuc: "“{terim}” için OSDR'de {n} çalışma bulundu.", tumu: "Tümünü OSDR'de aç", detayBos: "Ayrıntılarını görmek için listeden bir çalışma seçin.",
      yukleniyor: "Yükleniyor…", detayYukleniyor: "{acc} OSDR Biyolojik Veri API'sinden çekiliyor…", hata: "Bu çalışmanın ayrıntısı şu an alınamadı.",
      organizma: "Organizma", proje: "Proje türü", teknoloji: "Teknoloji", faktor: "Deney faktörleri", gorev: "Görev",
      ac: "OSDR'de aç", json: "API yanıtını gör (JSON)", dilNot: "Çalışma başlıkları kaynak dilinde (İngilizce) gösterilir.",
      grafik: "Konu başına çalışma sayısı", grafikEksen: "Çalışma sayısı", organizmalar: "Organizmaya göre veri seti sayısı (Biyolojik Veri API)",
      organizmaYok: "Organizma istatistikleri internet bağlantısı gelince Biyolojik Veri API'sinden yüklenecek.", sonucYok: "Sonuç bulunamadı. Başka bir İngilizce terim deneyin.", cevrimdisi: "OSDR'ye ulaşılamadı. Serbest arama internet bağlantısı gerektirir; hazır konular yedek veriyle çalışır.", kisa: "En az 2 harf yazın."
    },
    osdrKonu: { radyasyon_dna: "Radyasyon ve DNA", telomer: "Telomer", kemik: "Kemik kaybı", kas: "Kas kaybı", goz: "Göz ve retina", kalp: "Kalp ve damar", beyin: "Beyin ve radyasyon", insan: "İnsan verisi (Inspiration4)" },
    veri: { canli: "canlı", onbellek: "önbellek", yedek: "yedek veri", yok: "veri yok" },
    yontem: {
      baslik: "Yöntem ve kaynaklar",
      giris: "AstroHealth Tracker, açık NASA ve NOAA verilerini birleştirip ISS mürettebatının sağlık risklerini tahmin eder. Hesaplamalar eğitsel bir modeldir: tıbbi teşhis ya da gerçek dozimetre ölçümü değildir.",
      akisBaslik: "Nasıl çalışır", akis1: "Veri toplama", akis1d: "ISS konumu, NOAA uzay havası, NASA DONKI olayları ve OSDR çalışmaları çekilir.",
      akis2: "Risk motoru", akis2d: "Konum ve uzay havası çarpanlara çevrilir; doz, DNA, organ ve EVA göstergeleri hesaplanır.",
      akis3: "Öneriler", akis3d: "Kurallar korunma, planlama ve izlem önerileri üretir; OSDR kanıtı her sisteme bağlanır.",
      formulBaslik: "Risk formülü", formulAcik: "B: konum çarpanı, H: uzay havası çarpanı (S, G ve R ölçeklerinin en büyüğü), E: EVA modunda 1,5.",
      sabitBaslik: "Kullanılan değerler", sabit: "Değer", aciklama: "Açıklama", kaynak: "Kaynak", tur: "Tür",
      kaynakli: "Kaynaklı", varsayim: "Model varsayımı",
      s1: "ISS'te tipik günlük doz", s2: "NASA kariyer doz sınırı", s3: "Tek güneş olayı için NASA sınırı", s4: "Kemik yoğunluğu kaybı",
      s5: "Dünya'da yıllık doğal doz", s6: "mSv → mGy kalite faktörü", s7: "Hücre başına çift zincir kırığı", s8: "NOAA ölçek eşikleri",
      s8d: "S1 = ≥10 MeV proton ≥10 pfu, G1 = Kp 5, R1 = M1 patlama",
      kaynaklarBaslik: "Veri kaynakları ve bağlantı durumu", durumKaynak: "Kaynak", durumDurum: "Durum", durumSon: "Son başarılı", durumNot: "Not",
      sozlukBaslik: "Terimler sözlüğü", sinirlarBaslik: "Sınırlamalar",
      sinir1: "SAA sınırı yaklaşıktır; gerçekte irtifaya göre değişir ve zamanla kayar.",
      sinir2: "Yörünge modeli daireseldir ve canlı konuma sabitlenir. Birkaç saatlik tahmin için yeterlidir, SGP4 kadar hassas değildir.",
      sinir3: "Doz değerleri ölçüm değil, uzay havasına göre ölçeklenmiş tahminlerdir.",
      sinir4: "Bilişsel performans eğrisi, ISS'in GMT düzenine göre basit bir sirkadiyen modeldir."
    },
    kaynakAd: {
      iss: "ISS konumu (wheretheiss.at)", noaa_kp: "NOAA SWPC Kp indeksi", noaa_kp_tahmin: "NOAA SWPC 3 günlük Kp tahmini",
      goes_proton: "GOES proton akısı", goes_xray: "GOES X-ışını akısı", donki_FLR: "NASA DONKI güneş patlamaları",
      donki_CME: "NASA DONKI koronal kütle atımları", donki_SEP: "NASA DONKI enerjik parçacık olayları", donki_GST: "NASA DONKI jeomanyetik fırtınalar",
      osdr_ara: "NASA OSDR arama API", osdr_calisma: "NASA OSDR Biyolojik Veri API (çalışma)", osdr_org: "NASA OSDR Biyolojik Veri API (sorgu)",
      goes_proton_7g: "GOES proton akısı (7 gün)", noaa_olasilik: "NOAA SWPC olay olasılıkları (3 gün)", noaa_27g: "NOAA SWPC 27 günlük görünüm"
    },
    hata: {
      AG_YOK: "İnternete bağlanılamadı", ZAMAN_ASIMI: "Kaynak zamanında yanıt vermedi", LIMIT_429: "İstek limiti aşıldı: ayarlar.json dosyasına kendi NASA anahtarınızı yazın",
      HTTP_403: "Erişim reddedildi: API anahtarını kontrol edin", BICIM: "Beklenmeyen yanıt biçimi", CEVRIMDISI: "Çevrimdışı mod açık",
      SSL: "SSL sertifika hatası (macOS: Install Certificates.command)", BILINMEYEN: "Bilinmeyen hata"
    },
    sozluk: [
      ["SAA", "Güney Atlantik Anomalisi. Dünya'nın manyetik alanının zayıf olduğu, ISS'in radyasyon dozunun büyük kısmını aldığı bölge."],
      ["Kp indeksi", "0–9 arası jeomanyetik aktivite ölçüsü. 5 ve üzeri jeomanyetik fırtına (G1–G5) demektir."],
      ["G, S, R ölçekleri", "NOAA'nın uzay havası ölçekleri: G jeomanyetik fırtına, S radyasyon (proton) fırtınası, R radyo kesintisi (güneş patlaması)."],
      ["CME", "Koronal kütle atımı. Güneş'ten fırlayan plazma bulutu; 1–3 günde Dünya'ya ulaşıp jeomanyetik fırtınaya yol açabilir."],
      ["SEP", "Güneş enerjik parçacık olayı. Yüksek enerjili protonlar kısa sürede astronot dozunu artırabilir."],
      ["pfu", "Parçacık akısı birimi (parçacık / cm²·s·sr). S1 eşiği ≥10 MeV protonlarda 10 pfu'dur."],
      ["mSv / mGy", "mGy emilen enerjiyi, mSv biyolojik etkiyi ölçer. Dünya'da yılda ~2–3 mSv doğal doz alınır."],
      ["EVA", "Uzay yürüyüşü (istasyon dışı görev). Giysi, istasyon duvarından daha az koruma sağlar."],
      ["SANS", "Uzay uçuşuna bağlı göz-sinir sendromu. Sıvıların başa kaymasıyla gözde ve görme sinirinde değişiklikler."],
      ["DSB", "DNA çift zincir kırığı. Radyasyonun en önemli DNA hasarı türü; hücreler kırıkların çoğunu onarır."],
      ["Telomer", "Kromozom uçlarını koruyan diziler. Uzunlukları yaşlanma ve stres göstergesi olarak izlenir."],
      ["OSDR", "NASA Açık Bilim Veri Deposu. GeneLab ve Life Sciences (ALSDA) verilerini içerir."],
      ["DONKI", "NASA'nın uzay havası olay veritabanı (CME, patlama, fırtına kayıtları ve tahminleri)."]
    ],
    rapor: { baslik: "AstroHealth Tracker durum raporu", olusturuldu: "Oluşturulma: {z}", not: "Eğitsel modeldir; tıbbi teşhis değildir." },
    genelHata: "Veri alınamadı ({e}). Sunucu penceresinin açık olduğundan emin olun.",
    birim: { sn: "sn", dk: "dk", sa: "sa" }
  },

  en: {
    app: { ad: "AstroHealth Tracker", alt: "Space weather and health risk console for the ISS crew", atla: "Skip to content" },
    bolgeCumle: { SAA: "inside the South Atlantic Anomaly", YUKSEK_ENLEM: "in the high-latitude zone", EKVATOR: "in the equatorial belt", ORTA_ENLEM: "in the mid-latitude zone" },
    nav: {
      genel: "Overview", yorunge: "Orbit", hava: "Space weather", saglik: "Crew health",
      hastalik: "Crew with medical history", eva: "EVA planner", arastirma: "Research (OSDR)", yontem: "Method and sources", menu: "Menu"
    },
    ctl: {
      gorev: "Mission day", gorevIpucu: "Days the astronaut has spent in space. Changes cumulative dose and microgravity effects.",
      eva: "EVA mode", evaIpucu: "Assumes a spacewalk: the suit shields less than the station hull (risk × 1.5, dose × 2).",
      senaryoAc: "Replay the May 2024 storm", senaryoKapat: "Back to live data",
      rapor: "Download report (PDF)", dil: "Language", tema: "Theme", acik: "Light", koyu: "Dark", saat: "Time", utc: "UTC", yerel: "Local"
    },
    durum: {
      canli: "Live data", yedek: "Backup data", senaryo: "Scenario", baglaniyor: "Connecting…",
      kapali: "Can't reach the server. Make sure the server window is still open.",
      guncel: "Updated {s} s ago", demo: "Using DEMO_KEY: put your own NASA key in ayarlar.json."
    },
    seviye: { DUSUK: "Low", ORTA: "Moderate", YUKSEK: "High", KRITIK: "Critical" },
    seviyeRisk: "{s} risk",
    bolge: { SAA: "South Atlantic Anomaly", YUKSEK_ENLEM: "High latitude", EKVATOR: "Equatorial belt", ORTA_ENLEM: "Mid latitude" },
    bolgeKisa: { SAA: "SAA", YUKSEK_ENLEM: "High lat.", EKVATOR: "Equator", ORTA_ENLEM: "Mid lat." },
    bolgeAciklama: {
      SAA: "Where Earth's magnetic field is weak. The radiation belt dips to ISS altitude; most of the station's dose comes from here.",
      YUKSEK_ENLEM: "Latitudes above 45°. The magnetic shield thins toward the poles and particle flux rises during geomagnetic storms.",
      EKVATOR: "Where the magnetic shield is strongest. Dose is at its lowest.",
      ORTA_ENLEM: "Between 20° and 45°. Moderate shielding."
    },
    ozet: {
      S: "S{S} proton storm ({pfu} pfu)", G: "G{G} geomagnetic storm (Kp {kp})",
      R: "R{R}-level solar flare", CME_GELIYOR: "a CME is about {saat} hours from reaching Earth",
      CME_ULASTI: "a CME reached Earth recently", SAKIN: "space weather is quiet"
    },
    genel: {
      riskBaslik: "Risk right now", carpan: "Location factor {b} × space weather factor {h}{e}", evaCarpan: " × EVA 1.5",
      konumCumle: "The ISS is over {yer}, {bolge}.", ozetCumle: "{ozet}.",
      yapilacak: "Do now", etkilenen: "Most affected systems", gecmis: "Alert history",
      gecmisBos: "The risk level hasn't changed this session.", gecmisSatir: "{seviye} ({skor})",
      tumOneriler: "See all recommendations", tumSistemler: "See all systems", tumHava: "Space weather details",
      dozBugun: "Dose today", dozBugunAlt: "Equal to about {g} days of natural dose on Earth",
      kariyer: "Career limit", kariyerAlt: "{d} mSv accumulated, limit 600 mSv",
      kp: "Geomagnetic state", proton: "Proton flux",
      sonrakiSaa: "Next SAA entry", saaIcinde: "Inside the SAA now, exit in", sonrakiIsik: "Next sunrise", sonrakiKaranlik: "Next sunset",
      yok3s: "None within 3 h"
    },
    serit: {
      baslik: "Next 3 hours", aciklama: "Radiation zones the ISS will cross, with day and night. The vertical line marks now.",
      gunduz: "Day", gece: "Night", simdi: "Now"
    },
    harita: { iss: "ISS", gecmis: "Last 45 min", gelecek: "Next 50 min", gorus: "Visibility footprint", uyduKaynak: "Imagery: NASA Blue Marble (GIBS)", saa: "SAA (approximate)", kutup: "High latitude", gece: "Night side", okyanus: "the {o} Ocean" },
    okyanus: { Pasifik: "Pacific", Atlantik: "Atlantic", Hint: "Indian", Guney: "Southern", Arktik: "Arctic" },
    yorunge: {
      baslik: "ISS live position and radiation zones", bilgi: "Position",
      enlem: "Latitude", boylam: "Longitude", irtifa: "Altitude", hiz: "Speed", uzerinde: "Over", bolge: "Zone",
      isik: "Light", gunduz: "Day (in sunlight)", gece: "Night (in Earth's shadow)", yon: "Heading",
      kuzey: "Moving north", guney: "Moving south", kaynak: "Data source",
      kaynakCanli: "Live (wheretheiss.at)", kaynakModel: "Orbit model (from last known position)", kaynakSim: "Simulation (no internet)", iz: "Track data", izCanli: "Real positions (wheretheiss.at)", izModel: "Orbit model", gorus: "Footprint radius",
      bolgelerBaslik: "Radiation zones", carpan: "Risk factor × {k}"
    },
    hava: {
      baslik: "Space weather", kpBaslik: "Kp index: observed and 3-day forecast", protonBaslik: "GOES ≥10 MeV proton flux, last 24 hours",
      kpEksen: "Kp", protonEksen: "pfu (log scale)", s1Esik: "S1 threshold (10 pfu)", gozlem: "observed", tahmin: "forecast",
      jeo: "Geomagnetic storm", radyasyon: "Radiation storm", radyo: "Solar flare",
      g0: "No storm", s0: "Normal level", r0: "No major flare",
      gAcik: "Kp scale. G1 (Kp 5) and above raises dose on high-latitude passes.",
      sAcik: "≥10 MeV proton flux. S1 (10 pfu) and above directly raises crew dose.",
      rAcik: "X-ray class. M- and X-class flares can precede particle events.",
      cmeBaslik: "Coronal mass ejections (CME)", cmeVaris: "Estimated arrival", cmeKalan: "Remaining", cmeHiz: "Speed",
      cmeYok: "DONKI has no Earth-directed CME forecast right now.", cmeUlasti: "Arrived (estimated)",
      olaylar: "Recent events (NASA DONKI)", olayYok: "No events recorded in the last 7 days.",
      anlam: "What it means for the crew",
      anlamSakin: "Space weather is quiet. Dose stays at the normal ISS level (~0.5 mSv/day); the main difference comes from SAA passes.",
      anlamFirtina: "Storm conditions. In a proton storm the crew moves to shielded modules; in a geomagnetic storm, dose rises on high-latitude passes and spacewalks are postponed."
    },
    olay: {
      FLR: "{s}-class solar flare", FLR0: "Solar flare", SEP: "Solar energetic particle event",
      GST: "Geomagnetic storm, peak Kp {kp}", GST0: "Geomagnetic storm", CME: "Coronal mass ejection, {hiz} km/s", CME0: "Coronal mass ejection"
    },
    saglik: {
      dozBaslik: "Radiation dose", anlik: "Dose rate now", gunluk: "Estimated dose today", birikimli: "Cumulative mission dose",
      emilen: "Absorbed dose (estimate)", kariyerBar: "Against NASA's career limit (600 mSv)", spe: "NASA limit for a single solar event: {l} mSv",
      dnaBaslik: "DNA damage and telomeres", dnaSkor: "DNA damage score", dsb: "Estimated double-strand breaks per cell", dsbAlt: "Cells repair most of these breaks.",
      telomer: "Telomeres", mgBaslik: "Microgravity effects", kemikKayip: "Hip bone density loss (without exercise)",
      kemikAlt: "NASA: 1–1.5% per month on long missions", organBaslik: "Organ and system risks",
      organAlt: "Each system's score combines three factors: current radiation, cumulative dose and time in microgravity. Select a row for details.",
      etkenler: "Contributions: current radiation {r}, cumulative dose {k}, microgravity {m}", kanit: "See OSDR studies",
      takvimBaslik: "Next 4 days", takvimAlt: "Organ risks day by day, from the NOAA Kp forecast and DONKI CME arrivals.",
      genelRisk: "Overall risk", sistem: "System"
    },
    telomer: {
      ERKEN: "Early in the mission: telomere changes may not be visible yet.",
      UZUN: "Long mission: telomeres lengthened in flight and shortened quickly after return (NASA Twins Study, Inspiration4).",
      COK_UZUN: "Very long mission: telomeres and DNA-repair genes should be monitored closely."
    },
    organ: {
      kan: { ad: "Bone marrow and blood", d: "Blood-forming cells are among the most radiation-sensitive tissues. They are the first system hit by a sudden dose increase." },
      goz: { ad: "Eyes (lens and retina)", d: "Earlier cataract onset is one of the effects linked to radiation. SANS, an eye and optic-nerve syndrome, is driven by microgravity." },
      beyin: { ad: "Brain and cognition", d: "Heavy ions can affect nerve tissue. Disrupted sleep and rhythm lower cognitive performance." },
      kalp: { ad: "Heart and blood vessels", d: "Over the long term, radiation may raise cardiovascular risk. In microgravity, body fluids shift toward the head." },
      bagisiklik: { ad: "Immunity and telomeres", d: "Immune gene expression changes in flight; telomere length increases in flight and shortens after return." },
      kemik: { ad: "Skeleton (bone density)", d: "Weight-bearing bones lose 1–1.5% of their density per month on long missions." },
      kas: { ad: "Muscles", d: "Unloaded muscles weaken quickly. Daily resistance exercise slows the loss." }
    },
    takvimNot: {
      G: "Kp {kp} expected (G{G}): no EVA on high-latitude passes.", CME: "Estimated CME arrival {saat}.",
      S: "S{S} proton storm in progress: stay in the shielded module.", OLAGAN: "Normal day."
    },
    eva: {
      baslik: "EVA planner and cognitive performance", alt: "Next 12 hours. Green areas show times suitable for a spacewalk.",
      risk: "EVA radiation risk", bilissel: "Cognitive performance", uygun: "Suitable for EVA", eksen: "0–100",
      zamanEksen: "Time ({z})", pencereler: "Best windows", pencereYok: "No 20-minute window meets the conditions in the next {saat} hours.",
      pencereSatir: "{sure} min, average risk {risk}, cognitive performance {bil}", saaBaslik: "Upcoming SAA passes",
      saaSatir: "about {sure} min inside the SAA", saaYok: "No SAA pass in the next {saat} hours.",
      ozet: "{y}% of the time will be inside the SAA, with {g} sunrises.",
      kurallar: "A time slot counts as suitable when all of these hold:",
      k1: "The ISS is outside the South Atlantic Anomaly", k2: "Radiation risk with the EVA factor is below 45",
      k3: "The crew is awake (ISS GMT schedule: about 06:00–21:30)", k4: "Cognitive performance is 70 or higher", k5: "At least 20 uninterrupted minutes",
      uyku: "sleep period", gunduz: "day", gece: "night"
    },
    onlem: {
      baslik: "Recommendations",
      KORUNAK: { b: "Move to the shielded module", d: "During a proton storm the crew stays in modules with thicker water and polyethylene shielding. Spacewalks are postponed." },
      DOZ_SINIRI: { b: "Watch the short-term dose limit", d: "Estimated dose today is {doz} mSv. NASA's limit for a single solar event is {limit} mSv." },
      SAA_SIMDI: { b: "The ISS is inside the SAA now", d: "No external tasks or robotic-arm work during this pass. Personal dosimeter readings are checked." },
      JEOMANYETIK: { b: "Geomagnetic storm (G{G})", d: "Particle flux rises on high-latitude passes. Move spacewalks to equatorial and mid-latitude windows." },
      CME_GERI_SAYIM: { b: "CME incoming: about {saat} hours", d: "Keep the spacewalk schedule clear of the estimated arrival and review the storm plan." },
      EVA_PENCERE: { b: "Best EVA window: {bas}–{bit}", d: "{sure} minutes outside the SAA. Average risk {risk}, cognitive performance {bilissel}." },
      EVA_YOK: { b: "No suitable EVA window within {saat} hours", d: "Postpone non-essential external tasks until conditions improve." },
      EGZERSIZ: { b: "About 2 hours of exercise a day", d: "Resistance training, treadmill and cycling. Without exercise, expect {min}–{max}% hip bone density loss over this mission." },
      SANS: { b: "Eye screening (SANS)", d: "Long missions include periodic eye exams and retinal imaging." },
      UYKU: { b: "Sleep and light schedule", d: "The ISS will see {gun_dogumu} sunrises in the next {saat} hours. The GMT schedule and cabin lighting keep body rhythm stable." },
      BESLENME: { b: "Nutrition", d: "Adequate calcium, vitamin D and energy intake, monitored by the flight surgeon." },
      ILAC: { b: "Medication is the flight surgeon's call", d: "Radiation-protective drugs are still under research. This console does not recommend medication." }
    },
    oncelik: { acil: "Urgent", yuksek: "Important", rutin: "Routine", bilgi: "Info" },
    osdr: {
      baslik: "NASA OSDR research explorer", alt: "NASA studies on how spaceflight affects living things. Details come from the OSDR Biological Data API.",
      ara: "Search OSDR", araIpucu: "Type an English term, e.g. microgravity liver", araBtn: "Search", konular: "Topics",
      sonuc: "OSDR has {n} studies for “{terim}”.", tumu: "Open all in OSDR", detayBos: "Select a study from the list to see its details.",
      yukleniyor: "Loading…", detayYukleniyor: "Fetching {acc} from the OSDR Biological Data API…", hata: "Details for this study aren't available right now.",
      organizma: "Organism", proje: "Project type", teknoloji: "Technology", faktor: "Experimental factors", gorev: "Mission",
      ac: "Open in OSDR", json: "View API response (JSON)", dilNot: "Study titles are shown in their original language (English).",
      grafik: "Studies per topic", grafikEksen: "Number of studies", organizmalar: "Datasets per organism (Biological Data API)",
      organizmaYok: "Organism statistics will load from the Biological Data API once the internet is available.", sonucYok: "No results. Try another English term.", cevrimdisi: "Couldn't reach OSDR. Free search needs an internet connection; the topics above work from backup data.", kisa: "Type at least 2 letters."
    },
    osdrKonu: { radyasyon_dna: "Radiation and DNA", telomer: "Telomeres", kemik: "Bone loss", kas: "Muscle loss", goz: "Eyes and retina", kalp: "Heart and vessels", beyin: "Brain and radiation", insan: "Human data (Inspiration4)" },
    veri: { canli: "live", onbellek: "cache", yedek: "backup data", yok: "no data" },
    yontem: {
      baslik: "Method and sources",
      giris: "AstroHealth Tracker combines open NASA and NOAA data to estimate health risks for the ISS crew. The calculations are an educational model: not a medical diagnosis or a real dosimeter reading.",
      akisBaslik: "How it works", akis1: "Data collection", akis1d: "ISS position, NOAA space weather, NASA DONKI events and OSDR studies are fetched.",
      akis2: "Risk engine", akis2d: "Location and space weather become factors; dose, DNA, organ and EVA indicators are calculated.",
      akis3: "Recommendations", akis3d: "Rules produce protection, planning and monitoring advice; OSDR evidence is linked to each system.",
      formulBaslik: "Risk formula", formulAcik: "B: location factor, H: space weather factor (the largest of the S, G and R scales), E: 1.5 in EVA mode.",
      sabitBaslik: "Values used", sabit: "Value", aciklama: "Description", kaynak: "Source", tur: "Type",
      kaynakli: "Sourced", varsayim: "Model assumption",
      s1: "Typical daily dose on the ISS", s2: "NASA career dose limit", s3: "NASA limit for a single solar event", s4: "Bone density loss",
      s5: "Annual natural dose on Earth", s6: "mSv → mGy quality factor", s7: "Double-strand breaks per cell", s8: "NOAA scale thresholds",
      s8d: "S1 = ≥10 MeV protons ≥10 pfu, G1 = Kp 5, R1 = M1 flare",
      kaynaklarBaslik: "Data sources and connection status", durumKaynak: "Source", durumDurum: "Status", durumSon: "Last success", durumNot: "Note",
      sozlukBaslik: "Glossary", sinirlarBaslik: "Limitations",
      sinir1: "The SAA boundary is approximate; in reality it depends on altitude and drifts over time.",
      sinir2: "The orbit model is circular and anchored to the live position. It is good for a few hours ahead, not as precise as SGP4.",
      sinir3: "Dose values are estimates scaled by space weather, not measurements.",
      sinir4: "The cognitive performance curve is a simple circadian model based on the ISS GMT schedule."
    },
    kaynakAd: {
      iss: "ISS position (wheretheiss.at)", noaa_kp: "NOAA SWPC Kp index", noaa_kp_tahmin: "NOAA SWPC 3-day Kp forecast",
      goes_proton: "GOES proton flux", goes_xray: "GOES X-ray flux", donki_FLR: "NASA DONKI solar flares",
      donki_CME: "NASA DONKI coronal mass ejections", donki_SEP: "NASA DONKI energetic particle events", donki_GST: "NASA DONKI geomagnetic storms",
      osdr_ara: "NASA OSDR search API", osdr_calisma: "NASA OSDR Biological Data API (study)", osdr_org: "NASA OSDR Biological Data API (query)",
      goes_proton_7g: "GOES proton flux (7 days)", noaa_olasilik: "NOAA SWPC event probabilities (3 days)", noaa_27g: "NOAA SWPC 27-day outlook"
    },
    hata: {
      AG_YOK: "Couldn't connect to the internet", ZAMAN_ASIMI: "The source didn't respond in time", LIMIT_429: "Rate limit reached: put your own NASA key in ayarlar.json",
      HTTP_403: "Access denied: check the API key", BICIM: "Unexpected response format", CEVRIMDISI: "Offline mode is on",
      SSL: "SSL certificate error (macOS: run Install Certificates.command)", BILINMEYEN: "Unknown error"
    },
    sozluk: [
      ["SAA", "South Atlantic Anomaly. A region where Earth's magnetic field is weak and the ISS receives most of its radiation dose."],
      ["Kp index", "A 0–9 measure of geomagnetic activity. 5 and above means a geomagnetic storm (G1–G5)."],
      ["G, S, R scales", "NOAA space weather scales: G for geomagnetic storms, S for radiation (proton) storms, R for radio blackouts (solar flares)."],
      ["CME", "Coronal mass ejection. A plasma cloud from the Sun that can reach Earth in 1–3 days and trigger a geomagnetic storm."],
      ["SEP", "Solar energetic particle event. High-energy protons can raise crew dose within hours."],
      ["pfu", "Particle flux unit (particles / cm²·s·sr). The S1 threshold is 10 pfu for ≥10 MeV protons."],
      ["mSv / mGy", "mGy measures absorbed energy, mSv the biological effect. People on Earth receive ~2–3 mSv of natural dose a year."],
      ["EVA", "Extravehicular activity (spacewalk). The suit shields less than the station hull."],
      ["SANS", "Spaceflight-associated neuro-ocular syndrome. Changes in the eye and optic nerve caused by fluid shifting toward the head."],
      ["DSB", "DNA double-strand break. The most important type of radiation DNA damage; cells repair most of them."],
      ["Telomere", "Protective sequences at chromosome ends. Their length is tracked as a marker of ageing and stress."],
      ["OSDR", "NASA Open Science Data Repository. Includes GeneLab and Life Sciences (ALSDA) data."],
      ["DONKI", "NASA's space weather event database (records and forecasts of CMEs, flares and storms)."]
    ],
    rapor: { baslik: "AstroHealth Tracker status report", olusturuldu: "Generated: {z}", not: "Educational model; not a medical diagnosis." },
    genelHata: "Couldn't load data ({e}). Make sure the server window is still open.",
    birim: { sn: "s", dk: "min", sa: "h" }
  }
};

/* ---------------------------------------------------------------- Hastalık öyküsü olan mürettebat sekmesi */
window.I18N.tr.hst = {
  rapor: { baslik: "Mürettebat sağlık raporu: {n} astronot", alt: "Rapor anı: {z}. Yaşamsal bulgular simülasyondur; kararları uçuş hekimi verir.",
    gorev: "Görev günü", risk: "Bugünkü kişisel risk", riskDeger: "{s}/100 ({l}) · önümüzdeki 7 günde en yüksek {m}",
    karar: "Dönüş kararı", bulgu: "Yaşamsal bulgular", durum: "Değerlendirme",
    durumNormal: "Tüm bulgular güvenli aralıkta.", durumDikkat: "Bazı bulgular dikkat aralığında, zararlı değil." },
  onerilenDonus: "Önerilen dönüş tarihi", gorevSonu: "Planlanan görev sonu", donusYok: "7 günlük tahminde uygun gün yok: proton olayı biter bitmez",
  bugunKisa: "bugün", yarin: "yarın",
  kararVital: "Yaşamsal bulgular zararlı aralıkta. Mürettebat alarm kartındaki öneriyi hemen uygulasın; uçuş hekimi acil dönüşü değerlendirsin.",
  donusTur: { acil: "Acil: proton olayı olmayan ilk gün, ilk uygun araçla en kısa sürede.", erken: "Erken dönüş: proton olayı (ya da yüksek olasılığı), güçlü fırtına ve CME olmayan en yakın gün.", plan: "Görev planlandığı gibi sürer." },
  cevreBaslik: "Uzay havası: son 10 gün, bugün ve 7 günlük tahmin",
  cevreAlt: "Her sütun o günün ortam yükü (proton olayı, jeomanyetik fırtına, patlama, CME). Kesikli sütunlar tahmindir.",
  cevreEksen: "Ortam yükü (0–100)",
  gozlem: "Gözlenen", bugun: "Bugün", tahmin: "Tahmin",
  egilim: { ARTIYOR: "kötüleşiyor", AZALIYOR: "iyileşiyor", SABIT: "belirgin değişmiyor" },
  egilimCumle: "Son 10 günde uzay havası {e}: {m} M ve {x} X sınıfı patlama, {sep} günde proton olayı, {g} günde jeomanyetik fırtına, {cme} CME.",
  issCumle: "ISS önümüzdeki 24 saatte yaklaşık {saa} dk Güney Atlantik Anomalisi'nde (SAA), {yuk} dk yüksek enlemde olacak. Sıradaki SAA girişi: {sonraki}.",
  olasilikKaynagi: { noaa: "1–3. gün proton olasılığı NOAA SWPC tahmininden alındı.", patlama_sikligi: "NOAA olasılık verisi alınamadı; proton olasılığı son 10 günün patlama sıklığından tahmin edildi (model)." },
  kaynak: { gozlem: "Gözlem", canli: "Anlık veri", noaa_3g: "NOAA 3 günlük Kp tahmini", noaa_27g: "NOAA 27 günlük görünüm", egilim: "10 günlük eğilim (düşük güven)" },
  guven: { yuksek: "yüksek güven", orta: "orta güven", dusuk: "düşük güven" },
  ipucuKp: "Kp {kp} · G{G} · S{S}", ipucuKpYok: "Kp verisi yok · G{G} · S{S}", ipucuP: "Proton olayı olasılığı: {p}", ipucuCme: "CME varışı bekleniyor",
  ipucuPatlama: "Patlama: {m} M, {x} X", ipucuSep: "DONKI proton olayı (SEP)",
  murettebat: "Mürettebat", murettebatAlt: "Kurgusal altı astronot. Her birinin uçuşa engel olmayan ama ortama göre kötüleşebilecek bir sağlık öyküsü var. Ayrıntı için birini seçin.",
  gorevGun: "Görev günü {g}/{t}", yas: "{y} yaş",
  kisiselBaslik: "Kişisel risk: son 10 gün, bugün, 7 gün", kisiselEksen: "Kişisel risk (0–100)",
  parca: "Bugünkü puanın bileşenleri: ortam {c} + kronik (hastalık ve görev süresi) {k} + EVA {e} (+ taban 8).",
  uyarilar: "Uyarılar (bugün ve önümüzdeki günler)", uyariYok: "Bu dönem için ek uyarı yok.",
  donusBaslik: "Dünya'ya dönüş", enUygun: "Tahmin penceresindeki en sakin gün", enUygunYok: "7 günlük tahminde proton olayı veya fırtına riski olmayan gün yok.",
  kacin: "Dönüş için kaçınılacak günler", kacinYok: "Yok", planlanan: "Planlanan dönüş", kalan: "{n} gün sonra",
  yap: "Yapmalı", yapma: "Yapmamalı",
  neden: "Uzayda neden önemli?", kaynaklar: "Kaynaklar", osdr: "OSDR'de ilgili çalışmalar",
  doz: "Birikimli doz", kariyer: "Kariyer sınırının", tskor: "T-skoru (bugün)", tskorSon: "T-skoru (görev sonu)", gorev: "Görev günü",
  tarihler: "Tarihler: {t}", yukleniyor: "Hesaplanıyor…", hata: "Veri alınamadı. Sunucu penceresinin açık olduğundan emin olun.",
  guncel: "Hesaplandı: {z}",
  evaNot: "EVA modu açık: önümüzdeki günlerde uzay yürüyüşü planlandığı varsayılıyor.",
  karar: {
    KAL: { b: "Görevde kalabilir", d: "Ortam bu hastalık için belirgin ek risk oluşturmuyor. Rutin izleme sürer." },
    IZLE: { b: "Görevde kal, yakın izlem", d: "Risk artabilir. Uyarıları uygula, belirtileri her gün bildir, uçuş hekimi düzenli değerlendirsin." },
    PLANLA: { b: "Görevden erken dönüşü değerlendir", d: "Risk yüksek. Uçuş hekimi ve uçuş kontrolü görevden erken dönüş seçeneğini değerlendirsin." },
    ACIL: { b: "Acil değerlendirme", d: "Bugün çok yüksek risk. Önce korunaklı alana geç; olay geçince uçuş hekimi acil dönüşü değerlendirsin. Proton olayı sürerken kapsüle geçip ayrılmak dozu artırabilir." }
  },
  kararKisa: { KAL: "Görevde kal", IZLE: "Yakın izlem", PLANLA: "Erken dönüş", ACIL: "Acil değerlendirme" },
  neden_: {
    BUGUN_KRITIK: "Bugünkü kişisel risk {skor}/100 (kritik).",
    BUGUN_KRITIK_KRONIK: "Bugünkü birikimli risk {skor}/100 (kritik); uçuş hekimi ve uçuş kontrolü erken dönüşü değerlendirsin.",
    COK_GUN_YUKSEK: "Önümüzdeki 7 günün {n} gününde risk 70'in üzerinde.",
    RISK_YUKSEK: "Risk {skor}/100 düzeyine çıktı; görevden erken dönüşü uçuş hekimi ve uçuş kontrolü değerlendirsin.",
    RISK_ORTA: "Bugün ve tahmin döneminde en yüksek risk {skor}/100.",
    EGILIM_ARTIYOR: "Son 10 günde uzay havası kötüleşiyor.",
    GECMISTEN_YUKSEK: "Bugünkü risk son 10 günün ortalamasından {fark} puan yüksek.",
    S3_ILIK: "S3 veya üzeri proton olayı: kemik iliği öyküsünde en üst öncelik.",
    KARIYER_YARI: "Birikimli doz kariyer sınırının {yuzde}'i.",
    S2_BEKLENIYOR: "S2 veya üzeri proton olayı sürüyor ya da bekleniyor.",
    T_SKOR_ESIK: "T-skoru görev sonunda {t} olacak; −2,5 eşiği görevin yaklaşık {gun}. gününde aşılıyor.",
    T_SKOR_YAKIN: "T-skoru görev sonunda {t}; osteoporoz eşiğine (−2,5) yakın.",
    PIHTI_PENCERE: "Görev günü {gun}: boyun veninde pıhtı için bilinen riskli dönem.",
    ATRIYUM_SURE: "Görev günü {gun}: kulakçık değişimlerinin beklendiği süre.",
    SAKIN: "Son 10 gün ve tahmin döneminde bu hastalık için belirgin risk yok.",
    VITAL_ALARM: "Canlı yaşamsal bulgu alarmı: {olay}."
  },
  u: {
    SIGINAK: { b: "Proton olayı: korunaklı alana geç", d: "S{S} düzeyinde proton akısı. Uyarı sürdükçe su ve yiyecek duvarlı mürettebat kabininde kal." },
    SIGINAK_HAZIR: { b: "Proton olayı olasılığı {yuzde}", d: "Sığınak planını ve kişisel dozimetreyi hazır tut; ince duvarlı modüllerde uzun iş planlama." },
    EVA_ERTELE: { b: "EVA'yı ertele", d: "Bu günlerde uzay yürüyüşü bu hastalık için riskli: giysi istasyondan daha az korur ve fiziksel yük artar." },
    YUKSEK_ENLEM: { b: "G{G} fırtınası: yüksek enlem geçişlerinde doz artar", d: "Kutuplara yakın geçişlerde korunaklı modülde kal; yoğun işleri ekvator kuşağı geçişlerine kaydır." },
    CME_VARIS: { b: "CME varışı bekleniyor", d: "Jeomanyetik fırtına ve yoğun iş yükü olabilir; o günü hafif programla." },
    HAREKETSIZLIK: { b: "Sığınakta uzun hareketsizlik", d: "Proton olayında saatlerce dar alanda beklenebilir. Her saat bacak ve boyun egzersizi yap, sıvı al." },
    EGZERSIZ_TELAFI: { b: "Kaçan egzersizi telafi et", d: "Sığınak saatleri ARED seansını engelleyebilir; aynı gün ya da ertesi gün telafi et." },
    SIVI_SIGINAK: { b: "Sığınağa su götür", d: "Uzun beklemelerde sıvı alımı düşer; idrar azalınca taş riski artar." },
    UYKU_STRES: { b: "Uyku bölünmesi ve stres", d: "Gece proton uyarısı uykuyu böler. Ertesi gün kritik görev planlama, ritmi izle." },
    RITIM_IZLEM: { b: "Fırtına günü ritim kaydı", d: "G{G} fırtına günlerinde Holter/EKG kaydı al. Fırtınanın ritme etkisi tartışmalı; önlem amaçlıdır." },
    SAA_BUGUN: { b: "Bugün SAA'da yaklaşık {dk} dk", d: "Sıradaki SAA girişi {sonraki}. Bu geçişlerde korunaklı modülde çalış; uyku saatlerini korunaklı kabinde geçir." },
    KAN_TAKIP: { b: "Kan sayımı takibi", d: "Son 10 günde proton olayı oldu. Planlı kan örneği al; halsizlik, morarma, ateş gibi belirtileri bildir." },
    KARIYER_DOZ: { b: "Birikimli doz: kariyer sınırının {yuzde}'i", d: "Toplam {doz} mSv. Kemik iliği öyküsünde sınırın yarısına yaklaşmak dönüş tartışmasını başlatır." },
    USG_TAKIP: { b: "Görev günü {gun}: pıhtı için riskli dönem", d: "Uzayda bildirilen boyun veni pıhtısı görevin yaklaşık 2. ayında bulundu. Planlı boyun ultrasonunu aksatma." },
    INIS_ANTIKOAG: { b: "İnişe {kalan} gün kaldı", d: "İlaç kullanılıyorsa iniş öncesi planı uçuş hekimi belirler (bilinen vakada ilaç inişten 4 gün önce kesilmişti)." },
    EVA_KANAMA: { b: "EVA: darbe ve kanama riski", d: "Kan sulandırıcı kullanılıyorsa EVA için uçuş hekiminin onayı gerekir." },
    ATRIYUM: { b: "Görev günü {gun}: kulakçık değişimi", d: "6 aylık uçuşta sol kulakçık geçici olarak büyüyebilir; ritim kayıtlarını haftalık incele." },
    T_SKOR: { b: "T-skoru: bugün {t}, görev sonunda yaklaşık {tson}", d: "Osteoporoz eşiği −2,5. Egzersiz ve ilaç uyumu bu projeksiyonu belirler." },
    EVA_KIRIK: { b: "EVA: kırık riski", d: "Ani yük ve darbe gerektiren işlerden kaçın; iki kişi çalış." },
    SIVI_HEDEF: { b: "Sıvı hedefi", d: "Günlük idrar en az 2,5 L olsun. Uzayda idrar azalır, idrardaki kalsiyum artar." },
    LENS_DOZ: { b: "Birikimli doz {doz} mSv", d: "Lens dozu arttıkça katarakt ilerleme riski artar; fırtına günlerinde dozu en aza indir." }
  },
  h: {
    ilik: {
      ad: "Kemik iliği kanseri öyküsü",
      tam: "Çocuklukta akut lenfoblastik lösemi (bir kemik iliği kanseri); 25 yıldır tam remisyonda. Uçuş hekimi onayıyla görevde.",
      neden: "Kemik iliği radyasyona en duyarlı dokulardan biridir. Geçmişte kemoterapi veya radyoterapi alanlarda kan yapıcı hücrelerdeki mutasyonlu klonlar yeni bir genotoksik baskıyla büyüyebilir; kısa mekik uçuşu yapmış astronotlarda bile küçük klonal hematopoez mutasyonları bulundu. Bu yüzden proton olayları, SAA geçişleri ve birikimli doz bu kişi için önceliklidir.",
      yap: ["Proton uyarısında hemen en korunaklı alana (su ve yiyecek duvarlı mürettebat kabini) geç; uyarı bitene kadar orada kal.", "Kişisel dozimetreyi sürekli tak; günlük doz raporunu uçuş hekimiyle paylaş.", "Proton olayından sonra planlı kan örneği al ve halsizlik, morarma, ateş, enfeksiyon belirtilerini bildir.", "Uykuyu korunaklı kabinde geçir; SAA geçişlerine denk gelen uzun işleri iyi korunan modüllerde yap."],
      yapma: ["Proton olayı sürerken ya da olasılık %25'in üzerindeyken EVA'ya çıkma.", "Fırtına günlerinde Cupola gibi ince duvarlı alanlarda uzun süre kalma.", "Ateş veya kanama belirtisini 'geçer' diye bekletme.", "Kariyer doz sınırına yaklaştıran görev uzatmalarını kabul etme."],
      kaynak: [["Brojakowska ve ark., Communications Biology 2022: astronotlarda klonal hematopoez", "https://doi.org/10.1038/s42003-022-03777-z"], ["NASA-STD-3001: radyasyon sınırları", "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf"]]
    },
    pihti: {
      ad: "Kan pıhtılaşması (tromboz) öyküsü",
      tam: "8 yıl önce ameliyat sonrası bacakta derin ven trombozu; tedavi tamamlandı, şu an ilaç kullanmıyor. Kalıtsal pıhtılaşma bozukluğu yok.",
      neden: "Ağırlıksızlıkta vücut sıvısı başa doğru kayar ve boyundaki juguler vende kan akışı yavaşlayabilir. 2020'de yayımlanan bir vakada ISS'teki bir astronotta görevin 2. ayında boyun veninde tıkayıcı pıhtı bulundu ve uzayda kan sulandırıcıyla tedavi edildi. Uzay havası doğrudan pıhtı yapmaz; ama proton olayında saatlerce dar sığınakta hareketsiz kalmak ve EVA'daki darbe/kanama riski bu kişi için önemlidir.",
      yap: ["Planlı boyun ultrasonu kontrollerini aksatma, özellikle görevin 1.–4. aylarında.", "Günde en az 2–2,5 L sıvı al; sığınakta beklerken her saat bacak ve boyun egzersizi yap.", "Tek taraflı boyun/yüz şişliği, baş ağrısı, nefes darlığı veya göğüs ağrısında hemen bildir.", "Kan sulandırıcı başlanırsa doz ve kalan stoku her gün kayda geçir."],
      yapma: ["Sığınakta veya uyku tulumunda saatlerce aynı pozisyonda kalma.", "Boynu sıkan bant veya yaka kullanma.", "Kan sulandırıcı kullanırken hekim onayı olmadan EVA veya darbe riski yüksek iş planlama.", "Hekime sormadan aspirin veya başka ağrı kesici alma."],
      kaynak: [["Auñón-Chancellor ve ark., NEJM 2020: uzay uçuşunda venöz tromboz", "https://doi.org/10.1056/NEJMc1905875"], ["Marshall-Goebel ve ark., JAMA Network Open 2019: juguler akım durgunluğu", "https://doi.org/10.1001/jamanetworkopen.2019.15011"]]
    },
    aritmi: {
      ad: "Düzensiz kalp atışı (atriyal fibrilasyon) öyküsü",
      tam: "Paroksismal atriyal fibrilasyon; 3 yıl önce kateter ablasyonu yapıldı, o zamandan beri ritim normal.",
      neden: "Astronotlarda atriyal fibrilasyon toplumla benzer oranda ama daha genç yaşta görülüyor. 6 aylık uçuşta sol kulakçık hacmi geçici olarak artabiliyor. Uykusuzluk, stres, yoğun iş yükü (EVA, CME günü) ve sıvı-elektrolit dengesizliği atağı tetikleyebilir. Jeomanyetik fırtınaların kalp ritmine etkisi tartışmalıdır; modelde düşük ağırlıkla yer alır.",
      yap: ["Fırtına ve yoğun iş günlerinde Holter/EKG kaydı al.", "Uyku hedefini koru; sığınak gecesinden sonra dinlenme ver.", "Sıvı ve elektrolit (potasyum, magnezyum) dengesini izle.", "Çarpıntı, baş dönmesi veya nefes darlığında işi bırak ve bildir."],
      yapma: ["Fırtına veya CME günlerinde fiziksel olarak ağır EVA'ya çıkma.", "Kafein ve uyarıcıları artırma, özellikle uykusuz günlerde.", "Uyku açığıyla kritik görevlere (robot kol, kenetlenme) girme.", "Belirti varken egzersize veya EVA'ya devam etme."],
      kaynak: [["Khine ve ark., Circulation: Arrhythmia and Electrophysiology 2018", "https://doi.org/10.1161/CIRCEP.117.005959"]]
    },
    osteopeni: {
      ad: "Kemik erimesi (osteopeni)",
      tam: "Uçuş öncesi T-skoru −1,7 (osteopeni; osteoporoz değil). Haftalık alendronat ve günlük direnç egzersizi (ARED) uyguluyor.",
      neden: "Ağırlıksızlıkta kemik ayda yaklaşık %1–1,5 yoğunluk kaybeder; direnç egzersizi ve bisfosfonat bu kaybı azaltır. Osteopenisi olan bir astronot görev uzadıkça osteoporoz eşiğine (T ≤ −2,5) yaklaşabilir. Proton olayında sığınakta geçen saatler egzersizi aksatır; EVA ve iniş kırık riskini artırır.",
      yap: ["ARED egzersizini her gün yap; sığınak yüzünden kaçan seansı telafi et.", "Alendronat, D vitamini ve kalsiyumu planlandığı gibi al; bol sıvı iç.", "Görev ortasında T-skoru projeksiyonunu uçuş hekimiyle gözden geçir.", "İnişe yakın denge ve kas kuvveti çalış; iniş sonrası taşınma planını hazırla."],
      yapma: ["EVA'da darbe ve ani yük gerektiren işleri tek başına yapma.", "Egzersiz seanslarını üst üste atlama.", "Fazla tuz ve hayvansal protein tüketme (idrarla kalsiyum kaybını artırır).", "İnişten hemen sonra yardımsız ayağa kalkmaya çalışma."],
      kaynak: [["LeBlanc ve ark., Osteoporosis International 2013: alendronat + egzersiz", "https://doi.org/10.1007/s00198-012-2243-z"], ["NASA HRP: uzay uçuşuna bağlı kemik değişiklikleri riski", "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/"]]
    },
    bobrek: {
      ad: "Böbrek taşı öyküsü",
      tam: "5 yıl önce bir kez kalsiyum oksalat taşı düşürdü; tekrarlamadı. Potasyum sitrat kullanıyor.",
      neden: "Uzayda kemikten çıkan kalsiyum idrara geçer; idrar hacmi ve sitrat azalır. Bu, taş riskini uçuşun ilk haftalarından itibaren artırır. İdrar hacmini 2,5 L/gün üzerinde tutmak ve potasyum sitrat riski azaltır. Proton olayında sığınakta ve EVA sırasında sıvı alımı düşer.",
      yap: ["Günlük idrar en az 2,5 L olacak şekilde sıvı al; sığınağa su torbası götür.", "Potasyum sitratı düzenli al; tuzu ve oksalattan zengin yiyecekleri sınırla.", "EVA öncesi ve sonrası sıvı al; giysi içi içme torbasını doldur.", "Yan veya bel ağrısı, idrarda kan ya da ateşte hemen bildir."],
      yapma: ["Uzun sığınak beklemelerinde su içmeyi erteleme.", "Fazla tuzlu hazır yemek ve yüksek protein takviyesi tüketme.", "Ağrıyı ağrı kesiciyle bastırıp bildirmeyi geciktirme.", "Susuz (dehidrate) hâlde EVA'ya çıkma."],
      kaynak: [["NASA NTRS: Uzay uçuşunda böbrek taşı riski ve karşı önlemler", "https://ntrs.nasa.gov/citations/20100033500"], ["NASA NTRS: Böbrek taşı riski ve idrar hacmi", "https://ntrs.nasa.gov/citations/20000020539"]]
    },
    katarakt: {
      ad: "Erken evre katarakt",
      tam: "Başlangıç evresinde arka subkapsüler lens bulanıklığı; görme keskinliği normal. Önceki görevden 95 mSv doz.",
      neden: "Daha yüksek lens dozu alan astronotlarda kataraktın daha sık ve daha erken görüldüğü bildirildi. Lens için asıl etken birikimli dozdur; proton olayları, yüksek enlem fırtına geçişleri ve EVA (giysi daha az korur) bu dozu artırır. Tek bir fırtına acil durum değildir ama her mSv birikir.",
      yap: ["Proton uyarısında korunaklı kabine geç; fırtına günlerinde Cupola pencerelerinden uzak dur.", "Görev ortası ve iniş sonrası göz (lens görüntüleme) muayenesi planla.", "Bulanık görme, kamaşma veya çift görmeyi bildir.", "EVA'yı proton olasılığı düşük günlere planla."],
      yapma: ["Proton olayı veya yüksek olasılıklı günlerde EVA'ya çıkma.", "Fırtına sırasında Cupola'da uzun süre gözlem yapma.", "Gözdeki değişikliği iniş sonrasına bırakma.", "Lens dozu hesaplanmadan görev uzatmasını kabul etme."],
      kaynak: [["Cucinotta ve ark., Radiation Research 2001: uzay radyasyonu ve katarakt", "https://pubmed.ncbi.nlm.nih.gov/11604058/"], ["Chylack ve ark., NASCA Rapor 2, Radiation Research 2012", "https://doi.org/10.1667/RR2876.1"]]
    }
  }
};

window.I18N.en.hst = {
  rapor: { baslik: "Crew health report: {n} astronauts", alt: "Report time: {z}. Vital signs are simulated; decisions are made by the flight surgeon.",
    gorev: "Mission day", risk: "Today's personal risk", riskDeger: "{s}/100 ({l}) · highest in the next 7 days {m}",
    karar: "Return decision", bulgu: "Vital signs", durum: "Assessment",
    durumNormal: "All vital signs are in the safe range.", durumDikkat: "Some vital signs are in the caution range, not harmful." },
  onerilenDonus: "Recommended return date", gorevSonu: "Planned end of mission", donusYok: "No suitable day in the 7-day forecast: as soon as the proton event ends",
  bugunKisa: "today", yarin: "tomorrow",
  kararVital: "Vital signs are in the harmful range. The crew should follow the alarm card's guidance now; the flight surgeon should consider an urgent return.",
  donusTur: { acil: "Urgent: first day without a proton event, on the first available vehicle.", erken: "Early return: nearest day without a proton event (or a high chance of one), strong storm or CME.", plan: "The mission continues as planned." },
  cevreBaslik: "Space weather: last 10 days, today and 7-day forecast",
  cevreAlt: "Each bar is that day's environmental load (proton event, geomagnetic storm, flare, CME). Dashed bars are forecasts.",
  cevreEksen: "Environmental load (0–100)",
  gozlem: "Observed", bugun: "Today", tahmin: "Forecast",
  egilim: { ARTIYOR: "worsening", AZALIYOR: "improving", SABIT: "not changing much" },
  egilimCumle: "Over the last 10 days space weather has been {e}: {m} M- and {x} X-class flares, proton events on {sep} days, geomagnetic storms on {g} days, {cme} CMEs.",
  issCumle: "In the next 24 hours the ISS will spend about {saa} min in the South Atlantic Anomaly (SAA) and {yuk} min at high latitude. Next SAA entry: {sonraki}.",
  olasilikKaynagi: { noaa: "Day 1–3 proton probability comes from the NOAA SWPC forecast.", patlama_sikligi: "NOAA probability data unavailable; proton probability estimated from the last 10 days' flare rate (model)." },
  kaynak: { gozlem: "Observed", canli: "Live data", noaa_3g: "NOAA 3-day Kp forecast", noaa_27g: "NOAA 27-day outlook", egilim: "10-day trend (low confidence)" },
  guven: { yuksek: "high confidence", orta: "medium confidence", dusuk: "low confidence" },
  ipucuKp: "Kp {kp} · G{G} · S{S}", ipucuKpYok: "No Kp data · G{G} · S{S}", ipucuP: "Proton event probability: {p}", ipucuCme: "CME arrival expected",
  ipucuPatlama: "Flares: {m} M, {x} X", ipucuSep: "DONKI proton event (SEP)",
  murettebat: "Crew", murettebatAlt: "Six fictional astronauts. Each has a medical history that doesn't ground them but can get worse depending on conditions. Select one for details.",
  gorevGun: "Mission day {g}/{t}", yas: "age {y}",
  kisiselBaslik: "Personal risk: last 10 days, today, 7 days", kisiselEksen: "Personal risk (0–100)",
  parca: "Today's score is made up of: environment {c} + chronic (condition and mission length) {k} + EVA {e} (+ base 8).",
  uyarilar: "Alerts (today and coming days)", uyariYok: "No additional alerts for this period.",
  donusBaslik: "Return to Earth", enUygun: "Calmest day in the forecast window", enUygunYok: "No day in the 7-day forecast is free of proton or storm risk.",
  kacin: "Days to avoid for return", kacinYok: "None", planlanan: "Planned return", kalan: "in {n} days",
  yap: "Do", yapma: "Don't",
  neden: "Why it matters in space", kaynaklar: "Sources", osdr: "Related OSDR studies",
  doz: "Cumulative dose", kariyer: "Of career limit", tskor: "T-score (today)", tskorSon: "T-score (end of mission)", gorev: "Mission day",
  tarihler: "Dates: {t}", yukleniyor: "Calculating…", hata: "Couldn't load data. Make sure the server window is still open.",
  guncel: "Calculated: {z}",
  evaNot: "EVA mode is on: a spacewalk is assumed to be planned in the coming days.",
  karar: {
    KAL: { b: "Can stay on mission", d: "Conditions add no notable risk for this condition. Routine monitoring continues." },
    IZLE: { b: "Stay, with close monitoring", d: "Risk may rise. Follow the alerts, report symptoms daily, and have the flight surgeon review regularly." },
    PLANLA: { b: "Consider an early return from the mission", d: "Risk is high. The flight surgeon and flight control should consider an early return from the mission." },
    ACIL: { b: "Urgent review", d: "Very high risk today. Move to the shielded area first; once the event passes, the flight surgeon should consider an urgent return. Boarding the capsule and undocking during a proton event can increase dose." }
  },
  kararKisa: { KAL: "Stay", IZLE: "Monitor closely", PLANLA: "Early return", ACIL: "Urgent review" },
  neden_: {
    BUGUN_KRITIK: "Today's personal risk is {skor}/100 (critical).",
    BUGUN_KRITIK_KRONIK: "Today's cumulative risk is {skor}/100 (critical); the flight surgeon and flight control should consider an early return.",
    COK_GUN_YUKSEK: "Risk is above 70 on {n} of the next 7 days.",
    RISK_YUKSEK: "Risk has reached {skor}/100; the flight surgeon and flight control should consider an early return from the mission.",
    RISK_ORTA: "Highest risk today and in the forecast period: {skor}/100.",
    EGILIM_ARTIYOR: "Space weather has been worsening over the last 10 days.",
    GECMISTEN_YUKSEK: "Today's risk is {fark} points above the 10-day average.",
    S3_ILIK: "S3 or higher proton event: top priority with a bone marrow cancer history.",
    KARIYER_YARI: "Cumulative dose is {yuzde} of the career limit.",
    S2_BEKLENIYOR: "An S2 or higher proton event is under way or expected.",
    T_SKOR_ESIK: "T-score will be {t} at end of mission; the −2.5 threshold is crossed around mission day {gun}.",
    T_SKOR_YAKIN: "T-score will be {t} at end of mission, close to the osteoporosis threshold (−2.5).",
    PIHTI_PENCERE: "Mission day {gun}: a known risk window for a neck vein clot.",
    ATRIYUM_SURE: "Mission day {gun}: the period when atrial changes are expected.",
    SAKIN: "No notable risk for this condition in the last 10 days or the forecast.",
    VITAL_ALARM: "Live vital-sign alarm: {olay}."
  },
  u: {
    SIGINAK: { b: "Proton event: move to the shielded area", d: "Proton flux at S{S}. Stay in the crew quarters lined with water and food until the alert ends." },
    SIGINAK_HAZIR: { b: "Proton event probability {yuzde}", d: "Keep the shelter plan and personal dosimeter ready; don't schedule long tasks in thin-walled modules." },
    EVA_ERTELE: { b: "Postpone the EVA", d: "A spacewalk on these days is risky for this condition: the suit shields less than the station and the physical load is higher." },
    YUKSEK_ENLEM: { b: "G{G} storm: dose rises on high-latitude passes", d: "Stay in a shielded module near the poles; move demanding tasks to equatorial passes." },
    CME_VARIS: { b: "CME arrival expected", d: "Expect a geomagnetic storm and a heavier workload; keep that day's schedule light." },
    HAREKETSIZLIK: { b: "Long immobility in the shelter", d: "A proton event can mean hours in a small space. Exercise legs and neck every hour and keep drinking." },
    EGZERSIZ_TELAFI: { b: "Make up missed exercise", d: "Shelter hours can block the ARED session; make it up the same day or the next." },
    SIVI_SIGINAK: { b: "Take water to the shelter", d: "Fluid intake drops during long waits; lower urine volume raises stone risk." },
    UYKU_STRES: { b: "Disrupted sleep and stress", d: "A night-time proton alert breaks sleep. Don't schedule critical tasks the next day; monitor rhythm." },
    RITIM_IZLEM: { b: "Rhythm recording on storm days", d: "Record a Holter/ECG on G{G} storm days. The effect of storms on rhythm is debated; this is a precaution." },
    SAA_BUGUN: { b: "About {dk} min in the SAA today", d: "Next SAA entry {sonraki}. Work in a shielded module during these passes and sleep in the shielded quarters." },
    KAN_TAKIP: { b: "Blood count follow-up", d: "There was a proton event in the last 10 days. Take the planned blood sample and report fatigue, bruising or fever." },
    KARIYER_DOZ: { b: "Cumulative dose: {yuzde} of career limit", d: "Total {doz} mSv. With a bone marrow history, approaching half the limit starts the return discussion." },
    USG_TAKIP: { b: "Mission day {gun}: risk window for clots", d: "The neck vein clot reported in space was found around the second month. Keep up planned neck ultrasounds." },
    INIS_ANTIKOAG: { b: "{kalan} days to landing", d: "If on medication, the flight surgeon sets the pre-landing plan (in the known case the drug was stopped 4 days before landing)." },
    EVA_KANAMA: { b: "EVA: impact and bleeding risk", d: "If on a blood thinner, an EVA needs the flight surgeon's approval." },
    ATRIYUM: { b: "Mission day {gun}: atrial change", d: "The left atrium can temporarily enlarge on a 6-month flight; review rhythm recordings weekly." },
    T_SKOR: { b: "T-score: {t} today, about {tson} at end of mission", d: "Osteoporosis threshold is −2.5. Exercise and medication adherence drive this projection." },
    EVA_KIRIK: { b: "EVA: fracture risk", d: "Avoid tasks with sudden loads or impacts; work in pairs." },
    SIVI_HEDEF: { b: "Fluid target", d: "Aim for at least 2.5 L of urine a day. In space urine volume drops and urinary calcium rises." },
    LENS_DOZ: { b: "Cumulative dose {doz} mSv", d: "Cataract progression risk rises with lens dose; minimise dose on storm days." }
  },
  h: {
    ilik: {
      ad: "History of bone marrow cancer",
      tam: "Acute lymphoblastic leukaemia (a bone marrow cancer) in childhood; in complete remission for 25 years. Flying with flight surgeon approval.",
      neden: "Bone marrow is among the most radiation-sensitive tissues. In people who had chemotherapy or radiotherapy, mutated blood-forming clones can expand under new genotoxic stress; small clonal haematopoiesis mutations were found even in astronauts who flew short Shuttle missions. That makes proton events, SAA passes and cumulative dose the priority for this person.",
      yap: ["On a proton alert, move straight to the best-shielded area (crew quarters lined with water and food) and stay until it ends.", "Wear the personal dosimeter at all times; share the daily dose report with the flight surgeon.", "After a proton event, take the planned blood sample and report fatigue, bruising, fever or infection.", "Sleep in the shielded quarters; do long tasks that overlap SAA passes in well-shielded modules."],
      yapma: ["Don't go on an EVA during a proton event or when the probability is above 25%.", "Don't spend long periods in thin-walled areas like the Cupola on storm days.", "Don't wait out a fever or bleeding.", "Don't accept mission extensions that bring you close to the career dose limit."],
      kaynak: [["Brojakowska et al., Communications Biology 2022: clonal haematopoiesis in astronauts", "https://doi.org/10.1038/s42003-022-03777-z"], ["NASA-STD-3001: radiation limits", "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf"]]
    },
    pihti: {
      ad: "History of blood clots (thrombosis)",
      tam: "Deep vein thrombosis in the leg after surgery 8 years ago; treatment completed, no current medication. No inherited clotting disorder.",
      neden: "In weightlessness body fluid shifts towards the head and blood flow in the jugular vein can slow. A case published in 2020 described an ISS astronaut found with an obstructive neck vein clot in the second month of the mission, treated in space with a blood thinner. Space weather doesn't cause clots directly, but hours of immobility in a small shelter during a proton event and the impact/bleeding risk of an EVA matter for this person.",
      yap: ["Keep up planned neck ultrasounds, especially in months 1–4 of the mission.", "Drink at least 2–2.5 L a day; exercise legs and neck every hour while sheltering.", "Report one-sided neck or face swelling, headache, shortness of breath or chest pain right away.", "If a blood thinner is started, log the dose and remaining stock every day."],
      yapma: ["Don't stay in one position for hours in the shelter or sleeping bag.", "Don't wear tight neck bands or collars.", "Don't schedule an EVA or high-impact work on a blood thinner without the doctor's approval.", "Don't take aspirin or other painkillers without asking the doctor."],
      kaynak: [["Auñón-Chancellor et al., NEJM 2020: venous thrombosis during spaceflight", "https://doi.org/10.1056/NEJMc1905875"], ["Marshall-Goebel et al., JAMA Network Open 2019: jugular venous flow stasis", "https://doi.org/10.1001/jamanetworkopen.2019.15011"]]
    },
    aritmi: {
      ad: "History of irregular heartbeat (atrial fibrillation)",
      tam: "Paroxysmal atrial fibrillation; catheter ablation 3 years ago, normal rhythm since.",
      neden: "Atrial fibrillation occurs in astronauts at a rate similar to the general population but at a younger age. Left atrial volume can increase temporarily over a 6-month flight. Sleep loss, stress, heavy workload (EVA, CME day) and fluid-electrolyte imbalance can trigger an episode. Whether geomagnetic storms affect heart rhythm is debated; the model gives it a low weight.",
      yap: ["Record a Holter/ECG on storm and heavy-workload days.", "Protect your sleep; rest after a night in the shelter.", "Watch fluid and electrolyte (potassium, magnesium) balance.", "Stop work and report palpitations, dizziness or shortness of breath."],
      yapma: ["Don't do a physically demanding EVA on storm or CME days.", "Don't increase caffeine or stimulants, especially after poor sleep.", "Don't take on critical tasks (robotic arm, docking) with a sleep debt.", "Don't keep exercising or doing an EVA with symptoms."],
      kaynak: [["Khine et al., Circulation: Arrhythmia and Electrophysiology 2018", "https://doi.org/10.1161/CIRCEP.117.005959"]]
    },
    osteopeni: {
      ad: "Low bone density (osteopenia)",
      tam: "Pre-flight T-score −1.7 (osteopenia, not osteoporosis). Takes weekly alendronate and does daily resistance exercise (ARED).",
      neden: "In weightlessness bone loses about 1–1.5% density a month; resistance exercise and bisphosphonates reduce the loss. An astronaut with osteopenia can approach the osteoporosis threshold (T ≤ −2.5) as the mission goes on. Hours in the shelter during a proton event interrupt exercise; EVA and landing raise fracture risk.",
      yap: ["Do ARED exercise every day; make up any session missed because of the shelter.", "Take alendronate, vitamin D and calcium as planned; drink plenty.", "Review the T-score projection with the flight surgeon mid-mission.", "Train balance and muscle strength before landing; prepare the post-landing carry plan."],
      yapma: ["Don't do EVA tasks with impacts or sudden loads alone.", "Don't skip exercise sessions back to back.", "Don't eat too much salt or animal protein (it increases calcium loss in urine).", "Don't try to stand up unassisted right after landing."],
      kaynak: [["LeBlanc et al., Osteoporosis International 2013: alendronate + exercise", "https://doi.org/10.1007/s00198-012-2243-z"], ["NASA HRP: risk of spaceflight-induced bone changes", "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/"]]
    },
    bobrek: {
      ad: "History of kidney stones",
      tam: "Passed one calcium oxalate stone 5 years ago; no recurrence. Takes potassium citrate.",
      neden: "In space, calcium released from bone passes into urine while urine volume and citrate fall, raising stone risk from the first weeks of flight. Keeping urine output above 2.5 L/day and taking potassium citrate lower the risk. Fluid intake drops in the shelter during a proton event and during an EVA.",
      yap: ["Drink enough for at least 2.5 L of urine a day; take a water pouch to the shelter.", "Take potassium citrate regularly; limit salt and oxalate-rich foods.", "Drink before and after an EVA; fill the in-suit drink bag.", "Report flank or back pain, blood in urine or fever right away."],
      yapma: ["Don't put off drinking during long shelter waits.", "Don't eat lots of salty ready meals or high-protein supplements.", "Don't mask pain with painkillers and delay reporting it.", "Don't go on an EVA dehydrated."],
      kaynak: [["NASA NTRS: renal stone risk during spaceflight and countermeasures", "https://ntrs.nasa.gov/citations/20100033500"], ["NASA NTRS: renal stone risk and urine volume", "https://ntrs.nasa.gov/citations/20000020539"]]
    },
    katarakt: {
      ad: "Early-stage cataract",
      tam: "Early posterior subcapsular lens opacity; normal visual acuity. 95 mSv from a previous mission.",
      neden: "Astronauts with higher lens doses were reported to develop cataracts more often and earlier. Cumulative dose is the main factor for the lens; proton events, high-latitude storm passes and EVAs (the suit shields less) add to it. A single storm isn't an emergency, but every mSv adds up.",
      yap: ["On a proton alert, move to the shielded quarters; stay away from the Cupola windows on storm days.", "Plan an eye (lens imaging) exam mid-mission and after landing.", "Report blurred vision, glare or double vision.", "Schedule EVAs for days with low proton probability."],
      yapma: ["Don't go on an EVA during a proton event or on high-probability days.", "Don't spend long observation sessions in the Cupola during a storm.", "Don't leave eye changes until after landing.", "Don't accept a mission extension before the lens dose is calculated."],
      kaynak: [["Cucinotta et al., Radiation Research 2001: space radiation and cataracts", "https://pubmed.ncbi.nlm.nih.gov/11604058/"], ["Chylack et al., NASCA Report 2, Radiation Research 2012", "https://doi.org/10.1667/RR2876.1"]]
    }
  }
};

/* ---------------------------------------------------------------- Yaşamsal bulgular ve alarmlar */
window.I18N.tr.hst.v = {
  baslik: "Yaşamsal bulgular", ekg: "Canlı monitör · EKG (II. derivasyon, simülasyon)", ritimDuzenli: "Sinüs ritmi, düzenli",
  ritimDuzensiz: "Düzensiz ritim: atriyal fibrilasyon", dk: "/dk", solunumKisa: "Solunum", surum: "Sürüm {s}",
  alt: "Simülasyon: her astronotun yaşına uygun dinlenme değerleri; uyku, egzersiz, uzay havası (proton olayında sığınakta bekleme, fırtına ve CME günü iş yükü) ve hastalık ataklarıyla değişir. Saniyede bir güncellenir.",
  alan: { nabiz: "Nabız", tansiyon: "Tansiyon (kan basıncı)", solunum: "Solunum", spo2: "Kandaki oksijen (SpO2)", ates: "Vücut ısısı" },
  seviye: { normal: "Normal", dikkat: "Dikkat", zarar: "Zararlı" },
  guvenli: "güvenli:",
  aktivite: { uyku: "Uyku", egzersiz: "Egzersiz", siginak: "Korunaklı alanda bekliyor", gorev: "Olağan görev" },
  cinsiyet: { K: "kadın", E: "erkek" },
  dinlenme: "Dinlenme değerleri ({y} yaş, {c}): nabız {n}/dk · tansiyon {s}/{d} mmHg · solunum {r}/dk",
  guncel: "Güncellendi: {z}", hata: "Bulgular alınamadı.",
  simule: "Atak simüle et", simuleNot: "Sunum için: seçili astronotun hastalığına özgü atağı 12 dakikalığına başlatır.",
  sonKayit: "Son alarm kayıtları", kayitYok: "Henüz alarm yok.",
  kayitAlarm: "ALARM — {ad} ({yas} yaş): {olay}", kayitDuzeldi: "Düzeldi — {ad} ({yas} yaş), {sure} dk sürdü",
  kayitYol: "Alarmlar şu metin dosyasına yazılıyor: {p}", kayitHata: "Kayıt dosyasına yazılamadı: {h}",
  not: "Dosya yolunu ayarlar.json içindeki \"saglik_kayit_dosyasi\" ile değiştirebilirsiniz.",
  rozet: "{n} görülmemiş sağlık alarmı",
  alarm: "ALARM", gordum: "Gördüm", gorundu: "Görüldü",
  murettebata: "Mürettebata: {s} (sağlık görevlisi)", ve: " ve {y} yardım etsin", murettebataYok: "Mürettebat: uçuş hekimine hemen bağlanın.",
  bulguSatir: "Nabız {n}/dk · Tansiyon {s}/{d} mmHg · Solunum {r}/dk · SpO2 %{o} · Vücut ısısı {a} °C",
  duzensiz: "ritim düzensiz",
  zararli: "Zararlı aralıkta: {l}",
  riskTetik: "Kişisel risk {r}/100: 70 ve üstü olduğu için alarm kendiliğinden açıldı; risk 70'in altına inince kapanır.",
  kural: "Kişisel risk 70 ve üstüne çıkınca hastalığa özgü atak ve alarm kendiliğinden başlar; risk düşünce kapanır.",
  yontem: "Yöntem", ilac: "İlaç (uçuş hekimi onayıyla)", acil: "Ne zaman acil?",
  sorun: {
    NABIZ_YUKSEK: "Nabız yüksek (taşikardi)", NABIZ_DUSUK: "Nabız düşük (bradikardi)",
    TANSIYON_YUKSEK: "Tansiyon yüksek", TANSIYON_DUSUK: "Tansiyon düşük", DIYASTOLIK_YUKSEK: "Küçük tansiyon yüksek",
    SOLUNUM_YUKSEK: "Solunum hızlı", SOLUNUM_DUSUK: "Solunum yavaş", SPO2_DUSUK: "Kandaki oksijen düşük",
    ATES_YUKSEK: "Ateş", ATES_DUSUK: "Vücut ısısı düşük"
  },
  olay: {
    ATES_ENFEKSIYON: "Ateş ve hızlı nabız: enfeksiyon / kan sayımı düşüklüğü şüphesi",
    PIHTI_EMBOLI: "Hızlı solunum ve düşük oksijen: pıhtı / akciğer embolisi şüphesi",
    AF_ATAK: "Hızlı ve düzensiz nabız: atriyal fibrilasyon atağı",
    KIRIK_AGRI: "Ani ağrı, yüksek tansiyon ve nabız: kırık şüphesi",
    BOBREK_SANCI: "Şiddetli yan ağrısı, yüksek tansiyon: böbrek taşı sancısı şüphesi",
    HIPERTANSIF: "Tansiyon yükselmesi (hipertansif atak)",
    GENEL: "Yaşamsal bulgu güvenli aralığın dışında"
  },
  oneri: {
    AF_ATAK: {
      yontem: ["İşi hemen bıraktır, sabitlenmiş şekilde dinlendir.", "EKG/Holter kaydını başlat; nabız ve tansiyonu 5 dakikada bir ölç.", "Ağızdan sıvı ver; kafeinli içecek verme.", "Uçuş hekimiyle (Mission Control) hemen bağlantı kur."],
      ilac: ["Uçuş hekimi onayıyla nabız hızını düşüren ilaç (ör. beta bloker).", "Atak 48 saati aşarsa pıhtı önleyici ilaç uçuş hekimince değerlendirilir."],
      acil: ["Göğüs ağrısı, bayılma ya da büyük tansiyon 90'ın altına inerse defibrilatörü (AED) hazırla."]
    },
    PIHTI_EMBOLI: {
      yontem: ["Hareket ettirme; yarı oturur pozisyonda sabitle.", "Oksijen ver; SpO2 ve solunumu sürekli izle.", "Boyun ve bacak venlerine ultrason yap (uçuş hekimi yönlendirmesiyle).", "Uçuş hekimiyle acil bağlantı kur."],
      ilac: ["Uçuş hekimi onayıyla kan sulandırıcı (bilinen ISS vakasında enoksaparin, ardından apiksaban kullanıldı).", "Kanama riski yüzünden hekime sormadan aspirin ya da başka ağrı kesici verme."],
      acil: ["SpO2 %90'ın altına iner ya da tansiyon düşerse acil dönüş değerlendirilsin."]
    },
    ATES_ENFEKSIYON: {
      yontem: ["Ayrı bir bölümde dinlendir; ortak alanları ve yüzeyleri dezenfekte et.", "Ateş, nabız ve tansiyonu 30 dakikada bir ölç.", "Bol sıvı ver; planlı kan örneğini al ve belirtileri kaydet (morarma, kanama, halsizlik).", "Uçuş hekimine bildir."],
      ilac: ["Ateş için parasetamol (uçuş hekimi onayıyla).", "Enfeksiyon şüphesinde antibiyotiği uçuş hekimi seçer.", "Kemik iliği öyküsü nedeniyle aspirin ve NSAİİ verme (kanama riski)."],
      acil: ["Ateş 39 °C'yi geçerse, bilinç bulanıklaşır ya da tansiyon düşerse acil değerlendirme."]
    },
    BOBREK_SANCI: {
      yontem: ["Sıvıyı artır (günlük idrar ≥ 2,5 L hedefi).", "Ultrasonla böbrek ve idrar yolunu kontrol et (uçuş hekimi yönlendirmesiyle).", "Ağrı şiddetini ve idrarda kanı kaydet."],
      ilac: ["Uçuş hekimi onayıyla ağrı kesici.", "Taşın düşmesine yardım için alfa bloker (ör. tamsulosin) uçuş hekimince değerlendirilir.", "Bulantı varsa bulantı önleyici."],
      acil: ["Ateş + ağrı (enfeksiyon) ya da idrar çıkışı durursa acil dönüş değerlendirilsin."]
    },
    KIRIK_AGRI: {
      yontem: ["Ağrıyan bölgeyi hareket ettirme; atelle sabitle.", "Ultrasonla kırık şüphesini değerlendir (uçuş hekimi yönlendirmesiyle).", "Egzersiz ve EVA programını durdur."],
      ilac: ["Ağrı için parasetamol (uçuş hekimi onayıyla).", "Güçlü ağrı kesici gerekip gerekmediğine uçuş hekimi karar verir."],
      acil: ["Kol veya bacakta his kaybı, renk değişikliği ya da şiddetli şişlik olursa acil değerlendirme."]
    },
    HIPERTANSIF: {
      yontem: ["Sakin bir bölümde dinlendir; 15 dakika sonra tansiyonu tekrar ölç.", "Baş ağrısı, görme değişikliği, göğüs ağrısı var mı sor.", "Tuzlu yiyecekleri ve kafeini kes."],
      ilac: ["Tansiyon yüksek kalırsa uçuş hekimi onayıyla tansiyon düşürücü ilaç."],
      acil: ["Tansiyon 180/110'u geçerse ya da ani görme kaybı, göğüs ağrısı, konuşma bozukluğu olursa acil değerlendirme."]
    },
    GENEL: {
      yontem: ["Dinlendir; bulguları 5 dakikada bir ölç.", "Uçuş hekimine bildir."],
      ilac: ["İlaç kararını uçuş hekimi verir."],
      acil: ["Bulgular kötüleşirse acil değerlendirme."]
    }
  }
};

window.I18N.en.hst.v = {
  baslik: "Vital signs", ekg: "Live monitor · ECG (lead II, simulated)", ritimDuzenli: "Sinus rhythm, regular",
  ritimDuzensiz: "Irregular rhythm: atrial fibrillation", dk: "/min", solunumKisa: "Resp", surum: "Version {s}",
  alt: "Simulation: each astronaut's age-appropriate resting values change with sleep, exercise, space weather (sheltering during a proton event, workload on storm and CME days) and condition-related episodes. Updates every second.",
  alan: { nabiz: "Heart rate", tansiyon: "Blood pressure", solunum: "Breathing rate", spo2: "Blood oxygen (SpO2)", ates: "Body temperature" },
  seviye: { normal: "Normal", dikkat: "Caution", zarar: "Harmful" },
  guvenli: "safe:",
  aktivite: { uyku: "Sleeping", egzersiz: "Exercising", siginak: "Sheltering", gorev: "Normal duty" },
  cinsiyet: { K: "female", E: "male" },
  dinlenme: "Resting values (age {y}, {c}): heart rate {n}/min · blood pressure {s}/{d} mmHg · breathing {r}/min",
  guncel: "Updated: {z}", hata: "Couldn't load vital signs.",
  simule: "Simulate an episode", simuleNot: "For demos: starts the selected astronaut's condition-specific episode for 12 minutes.",
  sonKayit: "Latest alarm log", kayitYok: "No alarms yet.",
  kayitAlarm: "ALARM — {ad} (age {yas}): {olay}", kayitDuzeldi: "Resolved — {ad} (age {yas}), lasted {sure} min",
  kayitYol: "Alarms are written to this text file: {p}", kayitHata: "Couldn't write to the log file: {h}",
  not: "Change the path with \"saglik_kayit_dosyasi\" in ayarlar.json.",
  rozet: "{n} unacknowledged health alarms",
  alarm: "ALARM", gordum: "Acknowledge", gorundu: "Acknowledged",
  murettebata: "Crew: {s} (crew medical officer)", ve: ", assisted by {y}", murettebataYok: "Crew: contact the flight surgeon now.",
  bulguSatir: "Heart rate {n}/min · Blood pressure {s}/{d} mmHg · Breathing {r}/min · SpO2 {o}% · Temperature {a} °C",
  duzensiz: "irregular rhythm",
  zararli: "In the harmful range: {l}",
  riskTetik: "Personal risk {r}/100: the alarm opened automatically because it is 70 or higher; it closes when risk drops below 70.",
  kural: "When personal risk reaches 70 or more, the condition-specific episode and alarm start automatically; they stop when risk drops.",
  yontem: "What to do", ilac: "Medication (with flight surgeon approval)", acil: "When is it an emergency?",
  sorun: {
    NABIZ_YUKSEK: "High heart rate (tachycardia)", NABIZ_DUSUK: "Low heart rate (bradycardia)",
    TANSIYON_YUKSEK: "High blood pressure", TANSIYON_DUSUK: "Low blood pressure", DIYASTOLIK_YUKSEK: "High diastolic pressure",
    SOLUNUM_YUKSEK: "Fast breathing", SOLUNUM_DUSUK: "Slow breathing", SPO2_DUSUK: "Low blood oxygen",
    ATES_YUKSEK: "Fever", ATES_DUSUK: "Low body temperature"
  },
  olay: {
    ATES_ENFEKSIYON: "Fever and fast heart rate: suspected infection / low blood counts",
    PIHTI_EMBOLI: "Fast breathing and low oxygen: suspected clot / pulmonary embolism",
    AF_ATAK: "Fast, irregular heart rate: atrial fibrillation episode",
    KIRIK_AGRI: "Sudden pain, high blood pressure and heart rate: suspected fracture",
    BOBREK_SANCI: "Severe flank pain, high blood pressure: suspected kidney stone colic",
    HIPERTANSIF: "Blood pressure spike (hypertensive episode)",
    GENEL: "Vital sign outside the safe range"
  },
  oneri: {
    AF_ATAK: {
      yontem: ["Stop work immediately; rest them, secured in place.", "Start an ECG/Holter recording; measure heart rate and blood pressure every 5 minutes.", "Give fluids by mouth; no caffeinated drinks.", "Contact the flight surgeon (Mission Control) right away."],
      ilac: ["A heart-rate-lowering drug (e.g. a beta blocker) with flight surgeon approval.", "If the episode lasts over 48 hours, the flight surgeon considers an anticoagulant."],
      acil: ["If there is chest pain, fainting or systolic pressure drops below 90, get the defibrillator (AED) ready."]
    },
    PIHTI_EMBOLI: {
      yontem: ["Don't move them; secure them half-sitting.", "Give oxygen; monitor SpO2 and breathing continuously.", "Ultrasound the neck and leg veins (guided by the flight surgeon).", "Contact the flight surgeon urgently."],
      ilac: ["A blood thinner with flight surgeon approval (in the known ISS case, enoxaparin then apixaban).", "Because of bleeding risk, don't give aspirin or other painkillers without asking the doctor."],
      acil: ["If SpO2 falls below 90% or blood pressure drops, consider an emergency return."]
    },
    ATES_ENFEKSIYON: {
      yontem: ["Rest them in a separate module; disinfect shared areas and surfaces.", "Measure temperature, heart rate and blood pressure every 30 minutes.", "Give plenty of fluids; take the planned blood sample and log symptoms (bruising, bleeding, fatigue).", "Report to the flight surgeon."],
      ilac: ["Paracetamol for fever (with flight surgeon approval).", "If infection is suspected, the flight surgeon chooses the antibiotic.", "No aspirin or NSAIDs because of the bone marrow history (bleeding risk)."],
      acil: ["Urgent review if temperature exceeds 39 °C, they become confused or blood pressure drops."]
    },
    BOBREK_SANCI: {
      yontem: ["Increase fluids (aim for at least 2.5 L of urine a day).", "Ultrasound the kidney and urinary tract (guided by the flight surgeon).", "Log pain severity and any blood in the urine."],
      ilac: ["A painkiller with flight surgeon approval.", "The flight surgeon may consider an alpha blocker (e.g. tamsulosin) to help pass the stone.", "An anti-nausea drug if there is nausea."],
      acil: ["Fever plus pain (infection) or no urine output: consider an emergency return."]
    },
    KIRIK_AGRI: {
      yontem: ["Don't move the painful area; immobilise it with a splint.", "Assess the suspected fracture by ultrasound (guided by the flight surgeon).", "Stop the exercise and EVA schedule."],
      ilac: ["Paracetamol for pain (with flight surgeon approval).", "The flight surgeon decides whether a stronger painkiller is needed."],
      acil: ["Urgent review if there is numbness, colour change or severe swelling in the limb."]
    },
    HIPERTANSIF: {
      yontem: ["Rest them in a quiet module; re-measure blood pressure after 15 minutes.", "Ask about headache, vision changes or chest pain.", "Cut salty food and caffeine."],
      ilac: ["If blood pressure stays high, a blood-pressure-lowering drug with flight surgeon approval."],
      acil: ["Urgent review if pressure exceeds 180/110 or there is sudden vision loss, chest pain or slurred speech."]
    },
    GENEL: {
      yontem: ["Rest them; measure vital signs every 5 minutes.", "Report to the flight surgeon."],
      ilac: ["The flight surgeon decides on any medication."],
      acil: ["Urgent review if vital signs get worse."]
    }
  }
};


/* Kısa PDF rapor */
window.I18N.tr.kr = {
  baslik: "AstroHealth Tracker · Kısa durum raporu",
  zaman: "Rapor anı: {z}",
  senaryo: "Senaryo: Mayıs 2024 fırtınası (canlı veri değil)",
  evaModu: "EVA modu açık",
  b1: "1. Anlık durum",
  b2: "2. Mürettebat",
  b3: "3. Aktif alarmlar ({n})",
  risk: "İstasyon riski", doz: "Bugünkü doz", kariyer: "Kariyer sınırının {y} kadarı",
  kp: "Jeomanyetik", firtinaYok: "Fırtına yok",
  proton: "Proton (≥10 MeV)", protonYok: "Radyasyon fırtınası yok",
  konum: "ISS bölgesi",
  eva: "En uygun EVA", evaYok: "12 saatte uygun pencere yok", evaAlt: "{d} dk · ort. risk {r}",
  veriYok: "Veri alınamadı.",
  t: { astronot: "Astronot", oyku: "Sağlık öyküsü", risk: "Risk (bugün)", karar: "Karar", donus: "Önerilen dönüş", bulgu: "Nabız · Tansiyon · SpO2", durum: "Durum" },
  bulgu: "{n}/dk · {s}/{d} · {o}",
  duzensiz: "düzensiz ritim",
  normal: "Normal", dikkat: "Dikkat",
  yardim: "Yardım edecek", ilkAdim: "İlk adım", acil: "Acil durumda",
  alarmYok: "Şu an zararlı seviyede bulgu yok.",
  dip: "Yaşamsal bulgular simülasyondur, astronotlar kurgusaldır. İlaç ve doz kararını her zaman uçuş hekimi verir. Ayrıntılar uygulamada."
};
window.I18N.en.kr = {
  baslik: "AstroHealth Tracker · Short status report",
  zaman: "Report time: {z}",
  senaryo: "Scenario: May 2024 storm (not live data)",
  evaModu: "EVA mode on",
  b1: "1. Current status",
  b2: "2. Crew",
  b3: "3. Active alarms ({n})",
  risk: "Station risk", doz: "Dose today", kariyer: "{y} of career limit",
  kp: "Geomagnetic", firtinaYok: "No storm",
  proton: "Protons (≥10 MeV)", protonYok: "No radiation storm",
  konum: "ISS region",
  eva: "Best EVA window", evaYok: "No suitable window in 12 h", evaAlt: "{d} min · avg. risk {r}",
  veriYok: "No data available.",
  t: { astronot: "Astronaut", oyku: "Medical history", risk: "Risk (today)", karar: "Decision", donus: "Suggested return", bulgu: "HR · BP · SpO2", durum: "Status" },
  bulgu: "{n}/min · {s}/{d} · {o}",
  duzensiz: "irregular rhythm",
  normal: "Normal", dikkat: "Caution",
  yardim: "Who helps", ilkAdim: "First step", acil: "If it gets worse",
  alarmYok: "No vital signs in the harmful range right now.",
  dip: "Vital signs are simulated and the astronauts are fictional. Medication and dose are always decided by the flight surgeon. Details in the app."
};
