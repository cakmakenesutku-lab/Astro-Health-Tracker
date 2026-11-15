"""Yaşamsal bulgular (nabız, tansiyon, solunum, SpO2, vücut ısısı) — SİMÜLASYON.

ISS'te gerçek zamanlı biyometrik veri herkese açık değildir. Bu modül her (kurgusal)
astronot için yaşına ve cinsiyetine uygun dinlenme değerlerinden başlar ve bunları
şu etkenlerle zaman içinde değiştirir:

  * Günlük düzen (ISS GMT saatiyle): uyku 21:30-06:00, günde 2 egzersiz seansı
  * Uzay havası: proton olayında korunaklı alanda bekleme (stres, uykusuzluk),
    jeomanyetik fırtına ve CME günü iş yükü
  * Hastalık atakları: kişisel risk puanı 70 ve üstüne çıkınca kendiliğinden başlar,
    risk 70'in altına inince biter (AF atağı, pıhtı/emboli şüphesi, ateş, böbrek sancısı,
    kırık ağrısı, tansiyon yükselmesi)

Değerler zamanın deterministik bir fonksiyonudur: aynı anda kim sorarsa aynı sonucu alır.
Bir bulgu zararlı aralığa girdiğinde ayarlar.json'daki metin dosyasına kayıt düşülür ve
mürettebata uygulanabilecek yöntem/ilaç önerisi üretilir.
"""
import hashlib
import math
import os
import threading
import time
from collections import deque
from datetime import datetime, timezone
from pathlib import Path

import hastalik
import kaynaklar

# ------------------------------------------------------------------ kişisel fizyoloji
# Dinlenme değerleri yaş ve cinsiyetle tutarlı seçildi (sağlıklı, fiziksel olarak hazırlıklı
# yetişkinler). egzersiz: GMT saat olarak iki 60 dakikalık seans başlangıcı.
FIZYOLOJI = {
    "a1": {"cinsiyet": "K", "nabiz": 66, "sistolik": 112, "diyastolik": 72, "solunum": 14, "spo2": 98, "ates": 36.7, "egzersiz": (7.0, 13.5)},
    "a2": {"cinsiyet": "E", "nabiz": 64, "sistolik": 122, "diyastolik": 80, "solunum": 13, "spo2": 98, "ates": 36.6, "egzersiz": (8.0, 15.0)},
    "a3": {"cinsiyet": "E", "nabiz": 70, "sistolik": 128, "diyastolik": 82, "solunum": 15, "spo2": 97, "ates": 36.7, "egzersiz": (9.0, 16.0)},
    "a4": {"cinsiyet": "K", "nabiz": 68, "sistolik": 124, "diyastolik": 80, "solunum": 14, "spo2": 98, "ates": 36.7, "egzersiz": (10.0, 17.0)},
    "a5": {"cinsiyet": "E", "nabiz": 58, "sistolik": 118, "diyastolik": 76, "solunum": 12, "spo2": 99, "ates": 36.6, "egzersiz": (11.0, 18.0)},
    "a6": {"cinsiyet": "K", "nabiz": 72, "sistolik": 132, "diyastolik": 84, "solunum": 15, "spo2": 97, "ates": 36.7, "egzersiz": (12.0, 19.0)},
}

# Mürettebat sağlık görevlisi (Crew Medical Officer) sırası: hasta olan kendine bakamaz.
CMO_SIRASI = ["a5", "a4", "a2", "a1", "a3", "a6"]

# Hastalığa özgü ataklar. etki: tam şiddette dinlenme değerine eklenen miktar.
OLAYLAR = {
    "ilik":      {"k": "ATES_ENFEKSIYON", "etki": {"ates": 1.7, "nabiz": 34, "solunum": 7, "sistolik": -12, "diyastolik": -6, "spo2": -1}},
    "pihti":     {"k": "PIHTI_EMBOLI",    "etki": {"nabiz": 46, "solunum": 13, "spo2": -8, "sistolik": -14, "diyastolik": -6, "ates": 0.4}},
    "aritmi":    {"k": "AF_ATAK",         "etki": {"nabiz": 66, "sistolik": -20, "diyastolik": -10, "solunum": 4, "spo2": -1}},
    "osteopeni": {"k": "KIRIK_AGRI",      "etki": {"nabiz": 32, "sistolik": 46, "diyastolik": 16, "solunum": 6}},
    "bobrek":    {"k": "BOBREK_SANCI",    "etki": {"nabiz": 40, "sistolik": 52, "diyastolik": 18, "solunum": 6, "ates": 0.5}},
    "katarakt":  {"k": "HIPERTANSIF",     "etki": {"sistolik": 44, "diyastolik": 24, "nabiz": 14, "solunum": 2}},
}

TABAN_OLAY_SAAT = 0.004   # sakin ortamda saatlik atak olasılığı (~10 günde bir) — VARSAYIM
BLOK = 1800               # olasılık 30 dakikalık bloklar için çekilir
ZORLA_SURE = 12 * 60      # "simüle et" düğmesiyle başlatılan atağın süresi
RISK_ESIK = 70            # kişisel risk bu değere ulaşınca atak (ve alarm) kendiliğinden başlar
RASTGELE_OLAY = False     # True: risk 70'in altındayken de düşük olasılıkla rastgele atak olur

ALANLAR = ("nabiz", "sistolik", "diyastolik", "solunum", "spo2", "ates")


# ------------------------------------------------------------------ deterministik gürültü
def _r(*p):
    h = hashlib.blake2b(repr(p).encode(), digest_size=8).digest()
    return int.from_bytes(h, "big") / 2 ** 64


def _gurultu(aid, ad, t, periyot=60.0):
    m = t / periyot
    m0 = math.floor(m)
    f = m - m0
    a, b = _r(aid, ad, m0) * 2 - 1, _r(aid, ad, m0 + 1) * 2 - 1
    w = (1 - math.cos(math.pi * f)) / 2
    return a + (b - a) * w


def _rampa(t, bas, son, kenar=180.0):
    if t < bas or t >= son:
        return 0.0
    return max(0.0, min(1.0, (t - bas) / kenar, (son - t) / kenar))


# ------------------------------------------------------------------ atak zamanlaması
_zorla = {}          # (mod, id) -> (başlangıç, bitiş)
_kilit = threading.Lock()


def zorla(mod, aid, simdi=None):
    simdi = simdi or time.time()
    with _kilit:
        _zorla[(mod, aid)] = (simdi, simdi + ZORLA_SURE)


_risk_bas = {}       # (mod, id) -> riskin 70'e ulaştığı ilk an


def risk_takip(mod, aid, risk, simdi):
    """Risk eşiği aşıldıysa atağın başlangıç anını döndürür; risk düştüyse kaydı siler."""
    with _kilit:
        if risk >= RISK_ESIK:
            return _risk_bas.setdefault((mod, aid), simdi)
        _risk_bas.pop((mod, aid), None)
        return None


def _olay_olasiligi(a, risk, ortam, eva):
    """Saatlik atak olasılığı: kişisel risk ve ortamla artar."""
    p = TABAN_OLAY_SAAT * (1 + 12 * (max(0, risk) / 100.0) ** 2)
    S, G, cme = ortam.get("S", 0), ortam.get("G", 0), ortam.get("cme_varis", False)
    h = a["hastalik"]
    if h == "ilik" and S >= 2:
        p *= 3
    if h in ("pihti", "bobrek") and S >= 1:      # sığınakta hareketsizlik, az sıvı
        p *= 3 if h == "pihti" else 2
    if h == "aritmi" and (G >= 3 or cme):
        p *= 2.5
    if h in ("aritmi", "osteopeni") and eva:
        p *= 2 if h == "aritmi" else 3
    if h == "katarakt" and S >= 1:               # stres → tansiyon
        p *= 2
    return min(0.5, p)


def _aktif_olay(mod, a, t, risk, ortam, eva, risk_bas=None):
    """(şiddet 0-1, başlangıç) ya da (0, None)."""
    aid = a["id"]
    with _kilit:
        z = _zorla.get((mod, aid))
    if z and z[0] <= t < z[1]:
        return _rampa(t, z[0], z[1], 90.0), z[0]
    if risk_bas is not None and t >= risk_bas:          # risk 70+: atak sürer, risk düşünce biter
        return min(1.0, (t - risk_bas) / 90.0 + 0.35), risk_bas
    if not RASTGELE_OLAY:
        return 0.0, None
    p_blok = _olay_olasiligi(a, risk, ortam, eva) / 2
    b = math.floor(t / BLOK)
    for bb in (b, b - 1):
        if _r(aid, "olay", mod, bb) < p_blok:
            bas = bb * BLOK + _r(aid, "bas", mod, bb) * 600
            son = bas + 900 + _r(aid, "sure", mod, bb) * 900
            s = _rampa(t, bas, son)
            if s > 0:
                return s, bas
    return 0.0, None


# ------------------------------------------------------------------ bir anın bulguları
def _gmt_saat(t):
    d = datetime.fromtimestamp(t, timezone.utc)
    return d.hour + d.minute / 60 + d.second / 3600


def bulgular(mod, a, t, risk, ortam, eva=False, risk_bas=None):
    f = FIZYOLOJI[a["id"]]
    aid, yas = a["id"], a["yas"]
    v = {k: float(f[k]) for k in ALANLAR}
    saat = _gmt_saat(t)
    uyku = saat >= 21.5 or saat < 6.0
    egz = 0.0
    for e in f["egzersiz"]:
        fark = (saat - e) % 24
        if fark < 1.0:
            egz = max(egz, min(1.0, fark * 12, (1.0 - fark) * 12))   # 5 dk ısınma/soğuma
    S, G = ortam.get("S", 0), ortam.get("G", 0)
    siginak = S >= 1 and not egz

    if uyku and not siginak:
        v["nabiz"] -= 7; v["sistolik"] -= 8; v["diyastolik"] -= 5; v["solunum"] -= 2; v["ates"] -= 0.3
    if egz:
        hedef = 0.62 * (220 - yas)
        v["nabiz"] += egz * (hedef - f["nabiz"]); v["sistolik"] += egz * 18; v["diyastolik"] += egz * 2
        v["solunum"] += egz * 8; v["ates"] += egz * 0.4; v["spo2"] -= egz * 1
    # Uzay havası: sığınakta bekleme stresi, fırtına/CME günü iş yükü
    if siginak:
        v["nabiz"] += 6; v["sistolik"] += 6; v["diyastolik"] += 4; v["solunum"] += 1
    if G >= 3:
        v["nabiz"] += 3; v["sistolik"] += 3
    if ortam.get("cme_varis"):
        v["nabiz"] += 2; v["sistolik"] += 2
    if eva and not uyku:
        v["nabiz"] += 8; v["sistolik"] += 5; v["solunum"] += 2

    siddet, olay_bas = _aktif_olay(mod, a, t, risk, ortam, eva, risk_bas)
    olay = OLAYLAR[a["hastalik"]]
    if siddet > 0:
        for k, d in olay["etki"].items():
            v[k] += siddet * d

    # Doğal dalgalanma
    v["nabiz"] += 3 * _gurultu(aid, "n", t) + 1.5 * _gurultu(aid, "n2", t, 11)
    v["sistolik"] += 4 * _gurultu(aid, "s", t, 90)
    v["diyastolik"] += 3 * _gurultu(aid, "d", t, 90)
    v["solunum"] += 1.0 * _gurultu(aid, "r", t, 45)
    v["spo2"] += 0.6 * _gurultu(aid, "o", t, 120)
    v["ates"] += 0.08 * _gurultu(aid, "t", t, 300)
    duzensiz = a["hastalik"] == "aritmi" and siddet > 0.3
    if duzensiz:   # AF: düzensiz ve hızlı ritim
        v["nabiz"] += 10 * _gurultu(aid, "af", t, 4)

    out = {
        "nabiz": int(round(v["nabiz"])), "sistolik": int(round(v["sistolik"])),
        "diyastolik": int(round(v["diyastolik"])), "solunum": int(round(v["solunum"])),
        "spo2": int(round(min(100, v["spo2"]))), "ates": round(v["ates"], 1),
        "ritim": "duzensiz" if duzensiz else "duzenli",
        "aktivite": "egzersiz" if egz > 0.5 else ("siginak" if siginak else ("uyku" if uyku else "gorev")),
        "olay": olay["k"] if siddet > 0.25 else None,
        "olay_baslangic": int(olay_bas) if (olay_bas and siddet > 0.25) else None,
    }
    out["durum"], out["sorunlar"] = degerlendir(out, yas)
    out["sinir"] = sinirlar(yas, out["aktivite"])
    out["seviye"] = "zarar" if "zarar" in out["durum"].values() else ("dikkat" if "dikkat" in out["durum"].values() else "normal")
    return out


# ------------------------------------------------------------------ sınırlar
def sinirlar(yas, aktivite):
    """(dikkat, zarar) sınırları. Egzersizde nabız ve tansiyon için yaşa göre geniş sınır."""
    egz = aktivite == "egzersiz"
    mx = 220 - yas
    return {
        "nabiz_ust": (round(0.80 * mx), round(0.92 * mx)) if egz else (100, 120),
        "nabiz_alt": (45 if aktivite == "uyku" else 50, 40),
        "sistolik_ust": (180, 200) if egz else (140, 160),
        "sistolik_alt": (100, 90),
        "diyastolik_ust": (90, 100),
        "solunum_ust": (30, 40) if egz else (20, 24),
        "solunum_alt": (9 if aktivite == "uyku" else 10, 8),
        "spo2_alt": (95, 92),
        "ates_ust": (37.6, 38.0),
        "ates_alt": (36.0, 35.5),
    }


def degerlendir(v, yas):
    s = sinirlar(yas, v["aktivite"])
    durum = {k: "normal" for k in ("nabiz", "tansiyon", "solunum", "spo2", "ates")}
    sorunlar = []

    def isle(alan, kod, deger, sinir, ust):
        d, z = sinir
        asim_z = deger > z if ust else deger < z
        asim_d = deger > d if ust else deger < d
        if asim_z:
            durum[alan] = "zarar"
            sorunlar.append({"k": kod, "deger": deger, "sinir": z})
        elif asim_d and durum[alan] != "zarar":
            durum[alan] = "dikkat"

    isle("nabiz", "NABIZ_YUKSEK", v["nabiz"], s["nabiz_ust"], True)
    isle("nabiz", "NABIZ_DUSUK", v["nabiz"], s["nabiz_alt"], False)
    isle("tansiyon", "TANSIYON_YUKSEK", v["sistolik"], s["sistolik_ust"], True)
    isle("tansiyon", "TANSIYON_DUSUK", v["sistolik"], s["sistolik_alt"], False)
    isle("tansiyon", "DIYASTOLIK_YUKSEK", v["diyastolik"], s["diyastolik_ust"], True)
    isle("solunum", "SOLUNUM_YUKSEK", v["solunum"], s["solunum_ust"], True)
    isle("solunum", "SOLUNUM_DUSUK", v["solunum"], s["solunum_alt"], False)
    isle("spo2", "SPO2_DUSUK", v["spo2"], s["spo2_alt"], False)
    isle("ates", "ATES_YUKSEK", v["ates"], s["ates_ust"], True)
    isle("ates", "ATES_DUSUK", v["ates"], s["ates_alt"], False)
    return durum, sorunlar


# ------------------------------------------------------------------ öneriler (kayıt dosyası için TR)
SORUN_AD = {
    "NABIZ_YUKSEK": "Nabız yüksek (taşikardi)", "NABIZ_DUSUK": "Nabız düşük (bradikardi)",
    "TANSIYON_YUKSEK": "Tansiyon yüksek", "TANSIYON_DUSUK": "Tansiyon düşük (hipotansiyon)",
    "DIYASTOLIK_YUKSEK": "Küçük tansiyon yüksek", "SOLUNUM_YUKSEK": "Solunum hızlı",
    "SOLUNUM_DUSUK": "Solunum yavaş", "SPO2_DUSUK": "Kandaki oksijen düşük",
    "ATES_YUKSEK": "Ateş", "ATES_DUSUK": "Vücut ısısı düşük",
}
AKTIVITE_AD = {"uyku": "uyku", "egzersiz": "egzersiz", "siginak": "korunaklı alanda bekleme", "gorev": "olağan görev"}
OLAY_AD = {
    "ATES_ENFEKSIYON": "Ateş ve hızlı nabız: enfeksiyon / kan sayımı düşüklüğü şüphesi",
    "PIHTI_EMBOLI": "Hızlı solunum ve düşük oksijen: pıhtı / akciğer embolisi şüphesi",
    "AF_ATAK": "Hızlı ve düzensiz nabız: atriyal fibrilasyon atağı",
    "KIRIK_AGRI": "Ani ağrı, yüksek tansiyon ve nabız: kırık şüphesi",
    "BOBREK_SANCI": "Şiddetli yan ağrısı, yüksek tansiyon: böbrek taşı sancısı şüphesi",
    "HIPERTANSIF": "Tansiyon yükselmesi (hipertansif atak)",
}
ONERI = {
    "AF_ATAK": {
        "yontem": ["İşi hemen bıraktır, sabitlenmiş şekilde dinlendir.",
                   "EKG/Holter kaydını başlat; nabız ve tansiyonu 5 dakikada bir ölç.",
                   "Ağızdan sıvı ver; kafeinli içecek verme.",
                   "Uçuş hekimiyle (Mission Control) hemen bağlantı kur."],
        "ilac": ["Uçuş hekimi onayıyla nabız hızını düşüren ilaç (ör. beta bloker).",
                 "Atak 48 saati aşarsa pıhtı önleyici ilaç uçuş hekimince değerlendirilir."],
        "acil": ["Göğüs ağrısı, bayılma ya da büyük tansiyon 90'ın altına inerse defibrilatörü (AED) hazırla."],
    },
    "PIHTI_EMBOLI": {
        "yontem": ["Hareket ettirme; yarı oturur pozisyonda sabitle.",
                   "Oksijen ver; SpO2 ve solunumu sürekli izle.",
                   "Boyun ve bacak venlerine ultrason yap (uçuş hekimi yönlendirmesiyle).",
                   "Uçuş hekimiyle acil bağlantı kur."],
        "ilac": ["Uçuş hekimi onayıyla kan sulandırıcı (bilinen ISS vakasında enoksaparin, ardından apiksaban kullanıldı).",
                 "Kanama riski yüzünden hekime sormadan aspirin ya da başka ağrı kesici verme."],
        "acil": ["SpO2 %90'ın altına iner ya da tansiyon düşerse acil dönüş değerlendirilsin."],
    },
    "ATES_ENFEKSIYON": {
        "yontem": ["Ayrı bir bölümde dinlendir; ortak alanları ve yüzeyleri dezenfekte et.",
                   "Ateş, nabız ve tansiyonu 30 dakikada bir ölç.",
                   "Bol sıvı ver; planlı kan örneğini al ve belirtileri kaydet (morarma, kanama, halsizlik).",
                   "Uçuş hekimine bildir."],
        "ilac": ["Ateş için parasetamol (uçuş hekimi onayıyla).",
                 "Enfeksiyon şüphesinde antibiyotiği uçuş hekimi seçer.",
                 "Kemik iliği öyküsü nedeniyle aspirin ve NSAİİ verme (kanama riski)."],
        "acil": ["Ateş 39 °C'yi geçerse, bilinç bulanıklaşır ya da tansiyon düşerse acil değerlendirme."],
    },
    "BOBREK_SANCI": {
        "yontem": ["Sıvıyı artır (günlük idrar ≥ 2,5 L hedefi).",
                   "Ultrasonla böbrek ve idrar yolunu kontrol et (uçuş hekimi yönlendirmesiyle).",
                   "Ağrı şiddetini ve idrarda kanı kaydet."],
        "ilac": ["Uçuş hekimi onayıyla ağrı kesici.",
                 "Taşın düşmesine yardım için alfa bloker (ör. tamsulosin) uçuş hekimince değerlendirilir.",
                 "Bulantı varsa bulantı önleyici."],
        "acil": ["Ateş + ağrı (enfeksiyon) ya da idrar çıkışı durursa acil dönüş değerlendirilsin."],
    },
    "KIRIK_AGRI": {
        "yontem": ["Ağrıyan bölgeyi hareket ettirme; atelle sabitle.",
                   "Ultrasonla kırık şüphesini değerlendir (uçuş hekimi yönlendirmesiyle).",
                   "Egzersiz ve EVA programını durdur."],
        "ilac": ["Ağrı için parasetamol (uçuş hekimi onayıyla).",
                 "Güçlü ağrı kesici gerekip gerekmediğine uçuş hekimi karar verir."],
        "acil": ["Kol veya bacakta his kaybı, renk değişikliği ya da şiddetli şişlik olursa acil değerlendirme."],
    },
    "HIPERTANSIF": {
        "yontem": ["Sakin bir bölümde dinlendir; 15 dakika sonra tansiyonu tekrar ölç.",
                   "Baş ağrısı, görme değişikliği, göğüs ağrısı var mı sor.",
                   "Tuzlu yiyecekleri ve kafeini kes."],
        "ilac": ["Tansiyon yüksek kalırsa uçuş hekimi onayıyla tansiyon düşürücü ilaç."],
        "acil": ["Tansiyon 180/110'u geçerse ya da ani görme kaybı, göğüs ağrısı, konuşma bozukluğu olursa acil değerlendirme."],
    },
    "GENEL": {
        "yontem": ["Dinlendir; bulguları 5 dakikada bir ölç.", "Uçuş hekimine bildir."],
        "ilac": ["İlaç kararını uçuş hekimi verir."],
        "acil": ["Bulgular kötüleşirse acil değerlendirme."],
    },
}


# ------------------------------------------------------------------ alarm kaydı
_aktif = {}           # (mod, id) -> alarm
_son_zarar = {}       # (mod, id) -> son zararlı zaman
_kayitlar = deque(maxlen=40)
_kayit_hatasi = {"mesaj": None}


def kayit_dosyasi():
    a = kaynaklar.ayarlar()
    yol = os.environ.get("ASTRO_KAYIT_DOSYASI") or a.get("saglik_kayit_dosyasi") or "kayitlar/saglik_alarmlari.txt"
    p = Path(os.path.expanduser(str(yol)))
    if not p.is_absolute():
        p = kaynaklar.BASE_DIR / p
    return p


def _yaz(metin):
    p = kayit_dosyasi()
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
        with open(p, "a", encoding="utf-8") as f:
            f.write(metin)
        _kayit_hatasi["mesaj"] = None
    except OSError as e:
        _kayit_hatasi["mesaj"] = f"{p}: {e}"


def _bulgu_metni(v):
    ritim = " (düzensiz)" if v["ritim"] == "duzensiz" else ""
    return (f"Nabız {v['nabiz']}/dk{ritim} · Tansiyon {v['sistolik']}/{v['diyastolik']} mmHg · "
            f"Solunum {v['solunum']}/dk · SpO2 %{v['spo2']} · Vücut ısısı {str(v['ates']).replace('.', ',')} °C")


def _sorumlular(hasta_id, alarmdakiler):
    adaylar = [i for i in CMO_SIRASI if i != hasta_id and i not in alarmdakiler]
    ad = {a["id"]: a for a in hastalik.ASTRONOTLAR}
    s = adaylar[0] if adaylar else None
    y = adaylar[1] if len(adaylar) > 1 else None
    f = lambda i: {"id": i, "ad": ad[i]["ad"]} if i else None  # noqa: E731
    return f(s), f(y)


def izle(mod, sonuc, ortam_ozet, simdi=None):
    """sonuc: {id: bulgular}. Kişisel risk 70+ ya da zararlı bulguda ALARM; ikisi de geçince DÜZELDİ kaydı yazar."""
    simdi = simdi or time.time()
    ad = {a["id"]: a for a in hastalik.ASTRONOTLAR}
    tetik = lambda v: v["seviye"] == "zarar" or (v.get("risk") or 0) >= RISK_ESIK  # noqa: E731
    hastalar = {k[1] for k in _aktif if k[0] == mod} | {i for i, v in sonuc.items() if tetik(v)}
    for aid, v in sonuc.items():
        key = (mod, aid)
        if tetik(v):
            _son_zarar[key] = simdi
            if key in _aktif:                      # açık alarm: kartta anlık değerler görünsün
                al = _aktif[key]
                al["sorunlar"] = v["sorunlar"]
                al["bulgular"] = {k: v[k] for k in ALANLAR + ("ritim", "aktivite")}
                al["risk"] = v.get("risk")
                if v["olay"]:
                    al["olay"] = v["olay"]
            else:
                sorumlu, yardimci = _sorumlular(aid, hastalar)
                kod = v["olay"] or (OLAYLAR[ad[aid]["hastalik"]]["k"] if (v.get("risk") or 0) >= RISK_ESIK else "GENEL")
                a = ad[aid]
                alarm = {"alarm_id": f"{mod}-{aid}-{int(simdi)}", "mod": mod, "id": aid, "ad": a["ad"], "yas": a["yas"],
                         "hastalik": a["hastalik"], "baslangic": int(simdi), "olay": kod,
                         "sorunlar": v["sorunlar"], "bulgular": {k: v[k] for k in ALANLAR + ("ritim", "aktivite")},
                         "risk": v.get("risk"), "sorumlu": sorumlu, "yardimci": yardimci}
                _aktif[key] = alarm
                _kayitlar.appendleft({"zaman": int(simdi), "tur": "ALARM", "mod": mod, "id": aid, "ad": a["ad"],
                                      "yas": a["yas"], "olay": kod, "sorunlar": [s["k"] for s in v["sorunlar"]]})
                _yaz(_alarm_metni(alarm, v, ortam_ozet))
        elif key in _aktif and simdi - _son_zarar.get(key, 0) > 60:
            alarm = _aktif.pop(key)
            sure = max(1, round((simdi - alarm["baslangic"]) / 60))
            a = ad[aid]
            _kayitlar.appendleft({"zaman": int(simdi), "tur": "DUZELDI", "mod": mod, "id": aid, "ad": a["ad"],
                                  "yas": a["yas"], "olay": alarm["olay"], "sure_dk": sure})
            _yaz(f"[{_zaman(simdi)}] DÜZELDİ — {a['ad']} ({a['yas']} yaş){_mod_etiket(mod)} — kişisel risk "
                 f"{v.get('risk', '?')}/100'e indi, bulgular güvenli aralığa döndü ({sure} dk sürdü). Şimdi: {_bulgu_metni(v)}\n\n")


def _zaman(t):
    return datetime.fromtimestamp(t, timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")


def _mod_etiket(mod):
    return " [Senaryo: Mayıs 2024]" if mod == "mayis2024" else ""


def _alarm_metni(alarm, v, ortam):
    o = ONERI.get(alarm["olay"], ONERI["GENEL"])
    satirlar = [
        f"[{_zaman(alarm['baslangic'])}] ALARM — {alarm['ad']} ({alarm['yas']} yaş){_mod_etiket(alarm['mod'])}",
        f"  Sorun: {OLAY_AD.get(alarm['olay'], 'Yaşamsal bulgu güvenli aralığın dışında')}",
        f"  Bulgular: {_bulgu_metni(v)}",
        ("  Zararlı aralıkta: " + "; ".join(f"{SORUN_AD[s['k']]} ({str(s['deger']).replace('.', ',')}, sınır "
                                             f"{str(s['sinir']).replace('.', ',')})" for s in alarm["sorunlar"]))
        if alarm["sorunlar"] else "  Zararlı aralıkta: henüz yok (alarm kişisel risk nedeniyle açıldı)",
        f"  Tetikleyen: kişisel risk {v.get('risk', '?')}/100" + (f" (eşik {RISK_ESIK})" if (v.get("risk") or 0) >= RISK_ESIK else ""),
        f"  Ortam: {ortam} · Kişisel risk {v.get('risk', '?')}/100 · Etkinlik: {AKTIVITE_AD.get(v['aktivite'], v['aktivite'])}",
    ]
    if alarm["sorumlu"]:
        kim = alarm["sorumlu"]["ad"] + " (sağlık görevlisi)"
        if alarm["yardimci"]:
            kim += " ve " + alarm["yardimci"]["ad"]
        satirlar.append(f"  Mürettebata öneri — {kim}:")
    satirlar += ["    Yöntem: " + y for y in o["yontem"]]
    satirlar += ["    İlaç:   " + y for y in o["ilac"]]
    satirlar += ["    Acil:   " + y for y in o["acil"]]
    if v.get("acil_donus"):
        satirlar.append(f"  Dünya'ya dönüş gerekirse en erken uygun tarih: {v['acil_donus']} "
                        "(proton olayı olmayan ilk gün; acil durumda ilk uygun araçla).")
    satirlar.append("  Not: Eğitsel simülasyon; ilaç ve dozu her zaman uçuş hekimi belirler.")
    return "\n".join(satirlar) + "\n\n"


def aktif_alarmlar(mod):
    return [a for k, a in _aktif.items() if k[0] == mod]


def son_kayitlar(mod):
    return [k for k in _kayitlar if k["mod"] == mod][:15]


def kayit_hatasi():
    return _kayit_hatasi["mesaj"]


# ------------------------------------------------------------------ toplu hesap
def hepsi(mod, riskler, ortam, eva=False, simdi=None, gecmis_dk=60):
    """Tüm astronotlar: anlık bulgular + son gecmis_dk dakikanın dakikalık seyri."""
    simdi = simdi or time.time()
    out = []
    for a in hastalik.ASTRONOTLAR:
        risk = riskler.get(a["id"], 0)
        rb = risk_takip(mod, a["id"], risk, simdi)
        an = bulgular(mod, a, simdi, risk, ortam, eva, rb)
        seri = {k: [] for k in ("nabiz", "sistolik", "diyastolik", "solunum", "spo2", "ates")}
        if gecmis_dk:
            t0 = math.floor(simdi / 60) * 60
            for i in range(gecmis_dk - 1, -1, -1):
                b = bulgular(mod, a, t0 - i * 60, risk, ortam, eva, rb)
                for k in seri:
                    seri[k].append(b[k])
        out.append({"id": a["id"], "ad": a["ad"], "yas": a["yas"], "cinsiyet": FIZYOLOJI[a["id"]]["cinsiyet"],
                    "hastalik": a["hastalik"], "risk": risk, "an": an, "seri": seri,
                    "dinlenme": {k: FIZYOLOJI[a["id"]][k] for k in ALANLAR}})
    return out
