/*
 * Ask Mr Sérieux answers in the same language as the rest of the app.
 */
(function () {
  var add = window.BT && window.BT.guide && window.BT.guide.addLanguage;
  if (!add) return;

  function ui(pack) {
    pack.title = "Ask Mr Sérieux";
    return pack;
  }

  add("de", {
    ui: ui({
      hint: "Schreiben oder sprechen Sie. Die Antwort bleibt auf diesem Telefon, und er kann sie aussprechen.",
      placeholder: "Fragen Sie Ask Mr Sérieux",
      send: "Senden", close: "Schließen", you: "Sie", mic: "Sprechen", listening: "Stopp",
      hearOn: "Stimme an", hearOff: "Stimme aus", spoken: "Gesprochen", replay: "Hören",
      miss: "Ich habe die Wörter nicht verstanden. Sagen Sie es noch einmal, oder schreiben Sie die Frage. Die Antwort kann ich trotzdem aussprechen.",
      blocked: "Das Mikrofon ist blockiert. Erlauben Sie es für diese Seite, oder schreiben Sie die Frage.",
      unsupported: "Dieser Browser kann Sprache nicht in Wörter verwandeln. Schreiben Sie die Frage. Die Antwort kann ich trotzdem auf diesem Telefon aussprechen.",
      network: "Die Frage zu hören braucht eine Verbindung auf diesem Telefon. Schreiben Sie sie. Die Antwort kann ich ohne Internet aussprechen."
    }),
    suggest: ["Wie füge ich Einkommen hinzu?", "Wie funktionieren Ziele?", "Geht das ohne Internet?"],
    fallback: "Ich führe Sie durch diese App. Fragen Sie nach dem Menü, Einkommen oder Ausgaben, Zielen, Berichten, der Währung, einer Sperre für ein geteiltes Telefon, oder nach der Nutzung ohne Internet.",
    lines: [
      { id: "hello", keys: ["hallo", "hilfe", "wer bist du"], text: "Guten Tag. Ich bin Ask Mr Sérieux, der Begleiter von Budget Tracker. Fragen Sie mich, wie Sie Einkommen oder Ausgaben eintragen, ein Ziel setzen, einen Bericht lesen, die Währung wechseln, ein geteiltes Telefon sperren oder die App ohne Internet nutzen." },
      { id: "about", keys: ["was ist das", "diese app"], text: "Budget Tracker ist ein Heft für Ihr eigenes Geld. Sie schreiben Einkommen und Ausgaben auf, setzen Sparziele und lesen Berichte für einen Tag, einen Monat oder eine Kategorie. Die Aufzeichnungen bleiben auf diesem Telefon. Sie gehen nicht an eine Bank und werden nirgendwohin gesendet." },
      { id: "start", keys: ["anfang", "erste mal", "drei fragen"], text: "Beim ersten Mal wählen Sie eine Sprache, eine Textgröße und den Namen Ihres Geldes, zum Beispiel RWF oder USD. Dann beantworten Sie drei kurze Fragen: Einkommen, Ausgaben und ein Ziel. Wenn Sie fertig sind, ersetzen Ihre Antworten das Beispiel." },
      { id: "menu", keys: ["menü", "weiter", "zurück"], text: "Das Menü ist eine nummerierte Liste, in derselben Reihenfolge wie das geschriebene Programm. Weiter geht von 1 bis 15, dann Beenden. Zurück geht einen Schritt zurück. Das Menü hat Weiter und kein Zurück. Beenden hat Zurück und kein Weiter. Auf dem Telefon bringt Menü unten Sie zur Liste. Einstellungen ist der Knopf oben, keine Nummer." },
      { id: "add", keys: ["einkommen hinzu", "ausgabe hinzu", "wie füge ich einkommen"], text: "Öffnen Sie 1, Transaktion hinzufügen. Wählen Sie Einkommen oder Ausgaben. Wählen Sie den Zweck aus der langen Liste. Wenn er fehlt, wählen Sie Einen Namen hinzufügen, schreiben Sie den Namen und Speichern. Danach Betrag und Datum, und Speichern." },
      { id: "income", keys: ["einkommen", "ausgaben"], text: "Einkommen ist Geld, das zu Ihnen kommt: Lohn, Verkauf, ein Geschenk oder gesendetes Geld. Ausgaben sind das, was Sie ausgeben. Die Knöpfe heißen Einkommen hinzufügen und Ausgaben hinzufügen." },
      { id: "edit-tx", keys: ["transaktion ändern", "transaktion löschen"], text: "Zum Ändern öffnen Sie 3, Transaktion aktualisieren. Tippen Sie auf Bearbeiten, ändern Sie die Felder und Speichern. Zum Entfernen öffnen Sie 4, Transaktion löschen. Tippen Sie auf Löschen und bestätigen Sie. Behalten lässt die Aufzeichnung, wo sie ist." },
      { id: "search", keys: ["suchen", "filtern"], text: "Öffnen Sie 5, Transaktionen suchen oder filtern. Schreiben Sie Wörter, wählen Sie Einkommen oder Ausgaben, eine Kategorie und ein Von-Datum und ein Bis-Datum. Die Liste ändert sich beim Schreiben. Für Ziele öffnen Sie 14." },
      { id: "report", keys: ["bericht", "monat", "tag"], text: "6 ist die Monatsübersicht. 7 listet jeden Tag. 8 öffnet ein Datum, das Sie wählen. 9 zeigt, wohin die Ausgaben gingen. 15 ist der Fortschritt der Ersparnisse. Eine Seite macht eine kurze Zusammenfassung, und Drucken druckt sie. Menü und dieser Begleiter stehen nicht auf der gedruckten Seite." },
      { id: "check", keys: ["prüfcode", "bericht prüfen"], text: "Ein heruntergeladener Bericht hat einen Prüfcode, gemacht aus den Beträgen auf dieser Seite. Im Menü ist Einen Bericht prüfen keine Nummer. Schreiben Sie den Code. Die App zeigt die Beträge, die dazu gehören. Vergleichen Sie sie mit dem Papier. Wenn eine Zahl anders ist, wurde dieser Bericht geändert. Ein Code von außerhalb von Budget Tracker besteht nicht." },
      { id: "delete-goal", keys: ["ziel löschen"], text: "Öffnen Sie 13, Sparziel löschen. Tippen Sie auf Löschen und bestätigen Sie. Behalten lässt das Ziel. Zum Ändern öffnen Sie 12, tippen auf Bearbeiten und Speichern." },
      { id: "goal", keys: ["ziel", "ziele", "wie funktionieren ziele"], text: "Öffnen Sie 10, um ein Ziel hinzuzufügen. Ein einfaches Ziel braucht einen Namen, den Betrag und ein Datum. Sie können auch aufschreiben, was Sie schon zur Seite gelegt haben. 11 zeigt die Ziele, 12 ändert eines, 13 löscht eines. Ich habe mehr zurückgelegt addiert Geld seit dem letzten Mal." },
      { id: "smart", keys: ["smart", "fünf sätze"], text: "Ein SMART-Ziel ist dasselbe Ziel plus fünf kurze Sätze. S ist, wofür das Geld genau ist. M ist der Betrag. A ist, was Sie jeden Monat zur Seite legen können. R ist, warum es zählt. T ist das Datum. Der Bericht sagt, ob der monatliche Schritt zum Datum passt." },
      { id: "emergency", keys: ["notfall", "sieben tage"], text: "Wenn der Name des Ziels Notfall sagt, erscheint der Fortschritt als Tage einer schweren Woche, von 0 bis 7, plus der Prozentsatz. Das sind die Tage von diesen 7, die das schon gesparte Geld decken würde." },
      { id: "saved", keys: ["ich habe gespart", "zur seite gelegt"], text: "Öffnen Sie 11, Sparziele ansehen. Tippen Sie auf Ich habe mehr zurückgelegt, schreiben Sie den Betrag und Speichern. Der gesparte Betrag steigt, und der Prozentsatz folgt. Der Knopf ist beim Ansehen, nicht beim Löschen." },
      { id: "currency", keys: ["währung", "wechselkurs"], text: "In den Einstellungen, unter Währung, suchen Sie das Geld dieser Beträge, zum Beispiel RWF oder USD. Die erste Wahl benennt die Zahlen nur. Die nächste schreibt jeden Betrag mit dem Kurs der Zentralbank für den gewählten Tag um. Die App zeigt den Kurs und wartet, bis Sie Die Beträge ändern tippen. Ohne Internet nutzt sie einen schon gespeicherten Kurs und nennt den Tag." },
      { id: "abroad", keys: ["ausland", "überweisung"], text: "Geld aus dem Ausland ist nur für ein Geschenk oder eine Zahlung in einer anderen Währung. In den Einstellungen schreiben Sie diese Währung. Diese Beträge bleiben außerhalb von Einkommen, Ausgaben und dem, was Sie behalten haben. Die Hauptwährung schreibt sie nicht um." },
      { id: "offline", keys: ["ohne internet", "kein internet", "offline"], text: "Ja. Nach dem ersten Öffnen auf dem Telefon funktionieren Einkommen, Ausgaben, Ziele, Berichte, das Menü und dieser Begleiter ohne Internet. Die Aufzeichnungen bleiben auf diesem Telefon. Ein neues Währungspaar, zum Beispiel RWF nach USD das erste Mal, braucht einmal eine Verbindung, damit der Kurs des Tages gespeichert wird. Danach geht auch dieser Wechsel ohne Internet." },
      { id: "lock", keys: ["sperre", "pin", "geteiltes telefon"], text: "Ein Freund kann das Passwort des Telefons kennen und soll dieses Heft trotzdem nicht lesen. In den Einstellungen, unter Auf einem geteilten Telefon, setzen Sie eine Sperre nur für diese App. Sie fragt danach beim Öffnen. Die Sperre bleibt auf diesem Telefon, ist nicht in einer exportierten Datei und wird nirgendwohin gesendet. Die App liest kein Gesicht." },
      { id: "hide", keys: ["beträge verbergen", "verbergen"], text: "Beträge verbergen ist der Knopf oben. Er deckt die Zahlen zu, während jemand auf das Telefon schaut. Tippen Sie noch einmal, Beträge zeigen, und die Zahlen kommen zurück. Die Aufzeichnungen sind noch da." },
      { id: "language", keys: ["sprache", "deutsch", "kinyarwanda"], text: "Suchen Sie eine Sprache. Schreiben Sie ein Land oder eine Sprache, zum Beispiel Ruanda oder Kinyarwanda. Das Land erscheint zuerst, dann die Sprache. Menü, jede Seite und dieser Begleiter folgen dieser Sprache, und er spricht sie so, wie sie gesprochen wird. Danach suchen Sie eine Währung. Beides können Sie in den Einstellungen wieder ändern. Arabisch läuft von rechts nach links. Die Sonne bleibt oben rechts." },
      { id: "export", keys: ["exportieren", "importieren", "löschen"], text: "In den Einstellungen speichert Aufzeichnungen exportieren eine Datei, bevor Sie das Telefon wechseln. Importieren liest dieselbe Datei. Alle Aufzeichnungen löschen leert das Heft nach einer Bestätigung. Die Sperre der App ist nicht in der exportierten Datei." },
      { id: "example", keys: ["beispiel"], text: "Das Beispiel ist auf dem ersten Bildschirm und auch in den Einstellungen. Es ist ein Musterleben mit Einkommen, Ausgaben und Zielen, darunter eine Reise. Es ist nicht Ihr Geld. Wenn Sie Ihre eigenen drei Fragen beenden, ersetzen Ihre Antworten das Beispiel." },
      { id: "exit", keys: ["beenden", "verlassen"], text: "0, Beenden, schließt den Browser nicht. Es sagt, dass die Aufzeichnungen auf diesem Telefon gespeichert sind. Zurück zum Menü bringt die nummerierte Liste. Zurück von Beenden geht zum Fortschritt der Ersparnisse." },
      { id: "why", keys: ["armut", "inklusion", "warum"], text: "Der Zweck ist Übung mit Ihrem eigenen Geld, damit eine schwere Woche das Haus nicht ohne Warnung leert. Sie sehen, was kam, was ging, was Sie behielten und wie nah ein Ziel ist. Eine Person kann ein klares Heft führen ohne Bankkonto und ohne Internet. Die Aufzeichnungen bleiben auf diesem Telefon." }
    ]
  });

  add("zh", {
    ui: ui({
      hint: "输入或说话。回答留在这台手机上，他也可以把它说出来。",
      placeholder: "问 Ask Mr Sérieux",
      send: "发送", close: "关闭", you: "你", mic: "说话", listening: "停止",
      hearOn: "语音开", hearOff: "语音关", spoken: "已说出", replay: "听",
      miss: "我没有听清。请再说一次，或把问题写下来。我仍然可以说出回答。",
      blocked: "麦克风被挡住了。请在这个页面允许它，或把问题写下来。",
      unsupported: "这个浏览器不能把语音变成文字。请写下问题。我仍然可以在这台手机上说出回答。",
      network: "听问题需要这台手机联网。请写下来。没有网络我也可以说出回答。"
    }),
    suggest: ["怎么添加收入？", "目标怎么用？", "没有网络也能用吗？"],
    fallback: "我可以带你用这个应用。可以问菜单、收入或支出、目标、报告、货币、共用手机的锁，或没有网络时怎么用。",
    lines: [
      { id: "hello", keys: ["你好", "帮助"], text: "你好。我是 Ask Mr Sérieux，Budget Tracker 的向导。你可以问我怎么记收入或支出、怎么定目标、怎么看报告、怎么换货币、怎么锁共用的手机，或没有网络时怎么用。" },
      { id: "about", keys: ["这是什么", "这个应用"], text: "Budget Tracker 是你自己的钱的本子。你记下收入和支出，定下储蓄目标，并按一天、一个月或一个类别看报告。记录留在这台手机上。它不连接银行，也不把记录发到任何地方。" },
      { id: "start", keys: ["开始", "第一次", "三个问题"], text: "第一次先选语言、文字大小和钱的名称，例如 RWF 或 USD。然后回答三个短问题：收到的收入、付出的支出和一个目标。完成后，你的回答会换掉示例。" },
      { id: "menu", keys: ["菜单", "下一页", "上一页"], text: "菜单是编号列表，顺序和书面程序一样。下一页从 1 走到 15，然后是退出。上一页退一步。菜单只有下一页。退出只有上一页。手机上，底部的菜单回到列表。设置是顶部的按钮，不是列表里的号码。" },
      { id: "add", keys: ["添加收入", "怎么添加收入", "添加支出"], text: "打开 1，添加交易。选择收入或支出。从长列表里选用途。如果没有，选添加一个名称，写下名称并保存。然后写下金额和日期，再保存。" },
      { id: "income", keys: ["收入", "支出"], text: "收入是到你手里的钱：工资、销售收入、礼物或别人寄来的钱。支出是你花出去的钱。按钮写的是添加收入和添加支出。" },
      { id: "edit-tx", keys: ["修改交易", "删除交易"], text: "要改一条，打开 3，更新交易。按编辑，改完后保存。要删一条，打开 4，删除交易。按删除，然后确认。保留会让记录留在原地。" },
      { id: "search", keys: ["搜索", "筛选"], text: "打开 5，搜索或筛选交易。写下词语，选择收入或支出、类别、开始日期和结束日期。你一边写，列表一边变。目标请打开 14。" },
      { id: "report", keys: ["报告", "本月", "每天"], text: "6 是本月摘要。7 列出每一天。8 打开你选的一天。9 显示支出去了哪里。15 是储蓄进度。一页会做成短摘要，打印会把它印出来。菜单和这个向导不会出现在打印纸上。" },
      { id: "check", keys: ["核对码", "核对一份报告"], text: "下载的报告上有一个核对码，由那一页的金额做成。在菜单里，核对一份报告不是一个编号。写下这个码。应用会显示属于它的金额。拿它们和纸上的数字对照。如果有一个数字不同，这份报告被改过。在 Budget Tracker 之外编造的码不会通过。" },
      { id: "delete-goal", keys: ["删除目标"], text: "打开 13，删除储蓄目标。在目标上按删除，然后确认。保留会留下目标。要修改，打开 12，按编辑，然后保存。" },
      { id: "goal", keys: ["目标", "目标怎么用"], text: "打开 10 添加目标。简单目标需要名称、想达到的金额和日期。也可以写下已经存下的钱。11 查看目标，12 修改，13 删除。我又存了更多会加上这次新存的钱。" },
      { id: "smart", keys: ["smart", "五句话"], text: "SMART 目标是同一个目标加上五句短话。S 是这笔钱到底为了什么。M 是要达到的金额。A 是每个月能存下多少。R 是为什么重要。T 是日期。报告会告诉你每月这一步是否跟得上日期。" },
      { id: "emergency", keys: ["应急", "七天"], text: "如果目标名称里有应急，进度会显示成艰难一周的天数，从 0 到 7，旁边还有百分比。这是已经存下的钱能覆盖这 7 天里的几天。" },
      { id: "saved", keys: ["我又存了", "存下"], text: "打开 11，查看储蓄目标。按我又存了更多，写下刚存下的金额，然后保存。已存金额会上升，百分比跟着动。这个按钮在查看这一步，不在删除这一步。" },
      { id: "currency", keys: ["货币", "汇率"], text: "在设置里的货币下，搜索这些金额使用的钱，例如 RWF 或 USD。第一次选择只给数字起名。下一次会按你选的那一天的中央银行汇率改写每一笔金额。应用会显示汇率，并等你按更改金额。没有网络时，它用手机上已经保存的汇率，并说出那一天。" },
      { id: "abroad", keys: ["国外", "汇款"], text: "来自国外的钱只用于另一种货币的礼物或付款。在设置里写下那种货币。这些金额不进入收入、支出和留下的钱。更换主要货币不会改写它们。" },
      { id: "offline", keys: ["没有网络", "没有网络也能用吗", "离线"], text: "可以。这台手机打开过一次之后，收入、支出、目标、报告、菜单和这个向导都可以没有网络。记录留在这台手机上。第一次把一种新货币换成另一种，例如 RWF 换成 USD，需要连一次网，才能保存那一天的汇率。之后这次更换也可以离线完成。" },
      { id: "lock", keys: ["锁屏", "密码", "共用手机"], text: "朋友可能知道手机密码，却不该看这本账。在设置里的共用手机下，设一个只给这个应用用的锁。打开时它会问。锁留在这台手机上，不在导出的文件里，也不会发到别处。这个应用不扫描脸。" },
      { id: "hide", keys: ["隐藏金额"], text: "隐藏金额是顶部的按钮。别人看手机时，它盖住数字。再按一次，显示金额，数字就回来。记录还在，只是数字被盖住了。" },
      { id: "language", keys: ["语言", "中文", "卢旺达"], text: "搜索一种语言。输入国家或语言，例如卢旺达或 Kinyarwanda。国家先出现，然后是语言。菜单、每一页和这个向导都用那种语言，向导也按那种语言本来的说法把它说出来。然后再搜索货币。两项都可以在设置里再改。阿拉伯语从右向左。太阳留在右上角。" },
      { id: "export", keys: ["导出", "导入", "清除"], text: "在设置里，导出记录会保存一个文件，换手机前可以带走。导入记录读回同一个文件。清除全部记录会在你确认后清空本子。应用的锁不在导出的文件里。" },
      { id: "example", keys: ["示例"], text: "示例在第一屏，也可以在设置里放回来。它是一个样本生活，有收入、支出和目标，包括一次旅行。那不是你的钱。你完成自己的三个问题后，你的回答会换掉它。" },
      { id: "exit", keys: ["退出"], text: "0，退出，不会关闭浏览器。它告诉你记录已经保存在这台手机上。回到菜单会回到编号列表。从退出按上一页，会到储蓄进度。" },
      { id: "why", keys: ["贫困", "包容"], text: "目的是用你自己的钱来练习，让艰难的一周不会毫无预警地把家里掏空。你看见进了什么、出了什么、留下什么，以及目标有多近。一个人可以没有银行账户、没有网络，也把账本记清楚。记录留在这台手机上。" }
    ]
  });

  add("hi", {
    ui: ui({
      hint: "लिखें या बोलें। जवाब इस फ़ोन पर रहता है, और वह उसे बोल सकता है।",
      placeholder: "Ask Mr Sérieux से पूछें",
      send: "भेजें", close: "बंद करें", you: "आप", mic: "बोलें", listening: "रुकें",
      hearOn: "आवाज़ चालू", hearOff: "आवाज़ बंद", spoken: "बोला गया", replay: "सुनें",
      miss: "मैं शब्द नहीं पकड़ पाया। फिर से कहें, या प्रश्न लिखें। जवाब मैं फिर भी बोल सकता हूँ।",
      blocked: "माइक्रोफ़ोन रुका है। इस पृष्ठ के लिए उसे अनुमति दें, या प्रश्न लिखें।",
      unsupported: "यह ब्राउज़र आवाज़ को शब्दों में नहीं बदल सकता। प्रश्न लिखें। जवाब मैं इस फ़ोन पर बोल सकता हूँ।",
      network: "प्रश्न सुनने के लिए इस फ़ोन पर कनेक्शन चाहिए। उसे लिखें। जवाब मैं बिना इंटरनेट बोल सकता हूँ।"
    }),
    suggest: ["आय कैसे जोड़ूँ?", "लक्ष्य कैसे काम करते हैं?", "क्या यह बिना इंटरनेट चलेगा?"],
    fallback: "मैं इस ऐप में आपका मार्गदर्शन कर सकता हूँ। मेनू, आय या खर्च, लक्ष्य, रिपोर्ट, मुद्रा, साझे फ़ोन का ताला, या बिना इंटरनेट के उपयोग के बारे में पूछें।",
    lines: [
      { id: "hello", keys: ["नमस्ते", "मदद"], text: "नमस्ते। मैं Ask Mr Sérieux हूँ, Budget Tracker का मार्गदर्शक। मुझसे पूछें कि आय या खर्च कैसे जोड़ें, लक्ष्य कैसे रखें, रिपोर्ट कैसे पढ़ें, मुद्रा कैसे बदलें, साझा फ़ोन कैसे ताला लगाएँ, या बिना इंटरनेट कैसे उपयोग करें।" },
      { id: "about", keys: ["यह क्या है", "यह ऐप"], text: "Budget Tracker आपकी अपनी धनराशि की किताब है। आप आय और खर्च लिखते हैं, बचत के लक्ष्य रखते हैं, और एक दिन, एक महीने या एक श्रेणी की रिपोर्ट पढ़ते हैं। रिकॉर्ड इस फ़ोन पर रहते हैं। यह बैंक से नहीं जुड़ता और आपके रिकॉर्ड कहीं नहीं भेजता।" },
      { id: "start", keys: ["शुरुआत", "पहली बार", "तीन प्रश्न"], text: "पहली बार भाषा, अक्षर का आकार और अपने पैसे का नाम चुनें, जैसे RWF या USD। फिर तीन छोटे प्रश्नों के उत्तर दें: मिली आय, किया खर्च और एक लक्ष्य। जब आप समाप्त करते हैं, आपके उत्तर उदाहरण की जगह ले लेते हैं।" },
      { id: "menu", keys: ["मेनू", "अगला", "पिछला"], text: "मेनू एक क्रमांकित सूची है, लिखे हुए कार्यक्रम के उसी क्रम में। अगला 1 से 15 तक ले जाता है, फिर बाहर। पिछला एक कदम लौटता है। मेनू में अगला है, पिछला नहीं। बाहर में पिछला है, अगला नहीं। फ़ोन पर नीचे मेनू सूची पर लौटाता है। सेटिंग ऊपर का बटन है, सूची की संख्या नहीं।" },
      { id: "add", keys: ["आय कैसे जोड़ूँ", "आय जोड़", "खर्च जोड़"], text: "1 खोलें, लेनदेन जोड़ें। आय या खर्च चुनें। लंबी सूची से बताएँ कि यह किस लिए था। अगर वह नहीं है, तो नया नाम जोड़ें, नाम लिखें और सहेजें। फिर राशि और तारीख लिखें, और सहेजें।" },
      { id: "income", keys: ["आय", "खर्च"], text: "आय वह पैसा है जो आपके पास आता है: वेतन, बिक्री, उपहार या भेजा गया पैसा। खर्च वह है जो आप खर्च करते हैं। बटन कहते हैं आय जोड़ें और खर्च जोड़ें।" },
      { id: "edit-tx", keys: ["लेनदेन बदलें", "लेनदेन हटाएँ"], text: "बदलने के लिए 3 खोलें, लेनदेन अपडेट करें। संपादित दबाएँ, फ़ील्ड बदलें और सहेजें। हटाने के लिए 4 खोलें। हटाएँ दबाएँ, फिर पुष्टि करें। रखने दें रिकॉर्ड को वहीं छोड़ता है।" },
      { id: "search", keys: ["खोज", "छानें"], text: "5 खोलें, लेनदेन खोजें या छानें। शब्द लिखें, आय या खर्च चुनें, श्रेणी चुनें, और आरंभ व अंत की तारीख रखें। लिखते ही सूची बदलती है। लक्ष्यों के लिए 14 खोलें।" },
      { id: "report", keys: ["रिपोर्ट", "महीना", "दिन"], text: "6 महीने का सार है। 7 हर दिन दिखाता है। 8 आपकी चुनी तारीख खोलता है। 9 बताता है खर्च कहाँ गया। 15 बचत की प्रगति है। एक पृष्ठ छोटा सार बनाता है, और छापें उसे छापता है। मेनू और यह मार्गदर्शक छपे पृष्ठ पर नहीं आते।" },
      { id: "check", keys: ["जाँच कोड", "रिपोर्ट जाँचें"], text: "डाउनलोड की गई रिपोर्ट पर एक जाँच कोड होता है, जो उस पृष्ठ की राशियों से बना होता है। मेनू में रिपोर्ट जाँचें कोई नंबर नहीं है। कोड लिखें। ऐप वे राशियाँ दिखाता है जो उसकी हैं। उन्हें कागज़ से मिलाएँ। अगर कोई संख्या अलग है, तो वह रिपोर्ट बदली गई है। Budget Tracker के बाहर बनाया कोड पास नहीं होता।" },
      { id: "delete-goal", keys: ["लक्ष्य हटाएँ"], text: "13 खोलें, बचत लक्ष्य हटाएँ। लक्ष्य पर हटाएँ दबाएँ, फिर पुष्टि करें। रखने दें लक्ष्य को छोड़ देता है। बदलने के लिए 12 खोलें, संपादित दबाएँ और सहेजें।" },
      { id: "goal", keys: ["लक्ष्य", "लक्ष्य कैसे काम"], text: "लक्ष्य जोड़ने के लिए 10 खोलें। सरल लक्ष्य को नाम, राशि और तारीख चाहिए। जो पहले से अलग रखा है वह भी लिख सकते हैं। 11 लक्ष्य दिखाता है, 12 एक को बदलता है, 13 एक को हटाता है। मैंने और बचाया पिछली बार के बाद रखा पैसा जोड़ता है।" },
      { id: "smart", keys: ["smart", "पाँच वाक्य"], text: "SMART लक्ष्य वही लक्ष्य है, साथ में पाँच छोटे वाक्य। S है पैसा किस काम के लिए है। M है कितना चाहिए। A है हर महीने कितना अलग रख सकते हैं। R है यह क्यों ज़रूरी है। T है तारीख। रिपोर्ट बताती है कि मासिक कदम तारीख के साथ है या नहीं।" },
      { id: "emergency", keys: ["आपात", "सात दिन"], text: "अगर लक्ष्य के नाम में आपात है, तो प्रगति कठिन सप्ताह के दिनों में दिखती है, 0 से 7 तक, और प्रतिशत भी। यह बताता है कि बचाया पैसा उन 7 दिनों में से कितने दिन संभालेगा।" },
      { id: "saved", keys: ["मैंने बचाया", "और बचाया"], text: "11 खोलें, बचत लक्ष्य देखें। मैंने और बचाया दबाएँ, अभी रखी राशि लिखें और सहेजें। बचाई राशि बढ़ती है, प्रतिशत उसके साथ चलता है। यह बटन देखने के चरण पर है, हटाने पर नहीं।" },
      { id: "currency", keys: ["मुद्रा", "विनिमय"], text: "सेटिंग में मुद्रा के नीचे वह पैसा खोजें जिसमें ये राशियाँ हैं, जैसे RWF या USD। पहला चुनाव केवल संख्याओं का नाम रखता है। अगला चुनाव हर राशि को उस दिन की केंद्रीय बैंक दर से लिखता है। ऐप दर दिखाता है और तब तक रुकता है जब तक आप राशियाँ बदलें नहीं दबाते। बिना इंटरनेट यह फ़ोन पर सहेजी दर का उपयोग करता है और दिन बताता है।" },
      { id: "abroad", keys: ["विदेश", "प्रेषण"], text: "विदेश से आया पैसा केवल दूसरी मुद्रा में मिले उपहार या भुगतान के लिए है। सेटिंग में वह मुद्रा लिखें। ये राशियाँ आय, खर्च और रखे हुए पैसे से बाहर रहती हैं। मुख्य मुद्रा उन्हें नहीं बदलती।" },
      { id: "offline", keys: ["बिना इंटरनेट", "क्या यह बिना इंटरनेट"], text: "हाँ। इस फ़ोन पर एक बार खुलने के बाद आय, खर्च, लक्ष्य, रिपोर्ट, मेनू और यह मार्गदर्शक बिना इंटरनेट चलते हैं। रिकॉर्ड इस फ़ोन पर रहते हैं। एक नई मुद्रा जोड़ी, जैसे पहली बार RWF से USD, को उस दिन की दर सहेजने के लिए एक बार कनेक्शन चाहिए। उसके बाद वह बदलाव भी बिना इंटरनेट होता है।" },
      { id: "lock", keys: ["ताला", "पिन", "साझा फ़ोन"], text: "कोई मित्र फ़ोन का पासवर्ड जानता हो, फिर भी यह किताब नहीं पढ़नी चाहिए। सेटिंग में साझा फ़ोन के नीचे केवल इस ऐप का ताला लगाएँ। खुलते समय वह पूछता है। ताला इस फ़ोन पर रहता है, निर्यात की फ़ाइल में नहीं, और कहीं नहीं भेजा जाता। यह ऐप चेहरा नहीं देखता।" },
      { id: "hide", keys: ["राशियाँ छिपाएँ"], text: "राशियाँ छिपाएँ ऊपर का बटन है। कोई फ़ोन देख रहा हो तो यह संख्याएँ ढक देता है। फिर दबाएँ, राशियाँ दिखाएँ, और संख्याएँ लौट आती हैं। रिकॉर्ड वहीं रहते हैं।" },
      { id: "language", keys: ["भाषा", "हिन्दी", "रवांडा"], text: "भाषा खोजें। देश या भाषा लिखें, जैसे रवांडा या Kinyarwanda। देश पहले दिखता है, फिर भाषा। मेनू, हर पृष्ठ और यह मार्गदर्शक उस भाषा में चलते हैं, और यह मार्गदर्शक उसे वैसे बोलता है जैसे वह भाषा बोली जाती है। फिर मुद्रा खोजें। दोनों सेटिंग में फिर बदल सकते हैं। अरबी दाएँ से बाएँ चलती है। सूरज ऊपर दाएँ रहता है।" },
      { id: "export", keys: ["निर्यात", "आयात", "मिटाएँ"], text: "सेटिंग में रिकॉर्ड निर्यात फ़ोन बदलने से पहले एक फ़ाइल बचाता है। आयात वही फ़ाइल पढ़ता है। सभी रिकॉर्ड मिटाएँ पुष्टि के बाद किताब खाली करता है। ऐप का ताला निर्यात की फ़ाइल में नहीं होता।" },
      { id: "example", keys: ["उदाहरण"], text: "उदाहरण पहली स्क्रीन पर है, और सेटिंग में भी लौटाया जा सकता है। यह एक नमूना जीवन है, जिसमें आय, खर्च और लक्ष्य हैं, एक यात्रा भी। यह आपका पैसा नहीं है। अपने तीन प्रश्न पूरे करने पर आपके उत्तर उसकी जगह ले लेते हैं।" },
      { id: "exit", keys: ["बाहर", "निकास"], text: "0, बाहर, ब्राउज़र बंद नहीं करता। वह बताता है कि रिकॉर्ड इस फ़ोन पर सहेजे गए हैं। मेनू पर वापस क्रमांकित सूची पर ले जाता है। बाहर से पिछला बचत की प्रगति पर जाता है।" },
      { id: "why", keys: ["गरीबी", "समावेश"], text: "उद्देश्य अपने पैसे के साथ अभ्यास है, ताकि कठिन सप्ताह बिना चेतावनी घर खाली न कर दे। आप देखते हैं क्या आया, क्या गया, क्या रखा, और लक्ष्य कितना पास है। व्यक्ति बैंक खाते और इंटरनेट के बिना भी साफ़ किताब रख सकता है। रिकॉर्ड इस फ़ोन पर रहते हैं।" }
    ]
  });

  add("ha", {
    ui: ui({
      hint: "Rubuta ko yi magana. Amsa tana kan wannan wayar, kuma yana iya fada ta.",
      placeholder: "Tambayi Ask Mr Sérieux",
      send: "Aika", close: "Rufe", you: "Kai", mic: "Yi magana", listening: "Tsaya",
      hearOn: "Murya a kunne", hearOff: "Murya a kashe", spoken: "An fada", replay: "Saurara",
      miss: "Ban kama kalmomin ba. Sake fadawa, ko rubuta tambaya. Har yanzu zan iya fada amsa.",
      blocked: "An toshe makirufo. Ka ba shi izini a wannan shafi, ko ka rubuta tambaya.",
      unsupported: "Wannan burauza ba zai iya mayar da magana zuwa kalmomi ba. Rubuta tambaya. Zan iya fada amsa a kan wannan wayar.",
      network: "Sauraron tambaya yana bukatar haɗi a kan wannan wayar. Rubuta ta. Zan iya fada amsa ba tare da intanet ba."
    }),
    suggest: ["Yaya zan ƙara kudaden shiga?", "Yaya manufofi suke aiki?", "Zan iya amfani ba tare da intanet ba?"],
    fallback: "Zan iya maka jagora a cikin wannan manhaja. Tambayi menu, ƙara kudaden shiga ko fita, manufofi, rahotanni, kudi, kulle wayar da ake raba, ko amfani ba tare da intanet ba.",
    lines: [
      { id: "hello", keys: ["sannu", "taimako"], text: "Sannu. Ni ne Ask Mr Sérieux, jagoran Budget Tracker. Tambaye ni yadda ake ƙara kudaden shiga ko fita, saita manufar, karanta rahoto, canza kudi, kulle wayar da ake raba, ko amfani da manhaja ba tare da intanet ba." },
      { id: "about", keys: ["menene wannan", "wannan manhaja"], text: "Budget Tracker littafi ne na kudinka. Kana rubuta kudaden shiga da fita, kana saita manufofin ajiya, kuma kana karanta rahotanni na rana, wata, ko rukuni. Rikodin suna kan wannan wayar. Ba ya haɗuwa da banki, kuma ba ya aika rikodinka zuwa wani wuri." },
      { id: "start", keys: ["farko", "karo na farko", "tambayoyi uku"], text: "A karo na farko, zaɓi harshe, girman rubutu, da sunan kudinka, kamar RWF ko USD. Sannan amsa tambayoyi uku: kudaden shiga, kudaden fita, da manufar. Idan ka gama, amsoshinka suka maye gurbin misali." },
      { id: "menu", keys: ["menu", "gaba", "baya"], text: "Menu jeri ne mai lamba, da tsarin shirin da aka rubuta. Gaba yana tafiya daga 1 zuwa 15, sannan Fita. Baya yana komawa taki ɗaya. Menu yana da Gaba, ba shi da Baya. Fita yana da Baya, ba shi da Gaba. A waya, Menu a ƙasa yana komawa zuwa jeri. Saituna maɓalli ne a sama, ba lamba ba." },
      { id: "add", keys: ["kudaden shiga", "yaya zan ƙara", "ƙara kuɗi"], text: "Buɗe 1, Ƙara ma'amala. Zaɓi Kudaden shiga ko Kudaden fita. Zaɓi dalili daga dogon jeri. Idan babu, zaɓi Ƙara suna, rubuta suna, sannan Ajiye. Sannan rubuta adadi da kwanan wata, ka ajiye." },
      { id: "income", keys: ["kudin shiga", "kudaden fita"], text: "Kudaden shiga su ne kuɗin da ya zo maka: albashi, sayarwa, kyauta, ko kuɗin da aka aiko. Kudaden fita su ne abin da kake kashewa. Maɓallan suna cewa Ƙara kudaden shiga da Ƙara kudaden fita." },
      { id: "edit-tx", keys: ["gyara ma'amala", "share ma'amala"], text: "Don gyara, buɗe 3, Sabunta ma'amala. Danna Gyara, canza wuraren, sannan Ajiye. Don cire ɗaya, buɗe 4, Share ma'amala. Danna Share, sannan tabbatar. Bar shi yana barin rikodi a wurinsa." },
      { id: "search", keys: ["nemo", "tace"], text: "Buɗe 5, Nemo ko tace ma'amaloli. Rubuta kalmomi, zaɓi shiga ko fita, zaɓi rukuni, ka sa kwanan farko da na ƙarshe. Jeri yana canzawa yayin da kake rubutu. Don manufofi, buɗe 14." },
      { id: "report", keys: ["rahoto", "wata", "rana"], text: "6 shi ne taƙaitaccen wata. 7 yana jera kowace rana. 8 yana buɗe ranar da ka zaɓa. 9 yana nuna inda kudaden fita suka tafi. 15 shi ne ci gaban ajiya. Shafi ɗaya yana yin taƙaitaccen bayani, kuma Buga yana bugawa. Menu da wannan jagora ba sa zuwa shafin da aka buga." },
      { id: "check", keys: ["lambar duba", "duba rahoto"], text: "Rahoton da aka sauke yana da lambar duba, wacce aka yi daga adadin da ke a wannan shafi. A cikin menu, Duba rahoto ba lamba ba ce. Rubuta lambar. Manhaja tana nuna adadin da ya dace da ita. Kwatanta su da takarda. Idan wata lamba ta bambanta, an canza wannan rahoto. Lambar da aka ƙirƙira a wajen Budget Tracker ba ta wucewa." },
      { id: "delete-goal", keys: ["share manufa"], text: "Buɗe 13, Share manufar ajiya. Danna Share a kan manufa, sannan tabbatar. Bar shi yana barin manufa. Don gyarawa, buɗe 12, danna Gyara, sannan Ajiye." },
      { id: "goal", keys: ["manufa", "manufofi", "yaya manufofi"], text: "Buɗe 10 don ƙara manufa. Manufa mai sauƙi tana bukatar suna, adadin da kake so, da kwanan wata. Kana iya rubuta abin da ka riga ka ajiye. 11 yana nuna manufofi, 12 yana gyara ɗaya, 13 yana share ɗaya. Na ƙara ajiya yana ƙara kuɗin da ka ajiye tun ƙarshe." },
      { id: "smart", keys: ["smart", "jimloli biyar"], text: "Manufar SMART ita ce manufa ɗaya da jimloli biyar. S shine abin da kake ajiye kuɗin don shi. M shine adadin. A shine abin da za ka iya ajiyawa kowane wata. R shine dalilin da ya sa ya da muhimmanci. T shine kwanan wata. Rahoto yana faɗin ko takin wata yana biye da kwanan wata." },
      { id: "emergency", keys: ["gado", "kwanaki bakwai"], text: "Idan sunan manufa ya ce gaggawa, ci gaba yana nunawa a matsayin kwanakin mako mai wuya, daga 0 zuwa 7, tare da kashi. Wannan shine kwanaki nawa daga cikin 7 kuɗin da aka ajiya zai iya rufewa." },
      { id: "saved", keys: ["na ajiye", "na ƙara ajiya"], text: "Buɗe 11, Duba manufofin ajiya. Danna Na ƙara ajiya, rubuta adadin da ka ajiya yanzu, sannan Ajiye. Adadin da aka ajiya yana tashi, kashi yana bin sa. Maɓallin yana a matakin duba, ba a na sharewa ba." },
      { id: "currency", keys: ["kudi", "farashin musaya"], text: "A Saituna, ƙarƙashin Kudi, nemi kuɗin da waɗannan adadi suke cikinsa, kamar RWF ko USD. Zaɓin farko yana suna ne kawai. Na gaba yana sake rubuta kowane adadi da farashin bankin tsakiya na ranar da ka zaɓa. Manhaja tana nuna farashi, tana jira har ka danna Canza adadi. Ba tare da intanet ba, tana amfani da farashin da aka ajiye a kan wannan wayar, tana faɗin ranar." },
      { id: "abroad", keys: ["ƙasashen waje", "aika kuɗi"], text: "Kuɗin ƙasashen waje na kyauta ne ko biyan da ya zo da wani kudi. A Saituna, rubuta wannan kudi. Waɗannan adadi ba sa shiga kudaden shiga, fita, da abin da ka rage. Canza babban kudi ba ya sake rubuta su." },
      { id: "offline", keys: ["ba tare da intanet", "zan iya amfani ba tare"], text: "I. Bayan an buɗe wannan manhaja sau ɗaya a kan wayar, kudaden shiga, fita, manufofi, rahotanni, menu, da wannan jagora suna aiki ba tare da intanet ba. Rikodi suna kan wannan wayar. Sabon haɗin kudi, kamar RWF zuwa USD a karo na farko, yana bukatar haɗi sau ɗaya don a ajiye farashin rana. Bayan haka, canjin yana aiki ba tare da intanet ba." },
      { id: "lock", keys: ["kulle", "lambar sirri", "wayar da ake raba"], text: "Aboki na iya sanin kalmar sirrin wayar, amma bai kamata ya karanta wannan littafi ba. A Saituna, ƙarƙashin A kan wayar da ake raba, saita kulle na wannan manhaja kawai. Yana tambaya a lokacin buɗewa. Kulle yana kan wannan wayar. Ba ya cikin fayil ɗin da aka fitar, kuma ba a aika shi ba. Wannan manhaja ba ta duba fuska." },
      { id: "hide", keys: ["ɓoye adadi"], text: "Ɓoye adadi maɓalli ne a sama. Yana rufe lambobi yayin da wani yake kallon wayar. Sake danna, Nuna adadi, lambobi sun dawo. Rikodi suna nan. Lambobi kawai aka rufe." },
      { id: "language", keys: ["harshe", "hausa", "kinyarwanda"], text: "Nemi harshe. Rubuta ƙasa ko harshe, kamar Rwanda ko Kinyarwanda. Ƙasa tana fitowa da farko, sannan harshe. Menu, kowane shafi, da wannan jagora suna bin wannan harshe, kuma jagoran yana magana da shi yadda 'yan harshe ke magana. Sannan nemi kudi. Kana iya sake canza su biyun a Saituna. Larabci yana tafiya daga dama zuwa hagu. Rana tana zaune a saman dama." },
      { id: "export", keys: ["fitar", "shigo", "share duka"], text: "A Saituna, Fitar da rikodi yana ajiye fayil kafin ka canza waya. Shigo da rikodi yana karanta wannan fayil. Share duk rikodi yana share littafi bayan ka tabbatar. Kullen manhaja ba ya cikin fayil ɗin da aka fitar." },
      { id: "example", keys: ["misali"], text: "Misali yana kan shafin farko, kuma a Saituna ana iya dawo da shi. Misali rayuwa ce ta samfuri, tare da kudaden shiga, fita, da manufofi, har da tafiya. Ba kudinka ba ne. Idan ka gama tambayoyinka uku, amsoshinka suka maye gurbinsa." },
      { id: "exit", keys: ["fita"], text: "0, Fita, ba ya rufe burauza. Yana faɗin cewa an ajiye rikodi a kan wannan wayar. Komawa menu yana dawo da jerin lambobi. Baya, daga Fita, yana zuwa rahoton ci gaban ajiya." },
      { id: "why", keys: ["talauci", "hadewa"], text: "Manufa ita ce a yi atisaye da kudinka, don mako mai wuya kada ya zubar da gida ba tare da gargaɗi ba. Kana ganin abin da ya shigo, abin da ya fita, abin da ka rage, da kuma yadda manufa ta kusanci. Mutum na iya riƙe littafi a sarari ba tare da asusun banki ba kuma ba tare da intanet ba. Rikodi suna kan wannan wayar." }
    ]
  });

  add("am", {
    ui: ui({
      hint: "ጻፍ ወይም ተናገር። መልሱ በዚህ ስልክ ላይ ይቆያል፣ እሱም ሊናገረው ይችላል።",
      placeholder: "Ask Mr Sérieuxን ጠይቅ",
      send: "ላክ", close: "ዝጋ", you: "አንተ", mic: "ተናገር", listening: "ቁም",
      hearOn: "ድምጽ በርቷል", hearOff: "ድምጽ ጠፍቷል", spoken: "ተነግሯል", replay: "ስማ",
      miss: "ቃላቱን አልያዝኩም። እንደገና ተናገር፣ ወይም ጥያቄውን ጻፍ። መልሱን አሁንም ማለት እችላለሁ።",
      blocked: "ማይክሮፎኑ ታግዷል። ለዚህ ገጽ ፍቀድለት፣ ወይም ጥያቄውን ጻፍ።",
      unsupported: "ይህ አሳሽ ንግግርን ወደ ቃላት መቀየር አይችልም። ጥያቄውን ጻፍ። መልሱን በዚህ ስልክ ማለት እችላለሁ።",
      network: "ጥያቄውን መስማት በዚህ ስልክ ግንኙነት ይፈልጋል። ጻፈው። መልሱን ያለ በይነመረብ ማለት እችላለሁ።"
    }),
    suggest: ["ገቢ እንዴት እጨምራለሁ?", "ግቦች እንዴት ይሰራሉ?", "ያለ በይነመረብ እጠቀማለሁ?"],
    fallback: "በዚህ መተግበሪያ ውስጥ ልመራህ እችላለሁ። ስለ ዝርዝር፣ ገቢ ወይም ወጪ፣ ግቦች፣ ሪፖርቶች፣ ገንዘብ፣ የጋራ ስልክ መቆለፊያ፣ ወይም ያለ በይነመረብ መጠቀም ጠይቅ።",
    lines: [
      { id: "hello", keys: ["ሰላም", "እርዳታ"], text: "ሰላም። እኔ Ask Mr Sérieux ነኝ፣ የ Budget Tracker መምሪያ። ገቢ ወይም ወጪ እንዴት እንደሚጨመር፣ ግብ እንዴት እንደሚቀመጥ፣ ሪፖርት እንዴት እንደሚነበብ፣ ገንዘብ እንዴት እንደሚቀየር፣ የጋራ ስልክ እንዴት እንደሚቆለፍ፣ ወይም ያለ በይነመረብ እንዴት እንደሚጠቀሙ ጠይቁኝ።" },
      { id: "about", keys: ["ይህ ምንድን ነው", "ይህ መተግበሪያ"], text: "Budget Tracker የራስህ ገንዘብ ደብተር ነው። ገቢና ወጪ ትጽፋለህ፣ የቁጠባ ግቦች ታስቀምጣለህ፣ የቀን፣ የወር ወይም የምድብ ሪፖርት ታነባለህ። መዝገቦቹ በዚህ ስልክ ላይ ይቆያሉ። ከባንክ ጋር አይገናኝም፣ መዝገቦችህንም ወዳትም አይልክም።" },
      { id: "start", keys: ["መጀመሪያ", "የመጀመሪያ ጊዜ", "ሦስት ጥያቄዎች"], text: "የመጀመሪያ ጊዜ ቋንቋ፣ የጽሑፍ መጠን እና የገንዘብህን ስም ምረጥ፣ ለምሳሌ RWF ወይም USD። ከዚያ ሦስት አጭር ጥያቄዎችን መልስ፦ የገባ ገቢ፣ የወጣ ወጪ እና ግብ። ስትጨርስ መልሶችህ ምሳሌውን ይተካሉ።" },
      { id: "menu", keys: ["ዝርዝር", "ቀጣይ", "ቀዳሚ"], text: "ዝርዝሩ በቁጥር ነው፣ እንደ ተጻፈው ፕሮግራም ቅደም ተከተል። ቀጣይ ከ 1 እስከ 15 ይሄዳል፣ ከዚያ መውጫ። ቀዳሚ አንድ እርምጃ ይመልሳል። ዝርዝሩ ቀጣይ አለው፣ ቀዳሚ የለውም። መውጫ ቀዳሚ አለው፣ ቀጣይ የለውም። በስልክ ላይ ከታች ያለው ዝርዝር ወደ ዝርዝሩ ይመልሳል። ቅንብር ከላይ ያለ አዝራር ነው፣ ቁጥር አይደለም።" },
      { id: "add", keys: ["ገቢ እንዴት", "ገቢ ጨምር", "ወጪ ጨምር"], text: "1 ክፈት፣ ግብይት ጨምር። ገቢ ወይም ወጪ ምረጥ። ከረጅሙ ዝርዝር ምን እንደነበር ምረጥ። ከሌለ አዲስ ስም ጨምር፣ ስሙን ጻፍ እና አስቀምጥ። ከዚያ መጠኑንና ቀኑን ጻፍ፣ አስቀምጥ።" },
      { id: "income", keys: ["ገቢ", "ወጪ"], text: "ገቢ ወደ አንተ የሚመጣ ገንዘብ ነው፦ ደመወዝ፣ ሽያጭ፣ ስጦታ ወይም የተላከ ገንዘብ። ወጪ የምታወጣው ነው። አዝራሮቹ ገቢ ጨምር እና ወጪ ጨምር ይላሉ።" },
      { id: "edit-tx", keys: ["ግብይት ቀይር", "ግብይት ሰርዝ"], text: "ለመቀየር 3 ክፈት፣ ግብይት አዘምን። አርትዕ ተጫን፣ መስኮቹን ቀይር እና አስቀምጥ። አንዱን ለማስወገድ 4 ክፈት። ሰርዝ ተጫን፣ ከዚያ አረጋግጥ። ይቆይ መዝገቡን በቦታው ይተወዋል።" },
      { id: "search", keys: ["ፈልግ", "አጣራ"], text: "5 ክፈት፣ ግብይቶችን ፈልግ ወይም አጣራ። ቃላት ጻፍ፣ ገቢ ወይም ወጪ ምረጥ፣ ምድብ ምረጥ፣ የመጀመሪያና የመጨረሻ ቀን አስቀምጥ። እየጻፍክ ዝርዝሩ ይቀየራል። ለግቦች 14 ክፈት።" },
      { id: "report", keys: ["ሪፖርት", "ወር", "ቀን"], text: "6 የወሩ ማጠቃለያ ነው። 7 እያንዳንዱን ቀን ይዘረዝራል። 8 የመረጥከውን ቀን ይከፍታል። 9 ወጪው ወዴት እንደሄደ ያሳያል። 15 የቁጠባ ሂደት ነው። አንድ ገጽ አጭር ማጠቃለያ ይሠራል፣ አትምም ያትመዋል። ዝርዝሩና ይህ መምሪያ በታተመው ገጽ ላይ አይሆኑም።" },
      { id: "check", keys: ["የማረጋገጫ ኮድ", "ሪፖርት ይፈትሹ"], text: "የወረደ ሪፖርት የማረጋገጫ ኮድ አለው፣ ከዚያ ገጽ መጠኖች የተሠራ። በዝርዝሩ ውስጥ ሪፖርት ይፈትሹ ቁጥር አይደለም። ኮዱን ይጻፉ። መተግበሪያው የእሱ የሆኑ መጠኖችን ያሳያል። ከወረቀቱ ጋር ያወዳድሩ። አንድ ቁጥር ካልተመሳሰለ፣ ያ ሪፖርት ተቀይሯል። ከ Budget Tracker ውጭ የተሠራ ኮድ አያልፍም።" },
      { id: "delete-goal", keys: ["ግብ ሰርዝ"], text: "13 ክፈት፣ የቁጠባ ግብ ሰርዝ። በግቡ ላይ ሰርዝ ተጫን፣ ከዚያ አረጋግጥ። ይቆይ ግቡን ይተወዋል። ለመቀየር 12 ክፈት፣ አርትዕ ተጫን እና አስቀምጥ።" },
      { id: "goal", keys: ["ግብ", "ግቦች", "ግቦች እንዴት"], text: "ግብ ለመጨመር 10 ክፈት። ቀላል ግብ ስም፣ መጠን እና ቀን ይፈልጋል። አስቀድመህ ያስቀመጥከውንም መጻፍ ትችላለህ። 11 ግቦችን ያሳያል፣ 12 አንዱን ያዘምናል፣ 13 አንዱን ይሰርዛል። ተጨማሪ አስቀምጫለሁ ካለፈው ጊዜ ወዲህ ያስቀመጥከውን ገንዘብ ይጨምራል።" },
      { id: "smart", keys: ["smart", "አምስት ዓረፍተ ነገሮች"], text: "SMART ግብ ያው ግብ ሲሆን አምስት አጭር ዓረፍተ ነገሮች ይጨመሩበታል። S ገንዘቡ ለምን እንደሆነ ነው። M ሊደርስበት የምትፈልገው መጠን ነው። A በየወሩ ምን ያህል ማስቀመጥ እንደምትችል ነው። R ለምን እንደሚጠቅም ነው። T ቀኑ ነው። ሪፖርቱ ወርሃዊ እርምጃው ከቀኑ ጋር እየሄደ መሆኑን ይነግራል።" },
      { id: "emergency", keys: ["አደጋ", "ሰባት ቀናት"], text: "የግቡ ስም አደጋ ካለ፣ ሂደቱ እንደ ከባድ ሳምንት ቀናት ይታያል፣ ከ 0 እስከ 7፣ ከመቶኛ ጋር። ይህ አስቀድሞ የተቀመጠው ገንዘብ ከእነዚህ 7 ቀናት ስንቱን እንደሚሸፍን ነው።" },
      { id: "saved", keys: ["አስቀምጫለሁ", "ተጨማሪ አስቀመጥኩ"], text: "11 ክፈት፣ የቁጠባ ግቦችን ተመልከት። ተጨማሪ አስቀምጫለሁ ተጫን፣ አሁን ያስቀመጥከውን መጠን ጻፍ እና አስቀምጥ። የተቀመጠው መጠን ይጨምራል፣ መቶኛውም ይከተላል። ይህ አዝራር በመመልከቻ ደረጃ ነው፣ በመሰረዝ አይደለም።" },
      { id: "currency", keys: ["ገንዘብ", "የምንዛሬ ተመን"], text: "በቅንብር ውስጥ በገንዘብ ሥር እነዚህ መጠኖች ያሉበትን ገንዘብ ፈልግ፣ ለምሳሌ RWF ወይም USD። የመጀመሪያው ምርጫ ቁጥሮቹን ስም ብቻ ይሰጣል። ቀጣዩ እያንዳንዱን መጠን በመረጥከው ቀን የማዕከላዊ ባንክ ተመን ይጽፋል። መተግበሪያው ተመኑን ያሳያል፣ መጠኖቹን ቀይር እስክትጫን ይጠብቃል። ያለ በይነመረብ በስልኩ ላይ የተቀመጠ ተመን ይጠቀማል፣ ቀኑንም ይናገራል።" },
      { id: "abroad", keys: ["ከውጭ", "ገንዘብ ላክ"], text: "ከውጭ የመጣ ገንዘብ በሌላ ገንዘብ ለሚደርስ ስጦታ ወይም ክፍያ ብቻ ነው። በቅንብር ውስጥ ያንን ገንዘብ ጻፍ። እነዚህ መጠኖች ከገቢ፣ ከወጪ እና ካስቀመጥከው ውጭ ይቆያሉ። ዋናውን ገንዘብ መቀየር አያስተካክላቸውም።" },
      { id: "offline", keys: ["ያለ በይነመረብ", "ያለ በይነመረብ እጠቀማለሁ"], text: "አዎ። ይህ መተግበሪያ በስልኩ ላይ አንድ ጊዜ ከተከፈተ በኋላ ገቢ፣ ወጪ፣ ግቦች፣ ሪፖርቶች፣ ዝርዝሩ እና ይህ መምሪያ ያለ በይነመረብ ይሰራሉ። መዝገቦቹ በዚህ ስልክ ላይ ይቆያሉ። አዲስ የገንዘብ ጥንድ፣ ለምሳሌ RWF ወደ USD ለመጀመሪያ ጊዜ፣ የዚያን ቀን ተመን ለማስቀመጥ አንድ ጊዜ ግንኙነት ይፈልጋል። ከዚያ በኋላ ያ ለውጥ ያለ በይነመረብም ይሰራል።" },
      { id: "lock", keys: ["መቆለፊያ", "ሚስጥራዊ ቁጥር", "የጋራ ስልክ"], text: "ጓደኛ የስልኩን የይለፍ ቃል ሊያውቅ ይችላል፣ ይህን ደብተር ግን ማንበብ የለበትም። በቅንብር ውስጥ በጋራ ስልክ ሥር ለዚህ መተግበሪያ ብቻ የሆነ መቆለፊያ አስቀምጥ። ሲከፈት ይጠይቃል። መቆለፊያው በዚህ ስልክ ላይ ይቆያል። በወጣ ፋይል ውስጥ አይደለም፣ ወዳትምም አይላክም። ይህ መተግበሪያ ፊት አይቃኝም።" },
      { id: "hide", keys: ["መጠኖችን ደብቅ"], text: "መጠኖችን ደብቅ ከላይ ያለው አዝራር ነው። ሰው ስልኩን ሲመለከት ቁጥሮቹን ይሸፍናል። እንደገና ተጫን፣ መጠኖችን አሳይ፣ ቁጥሮቹ ይመለሳሉ። መዝገቦቹ አሉ። የተሸፈኑት ቁጥሮቹ ብቻ ናቸው።" },
      { id: "language", keys: ["ቋንቋ", "አማርኛ", "ኪንያርዋንዳ"], text: "ቋንቋ ፈልግ። ሀገር ወይም ቋንቋ ጻፍ፣ ለምሳሌ ሩዋንዳ ወይም Kinyarwanda። ሀገሩ መጀመሪያ ይታያል፣ ከዚያ ቋንቋው። ዝርዝሩ፣ እያንዳንዱ ገጽ እና ይህ መምሪያ ያንን ቋንቋ ይከተላሉ፣ መምሪያውም ቋንቋው እንደሚነገር ይናገረዋል። ከዚያ ገንዘብ ፈልግ። ሁለቱንም በቅንብር ውስጥ መቀየር ትችላለህ። ዐረብኛ ከቀኝ ወደ ግራ ይሄዳል። ፀሐይ ከላይ በቀኝ ትቆያለች።" },
      { id: "export", keys: ["ላክ", "አስገባ", "ሰርዝ"], text: "በቅንብር ውስጥ መዝገቦችን መላክ ስልክ ከመቀየርህ በፊት ፋይል ያስቀምጣል። ማስገባት ያውን ፋይል ያነባል። ሁሉንም መዝገቦች መሰረዝ ካረጋገጥክ በኋላ ደብተሩን ያጸዳል። የመተግበሪያው መቆለፊያ በወጣው ፋይል ውስጥ አይደለም።" },
      { id: "example", keys: ["ምሳሌ"], text: "ምሳሌው በመጀመሪያው ገጽ ላይ ነው፣ በቅንብርም መመለስ ይቻላል። ምሳሌው የናሙና ሕይወት ነው፣ ገቢ፣ ወጪ እና ግቦች አሉት፣ ጉዞንም ጨምሮ። የአንተ ገንዘብ አይደለም። የራስህን ሦስት ጥያቄዎች ስትጨርስ መልሶችህ ይተኩታል።" },
      { id: "exit", keys: ["ውጣ"], text: "0፣ ውጣ፣ አሳሹን አይዘጋም። መዝገቦቹ በዚህ ስልክ ላይ እንደተቀመጡ ይነግራል። ወደ ዝርዝር መመለስ ወደ ቁጥር ዝርዝሩ ይመልሳል። ከውጣ ቀዳሚ ወደ የቁጠባ ሂደት ይሄዳል።" },
      { id: "why", keys: ["ድህነት", "ማካተት"], text: "ዓላማው በራስህ ገንዘብ መለማመድ ነው፣ ከባድ ሳምንት ቤቱን ያለ ማስጠንቀቂያ እንዳያዳክም። ምን እንደገባ፣ ምን እንደወጣ፣ ምን እንዳስቀመጥክ እና ግቡ ምን ያህል እንደቀረ ታያለህ። ሰው ያለ ባንክ ሂሳብ እና ያለ በይነመረብ ግልጽ ደብተር መያዝ ይችላል። መዝገቦቹ በዚህ ስልክ ላይ ይቆያሉ።" }
    ]
  });
})();
