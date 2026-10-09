/*
 * Languages the app can show and speak in full.
 * home is where the language is named from.
 * places are countries a person might type.
 */
(function () {
  var BT = (window.BT = window.BT || {});
  var LIST = [
    { code: "rw", name: "Ikinyarwanda", home: "Rwanda", speech: "rw-RW", also: ["Kinyarwanda", "Kenyarwanda", "Kenya Rwanda"], places: ["Rwanda"] },
    { code: "sw", name: "Kiswahili", home: "Kenya", speech: "sw-KE", also: ["Swahili"], places: ["Kenya", "Tanzania", "Uganda"] },
    { code: "en", name: "English", home: "United Kingdom", speech: "en-US", also: ["English"], places: ["United Kingdom", "United States", "USA", "Kenya", "Rwanda", "Nigeria", "Ghana", "Uganda", "Tanzania", "South Africa", "India", "Australia", "Canada", "Ireland", "New Zealand", "Liberia", "Sierra Leone", "Zambia", "Zimbabwe", "Botswana", "Malawi", "Namibia", "Singapore", "Philippines"] },
    { code: "fr", name: "Français", home: "France", speech: "fr-FR", also: ["French"], places: ["France", "Rwanda", "Belgium", "Switzerland", "Canada", "Senegal", "Cote d'Ivoire", "Ivory Coast", "Cameroon", "Mali", "Burkina Faso", "Niger", "Benin", "Togo", "Guinea", "Madagascar", "Haiti", "Democratic Republic of the Congo", "Congo", "Gabon", "Chad", "Central African Republic", "Burundi", "Morocco", "Algeria", "Tunisia"] },
    { code: "es", name: "Español", home: "Spain", speech: "es-ES", also: ["Spanish"], places: ["Spain", "Mexico", "Colombia", "Argentina", "Peru", "Chile", "Venezuela", "Ecuador", "Guatemala", "Cuba", "Bolivia", "Dominican Republic", "Honduras", "Paraguay", "El Salvador", "Nicaragua", "Costa Rica", "Panama", "Uruguay", "Equatorial Guinea"] },
    { code: "pt", name: "Português", home: "Portugal", speech: "pt-PT", also: ["Portuguese"], places: ["Portugal", "Brazil", "Angola", "Mozambique", "Cabo Verde", "Cape Verde", "Guinea-Bissau", "Sao Tome and Principe"] },
    { code: "ar", name: "العربية", home: "Saudi Arabia", speech: "ar-SA", dir: "rtl", also: ["Arabic"], places: ["Saudi Arabia", "Egypt", "Morocco", "Algeria", "Sudan", "Iraq", "Syria", "Yemen", "Jordan", "Lebanon", "Tunisia", "Libya", "United Arab Emirates", "Qatar", "Kuwait", "Oman", "Palestine", "Mauritania"] },
    { code: "de", name: "Deutsch", home: "Germany", speech: "de-DE", also: ["German"], places: ["Germany", "Austria", "Switzerland"] },
    { code: "zh", name: "中文", home: "China", speech: "zh-CN", also: ["Chinese", "Mandarin"], places: ["China", "Taiwan", "Singapore"] },
    { code: "hi", name: "हिन्दी", home: "India", speech: "hi-IN", also: ["Hindi"], places: ["India"] },
    { code: "ha", name: "Hausa", home: "Nigeria", speech: "ha-NG", also: ["Hausa"], places: ["Nigeria", "Niger"] },
    { code: "am", name: "አማርኛ", home: "Ethiopia", speech: "am-ET", also: ["Amharic"], places: ["Ethiopia"] }
  ];

  function fold(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "");
  }

  function ready(item) {
    return BT.i18n && BT.i18n.has ? BT.i18n.has(item.code) : true;
  }

  function find(code) {
    for (var i = 0; i < LIST.length; i++) {
      if (LIST[i].code === code) return LIST[i];
    }
    return null;
  }

  function tag(code) {
    var item = find(code);
    return item ? item.speech : "en-US";
  }

  function place(item, query) {
    var q = fold(query);
    var places = item.places || [];
    var i;
    if (q) {
      for (i = 0; i < places.length; i++) {
        if (fold(places[i]) === q) return places[i];
      }
      for (i = 0; i < places.length; i++) {
        if (fold(places[i]).indexOf(q) !== -1 && places[i].length > 3) return places[i];
      }
    }
    return item.home;
  }

  function search(query) {
    var q = fold(query);
    if (!q) return [];
    var hits = [];
    LIST.forEach(function (item) {
      if (!ready(item)) return;
      var name = fold(item.name);
      var home = fold(item.home);
      var aliases = (item.also || []).map(fold);
      var places = (item.places || []).map(fold);
      var score = 0;
      var i;
      if (name === q || aliases.indexOf(q) !== -1) score = 100;
      else if (home === q) score = 85;
      else if (places.indexOf(q) !== -1) score = 75;
      else if (name.indexOf(q) === 0 || home.indexOf(q) === 0) score = 60;
      else {
        for (i = 0; i < places.length; i++) {
          if (places[i].indexOf(q) === 0 && q.length >= 3) { score = 55; break; }
        }
        if (!score && q.length >= 4 && (name.indexOf(q) !== -1 || home.indexOf(q) !== -1)) score = 30;
        if (!score && q.length >= 4) {
          for (i = 0; i < places.length; i++) {
            if (places[i].indexOf(q) !== -1) { score = 30; break; }
          }
        }
        if (!score && q.length >= 6) {
          for (i = 0; i < aliases.length; i++) {
            if (aliases[i].indexOf(q) !== -1) { score = 40; break; }
          }
        }
      }
      if (score && home === q) score += 10;
      if (score) hits.push({ item: item, score: score });
    });
    hits.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.name < b.item.name ? -1 : 1;
    });
    return hits.slice(0, 12).map(function (row) { return row.item; });
  }

  var RATE = { rw: 0.9, sw: 0.92, fr: 0.95, ar: 0.9, am: 0.9, ha: 0.92, hi: 0.92, zh: 0.95, de: 0.95, es: 0.95, pt: 0.95, en: 0.96 };

  function voiceLang(voice) {
    return String(voice && voice.lang || "").toLowerCase().replace(/_/g, "-");
  }

  function pickVoice(code) {
    if (!window.speechSynthesis) return null;
    var want = tag(code).toLowerCase();
    var base = want.split("-")[0];
    var ranked = [];
    (window.speechSynthesis.getVoices() || []).forEach(function (voice) {
      var name = voiceLang(voice);
      var score = 0;
      if (name === want) score = 100;
      else if (name === base || name.indexOf(base + "-") === 0) score = 70;
      if (!score) return;
      if (voice.default) score += 5;
      if (/natural|premium|enhanced|neural/i.test(voice.name || "")) score += 8;
      ranked.push({ voice: voice, score: score });
    });
    ranked.sort(function (a, b) { return b.score - a.score; });
    return ranked.length ? ranked[0].voice : null;
  }

  function makeUtterance(text, code) {
    var utterance = new SpeechSynthesisUtterance(text);
    var voice = pickVoice(code);
    utterance.lang = tag(code);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voiceLang(voice) || utterance.lang;
    }
    utterance.rate = RATE[code] || 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    return utterance;
  }

  var keepAlive = 0;

  function say(text, code) {
    var synth = window.speechSynthesis;
    if (!synth || !text) return;
    if (keepAlive) clearInterval(keepAlive);
    function start() {
      var utterance = makeUtterance(text, code);
      synth.cancel();
      setTimeout(function () {
        synth.speak(utterance);
        if (synth.paused) synth.resume();
      }, 0);
      keepAlive = setInterval(function () {
        if (!synth.speaking) {
          clearInterval(keepAlive);
          keepAlive = 0;
          return;
        }
        synth.pause();
        synth.resume();
      }, 10000);
    }
    start();
    if (!pickVoice(code)) {
      var once = function () {
        synth.removeEventListener("voiceschanged", once);
        if (pickVoice(code)) start();
      };
      synth.addEventListener("voiceschanged", once);
    }
  }

  if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener("voiceschanged", function () {
      window.speechSynthesis.getVoices();
    });
  }

  BT.languages = {
    list: LIST,
    find: find,
    search: search,
    place: place,
    tag: tag
  };
  BT.speech = {
    tag: tag,
    say: say,
    pickVoice: pickVoice
  };
})();
