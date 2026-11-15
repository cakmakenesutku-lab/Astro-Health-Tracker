"""AstroHealth Tracker - web sunucusu.

Çalıştırma:   python server/sunucu.py
Sonra tarayıcıda: http://localhost:8000

Hiçbir ek paket gerektirmez (yalnızca Python 3.8+ standart kütüphanesi).
"""
import json
import math
import mimetypes
import os
import sys
import threading
import time
import traceback
import webbrowser
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

sys.path.insert(0, str(Path(__file__).resolve().parent))

import analiz      # noqa: E402
import hastalik    # noqa: E402
import kaynaklar   # noqa: E402
import senaryo     # noqa: E402
import yasamsal    # noqa: E402
import yorunge     # noqa: E402

try:  # Windows konsolunda Türkçe karakter hatasını önle
    sys.stdout.reconfigure(errors="replace")
    sys.stderr.reconfigure(errors="replace")
except Exception:
    pass

WEB_DIR = kaynaklar.BASE_DIR / "web"
SURUM = "1.8 · hızlı açılış"
_model_lock = threading.Lock()
_son_model = None
_model_canli = False          # _son_model canlı konumdan mı kuruldu?
MODEL_SAPMA_ESIGI_DERECE = 0.6  # model gerçek konumdan bu kadar saparsa yeniden kurulur (~65 km)


def _aci_farki(lat1, lon1, lat2, lon2):
    """İki nokta arasındaki büyük daire açısı (derece)."""
    r = math.radians
    c = (math.sin(r(lat1)) * math.sin(r(lat2)) + math.cos(r(lat1)) * math.cos(r(lat2)) * math.cos(r(lon1 - lon2)))
    return math.degrees(math.acos(max(-1.0, min(1.0, c))))

# ------------------------------------------------------------------ gerçek yörünge izi
# wheretheiss.at /positions uç noktası tek istekte en fazla 10 zaman damgası alır ve
# saniyede ~1 istek sınırı vardır. İz bu yüzden arka planda birkaç dakikada bir
# yenilenir; arayüz her zaman bellekteki son izi kullanır.
IZ_GECMIS_DK, IZ_GELECEK_DK, IZ_ADIM_SN = 50, 60, 120
_iz = {"noktalar": [], "zaman": 0}
_iz_lock = threading.Lock()


def iz_guncelle():
    if kaynaklar.OFFLINE_MODE:
        return False
    simdi = int(time.time())
    zamanlar = list(range(simdi - IZ_GECMIS_DK * 60, simdi + IZ_GELECEK_DK * 60 + 1, IZ_ADIM_SN))
    noktalar = []
    for i in range(0, len(zamanlar), 10):
        parca = zamanlar[i:i + 10]
        url = ("https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps="
               + ",".join(str(z) for z in parca) + "&units=kilometers")
        try:
            veri = kaynaklar._http_json(url, timeout=10)
        except Exception:
            return False
        for d in veri if isinstance(veri, list) else []:
            try:
                noktalar.append({"t": int(d["timestamp"]), "lat": round(float(d["latitude"]), 3),
                                 "lon": round(float(d["longitude"]), 3)})
            except (KeyError, TypeError, ValueError):
                continue
        time.sleep(1.2)
    if len(noktalar) < len(zamanlar) * 0.8:
        return False
    noktalar.sort(key=lambda n: n["t"])
    with _iz_lock:
        _iz["noktalar"], _iz["zaman"] = noktalar, time.time()
    return True


def iz_dongusu():
    while True:
        tamam = iz_guncelle()
        time.sleep(240 if tamam else 90)


def gercek_iz(simdi):
    """Bellekteki gerçek izden geçmiş ve gelecek parçaları (yeterince kapsıyorsa)."""
    with _iz_lock:
        n = list(_iz["noktalar"])
    if not n or n[0]["t"] > simdi - 40 * 60 or n[-1]["t"] < simdi + 45 * 60:
        return None
    gecmis = [p for p in n if simdi - 45 * 60 <= p["t"] <= simdi]
    gelecek = [p for p in n if simdi <= p["t"] <= simdi + 50 * 60]
    return gecmis, gelecek


# ------------------------------------------------------------------ veri toplama

def ham_uzay_havasi():
    return {
        "kp": kaynaklar.kp_gozlem()[0],
        "kp_tahmin": kaynaklar.kp_tahmin()[0],
        "proton": kaynaklar.goes_proton()[0],
        "xray": kaynaklar.goes_xray()[0],
        "FLR": kaynaklar.donki("FLR")[0],
        "CME": kaynaklar.donki("CME", gun=10)[0],
        "SEP": kaynaklar.donki("SEP")[0],
        "GST": kaynaklar.donki("GST")[0],
    }


def hava_durumu(senaryo_id=None):
    if senaryo_id == "mayis2024":
        return analiz.uzay_havasi(senaryo.HAM, simdi=senaryo.SENARYO_ZAMANI, senaryo=senaryo.BILGI), \
            senaryo.SENARYO_ZAMANI
    return analiz.uzay_havasi(ham_uzay_havasi()), datetime.now(timezone.utc)


def iss_ve_model():
    global _son_model, _model_canli
    veri, durum = kaynaklar.iss_konum()
    with _model_lock:
        iss, model = analiz.iss_durumu(veri if durum in ("canli", "onbellek", "yedek") else None, _son_model)
        if iss["kaynak"] == "canli":
            # Modeli her 5 saniyede baştan kurmak tahminleri titretir (geri sayım zıplar).
            # Eski model gerçek konuma hâlâ yakınsa onu koru; belirgin saparsa yenisine geç.
            if _son_model is not None and _model_canli:
                plat, plon = _son_model.position(time.time())
                if _aci_farki(plat, plon, iss["lat"], iss["lon"]) < MODEL_SAPMA_ESIGI_DERECE:
                    model = _son_model
            _son_model, _model_canli = model, True
        elif _son_model is not None and iss["kaynak"] != "canli":
            # Canlı veri gelmiyorsa en son canlı modelle devam et
            lat, lon = _son_model.position(time.time())
            iss.update({"lat": round(lat, 4), "lon": round(lon, 4), "kaynak": "model",
                        "bolge": yorunge.zone_of(lat, lon)})
            model = _son_model
        else:
            _son_model = model
    return iss, model


def api_iss(q):
    iss, model = iss_ve_model()
    simdi = time.time()
    gercek = gercek_iz(simdi) if iss["kaynak"] == "canli" else None
    if gercek:
        gecmis, gelecek = gercek
        iz_kaynak = "canli"
    else:
        gecmis = yorunge.track(model, simdi - 45 * 60, simdi, 60)
        gelecek = yorunge.track(model, simdi, simdi + 50 * 60, 60)
        iz_kaynak = "model"
    # izin uçlarını ISS'in anlık konumuna bağla (çizgi işaretin içinden geçsin)
    simdi_nokta = {"t": int(simdi), "lat": iss["lat"], "lon": iss["lon"]}
    gecmis = [p for p in gecmis if p["t"] < simdi] + [simdi_nokta]
    gelecek = [simdi_nokta] + [p for p in gelecek if p["t"] > simdi]
    R = yorunge.EARTH_RADIUS_KM
    gorus_km = R * math.acos(R / (R + max(200.0, iss["irtifa_km"])))
    slat, slon = yorunge.subsolar_point(simdi)
    serit, sonraki = yorunge_seridi(model, simdi)
    return {"iss": iss, "gecmis_iz": gecmis, "gelecek_iz": gelecek, "iz_kaynak": iz_kaynak,
            "gorus_yaricap_km": round(gorus_km), "serit": serit, "sonraki": sonraki,
            "gunes_alt_noktasi": {"lat": round(slat, 3), "lon": round(slon, 3)},
            "saa_poligon": [[lat, lon] for lon, lat in yorunge.SAA_POLYGON]}


def yorunge_seridi(model, simdi, dakika=180):
    """Önümüzdeki 3 saatin bölge/ışık şeridi ve sıradaki olayların SANİYE hassasiyetinde zamanı.

    Şerit, dakikanın başına hizalı sabit bir zaman ızgarasında hesaplanır (her istekte aynı
    noktalar → titreme yok). Bir geçiş bulunduğunda tam an ikiye bölme ile 1 sn'ye inceltilir.
    """
    def durum(t):
        la, lo = model.position(t)
        return yorunge.zone_of(la, lo) == "SAA", yorunge.is_sunlit(la, lo, model.alt_km, t)

    def incelt(t_a, t_b, indeks):
        hedef = durum(t_a)[indeks]
        while t_b - t_a > 1:
            orta = (t_a + t_b) / 2
            if durum(orta)[indeks] == hedef:
                t_a = orta
            else:
                t_b = orta
        return int(round(t_b))

    t0 = math.floor(simdi / 60) * 60
    serit, sonraki = [], {}
    onceki_t, onceki = None, None
    for i in range(0, dakika + 2):
        t = t0 + i * 60
        la, lo = model.position(t)
        b = yorunge.zone_of(la, lo)
        g = yorunge.is_sunlit(la, lo, model.alt_km, t)
        serit.append({"t": int(t), "b": b, "g": g})
        if onceki is not None:
            a_saa, a_gun = onceki
            if (b == "SAA") != a_saa:
                an = incelt(onceki_t, t, 0)
                ad = "saa_giris" if b == "SAA" else "saa_cikis"
                if an > simdi and ad not in sonraki:
                    sonraki[ad] = an
            if g != a_gun:
                an = incelt(onceki_t, t, 1)
                ad = "gun_dogumu" if g else "gun_batimi"
                if an > simdi and ad not in sonraki:
                    sonraki[ad] = an
        onceki_t, onceki = t, (b == "SAA", g)
    sa, sg = durum(simdi)
    sonraki["saa_icinde"], sonraki["gunduz"] = sa, sg
    return serit, sonraki


def api_risk(q):
    gorev_gunu = _int(q, "gorev_gunu", kaynaklar.ayarlar().get("gorev_gunu", 120), 0, 1000)
    eva = q.get("eva", ["0"])[0] == "1"
    senaryo_id = q.get("senaryo", [""])[0] or None
    iss, model = iss_ve_model()
    hava, simdi = hava_durumu(senaryo_id)
    risk, k_bolge = analiz.anlik_risk(iss["bolge"], hava, eva=eva)
    kod, ad = analiz.seviye(risk)
    dd = analiz.doz_ve_dna(hava, gorev_gunu, risk, iss["bolge"], eva)
    organlar = analiz.organ_skorlari(risk, dd["kumulatif_doz_msv"], gorev_gunu)
    takvim = analiz.gun_takvimi(hava, gorev_gunu, dd["kumulatif_doz_msv"], simdi=simdi)
    eva_plan = analiz.eva_planlayici(model, hava)
    oneriler = analiz.onlemler(iss, hava, risk, dd, gorev_gunu, eva_plan)
    return {
        "zaman": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "gorev_gunu": gorev_gunu, "eva": eva, "senaryo": senaryo_id,
        "iss": iss, "hava": hava,
        "risk": {"skor": risk, "seviye": kod,
                 "k_bolge": round(k_bolge, 2), "k_hava": hava["k_hava"], "eva_carpani": 1.5 if eva else 1.0},
        "doz": dd, "organlar": organlar, "takvim": takvim, "eva_plan": eva_plan, "onlemler": oneriler,
    }


def api_hastalik(q):
    """Hastalık öyküsü olan mürettebat: son 10 gün + bugün + 7 günlük kişisel risk ve dönüş önerisi."""
    eva = q.get("eva", ["0"])[0] == "1"
    senaryo_id = q.get("senaryo", [""])[0] or None
    sonuc = _hastalik_hesapla(senaryo_id, eva)
    with _hst_kilit:
        _hst_onbellek[(senaryo_id, eva)] = (time.time(), sonuc)
    return sonuc


_hst_onbellek = {}
_hst_kilit = threading.Lock()


def hastalik_onbellekli(senaryo_id, eva, ttl=60):
    with _hst_kilit:
        k = _hst_onbellek.get((senaryo_id, eva))
    if k and time.time() - k[0] < ttl:
        return k[1]
    sonuc = _hastalik_hesapla(senaryo_id, eva)
    with _hst_kilit:
        _hst_onbellek[(senaryo_id, eva)] = (time.time(), sonuc)
    return sonuc


BOLGE_TR = {"EKVATOR": "Ekvator kuşağı", "ORTA_ENLEM": "Orta enlem", "YUKSEK_ENLEM": "Yüksek enlem",
            "SAA": "Güney Atlantik Anomalisi"}


def _vital_hesapla(senaryo_id, eva, gecmis_dk):
    mod = senaryo_id or "canli"
    h = hastalik_onbellekli(senaryo_id, eva)
    riskler = {a["id"]: (a["bugun"] or {}).get("skor", 0) for a in h["astronotlar"]}
    b = h["cevre"]["bugun"]
    ortam = {"S": b["S"], "G": b["G"], "R": b["R"], "cme_varis": b["cme_varis"], "kp": b["kp_max"]}
    iss, _ = iss_ve_model()
    kp = "—" if b["kp_max"] is None else f"{b['kp_max']:.1f}".replace(".", ",")
    ozet = f"Kp {kp} (G{b['G']}) · S{b['S']} · R{b['R']}" + (" · CME varışı" if b["cme_varis"] else "") + \
        f" · ISS: {BOLGE_TR.get(iss.get('bolge'), iss.get('bolge'))}"
    liste = yasamsal.hepsi(mod, riskler, ortam, eva=eva, gecmis_dk=gecmis_dk)
    acil = {a["id"]: a["karar"].get("acil_donus") for a in h["astronotlar"]}
    for m in liste:
        m["an"]["risk"] = m["risk"]
        m["an"]["acil_donus"] = acil.get(m["id"])
    yasamsal.izle(mod, {m["id"]: m["an"] for m in liste}, ozet)
    return mod, ortam, iss, liste


def api_vital(q):
    """Yaşamsal bulgular (simülasyon), aktif alarmlar ve mürettebat önerileri."""
    eva = q.get("eva", ["0"])[0] == "1"
    senaryo_id = q.get("senaryo", [""])[0] or None
    if senaryo_id not in (None, "mayis2024"):
        senaryo_id = None
    mod, ortam, iss, liste = _vital_hesapla(senaryo_id, eva, gecmis_dk=_int(q, "gecmis", 60, 0, 120))
    return {"zaman": int(time.time()), "mod": mod, "ortam": ortam, "iss_bolge": iss.get("bolge"),
            "astronotlar": liste, "alarmlar": yasamsal.aktif_alarmlar(mod),
            "son_kayitlar": yasamsal.son_kayitlar(mod),
            "kayit_dosyasi": str(yasamsal.kayit_dosyasi()), "kayit_hatasi": yasamsal.kayit_hatasi()}


def api_vital_simule(q):
    """Sunum için: seçilen astronotta hastalığına özgü atağı hemen başlatır (12 dakika)."""
    aid = q.get("id", [""])[0]
    senaryo_id = q.get("senaryo", [""])[0] or None
    if aid not in yasamsal.FIZYOLOJI:
        return {"hata": "Bilinmeyen astronot"}
    yasamsal.zorla((senaryo_id if senaryo_id == "mayis2024" else None) or "canli", aid)
    return {"tamam": True, "id": aid, "sure_sn": yasamsal.ZORLA_SURE}


def vital_dongusu():
    """Tarayıcı açık olmasa da canlı modda bulguları izler ve alarmları dosyaya yazar."""
    time.sleep(8)
    while True:
        try:
            _vital_hesapla(None, False, gecmis_dk=0)
        except Exception:
            traceback.print_exc()
        time.sleep(15)


def _hastalik_hesapla(senaryo_id, eva):
    _, model = iss_ve_model()
    if senaryo_id == "mayis2024":
        ham = dict(senaryo.HAM)
        simdi = senaryo.SENARYO_ZAMANI
    else:
        ham = ham_uzay_havasi()
        ham["proton_7g"] = kaynaklar.goes_proton_7gun()[0]
        ham["olasilik"] = kaynaklar.noaa_olasilik()[0]
        ham["noaa_27g"] = kaynaklar.noaa_27gun()[0]
        simdi = datetime.now(timezone.utc)
    hava = analiz.uzay_havasi(ham, simdi=simdi, senaryo=senaryo.BILGI if senaryo_id == "mayis2024" else None)
    sonuc = hastalik.hesapla(hava, ham, simdi, model, eva=eva)
    sonuc.update({"zaman": datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
                  "senaryo": senaryo_id,
                  "kaynak_durum": {k: (kaynaklar.durumlar().get(k) or {}).get("durum")
                                   for k in ("noaa_kp", "noaa_kp_tahmin", "goes_proton_7g", "noaa_olasilik",
                                             "noaa_27g", "donki_FLR", "donki_CME", "donki_SEP", "donki_GST")}})
    return sonuc


def api_osdr_konu(q):
    kid = q.get("id", ["radyasyon_dna"])[0]
    konu = analiz.OSDR_KONULAR.get(kid)
    if not konu:
        return {"hata": "Bilinmeyen konu", "konular": list(analiz.OSDR_KONULAR)}
    veri, durum = kaynaklar.osdr_ara(kid, konu["terim"])
    ozet = analiz.osdr_arama_ozet(veri)
    ozet.update({"id": kid, "terim": konu["terim"], "durum": durum,
                 "arama_linki": "https://osdr.nasa.gov/bio/repo/search?q=" + konu["terim"].replace(" ", "+")
                                + "&data_source=cgene"})
    return ozet


def api_osdr_ara(q):
    """Serbest OSDR araması (İngilizce terim önerilir)."""
    terim = " ".join((q.get("q", [""])[0] or "").split())[:80]
    if len(terim) < 2:
        return {"hata": "kisa", "toplam": 0, "calismalar": []}
    slug = "".join(c if c.isalnum() else "_" for c in terim.lower())[:40]
    veri, durum = kaynaklar.osdr_ara("serbest_" + slug, terim, adet=12)
    ozet = analiz.osdr_arama_ozet(veri)
    ozet.update({"terim": terim, "durum": durum,
                 "arama_linki": "https://osdr.nasa.gov/bio/repo/search?q=" + terim.replace(" ", "+")
                                + "&data_source=cgene"})
    return ozet


def api_meta(q):
    """Yöntem sayfası için model sabitleri (arayüz ile sunucu aynı değerleri gösterir)."""
    return {
        "iss_gunluk_doz_msv": analiz.ISS_GUNLUK_DOZ_MSV, "kariyer_limiti_msv": analiz.KARIYER_LIMITI_MSV,
        "spe_olay_limiti_msv": analiz.SPE_OLAY_LIMITI_MSV, "dunya_yillik_doz_msv": analiz.DUNYA_YILLIK_DOZ_MSV,
        "kemik_kaybi_aylik": analiz.KEMIK_KAYBI_AYLIK, "kalite_faktoru": analiz.KALITE_FAKTORU,
        "dsb_per_gy": analiz.DSB_PER_GY, "bolge_risk": analiz.BOLGE_RISK, "bolge_doz_hizi": analiz.BOLGE_DOZ_HIZI,
        "organ_agirliklari": analiz.ORGANLAR,
    }


def api_osdr_konular(q):
    return {"konular": [{"id": k, **v} for k, v in analiz.OSDR_KONULAR.items()]}


def api_osdr_calisma(q):
    acc = q.get("id", ["OSD-46"])[0].upper()
    if not acc.startswith("OSD-") or not acc[4:].isdigit():
        return {"hata": "Geçersiz kimlik. Örnek: OSD-46"}
    veri, durum = kaynaklar.osdr_calisma(acc)
    ozet = analiz.osdr_calisma_ozet(veri, acc)
    if ozet is None:
        return {"accession": acc, "durum": durum, "hata": "Çalışma ayrıntısı şu an alınamadı.",
                "link": f"https://osdr.nasa.gov/bio/repo/data/studies/{acc}"}
    ozet["durum"] = durum
    return ozet


ORGANIZMALAR = ["Homo sapiens", "Mus musculus", "Rattus norvegicus", "Arabidopsis thaliana",
                "Drosophila melanogaster", "Caenorhabditis elegans"]


def api_osdr_istatistik(q):
    out = []
    for org in ORGANIZMALAR:
        veri, durum = kaynaklar.osdr_organizma_sayisi(org)
        sayi = len(veri) if isinstance(veri, list) else None
        out.append({"organizma": org, "veri_seti": sayi, "durum": durum})
    konu_sayilari = []
    for kid, k in analiz.OSDR_KONULAR.items():
        veri, durum = kaynaklar.osdr_ara(kid, k["terim"])
        konu_sayilari.append({"id": kid,
                              "toplam": analiz.osdr_arama_ozet(veri)["toplam"], "durum": durum})
    return {"organizmalar": out, "konular": konu_sayilari}


def api_durum(q):
    a = kaynaklar.ayarlar()
    return {"kaynaklar": kaynaklar.durumlar(), "demo_anahtar": a["nasa_api_key"] == "DEMO_KEY",
            "cevrimdisi_mod": kaynaklar.OFFLINE_MODE, "sunucu_zamani": int(time.time()), "surum": SURUM}


ROUTES = {
    "/api/iss": api_iss,
    "/api/risk": api_risk,
    "/api/hastalik": api_hastalik,
    "/api/vital": api_vital,
    "/api/vital/simule": api_vital_simule,
    "/api/osdr/konular": api_osdr_konular,
    "/api/osdr/konu": api_osdr_konu,
    "/api/osdr/ara": api_osdr_ara,
    "/api/meta": api_meta,
    "/api/osdr/calisma": api_osdr_calisma,
    "/api/osdr/istatistik": api_osdr_istatistik,
    "/api/durum": api_durum,
}


def _int(q, ad, varsayilan, mn, mx):
    try:
        return max(mn, min(mx, int(q.get(ad, [varsayilan])[0])))
    except (TypeError, ValueError):
        return varsayilan


class Handler(BaseHTTPRequestHandler):
    server_version = "AstroHealth/1.0"

    def log_message(self, fmt, *args):  # konsolu sessiz tut
        pass

    def _gonder(self, kod, govde, tur="application/json; charset=utf-8"):
        try:
            self.send_response(kod)
            self.send_header("Content-Type", tur)
            self.send_header("Content-Length", str(len(govde)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(govde)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass

    def do_GET(self):
        u = urlparse(self.path)
        if u.path in ROUTES:
            try:
                sonuc = ROUTES[u.path](parse_qs(u.query))
                govde = json.dumps(sonuc, ensure_ascii=False, default=str).encode("utf-8")
                self._gonder(200, govde)
            except Exception as e:
                traceback.print_exc()
                self._gonder(500, json.dumps({"hata": str(e)}, ensure_ascii=False).encode("utf-8"))
            return
        self._statik(u.path)

    def _statik(self, yol):
        if yol in ("", "/"):
            yol = "/index.html"
        hedef = (WEB_DIR / yol.lstrip("/")).resolve()
        if WEB_DIR.resolve() not in hedef.parents and hedef != WEB_DIR.resolve() or not hedef.is_file():
            self._gonder(404, "Bulunamadı".encode("utf-8"), "text/plain; charset=utf-8")
            return
        tur = mimetypes.guess_type(str(hedef))[0] or "application/octet-stream"
        if tur.startswith("text/") or tur in ("application/javascript", "application/json"):
            tur += "; charset=utf-8"
        if hedef.suffix == ".js":
            tur = "application/javascript; charset=utf-8"
        self._gonder(200, hedef.read_bytes(), tur)


def on_yukleme():
    """Açılışta ve periyodik olarak tüm kaynakları çeker (yedek dosyalar da güncellenir).
    Kaynaklar paralel istenir; biri yavaşsa ötekileri bekletmez."""
    from concurrent.futures import ThreadPoolExecutor
    while True:
        isler = [ham_uzay_havasi, kaynaklar.goes_proton_7gun, kaynaklar.noaa_olasilik,
                 kaynaklar.noaa_27gun, kaynaklar.iss_konum]
        isler += [(lambda kid=kid, k=k: kaynaklar.osdr_ara(kid, k["terim"])) for kid, k in analiz.OSDR_KONULAR.items()]
        isler += [(lambda acc=acc: kaynaklar.osdr_calisma(acc)) for acc in ("OSD-46", "OSD-569", "OSD-87", "OSD-366")]
        isler += [(lambda org=org: kaynaklar.osdr_organizma_sayisi(org)) for org in ORGANIZMALAR]
        try:
            with ThreadPoolExecutor(max_workers=8) as ex:
                for f in [ex.submit(i) for i in isler]:
                    try:
                        f.result()
                    except Exception:
                        traceback.print_exc()
        except Exception:
            traceback.print_exc()
        time.sleep(600)


def main():
    a = kaynaklar.ayarlar()
    port = int(os.environ.get("PORT", a.get("port", 8000)))
    sunucu = None
    for p in range(port, port + 10):
        try:
            sunucu = ThreadingHTTPServer(("127.0.0.1", p), Handler)
            port = p
            break
        except OSError:
            continue
    if sunucu is None:
        print("Boş port bulunamadı. ayarlar.json içindeki portu değiştirin.")
        return
    istenen = int(os.environ.get("PORT", a.get("port", 8000)))
    if port != istenen:
        print("!" * 64)
        print(f"  DİKKAT: {istenen} portu dolu. Büyük olasılıkla ESKİ bir AstroHealth penceresi")
        print(f"  hâlâ açık. Tarayıcıda localhost:{istenen} ESKİ sürümü gösterir.")
        print(f"  Eski pencereyi kapatın ya da şu adresi kullanın: http://localhost:{port}")
        print("!" * 64)
    sunucu.daemon_threads = True
    url = f"http://localhost:{port}"
    print("=" * 64)
    print(f"  AstroHealth Tracker {SURUM} çalışıyor / is running")
    print(f"  Tarayıcıda açın / Open in browser:  {url}")
    if a["nasa_api_key"] == "DEMO_KEY":
        print("  DEMO_KEY kullanılıyor / in use -> https://api.nasa.gov")
        print("  (anahtarı ayarlar.json dosyasına yazın / put your key in ayarlar.json)")
    if kaynaklar.OFFLINE_MODE:
        print("  Çevrimdışı mod / Offline mode: data/yedek")
    print("  Kapatmak / To stop:  Ctrl+C")
    print("=" * 64)
    threading.Thread(target=on_yukleme, daemon=True).start()
    threading.Thread(target=iz_dongusu, daemon=True).start()
    threading.Thread(target=vital_dongusu, daemon=True).start()
    print(f"  Sağlık alarm kaydı / Health alarm log: {yasamsal.kayit_dosyasi()}")
    if "--tarayici-acma" not in sys.argv:
        threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    try:
        sunucu.serve_forever()
    except KeyboardInterrupt:
        print("Kapatılıyor...")
    finally:
        sunucu.server_close()


if __name__ == "__main__":
    main()
