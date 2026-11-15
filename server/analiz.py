"""Risk motoru: ham API verisini astronot sağlığı göstergelerine çevirir.

ÖNEMLİ: Buradaki katsayılar EĞİTSEL bir modeldir; tıbbi teşhis ya da gerçek
dozimetre ölçümü değildir. Sabit değerlerin kaynakları BENIOKU.md dosyasında.
"""
import math
import time
from datetime import datetime, timedelta, timezone

import yorunge

# --- Kaynaklı sabitler ---------------------------------------------------------
ISS_GUNLUK_DOZ_MSV = 0.5        # ISS'te tipik günlük doz (STCE: 286 günde ~150-250 mSv)
KARIYER_LIMITI_MSV = 600.0      # NASA-STD-3001 kariyer sınırı
SPE_OLAY_LIMITI_MSV = 250.0     # NASA-STD-3001 güneş parçacık olayı başına kısa süreli sınır
DUNYA_YILLIK_DOZ_MSV = 2.5      # Dünya'da doğal arka plan ~2-3 mSv/yıl
KEMIK_KAYBI_AYLIK = (1.0, 1.5)  # NASA: uzun görevlerde ayda %1-1,5 kemik yoğunluğu kaybı

# --- Model varsayımları (eğitsel) ------------------------------------------------
KALITE_FAKTORU = 2.0            # mSv -> mGy kaba dönüşüm (varsayım)
DSB_PER_GY = 35.0               # hücre başına çift zincir kırığı / Gy (literatürde ~20-40)

BOLGE_RISK = {"EKVATOR": 1.0, "ORTA_ENLEM": 1.4, "YUKSEK_ENLEM": 1.8, "SAA": 3.0}
BOLGE_DOZ_HIZI = {"EKVATOR": 0.6, "ORTA_ENLEM": 0.9, "YUKSEK_ENLEM": 1.4, "SAA": 4.0}

SEVIYELER = [(25, "DUSUK", "Düşük"), (50, "ORTA", "Orta"), (75, "YUKSEK", "Yüksek"), (101, "KRITIK", "Kritik")]


def seviye(skor):
    for esik, kod, ad in SEVIYELER:
        if skor < esik:
            return kod, ad
    return "KRITIK", "Kritik"


def parse_time(s):
    """DONKI ('2024-05-10T12:14Z') ve NOAA ('2026-11-06T00:00:00') zamanlarını okur."""
    if not s:
        return None
    s = str(s).strip().replace(" ", "T")
    if s.endswith("Z"):
        s = s[:-1]
    for fmt in ("%Y-%m-%dT%H:%M:%S.%f", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


# ================================================================ uzay havası

def kp_listesi(veri):
    """NOAA Kp ürünü: yeni format nesne listesi, eski format başlık satırlı liste."""
    out = []
    if not isinstance(veri, list) or not veri:
        return out
    if isinstance(veri[0], list):  # eski format: [["time_tag","Kp",...], [...]]
        basliklar = [str(h).lower() for h in veri[0]]
        for satir in veri[1:]:
            d = dict(zip(basliklar, satir))
            out.append(_kp_kaydi(d))
    else:
        for d in veri:
            if isinstance(d, dict):
                out.append(_kp_kaydi({k.lower(): v for k, v in d.items()}))
    return [k for k in out if k["t"] is not None and k["kp"] is not None]


def _kp_kaydi(d):
    kp = d.get("kp")
    try:
        kp = float(kp)
    except (TypeError, ValueError):
        kp = None
    return {"t": parse_time(d.get("time_tag")), "kp": kp,
            "gozlem": str(d.get("observed", "observed")).lower() != "predicted"}


def g_seviyesi(kp):
    if kp is None:
        return 0
    for esik, g in ((9, 5), (8, 4), (7, 3), (6, 2), (5, 1)):
        if kp >= esik:
            return g
    return 0


def s_seviyesi(proton_pfu):
    if proton_pfu is None:
        return 0
    for esik, s in ((1e5, 5), (1e4, 4), (1e3, 3), (1e2, 2), (10, 1)):
        if proton_pfu >= esik:
            return s
    return 0


def xray_sinifi(flux):
    if flux is None or flux <= 0:
        return None
    for taban, harf in ((1e-4, "X"), (1e-5, "M"), (1e-6, "C"), (1e-7, "B"), (1e-8, "A")):
        if flux >= taban:
            return f"{harf}{flux / taban:.1f}"
    return "A0.0"


def r_seviyesi(flux):
    if flux is None:
        return 0
    for esik, r in ((2e-3, 5), (1e-3, 4), (1e-4, 3), (5e-5, 2), (1e-5, 1)):
        if flux >= esik:
            return r
    return 0


def sinif_r(sinif):
    """'X1.2' gibi DONKI sınıfını R seviyesine çevirir."""
    if not sinif:
        return 0
    try:
        harf = sinif[0].upper()
        deger = float(sinif[1:] or 1)
    except (ValueError, IndexError):
        return 0
    taban = {"A": 1e-8, "B": 1e-7, "C": 1e-6, "M": 1e-5, "X": 1e-4}.get(harf)
    return r_seviyesi(taban * deger) if taban else 0


def proton_serisi(veri, enerji=">=10 MeV"):
    seri = []
    if isinstance(veri, list):
        for d in veri:
            if isinstance(d, dict) and str(d.get("energy", "")).replace(" ", "") == enerji.replace(" ", ""):
                t = parse_time(d.get("time_tag"))
                try:
                    f = float(d.get("flux"))
                except (TypeError, ValueError):
                    continue
                if t:
                    seri.append((t, f))
    seri.sort(key=lambda x: x[0])
    return seri


def xray_son(veri):
    son = None
    if isinstance(veri, list):
        for d in veri:
            e = str(d.get("energy", "")) if isinstance(d, dict) else ""
            if "0.1" in e and "0.8" in e:
                t = parse_time(d.get("time_tag"))
                try:
                    f = float(d.get("flux"))
                except (TypeError, ValueError):
                    continue
                if t and (son is None or t >= son[0]):
                    son = (t, f)
    return son


def cme_varislari(veri, simdi):
    """DONKI CME kayıtlarından Dünya'ya tahmini varış zamanlarını çıkarır."""
    out = []
    if not isinstance(veri, list):
        return out
    for cme in veri:
        if not isinstance(cme, dict):
            continue
        en_iyi = None
        for an in cme.get("cmeAnalyses") or []:
            if not isinstance(an, dict):
                continue
            for en in an.get("enlilList") or []:
                if not isinstance(en, dict):
                    continue
                t = parse_time(en.get("estimatedShockArrivalTime"))
                if t:
                    aday = {"varis": t, "hiz": an.get("speed"), "tur": an.get("type"),
                            "kp_tahmin": en.get("kp_90") or en.get("kp_135") or en.get("kp_180"),
                            "teget": bool(en.get("isEarthGB")), "en_dogru": bool(an.get("isMostAccurate"))}
                    if en_iyi is None or (aday["en_dogru"] and not en_iyi["en_dogru"]):
                        en_iyi = aday
        if en_iyi:
            saat = (en_iyi["varis"] - simdi).total_seconds() / 3600
            out.append({
                "id": cme.get("activityID"), "baslangic": cme.get("startTime"),
                "varis": en_iyi["varis"].isoformat().replace("+00:00", "Z"),
                "kalan_saat": round(saat, 1), "hiz_kms": en_iyi["hiz"], "tur": en_iyi["tur"],
                "kp_tahmin": en_iyi["kp_tahmin"], "teget_gecis": en_iyi["teget"], "link": cme.get("link"),
            })
    out.sort(key=lambda x: x["varis"])
    return out


def uzay_havasi(ham, simdi=None, senaryo=None):
    """Tüm uzay havası kaynaklarını tek bir özet duruma çevirir."""
    simdi = simdi or datetime.now(timezone.utc)
    kp = kp_listesi(ham.get("kp"))
    kp_t = kp_listesi(ham.get("kp_tahmin"))
    gozlenen = [k for k in kp if k["t"] <= simdi + timedelta(hours=3)]
    kp_simdi = gozlenen[-1]["kp"] if gozlenen else None
    son24 = [k["kp"] for k in gozlenen if k["t"] >= simdi - timedelta(hours=24)]
    kp_max24 = max(son24) if son24 else kp_simdi

    pseri = proton_serisi(ham.get("proton"))
    proton_simdi = pseri[-1][1] if pseri else None
    xs = xray_son(ham.get("xray"))
    xray_flux = xs[1] if xs else None

    flr = [f for f in (ham.get("FLR") or []) if isinstance(f, dict)]
    flr24 = [f for f in flr if (parse_time(f.get("peakTime") or f.get("beginTime")) or simdi - timedelta(days=9))
             >= simdi - timedelta(hours=24)]
    en_buyuk_flr = max(flr24, key=lambda f: (sinif_r(f.get("classType")), f.get("classType") or ""), default=None)

    sep = [s for s in (ham.get("SEP") or []) if isinstance(s, dict)]
    sep_yakin = [s for s in sep if (parse_time(s.get("eventTime")) or simdi - timedelta(days=9))
                 >= simdi - timedelta(hours=48)]
    gst = [g for g in (ham.get("GST") or []) if isinstance(g, dict)]
    gst_kp = [k.get("kpIndex") for g in gst for k in (g.get("allKpIndex") or []) if isinstance(k, dict)]
    gst_kp = [float(x) for x in gst_kp if isinstance(x, (int, float))]

    cme = cme_varislari(ham.get("CME"), simdi)
    yaklasan = [c for c in cme if c["kalan_saat"] > -12]

    G = g_seviyesi(kp_simdi)
    S = s_seviyesi(proton_simdi)
    R = max(r_seviyesi(xray_flux), sinif_r(en_buyuk_flr.get("classType")) if en_buyuk_flr else 0)

    k = 1.0
    k = max(k, {0: 1, 1: 2.5, 2: 3.0, 3: 3.5, 4: 4.0, 5: 4.0}[S])
    k = max(k, {0: 1, 1: 1.6, 2: 2.0, 3: 2.5, 4: 3.0, 5: 3.5}[G])
    k = max(k, {0: 1, 1: 1.2, 2: 1.4, 3: 1.8, 4: 2.0, 5: 2.0}[R])
    if sep_yakin and S == 0:
        k = max(k, 1.5)
    k_doz = {0: 1, 1: 1.5, 2: 3, 3: 6, 4: 15, 5: 30}[S] * (1.1 if G >= 3 else 1.0)

    # Gün gün Kp (gözlem + tahmin)
    gunluk = {}
    for kk in kp_t + kp:
        g = kk["t"].date().isoformat()
        gunluk[g] = max(gunluk.get(g, 0), kk["kp"])

    # Metin değil kod döndürülür; çeviri arayüzde (TR/EN) yapılır.
    ozet = []
    if S:
        ozet.append({"k": "S", "S": S, "pfu": round(proton_simdi or 0)})
    if G:
        ozet.append({"k": "G", "G": G, "kp": kp_simdi})
    if R:
        ozet.append({"k": "R", "R": R})
    if yaklasan:
        c = yaklasan[0]
        if c["kalan_saat"] >= 0:
            ozet.append({"k": "CME_GELIYOR", "saat": round(c["kalan_saat"])})
        else:
            ozet.append({"k": "CME_ULASTI"})
    if not ozet:
        ozet.append({"k": "SAKIN"})

    sonuc = {
        "zaman": simdi.isoformat().replace("+00:00", "Z"),
        "kp_simdi": kp_simdi, "kp_max24": kp_max24, "G": G, "S": S, "R": R,
        "proton_10mev_pfu": proton_simdi,
        "xray_flux": xray_flux, "xray_sinif": xray_sinifi(xray_flux),
        "flr_24s": (en_buyuk_flr or {}).get("classType"),
        # DONKI artık 10 gün çekiliyor (hastalık sekmesi); bu sayaçlar son 7 günü gösterir.
        "flr_7g_sayi": _son_gun_sayisi(flr, ("peakTime", "beginTime"), simdi),
        "sep_7g_sayi": _son_gun_sayisi(sep, ("eventTime",), simdi), "sep_48s": len(sep_yakin) > 0,
        "gst_7g_sayi": _son_gun_sayisi(gst, ("startTime",), simdi), "gst_max_kp": max(gst_kp) if gst_kp else None,
        "cme_7g_sayi": _son_gun_sayisi([c for c in (ham.get("CME") or []) if isinstance(c, dict)]
                                       if isinstance(ham.get("CME"), list) else [], ("startTime",), simdi),
        "cme_varis": yaklasan[:5],
        "k_hava": round(k, 2), "k_doz": round(k_doz, 2),
        "ozet": ozet,
        "kp_seri": [{"t": x["t"].isoformat().replace("+00:00", "Z"), "kp": x["kp"]}
                    for x in kp if x["t"] >= simdi - timedelta(days=3)],
        "kp_tahmin_seri": [{"t": x["t"].isoformat().replace("+00:00", "Z"), "kp": x["kp"], "gozlem": x["gozlem"]}
                           for x in kp_t],
        "proton_seri": [{"t": t.isoformat().replace("+00:00", "Z"), "pfu": round(f, 4)}
                        for t, f in pseri[-288:]],
        "gunluk_kp": gunluk,
        "son_olaylar": _son_olaylar(flr, sep, gst, ham.get("CME")),
    }
    if senaryo:
        sonuc.update(senaryo)
    return sonuc


def _son_gun_sayisi(liste, alanlar, simdi, gun=7):
    n = 0
    for d in liste:
        t = None
        for a in alanlar:
            t = parse_time(d.get(a))
            if t:
                break
        if t is None or t >= simdi - timedelta(days=gun):
            n += 1
    return n


def _son_olaylar(flr, sep, gst, cme):
    olay = []
    for f in flr:
        olay.append({"tur": "FLR", "zaman": f.get("peakTime") or f.get("beginTime"),
                     "sinif": f.get("classType"), "link": f.get("link")})
    for s in sep:
        olay.append({"tur": "SEP", "zaman": s.get("eventTime"), "link": s.get("link")})
    for g in gst:
        kps = [k.get("kpIndex") for k in (g.get("allKpIndex") or []) if isinstance(k, dict)]
        kps = [x for x in kps if isinstance(x, (int, float))]
        olay.append({"tur": "GST", "zaman": g.get("startTime"), "kp": max(kps) if kps else None,
                     "link": g.get("link")})
    for c in (cme if isinstance(cme, list) else []):
        if isinstance(c, dict):
            hiz = None
            for an in c.get("cmeAnalyses") or []:
                if isinstance(an, dict) and an.get("speed"):
                    hiz = an.get("speed")
                    if an.get("isMostAccurate"):
                        break
            olay.append({"tur": "CME", "zaman": c.get("startTime"),
                         "hiz": hiz if isinstance(hiz, (int, float)) else None, "link": c.get("link")})
    olay.sort(key=lambda o: str(o.get("zaman") or ""), reverse=True)
    return olay[:12]


# ================================================================ ISS durumu

def iss_durumu(veri, onceki_model=None):
    """wheretheiss.at yanıtından konum + yön + bölge. Veri yoksa model kullanılır."""
    simdi = time.time()
    if isinstance(veri, list) and len(veri) >= 1 and isinstance(veri[-1], dict) and "latitude" in veri[-1]:
        son = veri[-1]
        lat, lon = float(son["latitude"]), float(son["longitude"])
        yukselen = True
        if len(veri) >= 2:
            yukselen = float(veri[-1]["latitude"]) >= float(veri[-2]["latitude"])
        ts = float(son.get("timestamp", simdi))
        alt = float(son.get("altitude", 420))
        model = yorunge.OrbitModel(lat, lon, yukselen, ts, alt)
        # Yedek veri eskiyse konumu modelle şimdiye taşı
        if simdi - ts > 20:
            lat, lon = model.position(simdi)
            kaynak = "model"
        else:
            kaynak = "canli"
        hiz = float(son.get("velocity", 27600))
        gunes = son.get("visibility")
    else:
        model = onceki_model or yorunge.default_model()
        lat, lon = model.position(simdi)
        alt, hiz, gunes, kaynak, yukselen = model.alt_km, 27600.0, None, "simulasyon", None
        ts = simdi
    if kaynak != "canli" or gunes not in ("daylight", "eclipsed"):
        gunes = "daylight" if yorunge.is_sunlit(lat, lon, alt, simdi) else "eclipsed"
    bolge = yorunge.zone_of(lat, lon)
    return {
        "lat": round(lat, 4), "lon": round(lon, 4), "irtifa_km": round(alt, 1), "hiz_kmh": round(hiz),
        "gunes": gunes, "bolge": bolge,
        "yukselen": yukselen, "kaynak": kaynak, "zaman": int(simdi),
    }, model


# ================================================================ risk & sağlık

def anlik_risk(bolge, hava, eva=False, k_hava=None):
    k_bolge = BOLGE_RISK[bolge]
    if bolge == "YUKSEK_ENLEM" and hava.get("G", 0) >= 1:
        k_bolge *= 1.3
    kh = k_hava if k_hava is not None else hava.get("k_hava", 1.0)
    skor = min(100, round(10 * k_bolge * kh * (1.5 if eva else 1.0)))
    return skor, k_bolge


def doz_hizi_usv_saat(bolge, hava, eva=False):
    temel = ISS_GUNLUK_DOZ_MSV * 1000 / 24
    f = BOLGE_DOZ_HIZI[bolge]
    if bolge == "YUKSEK_ENLEM" and hava.get("G", 0) >= 1:
        f *= 1.3
    return temel * f * hava.get("k_doz", 1.0) * (2.0 if eva else 1.0)


ORGANLAR = [  # ad ve açıklamalar arayüzde (i18n.js) - burada yalnızca model ağırlıkları var
    {"id": "kan", "rad": 0.55, "kum": 0.35, "mg": 0.10, "konu": "radyasyon_dna"},
    {"id": "goz", "rad": 0.35, "kum": 0.25, "mg": 0.40, "konu": "goz"},
    {"id": "beyin", "rad": 0.40, "kum": 0.30, "mg": 0.30, "konu": "beyin"},
    {"id": "kalp", "rad": 0.25, "kum": 0.35, "mg": 0.40, "konu": "kalp"},
    {"id": "bagisiklik", "rad": 0.35, "kum": 0.30, "mg": 0.35, "konu": "telomer"},
    {"id": "kemik", "rad": 0.05, "kum": 0.05, "mg": 0.90, "konu": "kemik"},
    {"id": "kas", "rad": 0.0, "kum": 0.05, "mg": 0.95, "konu": "kas"},
]


def organ_skorlari(risk, kumulatif_msv, gorev_gunu):
    kum = min(1.0, kumulatif_msv / KARIYER_LIMITI_MSV)
    mg = min(1.0, gorev_gunu / 180.0)
    out = []
    for o in ORGANLAR:
        s = 100 * min(1.0, o["rad"] * risk / 100 + o["kum"] * kum * 2.5 + o["mg"] * mg * 0.8)
        s = round(s)
        kod, ad = seviye(s)
        out.append({"id": o["id"], "skor": s, "seviye": kod, "osdr_konu": o["konu"],
                    "etkenler": {"radyasyon_anlik": round(o["rad"] * risk), "birikimli_doz": round(o["kum"] * kum * 250),
                                 "mikroyercekimi": round(o["mg"] * mg * 80)}})
    return out


def doz_ve_dna(hava, gorev_gunu, risk, bolge, eva=False):
    gunluk = ISS_GUNLUK_DOZ_MSV * hava.get("k_doz", 1.0)
    kumulatif = gorev_gunu * ISS_GUNLUK_DOZ_MSV + max(0.0, gunluk - ISS_GUNLUK_DOZ_MSV)
    kariyer = kumulatif / KARIYER_LIMITI_MSV * 100
    mgy = kumulatif / KALITE_FAKTORU
    dsb = mgy / 1000 * DSB_PER_GY
    dna = round(min(100, 0.7 * kariyer * 2 + 0.3 * risk))
    kod, ad = seviye(dna)
    ay = gorev_gunu / 30.4
    telomer = "ERKEN" if gorev_gunu < 30 else ("UZUN" if gorev_gunu < 180 else "COK_UZUN")
    return {
        "anlik_doz_hizi_usv_saat": round(doz_hizi_usv_saat(bolge, hava, eva), 1),
        "gunluk_doz_msv": round(gunluk, 2),
        "kumulatif_doz_msv": round(kumulatif, 1),
        "kariyer_limiti_yuzde": round(kariyer, 1),
        "dunya_gun_esdegeri": round(gunluk / (DUNYA_YILLIK_DOZ_MSV / 365)),
        "spe_limiti_msv": SPE_OLAY_LIMITI_MSV,
        "emilen_doz_mgy": round(mgy, 1),
        "hucre_basina_dsb": round(dsb, 2),
        "dna_hasar_skoru": dna, "dna_seviye": kod,
        "telomer_durumu": telomer,
        "kemik_kaybi_yuzde": [round(ay * KEMIK_KAYBI_AYLIK[0], 1), round(ay * KEMIK_KAYBI_AYLIK[1], 1)],
    }


def gun_takvimi(hava, gorev_gunu, kumulatif_msv, simdi=None, gun_sayisi=4):
    simdi = simdi or datetime.now(timezone.utc)
    gunler = []
    for i in range(gun_sayisi):
        g = (simdi + timedelta(days=i)).date()
        kp = hava.get("gunluk_kp", {}).get(g.isoformat())
        G = g_seviyesi(kp)
        cmeler = [c for c in hava.get("cme_varis", []) if c["varis"][:10] == g.isoformat()]
        kh = max(1.0, {0: 1, 1: 1.6, 2: 2.0, 3: 2.5, 4: 3.0, 5: 3.5}[G])
        if i == 0:
            kh = max(kh, hava.get("k_hava", 1.0))
        if cmeler:
            kh = max(kh, 1.6)
        risk = min(100, round(10 * 1.6 * kh))
        kod, ad = seviye(risk)
        organlar = organ_skorlari(risk, kumulatif_msv + i * ISS_GUNLUK_DOZ_MSV, gorev_gunu + i)
        notlar = []
        if G:
            notlar.append({"k": "G", "kp": kp, "G": G})
        for c in cmeler:
            notlar.append({"k": "CME", "varis": c["varis"]})
        if i == 0 and hava.get("S"):
            notlar.append({"k": "S", "S": hava["S"]})
        if not notlar:
            notlar.append({"k": "OLAGAN"})
        gunler.append({"tarih": g.isoformat(), "kp_max": kp, "G": G, "risk": risk, "seviye": kod,
                       "cme": len(cmeler), "notlar": notlar,
                       "organlar": [{"id": o["id"], "skor": o["skor"], "seviye": o["seviye"]} for o in organlar]})
    return gunler


def bilissel(saat_gmt):
    """Basit sirkadiyen eğri (ISS GMT saatiyle çalışır). Eğitsel model."""
    uyku = saat_gmt >= 21.5 or saat_gmt < 6.0
    temel = 80 + 15 * math.cos(2 * math.pi * (saat_gmt - 14) / 24)
    if uyku:
        temel -= 25
    return max(0, min(100, round(temel))), uyku


def eva_planlayici(model, hava, saat=12, adim_dk=2, simdi=None):
    simdi = simdi or time.time()
    kp_bins = []
    for k in hava.get("kp_tahmin_seri", []):
        t = parse_time(k["t"])
        if t:
            kp_bins.append((t.timestamp(), k["kp"]))
    noktalar = []
    t = simdi
    bitis = simdi + saat * 3600
    while t <= bitis:
        lat, lon = model.position(t)
        bolge = yorunge.zone_of(lat, lon)
        kp = None
        for bt, bk in kp_bins:
            if bt <= t < bt + 3 * 3600:
                kp = bk
        h = dict(hava)
        if kp is not None:
            h["G"] = max(g_seviyesi(kp), 0)
            # Proton (S) fırtınaları genelde saatlerce-günlerce sürer: tüm ufka uygulanır.
            # Patlama (R) etkisi kısa sürer: yalnızca ilk 3 saat. Jeomanyetik etki Kp tahmininden gelir.
            k_s = {0: 1, 1: 2.5, 2: 3.0, 3: 3.5, 4: 4.0, 5: 4.0}[hava.get("S", 0)]
            kh = max(k_s, {0: 1, 1: 1.6, 2: 2.0, 3: 2.5, 4: 3.0, 5: 3.5}[h["G"]])
            if t - simdi < 3 * 3600:
                kh = max(kh, hava.get("k_hava", 1.0))
        else:
            kh = hava.get("k_hava", 1.0)
        risk, _ = anlik_risk(bolge, h, eva=True, k_hava=kh)
        saat_gmt = (t % 86400) / 3600
        bil, uyku = bilissel(saat_gmt)
        gunes = yorunge.is_sunlit(lat, lon, model.alt_km, t)
        uygun = (not uyku) and bolge != "SAA" and risk < 45 and bil >= 70
        noktalar.append({"t": int(t), "lat": round(lat, 2), "lon": round(lon, 2), "bolge": bolge,
                         "risk": risk, "bilissel": bil, "uyku": uyku, "gunes": gunes, "uygun": uygun})
        t += adim_dk * 60

    pencereler = []
    bas = None
    for i, n in enumerate(noktalar + [{"uygun": False, "t": None}]):
        if n["uygun"] and bas is None:
            bas = i
        elif not n["uygun"] and bas is not None:
            parca = noktalar[bas:i]
            sure = (parca[-1]["t"] - parca[0]["t"]) / 60 + adim_dk
            if sure >= 20:
                pencereler.append({"baslangic": parca[0]["t"], "bitis": parca[-1]["t"] + adim_dk * 60,
                                   "sure_dk": round(sure), "ort_risk": round(sum(p["risk"] for p in parca) / len(parca)),
                                   "ort_bilissel": round(sum(p["bilissel"] for p in parca) / len(parca))})
            bas = None
    pencereler.sort(key=lambda p: (-p["sure_dk"], p["ort_risk"]))

    gecisler = []
    for i in range(1, len(noktalar)):
        a, b = noktalar[i - 1], noktalar[i]
        if a["bolge"] != "SAA" and b["bolge"] == "SAA":
            j = i
            while j < len(noktalar) and noktalar[j]["bolge"] == "SAA":
                j += 1
            gecisler.append({"tur": "SAA", "giris": b["t"], "sure_dk": (j - i) * adim_dk})
    gun_dogumu = sum(1 for i in range(1, len(noktalar)) if not noktalar[i - 1]["gunes"] and noktalar[i]["gunes"])
    saa_yuzde = round(100 * sum(1 for n in noktalar if n["bolge"] == "SAA") / max(1, len(noktalar)), 1)
    return {"noktalar": noktalar[::3], "pencereler": pencereler[:4], "saa_gecisleri": gecisler[:6],
            "gun_dogumu_sayisi": gun_dogumu, "saa_zaman_yuzde": saa_yuzde, "saat": saat}


def onlemler(iss, hava, risk, dozdna, gorev_gunu, eva_plan):
    """Kural tabanlı öneriler. Metinler arayüzde (i18n.js) 'k' koduna göre yazılır."""
    out = []

    def ekle(oncelik, k, kategori, **p):
        out.append({"oncelik": oncelik, "k": k, "kategori": kategori, "p": p})

    if hava.get("S", 0) >= 1 or risk >= 75:
        ekle("acil", "KORUNAK", "koruma")
    if dozdna["gunluk_doz_msv"] >= SPE_OLAY_LIMITI_MSV * 0.2:
        ekle("acil", "DOZ_SINIRI", "koruma", doz=dozdna["gunluk_doz_msv"], limit=SPE_OLAY_LIMITI_MSV)
    if iss["bolge"] == "SAA":
        ekle("yuksek", "SAA_SIMDI", "koruma")
    if hava.get("G", 0) >= 1:
        ekle("yuksek", "JEOMANYETIK", "planlama", G=hava.get("G"))
    gelecek = [c for c in hava.get("cme_varis", []) if 0 <= c["kalan_saat"] <= 72]
    if gelecek:
        ekle("yuksek", "CME_GERI_SAYIM", "planlama", saat=round(gelecek[0]["kalan_saat"]))
    if eva_plan["pencereler"]:
        p = eva_plan["pencereler"][0]
        ekle("rutin", "EVA_PENCERE", "planlama", bas=p["baslangic"], bit=p["bitis"], sure=p["sure_dk"],
             risk=p["ort_risk"], bilissel=p["ort_bilissel"])
    else:
        ekle("yuksek", "EVA_YOK", "planlama", saat=eva_plan["saat"])
    ekle("rutin", "EGZERSIZ", "egzersiz", min=dozdna["kemik_kaybi_yuzde"][0], max=dozdna["kemik_kaybi_yuzde"][1])
    if gorev_gunu >= 30:
        ekle("rutin", "SANS", "izlem")
    ekle("rutin", "UYKU", "yasam", saat=eva_plan["saat"], gun_dogumu=eva_plan["gun_dogumu_sayisi"])
    ekle("rutin", "BESLENME", "yasam")
    ekle("bilgi", "ILAC", "bilgi")
    sira = {"acil": 0, "yuksek": 1, "rutin": 2, "bilgi": 3}
    out.sort(key=lambda o: sira[o["oncelik"]])
    return out


# ================================================================ OSDR

OSDR_KONULAR = {  # başlıklar arayüzde çevrilir; arama terimleri OSDR için İngilizce kalır
    "radyasyon_dna": {"terim": "radiation DNA damage"},
    "telomer": {"terim": "telomere"},
    "kemik": {"terim": "bone loss"},
    "kas": {"terim": "muscle atrophy"},
    "goz": {"terim": "retina"},
    "kalp": {"terim": "heart"},
    "beyin": {"terim": "brain radiation"},
    "insan": {"terim": "Inspiration4"},
}


def osdr_arama_ozet(veri):
    out = {"toplam": 0, "calismalar": []}
    if not isinstance(veri, dict):
        return out
    hits = veri.get("hits") or {}
    toplam = hits.get("total")
    if isinstance(toplam, dict):
        toplam = toplam.get("value")
    out["toplam"] = toplam or 0
    for h in hits.get("hits") or []:
        s = h.get("_source") or {}
        acc = s.get("Accession") or s.get("Study Identifier") or h.get("_id")
        if not acc:
            continue
        org = s.get("organism")
        if isinstance(org, list):
            org = ", ".join(map(str, org))
        out["calismalar"].append({
            "accession": acc,
            "baslik": s.get("Study Title") or s.get("Project Title") or acc,
            "organizma": org or "-",
            "proje_turu": s.get("Project Type") or "-",
            "teknoloji": s.get("Study Assay Technology Type") or "",
            "link": f"https://osdr.nasa.gov/bio/repo/data/studies/{acc}",
        })
    return out


def _metin(v):
    if v is None:
        return ""
    if isinstance(v, list):
        return ", ".join(_metin(x) for x in v if _metin(x))
    if isinstance(v, dict):
        return _metin(v.get("name") or v.get("Name") or "")
    return str(v)


def osdr_calisma_ozet(veri, accession):
    if not isinstance(veri, dict) or not veri:
        return None
    kayit = veri.get(accession.upper()) or next(iter(veri.values()))
    if not isinstance(kayit, dict):
        return None
    md = kayit.get("metadata") or {}
    aciklama = _metin(md.get("study description"))
    return {
        "accession": accession.upper(),
        "baslik": _metin(md.get("study title")),
        "aciklama": aciklama[:600] + ("…" if len(aciklama) > 600 else ""),
        "organizma": _metin(md.get("organism")),
        "faktorler": _metin(md.get("study factor name")),
        "proje_turu": _metin(md.get("project type")),
        "teknoloji": _metin(md.get("study assay technology type")),
        "gorev": _metin(md.get("mission")),
        "link": f"https://osdr.nasa.gov/bio/repo/data/studies/{accession.upper()}",
        "api": f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{accession.upper()}/",
    }
