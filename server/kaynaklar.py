"""Dış API'lerden veri çekme, önbellek ve yedek (çevrimdışı) dosya yönetimi.

Her kaynak için sıra:
  1) Önbellek tazeyse onu kullan.
  2) İnternetten çek -> başarılıysa önbelleğe ve data/yedek/ klasörüne kaydet.
  3) Çekilemezse en son önbellek, o da yoksa data/yedek/ içindeki dosya kullanılır.
Böylece sunum sırasında internet gitse bile uygulama çalışmaya devam eder.
"""
import json
import os
import ssl
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
YEDEK_DIR = BASE_DIR / "data" / "yedek"
AYAR_DOSYASI = BASE_DIR / "ayarlar.json"

USER_AGENT = "AstroHealthTracker/1.0 (NASA Space Apps hackathon projesi)"

_cache = {}          # key -> {"t": zaman, "veri": ..., "durum": "canli"|...}
_fail_until = {}     # key -> bu zamana kadar tekrar deneme
_status = {}         # key -> durum bilgisi (arayüzdeki bağlantı paneli için)
_locks = {}
_global_lock = threading.Lock()

OFFLINE_MODE = os.environ.get("ASTRO_CEVRIMDISI") == "1"


def ayarlar():
    varsayilan = {"nasa_api_key": "DEMO_KEY", "port": 8000, "gorev_gunu": 120}
    try:
        with open(AYAR_DOSYASI, "r", encoding="utf-8") as f:
            varsayilan.update(json.load(f))
    except Exception:
        pass
    env_key = os.environ.get("NASA_API_KEY")
    if env_key:
        varsayilan["nasa_api_key"] = env_key
    return varsayilan


def _lock_for(key):
    with _global_lock:
        if key not in _locks:
            _locks[key] = threading.Lock()
        return _locks[key]


def _http_metin(url, timeout=12):
    """Ham metin döndürür (NOAA'nın .txt ürünleri için)."""
    return _http_json(url, timeout=timeout, metin=True)


def _http_json(url, timeout=12, metin=False):
    if OFFLINE_MODE:
        raise ConnectionError("Çevrimdışı mod açık")
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT,
                                               "Accept": "text/plain" if metin else "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read().decode("utf-8", errors="replace").strip()
    except urllib.error.URLError as e:
        # macOS'taki python.org kurulumlarında sertifika paketi eksik olabilir: certifi varsa onu dene
        if isinstance(getattr(e, "reason", None), ssl.SSLCertVerificationError):
            try:
                import certifi
                ctx = ssl.create_default_context(cafile=certifi.where())
            except ImportError:
                raise ConnectionError("SSL sertifika hatası. macOS'ta Python klasöründeki "
                                      "'Install Certificates.command' dosyasını çalıştırın.") from e
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                raw = resp.read().decode("utf-8", errors="replace").strip()
        else:
            raise
    if metin:
        return raw
    if raw == "":
        return []          # DONKI olay yoksa boş gövde döndürebilir
    return json.loads(raw)


def _yedek_yolu(key):
    safe = "".join(c if c.isalnum() or c in "-_" else "_" for c in key)
    return YEDEK_DIR / f"{safe}.json"


def _yedek_kaydet(key, veri, kaynak_url):
    try:
        YEDEK_DIR.mkdir(parents=True, exist_ok=True)
        tmp = _yedek_yolu(key).with_suffix(".tmp")
        with open(tmp, "w", encoding="utf-8") as f:
            json.dump({
                "_kaydedildi": datetime.now(timezone.utc).isoformat(timespec="seconds"),
                "_kaynak": kaynak_url.split("api_key=")[0],
                "veri": veri,
            }, f, ensure_ascii=False)
        os.replace(tmp, _yedek_yolu(key))
    except Exception:
        pass


def _yedek_oku(key):
    try:
        with open(_yedek_yolu(key), "r", encoding="utf-8") as f:
            d = json.load(f)
        return d.get("veri"), d.get("_kaydedildi", "?")
    except Exception:
        return None, None


_yenileniyor = set()     # arka planda çekilmekte olan anahtarlar


def _cek(key, url, ttl, etiket, timeout, retry_after, donustur, metin):
    """Kaynağı ağdan çeker; başarıda önbelleği ve yedek dosyayı günceller. Dönüş: (veri, hata)."""
    try:
        veri = _http_metin(url, timeout=timeout) if metin else _http_json(url, timeout=timeout)
        if donustur is not None:
            veri = donustur(veri)
        _cache[key] = {"t": time.time(), "veri": veri, "durum": "canli"}
        _status[key] = {"etiket": etiket or key, "durum": "canli", "son_basari": _iso_now(), "hata": None}
        _yedek_kaydet(key, veri, url)
        return veri, None
    except Exception as e:  # ağ yok, zaman aşımı, limit aşıldı...
        hata = _hata_metni(e)
        _fail_until[key] = time.time() + min(ttl, retry_after)
        eski = _status.get(key) or {}
        c = _cache.get(key)
        _status[key] = {"etiket": etiket or key,
                        "durum": ("onbellek" if c and c["durum"] == "canli" else (c["durum"] if c else "yok")),
                        "son_basari": eski.get("son_basari"), "hata": hata}
        return None, hata


def _arkada_yenile(key, *arg):
    """Aynı kaynak için tek bir arka plan çekimi başlatır; istek beklemez."""
    if time.time() < _fail_until.get(key, 0):
        return
    with _global_lock:
        if key in _yenileniyor:
            return
        _yenileniyor.add(key)

    def is_():
        try:
            with _lock_for(key):
                _cek(key, *arg)
        finally:
            with _global_lock:
                _yenileniyor.discard(key)
    threading.Thread(target=is_, daemon=True).start()


def get_json(key, url, ttl, etiket=None, timeout=12, retry_after=60, donustur=None, metin=False):
    """Bir kaynağı getir. Dönüş: (veri, durum). durum: canli | onbellek | yedek | yok

    Hız için "eskiyi hemen ver, yenisini arkada çek" yaklaşımı: elde önbellek ya da yedek dosya
    varsa istek ağı BEKLEMEZ; yeni veri arka planda çekilir ve bir sonraki istekte kullanılır.
    Yalnızca hiç veri yokken (ilk kurulum, yedek dosya yok) ağ yanıtı beklenir.

    donustur: büyük ham yanıtı (ör. 7 günlük 5 dakikalık proton verisi) önbelleğe ve yedeğe
    yazmadan önce küçültmek / metni JSON'a çevirmek için isteğe bağlı fonksiyon.
    """
    arg = (url, ttl, etiket, timeout, retry_after, donustur, metin)
    now = time.time()
    c = _cache.get(key)
    if c and now - c["t"] < ttl:
        return c["veri"], c["durum"]
    if c:                                   # süresi dolmuş: eskiyi ver, arkada yenile
        _arkada_yenile(key, *arg)
        durum = c["durum"] if (c["durum"] != "canli" or now - c["t"] < 3 * ttl) else "onbellek"
        return c["veri"], durum
    veri, zaman = _yedek_oku(key)           # önbellek yok: diskteki yedekle hemen aç
    if veri is not None:
        _cache[key] = {"t": 0, "veri": veri, "durum": "yedek"}
        _status.setdefault(key, {"etiket": etiket or key, "durum": "yedek", "son_basari": zaman, "hata": None})
        _arkada_yenile(key, *arg)
        return veri, "yedek"
    with _lock_for(key):                    # hiç veri yok: mecburen ağı bekle
        c = _cache.get(key)
        if c:
            return c["veri"], c["durum"]
        if time.time() >= _fail_until.get(key, 0):
            veri, hata = _cek(key, *arg)
            if veri is not None:
                return veri, "canli"
        else:
            hata = (_status.get(key) or {}).get("hata") or "bekleniyor"
        _status[key] = {"etiket": etiket or key, "durum": "yok", "son_basari": None, "hata": hata}
        return None, "yok"


def _hata_metni(e):
    """Hata kodları arayüzde TR/EN olarak açıklanır."""
    kod = getattr(e, "code", None)
    if kod is not None:
        return {429: "LIMIT_429", 403: "HTTP_403"}.get(kod, f"HTTP_{kod}")
    metin = str(e)
    if isinstance(e, ConnectionError) and "Çevrimdışı" in metin:
        return "CEVRIMDISI"
    if isinstance(e, ConnectionError) and "SSL" in metin:
        return "SSL"
    if "timed out" in metin or isinstance(e, TimeoutError):
        return "ZAMAN_ASIMI"
    if isinstance(e, (urllib.error.URLError, OSError)):
        return "AG_YOK"
    if isinstance(e, ValueError):
        return "BICIM"
    return "BILINMEYEN"


def _iso_now():
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def durumlar():
    return _status


# ------------------------------------------------------------------ kaynaklar

def iss_konum():
    """wheretheiss.at: 30 sn arayla iki konum -> yön (yükselen/alçalan) de bulunur."""
    t = int(time.time())
    url = (f"https://api.wheretheiss.at/v1/satellites/25544/positions"
           f"?timestamps={t - 30},{t}&units=kilometers")
    return get_json("iss", url, ttl=4, etiket="ISS konumu (wheretheiss.at)", timeout=6, retry_after=15)


def kp_gozlem():
    return get_json("noaa_kp", "https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json",
                    ttl=300, etiket="NOAA SWPC Kp indeksi")


def kp_tahmin():
    return get_json("noaa_kp_tahmin",
                    "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
                    ttl=1800, etiket="NOAA SWPC 3 günlük Kp tahmini")


def goes_proton():
    return get_json("goes_proton",
                    "https://services.swpc.noaa.gov/json/goes/primary/integral-protons-1-day.json",
                    ttl=300, etiket="GOES uydusu proton akısı")


def goes_xray():
    return get_json("goes_xray", "https://services.swpc.noaa.gov/json/goes/primary/xrays-6-hour.json",
                    ttl=300, etiket="GOES uydusu X-ışını akısı")


def donki(tur, gun=10):
    """tur: FLR, CME, SEP, GST — son 10 gün (hastalık sekmesi 10 günlük geçmişe bakar)."""
    a = ayarlar()
    bitis = datetime.now(timezone.utc).date()
    baslangic = bitis - timedelta(days=gun)
    q = urllib.parse.urlencode({"startDate": baslangic.isoformat(), "endDate": bitis.isoformat(),
                                "api_key": a["nasa_api_key"]})
    adlar = {"FLR": "güneş patlamaları", "CME": "koronal kütle atımları",
             "SEP": "enerjik parçacık olayları", "GST": "jeomanyetik fırtınalar"}
    return get_json(f"donki_{tur}", f"https://api.nasa.gov/DONKI/{tur}?{q}", ttl=1800,
                    etiket=f"NASA DONKI {tur} ({adlar.get(tur, tur)})", timeout=20, retry_after=300)


def osdr_ara(konu_id, terim, adet=6):
    q = urllib.parse.urlencode({"term": terim, "type": "cgene", "from": 0, "size": adet})
    return get_json(f"osdr_ara_{konu_id}", f"https://osdr.nasa.gov/osdr/data/search?{q}",
                    ttl=86400, etiket="NASA OSDR arama API", timeout=20, retry_after=300)


def osdr_calisma(accession):
    acc = accession.upper()
    return get_json(f"osdr_calisma_{acc}",
                    f"https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/{acc}/",
                    ttl=86400, etiket="NASA OSDR Biyolojik Veri API", timeout=25, retry_after=300)


def osdr_organizma_sayisi(organizma):
    q = urllib.parse.urlencode({"study.characteristics.organism": organizma, "format": "json.records"})
    key = "osdr_org_" + organizma.replace(" ", "_")
    return get_json(key, f"https://visualization.osdr.nasa.gov/biodata/api/v2/query/datasets/?{q}",
                    ttl=86400, etiket="NASA OSDR Biyolojik Veri API", timeout=30, retry_after=300)


# ------------------------------------------------- 10 günlük geçmiş + ileri tahmin kaynakları

def _gunluk_proton_max(veri):
    """7 günlük 5 dakikalık GOES verisini gün başına en yüksek >=10 MeV akısına indirger."""
    gunler = {}
    for d in veri if isinstance(veri, list) else []:
        if not isinstance(d, dict) or str(d.get("energy", "")).replace(" ", "") != ">=10MeV":
            continue
        try:
            f = float(d.get("flux"))
        except (TypeError, ValueError):
            continue
        g = str(d.get("time_tag", ""))[:10]
        if len(g) == 10:
            gunler[g] = max(gunler.get(g, 0.0), f)
    return [{"tarih": g, "max_pfu": round(v, 4)} for g, v in sorted(gunler.items())]


def goes_proton_7gun():
    return get_json("goes_proton_7g", "https://services.swpc.noaa.gov/json/goes/primary/integral-protons-7-day.json",
                    ttl=1800, etiket="GOES proton akısı (7 gün)", timeout=25, retry_after=300,
                    donustur=_gunluk_proton_max)


def noaa_olasilik():
    """NOAA SWPC 1-3 günlük olasılıklar: M/X patlaması ve >=10 MeV proton olayı (%)."""
    return get_json("noaa_olasilik", "https://services.swpc.noaa.gov/json/solar_probabilities.json",
                    ttl=3600, etiket="NOAA SWPC olay olasılıkları (3 gün)", retry_after=300)


_AYLAR = {a: i + 1 for i, a in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"])}


def _27gun_cozumle(metin):
    """'2026 Nov 17     145      5      2' satırlarını okur (tarih, F10.7, Ap, en büyük Kp)."""
    out = []
    for satir in str(metin).splitlines():
        p = satir.split()
        if len(p) >= 6 and p[0].isdigit() and p[1] in _AYLAR:
            try:
                tarih = f"{int(p[0]):04d}-{_AYLAR[p[1]]:02d}-{int(p[2]):02d}"
                out.append({"tarih": tarih, "f107": float(p[3]), "ap": float(p[4]), "kp_max": float(p[5])})
            except ValueError:
                continue
    if not out:
        raise ValueError("27 günlük tahmin tablosu okunamadı")
    return out


def noaa_27gun():
    return get_json("noaa_27g", "https://services.swpc.noaa.gov/text/27-day-outlook.txt",
                    ttl=6 * 3600, etiket="NOAA SWPC 27 günlük görünüm", retry_after=600,
                    donustur=_27gun_cozumle, metin=True)
