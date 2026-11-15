"""Hastalık öyküsü olan astronotlar için kişisel risk modeli (EĞİTSEL MODEL).

Her (kurgusal) mürettebat üyesinin uçuşa engel olmayan ama ortama göre
kötüleşebilecek bir sağlık durumu vardır. Model üç şeyi birleştirir:

  1) Son 10 günün gözlenen uzay havası  (NOAA Kp, GOES proton, DONKI FLR/CME/SEP/GST)
  2) Bugünün ISS verisi                   (bölge, önümüzdeki 24 saatteki SAA süresi)
  3) Önümüzdeki 7 günün tahmini           (NOAA 3 günlük Kp + olasılıklar, 27 günlük görünüm,
                                           DONKI CME varış tahmini, yoksa 10 günlük eğilim)

ve bunları hastalığa özgü duyarlılık ağırlıklarıyla kişisel bir 0-100 risk puanına çevirir.
Ağırlıklar literatüre dayanan NİTEL seçimlerdir (kaynaklar arayüzde listelenir); klinik
olarak doğrulanmış değildir. Gerçek kararlar uçuş hekimi (flight surgeon) tarafından verilir.

Metin döndürülmez: kodlar ve sayılar döner, arayüz TR/EN çevirir.
"""
import math
import time
from datetime import date, datetime, timedelta, timezone
from statistics import median

import analiz
import yorunge

GECMIS_GUN = 10
TAHMIN_GUN = 7
T_SKOR_ESIK = -2.5           # WHO: T-skoru <= -2,5 osteoporoz
KEMIK_KAYBI_ONLEMLI = 1.0    # %/ay — NASA'nın verdiği 1-1,5 aralığının alt ucu (ARED + ilaç varsayımı)
SIGINAK_GUN_EK_KAYIP = 0.05  # egzersiz yapılamayan sığınak günü başına ek %BMD kaybı (VARSAYIM)

# Duyarlılık ağırlıkları (0-1). rad: akut proton/SAA radyasyonu, G: jeomanyetik fırtına
# (yüksek enlem geçişlerinde artan doz), R: radyo/X-ışını patlaması, cme: CME varış günü iş yükü,
# akut: ortam bu hastalıkta saatler içinde ciddi bir tabloya yol açabilir mi? (değilse en fazla
# "dönüşü planla" önerilir; ör. katarakt uzun vadeli bir risktir, acil dönüş gerektirmez)
# siginak: korunaklı alanda saatlerce kalma (hareketsizlik, egzersiz/sıvı kaybı, uyku bölünmesi),
# kum: birikimli doz, mg: mikroyerçekimi süresi, eva: uzay yürüyüşü.
HASTALIKLAR = {
    "ilik":      {"akut": True, "rad": 0.95, "G": 0.25, "R": 0.05, "cme": 0.20, "siginak": 0.10, "kum": 0.90, "mg": 0.25, "eva": 0.80,
                  "osdr": "radyasyon_dna"},
    "pihti":     {"akut": True, "rad": 0.05, "G": 0.00, "R": 0.00, "cme": 0.05, "siginak": 0.35, "kum": 0.00, "mg": 0.80, "eva": 0.50,
                  "osdr": "kalp"},
    "aritmi":    {"akut": True, "rad": 0.15, "G": 0.30, "R": 0.00, "cme": 0.15, "siginak": 0.30, "kum": 0.20, "mg": 0.75, "eva": 0.90,
                  "osdr": "kalp"},
    "osteopeni": {"akut": False, "rad": 0.05, "G": 0.00, "R": 0.00, "cme": 0.00, "siginak": 0.30, "kum": 0.05, "mg": 0.95, "eva": 0.60,
                  "osdr": "kemik"},
    "bobrek":    {"akut": False, "rad": 0.00, "G": 0.00, "R": 0.00, "cme": 0.00, "siginak": 0.35, "kum": 0.00, "mg": 0.75, "eva": 0.55,
                  "osdr": "kemik"},
    "katarakt":  {"akut": False, "rad": 0.60, "G": 0.25, "R": 0.05, "cme": 0.10, "siginak": 0.05, "kum": 0.85, "mg": 0.20, "eva": 0.70,
                  "osdr": "goz"},
}

# Kurgusal mürettebat. Adlar, yaşlar ve öyküler hayalidir; gerçek kişilerle ilgisi yoktur.
ASTRONOTLAR = [
    {"id": "a1", "ad": "Deniz Aksoy", "yas": 38, "ulke": "TR", "hastalik": "ilik",
     "gorev_gunu": 64, "gorev_suresi": 180, "onceki_doz_msv": 0.0},
    {"id": "a2", "ad": "Marcus Hale", "yas": 47, "ulke": "US", "hastalik": "pihti",
     "gorev_gunu": 52, "gorev_suresi": 180, "onceki_doz_msv": 42.0},
    {"id": "a3", "ad": "Yuki Tanaka", "yas": 54, "ulke": "JP", "hastalik": "aritmi",
     "gorev_gunu": 140, "gorev_suresi": 190, "onceki_doz_msv": 60.0},
    {"id": "a4", "ad": "Sofia Marín", "yas": 51, "ulke": "ES", "hastalik": "osteopeni",
     "gorev_gunu": 120, "gorev_suresi": 200, "onceki_doz_msv": 0.0, "t_skor_ucus_oncesi": -1.7},
    {"id": "a5", "ad": "Lars Eriksen", "yas": 36, "ulke": "NO", "hastalik": "bobrek",
     "gorev_gunu": 33, "gorev_suresi": 180, "onceki_doz_msv": 0.0},
    {"id": "a6", "ad": "Amara Okafor", "yas": 57, "ulke": "NG", "hastalik": "katarakt",
     "gorev_gunu": 160, "gorev_suresi": 185, "onceki_doz_msv": 95.0},
]

S_RAD = {0: 0.0, 1: 0.5, 2: 0.75, 3: 1.0, 4: 1.0, 5: 1.0}


def _iso(d):
    return d.isoformat()


# ================================================================ uzay havası: günlük tablo

def _gunluk_kp(ham):
    """Gözlenen Kp (NOAA, ~7 gün) + DONKI GST Kp değerleri (10 gün) -> gün başına en yüksek Kp."""
    gun = {}
    for k in analiz.kp_listesi(ham.get("kp")):
        g = k["t"].date().isoformat()
        gun[g] = max(gun.get(g, 0.0), k["kp"])
    for k in analiz.kp_listesi(ham.get("kp_tahmin")):
        if k["gozlem"]:
            g = k["t"].date().isoformat()
            gun[g] = max(gun.get(g, 0.0), k["kp"])
    for gst in ham.get("GST") or []:
        if not isinstance(gst, dict):
            continue
        for k in gst.get("allKpIndex") or []:
            t = analiz.parse_time((k or {}).get("observedTime"))
            v = (k or {}).get("kpIndex")
            if t and isinstance(v, (int, float)):
                g = t.date().isoformat()
                gun[g] = max(gun.get(g, 0.0), float(v))
    return gun


def _tahmin_kp(ham):
    """NOAA 3 günlük tahmin: yalnızca 'predicted' kayıtlar, gün başına en yüksek Kp."""
    gun = {}
    for k in analiz.kp_listesi(ham.get("kp_tahmin")):
        if not k["gozlem"]:
            g = k["t"].date().isoformat()
            gun[g] = max(gun.get(g, 0.0), k["kp"])
    return gun


def _olasiliklar(veri):
    """solar_probabilities.json -> en güncel kaydın 1/2/3 günlük olasılıkları (0-1)."""
    if not isinstance(veri, list) or not veri:
        return None
    kayitlar = [d for d in veri if isinstance(d, dict)]
    if not kayitlar:
        return None
    son = max(kayitlar, key=lambda d: str(d.get("date") or d.get("time_tag") or ""))

    def p(alan):
        try:
            return max(0.0, min(1.0, float(son.get(alan)) / 100.0))
        except (TypeError, ValueError):
            return None
    out = {"tarih": str(son.get("date") or son.get("time_tag") or "")[:10]}
    for i in (1, 2, 3):
        out[f"proton_{i}"] = p(f"10mev_protons_{i}_day")
        out[f"m_{i}"] = p(f"m_class_{i}_day")
        out[f"x_{i}"] = p(f"x_class_{i}_day")
    if all(out[f"proton_{i}"] is None for i in (1, 2, 3)):
        return None
    return out


def _gun_tablosu(hava, ham, simdi):
    """Son 10 gün + bugün + 7 gün için gün gün uzay havası özeti."""
    bugun = simdi.date()
    kp_gun = _gunluk_kp(ham)
    kp_tah = _tahmin_kp(ham)
    t27 = {r["tarih"]: r for r in (ham.get("noaa_27g") or []) if isinstance(r, dict) and "tarih" in r}
    ol = _olasiliklar(ham.get("olasilik"))

    proton = {}
    for r in ham.get("proton_7g") or []:
        if isinstance(r, dict) and r.get("tarih"):
            proton[r["tarih"]] = max(proton.get(r["tarih"], 0.0), float(r.get("max_pfu") or 0))
    for t, f in analiz.proton_serisi(ham.get("proton")):
        g = t.date().isoformat()
        proton[g] = max(proton.get(g, 0.0), f)

    sep_gun = set()
    for s in ham.get("SEP") or []:
        t = analiz.parse_time((s or {}).get("eventTime")) if isinstance(s, dict) else None
        if t:
            sep_gun.add(t.date().isoformat())

    flr_gun = {}
    for f in ham.get("FLR") or []:
        if not isinstance(f, dict):
            continue
        t = analiz.parse_time(f.get("peakTime") or f.get("beginTime"))
        if not t:
            continue
        g = t.date().isoformat()
        d = flr_gun.setdefault(g, {"M": 0, "X": 0, "R": 0, "en_buyuk": None})
        sinif = (f.get("classType") or "").upper()
        if sinif.startswith("M"):
            d["M"] += 1
        elif sinif.startswith("X"):
            d["X"] += 1
        r = analiz.sinif_r(sinif)
        if r >= d["R"]:
            d["R"], d["en_buyuk"] = r, sinif or d["en_buyuk"]

    cme_varis = {}
    for c in analiz.cme_varislari(ham.get("CME"), simdi):
        g = c["varis"][:10]
        kp = c.get("kp_tahmin")
        cme_varis[g] = max(cme_varis.get(g, 0.0), float(kp) if isinstance(kp, (int, float)) else 5.0)
    cme_cikis = {}
    for c in ham.get("CME") or []:
        t = analiz.parse_time((c or {}).get("startTime")) if isinstance(c, dict) else None
        if t:
            g = t.date().isoformat()
            cme_cikis[g] = cme_cikis.get(g, 0) + 1

    gecmis = []
    for i in range(GECMIS_GUN, 0, -1):
        g = (bugun - timedelta(days=i)).isoformat()
        gecmis.append(_gozlem_gunu(g, kp_gun, proton, sep_gun, flr_gun, cme_varis, cme_cikis))

    # --- 10 günlük eğilim ve etkinlik
    m10 = sum(flr_gun.get(r["tarih"], {}).get("M", 0) for r in gecmis)
    x10 = sum(flr_gun.get(r["tarih"], {}).get("X", 0) for r in gecmis)
    bilinen_kp = [r["kp_max"] for r in gecmis if r["kp_max"] is not None]
    kp_kalici = median(bilinen_kp) if bilinen_kp else 2.0
    ilk, son = [r["cevre"] for r in gecmis[:5]], [r["cevre"] for r in gecmis[5:]]
    fark = (sum(son) / 5) - (sum(ilk) / 5)
    trend = "ARTIYOR" if fark > 6 else ("AZALIYOR" if fark < -6 else "SABIT")
    p_aktivite = min(0.45, 0.02 + 0.012 * (m10 + 10 * x10))  # olasılık verisi yoksa: patlama sıklığına göre

    # --- bugün: anlık değerler + günün gözlem/tahmin Kp'si
    bg = bugun.isoformat()
    bugun_kp = max([v for v in (kp_gun.get(bg), kp_tah.get(bg), hava.get("kp_simdi")) if v is not None], default=None)
    S_simdi = hava.get("S", 0) or 0
    p0 = (ol or {}).get("proton_1")
    bugun_kayit = _gun_kaydi(
        bg, "bugun", "canli", "yuksek", kp=bugun_kp, S=max(S_simdi, 1 if bg in sep_gun else 0),
        R=max(hava.get("R", 0) or 0, flr_gun.get(bg, {}).get("R", 0)),
        p_proton=p0 if p0 is not None else (p_aktivite if not S_simdi else 0.0),
        cme=bg in cme_varis, pfu=proton.get(bg, hava.get("proton_10mev_pfu")))

    # --- tahmin
    tahmin = []
    for d in range(1, TAHMIN_GUN + 1):
        g = (bugun + timedelta(days=d)).isoformat()
        if g in kp_tah:
            kp, kaynak, guven = kp_tah[g], "noaa_3g", "yuksek" if d <= 2 else "orta"
        elif g in t27:
            kp, kaynak, guven = t27[g]["kp_max"], "noaa_27g", "orta" if d <= 4 else "dusuk"
        else:
            kp, kaynak, guven = kp_kalici, "egilim", "dusuk"
        if g in cme_varis:
            kp = max(kp, cme_varis[g])
        if ol and d <= 3 and ol.get(f"proton_{d}") is not None:
            p = ol[f"proton_{d}"]
            pm, px = ol.get(f"m_{d}") or 0.0, ol.get(f"x_{d}") or 0.0
        else:
            ref = (ol or {}).get("proton_3")
            p = (ref if ref is not None else p_aktivite) * (0.8 ** max(0, d - 3))
            pm, px = min(0.9, 0.05 + 0.05 * m10) * (0.85 ** d), min(0.5, 0.01 + 0.08 * x10) * (0.85 ** d)
        S_kalici = max(0, S_simdi - d)        # süren proton olayı ~1 S seviyesi/gün söner (varsayım)
        tahmin.append(_gun_kaydi(g, "tahmin", kaynak, guven, kp=kp, S=S_kalici, R=0,
                                 p_proton=p, p_m=pm, p_x=px, cme=g in cme_varis, pfu=None))
    return {
        "gecmis": gecmis, "bugun": bugun_kayit, "tahmin": tahmin,
        "egilim": {"durum": trend, "fark": round(fark, 1), "m_patlama_10g": m10, "x_patlama_10g": x10,
                   "sep_10g": len([r for r in gecmis if r["S"] >= 1 or r["sep"]]),
                   "cme_10g": sum(r["cme_cikis"] for r in gecmis),
                   "g_gun_10g": len([r for r in gecmis if r["G"] >= 1]),
                   "kp_medyan_10g": round(kp_kalici, 2) if bilinen_kp else None,
                   "olasilik_kaynagi": "noaa" if ol else "patlama_sikligi"},
    }


def _gozlem_gunu(g, kp_gun, proton, sep_gun, flr_gun, cme_varis, cme_cikis):
    pfu = proton.get(g)
    S = analiz.s_seviyesi(pfu)
    if g in sep_gun:
        S = max(S, 1)
    f = flr_gun.get(g, {})
    kayit = _gun_kaydi(g, "gecmis", "gozlem", "yuksek", kp=kp_gun.get(g), S=S, R=f.get("R", 0),
                       p_proton=0.0, cme=g in cme_varis, pfu=pfu)
    kayit.update({"sep": g in sep_gun, "m": f.get("M", 0), "x": f.get("X", 0),
                  "en_buyuk_patlama": f.get("en_buyuk"), "cme_cikis": cme_cikis.get(g, 0),
                  "kp_veri_yok": g not in kp_gun})
    return kayit


def _gun_kaydi(tarih, tur, kaynak, guven, kp, S, R, p_proton, cme, pfu, p_m=0.0, p_x=0.0):
    G = analiz.g_seviyesi(kp)
    e_rad = max(S_RAD[min(5, S)], 0.8 * p_proton)
    e_G = min(1.0, G / 4)
    e_R = min(1.0, R / 3) if tur != "tahmin" else min(1.0, 0.4 * p_m + p_x)
    e_cme = 1.0 if cme else 0.0
    e_sig = 1.0 if S >= 1 else min(1.0, 1.5 * p_proton)
    cevre = round(100 * min(1.0, 0.45 * e_rad + 0.30 * e_G + 0.10 * e_R + 0.15 * e_cme))
    return {"tarih": tarih, "tur": tur, "kaynak": kaynak, "guven": guven,
            "kp_max": None if kp is None else round(kp, 2), "G": G, "S": S, "R": R,
            "proton_max_pfu": None if pfu is None else round(pfu, 3),
            "p_proton": round(p_proton, 3), "cme_varis": bool(cme), "cevre": cevre,
            "_e": {"rad": e_rad, "G": e_G, "R": e_R, "cme": e_cme, "siginak": e_sig}}


# ================================================================ ISS: bugünkü yörünge

_iss_onbellek = {"t": 0, "v": None}


def iss_gunluk(model, simdi_ts=None):
    """Önümüzdeki 24 saatte SAA ve yüksek enlem (|enlem| > 45°) süresi, sıradaki SAA girişi."""
    simdi_ts = simdi_ts or time.time()
    if _iss_onbellek["v"] and simdi_ts - _iss_onbellek["t"] < 60:
        return _iss_onbellek["v"]
    saa_dk = yuksek_dk = 0
    sonraki = None
    onceki = None
    t0 = math.floor(simdi_ts / 60) * 60
    for i in range(24 * 60):
        t = t0 + i * 60
        la, lo = model.position(t)
        b = yorunge.zone_of(la, lo)
        if b == "SAA":
            saa_dk += 1
            if onceki is not None and onceki != "SAA" and sonraki is None and t > simdi_ts:
                sonraki = int(t)
        elif b == "YUKSEK_ENLEM":
            yuksek_dk += 1
        onceki = b
    v = {"saa_dk_24s": saa_dk, "yuksek_enlem_dk_24s": yuksek_dk, "sonraki_saa": sonraki}
    _iss_onbellek.update(t=simdi_ts, v=v)
    return v


# ================================================================ kişisel risk

def _gunluk_doz(kayit, eva=False):
    """Günlük doz (mSv): ISS tabanı x proton olayı çarpanı; tahmin günlerinde beklenen değer."""
    k = {0: 1, 1: 1.5, 2: 3, 3: 6, 4: 15, 5: 30}[min(5, kayit["S"])]
    if kayit["tur"] == "tahmin":
        k = max(k, 1 + 0.5 * kayit["p_proton"])
    k *= 1.1 if kayit["G"] >= 3 else 1.0
    return analiz.ISS_GUNLUK_DOZ_MSV * k


def _e_mg(hastalik, gun, a, siginak_gunleri):
    """Mikroyerçekimine bağlı kronik bileşen (0-1), hastalığa özgü zaman eğrisi."""
    if hastalik == "pihti":       # juguler akım durgunluğu ilk haftalarda başlar; vaka ~2. ayda
        return min(1.0, gun / 60)
    if hastalik == "aritmi":      # sol atriyum hacmi 6 ayda artıyor (Khine 2018)
        return min(1.0, gun / 180)
    if hastalik == "osteopeni":
        t0 = a.get("t_skor_ucus_oncesi", -1.7)
        return max(0.0, min(1.0, (t0 - t_skor(a, gun, siginak_gunleri)) / (t0 - T_SKOR_ESIK)))
    if hastalik == "bobrek":      # idrar kalsiyumu ilk haftalarda yükselir ve uçuş boyunca yüksek kalır
        return min(1.0, 0.7 * min(1.0, gun / 30) + 0.3 * min(1.0, gun / 180))
    return min(1.0, gun / 180) * (0.5 if hastalik == "ilik" else 1.0)


def _e_kum(hastalik, kum_msv):
    if hastalik == "ilik":        # kariyer sınırının yarısına göre ölçeklenir (önceki tedavi -> daha duyarlı)
        return min(1.0, kum_msv / (0.5 * analiz.KARIYER_LIMITI_MSV))
    if hastalik == "katarakt":    # lens dozu ≈ etkin doz (kaba yaklaşım)
        return min(1.0, kum_msv / 250.0)
    return min(1.0, kum_msv / analiz.KARIYER_LIMITI_MSV)


def t_skor(a, gun, siginak_gunleri=0):
    """%1 BMD kaybı ≈ 0,1 SD T-skoru düşüşü (kaba kural)."""
    t0 = a.get("t_skor_ucus_oncesi", -1.7)
    kayip = (gun / 30.4) * KEMIK_KAYBI_ONLEMLI + siginak_gunleri * SIGINAK_GUN_EK_KAYIP
    return t0 - kayip / 10.0


def _skor(a, kayit, gun, kum, siginak_gunleri, eva):
    w = HASTALIKLAR[a["hastalik"]]
    e = kayit["_e"]
    cevre = min(1.0, w["rad"] * e["rad"] * (1.5 if eva else 1.0) + w["G"] * e["G"] + 0.5 * w["R"] * e["R"]
                + 0.5 * w["cme"] * e["cme"] + w["siginak"] * e["siginak"])
    kronik = min(1.0, w["kum"] * _e_kum(a["hastalik"], kum) + w["mg"] * _e_mg(a["hastalik"], gun, a, siginak_gunleri))
    eva_ek = 0.10 * w["eva"] if eva else 0.0
    skor = round(100 * min(1.0, 0.08 + 0.65 * cevre + 0.30 * kronik + eva_ek))
    if a["hastalik"] == "ilik" and kayit["S"] >= 3:
        skor = max(skor, 88)      # kemik iliği öyküsünde S3+ proton olayı: en üst öncelik
    return skor, {"cevre": round(100 * 0.65 * cevre), "kronik": round(100 * 0.30 * kronik), "eva": round(100 * eva_ek)}


def astronot_analizi(a, tablo, iss_gun, eva, bugun):
    w = HASTALIKLAR[a["hastalik"]]
    hastalik = a["hastalik"]
    gunler_kayit = tablo["gecmis"] + [tablo["bugun"]] + tablo["tahmin"]
    ofsetler = list(range(-GECMIS_GUN, 0)) + [0] + list(range(1, TAHMIN_GUN + 1))

    # Birikimli doz: görev başından bugüne taban doz + geçmiş 10 gündeki fazla doz
    taban_bugun = a["onceki_doz_msv"] + a["gorev_gunu"] * analiz.ISS_GUNLUK_DOZ_MSV
    fazla_gecmis = sum(_gunluk_doz(k) - analiz.ISS_GUNLUK_DOZ_MSV
                       for k, o in zip(tablo["gecmis"], ofsetler) if a["gorev_gunu"] + o >= 0)
    kum_bugun = taban_bugun + fazla_gecmis
    siginak_gecmis = sum(1 for k, o in zip(tablo["gecmis"], ofsetler) if k["S"] >= 1 and a["gorev_gunu"] + o >= 0)

    gunler = []
    kum = kum_bugun - sum(_gunluk_doz(k) for k, o in zip(tablo["gecmis"], ofsetler) if a["gorev_gunu"] + o >= 0)
    sig = 0
    for k, o in zip(gunler_kayit, ofsetler):
        gun = a["gorev_gunu"] + o
        if gun < 0:
            gunler.append({"tarih": k["tarih"], "tur": k["tur"], "gorev_disi": True})
            continue
        if gun > a["gorev_suresi"]:
            gunler.append({"tarih": k["tarih"], "tur": k["tur"], "gorev_disi": True, "donus_sonrasi": True})
            continue
        kum += _gunluk_doz(k, eva and o >= 0)
        if k["S"] >= 1:
            sig += 1
        gunluk_eva = eva and o >= 0
        skor, parca = _skor(a, k, gun, kum, sig, gunluk_eva)
        sev, _ = analiz.seviye(skor)
        gunler.append({"tarih": k["tarih"], "tur": k["tur"], "guven": k["guven"], "gorev_gunu": gun,
                       "skor": skor, "seviye": sev, "parcalar": parca, "kum_doz_msv": round(kum, 1)})

    puanli = [g for g in gunler if not g.get("gorev_disi")]
    bugun_g = next((g for g in gunler if g["tur"] == "bugun" and not g.get("gorev_disi")), None)
    tahmin_g = [g for g in gunler if g["tur"] == "tahmin" and not g.get("gorev_disi")]
    gecmis_g = [g for g in gunler if g["tur"] == "gecmis" and not g.get("gorev_disi")]

    uyarilar = _uyarilar(a, w, tablo, iss_gun, eva, kum_bugun, siginak_gecmis, bugun)
    ozel = {}
    if hastalik == "osteopeni":
        t_simdi = t_skor(a, a["gorev_gunu"], siginak_gecmis)
        t_bitis = t_skor(a, a["gorev_suresi"], siginak_gecmis)
        kalan_aylik = KEMIK_KAYBI_ONLEMLI / 10.0 / 30.4
        esik_gunu = a["gorev_gunu"] + max(0, math.floor((t_simdi - T_SKOR_ESIK) / kalan_aylik)) if t_simdi > T_SKOR_ESIK else a["gorev_gunu"]
        ozel = {"t_skor_ucus_oncesi": a.get("t_skor_ucus_oncesi"), "t_skor_bugun": round(t_simdi, 2),
                "t_skor_gorev_sonu": round(t_bitis, 2), "esik_gorev_gunu": esik_gunu,
                "kayip_orani_aylik": KEMIK_KAYBI_ONLEMLI}
    if hastalik in ("ilik", "katarakt"):
        ozel = {"kariyer_yuzde": round(100 * kum_bugun / analiz.KARIYER_LIMITI_MSV, 1),
                "kum_doz_msv": round(kum_bugun, 1)}
    if hastalik == "pihti":
        ozel = {"riskli_pencere": 20 <= a["gorev_gunu"] <= 120}

    karar = _karar(a, tablo, bugun_g, tahmin_g, gecmis_g, ozel, bugun)
    gecmis_ort = round(sum(g["skor"] for g in gecmis_g) / len(gecmis_g)) if gecmis_g else None
    tahmin_max = max((g["skor"] for g in tahmin_g), default=None)
    return {
        "id": a["id"], "ad": a["ad"], "yas": a["yas"], "ulke": a["ulke"], "hastalik": hastalik,
        "gorev_gunu": a["gorev_gunu"], "gorev_suresi": a["gorev_suresi"],
        "planlanan_donus": (bugun + timedelta(days=a["gorev_suresi"] - a["gorev_gunu"])).isoformat(),
        "kum_doz_msv": round(kum_bugun, 1), "agirliklar": {k: v for k, v in w.items() if k not in ("osdr", "akut")}, "akut": w["akut"],
        "osdr_konu": w["osdr"],
        "bugun": {"skor": bugun_g["skor"], "seviye": bugun_g["seviye"], "parcalar": bugun_g["parcalar"]} if bugun_g else None,
        "gecmis_ortalama": gecmis_ort, "tahmin_en_yuksek": tahmin_max,
        "gunler": gunler, "uyarilar": uyarilar, "karar": karar, "ozel": ozel,
    }


# ================================================================ uyarılar ve karar

def _ekle(liste, k, oncelik, tarih=None, **p):
    for u in liste:
        if u["k"] == k:
            if tarih and tarih not in u["tarihler"]:
                u["tarihler"].append(tarih)
            if ["rutin", "yuksek", "acil"].index(oncelik) > ["rutin", "yuksek", "acil"].index(u["oncelik"]):
                u["oncelik"] = oncelik
            for kk, vv in p.items():
                if isinstance(vv, (int, float)) and isinstance(u["p"].get(kk), (int, float)):
                    u["p"][kk] = max(u["p"][kk], vv)
            return
    liste.append({"k": k, "oncelik": oncelik, "tarihler": [tarih] if tarih else [], "p": p})


def _uyarilar(a, w, tablo, iss_gun, eva, kum, siginak_gecmis, bugun):
    h = a["hastalik"]
    u = []
    kalan = a["gorev_suresi"] - a["gorev_gunu"]
    gelecek = [tablo["bugun"]] + tablo["tahmin"]
    for d, k in enumerate(gelecek):
        if a["gorev_gunu"] + d > a["gorev_suresi"]:
            break
        g, S, G, p = k["tarih"], k["S"], k["G"], k["p_proton"]
        proton_var = S >= 1 or p >= 0.25
        if S >= 1 and w["rad"] >= 0.5:
            _ekle(u, "SIGINAK", "acil", g, S=S)
        elif p >= 0.25 and w["rad"] >= 0.5:
            _ekle(u, "SIGINAK_HAZIR", "yuksek", g, yuzde=round(100 * p))
        if eva and (S >= 1 or G >= 3 or p >= 0.25 or (h == "aritmi" and G >= 2)):
            _ekle(u, "EVA_ERTELE", "acil" if (S >= 1 or w["eva"] >= 0.8) else "yuksek", g)
        if G >= 3 and w["rad"] >= 0.5:
            _ekle(u, "YUKSEK_ENLEM", "yuksek", g, G=G)
        if k["cme_varis"] and (w["G"] >= 0.25 or w["cme"] >= 0.15):
            _ekle(u, "CME_VARIS", "yuksek", g)
        if proton_var or S >= 1:
            ozel = {"pihti": "HAREKETSIZLIK", "osteopeni": "EGZERSIZ_TELAFI", "bobrek": "SIVI_SIGINAK",
                    "aritmi": "UYKU_STRES"}.get(h)
            if ozel:
                _ekle(u, ozel, "yuksek" if S >= 1 else "rutin", g)
        if h == "aritmi" and G >= 2:
            _ekle(u, "RITIM_IZLEM", "yuksek", g, G=G)
    # Bugünkü ISS yörüngesi
    if w["rad"] >= 0.5 and iss_gun:
        _ekle(u, "SAA_BUGUN", "rutin", None, dk=iss_gun["saa_dk_24s"], sonraki=iss_gun["sonraki_saa"])
    # Hastalığa özgü izlem
    if h == "ilik":
        if any(k["S"] >= 1 for k in tablo["gecmis"]) or tablo["bugun"]["S"] >= 1:
            _ekle(u, "KAN_TAKIP", "yuksek")
        _ekle(u, "KARIYER_DOZ", "yuksek" if kum >= 0.5 * analiz.KARIYER_LIMITI_MSV else "rutin",
              yuzde=round(100 * kum / analiz.KARIYER_LIMITI_MSV, 1), doz=round(kum, 1))
    elif h == "pihti":
        if 20 <= a["gorev_gunu"] <= 120:
            _ekle(u, "USG_TAKIP", "yuksek", gun=a["gorev_gunu"])
        if kalan <= 10:
            _ekle(u, "INIS_ANTIKOAG", "yuksek", kalan=kalan)
        if eva:
            _ekle(u, "EVA_KANAMA", "yuksek")
    elif h == "aritmi":
        if a["gorev_gunu"] >= 90:
            _ekle(u, "ATRIYUM", "rutin", gun=a["gorev_gunu"])
    elif h == "osteopeni":
        t_simdi = t_skor(a, a["gorev_gunu"], siginak_gecmis)
        t_son = t_skor(a, a["gorev_suresi"], siginak_gecmis)
        _ekle(u, "T_SKOR", "yuksek" if t_son <= T_SKOR_ESIK else "rutin", t=round(t_simdi, 2), tson=round(t_son, 2))
        if eva:
            _ekle(u, "EVA_KIRIK", "yuksek")
    elif h == "bobrek":
        _ekle(u, "SIVI_HEDEF", "rutin")
    elif h == "katarakt":
        _ekle(u, "LENS_DOZ", "rutin", doz=round(kum, 1))
    sira = {"acil": 0, "yuksek": 1, "rutin": 2}
    u.sort(key=lambda x: (sira[x["oncelik"]], x["tarihler"][0] if x["tarihler"] else "9999"))
    return u


def _karar(a, tablo, bugun_g, tahmin_g, gecmis_g, ozel, bugun):
    """Dünya'ya dönüş önerisi: KAL < IZLE < PLANLA < ACIL."""
    h = a["hastalik"]
    nedenler = []
    seviye = "KAL"

    def yukselt(s):
        nonlocal seviye
        sira = ["KAL", "IZLE", "PLANLA", "ACIL"]
        if sira.index(s) > sira.index(seviye):
            seviye = s

    bugun_skor = bugun_g["skor"] if bugun_g else 0
    yuksek_gunler = [g["tarih"] for g in tahmin_g if g["skor"] >= 70]
    en_yuksek = max([bugun_skor] + [g["skor"] for g in tahmin_g])
    if bugun_skor >= 85:
        if HASTALIKLAR[h]["akut"]:
            yukselt("ACIL")
            nedenler.append({"k": "BUGUN_KRITIK", "skor": bugun_skor})
        else:   # uzun vadeli (birikimli) risk: tek bir fırtına günü dönüş gerekçesi değildir
            yukselt("IZLE")
            nedenler.append({"k": "BUGUN_KRITIK_KRONIK", "skor": bugun_skor})
    if len(yuksek_gunler) >= 2:
        yukselt("PLANLA")
        nedenler.append({"k": "COK_GUN_YUKSEK", "n": len(yuksek_gunler)})
    elif en_yuksek >= 50:
        yukselt("PLANLA")
        nedenler.append({"k": "RISK_YUKSEK", "skor": en_yuksek})
    elif en_yuksek >= 45:
        yukselt("IZLE")
        nedenler.append({"k": "RISK_ORTA", "skor": en_yuksek})
    if tablo["egilim"]["durum"] == "ARTIYOR" and HASTALIKLAR[h]["rad"] + HASTALIKLAR[h]["G"] >= 0.5:
        yukselt("IZLE")
        nedenler.append({"k": "EGILIM_ARTIYOR"})
    if gecmis_g and bugun_g:
        ort = sum(g["skor"] for g in gecmis_g) / len(gecmis_g)
        if bugun_skor - ort >= 15:
            yukselt("IZLE")
            nedenler.append({"k": "GECMISTEN_YUKSEK", "fark": round(bugun_skor - ort)})

    if h == "ilik":
        if tablo["bugun"]["S"] >= 3:
            nedenler.append({"k": "S3_ILIK"})
        if ozel.get("kariyer_yuzde", 0) >= 50:
            yukselt("PLANLA")
            nedenler.append({"k": "KARIYER_YARI", "yuzde": ozel["kariyer_yuzde"]})
        if any(g["S"] >= 2 for g in [tablo["bugun"]] + tablo["tahmin"]):
            yukselt("PLANLA")
            nedenler.append({"k": "S2_BEKLENIYOR"})
    elif h == "osteopeni":
        if ozel["t_skor_gorev_sonu"] <= T_SKOR_ESIK:
            yukselt("PLANLA")
            nedenler.append({"k": "T_SKOR_ESIK", "gun": ozel["esik_gorev_gunu"], "t": ozel["t_skor_gorev_sonu"]})
        elif ozel["t_skor_gorev_sonu"] <= T_SKOR_ESIK + 0.2:
            yukselt("IZLE")
            nedenler.append({"k": "T_SKOR_YAKIN", "t": ozel["t_skor_gorev_sonu"]})
    elif h == "pihti" and ozel.get("riskli_pencere"):
        yukselt("IZLE")
        nedenler.append({"k": "PIHTI_PENCERE", "gun": a["gorev_gunu"]})
    elif h == "aritmi" and a["gorev_gunu"] >= 120:
        yukselt("IZLE")
        nedenler.append({"k": "ATRIYUM_SURE", "gun": a["gorev_gunu"]})
    if not nedenler:
        nedenler.append({"k": "SAKIN"})

    # Dönüş için en uygun gün: tahmin penceresinde proton olayı/fırtına/CME olmayan en sakin gün
    uygun = []
    for k in tablo["tahmin"]:
        if k["S"] >= 1 or k["G"] >= 3 or k["cme_varis"] or k["p_proton"] >= 0.25:
            continue
        uygun.append((k["cevre"], k["tarih"]))
    en_uygun = min(uygun)[1] if uygun else None

    # Acil dönüş: bugünden başlayarak proton olayı (S1+) olmayan İLK gün. Proton olayı sürerken
    # kapsüle geçip ayrılmak dozu artırır; jeomanyetik fırtına inişi engellemez.
    gunler = [tablo["bugun"]] + tablo["tahmin"]
    acil = next((k["tarih"] for k in gunler if k["S"] < 1), None)
    # Planlı erken dönüş: yarından başlayarak proton olayı, G3+ fırtına, CME varışı ve yüksek
    # proton olasılığı olmayan EN YAKIN gün; yoksa en azından S ve G3 olmayan ilk gün.
    erken = next((k["tarih"] for k in tablo["tahmin"]
                  if k["S"] < 1 and k["G"] < 3 and not k["cme_varis"] and k["p_proton"] < 0.25), None) or \
        next((k["tarih"] for k in tablo["tahmin"] if k["S"] < 1 and k["G"] < 3), None)
    planlanan = (bugun + timedelta(days=max(0, a["gorev_suresi"] - a["gorev_gunu"]))).isoformat()
    if seviye == "ACIL":
        oneri = {"tarih": acil, "tur": "acil"}
    elif seviye == "PLANLA":
        oneri = {"tarih": erken, "tur": "erken"}
    else:
        oneri = {"tarih": planlanan, "tur": "plan"}
    if oneri["tarih"]:
        oneri["gun"] = (date.fromisoformat(oneri["tarih"]) - bugun).days
    return {"seviye": seviye, "nedenler": nedenler, "en_uygun_gun": en_uygun,
            "onerilen_donus": oneri, "acil_donus": acil, "erken_donus": erken, "planlanan_donus": planlanan,
            "kacinilacak_gunler": [k["tarih"] for k in tablo["tahmin"]
                                   if k["S"] >= 1 or k["G"] >= 3 or k["cme_varis"]]}


# ================================================================ giriş noktası

def hesapla(hava, ham, simdi, model, eva=False):
    tablo = _gun_tablosu(hava, ham, simdi)
    iss_gun = iss_gunluk(model) if model is not None else None
    bugun = simdi.date()
    mur = [astronot_analizi(a, tablo, iss_gun, eva, bugun) for a in ASTRONOTLAR]
    temiz = lambda k: {kk: vv for kk, vv in k.items() if kk != "_e"}  # noqa: E731
    return {
        "tarih": bugun.isoformat(), "eva": eva,
        "cevre": {"gecmis": [temiz(k) for k in tablo["gecmis"]], "bugun": temiz(tablo["bugun"]),
                  "tahmin": [temiz(k) for k in tablo["tahmin"]], "egilim": tablo["egilim"]},
        "iss_gun": iss_gun,
        "astronotlar": mur,
        "ozet": {s: len([m for m in mur if m["karar"]["seviye"] == s]) for s in ("KAL", "IZLE", "PLANLA", "ACIL")},
    }
