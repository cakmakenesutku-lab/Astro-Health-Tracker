/* AstroHealth Tracker — arayüz uygulaması (ek kütüphane gerektirmez; Leaflet + Chart.js yerel) */
(function () {
  "use strict";

  /* ================================================================ hastalık öyküsü olan mürettebat */
  const KARAR_SEV = { KAL: "DUSUK", IZLE: "ORTA", PLANLA: "YUKSEK", ACIL: "KRITIK" };
  const puanSeviye = (x) => (x < 25 ? "DUSUK" : x < 50 ? "ORTA" : x < 75 ? "YUKSEK" : "KRITIK");
  function hastalikGuncelle() {
    if (S.hst.yukleniyor) return Promise.resolve();
    S.hst.yukleniyor = true;
    if (!S.hst.veri) $("hstDurum").textContent = t("hst.yukleniyor");
    const q = "/api/hastalik?eva=" + (S.eva ? 1 : 0) + (S.senaryo ? "&senaryo=" + S.senaryo : "");
    return getir(q, 60000).then((v) => {
      S.hst.veri = v;
      if (!v.astronotlar.some((a) => a.id === S.hst.secili)) S.hst.secili = v.astronotlar[0].id;
      hastalikCiz();
    }).catch(() => { $("hstDurum").textContent = t("hst.hata"); }).finally(() => { S.hst.yukleniyor = false; });
  }
  function hstGunEtiket(g) { return g.tur === "bugun" ? t("hst.bugun") : gunYaz(g.tarih); }
  function hstCevreGunleri(v) { return v.cevre.gecmis.concat([v.cevre.bugun], v.cevre.tahmin); }
  function hstParam(p) {
    const o = Object.assign({}, p || {});
    if (o.yuzde != null) o.yuzde = yuzde(o.yuzde, 1);
    if (o.t != null) o.t = sayi(o.t, 2); if (o.tson != null) o.tson = sayi(o.tson, 2);
    if (o.doz != null) o.doz = sayi(o.doz, 1);
    if ("sonraki" in o) o.sonraki = o.sonraki ? saatYaz(o.sonraki) : "—";
    return o;
  }
  function hastalikCiz() {
    const v = S.hst.veri; if (!v) return;
    const notlar = [t("hst.guncel", { z: tarihSaatYaz(v.zaman) })];
    if (v.eva) notlar.push(t("hst.evaNot"));
    $("hstDurum").textContent = notlar.join(" ");
    hstCevreCiz(v); hstKartlarCiz(v); hstDetayCiz(v);
  }
  function hstCevreCiz(v) {
    const gunler = hstCevreGunleri(v), R = SEV_RENK();
    grafik("hstCevreGrafik", {
      type: "bar",
      data: {
        labels: gunler.map(hstGunEtiket),
        datasets: [{
          label: t("hst.cevreEksen"), data: gunler.map((g) => Math.max(g.cevre, 1.5)),
          backgroundColor: gunler.map((g) => R[puanSeviye(g.cevre)] + (g.tur === "tahmin" ? "55" : "")),
          borderColor: gunler.map((g) => (g.tur === "bugun" ? css("--murekkep") : R[puanSeviye(g.cevre)])),
          borderWidth: gunler.map((g) => (g.tur === "gecmis" ? 0 : 2)),
          borderDash: [4, 3], borderRadius: 4, barPercentage: .86, categoryPercentage: 1
        }]
      },
      options: {
        maintainAspectRatio: false, animation: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: {
            title: (it) => { const g = gunler[it[0].dataIndex]; return gunYaz(g.tarih) + (g.tur === "bugun" ? " · " + t("hst.bugun") : ""); },
            label: (c) => t("hst.cevreEksen") + ": " + gunler[c.dataIndex].cevre,
            afterBody: (it) => {
              const g = gunler[it[0].dataIndex], out = [];
              out.push(t(g.kp_max == null ? "hst.ipucuKpYok" : "hst.ipucuKp", { kp: sayi(g.kp_max, 1), G: g.G, S: g.S }));
              if (g.tur !== "gecmis" && g.p_proton) out.push(t("hst.ipucuP", { p: yuzde(100 * g.p_proton, 0) }));
              if (g.m || g.x) out.push(t("hst.ipucuPatlama", { m: g.m || 0, x: g.x || 0 }));
              if (g.sep) out.push(t("hst.ipucuSep"));
              if (g.cme_varis) out.push(t("hst.ipucuCme"));
              out.push(t("hst.kaynak." + g.kaynak) + (g.tur === "tahmin" ? ", " + t("hst.guven." + g.guven) : ""));
              return out;
            }
          } }
        },
        scales: { y: eksen(t("hst.cevreEksen"), { min: 0, max: 100, ticks: { stepSize: 25, color: css("--murekkep-2") } }),
          x: eksen("", { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 18, color: css("--murekkep-2"), font: { size: 11 } } }) }
      }
    });
    const kaynaklar = Array.from(new Set(v.cevre.tahmin.map((g) => g.kaynak)));
    $("hstLejant").innerHTML = ["DUSUK", "ORTA", "YUKSEK", "KRITIK"].map((k) => '<span><i class="d-' + k + '"></i>' + esc(t("seviye." + k)) + "</span>").join("") +
      '<span><i class="tahmin"></i>' + esc(t("hst.tahmin")) + ": " + esc(kaynaklar.map((k) => t("hst.kaynak." + k)).join(", ")) + "</span>";
    const e = v.cevre.egilim;
    $("hstEgilim").innerHTML = "<strong>" + esc(buyukHarf(t("hst.egilim." + e.durum))) + ".</strong> " +
      esc(t("hst.egilimCumle", { e: t("hst.egilim." + e.durum), m: e.m_patlama_10g, x: e.x_patlama_10g, sep: e.sep_10g, g: e.g_gun_10g, cme: e.cme_10g })) +
      ' <span class="ince">' + esc(t("hst.olasilikKaynagi." + e.olasilik_kaynagi)) + "</span>";
    const i = v.iss_gun;
    $("hstIss").textContent = i ? t("hst.issCumle", { saa: i.saa_dk_24s, yuk: i.yuksek_enlem_dk_24s, sonraki: i.sonraki_saa ? saatYaz(i.sonraki_saa) : "—" }) : "";
  }
  function hstKartlarCiz(v) {
    $("hstKartlar").innerHTML = v.astronotlar.map((a) => {
      const b = a.bugun || { skor: 0, seviye: "DUSUK" };
      return '<button type="button" class="hst-kart s-' + b.seviye + '" data-astronot="' + esc(a.id) + '" aria-pressed="' + (S.hst.secili === a.id) + '">' +
        '<span class="ad">' + esc(a.ad) + '</span><span class="hast">' + esc(t("hst.h." + a.hastalik + ".ad")) + "</span>" +
        '<span class="alt-satir"><span class="puan s-yazi-' + b.seviye + '">' + b.skor + "<small>" + esc(t("seviye." + b.seviye)) + "</small></span>" +
        '<span class="karar-rozet k-' + a.karar.seviye + '" id="kr-' + esc(a.id) + '">' + esc(t("hst.kararKisa." + a.karar.seviye)) + "</span></span>" +
        '<span class="gun">' + esc(t("hst.gorevGun", { g: a.gorev_gunu, t: a.gorev_suresi })) + " · " + esc(t("hst.yas", { y: a.yas })) + "</span>" + hstKartBulgu(a.id) + "</button>";
    }).join("");
  }
  function hstKartBulgu(id) {
    const a = vitAstronot(id);
    const k = (ad) => 'id="vm-' + esc(id) + "-" + ad + '"';
    const html = '<span class="vit-mini" ' + k("kap") + '><span class="kalp-at" ' + k("k") + ' aria-hidden="true">♥</span>' +
      '<span class="vb" ' + k("n") + "></span>" + '<span class="vb" ' + k("t") + "></span>" +
      '<span class="vb" ' + k("r") + "></span>" + '<span class="vb" ' + k("o") + "></span>" + '<span class="vb" ' + k("a") + "></span></span>";
    if (a) setTimeout(() => hstKartBulguGuncelle(a), 0);
    return html;
  }
  function hstKartBulguGuncelle(a) {
    const n = a.an, d = n.durum, el = (x) => document.getElementById("vm-" + a.id + "-" + x);
    if (!el("n")) return;
    const yaz = (x, alan, metin) => { const e = el(x); e.textContent = metin; e.className = "vb v-" + d[alan]; };
    yaz("n", "nabiz", n.nabiz + (n.ritim === "duzensiz" ? "~" : ""));
    yaz("t", "tansiyon", n.sistolik + "/" + n.diyastolik);
    yaz("r", "solunum", n.solunum + t("hst.v.dk"));
    yaz("o", "spo2", S.dil === "en" ? n.spo2 + "%" : "%" + n.spo2);
    yaz("a", "ates", sayi(n.ates, 1) + "°");
    const kalp = el("k"), atis = (60 / Math.max(30, n.nabiz)).toFixed(2) + "s";
    if (kalp.style.getPropertyValue("--atis") !== atis) kalp.style.setProperty("--atis", atis);
    const kart = el("kap").closest(".hst-kart");
    if (kart) kart.classList.toggle("alarmda", n.seviye === "zarar" || !!vitAlarmi(a.id));
    const rz = document.getElementById("kr-" + a.id), h = S.hst.veri && S.hst.veri.astronotlar.find((x) => x.id === a.id);
    if (rz && h) {
      const sev = etkinKarar(h).seviye;
      rz.className = "karar-rozet k-" + sev; rz.textContent = t("hst.kararKisa." + sev);
    }
  }
  function vitAlarmi(id) { const v = S.vit.veri; return v ? v.alarmlar.find((al) => al.id === id) : null; }
  function gunFarki(tarih) {
    const b = S.hst.veri && S.hst.veri.tarih; if (!tarih || !b) return null;
    return Math.round((Date.parse(tarih + "T00:00:00Z") - Date.parse(b + "T00:00:00Z")) / 86400000);
  }
  /* Karar + canlı yaşamsal bulgu alarmı: alarm varsa karar "acil değerlendirme"ye çıkar ve en yakın tarih önerilir. */
  function etkinKarar(a) {
    const k = a.karar, al = vitAlarmi(a.id);
    if (al && k.seviye !== "ACIL") {
      return { seviye: "ACIL", vital: true, nedenler: [{ k: "VITAL_ALARM", olay: al.olay }].concat(k.nedenler),
        oneri: { tarih: k.acil_donus, tur: "acil", gun: gunFarki(k.acil_donus) } };
    }
    return { seviye: k.seviye, nedenler: k.nedenler, oneri: k.onerilen_donus || { tarih: a.planlanan_donus, tur: "plan", gun: a.gorev_suresi - a.gorev_gunu } };
  }
  function nedenMetni(n) {
    const p = Object.assign({}, n);
    if (p.yuzde != null) p.yuzde = yuzde(p.yuzde, 1);
    if (p.t != null) p.t = sayi(p.t, 2);
    if (p.olay) p.olay = t("hst.v.olay." + p.olay);
    return t("hst.neden_." + n.k, p);
  }
  function donusMetni(o) {
    if (!o || !o.tarih) return t("hst.donusYok");
    const g = o.gun != null ? o.gun : gunFarki(o.tarih);
    const goreli = g === 0 ? t("hst.bugunKisa") : g === 1 ? t("hst.yarin") : t("hst.kalan", { n: g });
    return gunYaz(o.tarih) + " (" + goreli + ")";
  }
  function hstDetayCiz(v) {
    const a = v.astronotlar.find((x) => x.id === S.hst.secili) || v.astronotlar[0];
    const h = "hst.h." + a.hastalik + ".";
    const kaynak = t(h + "kaynak") || [];
    let sayilar = sayiKutu(a.gorev_gunu + "/" + a.gorev_suresi, "", t("hst.gorev")) + sayiKutu(sayi(a.kum_doz_msv, 0), "mSv", t("hst.doz"));
    if (a.ozel && a.ozel.t_skor_bugun != null) sayilar += sayiKutu(sayi(a.ozel.t_skor_bugun, 2), "", t("hst.tskor")) + sayiKutu(sayi(a.ozel.t_skor_gorev_sonu, 2), "", t("hst.tskorSon"));
    else if (a.ozel && a.ozel.kariyer_yuzde != null) sayilar += sayiKutu(yuzde(a.ozel.kariyer_yuzde, 1), "", t("hst.kariyer"));
    $("hstProfil").innerHTML = "<h2>" + esc(a.ad) + '</h2><p class="kimlik">' + esc(t("hst.yas", { y: a.yas })) + " · " + esc(a.ulke) + "</p>" +
      '<p class="tani">' + esc(t(h + "ad")) + "</p><p>" + esc(t(h + "tam")) + "</p>" +
      '<div class="sayilar">' + sayilar + "</div>" +
      "<h3>" + esc(t("hst.neden")) + '</h3><p class="neden">' + esc(t(h + "neden")) + "</p>" +
      "<h3>" + esc(t("hst.kaynaklar")) + '</h3><ul class="kaynak-liste">' + kaynak.map((k) => '<li><a href="' + esc(k[1]) + '" target="_blank" rel="noopener">' + esc(k[0]) + "</a></li>").join("") +
      '<li><a href="#arastirma" data-konu="' + esc(a.osdr_konu) + '">' + esc(t("hst.osdr")) + "</a></li></ul>";

    const k = a.karar, ek = etkinKarar(a);
    const nedenler = ek.nedenler.map((n) => "<li>" + esc(nedenMetni(n)) + "</li>").join("");
    $("hstKarar").className = "panel hst-karar ekran-yalniz k-" + ek.seviye;
    $("hstKarar").innerHTML = "<h2>" + esc(t("hst.donusBaslik")) + '</h2><div class="karar-buyuk s-yazi-' + KARAR_SEV[ek.seviye] + '">' + esc(t("hst.karar." + ek.seviye + ".b")) + "</div>" +
      "<p>" + esc(ek.vital ? t("hst.kararVital") : t("hst.karar." + ek.seviye + ".d")) + "</p><ul>" + nedenler + "</ul><dl>" +
      '<div class="onerilen"><dt>' + esc(t("hst.onerilenDonus")) + "</dt><dd>" + esc(donusMetni(ek.oneri)) +
      '<span class="donus-not">' + esc(t("hst.donusTur." + ek.oneri.tur)) + "</span></dd></div>" +
      "<div><dt>" + esc(t("hst.enUygun")) + "</dt><dd>" + esc(k.en_uygun_gun ? gunYaz(k.en_uygun_gun) : t("hst.enUygunYok")) + "</dd></div>" +
      "<div><dt>" + esc(t("hst.kacin")) + "</dt><dd>" + esc(k.kacinilacak_gunler.length ? k.kacinilacak_gunler.map(gunYaz).join(", ") : t("hst.kacinYok")) + "</dd></div>" +
      (ek.oneri.tur !== "plan" ? "<div><dt>" + esc(t("hst.gorevSonu")) + "</dt><dd>" + esc(gunYaz(k.planlanan_donus || a.planlanan_donus)) + "</dd></div>" : "") + "</dl>";

    $("hstGrafikBaslik").textContent = t("hst.kisiselBaslik") + " — " + a.ad;
    const pb = a.bugun && a.bugun.parcalar;
    $("hstParcalar").textContent = pb ? t("hst.parca", { c: pb.cevre, k: pb.kronik, e: pb.eva }) : "";
    hstKisiGrafik(v, a);

    $("hstUyarilar").innerHTML = a.uyarilar.length ? a.uyarilar.map((u) => {
      const p = hstParam(u.p);
      const tar = u.tarihler.length ? '<div class="tarihler">' + esc(t("hst.tarihler", { t: u.tarihler.map((x) => (x === v.tarih ? t("hst.bugun") : gunYaz(x))).join(", ") })) + "</div>" : "";
      return '<li class="' + u.oncelik + '"><div class="ob"><span class="oe">' + esc(t("oncelik." + u.oncelik)) + "</span>" + esc(t("hst.u." + u.k + ".b", p)) +
        '</div><div class="od">' + esc(t("hst.u." + u.k + ".d", p)) + "</div>" + tar + "</li>";
    }).join("") : '<li class="rutin"><div class="od">' + esc(t("hst.uyariYok")) + "</div></li>";
    $("hstYap").innerHTML = (t(h + "yap") || []).map((x) => "<li>" + esc(x) + "</li>").join("");
    $("hstYapma").innerHTML = (t(h + "yapma") || []).map((x) => "<li>" + esc(x) + "</li>").join("");
  }
  function hstKisiGrafik(v, a) {
    const g = a.gunler, R = SEV_RENK();
    const deger = (x) => (x.gorev_disi ? null : x.skor);
    const bugunI = g.findIndex((x) => x.tur === "bugun");
    grafik("hstKisiGrafik", {
      type: "line",
      data: {
        labels: g.map(hstGunEtiket),
        datasets: [
          { label: t("hst.gozlem"), data: g.map((x, i) => (i <= bugunI ? deger(x) : null)), borderColor: css("--seri-1"), borderWidth: 2.5, tension: .25, spanGaps: false,
            pointRadius: g.map((x, i) => (i === bugunI ? 6 : 3)), pointBackgroundColor: g.map((x) => (x.gorev_disi ? "transparent" : R[x.seviye])), pointBorderColor: css("--panel") },
          { label: t("hst.tahmin"), data: g.map((x, i) => (i >= bugunI ? deger(x) : null)), borderColor: css("--seri-1"), borderDash: [6, 5], borderWidth: 2, tension: .25,
            pointRadius: g.map((x, i) => (i > bugunI ? 3 : 0)), pointBackgroundColor: g.map((x) => (x.gorev_disi ? "transparent" : R[x.seviye] || "transparent")), pointBorderColor: css("--panel") }
        ]
      },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { boxWidth: 12, color: css("--murekkep-2") } },
          tooltip: { filter: (it) => it.raw != null && !(it.datasetIndex === 1 && it.dataIndex === bugunI), callbacks: {
            title: (it) => gunYaz(g[it[0].dataIndex].tarih),
            label: (c) => { const x = g[c.dataIndex]; return x.gorev_disi ? "" : x.skor + "/100 · " + t("seviye." + x.seviye) + " · " + t("hst.gorev") + " " + x.gorev_gunu; },
            afterLabel: (c) => { const x = g[c.dataIndex]; return x.parcalar ? t("hst.parca", { c: x.parcalar.cevre, k: x.parcalar.kronik, e: x.parcalar.eva }) : ""; }
          } }
        },
        scales: { y: eksen(t("hst.kisiselEksen"), { min: 0, max: 100, ticks: { stepSize: 25, color: css("--murekkep-2") } }),
          x: eksen("", { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 18, color: css("--murekkep-2"), font: { size: 11 } } }) }
      }
    });
  }


  /* ================================================================ yaşamsal bulgular ve alarmlar */
  const VIT_ALAN = [
    { k: "nabiz", birim: "dk", deger: (a) => a.nabiz, seri: "nabiz" },
    { k: "tansiyon", birim: "mmHg", deger: (a) => a.sistolik + "/" + a.diyastolik, seri: "sistolik" },
    { k: "solunum", birim: "dk", deger: (a) => a.solunum, seri: "solunum" },
    { k: "spo2", birim: "%", deger: (a) => a.spo2, seri: "spo2" },
    { k: "ates", birim: "°C", deger: (a) => sayi(a.ates, 1), seri: "ates" }
  ];
  function vitalGuncelle(seriIste) {
    if (S.vit.yukleniyor) return Promise.resolve();
    S.vit.yukleniyor = true;
    const tam = S.gorunum === "hastalik" && (seriIste || !S.vit.seriZaman || Date.now() - S.vit.seriZaman > 30000);
    const q = "/api/vital?gecmis=" + (tam ? 60 : 0) + "&eva=" + (S.eva ? 1 : 0) + (S.senaryo ? "&senaryo=" + S.senaryo : "");
    return getir(q, 15000).then((v) => {
      if (tam) { S.vit.seri = {}; v.astronotlar.forEach((a) => { S.vit.seri[a.id] = a.seri; }); S.vit.seriZaman = Date.now(); }
      else if (S.vit.seri) v.astronotlar.forEach((a) => { if (S.vit.seri[a.id]) a.seri = S.vit.seri[a.id]; });
      S.vit.veri = v; vitalCiz();
    })
      .catch(() => { if ($("vitDurum")) $("vitDurum").textContent = t("hst.v.hata"); })
      .finally(() => { S.vit.yukleniyor = false; });
  }
  function vitAstronot(id) { const v = S.vit.veri; return v ? v.astronotlar.find((a) => a.id === id) : null; }
  function vitOnaysiz() { const v = S.vit.veri; return v ? v.alarmlar.filter((al) => !S.vit.onay[al.alarm_id]) : []; }
  function vitAralik(an, k) {
    const s = an.sinir; if (!s) return "";
    const f = (x) => (k === "ates" ? sayi(x, 1) : x);
    if (k === "nabiz") return f(s.nabiz_alt[0]) + "–" + f(s.nabiz_ust[0]);
    if (k === "tansiyon") return s.sistolik_alt[0] + "–" + s.sistolik_ust[0] + " / <" + s.diyastolik_ust[0];
    if (k === "solunum") return s.solunum_alt[0] + "–" + s.solunum_ust[0];
    if (k === "spo2") return "≥ " + s.spo2_alt[0];
    return f(s.ates_alt[0]) + "–" + f(s.ates_ust[0]);
  }
  function kivrim(dizi) {
    const d = (dizi || []).filter((x) => x != null);
    if (d.length < 2) return "";
    const mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), ar = (mx - mn) || 1;
    const nk = d.map((x, i) => (i * 100 / (d.length - 1)).toFixed(1) + "," + (28 - (x - mn) / ar * 24).toFixed(1)).join(" ");
    return '<svg class="kivrim" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + nk + '"/></svg>';
  }
  function vitalCiz() {
    const v = S.vit.veri; if (!v) return;
    // Menü rozeti: görülmemiş alarm sayısı
    const ons = vitOnaysiz();
    const rz = $("vitRozet");
    if (rz) { rz.hidden = !ons.length; rz.textContent = ons.length; rz.title = t("hst.v.rozet", { n: ons.length }); }
    v.astronotlar.forEach(hstKartBulguGuncelle);
    const imza = v.alarmlar.map((al) => al.alarm_id + (S.vit.onay[al.alarm_id] ? "+" : "")).join("|") + "|" + S.dil;
    if (imza !== S.vit.alarmImza) {
      S.vit.alarmImza = imza; vitAlarmCiz();
      if (S.hst.veri) hstDetayCiz(S.hst.veri);
    }
    vitPanelCiz();
    monitorGuncelle();
  }
  function vitSorunMetni(s) { return t("hst.v.sorun." + s.k) + " (" + (typeof s.deger === "number" && s.deger % 1 ? sayi(s.deger, 1) : s.deger) + ")"; }
  function vitAlarmCiz() {
    const v = S.vit.veri, kutu = $("vitAlarmlar"); if (!kutu || !v) return;
    const liste = v.alarmlar.slice().sort((a, b) => b.baslangic - a.baslangic);
    if (!liste.length) { kutu.hidden = true; kutu.innerHTML = ""; return; }
    kutu.hidden = false;
    kutu.innerHTML = liste.map((al) => {
      const gorulmus = !!S.vit.onay[al.alarm_id];
      const b = al.bulgular;
      const kim = al.sorumlu ? t("hst.v.murettebata", { s: al.sorumlu.ad }) + (al.yardimci ? t("hst.v.ve", { y: al.yardimci.ad }) : "") : t("hst.v.murettebataYok");
      const liste2 = (k) => (t("hst.v.oneri." + al.olay + "." + k) || []).map((x) => "<li>" + esc(x) + "</li>").join("");
      const ust = '<div class="vit-alarm-ust"><span class="vit-alarm-etiket">' + esc(t("hst.v.alarm")) + "</span>" +
        '<span class="vit-alarm-zaman">' + esc(saatYaz(al.baslangic)) + "</span>" +
        '<h3>' + esc(al.ad) + " · " + esc(t("hst.yas", { y: al.yas })) + " — " + esc(t("hst.v.olay." + al.olay)) + "</h3>" +
        (gorulmus ? '<span class="vit-gorundu">' + esc(t("hst.v.gorundu")) + "</span>" :
          '<button type="button" class="dugme" data-onay="' + esc(al.alarm_id) + '">' + esc(t("hst.v.gordum")) + "</button>") + "</div>";
      if (gorulmus) return '<div class="vit-alarm-kart gorulmus">' + ust + "</div>";
      return '<div class="vit-alarm-kart">' + ust +
        '<p class="vit-alarm-bulgu">' + esc(t("hst.v.bulguSatir", { n: b.nabiz, s: b.sistolik, d: b.diyastolik, r: b.solunum, o: b.spo2, a: sayi(b.ates, 1) })) +
        (b.ritim === "duzensiz" ? " · " + esc(t("hst.v.duzensiz")) : "") + "</p>" +
        (al.sorunlar.length ? '<p class="vit-alarm-zarar">' + esc(t("hst.v.zararli", { l: al.sorunlar.map(vitSorunMetni).join("; ") })) + "</p>" : "") +
        (al.risk >= 70 ? '<p class="vit-alarm-zarar">' + esc(t("hst.v.riskTetik", { r: al.risk })) + "</p>" : "") +
        '<p class="vit-alarm-kim">' + esc(kim) + "</p>" +
        '<div class="vit-oneri"><div><h4>' + esc(t("hst.v.yontem")) + "</h4><ul>" + liste2("yontem") + "</ul></div>" +
        "<div><h4>" + esc(t("hst.v.ilac")) + "</h4><ul>" + liste2("ilac") + "</ul></div>" +
        '<div class="acil"><h4>' + esc(t("hst.v.acil")) + "</h4><ul>" + liste2("acil") + "</ul></div></div>" +
        '<p class="ince">' + esc(t("hst.v.kayitYol", { p: v.kayit_dosyasi })) + " " + esc(t("hst.v.not")) + "</p></div>";
    }).join("");
  }
  function vitPanelCiz() {
    const v = S.vit.veri; if (!v || !$("vitPanel")) return;
    const id = S.hst.secili || (v.astronotlar[0] && v.astronotlar[0].id);
    const a = vitAstronot(id); if (!a) return;
    const an = a.an;
    $("vitBaslik").textContent = t("hst.v.baslik") + " — " + a.ad;
    $("vitDurum").innerHTML = '<span class="vit-etkinlik">' + esc(t("hst.v.aktivite." + an.aktivite)) + "</span> " +
      esc(t("hst.v.guncel", { z: saatYaz(v.zaman) }));
    $("vitKutular").innerHTML = VIT_ALAN.map((f) => {
      const d = an.durum[f.k];
      return '<div class="vit-kutu v-' + d + '"><p class="vit-ad">' + esc(t("hst.v.alan." + f.k)) + "</p>" +
        '<p class="vit-deger">' + esc(String(f.deger(an))) + "<small>" + esc(f.birim === "dk" ? t("hst.v.dk") : f.birim) + "</small></p>" +
        '<p class="vit-seviye">' + esc(t("hst.v.seviye." + d)) + (f.k === "nabiz" && an.ritim === "duzensiz" ? " · " + esc(t("hst.v.duzensiz")) : "") +
        " · " + esc(t("hst.v.guvenli")) + " " + esc(vitAralik(an, f.k)) + "</p>" +
        kivrim(a.seri[f.seri]) + "</div>";
    }).join("");
    const d0 = a.dinlenme;
    $("vitDinlenme").textContent = t("hst.v.dinlenme", { y: a.yas, c: t("hst.v.cinsiyet." + a.cinsiyet), n: d0.nabiz, s: d0.sistolik, d: d0.diyastolik, r: d0.solunum });
    const kay = v.son_kayitlar || [];
    $("vitKayitlar").innerHTML = kay.length ? kay.slice(0, 6).map((k) => '<li class="' + (k.tur === "ALARM" ? "k-alarm" : "k-duzeldi") + '"><span>' + esc(saatYaz(k.zaman)) + "</span> " +
      esc(k.tur === "ALARM" ? t("hst.v.kayitAlarm", { ad: k.ad, yas: k.yas, olay: t("hst.v.olay." + k.olay) }) : t("hst.v.kayitDuzeldi", { ad: k.ad, yas: k.yas, sure: k.sure_dk })) + "</li>").join("")
      : "<li>" + esc(t("hst.v.kayitYok")) + "</li>";
    $("vitDosya").textContent = v.kayit_hatasi ? t("hst.v.kayitHata", { h: v.kayit_hatasi }) : t("hst.v.kayitYol", { p: v.kayit_dosyasi });
  }


  /* ---------------- canlı EKG monitörü (seçili astronot) */
  const EKG = { x: 0, t: 0, son: 0, vurular: [], sonraki: 0, oncekiY: null, anim: false, w: 0, h: 0, dpr: 1 };
  const azHareket = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function monitorAstronot() { const v = S.vit.veri; if (!v) return null; return vitAstronot(S.hst.secili) || v.astronotlar[0]; }
  function monitorGuncelle() {
    const a = monitorAstronot(); if (!a || !$("monNabiz")) return;
    const n = a.an, d = n.durum;
    $("monNabiz").textContent = n.nabiz; $("monTansiyon").textContent = n.sistolik + "/" + n.diyastolik;
    $("monSpo2").textContent = n.spo2; $("monSolunum").textContent = n.solunum; $("monSolunumAd").textContent = t("hst.v.solunumKisa");
    $("monNabiz").parentNode.classList.toggle("alarmli", d.nabiz === "zarar");
    $("monTansiyon").parentNode.classList.toggle("alarmli", d.tansiyon === "zarar");
    $("monSpo2").parentNode.classList.toggle("alarmli", d.spo2 === "zarar");
    $("monSolunum").parentNode.classList.toggle("alarmli", d.solunum === "zarar");
    const r = $("monRitim"); r.textContent = t(n.ritim === "duzensiz" ? "hst.v.ritimDuzensiz" : "hst.v.ritimDuzenli");
    r.classList.toggle("duzensiz", n.ritim === "duzensiz");
    if (!EKG.anim && S.gorunum === "hastalik") { EKG.anim = true; requestAnimationFrame(ekgKare); }
  }
  function ekgBoyut() {
    const c = $("ekgTuval"); if (!c) return false;
    const r = c.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    const w = Math.floor(r.width), h = Math.floor(r.height);
    if (!w) return false;
    if (w !== EKG.w || h !== EKG.h || dpr !== EKG.dpr) {
      EKG.w = w; EKG.h = h; EKG.dpr = dpr; c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.style.width = w + "px"; c.style.height = h + "px";   // tuval = tam piksel, ölçekleme bulanıklığı yok
      const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.fillStyle = "#07121F"; g.fillRect(0, 0, w, h);
      ekgIzgara(g, 0, w); EKG.x = 0; EKG.oncekiY = null;
    }
    return true;
  }
  function ekgIzgara(g, x0, x1) {
    g.strokeStyle = "#0F2438"; g.lineWidth = 1; g.beginPath();
    for (let x = Math.ceil(x0 / 25) * 25; x < x1; x += 25) { g.moveTo(x + .5, 0); g.lineTo(x + .5, EKG.h); }
    for (let y = 0; y < EKG.h; y += 25) { g.moveTo(x0, y + .5); g.lineTo(x1, y + .5); }
    g.stroke();
  }
  const gauss = (s, m, w) => Math.exp(-((s - m) * (s - m)) / (2 * w * w));
  function ekgDeger(tt, af) {
    let y = 0;
    for (const b of EKG.vurular) {
      const s0 = tt - b.t; if (s0 < -0.05 || s0 > 1.2) continue;
      if (!af) y += 0.12 * gauss(s0, 0.06, 0.025);
      y += -0.12 * gauss(s0, 0.15, 0.008) + 1.0 * gauss(s0, 0.17, 0.009) - 0.28 * gauss(s0, 0.19, 0.010) +
        0.32 * gauss(s0, 0.17 + 0.25 * Math.sqrt(b.rr), 0.05);
    }
    if (af) y += 0.05 * Math.sin(2 * Math.PI * 6.3 * tt) + 0.035 * Math.sin(2 * Math.PI * 7.9 * tt + 1.3);
    return y + 0.012 * Math.sin(2 * Math.PI * 0.27 * tt) + (Math.random() - 0.5) * 0.012;
  }
  function ekgKare(simdi) {
    const a = monitorAstronot();
    if (S.gorunum !== "hastalik" || !a || !ekgBoyut()) { EKG.anim = false; return; }
    const g = $("ekgTuval").getContext("2d");
    const hiz = 110;                                   // piksel/saniye
    const dt = EKG.son ? Math.min(0.12, (simdi - EKG.son) / 1000) : 0.016;
    EKG.son = simdi;
    const hr = Math.max(30, a.an.nabiz), af = a.an.ritim === "duzensiz";
    const adim = Math.max(1, Math.round(dt * hiz));
    const orta = EKG.h * 0.62, genlik = EKG.h * 0.42;
    for (let i = 0; i < adim; i++) {
      EKG.t += 1 / hiz;
      if (EKG.t >= EKG.sonraki) {
        const rr = (60 / hr) * (af ? 0.6 + Math.random() * 0.8 : 1 + (Math.random() - 0.5) * 0.05);
        EKG.vurular.push({ t: EKG.sonraki, rr: rr }); if (EKG.vurular.length > 4) EKG.vurular.shift();
        EKG.sonraki = Math.max(EKG.t, EKG.sonraki) + rr;
        const k = $("monKalp"); if (k && !azHareket) { setTimeout(() => k.classList.add("atis"), 170); setTimeout(() => k.classList.remove("atis"), 300); }
      }
      const x = EKG.x, y = orta - ekgDeger(EKG.t, af) * genlik;
      g.fillStyle = "#07121F"; g.fillRect(x, 0, 14, EKG.h); ekgIzgara(g, x, x + 14);
      if (EKG.oncekiY != null && x > 0) {
        g.strokeStyle = a.an.durum.nabiz === "zarar" ? "#FF6B6B" : "#5CE08A"; g.lineWidth = 2; g.lineJoin = "round";
        g.beginPath(); g.moveTo(x - 1, EKG.oncekiY); g.lineTo(x, y); g.stroke();
      }
      EKG.oncekiY = y; EKG.x += 1;
      if (EKG.x >= EKG.w) { EKG.x = 0; EKG.oncekiY = null; }
    }
    if (azHareket) { EKG.anim = false; setTimeout(() => { if (!EKG.anim) { EKG.anim = true; EKG.son = 0; requestAnimationFrame(ekgKare); } }, 1000); return; }
    requestAnimationFrame(ekgKare);
  }

  /* ================================================================ durum */
  const SOZLUK = window.I18N;
  const oku = (k, d) => { try { const v = localStorage.getItem("ah_" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const yaz = (k, v) => { try { localStorage.setItem("ah_" + k, JSON.stringify(v)); } catch (e) { /* depolama kapalı */ } };

  const S = {
    dil: oku("dil", (navigator.language || "tr").toLowerCase().startsWith("tr") ? "tr" : "en"),
    tema: oku("tema", "light"),
    saat: oku("saat", "utc"),
    gorevGunu: oku("gorevGunu", 120),
    eva: false, senaryo: null, gorunum: "genel",
    risk: null, iss: null, durum: null, meta: null,
    gecmis: [], sonGuncelleme: 0, hata: null,
    osdr: { konu: "radyasyon_dna", sonuc: null, secili: null, detay: null, ist: null, yuklendi: false },
    hst: { veri: null, secili: oku("hstSecili", null), yukleniyor: false },
    vit: { veri: null, onay: oku("vitOnay", {}), yukleniyor: false }
  };
  if (!SOZLUK[S.dil]) S.dil = "tr";

  /* ================================================================ yardımcılar */
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const yol = (o, k) => k.split(".").reduce((a, p) => (a == null ? a : a[p]), o);

  function t(anahtar, p) {
    let v = yol(SOZLUK[S.dil], anahtar);
    if (v == null) v = yol(SOZLUK.tr, anahtar);
    if (v == null) return anahtar;
    if (typeof v !== "string") return v;
    return p ? v.replace(/\{(\w+)\}/g, (m, k) => (p[k] != null ? p[k] : m)) : v;
  }
  const yerel = () => (S.dil === "tr" ? "tr-TR" : "en-GB");
  function sayi(x, b) {
    if (x == null || isNaN(x)) return "—";
    return new Intl.NumberFormat(yerel(), { maximumFractionDigits: b == null ? 1 : b, minimumFractionDigits: 0 }).format(x);
  }
  const yuzde = (x, b) => (S.dil === "tr" ? "%" + sayi(x, b) : sayi(x, b) + "%");
  const buyukHarf = (s) => (s ? s.charAt(0).toLocaleUpperCase(yerel()) + s.slice(1) : s);

  function tarih(d) {
    if (d == null) return null;
    if (d instanceof Date) return d;
    if (typeof d === "number") return new Date(d < 1e12 ? d * 1000 : d);
    let s = String(d).trim();
    if (!/([zZ]|[+-]\d\d:?\d\d)$/.test(s)) s += "Z";
    const x = new Date(s);
    return isNaN(x) ? null : x;
  }
  function saatYaz(d) {
    d = tarih(d); if (!d) return "—";
    const f = new Intl.DateTimeFormat(yerel(), { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: S.saat === "utc" ? "UTC" : undefined });
    return f.format(d) + (S.saat === "utc" ? " UTC" : "");
  }
  function tarihSaatYaz(d) {
    d = tarih(d); if (!d) return "—";
    const opt = { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: S.saat === "utc" ? "UTC" : undefined };
    if (d.getUTCFullYear() !== new Date().getUTCFullYear()) opt.year = "numeric";
    return new Intl.DateTimeFormat(yerel(), opt).format(d) + (S.saat === "utc" ? " UTC" : "");
  }
  function gunYaz(iso) {
    const d = tarih(iso + "T00:00:00Z");
    return new Intl.DateTimeFormat(yerel(), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(d);
  }
  function sureYaz(sn) {
    if (sn == null || isNaN(sn)) return "—";
    sn = Math.max(0, Math.round(sn));
    const sa = Math.floor(sn / 3600), dk = Math.floor((sn % 3600) / 60), s = sn % 60;
    if (sa > 0) return sa + " " + t("birim.sa") + " " + String(dk).padStart(2, "0") + " " + t("birim.dk") + " " + String(s).padStart(2, "0") + " " + t("birim.sn");
    return dk + " " + t("birim.dk") + " " + String(s).padStart(2, "0") + " " + t("birim.sn");
  }
  const css = (ad) => getComputedStyle(document.documentElement).getPropertyValue(ad).trim();

  function getir(url, ms) {
    const ctrl = new AbortController();
    const zaman = setTimeout(() => ctrl.abort(), ms || 45000);
    return fetch(url, { signal: ctrl.signal, cache: "no-store" })
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .finally(() => clearTimeout(zaman));
  }

  const SEV_SIRA = ["DUSUK", "ORTA", "YUKSEK", "KRITIK"];
  const olcekSeviye = (n) => (n >= 5 ? "KRITIK" : n >= 3 ? "YUKSEK" : n >= 1 ? "ORTA" : "DUSUK");
  const SEV_RENK = () => ({ DUSUK: css("--iyi-dolgu") || "#2FA84F", ORTA: css("--uyari-dolgu") || "#F2B71F", YUKSEK: css("--ciddi-dolgu") || "#EC835A", KRITIK: css("--kritik-dolgu") || "#D03B3B" });

  /* ================================================================ dil, tema, saat */
  function metinleriUygula() {
    document.documentElement.lang = S.dil;
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-title]").forEach((el) => { el.title = t(el.dataset.i18nTitle); });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = t(el.dataset.i18nPh); });
    document.querySelectorAll("[data-dil]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.dil === S.dil)));
    document.querySelectorAll("[data-saat]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.saat === S.saat)));
    $("senaryoBtn").textContent = t(S.senaryo ? "ctl.senaryoKapat" : "ctl.senaryoAc");
    $("senaryoBtn").setAttribute("aria-pressed", String(!!S.senaryo));
    $("sayfaBaslik").textContent = t("nav." + S.gorunum);
    document.title = t("nav." + S.gorunum) + " — " + t("app.ad");
  }
  function temaUygula() {
    document.documentElement.dataset.theme = S.tema;
    Chart.defaults.color = css("--murekkep-2");
    Chart.defaults.borderColor = css("--cizgi");
    haritalar.forEach((h) => h.temaYenile());
  }
  function hepsiniCiz() {
    metinleriUygula();
    if (S.iss) issCiz();
    if (S.risk) riskCiz();
    durumCiz();
    yontemCiz();
    if (S.osdr.yuklendi) { osdrKonulariCiz(); osdrListeCiz(); osdrDetayCiz(); osdrIstCiz(); }
    if (S.hst.veri) hastalikCiz();
    if (S.vit.veri) { S.vit.alarmImza = null; vitalCiz(); }
    const sy = $("surumYazi"); if (sy && S.surum) sy.textContent = t("hst.v.surum", { s: S.surum });
  }

  /* ================================================================ yönlendirme */
  const GORUNUMLER = ["genel", "yorunge", "hava", "saglik", "hastalik", "eva", "arastirma", "yontem"];
  function gorunumGoster(ad) {
    if (!GORUNUMLER.includes(ad)) ad = "genel";
    S.gorunum = ad;
    document.querySelectorAll(".gorunum").forEach((g) => { g.hidden = g.dataset.gorunum !== ad; });
    document.querySelectorAll(".ray-liste a").forEach((a) => {
      if (a.dataset.gorunum === ad) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    document.querySelector(".serit-kap").hidden = ad === "arastirma" || ad === "yontem";
    metinleriUygula();
    requestAnimationFrame(() => {
      haritalar.forEach((h) => h.harita.invalidateSize());
      Object.values(grafikler).forEach((g) => g.resize());
    });
    if (ad === "arastirma" && !S.osdr.yuklendi) osdrBaslat();
    if (ad === "hastalik" && !S.hst.veri) hastalikGuncelle();
    if (ad === "hastalik") { EKG.w = 0; vitalGuncelle(true); }
    if (ad === "yontem" && !S.meta) getir("/api/meta").then((m) => { S.meta = m; yontemCiz(); }).catch(() => {});
  }

  /* ================================================================ ülke / okyanus */
  let ulkeGeo = null, ulkeAd = {};
  function ulkeleriYukle() {
    return Promise.all([fetch("vendor/countries-110m.json").then((r) => r.json()), fetch("vendor/ulkeler.json").then((r) => r.json())])
      .then(([topo, adlar]) => {
        ulkeAd = adlar;
        ulkeGeo = topojson.feature(topo, topo.objects.countries);
        ulkeGeo.features.forEach((f) => { f.bbox = bbox(f.geometry); });
      }).catch(() => {});
  }
  function bbox(g) {
    let a = [180, 90, -180, -90];
    const tara = (c) => { if (typeof c[0] === "number") { a = [Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[2], c[0]), Math.max(a[3], c[1])]; } else c.forEach(tara); };
    tara(g.coordinates); return a;
  }
  function halkaIcinde(x, y, h) {
    let ic = false;
    for (let i = 0, j = h.length - 1; i < h.length; j = i++) {
      const xi = h[i][0], yi = h[i][1], xj = h[j][0], yj = h[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ic = !ic;
    }
    return ic;
  }
  function cokgenIcinde(x, y, p) { if (!halkaIcinde(x, y, p[0])) return false; for (let k = 1; k < p.length; k++) if (halkaIcinde(x, y, p[k])) return false; return true; }
  function yerAdi(lat, lon) {
    if (ulkeGeo) {
      for (const f of ulkeGeo.features) {
        const b = f.bbox; if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) continue;
        const g = f.geometry;
        const ic = g.type === "Polygon" ? cokgenIcinde(lon, lat, g.coordinates) : g.coordinates.some((p) => cokgenIcinde(lon, lat, p));
        if (ic) { const ad = ulkeAd[f.id] || ulkeAd[f.properties && f.properties.name]; return ad ? ad[S.dil] : (f.properties && f.properties.name) || "?"; }
      }
    }
    return t("harita.okyanus", { o: t("okyanus." + okyanus(lat, lon)) });
  }
  function okyanus(lat, lon) {
    if (lat <= -50) return "Guney";
    if (lat >= 66) return "Arktik";
    if (lon >= 20 && lon <= 120 && lat < 25) return "Hint";
    if (lon > -70 && lon < 20) return "Atlantik";
    if (lon >= -100 && lon <= -70 && lat > 8 && lat < 35) return "Atlantik";
    return "Pasifik";
  }

  /* ================================================================ haritalar */
  const haritalar = [];
  function haritaOlustur(el, mini) {
    const harita = L.map(el, { worldCopyJump: true, minZoom: 1, maxZoom: 6, zoomControl: !mini, attributionControl: false, zoomSnap: 0.25 })
      .setView([20, 0], mini ? 1.5 : 1.75);
    const k = { harita, mini, ulke: null, saa: null, bantlar: [], gece: null, gecmis: null, gelecek: null, isaret: null };
    k.bantlar = [L.rectangle([[45, -540], [62, 540]], { interactive: false }), L.rectangle([[-62, -540], [-45, 540]], { interactive: false })];
    k.bantlar.forEach((b) => b.addTo(harita));
    // İnternet varsa NASA'nın gerçek renkli Blue Marble uydu mozaiği (GIBS); yoksa yerleşik vektör harita kalır
    k.uydu = false;
    const uydu = L.tileLayer("https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg",
      { maxNativeZoom: 8, maxZoom: 8, attribution: "NASA Blue Marble · GIBS" });
    let karoHata = 0;
    uydu.on("tileload", () => { if (!k.uydu) { k.uydu = true; k.temaYenile(); if (S.iss) issCiz(); } });
    uydu.on("tileerror", () => { karoHata++; if (!k.uydu && karoHata > 8 && harita.hasLayer(uydu)) harita.removeLayer(uydu); });
    uydu.addTo(harita);
    k.gorus = L.circle([0, 0], { radius: 2250e3, interactive: false, weight: 1.5, dashArray: "4 6" }).addTo(harita);
    k.gecmis = L.polyline([], { weight: 3, opacity: .95, interactive: false, lineCap: "round" }).addTo(harita);
    k.gelecek = L.polyline([], { weight: 2.5, dashArray: "2 8", opacity: .95, interactive: false, lineCap: "round" }).addTo(harita);
    k.isaret = L.marker([0, 0], { icon: issIkon("DUSUK", 0), zIndexOffset: 1000, keyboard: false }).addTo(harita);
    k.temaYenile = function () {
      const kara = css("--kara"), sinir = css("--sinir"), u = k.uydu;
      if (k.ulke) k.ulke.setStyle(u ? { fillOpacity: 0, color: "#FFFFFF", opacity: .28, weight: .6 } : { fillColor: kara, color: sinir, weight: .7, fillOpacity: 1, opacity: 1 });
      k.bantlar.forEach((b) => b.setStyle({ stroke: false, fillColor: "#E0A94A", fillOpacity: u ? .10 : (S.tema === "dark" ? .14 : .16) }));
      if (k.saa) k.saa.setStyle({ color: u ? "#FF9B6A" : "#C2501F", weight: 1.5, dashArray: "5 4", fillColor: "#EC835A", fillOpacity: u ? .28 : .32 });
      if (k.gece) k.gece.setStyle({ stroke: false, fillColor: u ? "#020611" : "#13203A", fillOpacity: u ? .5 : (S.tema === "dark" ? .4 : .12) });
      k.gecmis.setStyle({ color: u ? "#F2C14E" : css("--seri-1") });
      k.gelecek.setStyle({ color: u ? "#FFFFFF" : (S.tema === "dark" ? "#9ec5f4" : "#1c5cab") });
      k.gorus.setStyle({ color: u ? "#FFFFFF" : (S.tema === "dark" ? "#9ec5f4" : "#1c5cab"), fillColor: u ? "#FFFFFF" : "#2a78d6", fillOpacity: u ? .07 : .06, opacity: .7 });
    };
    if (ulkeGeo) { k.ulke = L.geoJSON(ulkeGeo, { interactive: false }).addTo(harita); k.ulke.bringToBack(); }
    k.temaYenile();
    haritalar.push(k);
    return k;
  }
  function issIkon(sev, aci) {
    const r = SEV_RENK()[sev] || "#2FA84F";
    // ISS üstten: uzun kafes (truss), iki uçta 4'er altın güneş paneli kanadı, ortada uçuş yönünde basınçlı modüller,
    // kafes üzerinde beyaz radyatörler, kıç tarafta Zvezda'nın mavi panelleri.
    let paneller = "";
    [5, 12, 46, 53].forEach((x) => {
      [9, 35].forEach((y) => {
        paneller += '<rect x="' + x + '" y="' + y + '" width="6" height="20" fill="#C9952F" stroke="#3A2708" stroke-width=".5"/>' +
          '<rect x="' + (x + 2.2) + '" y="' + y + '" width="1.6" height="20" fill="#E8BE62"/>' +
          '<path d="M' + x + " " + (y + 5) + "h6M" + x + " " + (y + 10) + "h6M" + x + " " + (y + 15) + 'h6" stroke="#3A2708" stroke-width=".35"/>';
      });
    });
    const svg = '<svg viewBox="0 0 64 64" aria-hidden="true">' + paneller +
      '<rect x="3" y="30.4" width="58" height="3.2" rx=".8" fill="#D5DAE2" stroke="#24304D" stroke-width=".6"/>' +
      '<rect x="21" y="21" width="3.4" height="9" fill="#F4F6F9" stroke="#5E6A84" stroke-width=".4"/><rect x="39.6" y="34" width="3.4" height="9" fill="#F4F6F9" stroke="#5E6A84" stroke-width=".4"/>' +
      '<rect x="29.6" y="10" width="4.8" height="44" rx="2.2" fill="#F2F4F7" stroke="#24304D" stroke-width=".7"/>' +
      '<rect x="24.5" y="15" width="15" height="4" rx="1.8" fill="#E6EAF0" stroke="#24304D" stroke-width=".6"/>' +
      '<rect x="26" y="46" width="12" height="3" rx="1.4" fill="#E6EAF0" stroke="#24304D" stroke-width=".6"/>' +
      '<rect x="17" y="51" width="11" height="3.2" fill="#2F4F86" stroke="#13203A" stroke-width=".4"/><rect x="36" y="51" width="11" height="3.2" fill="#2F4F86" stroke="#13203A" stroke-width=".4"/></svg>';
    return L.divIcon({ className: "", iconSize: [54, 54], iconAnchor: [27, 27],
      html: '<div class="iss-isaret" style="color:' + r + '"><span class="halka"></span><div class="iss-govde" style="transform:rotate(' + (aci || 0).toFixed(1) + 'deg)">' + svg + "</div></div>" });
  }
  function surekli(noktalar, sabitIndeks, sabitLon) {
    // Boylamları komşu noktaya göre açar: çizgi 180. meridyende kopmaz, dünya kopyasına kesintisiz devam eder.
    const out = new Array(noktalar.length);
    if (!noktalar.length) return out;
    out[sabitIndeks] = [noktalar[sabitIndeks].lat, sabitLon];
    for (let i = sabitIndeks + 1; i < noktalar.length; i++) {
      const once = out[i - 1][1]; let lon = noktalar[i].lon;
      lon += Math.round((once - lon) / 360) * 360; out[i] = [noktalar[i].lat, lon];
    }
    for (let i = sabitIndeks - 1; i >= 0; i--) {
      const sonra = out[i + 1][1]; let lon = noktalar[i].lon;
      lon += Math.round((sonra - lon) / 360) * 360; out[i] = [noktalar[i].lat, lon];
    }
    return out;
  }
  function geceCokgeni(slat, slon) {
    const D = Math.PI / 180, pts = [];
    let tn = Math.tan(slat * D); if (Math.abs(tn) < 1e-3) tn = tn < 0 ? -1e-3 : 1e-3;
    for (let lon = -540; lon <= 540; lon += 3) pts.push([Math.atan(-Math.cos((lon - slon) * D) / tn) / D, lon]);
    const kutup = slat > 0 ? -90 : 90;
    pts.push([kutup, 540], [kutup, -540]);
    return pts;
  }
  function haritaGuncelle(k, v) {
    const iss = v.iss;
    const merkez = k.mini ? iss.lon : k.harita.getCenter().lng;
    const lon = iss.lon + Math.round((merkez - iss.lon) / 360) * 360;
    k.isaret.setLatLng([iss.lat, lon]);
    const gec = v.gecmis_iz || [], gel = v.gelecek_iz || [];
    k.gecmis.setLatLngs(gec.length ? surekli(gec, gec.length - 1, lon) : []);
    const gelecekNokta = gel.length ? surekli(gel, 0, lon) : [];
    k.gelecek.setLatLngs(gelecekNokta);
    k.gorus.setLatLng([iss.lat, lon]);
    k.gorus.setRadius((v.gorus_yaricap_km || 2250) * 1000);
    k.aci = 0;
    if (gelecekNokta.length > 1) {
      const a = k.harita.latLngToLayerPoint(gelecekNokta[0]), b = k.harita.latLngToLayerPoint(gelecekNokta[Math.min(2, gelecekNokta.length - 1)]);
      k.aci = Math.atan2(b.x - a.x, -(b.y - a.y)) * 180 / Math.PI;
    }
    if (!k.saa) {
      const p = v.saa_poligon;
      k.saa = L.layerGroup([-360, 0, 360].map((o) => L.polygon(p.map((q) => [q[0], q[1] + o]), { interactive: false }))).addTo(k.harita);
      k.saa.setStyle = (st) => k.saa.eachLayer((l) => l.setStyle(st));
      k.temaYenile();
    }
    const gece = geceCokgeni(v.gunes_alt_noktasi.lat, v.gunes_alt_noktasi.lon);
    if (k.gece) k.gece.setLatLngs([gece]); else { k.gece = L.polygon(gece, { interactive: false }).addTo(k.harita); k.temaYenile(); }
    if (!k.ulke && ulkeGeo) { k.ulke = L.geoJSON(ulkeGeo, { interactive: false }).addTo(k.harita); k.ulke.bringToBack(); k.temaYenile(); }
    k.isaret.setIcon(issIkon(S.risk ? S.risk.risk.seviye : "DUSUK", k.aci));
    if (k.mini) k.harita.setView([Math.max(-55, Math.min(55, iss.lat)), lon], k.harita.getZoom(), { animate: false });
    else if (!k.ortalandi) { k.ortalandi = true; k.harita.setView([15, iss.lon], k.harita.getZoom(), { animate: false }); haritaGuncelle(k, v); }
  }

  /* ================================================================ ISS */
  let kucukHarita, buyukHarita;
  function issGuncelle() {
    return getir("/api/iss", 15000).then((v) => {
      v.sonraki = hedefleriSabitle(v.sonraki || {});
      S.iss = v; S.iss.alinma = Date.now(); issCiz();
    }).catch(() => {});
  }
  // Aynı olayın tahmini birkaç saniye oynarsa geri sayım zıplamasın: 30 sn'den küçük farkları yok say.
  const hedefler = {};
  function hedefleriSabitle(sn) {
    const simdi = Date.now() / 1000;
    ["saa_giris", "saa_cikis", "gun_dogumu", "gun_batimi"].forEach((ad) => {
      const yeni = sn[ad], eski = hedefler[ad];
      if (yeni && eski && eski > simdi && Math.abs(yeni - eski) < 30) sn[ad] = eski;
      hedefler[ad] = sn[ad] || null;
    });
    return sn;
  }
  function issCiz() {
    const v = S.iss; if (!v) return;
    haritalar.forEach((k) => haritaGuncelle(k, v));
    seritCiz(v);
    anlarCiz();
    const iss = v.iss;
    const kaynak = { canli: "yorunge.kaynakCanli", model: "yorunge.kaynakModel", simulasyon: "yorunge.kaynakSim" }[iss.kaynak];
    const satir = [
      ["yorunge.uzerinde", yerAdi(iss.lat, iss.lon)],
      ["yorunge.bolge", t("bolge." + iss.bolge)],
      ["yorunge.enlem", sayi(iss.lat, 2) + "°"],
      ["yorunge.boylam", sayi(iss.lon, 2) + "°"],
      ["yorunge.irtifa", sayi(iss.irtifa_km, 0) + " km"],
      ["yorunge.hiz", sayi(iss.hiz_kmh, 0) + " km/h"],
      ["yorunge.isik", t(iss.gunes === "daylight" ? "yorunge.gunduz" : "yorunge.gece")],
      ["yorunge.yon", iss.yukselen == null ? "—" : t(iss.yukselen ? "yorunge.kuzey" : "yorunge.guney")],
      ["yorunge.kaynak", t(kaynak || "yorunge.kaynakSim")],
      ["yorunge.iz", t(v.iz_kaynak === "canli" ? "yorunge.izCanli" : "yorunge.izModel")],
      ["yorunge.gorus", "~" + sayi(v.gorus_yaricap_km, 0) + " km"]
    ];
    $("issBilgi").innerHTML = satir.map((s) => "<dt>" + esc(t(s[0])) + "</dt><dd>" + esc(s[1]) + "</dd>").join("");
    const z = S.meta ? S.meta.bolge_risk : { EKVATOR: 1, ORTA_ENLEM: 1.4, YUKSEK_ENLEM: 1.8, SAA: 3 };
    const renk = { EKVATOR: "#2FA84F", ORTA_ENLEM: "#8FA3BF", YUKSEK_ENLEM: "#E0A94A", SAA: "#C2501F" };
    $("bolgeler").innerHTML = ["EKVATOR", "ORTA_ENLEM", "YUKSEK_ENLEM", "SAA"].map((b) =>
      '<div class="bolge' + (b === iss.bolge ? " aktif" : "") + '" style="border-top-color:' + renk[b] + '"><h3>' + esc(t("bolge." + b)) + '</h3><div class="carpan">' +
      esc(t("yorunge.carpan", { k: sayi(z[b], 1) })) + "</div><p>" + esc(t("bolgeAciklama." + b)) + "</p></div>").join("");
    const u = buyukHarita && buyukHarita.uydu;
    $("haritaLejant").innerHTML = [
      ["background:" + (u ? "#F2C14E" : css("--seri-1")) + ";height:3px", "harita.gecmis"],
      ["border-top:3px dotted " + (u ? "#5E6A84" : (S.tema === "dark" ? "#9ec5f4" : "#1c5cab")) + ";height:0", "harita.gelecek"],
      ["border:1.5px dashed " + (u ? "#5E6A84" : "#1c5cab") + ";border-radius:50%;width:12px;height:12px", "harita.gorus"],
      ["background:rgba(236,131,90,.45);border:1px dashed #C2501F", "harita.saa"], ["background:rgba(224,169,74,.3)", "harita.kutup"],
      ["background:rgba(11,18,36,.45)", "harita.gece"]
    ].map((l) => '<span><i style="' + l[0] + '"></i>' + esc(t(l[1])) + "</span>").join("") +
      (u ? '<span class="lejant-kaynak">' + esc(t("harita.uyduKaynak")) + "</span>" : "");
  }

  function seritCiz(v) {
    const p = v.serit || []; if (!p.length) return;
    const parcalar = []; const isiklar = [];
    p.forEach((n, i) => {
      const s = parcalar[parcalar.length - 1];
      if (s && s.b === n.b) s.n++; else parcalar.push({ b: n.b, n: 1, i });
      const g = isiklar[isiklar.length - 1];
      if (g && g.g === n.g) g.n++; else isiklar.push({ g: n.g, n: 1 });
    });
    const toplam = p.length;
    let html = parcalar.map((s) => {
      const bas = p[s.i].t, bit = p[Math.min(p.length - 1, s.i + s.n)].t;
      const ad = t("bolgeKisa." + s.b);
      const etiket = s.n >= 14 ? '<span class="etiket-bolge">' + esc(ad) + "</span>" : "";
      return '<div class="dilim b-' + s.b + '" style="flex-grow:' + s.n + '" title="' + esc(t("bolge." + s.b) + ": " + saatYaz(bas) + "–" + saatYaz(bit)) + '">' + etiket + "</div>";
    }).join("");
    html += '<div class="isik">' + isiklar.map((g) => '<span class="' + (g.g ? "i-gun" : "i-gece") + '" style="flex-grow:' + g.n + '"></span>').join("") + "</div>";
    html += '<div class="simdi" title="' + esc(t("serit.simdi")) + '"></div>';
    const el = $("serit"); el.innerHTML = html;
    const saaDk = p.filter((n) => n.b === "SAA").length;
    el.setAttribute("aria-label", t("serit.baslik") + ": " + parcalar.map((s) => t("bolgeKisa." + s.b) + " " + s.n + " " + t("birim.dk")).join(", ") + ". SAA " + saaDk + " " + t("birim.dk") + ".");
    const etiketler = [];
    const adim = el.clientWidth && el.clientWidth < 640 ? 60 : 30;
    for (let dk = 0; dk <= 180; dk += adim) {
      const sol = (dk / (toplam - 1)) * 100;
      const cls = dk === 0 ? ' class="ilk"' : dk === 180 ? ' class="son"' : "";
      // Tam piksele yuvarlanmış konum: yüzde + translateX(-50%) yazıyı yarım piksele düşürüp bulanıklaştırıyordu.
      const gen = $("seritSaatler").clientWidth;
      const konum = gen ? Math.round(sol / 100 * gen) + "px" : sol + "%";
      etiketler.push("<span" + cls + ' style="left:' + konum + '">' + (dk === 0 ? esc(t("serit.simdi")) : esc(saatYaz(p[0].t + dk * 60))) + "</span>");
    }
    $("seritSaatler").innerHTML = etiketler.join("");
    const lj = [["b-EKVATOR", "bolgeKisa.EKVATOR"], ["b-ORTA_ENLEM", "bolgeKisa.ORTA_ENLEM"], ["b-YUKSEK_ENLEM", "bolgeKisa.YUKSEK_ENLEM"], ["b-SAA", "bolge.SAA"], ["i-gun", "serit.gunduz"], ["i-gece", "serit.gece"]];
    $("seritLejant").innerHTML = lj.map((l) => '<span><i class="' + l[0] + '"></i>' + esc(t(l[1])) + "</span>").join("");
  }

  function anlarCiz() {
    const v = S.iss; if (!v) return;
    const simdi = Date.now() / 1000, sn = v.sonraki || {}, iss = v.iss;
    // Sunucunun aynı modelden hesapladığı anlık durumu kullan (etiket ile hedef hep tutarlı olsun)
    const saaIcinde = sn.saa_icinde != null ? sn.saa_icinde : iss.bolge === "SAA";
    const saaHedef = saaIcinde ? sn.saa_cikis : sn.saa_giris;
    const gunduz = sn.gunduz != null ? sn.gunduz : iss.gunes === "daylight";
    const isikHedef = gunduz ? sn.gun_batimi : sn.gun_dogumu;
    const satir = [
      [t("yorunge.uzerinde"), esc(yerAdi(iss.lat, iss.lon))],
      [t(saaIcinde ? "genel.saaIcinde" : "genel.sonrakiSaa"), saaHedef ? esc(sureYaz(saaHedef - simdi)) + "<small>" + esc(saatYaz(saaHedef)) + "</small>" : esc(t("genel.yok3s"))],
      [t(gunduz ? "genel.sonrakiKaranlik" : "genel.sonrakiIsik"), isikHedef ? esc(sureYaz(isikHedef - simdi)) + "<small>" + esc(saatYaz(isikHedef)) + "</small>" : "—"],
      [t("yorunge.irtifa") + " / " + t("yorunge.hiz"), esc(sayi(iss.irtifa_km, 0)) + " km<small>" + esc(sayi(iss.hiz_kmh, 0)) + " km/h</small>"]
    ];
    $("anlar").innerHTML = satir.map((s) => "<div><dt>" + esc(s[0]) + "</dt><dd>" + s[1] + "</dd></div>").join("");
  }

  /* ================================================================ risk */
  function riskGuncelle() {
    const q = "/api/risk?gorev_gunu=" + S.gorevGunu + "&eva=" + (S.eva ? 1 : 0) + (S.senaryo ? "&senaryo=" + S.senaryo : "");
    return getir(q, 60000).then((v) => {
      S.risk = v; S.hata = null; S.sonGuncelleme = Date.now();
      // Uyarı geçmişi yalnızca CANLI veriyi tutar; senaryo (geçmiş fırtına) kaydedilmez.
      if (!v.senaryo) {
        const son = S.gecmis[0];
        if (!son || son.seviye !== v.risk.seviye) S.gecmis.unshift({ t: Date.now(), seviye: v.risk.seviye, skor: v.risk.skor });
        S.gecmis = S.gecmis.slice(0, 20);
      }
      riskCiz();
    }).catch((e) => { S.hata = e.message; uyariCiz(); });
  }

  function ozetCumlesi(h) {
    return (h.ozet || []).map((o) => {
      const p = Object.assign({}, o); if (p.kp != null) p.kp = sayi(p.kp, 1); if (p.pfu != null) p.pfu = sayi(p.pfu, 0);
      return t("ozet." + o.k, p);
    }).join(S.dil === "tr" ? "; " : "; ");
  }
  function uyariCiz() {
    const el = $("uyari");
    if (S.hata && !S.risk) { el.className = "uyari s-KRITIK"; $("uyariSeviye").textContent = "—"; $("uyariSkor").textContent = "!"; $("uyariMetin").textContent = t("genelHata", { e: S.hata }); return; }
    const v = S.risk; if (!v) return;
    const sev = v.risk.seviye;
    el.className = "uyari s-" + sev;
    $("uyariSeviye").textContent = t("seviyeRisk", { s: t("seviye." + sev) });
    $("uyariSkor").textContent = v.risk.skor;
    const iss = (S.iss && S.iss.iss) || v.iss;
    $("uyariMetin").textContent = t("genel.konumCumle", { yer: yerAdi(iss.lat, iss.lon), bolge: t("bolgeCumle." + iss.bolge) }) + " " + buyukHarf(ozetCumlesi(v.hava)) + ".";
  }

  function riskCiz() {
    const v = S.risk; if (!v) return;
    uyariCiz();
    const sev = v.risk.seviye;
    $("riskSayi").textContent = v.risk.skor;
    $("riskSeviye").textContent = t("seviyeRisk", { s: t("seviye." + sev) });
    $("riskSeviye").className = "okuma-seviye s-yazi-" + sev;
    $("riskCubuk").style.left = "calc(" + v.risk.skor + "% - 2px)";
    $("riskCarpan").textContent = t("genel.carpan", { b: sayi(v.risk.k_bolge, 2), h: sayi(v.risk.k_hava, 2), e: v.eva ? t("genel.evaCarpan") : "" });
    vitallerCiz(v); onerilerCiz(v); organlarCiz(v); gecmisCiz(); genelOlaylarCiz(v.hava);
    havaCiz(v.hava); saglikCiz(v); evaCiz(v.eva_plan);
    haritalar.forEach((k) => k.isaret.setIcon(issIkon(sev, k.aci || 0)));
  }

  function vital(ad, deger, alt, sev) {
    return '<div class="vital s-' + sev + '"><div class="ad">' + esc(ad) + '</div><div class="deger">' + deger + '</div><div class="vital-alt">' + esc(alt) + "</div></div>";
  }
  function vitallerCiz(v) {
    const d = v.doz, h = v.hava;
    const dozSev = h.k_doz <= 1 ? "DUSUK" : h.k_doz <= 1.5 ? "ORTA" : h.k_doz <= 3 ? "YUKSEK" : "KRITIK";
    const kar = d.kariyer_limiti_yuzde;
    const karSev = kar < 25 ? "DUSUK" : kar < 50 ? "ORTA" : kar < 80 ? "YUKSEK" : "KRITIK";
    $("vitaller").innerHTML =
      vital(t("genel.dozBugun"), esc(sayi(d.gunluk_doz_msv, 2)) + "<small>mSv</small>", t("genel.dozBugunAlt", { g: sayi(d.dunya_gun_esdegeri, 0) }), dozSev) +
      vital(t("genel.kariyer"), esc(yuzde(kar, 1)), t("genel.kariyerAlt", { d: sayi(d.kumulatif_doz_msv, 0) }), karSev) +
      vital(t("genel.kp"), "Kp " + esc(sayi(h.kp_simdi, 1)), h.G ? "G" + h.G + " · " + t("hava.jeo") : t("hava.g0"), olcekSeviye(h.G)) +
      vital(t("genel.proton"), esc(sayi(h.proton_10mev_pfu, h.proton_10mev_pfu < 10 ? 2 : 0)) + "<small>pfu</small>", h.S ? "S" + h.S + " · " + t("hava.radyasyon") : t("hava.s0"), olcekSeviye(h.S));
  }

  function onerParam(o) {
    const p = Object.assign({}, o.p || {});
    if (p.bas) p.bas = saatYaz(p.bas); if (p.bit) p.bit = saatYaz(p.bit);
    ["doz", "min", "max"].forEach((k) => { if (p[k] != null) p[k] = sayi(p[k], 1); });
    return p;
  }
  function oneriHtml(o) {
    const p = onerParam(o);
    return '<li class="' + o.oncelik + '"><div class="ob"><span class="oe">' + esc(t("oncelik." + o.oncelik)) + "</span>" + esc(t("onlem." + o.k + ".b", p)) +
      '</div><div class="od">' + esc(t("onlem." + o.k + ".d", p)) + "</div></li>";
  }
  function onerilerCiz(v) {
    $("genelOneriler").innerHTML = v.onlemler.slice(0, 3).map(oneriHtml).join("");
    $("oneriler").innerHTML = v.onlemler.map(oneriHtml).join("");
  }

  function organSatir(o, kisa) {
    const ad = t("organ." + o.id + ".ad");
    const ust = '<span class="ad">' + esc(ad) + '</span><span class="bar"><span class="d-' + o.seviye + '" style="width:' + Math.max(3, o.skor) + '%"></span></span>' +
      '<span class="skor s-yazi-' + o.seviye + '">' + o.skor + " · " + esc(t("seviye." + o.seviye)) + "</span>";
    if (kisa) return '<div class="organ"><button type="button" tabindex="-1">' + ust + "</button></div>";
    const e = o.etkenler;
    return '<div class="organ"><button type="button" aria-expanded="false" data-organ="' + o.id + '">' + ust + "</button>" +
      '<div class="organ-detay" hidden><p>' + esc(t("organ." + o.id + ".d")) + "</p><p>" + esc(t("saglik.etkenler", { r: e.radyasyon_anlik, k: e.birikimli_doz, m: e.mikroyercekimi })) +
      '</p><a href="#arastirma" data-konu="' + o.osdr_konu + '">' + esc(t("saglik.kanit")) + "</a></div></div>";
  }
  function organlarCiz(v) {
    const sirali = v.organlar.slice().sort((a, b) => b.skor - a.skor);
    $("genelOrganlar").innerHTML = sirali.slice(0, 3).map((o) => organSatir(o, true)).join("");
    const acik = new Set(Array.from(document.querySelectorAll('#organlar button[aria-expanded="true"]')).map((b) => b.dataset.organ));
    $("organlar").innerHTML = v.organlar.map((o) => organSatir(o, false)).join("");
    acik.forEach((id) => { const b = document.querySelector('#organlar button[data-organ="' + id + '"]'); if (b) organAc(b, true); });
  }
  function organAc(b, ac) { b.setAttribute("aria-expanded", String(ac)); b.nextElementSibling.hidden = !ac; }

  function gecmisCiz() {
    $("gecmis").innerHTML = S.gecmis.length <= 1 && S.gecmis.length
      ? "<li><time>" + esc(saatYaz(S.gecmis[0].t)) + '</time><span class="s-yazi-' + S.gecmis[0].seviye + '">' + esc(t("genel.gecmisSatir", { seviye: t("seviyeRisk", { s: t("seviye." + S.gecmis[0].seviye) }), skor: S.gecmis[0].skor })) + "</span></li><li class='ince'>" + esc(t("genel.gecmisBos")) + "</li>"
      : S.gecmis.map((g) => "<li><time>" + esc(saatYaz(g.t)) + '</time><span class="s-yazi-' + g.seviye + '">' + esc(t("genel.gecmisSatir", { seviye: t("seviyeRisk", { s: t("seviye." + g.seviye) }), skor: g.skor })) + "</span></li>").join("");
  }

  function olayBaslik(o) {
    if (o.tur === "FLR") return o.sinif ? t("olay.FLR", { s: o.sinif }) : t("olay.FLR0");
    if (o.tur === "GST") return o.kp != null ? t("olay.GST", { kp: sayi(o.kp, 1) }) : t("olay.GST0");
    if (o.tur === "CME") return o.hiz != null ? t("olay.CME", { hiz: sayi(o.hiz, 0) }) : t("olay.CME0");
    return t("olay.SEP");
  }
  function genelOlaylarCiz(h) {
    const c = (h.cme_varis || []).find((x) => x.kalan_saat >= 0);
    const ust = c ? '<p class="cme-ozet"><strong>' + esc(t("hava.cmeVaris")) + ":</strong> " + esc(tarihSaatYaz(c.varis)) + " (" + esc(sayi(c.kalan_saat, 0)) + " " + esc(t("birim.sa")) + ")</p>"
      : '<p class="ince">' + esc(t("hava.cmeYok")) + "</p>";
    const ol = (h.son_olaylar || []).slice(0, 4);
    $("genelOlaylar").innerHTML = ust + (ol.length ? '<ul class="olaylar">' + ol.map((o) => '<li><span class="olay-tur">' + esc(o.tur) + "</span><span>" + esc(olayBaslik(o)) + "</span><time>" + esc(tarihSaatYaz(o.zaman)) + "</time></li>").join("") + "</ul>"
      : '<p class="ince">' + esc(t("hava.olayYok")) + "</p>");
  }

  /* ================================================================ uzay havası */
  function havaCiz(h) {
    const kart = (ad, deger, durum, acik, sev) => '<div class="olcek s-' + sev + '"><div class="ad">' + esc(ad) + '</div><div class="deger">' + deger + '</div><div class="durum s-yazi-' + sev + '">' + esc(durum) + "</div><p>" + esc(acik) + "</p></div>";
    $("olcekler").innerHTML =
      kart(t("hava.jeo"), "Kp " + esc(sayi(h.kp_simdi, 2)), h.G ? "G" + h.G : t("hava.g0"), t("hava.gAcik"), olcekSeviye(h.G)) +
      kart(t("hava.radyasyon"), esc(sayi(h.proton_10mev_pfu, h.proton_10mev_pfu < 10 ? 2 : 0)) + "<small>pfu</small>", h.S ? "S" + h.S : t("hava.s0"), t("hava.sAcik"), olcekSeviye(h.S)) +
      kart(t("hava.radyo"), esc(h.flr_24s || h.xray_sinif || "—"), h.R ? "R" + h.R : t("hava.r0"), t("hava.rAcik"), olcekSeviye(h.R));
    const c = h.cme_varis || [];
    $("cmeTablo").innerHTML = c.length
      ? '<div class="tablo-kap"><table class="tablo"><thead><tr><th>' + esc(t("hava.cmeVaris")) + "</th><th>" + esc(t("hava.cmeKalan")) + "</th><th>" + esc(t("hava.cmeHiz")) + "</th></tr></thead><tbody>" +
        c.map((x) => "<tr><td>" + esc(tarihSaatYaz(x.varis)) + '</td><td class="sayi">' + (x.kalan_saat >= 0 ? esc(sayi(x.kalan_saat, 0)) + " " + esc(t("birim.sa")) : esc(t("hava.cmeUlasti"))) + '</td><td class="sayi">' + (x.hiz_kms ? esc(sayi(x.hiz_kms, 0)) + " km/s" : "—") + "</td></tr>").join("") + "</tbody></table></div>"
      : '<p class="ince">' + esc(t("hava.cmeYok")) + "</p>";
    $("havaAnlam").textContent = t(h.G || h.S || h.R ? "hava.anlamFirtina" : "hava.anlamSakin");
    const ol = h.son_olaylar || [];
    $("olaylar").innerHTML = ol.length ? ol.map((o) => {
      const baslik = olayBaslik(o);
      const b = o.link && /^https?:/.test(o.link) ? '<a href="' + esc(o.link) + '" target="_blank" rel="noopener">' + esc(baslik) + "</a>" : esc(baslik);
      return '<li><span class="olay-tur">' + esc(o.tur) + "</span><span>" + b + "</span><time>" + esc(tarihSaatYaz(o.zaman)) + "</time></li>";
    }).join("") : '<li class="ince">' + esc(t("hava.olayYok")) + "</li>";
    kpGrafikCiz(h); protonGrafikCiz(h);
  }

  const grafikler = {};
  function grafik(id, cfg) {
    if (grafikler[id]) grafikler[id].destroy();
    grafikler[id] = new Chart($(id), cfg);
  }
  function eksen(baslik, ekstra) {
    return Object.assign({ grid: { color: css("--cizgi") }, ticks: { color: css("--murekkep-2") }, title: { display: !!baslik, text: baslik, color: css("--murekkep-2") } }, ekstra || {});
  }
  function kpGrafikCiz(h) {
    const seri = (h.kp_tahmin_seri && h.kp_tahmin_seri.length) ? h.kp_tahmin_seri : (h.kp_seri || []).map((x) => ({ t: x.t, kp: x.kp, gozlem: true }));
    const R = SEV_RENK();
    const renk = (kp) => (kp >= 7 ? R.KRITIK : kp >= 5 ? R.YUKSEK : kp >= 4 ? R.ORTA : R.DUSUK);
    grafik("kpGrafik", {
      type: "bar",
      data: {
        labels: seri.map((x) => tarihSaatYaz(x.t)),
        datasets: [
          { label: t("hava.gozlem"), data: seri.map((x) => (x.gozlem ? x.kp : null)), backgroundColor: seri.map((x) => renk(x.kp)), borderRadius: 4, grouped: false, barPercentage: .92, categoryPercentage: 1 },
          { label: t("hava.tahmin"), data: seri.map((x) => (x.gozlem ? null : x.kp)), backgroundColor: seri.map((x) => renk(x.kp) + "66"), borderColor: seri.map((x) => renk(x.kp)), borderWidth: 1.5, borderRadius: 4, grouped: false, barPercentage: .92, categoryPercentage: 1 }
        ]
      },
      options: {
        maintainAspectRatio: false, animation: false,
        plugins: { legend: { labels: { boxWidth: 12, color: css("--murekkep-2") } }, tooltip: { callbacks: { label: (c) => "Kp " + sayi(c.raw, 2) + " (" + c.dataset.label + ")" } } },
        scales: { y: eksen(t("hava.kpEksen"), { min: 0, max: 9, ticks: { stepSize: 1, color: css("--murekkep-2") } }), x: eksen("", { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6, color: css("--murekkep-2") } }) }
      }
    });
  }
  function protonGrafikCiz(h) {
    const seri = h.proton_seri || [];
    grafik("protonGrafik", {
      type: "line",
      data: {
        labels: seri.map((x) => saatYaz(x.t)),
        datasets: [
          { label: "≥10 MeV", data: seri.map((x) => Math.max(x.pfu, .01)), borderColor: css("--seri-1"), borderWidth: 2, pointRadius: seri.length < 12 ? 4 : 0, tension: .2 },
          { label: t("hava.s1Esik"), data: seri.map(() => 10), borderColor: SEV_RENK().YUKSEK, borderDash: [6, 5], borderWidth: 1.5, pointRadius: 0 }
        ]
      },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: "index", intersect: false },
        plugins: { legend: { labels: { boxWidth: 12, color: css("--murekkep-2") } } },
        scales: { y: eksen(t("hava.protonEksen"), { type: "logarithmic", min: .01 }), x: eksen("", { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 6, color: css("--murekkep-2") } }) }
      }
    });
  }

  /* ================================================================ sağlık */
  function sayiKutu(deger, birim, ad) {
    return '<div class="sayi-kutu"><div class="deger">' + esc(deger) + "<small>" + esc(birim) + '</small></div><div class="ad">' + esc(ad) + "</div></div>";
  }
  function saglikCiz(v) {
    const d = v.doz;
    $("dozSayilar").innerHTML =
      sayiKutu(sayi(d.anlik_doz_hizi_usv_saat, 1), "µSv/h", t("saglik.anlik")) +
      sayiKutu(sayi(d.gunluk_doz_msv, 2), "mSv", t("saglik.gunluk")) +
      sayiKutu(sayi(d.kumulatif_doz_msv, 1), "mSv", t("saglik.birikimli")) +
      sayiKutu(sayi(d.emilen_doz_mgy, 1), "mGy", t("saglik.emilen"));
    $("kariyerYuzde").textContent = yuzde(d.kariyer_limiti_yuzde, 1);
    const kc = $("kariyerCubuk");
    kc.style.width = Math.min(100, d.kariyer_limiti_yuzde) + "%";
    kc.style.background = d.kariyer_limiti_yuzde >= 80 ? css("--kritik") : d.kariyer_limiti_yuzde >= 50 ? css("--ciddi") : css("--altin");
    $("speNot").textContent = t("saglik.spe", { l: sayi(d.spe_limiti_msv, 0) });
    $("dnaPanel").innerHTML =
      '<div class="dna-ust"><span>' + esc(t("saglik.dnaSkor")) + '</span><span class="deger s-yazi-' + d.dna_seviye + '">' + d.dna_hasar_skoru + "<small class='ince'>/100</small></span></div>" +
      '<div class="ilerleme-iz"><div class="d-' + d.dna_seviye + '" style="width:' + d.dna_hasar_skoru + '%"></div></div>' +
      '<p style="margin-top:12px"><strong>' + esc(sayi(d.hucre_basina_dsb, 2)) + "</strong> " + esc(t("saglik.dsb")) + ". " + esc(t("saglik.dsbAlt")) + "</p>" +
      "<p><strong>" + esc(t("saglik.telomer")) + ":</strong> " + esc(t("telomer." + d.telomer_durumu)) + "</p>";
    const aralik = S.dil === "tr" ? "%" + sayi(d.kemik_kaybi_yuzde[0], 1) + "–" + sayi(d.kemik_kaybi_yuzde[1], 1) : sayi(d.kemik_kaybi_yuzde[0], 1) + "–" + sayi(d.kemik_kaybi_yuzde[1], 1) + "%";
    $("mgPanel").innerHTML = '<p><strong class="sayi-font" style="font-size:1.6rem">' + esc(aralik) +
      "</strong> " + esc(t("saglik.kemikKayip")) + '</p><p class="ince">' + esc(t("saglik.kemikAlt")) + "</p>";
    takvimCiz(v.takvim);
  }
  function takvimCiz(gunler) {
    if (!gunler || !gunler.length) return;
    const bas = "<thead><tr><th>" + esc(t("saglik.sistem")) + "</th>" + gunler.map((g) => "<th>" + esc(gunYaz(g.tarih)) + '<br><span class="ince">Kp ' + (g.kp_max == null ? "—" : esc(sayi(g.kp_max, 1))) + (g.cme ? " · CME" : "") + "</span></th>").join("") + "</tr></thead>";
    const genel = '<tr class="genel-satir"><td>' + esc(t("saglik.genelRisk")) + "</td>" + gunler.map((g) => '<td class="h d-' + g.seviye + '" title="' + esc(t("seviye." + g.seviye)) + '">' + g.risk + "</td>").join("") + "</tr>";
    const satirlar = gunler[0].organlar.map((o, i) => "<tr><td>" + esc(t("organ." + o.id + ".ad")) + "</td>" + gunler.map((g) => {
      const x = g.organlar[i]; return '<td class="h d-' + x.seviye + '" title="' + esc(t("seviye." + x.seviye)) + '">' + x.skor + "</td>";
    }).join("") + "</tr>").join("");
    $("takvim").innerHTML = bas + "<tbody>" + genel + satirlar + "</tbody>";
    $("takvimNotlar").innerHTML = gunler.map((g) => "<li><strong>" + esc(gunYaz(g.tarih)) + ":</strong> " + g.notlar.map((n) => {
      const p = Object.assign({}, n); if (p.kp != null) p.kp = sayi(p.kp, 1); if (p.varis) p.saat = tarihSaatYaz(p.varis);
      return esc(t("takvimNot." + n.k, p));
    }).join(" ") + "</li>").join("");
  }

  /* ================================================================ EVA */
  function evaCiz(p) {
    const n = p.noktalar || [];
    grafik("evaGrafik", {
      type: "line",
      data: {
        labels: n.map((x) => saatYaz(x.t)),
        datasets: [
          { label: t("eva.risk"), data: n.map((x) => x.risk), borderColor: css("--seri-2"), borderWidth: 2, pointRadius: 0, tension: .15, order: 1 },
          { label: t("eva.bilissel"), data: n.map((x) => x.bilissel), borderColor: css("--seri-1"), borderWidth: 2, pointRadius: 0, tension: .3, order: 2 },
          { label: t("eva.uygun"), data: n.map((x) => (x.uygun ? 100 : null)), type: "bar", backgroundColor: S.tema === "dark" ? "rgba(76,196,106,.16)" : "rgba(30,138,60,.12)", barPercentage: 1, categoryPercentage: 1, order: 10 }
        ]
      },
      options: {
        maintainAspectRatio: false, animation: false, interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { boxWidth: 12, color: css("--murekkep-2") } },
          tooltip: { callbacks: { afterBody: (it) => { const x = n[it[0].dataIndex]; return t("bolge." + x.bolge) + (x.uyku ? ", " + t("eva.uyku") : "") + ", " + t(x.gunes ? "eva.gunduz" : "eva.gece"); } } }
        },
        scales: { y: eksen(t("eva.eksen"), { min: 0, max: 100 }), x: eksen(t("eva.zamanEksen", { z: S.saat === "utc" ? "UTC" : t("ctl.yerel") }), { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 9, color: css("--murekkep-2") } }) }
      }
    });
    $("evaPencereler").innerHTML = (p.pencereler || []).length
      ? p.pencereler.map((w) => "<li><strong>" + esc(saatYaz(w.baslangic)) + " – " + esc(saatYaz(w.bitis)) + '</strong><span class="ince">' + esc(t("eva.pencereSatir", { sure: w.sure_dk, risk: w.ort_risk, bil: w.ort_bilissel })) + "</span></li>").join("")
      : '<li class="ince">' + esc(t("eva.pencereYok", { saat: p.saat })) + "</li>";
    $("saaGecisler").innerHTML = (p.saa_gecisleri || []).length
      ? p.saa_gecisleri.map((g) => "<li><strong>" + esc(saatYaz(g.giris)) + '</strong><span class="ince">' + esc(t("eva.saaSatir", { sure: g.sure_dk })) + "</span></li>").join("")
      : '<li class="ince">' + esc(t("eva.saaYok", { saat: p.saat })) + "</li>";
    $("evaOzet").textContent = t("eva.ozet", { y: sayi(p.saa_zaman_yuzde, 1), g: p.gun_dogumu_sayisi });
  }

  /* ================================================================ durum */
  function durumGuncelle() {
    return getir("/api/durum", 15000).then((v) => {
      S.durum = v; durumCiz();
      if (v.surum && v.surum !== S.surum) { S.surum = v.surum; const sy = $("surumYazi"); if (sy) sy.textContent = t("hst.v.surum", { s: v.surum }); }
    }).catch(() => { S.durum = null; durumCiz(true); });
  }
  function kaynakGrubu(k) {
    for (const p of ["osdr_ara", "osdr_calisma", "osdr_org"]) if (k.startsWith(p)) return p;
    return k;
  }
  function durumCiz(kapali) {
    const r = $("durumRozet");
    if (kapali) { r.className = "rozet kapali"; r.textContent = t("durum.kapali"); return; }
    const v = S.durum;
    if (!v) { r.className = "rozet"; r.textContent = t("durum.baglaniyor"); return; }
    const k = v.kaynaklar || {}, adlar = Object.keys(k);
    const canli = adlar.filter((a) => k[a].durum === "canli").length;
    if (S.senaryo) { r.className = "rozet senaryo"; r.textContent = t("durum.senaryo"); }
    else if (adlar.length && canli >= adlar.length / 2) { r.className = "rozet canli"; r.textContent = t("durum.canli"); }
    else if (adlar.length) { r.className = "rozet yedek"; r.textContent = t("durum.yedek"); }
    r.title = v.demo_anahtar ? t("durum.demo") : "";
    const gruplar = {};
    adlar.forEach((a) => {
      const g = kaynakGrubu(a);
      if (!gruplar[g] || (gruplar[g].durum !== "canli" && k[a].durum === "canli")) gruplar[g] = k[a];
    });
    const sira = ["iss", "noaa_kp", "noaa_kp_tahmin", "goes_proton", "goes_proton_7g", "goes_xray", "noaa_olasilik", "noaa_27g", "donki_FLR", "donki_CME", "donki_SEP", "donki_GST", "osdr_ara", "osdr_calisma", "osdr_org"];
    $("kaynaklar").innerHTML = "<thead><tr><th>" + esc(t("yontem.durumKaynak")) + "</th><th>" + esc(t("yontem.durumDurum")) + "</th><th>" + esc(t("yontem.durumSon")) + "</th><th>" + esc(t("yontem.durumNot")) + "</th></tr></thead><tbody>" +
      sira.filter((g) => gruplar[g]).map((g) => {
        const s = gruplar[g];
        return "<tr><td>" + esc(t("kaynakAd." + g)) + '</td><td><span class="nokta ' + s.durum + '"></span>' + esc(buyukHarf(t("veri." + s.durum))) + "</td><td>" + esc(s.son_basari ? tarihSaatYaz(s.son_basari) : "—") +
          "</td><td>" + esc(s.durum === "canli" || !s.hata ? "" : t("hata." + s.hata)) + "</td></tr>";
      }).join("") + "</tbody>";
  }
  function guncellemeCiz() {
    $("guncelleme").textContent = S.sonGuncelleme ? t("durum.guncel", { s: Math.round((Date.now() - S.sonGuncelleme) / 1000) }) : "";
  }

  /* ================================================================ yöntem */
  function yontemCiz() {
    $("sozluk").innerHTML = t("sozluk").map((s) => "<div><dt>" + esc(s[0]) + "</dt><dd>" + esc(s[1]) + "</dd></div>").join("");
    const m = S.meta || { iss_gunluk_doz_msv: .5, kariyer_limiti_msv: 600, spe_olay_limiti_msv: 250, kemik_kaybi_aylik: [1, 1.5], dunya_yillik_doz_msv: 2.5, kalite_faktoru: 2, dsb_per_gy: 35 };
    const K = t("yontem.kaynakli"), V = t("yontem.varsayim");
    const STCE = "https://www.stce.be/news/756/welcome.html", STD = "https://www.nasa.gov/wp-content/uploads/2023/03/radiation-protection-technical-brief-ochmo.pdf";
    const satirlar = [
      ["yontem.s1", "~" + sayi(m.iss_gunluk_doz_msv, 1) + " mSv/" + (S.dil === "tr" ? "gün" : "day"), K, STCE, "STCE"],
      ["yontem.s2", sayi(m.kariyer_limiti_msv, 0) + " mSv", K, STD, "NASA-STD-3001"],
      ["yontem.s3", sayi(m.spe_olay_limiti_msv, 0) + " mSv", K, STD, "NASA-STD-3001"],
      ["yontem.s4", (S.dil === "tr" ? "%" + sayi(m.kemik_kaybi_aylik[0], 1) + "–" + sayi(m.kemik_kaybi_aylik[1], 1) + "/ay" : sayi(m.kemik_kaybi_aylik[0], 1) + "–" + sayi(m.kemik_kaybi_aylik[1], 1) + "%/month"), K, "https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/", "NASA HRP"],
      ["yontem.s5", "2–3 mSv/" + (S.dil === "tr" ? "yıl" : "year"), K, STCE, "STCE"],
      ["yontem.s8", t("yontem.s8d"), K, "https://www.swpc.noaa.gov/noaa-scales-explanation", "NOAA SWPC"],
      ["yontem.s6", "~" + sayi(m.kalite_faktoru, 1), V, null, ""],
      ["yontem.s7", "~" + sayi(m.dsb_per_gy, 0) + "/Gy", V, null, ""]
    ];
    $("sabitler").innerHTML = "<thead><tr><th>" + esc(t("yontem.aciklama")) + "</th><th>" + esc(t("yontem.sabit")) + "</th><th>" + esc(t("yontem.tur")) + "</th><th>" + esc(t("yontem.kaynak")) + "</th></tr></thead><tbody>" +
      satirlar.map((s) => "<tr><td>" + esc(t(s[0])) + '</td><td class="sayi">' + esc(s[1]) + "</td><td>" + esc(s[2]) + "</td><td>" + (s[3] ? '<a href="' + s[3] + '" target="_blank" rel="noopener">' + esc(s[4]) + "</a>" : "—") + "</td></tr>").join("") + "</tbody>";
  }

  /* ================================================================ OSDR */
  const OSDR_KONULAR = ["radyasyon_dna", "telomer", "kemik", "kas", "goz", "kalp", "beyin", "insan"];
  function osdrBaslat() {
    S.osdr.yuklendi = true;
    osdrKonulariCiz();
    osdrKonuSec(S.osdr.konu);
    getir("/api/osdr/istatistik", 120000).then((v) => { S.osdr.ist = v; osdrIstCiz(); }).catch(() => {});
  }
  function osdrKonulariCiz() {
    $("osdrKonular").innerHTML = OSDR_KONULAR.map((k) => '<button type="button" class="cip" role="tab" data-konu="' + k + '" aria-selected="' + (S.osdr.konu === k) + '">' + esc(t("osdrKonu." + k)) + "</button>").join("");
  }
  function osdrKonuSec(k) {
    S.osdr.konu = k; osdrKonulariCiz();
    $("osdrOzet").textContent = t("osdr.yukleniyor");
    getir("/api/osdr/konu?id=" + encodeURIComponent(k)).then((v) => { S.osdr.sonuc = v; osdrListeCiz(); }).catch(() => { $("osdrOzet").textContent = t("osdr.sonucYok"); });
  }
  function osdrAra(q) {
    q = (q || "").trim();
    if (q.length < 2) { $("osdrOzet").textContent = t("osdr.kisa"); return; }
    S.osdr.konu = null; osdrKonulariCiz();
    $("osdrOzet").textContent = t("osdr.yukleniyor");
    getir("/api/osdr/ara?q=" + encodeURIComponent(q), 30000).then((v) => { S.osdr.sonuc = v; osdrListeCiz(); }).catch(() => { $("osdrOzet").textContent = t("osdr.sonucYok"); });
  }
  function osdrListeCiz() {
    const v = S.osdr.sonuc; if (!v) return;
    if (!v.calismalar || !v.calismalar.length) { $("osdrOzet").textContent = t(v.durum === "yok" ? "osdr.cevrimdisi" : "osdr.sonucYok"); $("osdrListe").innerHTML = ""; return; }
    $("osdrOzet").innerHTML = esc(t("osdr.sonuc", { terim: v.terim, n: sayi(v.toplam, 0) })) + " <span class='ince'>(" + esc(t("veri." + v.durum)) + ")</span> " +
      '<a href="' + esc(v.arama_linki) + '" target="_blank" rel="noopener">' + esc(t("osdr.tumu")) + "</a>";
    $("osdrListe").innerHTML = v.calismalar.map((c) => '<li><button type="button" data-acc="' + esc(c.accession) + '" aria-pressed="' + (S.osdr.secili === c.accession) + '"><span class="acc">' + esc(c.accession) + "</span> " +
      esc(c.baslik) + '<span class="meta">' + esc(c.organizma) + ", " + esc(c.proje_turu) + "</span></button></li>").join("");
  }
  function osdrDetayAl(acc) {
    S.osdr.secili = acc; S.osdr.detay = { yukleniyor: true, accession: acc };
    osdrListeCiz(); osdrDetayCiz();
    getir("/api/osdr/calisma?id=" + encodeURIComponent(acc), 40000).then((c) => { S.osdr.detay = c; osdrDetayCiz(); })
      .catch(() => { S.osdr.detay = { accession: acc, hata: true, link: "https://osdr.nasa.gov/bio/repo/data/studies/" + acc }; osdrDetayCiz(); });
  }
  function osdrDetayCiz() {
    const el = $("osdrDetay"), c = S.osdr.detay;
    if (!c) { el.innerHTML = '<p class="ince">' + esc(t("osdr.detayBos")) + "</p>"; return; }
    if (c.yukleniyor) { el.innerHTML = '<p class="ince">' + esc(t("osdr.detayYukleniyor", { acc: c.accession })) + "</p>"; return; }
    if (c.hata) { el.innerHTML = "<h2>" + esc(c.accession) + "</h2><p>" + esc(t("osdr.hata")) + '</p><a href="' + esc(c.link) + '" target="_blank" rel="noopener">' + esc(t("osdr.ac")) + "</a>"; return; }
    const alanlar = [["osdr.organizma", c.organizma], ["osdr.proje", c.proje_turu], ["osdr.teknoloji", c.teknoloji], ["osdr.faktor", c.faktorler], ["osdr.gorev", c.gorev]].filter((a) => a[1]);
    el.innerHTML = '<div class="detay"><h2>' + esc(c.accession) + "</h2><p><strong>" + esc(c.baslik) + "</strong></p><dl>" +
      alanlar.map((a) => "<dt>" + esc(t(a[0])) + "</dt><dd>" + esc(a[1]) + "</dd>").join("") + "</dl>" + (c.aciklama ? '<p class="metin">' + esc(c.aciklama) + "</p>" : "") +
      '<p><a href="' + esc(c.link) + '" target="_blank" rel="noopener">' + esc(t("osdr.ac")) + '</a> &nbsp; <a href="' + esc(c.api) + '" target="_blank" rel="noopener">' + esc(t("osdr.json")) + '</a> <span class="ince">(' + esc(t("veri." + c.durum)) + ")</span></p></div>";
  }
  function osdrIstCiz() {
    const v = S.osdr.ist; if (!v) return;
    const k = v.konular.filter((x) => x.toplam).sort((a, b) => b.toplam - a.toplam);
    grafik("osdrGrafik", {
      type: "bar",
      data: { labels: k.map((x) => t("osdrKonu." + x.id)), datasets: [{ label: t("osdr.grafikEksen"), data: k.map((x) => x.toplam), backgroundColor: css("--altin"), borderRadius: 4, barPercentage: .7 }] },
      options: {
        indexAxis: "y", maintainAspectRatio: false, animation: false, plugins: { legend: { display: false } },
        onClick: (e, el) => { if (el.length) { osdrKonuSec(k[el[0].index].id); } },
        scales: { x: eksen(t("osdr.grafikEksen")), y: eksen("", { grid: { display: false }, ticks: { autoSkip: false, color: css("--murekkep-2") } }) }
      }
    });
    const org = v.organizmalar.filter((o) => o.veri_seti != null);
    $("organizmalar").innerHTML = org.length
      ? '<table class="tablo organizma-tablo"><tbody>' + org.map((o) => "<tr><td><em>" + esc(o.organizma) + '</em></td><td class="sayi">' + esc(sayi(o.veri_seti, 0)) + "</td></tr>").join("") + "</tbody></table>"
      : '<p class="ince">' + esc(t("osdr.organizmaYok")) + "</p>";
  }

  /* ================================================================ rapor */
  /* Kısa PDF rapor: yalnızca kritik veriler (anlık durum, mürettebat tablosu, aktif alarmlar). Tek-iki A4 sayfası. */
  function raporYazdir() {
    const q = "/api/vital?gecmis=0&eva=" + (S.eva ? 1 : 0) + (S.senaryo ? "&senaryo=" + S.senaryo : "");
    const hazir = [getir(q, 15000).then((v) => { S.vit.veri = v; vitalCiz(); }).catch(() => {})];
    if (!S.hst.veri) hazir.push(hastalikGuncelle());
    if (!S.risk) hazir.push(riskGuncelle());
    Promise.all(hazir).catch(() => {}).then(() => {
      kisaRaporCiz();
      document.body.classList.add("kisa-yazdir");
      const geriAl = () => { document.body.classList.remove("kisa-yazdir"); window.removeEventListener("afterprint", geriAl); };
      window.addEventListener("afterprint", geriAl);
      setTimeout(() => window.print(), 300);
    });
  }
  const kisaSaat = (x) => saatYaz(x).replace(/\s*UTC$/, "");
  function kisaRaporCiz() {
    const kutu = $("kisaRapor"); if (!kutu) return;
    const r = S.risk, h = S.hst.veri, vit = S.vit.veri;
    const zaman = vit ? vit.zaman * 1000 : Date.now();
    const kart = (ad, deger, alt, cls) => '<div class="kr-kart' + (cls ? " " + cls : "") + '"><p class="kr-ad">' + esc(ad) + '</p><p class="kr-deger">' + deger + "</p>" + (alt ? '<p class="kr-alt">' + esc(alt) + "</p>" : "") + "</div>";

    /* 1) Anlık durum */
    let anlik = "";
    if (r) {
      const d = r.doz, hv = r.hava, iss = (S.iss && S.iss.iss) || r.iss;
      const pen = r.eva_plan && r.eva_plan.pencereler && r.eva_plan.pencereler[0];
      anlik =
        kart(t("kr.risk"), esc(r.risk.skor) + "<small>/100</small>", t("seviye." + r.risk.seviye), "s-" + r.risk.seviye) +
        kart(t("kr.doz"), esc(sayi(d.gunluk_doz_msv, 2)) + "<small>mSv</small>", t("kr.kariyer", { y: yuzde(d.kariyer_limiti_yuzde, 1) })) +
        kart(t("kr.kp"), "Kp " + esc(sayi(hv.kp_simdi, 1)), hv.G ? "G" + hv.G : t("kr.firtinaYok")) +
        kart(t("kr.proton"), esc(sayi(hv.proton_10mev_pfu, hv.proton_10mev_pfu < 10 ? 2 : 0)) + "<small>pfu</small>", hv.S ? "S" + hv.S : t("kr.protonYok")) +
        kart(t("kr.konum"), esc(iss ? t("bolge." + iss.bolge) : "—"), "") +
        kart(t("kr.eva"), pen ? esc(kisaSaat(pen.baslangic) + "–" + kisaSaat(pen.bitis)) : esc(t("kr.evaYok")),
          pen ? (S.saat === "utc" ? "UTC" : t("ctl.yerel")) + " · " + t("kr.evaAlt", { d: pen.sure_dk, r: pen.ort_risk }) : "");
    } else anlik = '<p class="kr-yok">' + esc(t("kr.veriYok")) + "</p>";

    /* 2) Mürettebat tablosu */
    let tablo = '<p class="kr-yok">' + esc(t("kr.veriYok")) + "</p>";
    if (h) {
      const satirlar = h.astronotlar.map((a) => {
        const ek = etkinKarar(a), vv = vitAstronot(a.id), al = vitAlarmi(a.id), b = a.bugun || { skor: 0, seviye: "DUSUK" };
        let bulgu = "—", durum = esc(t("kr.normal")), dcls = "";
        if (vv) {
          const n = vv.an;
          bulgu = esc(t("kr.bulgu", { n: n.nabiz, s: n.sistolik, d: n.diyastolik, o: yuzde(n.spo2, 0) })) +
            (n.ritim === "duzensiz" ? ' · <b class="kr-kirmizi">' + esc(t("kr.duzensiz")) + "</b>" : "") +
            (n.aktivite === "egzersiz" || n.aktivite === "uyku" ? " <span>(" + esc(t("hst.v.aktivite." + n.aktivite)) + ")</span>" : "");
          if (n.sorunlar.length) { durum = '<b class="kr-kirmizi">' + esc(n.sorunlar.map(vitSorunMetni).join("; ")) + "</b>"; dcls = "zarar"; }
          else if (n.seviye === "dikkat") { durum = esc(t("kr.dikkat")); dcls = "dikkat"; }
        }
        return '<tr class="' + (al ? "kr-alarmda" : "") + '">' +
          "<td><b>" + esc(a.ad) + "</b><br><span>" + esc(t("hst.yas", { y: a.yas })) + "</span></td>" +
          "<td>" + esc(t("hst.h." + a.hastalik + ".ad")) + "</td>" +
          '<td class="kr-sayi s-yazi-' + b.seviye + '">' + esc(b.skor) + " · " + esc(t("seviye." + b.seviye)) + "</td>" +
          "<td><b>" + esc(t("hst.karar." + ek.seviye + ".b")) + "</b></td>" +
          "<td>" + esc(donusMetni(ek.oneri)) + "</td>" +
          "<td>" + bulgu + "</td>" +
          '<td class="' + dcls + '">' + durum + "</td></tr>";
      }).join("");
      tablo = '<table class="kr-tablo"><thead><tr><th>' + [t("kr.t.astronot"), t("kr.t.oyku"), t("kr.t.risk"), t("kr.t.karar"), t("kr.t.donus"), t("kr.t.bulgu"), t("kr.t.durum")].map(esc).join("</th><th>") +
        "</th></tr></thead><tbody>" + satirlar + "</tbody></table>";
    }

    /* 3) Aktif alarmlar: kim, ne oldu, kim yardım edecek, ilk adımlar */
    const alarmlar = vit ? vit.alarmlar : [];
    const ilk = (al, k) => ((t("hst.v.oneri." + al.olay + "." + k) || [])[0] || "—");
    const alarmHtml = alarmlar.length
      ? alarmlar.map((al) => {
        const a = vitAstronot(al.id) || {};
        return '<div class="kr-alarm"><p class="kr-alarm-bas"><b>' + esc(a.ad || al.id) + (a.yas ? " · " + esc(t("hst.yas", { y: a.yas })) : "") + "</b> — " + esc(t("hst.v.olay." + al.olay)) +
          ' <span class="kr-saat">' + esc(saatYaz(al.baslangic)) + "</span></p><ul>" +
          "<li><b>" + esc(t("kr.yardim")) + ":</b> " + esc(al.sorumlu ? al.sorumlu.ad + (al.yardimci ? ", " + al.yardimci.ad : "") : t("hst.v.murettebataYok")) + "</li>" +
          "<li><b>" + esc(t("kr.ilkAdim")) + ":</b> " + esc(ilk(al, "yontem")) + "</li>" +
          "<li><b>" + esc(t("hst.v.ilac")) + ":</b> " + esc(ilk(al, "ilac")) + "</li>" +
          "<li><b>" + esc(t("kr.acil")) + ":</b> " + esc(ilk(al, "acil")) + "</li></ul></div>";
      }).join("")
      : '<p class="kr-yok">' + esc(t("kr.alarmYok")) + "</p>";

    kutu.innerHTML =
      '<header class="kr-bas"><h1>' + esc(t("kr.baslik")) + "</h1><p>" + esc(t("kr.zaman", { z: tarihSaatYaz(new Date(zaman)) })) +
      (S.senaryo ? " · <b>" + esc(t("kr.senaryo")) + "</b>" : "") + (S.eva ? " · " + esc(t("kr.evaModu")) : "") + "</p></header>" +
      "<h2>" + esc(t("kr.b1")) + '</h2><div class="kr-kartlar">' + anlik + "</div>" +
      "<h2>" + esc(t("kr.b2")) + "</h2>" + tablo +
      "<h2>" + esc(t("kr.b3", { n: alarmlar.length })) + "</h2>" + alarmHtml +
      '<p class="kr-dip">' + esc(t("kr.dip")) + "</p>";
  }

  /* ================================================================ olaylar */
  function olaylariBagla() {
    window.addEventListener("hashchange", () => gorunumGoster(location.hash.slice(1)));
    document.querySelectorAll("[data-dil]").forEach((b) => b.addEventListener("click", () => { S.dil = b.dataset.dil; yaz("dil", S.dil); hepsiniCiz(); }));
    document.querySelectorAll("[data-saat]").forEach((b) => b.addEventListener("click", () => { S.saat = b.dataset.saat; yaz("saat", S.saat); hepsiniCiz(); }));
    $("temaBtn").addEventListener("click", () => { S.tema = S.tema === "dark" ? "light" : "dark"; yaz("tema", S.tema); temaUygula(); hepsiniCiz(); });
    $("senaryoBtn").addEventListener("click", () => { S.senaryo = S.senaryo ? null : "mayis2024"; metinleriUygula(); riskGuncelle().then(durumGuncelle); if (S.hst.veri || S.gorunum === "hastalik") hastalikGuncelle(); vitalGuncelle(); });
    $("raporBtn").addEventListener("click", raporYazdir);
    const gun = $("gorevGunu"), kay = $("gorevKaydir");
    let bekle;
    const gunAyarla = (x, kaynak) => {
      x = parseInt(x, 10); if (isNaN(x)) x = 120; x = Math.max(0, Math.min(1000, x));
      S.gorevGunu = x; yaz("gorevGunu", x);
      if (kaynak !== gun) gun.value = x;
      if (kaynak !== kay) kay.value = Math.min(400, x);
      clearTimeout(bekle); bekle = setTimeout(riskGuncelle, 250);
    };
    gun.addEventListener("change", () => gunAyarla(gun.value, gun));
    kay.addEventListener("input", () => gunAyarla(kay.value, kay));
    $("evaModu").addEventListener("change", (e) => { S.eva = e.target.checked; riskGuncelle(); if (S.hst.veri) hastalikGuncelle(); vitalGuncelle(); });
    $("hstKartlar").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-astronot]"); if (!b) return;
      S.hst.secili = b.dataset.astronot; yaz("hstSecili", S.hst.secili);
      hstKartlarCiz(S.hst.veri); hstDetayCiz(S.hst.veri); vitPanelCiz(); monitorGuncelle();
    });
    $("hstProfil").addEventListener("click", (e) => {
      const a = e.target.closest("a[data-konu]");
      if (a) { S.osdr.konu = a.dataset.konu; if (S.osdr.yuklendi) osdrKonuSec(a.dataset.konu); }
    });
    $("organlar").addEventListener("click", (e) => {
      const a = e.target.closest("a[data-konu]");
      if (a) { S.osdr.konu = a.dataset.konu; if (S.osdr.yuklendi) osdrKonuSec(a.dataset.konu); return; }
      const b = e.target.closest("button[data-organ]");
      if (b) organAc(b, b.getAttribute("aria-expanded") !== "true");
    });
    $("osdrKonular").addEventListener("click", (e) => { const b = e.target.closest("button[data-konu]"); if (b) osdrKonuSec(b.dataset.konu); });
    $("osdrListe").addEventListener("click", (e) => { const b = e.target.closest("button[data-acc]"); if (b) osdrDetayAl(b.dataset.acc); });
    $("osdrForm").addEventListener("submit", (e) => { e.preventDefault(); osdrAra($("osdrQ").value); });
  }

  /* ================================================================ başlat */
  function basla() {
    $("gorevGunu").value = S.gorevGunu; $("gorevKaydir").value = Math.min(400, S.gorevGunu);
    temaUygula(); metinleriUygula(); olaylariBagla(); yontemCiz();
    Chart.defaults.font.family = "Barlow, system-ui, sans-serif";
    Chart.defaults.font.size = 12;
    ulkeleriYukle().then(() => {
      kucukHarita = haritaOlustur($("miniHarita"), true);
      buyukHarita = haritaOlustur($("buyukHarita"), false);
      gorunumGoster(location.hash.slice(1) || "genel");
      issGuncelle(); setInterval(issGuncelle, 5000);
    });
    riskGuncelle().then(durumGuncelle);
    setInterval(riskGuncelle, 30000);
    setInterval(durumGuncelle, 15000);
    setInterval(() => { if (S.gorunum === "hastalik") hastalikGuncelle(); }, 60000);
    vitalGuncelle(true); setInterval(() => vitalGuncelle(false), 1000);
    window.addEventListener("resize", () => { EKG.w = 0; const c = $("ekgTuval"); if (c) { c.style.width = ""; c.style.height = ""; } });
    $("vitAlarmlar").addEventListener("click", (e) => {
      const b = e.target.closest("button[data-onay]"); if (!b) return;
      S.vit.onay[b.dataset.onay] = Date.now();
      const ids = Object.keys(S.vit.onay); if (ids.length > 200) delete S.vit.onay[ids[0]];
      yaz("vitOnay", S.vit.onay); S.vit.alarmImza = null; vitalCiz();
    });
    setInterval(() => { guncellemeCiz(); anlarCiz(); }, 1000);
    getir("/api/meta").then((m) => { S.meta = m; yontemCiz(); if (S.iss) issCiz(); }).catch(() => {});
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", basla); else basla();
})();
