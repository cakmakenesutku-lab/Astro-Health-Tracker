"""Yörünge, Güneş ve bölge hesapları (yalnızca Python standart kütüphanesi).

Buradaki yörünge modeli dairesel bir yörüngedir. Canlı ISS konumuna "sabitlenir"
ve önümüzdeki birkaç saat için yer izini (ground track) tahmin eder. Gerçek
yörünge tahmini (SGP4) kadar hassas değildir; hackathon demosu ve EVA penceresi
gösterimi için yeterlidir.
"""
import math
import time

DEG = math.pi / 180.0
EARTH_RADIUS_KM = 6371.0
ISS_INCLINATION_DEG = 51.64          # ISS yörünge eğimi
ISS_PERIOD_MIN = 92.68               # bir tur süresi (dakika)
EARTH_ROT_RAD_S = 7.2921159e-5       # Dünya'nın dönüş hızı
NODAL_REGRESSION_DEG_DAY = -5.0      # J2 etkisiyle düğüm noktası kayması (yaklaşık)

# Güney Atlantik Anomalisi (SAA) - ~400 km irtifa için YAKLAŞIK sınır (boylam, enlem)
SAA_POLYGON = [
    (-90, -15), (-80, -6), (-60, -1), (-40, 0), (-20, -4), (0, -9), (20, -17),
    (35, -25), (40, -35), (30, -45), (10, -50), (-20, -52), (-50, -50),
    (-75, -42), (-90, -30),
]


def normalize_lon(lon):
    lon = (lon + 180.0) % 360.0 - 180.0
    return lon


def point_in_polygon(lon, lat, poly):
    inside = False
    n = len(poly)
    j = n - 1
    for i in range(n):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > lat) != (yj > lat):
            x_cross = (xj - xi) * (lat - yi) / ((yj - yi) or 1e-12) + xi
            if lon < x_cross:
                inside = not inside
        j = i
    return inside


def zone_of(lat, lon):
    """ISS'in bulunduğu radyasyon bölgesi."""
    if point_in_polygon(normalize_lon(lon), lat, SAA_POLYGON):
        return "SAA"
    if abs(lat) >= 45:
        return "YUKSEK_ENLEM"
    if abs(lat) <= 20:
        return "EKVATOR"
    return "ORTA_ENLEM"


ZONE_NAMES = {
    "SAA": "Güney Atlantik Anomalisi",
    "YUKSEK_ENLEM": "Yüksek enlem / kutup bölgesi",
    "EKVATOR": "Ekvator kuşağı",
    "ORTA_ENLEM": "Orta enlem",
}


def subsolar_point(ts):
    """Güneş'in tam tepede olduğu nokta (enlem, boylam) - yaklaşık formül."""
    jd = ts / 86400.0 + 2440587.5
    n = jd - 2451545.0
    L = (280.460 + 0.9856474 * n) % 360
    g = ((357.528 + 0.9856003 * n) % 360) * DEG
    lam = (L + 1.915 * math.sin(g) + 0.020 * math.sin(2 * g)) * DEG
    eps = (23.439 - 0.0000004 * n) * DEG
    ra = math.atan2(math.cos(eps) * math.sin(lam), math.cos(lam))
    dec = math.asin(math.sin(eps) * math.sin(lam))
    gmst = (280.46061837 + 360.98564736629 * n) % 360
    lon = normalize_lon(ra / DEG - gmst)
    return dec / DEG, lon


def _unit(lat, lon):
    la, lo = lat * DEG, lon * DEG
    return (math.cos(la) * math.cos(lo), math.cos(la) * math.sin(lo), math.sin(la))


def is_sunlit(lat, lon, alt_km, ts):
    """ISS Güneş ışığında mı (silindirik gölge modeli)?"""
    slat, slon = subsolar_point(ts)
    r = EARTH_RADIUS_KM + alt_km
    p = _unit(lat, lon)
    s = _unit(slat, slon)
    c = p[0] * s[0] + p[1] * s[1] + p[2] * s[2]
    if c >= 0:
        return True
    perp = r * math.sqrt(max(0.0, 1 - c * c))
    return perp > EARTH_RADIUS_KM


class OrbitModel:
    """Canlı konuma sabitlenen basit dairesel yörünge modeli."""

    def __init__(self, lat, lon, ascending, ts, alt_km=420.0):
        self.alt_km = alt_km
        self.inc = ISS_INCLINATION_DEG * DEG
        self.n = 2 * math.pi / (ISS_PERIOD_MIN * 60.0)
        self.t0 = ts
        s = max(-1.0, min(1.0, math.sin(lat * DEG) / math.sin(self.inc)))
        u0 = math.asin(s)
        if not ascending:
            u0 = math.pi - u0
        self.u0 = u0
        self.node0 = lon * DEG - self._dlon(u0)

    def _dlon(self, u):
        return math.atan2(math.cos(self.inc) * math.sin(u), math.cos(u))

    def position(self, ts):
        dt = ts - self.t0
        u = self.u0 + self.n * dt
        node = self.node0 - EARTH_ROT_RAD_S * dt + NODAL_REGRESSION_DEG_DAY * DEG * dt / 86400.0
        lat = math.asin(math.sin(self.inc) * math.sin(u)) / DEG
        lon = normalize_lon((node + self._dlon(u)) / DEG)
        return lat, lon


def default_model(ts=None):
    """İnternet hiç yoksa kullanılan simülasyon başlangıcı."""
    ts = ts or time.time()
    return OrbitModel(0.0, 0.0, True, ts - (ts % (ISS_PERIOD_MIN * 60)))


def track(model, ts_from, ts_to, step_s=60):
    pts = []
    t = ts_from
    while t <= ts_to:
        lat, lon = model.position(t)
        pts.append({"t": int(t), "lat": round(lat, 3), "lon": round(lon, 3)})
        t += step_s
    return pts
