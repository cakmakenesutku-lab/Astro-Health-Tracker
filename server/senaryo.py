"""Demo senaryosu: Mayıs 2024 G5 süper jeomanyetik fırtınası.

Uzay havası sunum günü sakinse, jüriye sistemin bir fırtınada nasıl tepki
verdiğini göstermek için kullanılır. Kp ve CME değerleri NASA DONKI kayıtlarından
alınmıştır (GST 2024-05-10T15:00:00-GST-001, CME 2024-05-08T05:36:00-CME-001).
Proton akısı DONKI'de yer almadığından senaryo için VARSAYILMIŞTIR.
"""
from datetime import datetime, timezone

SENARYO_ZAMANI = datetime(2024, 5, 11, 0, 0, tzinfo=timezone.utc)

HAM = {
    "kp": [
        {"time_tag": "2024-05-10T15:00:00", "Kp": 5.0},
        {"time_tag": "2024-05-11T00:00:00", "Kp": 9.0},
    ],
    "kp_tahmin": [
        {"time_tag": "2024-05-11T00:00:00", "kp": 9.0, "observed": "observed"},
        {"time_tag": "2024-05-11T03:00:00", "kp": 9.0, "observed": "predicted"},
        {"time_tag": "2024-05-11T12:00:00", "kp": 9.0, "observed": "predicted"},
        {"time_tag": "2024-05-12T06:00:00", "kp": 7.0, "observed": "predicted"},
        {"time_tag": "2024-05-13T00:00:00", "kp": 6.33, "observed": "predicted"},
        {"time_tag": "2024-05-14T00:00:00", "kp": 3.0, "observed": "predicted"},
    ],
    "proton": [
        {"time_tag": "2024-05-10T23:00:00Z", "satellite": 18, "flux": 12.0, "energy": ">=10 MeV"},
        {"time_tag": "2024-05-10T23:30:00Z", "satellite": 18, "flux": 18.0, "energy": ">=10 MeV"},
        {"time_tag": "2024-05-11T00:00:00Z", "satellite": 18, "flux": 20.0, "energy": ">=10 MeV"},
    ],
    "xray": [],
    # 1-10 Mayıs 2024 X sınıfı patlamalar ve 8 Mayıs'ın büyük M patlamaları (zirve zamanları:
    # SIDC/STCE bültenleri ve NOAA listeleri). Hastalık sekmesinin 10 günlük geçmişi için.
    "FLR": [
        {"flrID": "2024-05-05T06:01-FLR", "peakTime": "2024-05-05T06:01Z", "classType": "X1.3", "activeRegionNum": 13663},
        {"flrID": "2024-05-05T11:54-FLR", "peakTime": "2024-05-05T11:54Z", "classType": "X1.2", "activeRegionNum": 13663},
        {"flrID": "2024-05-06T06:35-FLR", "peakTime": "2024-05-06T06:35Z", "classType": "X4.5", "activeRegionNum": 13663},
        {"flrID": "2024-05-08T01:41-FLR", "peakTime": "2024-05-08T01:41Z", "classType": "X1.0", "activeRegionNum": 13663},
        {"flrID": "2024-05-08T07:41-FLR", "peakTime": "2024-05-08T07:41Z", "classType": "M4.5", "activeRegionNum": 13664},
        {"flrID": "2024-05-08T12:04-FLR", "peakTime": "2024-05-08T12:04Z", "classType": "M8.6", "activeRegionNum": 13664},
        {"flrID": "2024-05-08T17:53-FLR", "peakTime": "2024-05-08T17:53Z", "classType": "M7.9", "activeRegionNum": 13664},
        {"flrID": "2024-05-08T21:40-FLR", "peakTime": "2024-05-08T21:40Z", "classType": "X1.0", "activeRegionNum": 13664},
        {"flrID": "2024-05-09T09:13-FLR", "peakTime": "2024-05-09T09:13Z", "classType": "X2.2", "activeRegionNum": 13664},
        {"flrID": "2024-05-09T17:44-FLR", "peakTime": "2024-05-09T17:44Z", "classType": "X1.1", "activeRegionNum": 13664},
        {"flrID": "2024-05-10T06:54-FLR", "peakTime": "2024-05-10T06:54Z", "classType": "X3.9", "activeRegionNum": 13664},
    ],
    "SEP": [],
    "GST": [
        {"gstID": "2024-05-10T15:00:00-GST-001", "startTime": "2024-05-10T15:00Z",
         "allKpIndex": [{"observedTime": "2024-05-11T00:00Z", "kpIndex": 9.0, "source": "NOAA"},
                        {"observedTime": "2024-05-11T03:00Z", "kpIndex": 9.0, "source": "NOAA"},
                        {"observedTime": "2024-05-11T12:00Z", "kpIndex": 9.0, "source": "NOAA"},
                        {"observedTime": "2024-05-12T06:00Z", "kpIndex": 7.0, "source": "NOAA"}],
         "link": "https://ccmc.gsfc.nasa.gov/DONKI/view/GST/30693/-1"},
    ],
    "CME": [
        {"activityID": "2024-05-08T05:36:00-CME-001", "startTime": "2024-05-08T05:36Z",
         "cmeAnalyses": [{"isMostAccurate": True, "speed": 870.0, "type": "C",
                          "enlilList": [{"estimatedShockArrivalTime": "2024-05-10T12:14Z", "isEarthGB": False}]}],
         "link": None},
    ],
}

# May 2024 scenario metadata used by the analysis API.
BILGI = {"senaryo": {"id": "mayis2024", "zaman": "2024-05-11T00:00:00Z", "proton_varsayim": True}}
