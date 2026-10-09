/*
 * Ask Mr Sérieux is the in-app guide for Budget Tracker.
 * Answers are written here. Money records are not sent off the phone.
 * A spoken question uses the phone's own listening. The reply is spoken on this phone.
 */
(function () {
  var BT = (window.BT = window.BT || {});

  var UI = {
    en: { title: "Ask Mr Sérieux", hint: "Type or speak. The answer stays on this phone, and he can say it aloud.", placeholder: "Ask Mr Sérieux", send: "Send", close: "Close", you: "You", mic: "Speak", listening: "Stop", hearOn: "Voice on", hearOff: "Voice off", spoken: "Spoken", replay: "Hear", miss: "I did not catch the words. Say it again, or type the question. I can still speak the answer.", blocked: "The microphone is blocked. Allow it for this page, or type the question.", unsupported: "This browser cannot turn speech into words. Type the question. I can still speak the answer on this phone.", network: "Hearing the question needs a connection on this phone. Type it instead. I can still speak the answer with no internet." },
    rw: { title: "Ask Mr Sérieux", hint: "Andika cyangwa uvuge. Igisubizo kiguma kuri iyi telefoni, kandi ashobora kukivuga.", placeholder: "Baza Ask Mr Sérieux", send: "Ohereza", close: "Funga", you: "Wowe", mic: "Vuga", listening: "Hagarara", hearOn: "Ijwi ririho", hearOff: "Ijwi rihagaritswe", spoken: "Byavuzwe", replay: "Umva", miss: "Sinumvise amagambo. Vuga ukundi, cyangwa wandike ikibazo. Nshobora kuvuga igisubizo.", blocked: "Mikoro irabujijwe. Iyemeze kuri iyi paji, cyangwa wandike ikibazo.", unsupported: "Iyi mushakisha ntishobora guhindura ijwi mu magambo. Wandike ikibazo. Nshobora kuvuga igisubizo kuri iyi telefoni.", network: "Kumva ikibazo bisaba interineti kuri iyi telefoni. Wandike ikibazo. Nshobora kuvuga igisubizo nta interineti." },
    fr: { title: "Ask Mr Sérieux", hint: "Écrivez ou parlez. La réponse reste sur ce téléphone, et il peut la dire.", placeholder: "Demandez à Ask Mr Sérieux", send: "Envoyer", close: "Fermer", you: "Vous", mic: "Parler", listening: "Stop", hearOn: "Voix", hearOff: "Silence", spoken: "Dit", replay: "Écouter", miss: "Je n'ai pas saisi les mots. Dites-le encore, ou écrivez la question. Je peux quand même dire la réponse.", blocked: "Le microphone est bloqué. Autorisez-le pour cette page, ou écrivez la question.", unsupported: "Ce navigateur ne peut pas changer la parole en mots. Écrivez la question. Je peux quand même dire la réponse sur ce téléphone.", network: "Entendre la question demande une connexion sur ce téléphone. Écrivez-la. Je peux quand même dire la réponse sans internet." },
    sw: { title: "Ask Mr Sérieux", hint: "Andika au sema. Jibu linabaki kwenye simu hii, na anaweza kulisema.", placeholder: "Uliza Ask Mr Sérieux", send: "Tuma", close: "Funga", you: "Wewe", mic: "Sema", listening: "Simama", hearOn: "Sauti", hearOff: "Kimya", spoken: "Imenenwa", replay: "Sikia", miss: "Sikusikia maneno. Sema tena, au andika swali. Bado naweza kusema jibu.", blocked: "Maikrofoni imezuiwa. Iruhusu kwenye ukurasa huu, au andika swali.", unsupported: "Kivinjari hiki hakiwezi kugeuza sauti kuwa maneno. Andika swali. Bado naweza kusema jibu kwenye simu hii.", network: "Kusikia swali kunahitaji mtandao kwenye simu hii. Andika swali. Bado naweza kusema jibu bila intaneti." },
    es: { title: "Ask Mr Sérieux", hint: "Escriba o hable. La respuesta se queda en este teléfono, y él puede decirla.", placeholder: "Pregunte a Ask Mr Sérieux", send: "Enviar", close: "Cerrar", you: "Usted", mic: "Hablar", listening: "Parar", hearOn: "Voz", hearOff: "Silencio", spoken: "Hablado", replay: "Oír", miss: "No entendí las palabras. Dígalo otra vez, o escriba la pregunta. Igual puedo decir la respuesta.", blocked: "El micrófono está bloqueado. Permítalo en esta página, o escriba la pregunta.", unsupported: "Este navegador no puede convertir la voz en palabras. Escriba la pregunta. Igual puedo decir la respuesta en este teléfono.", network: "Oír la pregunta necesita conexión en este teléfono. Escríbala. Igual puedo decir la respuesta sin internet." },
    pt: { title: "Ask Mr Sérieux", hint: "Escreva ou fale. A resposta fica neste telemóvel, e ele pode dizê-la.", placeholder: "Pergunte ao Ask Mr Sérieux", send: "Enviar", close: "Fechar", you: "Você", mic: "Falar", listening: "Parar", hearOn: "Voz", hearOff: "Silêncio", spoken: "Falado", replay: "Ouvir", miss: "Não apanhei as palavras. Diga outra vez, ou escreva a pergunta. Posso na mesma dizer a resposta.", blocked: "O microfone está bloqueado. Permita-o nesta página, ou escreva a pergunta.", unsupported: "Este navegador não consegue transformar a fala em palavras. Escreva a pergunta. Posso na mesma dizer a resposta neste telemóvel.", network: "Ouvir a pergunta precisa de ligação neste telemóvel. Escreva-a. Posso na mesma dizer a resposta sem internet." },
    ar: { title: "Ask Mr Sérieux", hint: "اكتب أو تكلم. الجواب يبقى على هذا الهاتف، ويستطيع أن يقوله.", placeholder: "اسأل Ask Mr Sérieux", send: "إرسال", close: "إغلاق", you: "أنت", mic: "تكلم", listening: "قف", hearOn: "الصوت", hearOff: "صامت", spoken: "صوت", replay: "استمع", miss: "لم ألتقط الكلمات. قلها مرة أخرى، أو اكتب السؤال. أستطيع أن أقول الجواب.", blocked: "الميكروفون محظور. اسمح به لهذه الصفحة، أو اكتب السؤال.", unsupported: "هذا المتصفح لا يحوّل الكلام إلى كلمات. اكتب السؤال. أستطيع أن أقول الجواب على هذا الهاتف.", network: "سماع السؤال يحتاج إلى اتصال على هذا الهاتف. اكتبه. أستطيع أن أقول الجواب دون إنترنت." }
  };

  var SUGGEST = {
    en: ["How do I add income?", "How do goals work?", "Can I use this with no internet?"],
    rw: ["Nongeraho amafaranga yinjira nte?", "Intego ikora ite?", "Nakoresha iyi porogaramu nta interineti?"],
    fr: ["Comment ajouter un revenu ?", "Comment fonctionnent les objectifs ?", "Puis-je l'utiliser sans internet ?"],
    sw: ["Ninaongezaje kipato?", "Malengo yanafanya kazi vipi?", "Naweza kutumia bila intaneti?"],
    es: ["¿Cómo agrego un ingreso?", "¿Cómo funcionan las metas?", "¿Puedo usarla sin internet?"],
    pt: ["Como adiciono um rendimento?", "Como funcionam as metas?", "Posso usar sem internet?"],
    ar: ["كيف أضيف دخلاً؟", "كيف تعمل الأهداف؟", "هل أستخدمه دون إنترنت؟"]
  };

  function intent(id, keys, text) {
    return { id: id, keys: keys, text: text };
  }

  var INTENTS = [
    intent("hello", ["hello", "hi", "hey", "help", "siri", "copilot", "guide", "serieux", "mr serieux", "who are you", "your name", "muraho", "bite", "bonjour", "salut", "aide", "habari", "saidia", "hola", "ayuda", "ola", "olá", "ajuda", "مرحبا", "مساعدة", "mfasha"], {
      en: "Hello. I am Ask Mr Sérieux, the guide for Budget Tracker. Ask me how to add income or expenses, set a goal, read a report, change the currency, lock a shared phone, or use the app with no internet.",
      rw: "Muraho. Ndi Ask Mr Sérieux, umuyobozi wa Budget Tracker. Mbaza uko wongeraho amafaranga yinjira cyangwa ayasohoka, ukagena intego, usoma raporo, uhindura ifaranga, ufunga telefoni musangiye, cyangwa ukoresha porogaramu nta interineti.",
      fr: "Bonjour. Je suis Ask Mr Sérieux, le guide de Budget Tracker. Demandez-moi comment ajouter un revenu ou une dépense, fixer un objectif, lire un rapport, changer la monnaie, verrouiller un téléphone partagé, ou utiliser l'application sans internet.",
      sw: "Habari. Mimi ni Ask Mr Sérieux, mwongozo wa Budget Tracker. Niulize jinsi ya kuongeza kipato au matumizi, kuweka lengo, kusoma ripoti, kubadilisha sarafu, kufunga simu inayoshirikiwa, au kutumia programu bila intaneti.",
      es: "Hola. Soy Ask Mr Sérieux, la guía de Budget Tracker. Pregúnteme cómo agregar un ingreso o un gasto, fijar una meta, leer un informe, cambiar la moneda, bloquear un teléfono compartido, o usar la aplicación sin internet.",
      pt: "Olá. Sou Ask Mr Sérieux, o guia do Budget Tracker. Pergunte-me como adicionar um rendimento ou uma despesa, definir uma meta, ler um relatório, mudar a moeda, trancar um telemóvel partilhado, ou usar a aplicação sem internet.",
      ar: "مرحباً. أنا Ask Mr Sérieux، دليل Budget Tracker. اسألني كيف تضيف دخلاً أو مصروفاً، أو تضع هدفاً، أو تقرأ تقريراً، أو تغيّر العملة، أو تقفل هاتفاً مشتركاً، أو تستخدم التطبيق دون إنترنت."
    }),
    intent("about", ["what is this", "what is budget", "this app", "about this", "iki ni iki", "ni nini", "c'est quoi", "quest-ce", "qu'est", "que es", "o que e", "o que é", "iyi porogaramu ni iki", "ما هذا", "ما هو"], {
      en: "Budget Tracker is a book for your own money. You write income and expenses, set savings goals, and read reports for a day, a month, or a category. The records stay on this phone. It does not connect to a bank, and it does not send your records anywhere.",
      rw: "Budget Tracker ni igitabo cy'amafaranga yawe. Wandika ayinjira n'ayasohoka, ugena intego zo kuzigama, kandi usoma raporo z'umunsi, ukwezi, cyangwa icyiciro. Inyandiko ziguma kuri iyi telefoni. Ntihujwe na banki, kandi ntiyohereza inyandiko zawe ahandi.",
      fr: "Budget Tracker est un cahier pour votre argent. Vous notez les revenus et les dépenses, vous fixez des objectifs d'épargne, et vous lisez des rapports pour un jour, un mois, ou une catégorie. Les notes restent sur ce téléphone. Elles ne vont pas à une banque, et elles ne sont envoyées nulle part.",
      sw: "Budget Tracker ni daftari la pesa yako. Unaandika kipato na matumizi, unaweka malengo ya akiba, na unasoma ripoti za siku, mwezi, au kundi. Kumbukumbu zinabaki kwenye simu hii. Haiunganishi na benki, wala haitumi kumbukumbu zako popote.",
      es: "Budget Tracker es un cuaderno para su dinero. Anota ingresos y gastos, fija metas de ahorro, y lee informes de un día, un mes, o una categoría. Los registros se quedan en este teléfono. No se conecta a un banco y no envía sus registros a ningún lugar.",
      pt: "Budget Tracker é um caderno para o seu dinheiro. Regista rendimentos e despesas, define metas de poupança, e lê relatórios de um dia, um mês, ou uma categoria. Os registos ficam neste telemóvel. Não liga a um banco e não envia os seus registos para lado nenhum.",
      ar: "Budget Tracker دفتر لأموالك. تكتب الدخل والمصروفات، وتضع أهداف الادخار، وتقرأ تقارير يوم أو شهر أو فئة. السجلات تبقى على هذا الهاتف. لا يتصل ببنك، ولا يرسل سجلاتك إلى أي مكان."
    }),
    intent("start", ["start", "first time", "begin", "setup", "three questions", "tangira", "gutangira", "commencer", "première", "anza", "kuanza", "empezar", "primera", "começar", "primeira", "البداية", "أول مرة"], {
      en: "The first time, choose a language, a text size, and the name of your money, such as RWF or USD. Then answer three short questions: income you received, expenses you paid, and a goal. Press Look at the example if you want to see a sample life first. When you finish your own start, your answers replace that example.",
      rw: "Ubu bundi, hitamo ururimi, ingano y'inyandiko, n'izina ry'amafaranga yawe, nk'RWF cyangwa USD. Hanyuma subiza ibibazo bitatu bigufi: amafaranga wakiriye, ayo wakoresheje, n'intego. Kanda Reba urugero niba ushaka kubona ubuzima bw'urugero mbere. Nuhaza gutangira kwawe, ibisubizo byawe bisimbura urwo rugero.",
      fr: "La première fois, choisissez une langue, une taille de texte, et le nom de votre argent, comme RWF ou USD. Puis répondez à trois questions courtes : un revenu reçu, une dépense payée, et un objectif. Appuyez sur Voir l'exemple si vous voulez d'abord une vie d'exemple. Quand vous terminez votre propre départ, vos réponses remplacent cet exemple.",
      sw: "Mara ya kwanza, chagua lugha, ukubwa wa maandishi, na jina la pesa yako, kama RWF au USD. Kisha jibu maswali matatu mafupi: kipato ulichopokea, matumizi uliyolipa, na lengo. Bonyeza Angalia mfano ikiwa unataka kuona maisha ya mfano kwanza. Ukimaliza kuanza kwako, majibu yako yanachukua nafasi ya mfano huo.",
      es: "La primera vez, elija un idioma, un tamaño de texto, y el nombre de su dinero, como RWF o USD. Luego responda tres preguntas cortas: un ingreso recibido, un gasto pagado, y una meta. Pulse Ver el ejemplo si quiere ver una vida de ejemplo primero. Cuando termine su propio inicio, sus respuestas reemplazan ese ejemplo.",
      pt: "Na primeira vez, escolha uma língua, um tamanho de texto, e o nome do seu dinheiro, como RWF ou USD. Depois responda a três perguntas curtas: um rendimento recebido, uma despesa paga, e uma meta. Prima Ver o exemplo se quiser ver uma vida de exemplo primeiro. Quando terminar o seu próprio início, as suas respostas substituem esse exemplo.",
      ar: "في المرة الأولى، اختر لغة وحجم خط واسم نقودك، مثل RWF أو USD. ثم أجب عن ثلاثة أسئلة قصيرة: دخل استلمته، ومصروف دفعته، وهدف. اضغط انظر إلى المثال إذا أردت أن ترى حياة مثال أولاً. عندما تنهي بدايتك، إجاباتك تحل مكان ذلك المثال."
    }),
    intent("menu", ["menu", "next", "previous", "next page", "urutonde", "ibikurikira", "ibanje", "suivant", "précédent", "menu", "orodha", "ijayo", "nyuma", "menú", "siguiente", "anterior", "próxima", "anterior", "القائمة", "التالي", "السابق"], {
      en: "The menu is a numbered list, in the same order as the written program. Press Next to walk from 1 to 15, then Exit. Previous goes back one step. The menu itself has Next, and no Previous. Exit has Previous, and no Next. On a phone, Menu at the bottom returns to the list. Settings is the button at the top. It is not a number on the list.",
      rw: "Urutonde ni imibare, mu buryo bwo muri porogaramu yanditse. Kanda Ibikurikira uva kuri 1 ukageza kuri 15, hanyuma Gusohoka. Ibanje igaruka intambwe imwe. Urutonde ubwarwo rufite Ibikurikira, nta Ibanje. Gusohoka gufite Ibanje, nta Ibikurikira. Kuri telefoni, Urutonde hepfo kugaruza ku rutonde. Igenamiterere ni buto yo hejuru. Si umubare ku rutonde.",
      fr: "Le menu est une liste numérotée, dans le même ordre que le programme écrit. Appuyez sur Suivant pour aller de 1 à 15, puis Quitter. Précédent revient d'un pas. Le menu a Suivant, et pas Précédent. Quitter a Précédent, et pas Suivant. Sur un téléphone, Menu en bas ramène à la liste. Réglages est le bouton en haut. Ce n'est pas un numéro de la liste.",
      sw: "Menyu ni orodha yenye nambari, kwa mpangilio ule ule wa programu iliyoandikwa. Bonyeza Ifuatayo utoke 1 hadi 15, kisha Toka. Iliyotangulia inarudi hatua moja. Menyu yenyewe ina Ifuatayo, bila Iliyotangulia. Toka ina Iliyotangulia, bila Ifuatayo. Kwenye simu, Menyu chini inarudisha kwenye orodha. Mipangilio ni kitufe juu. Si nambari kwenye orodha.",
      es: "El menú es una lista numerada, en el mismo orden que el programa escrito. Pulse Siguiente para ir del 1 al 15, y luego Salir. Anterior retrocede un paso. El menú tiene Siguiente, y no Anterior. Salir tiene Anterior, y no Siguiente. En un teléfono, Menú abajo vuelve a la lista. Ajustes es el botón de arriba. No es un número de la lista.",
      pt: "O menu é uma lista numerada, na mesma ordem do programa escrito. Prima Seguinte para ir do 1 ao 15, e depois Sair. Anterior volta um passo. O menu tem Seguinte, e não tem Anterior. Sair tem Anterior, e não tem Seguinte. Num telemóvel, Menu em baixo volta à lista. Definições é o botão de cima. Não é um número da lista.",
      ar: "القائمة مرقّمة، بالترتيب نفسه للبرنامج المكتوب. اضغط التالي لتمشي من 1 إلى 15، ثم خروج. السابق يرجع خطوة. القائمة نفسها فيها التالي، وليس السابق. الخروج فيه السابق، وليس التالي. على الهاتف، القائمة في الأسفل ترجع إلى اللائحة. الإعدادات زر في الأعلى. ليست رقماً في القائمة."
    }),
    intent("add", ["add income", "add expense", "add transaction", "add a transaction", "money in", "money out", "ongeraho", "amafaranga yinjira", "ayinjira", "ayasohoka", "ajouter un revenu", "ajouter une dépense", "ajouter une transaction", "ongeza kipato", "ongeza matumizi", "agregar ingreso", "agregar gasto", "adicionar rendimento", "adicionar despesa", "أضف دخلا", "أضف مصروفا", "أضف معاملة"], {
      en: "Open 1, Add transaction. Choose Income (money in) or Expenses (money out). Choose what it was for from the long list, such as salary, a gift, a donation, food and beverages, clothes, or school fees. If it is not there, choose Add a new category, type the name, and press Save. That name is kept for next time. Then type the amount and the date, and press Save.",
      rw: "Fungura 1, Ongeraho igikorwa. Hitamo Ayinjira cyangwa Ayasohoka. Hitamo icyo byari mu rutonde rurerure. Niba kitariho, hitamo Ongeraho izina, wandike izina, ukande Bika. Iryo zina riragumaho. Andika umubare n'itariki, ukande Bika.",
      fr: "Ouvrez 1, Ajouter une transaction. Choisissez Revenu ou Dépense. Choisissez à quoi cela correspond dans la longue liste. Si ce n'est pas là, choisissez Ajouter un nom, écrivez le nom, et Enregistrer. Ce nom est gardé. Puis tapez le montant et la date, et Enregistrer.",
      sw: "Fungua 1, Ongeza muamala. Chagua Kipato au Matumizi. Chagua kilichokuwa kutoka kwenye orodha ndefu. Ikiwa hakipo, chagua Ongeza jina, andika jina, kisha Hifadhi. Jina hilo linabaki. Kisha andika kiasi na tarehe, na Hifadhi.",
      es: "Abra 1, Agregar transacción. Elija Ingreso o Gasto. Elija para qué fue en la lista larga. Si no está, elija Añadir un nombre, escriba el nombre, y Guardar. Ese nombre se queda. Luego escriba el monto y la fecha, y Guardar.",
      pt: "Abra 1, Adicionar transação. Escolha Rendimento ou Despesa. Escolha para que foi na lista longa. Se não estiver lá, escolha Acrescentar um nome, escreva o nome, e Guardar. Esse nome fica guardado. Depois escreva o valor e a data, e Guardar.",
      ar: "افتح 1، أضف معاملة. اختر الدخل أو المصروف. اختر الغرض من القائمة الطويلة. إن لم يكن موجوداً، اختر أضف اسماً، واكتب الاسم، ثم احفظ. يبقى هذا الاسم. ثم اكتب المبلغ والتاريخ، واحفظ."
    }),
    intent("income", ["income", "expense", "expenses", "money in", "money out", "revenu", "dépense", "kipato", "matumizi", "ingreso", "gasto", "rendimento", "despesa", "دخل", "مصروف", "yinjira", "yasohoka"], {
      en: "Income is money that comes to you: pay, sales, a gift, or money sent to you. Expenses are what you spend. The words in brackets, money in and money out, mean the same thing. Buttons say Add income and Add expenses.",
      rw: "Ayinjira ni amafaranga agushyikira: umushahara, ibicuruzwa, impano, cyangwa amafaranga woherejwe. Ayasohoka ni ayo ukoresha. Amagambo mu rubaba, money in na money out, asobanura kimwe. Amabuto avuga Ongeraho ayinjira n'Ongeraho ayasohoka.",
      fr: "Le revenu est l'argent qui vous arrive : paie, ventes, un cadeau, ou de l'argent envoyé. Les dépenses sont ce que vous payez. Les mots entre parenthèses, argent qui entre et argent qui sort, veulent dire la même chose.",
      sw: "Kipato ni pesa inayokujia: mshahara, mauzo, zawadi, au pesa uliyotumiwa. Matumizi ni unayotumia. Maneno kwenye mabano yana maana ile ile. Vitufe vinasema Ongeza kipato na Ongeza matumizi.",
      es: "El ingreso es dinero que le llega: pago, ventas, un regalo, o dinero enviado. Los gastos son lo que usted gasta. Las palabras entre paréntesis significan lo mismo.",
      pt: "O rendimento é dinheiro que lhe chega: pagamento, vendas, um presente, ou dinheiro enviado. As despesas são o que gasta. As palavras entre parênteses querem dizer o mesmo.",
      ar: "الدخل هو المال الذي يصلك: أجر، أو مبيعات، أو هدية، أو مال أُرسل إليك. المصروفات هي ما تنفقه. الكلمات بين القوسين تعني الشيء نفسه."
    }),
    intent("edit-tx", ["update a transaction", "edit a transaction", "delete a transaction", "change a transaction", "remove a transaction", "hindura igikorwa", "siba igikorwa", "modifier une transaction", "supprimer une transaction", "hariri muamala", "futa muamala", "editar transacción", "borrar transacción", "editar transação", "apagar transação", "عدّل معاملة", "احذف معاملة"], {
      en: "To change a transaction, open 3, Update a transaction. Press Edit, change the fields, and Save. To remove one, open 4, Delete a transaction. Press Delete, then confirm. Keep it leaves the record where it is. Next moves you to the following step.",
      rw: "Guhindura igikorwa, fungura 3, Hindura igikorwa. Kanda Hindura, uhindure ibisabwa, ukande Bika. Kugisiba, fungura 4, Siba igikorwa. Kanda Siba, hanyuma wemeze. Kigume gisiga inyandiko aho iri. Ibikurikira bigutwara ku ntambwe ikurikira.",
      fr: "Pour changer une transaction, ouvrez 3, Modifier une transaction. Appuyez sur Modifier, changez les champs, et Enregistrer. Pour en retirer une, ouvrez 4, Supprimer une transaction. Appuyez sur Supprimer, puis confirmez. Garder laisse la note en place.",
      sw: "Kubadilisha muamala, fungua 3, Sasisha muamala. Bonyeza Hariri, badilisha sehemu, kisha Hifadhi. Kuondoa mmoja, fungua 4, Futa muamala. Bonyeza Futa, kisha thibitisha. Ibaki inaacha kumbukumbu palepale.",
      es: "Para cambiar una transacción, abra 3, Actualizar una transacción. Pulse Editar, cambie los campos, y Guardar. Para quitar una, abra 4, Borrar una transacción. Pulse Borrar, y confirme. Conservar deja el registro en su lugar.",
      pt: "Para mudar uma transação, abra 3, Atualizar uma transação. Prima Editar, mude os campos, e Guardar. Para tirar uma, abra 4, Apagar uma transação. Prima Apagar, e confirme. Manter deixa o registo no lugar.",
      ar: "لتغيير معاملة، افتح 3، حدّث معاملة. اضغط تعديل، غيّر الحقول، ثم احفظ. لحذف واحدة، افتح 4، احذف معاملة. اضغط حذف، ثم أكّد. الإبقاء يترك السجل في مكانه."
    }),
    intent("search", ["search", "filter", "find a transaction", "shakisha", "filtre", "rechercher", "tafuta", "buscar", "filtrar", "pesquisar", "بحث", "تصفية"], {
      en: "Open 5, Search / filter transactions. Type words, choose income or expenses, choose a category, and set a from date and a to date. The list updates as you type. For goals, open 14, Search / filter goals by category.",
      rw: "Fungura 5, Shakisha cyangwa yungurura ibikorwa. Andika amagambo, hitamo ayinjira cyangwa ayasohoka, hitamo icyiciro, ushyireho itariki yo gutangira n'iyo kurangiza. Urutonde ruhinduka uko wandika. Ku ntego, fungura 14, Shakisha intego ukurikije icyiciro.",
      fr: "Ouvrez 5, Rechercher / filtrer les transactions. Tapez des mots, choisissez revenu ou dépense, une catégorie, et une date de début et de fin. La liste se met à jour pendant que vous tapez. Pour les objectifs, ouvrez 14.",
      sw: "Fungua 5, Tafuta / chuja miamala. Andika maneno, chagua kipato au matumizi, chagua kundi, na weka tarehe ya kuanzia na ya mwisho. Orodha inabadilika unapoandika. Kwa malengo, fungua 14.",
      es: "Abra 5, Buscar / filtrar transacciones. Escriba palabras, elija ingreso o gasto, una categoría, y una fecha desde y hasta. La lista cambia mientras escribe. Para las metas, abra 14.",
      pt: "Abra 5, Pesquisar / filtrar transações. Escreva palavras, escolha rendimento ou despesa, uma categoria, e uma data de início e de fim. A lista muda enquanto escreve. Para as metas, abra 14.",
      ar: "افتح 5، ابحث في المعاملات أو صفّها. اكتب كلمات، واختر الدخل أو المصروف، والفئة، وتاريخ البداية والنهاية. القائمة تتغير وأنت تكتب. للأهداف، افتح 14."
    }),
    intent("report", ["report", "monthly", "daily", "category breakdown", "specific day", "raporo", "ukwezi", "umunsi", "rapport", "mensuel", "quotidien", "ripoti", "mwezi", "siku", "informe", "mensual", "diario", "relatório", "mensal", "تقرير", "شهري", "يومي"], {
      en: "6 is the monthly summary. 7 lists every day, with older days behind Show older. 8 opens one date you choose. 9 shows where the expenses went. 15 is the savings progress report. On a report, One page builds a short summary, and Print this report prints it. The menu and this guide stay off the printed page.",
      rw: "6 ni raporo y'ukwezi. 7 irondora buri munsi, n'iminsi ya kera inyuma ya Erekana iya kera. 8 ifungura itariki uhisemo. 9 yerekana aho ayasohoka ajya. 15 ni raporo y'iterambere ry'intego. Kuri raporo, Ipaji imwe igira incamake, na Print iyicapa. Urutonde n'uyu muyobozi ntibigera ku rupapuro rucapwe.",
      fr: "6 est le résumé du mois. 7 liste chaque jour. 8 ouvre une date que vous choisissez. 9 montre où vont les dépenses. 15 est le rapport d'avancement de l'épargne. Sur un rapport, Une page fait un court résumé, et Imprimer l'imprime. Le menu et ce guide ne sont pas sur la page imprimée.",
      sw: "6 ni muhtasari wa mwezi. 7 inaorodhesha kila siku. 8 inafungua tarehe unayochagua. 9 inaonyesha matumizi yalikokwenda. 15 ni ripoti ya maendeleo ya akiba. Kwenye ripoti, Ukurasa mmoja hufanya muhtasari mfupi, na Chapisha inaichapisha. Menyu na mwongozo huu haviko kwenye ukurasa uliochapishwa.",
      es: "6 es el resumen del mes. 7 lista cada día. 8 abre una fecha que usted elige. 9 muestra a dónde fueron los gastos. 15 es el informe de avance del ahorro. En un informe, Una página hace un resumen corto, e Imprimir lo imprime. El menú y esta guía no salen en la página impresa.",
      pt: "6 é o resumo do mês. 7 lista cada dia. 8 abre uma data que escolhe. 9 mostra para onde foram as despesas. 15 é o relatório do progresso da poupança. Num relatório, Uma página faz um resumo curto, e Imprimir imprime-o. O menu e este guia não saem na página impressa.",
      ar: "6 هو ملخص الشهر. 7 يعرض كل يوم. 8 يفتح تاريخاً تختاره. 9 يبيّن أين ذهبت المصروفات. 15 هو تقرير تقدّم الادخار. في التقرير، صفحة واحدة تصنع ملخصاً قصيراً، وطباعة تطبعه. القائمة وهذا الدليل لا يظهران في الصفحة المطبوعة."
    }),
    intent("delete-goal", ["delete a goal", "delete a savings goal", "delete goal", "remove a goal", "siba intego", "supprimer un objectif", "supprimer l'objectif", "futa lengo", "borrar una meta", "borrar la meta", "apagar uma meta", "apagar a meta", "احذف هدفا", "احذف هدف"], {
      en: "Open 13, Delete a savings goal. Press Delete on the goal, then confirm. Keep it leaves the goal in place. To change a goal instead, open 12, Update a savings goal, press Edit, and Save.",
      rw: "Fungura 13, Siba intego. Kanda Siba ku ntego, hanyuma wemeze. Kigume gisiga intego aho iri. Niba ushaka kuyihindura, fungura 12, Hindura intego, ukande Hindura, ukande Bika.",
      fr: "Ouvrez 13, Supprimer un objectif. Appuyez sur Supprimer, puis confirmez. Garder laisse l'objectif en place. Pour le changer, ouvrez 12, Modifier un objectif, appuyez sur Modifier, et Enregistrer.",
      sw: "Fungua 13, Futa lengo la akiba. Bonyeza Futa kwenye lengo, kisha thibitisha. Ibaki inaacha lengo palepale. Kukibadilisha, fungua 12, Sasisha lengo, bonyeza Hariri, kisha Hifadhi.",
      es: "Abra 13, Borrar una meta de ahorro. Pulse Borrar en la meta, y confirme. Conservar deja la meta en su lugar. Para cambiarla, abra 12, Actualizar una meta, pulse Editar, y Guardar.",
      pt: "Abra 13, Apagar uma meta de poupança. Prima Apagar na meta, e confirme. Manter deixa a meta no lugar. Para mudá-la, abra 12, Atualizar uma meta, prima Editar, e Guardar.",
      ar: "افتح 13، احذف هدف ادخار. اضغط حذف على الهدف، ثم أكّد. الإبقاء يترك الهدف في مكانه. لتغييره، افتح 12، حدّث هدف ادخار، اضغط تعديل، ثم احفظ."
    }),
    intent("goal", ["goal", "goals", "savings goal", "add a goal", "intego", "objectif", "objectifs", "lengo", "malengo", "meta", "metas", "objetivo", "هدف", "أهداف"], {
      en: "Open 10 to add a goal. A simple goal needs a name, how much you want to reach, and a date. You can also type what you have already put aside. Open 11 to see the goals, 12 to update one, and 13 to delete one. On a goal, I saved more adds money you have put aside since the last time.",
      rw: "Fungura 10 wongereho intego. Intego isanzwe isaba izina, umubare ushaka kugera, n'itariki. Washyiramo n'ayo wamaze kubika. Fungura 11 urebe intego, 12 uhindure imwe, na 13 uyisibe. Ku ntego, Nabikije byinshi wongeraho amafaranga wabikije kuva ubushize.",
      fr: "Ouvrez 10 pour ajouter un objectif. Un objectif simple demande un nom, le montant à atteindre, et une date. Vous pouvez aussi noter ce que vous avez déjà mis de côté. Ouvrez 11 pour voir les objectifs, 12 pour en modifier un, et 13 pour en supprimer un. Sur un objectif, J'ai mis plus de côté ajoute l'argent mis de côté depuis la dernière fois.",
      sw: "Fungua 10 kuongeza lengo. Lengo rahisi linahitaji jina, kiasi unachotaka kufika, na tarehe. Unaweza pia kuandika ulichoweka kando tayari. Fungua 11 kuona malengo, 12 kusasisha moja, na 13 kufuta moja. Kwenye lengo, Nimeweka zaidi inaongeza pesa ulizoweka kando tangu mara ya mwisho.",
      es: "Abra 10 para agregar una meta. Una meta simple necesita un nombre, cuánto quiere alcanzar, y una fecha. También puede anotar lo que ya apartó. Abra 11 para ver las metas, 12 para actualizar una, y 13 para borrar una. En una meta, Ahorré más suma el dinero apartado desde la última vez.",
      pt: "Abra 10 para adicionar uma meta. Uma meta simples precisa de um nome, quanto quer alcançar, e uma data. Também pode anotar o que já pôs de lado. Abra 11 para ver as metas, 12 para atualizar uma, e 13 para apagar uma. Numa meta, Poupei mais soma o dinheiro posto de lado desde a última vez.",
      ar: "افتح 10 لإضافة هدف. الهدف البسيط يحتاج اسماً، والمبلغ الذي تريد بلوغه، وتاريخاً. يمكنك أيضاً كتابة ما وضعته جانباً. افتح 11 لرؤية الأهداف، و12 لتحديث واحد، و13 لحذف واحد. على الهدف، ادخرت المزيد يضيف المال الذي وضعته جانباً منذ آخر مرة."
    }),
    intent("smart", ["smart", "five questions", "specific", "monthly contribution", "ibibazo bitanu", "cinq questions", "maswali matano", "cinco preguntas", "cinco perguntas", "خمسة أسئلة"], {
      en: "A SMART goal is the same goal plus five short sentences. S is what exactly you are keeping the money for. M is how much you want to reach. A is how much you can put aside each month. R is why it matters to you. T is the date. The letters are only labels. The report tells you if the monthly step is keeping up with the date.",
      rw: "Intego SMART ni intego imwe yongerewe interuro eshatu n'ebyiri. S ni icyo ubika amafaranga. M ni umubare ushaka kugera. A ni umubare ushobora kubika buri kwezi. R ni impamvu bibaye ingirakamaro. T ni itariki. Inyuguti ni ibimenyetso gusa. Raporo ikubwira niba intambwe ya buri kwezi ihura n'itariki.",
      fr: "Un objectif SMART est le même objectif plus cinq phrases courtes. S est à quoi sert exactement l'argent. M est le montant à atteindre. A est ce que vous pouvez mettre de côté chaque mois. R est pourquoi cela compte. T est la date. Les lettres ne sont que des étiquettes. Le rapport dit si le pas mensuel suit la date.",
      sw: "Lengo la SMART ni lengo lile lile pamoja na sentensi tano fupi. S ni pesa unaiweka kwa nini hasa. M ni kiasi unachotaka. A ni unachoweza kuweka kando kila mwezi. R ni kwa nini ni muhimu. T ni tarehe. Herufi ni lebo tu. Ripoti inakuambia kama hatua ya kila mwezi inafuatana na tarehe.",
      es: "Una meta SMART es la misma meta más cinco frases cortas. S es para qué guarda el dinero. M es cuánto quiere alcanzar. A es cuánto puede apartar cada mes. R es por qué importa. T es la fecha. Las letras son solo etiquetas. El informe dice si el paso mensual va con la fecha.",
      pt: "Uma meta SMART é a mesma meta mais cinco frases curtas. S é para que guarda o dinheiro. M é quanto quer alcançar. A é quanto pode pôr de lado cada mês. R é por que importa. T é a data. As letras são só etiquetas. O relatório diz se o passo mensal acompanha a data.",
      ar: "هدف SMART هو الهدف نفسه مع خمس جمل قصيرة. S هو الغرض الدقيق من المال. M هو المبلغ الذي تريد بلوغه. A هو ما تستطيع وضعه جانباً كل شهر. R هو سبب أهميته. T هو التاريخ. الحروف مجرد عناوين. التقرير يقول إن كانت الخطوة الشهرية تواكب التاريخ."
    }),
    intent("emergency", ["emergency", "cushion", "hard week", "7 days", "days covered", "ibyago", "icyumweru kigoranye", "urgence", "dharura", "emergencia", "emergência", "طوارئ"], {
      en: "If the goal name says emergency, progress is shown as days of a hard week, from 0 to 7, plus the percent. It is how many of those 7 days the money already saved would cover. The percent is still there beside the days.",
      rw: "Niba izina ry'intego rivuga emergency, iterambere rigaragara nk'iminsi y'icyumweru kigoranye, kuva 0 kugeza 7, hamwe na ijana. Ni iminsi ingahe muri izo 7 amafaranga wamaze kubika yakwiganira. Ijana riracyari iruhande rw'iminsi.",
      fr: "Si le nom de l'objectif dit urgence, l'avancement s'affiche en jours d'une semaine difficile, de 0 à 7, plus le pourcentage. C'est combien de ces 7 jours l'argent déjà mis de côté couvrirait. Le pourcentage reste à côté des jours.",
      sw: "Ikiwa jina la lengo linasema dharura, maendeleo yanaonyeshwa kama siku za wiki ngumu, kutoka 0 hadi 7, pamoja na asilimia. Ni siku ngapi kati ya hizo 7 pesa iliyowekwa kando ingetosha. Asilimia inabaki kando ya siku.",
      es: "Si el nombre de la meta dice emergencia, el avance se muestra como días de una semana difícil, de 0 a 7, más el porcentaje. Es cuántos de esos 7 días cubriría el dinero ya apartado. El porcentaje sigue al lado de los días.",
      pt: "Se o nome da meta diz emergência, o progresso aparece como dias de uma semana difícil, de 0 a 7, mais a percentagem. É quantos desses 7 dias o dinheiro já posto de lado cobriria. A percentagem continua ao lado dos dias.",
      ar: "إذا كان اسم الهدف يقول طوارئ، يظهر التقدّم كأيام أسبوع صعب، من 0 إلى 7، مع النسبة. هو كم يوماً من تلك الأيام السبعة يغطيها المال المدّخر. النسبة تبقى بجانب الأيام."
    }),
    intent("saved", ["i saved", "saved more", "put aside", "nabikije", "j'ai épargné", "nimeweka", "ahorré", "poupei", "ادخرت"], {
      en: "On the goal list, open 11, View savings goals. Press I saved more, type the amount you just put aside, and Save. The amount already saved goes up, and the percent moves with it. That button is on the view step, not on the delete step.",
      rw: "Ku rutonde rw'intego, fungura 11, Reba intego. Kanda Nabikije ibindi, andika umubare ubu wabikije, ukande Bika. Umubare wabitswe wiyongera, n'ijana rinyurana na wo. Iryo buto riri ku ntambwe yo kureba, si ku ntambwe yo gusiba.",
      fr: "Dans la liste des objectifs, ouvrez 11, Voir les objectifs. Appuyez sur J'ai mis plus de côté, tapez le montant que vous venez de mettre de côté, et Enregistrer. Le montant déjà épargné monte, et le pourcentage suit. Ce bouton est sur l'étape de lecture, pas sur l'étape de suppression.",
      sw: "Kwenye orodha ya malengo, fungua 11, Tazama malengo. Bonyeza Nimeweka zaidi, andika kiasi ulichoweka kando sasa, kisha Hifadhi. Kiasi kilichowekwa kinaongezeka, na asilimia inafuata. Kitufe hicho kiko kwenye hatua ya kuona, si ya kufuta.",
      es: "En la lista de metas, abra 11, Ver metas. Pulse Aparté más, escriba el monto que acaba de apartar, y Guardar. Lo ya ahorrado sube, y el porcentaje se mueve con ello. Ese botón está en el paso de ver, no en el de borrar.",
      pt: "Na lista de metas, abra 11, Ver metas. Prima Guardei mais, escreva o valor que acabou de pôr de lado, e Guardar. O já poupado sobe, e a percentagem acompanha. Esse botão está no passo de ver, não no de apagar.",
      ar: "في قائمة الأهداف، افتح 11، اعرض الأهداف. اضغط وفّرت المزيد، واكتب المبلغ الذي وضعته جانباً الآن، ثم احفظ. المبلغ المدّخر يرتفع، والنسبة تتحرك معه. هذا الزر في خطوة العرض، وليس في خطوة الحذف."
    }),
    intent("currency", ["currency", "dollar", "franc", "rwf", "usd", "exchange", "rate", "convert", "ifaranga", "igipimo", "monnaie", "devise", "taux", "sarafu", "bei", "moneda", "tipo", "moeda", "taxa", "عملة", "سعر"], {
      en: "In Settings, under Currency, choose the money these amounts are in, such as RWF or USD. The first choice only names the numbers. The next choice rewrites every amount with the central-bank rate for the day you pick. Leave the day empty for the newest published rate. The app shows the rate, for example 1 USD = 1,477.55 RWF, and waits until you press Change the amounts. With no internet, it uses a rate already saved on this phone and names the day. Amounts are rounded to the cent. Money from abroad, in a second currency, is not rewritten and stays out of the cash total.",
      rw: "Muri Igenamiterere, munsi y'Ifaranga, hitamo amafaranga aya mibare ari mo, nk'RWF cyangwa USD. Guhitamo kwa mbere gusa guha izina imibare. Ikindi gihindura buri mubare ukoresheje igipimo cy'amabanki nkuru cy'umunsi wahisemo. Siga umunsi ubusa kugira ngo ukoreshe igipimo gishya cyane. Porogaramu yerekana igipimo, urugero 1 USD = 1,477.55 RWF, itegereza ukande Hindura amafaranga. Nta interineti, ikoresha igipimo cyabitswe kuri iyi telefoni ikavuga umunsi. Imibare iringaniwe ku butumwa. Amafaranga akomoka mu mahanga, muri yindi faranga, ntahinduka kandi ntagira muri rusange.",
      fr: "Dans Réglages, sous Monnaie, choisissez l'argent de ces montants, comme RWF ou USD. Le premier choix ne fait que nommer les nombres. Le suivant réécrit chaque montant avec le taux des banques centrales du jour choisi. Laissez le jour vide pour le taux publié le plus récent. L'application montre le taux, par exemple 1 USD = 1 477,55 RWF, et attend que vous appuyiez sur Changer les montants. Sans internet, elle utilise un taux déjà enregistré sur ce téléphone et dit le jour. Les montants sont arrondis au centime. L'argent de l'étranger, dans une autre monnaie, n'est pas réécrit et reste hors du total.",
      sw: "Katika Mipangilio, chini ya Sarafu, chagua pesa kiasi hiki kilicho, kama RWF au USD. Chaguo la kwanza linaipa nambari jina tu. Linalofuata linaandika upya kila kiasi kwa bei ya benki kuu ya siku unayochagua. Acha siku tupu kwa bei mpya zaidi. Programu inaonyesha bei, kwa mfano 1 USD = 1,477.55 RWF, na inasubiri ubonyeze Badilisha kiasi. Bila intaneti, inatumia bei iliyohifadhiwa kwenye simu hii na kutaja siku. Kiasi kinazungushwa hadi senti. Pesa kutoka nje, kwa sarafu nyingine, haiandikwi upya na haingii kwenye jumla.",
      es: "En Ajustes, bajo Moneda, elija el dinero de estos montos, como RWF o USD. La primera elección solo nombra los números. La siguiente reescribe cada monto con el tipo de los bancos centrales del día que elija. Deje el día vacío para el tipo publicado más reciente. La aplicación muestra el tipo, por ejemplo 1 USD = 1.477,55 RWF, y espera a que pulse Cambiar las cantidades. Sin internet, usa un tipo ya guardado en este teléfono y dice el día. Los montos se redondean al centavo. El dinero del extranjero, en otra moneda, no se reescribe y queda fuera del total.",
      pt: "Em Definições, sob Moeda, escolha o dinheiro destes valores, como RWF ou USD. A primeira escolha só dá nome aos números. A seguinte reescreve cada valor com a taxa dos bancos centrais do dia que escolher. Deixe o dia vazio para a taxa publicada mais recente. A aplicação mostra a taxa, por exemplo 1 USD = 1.477,55 RWF, e espera que prima Mudar os valores. Sem internet, usa uma taxa já guardada neste telemóvel e diz o dia. Os valores arredondam ao cêntimo. O dinheiro do estrangeiro, noutra moeda, não é reescrito e fica fora do total.",
      ar: "في الإعدادات، تحت العملة، اختر عملة هذه المبالغ، مثل RWF أو USD. الاختيار الأول يسمّي الأرقام فقط. الاختيار التالي يعيد كتابة كل مبلغ بسعر البنوك المركزية لليوم الذي تختاره. اترك اليوم فارغاً لأحدث سعر منشور. التطبيق يعرض السعر، مثلاً 1 USD = 1,477.55 RWF، وينتظر أن تضغط غيّر المبالغ. دون إنترنت، يستخدم سعراً محفوظاً على هذا الهاتف ويذكر اليوم. المبالغ تُقرَّب إلى السنت. المال الآتي من الخارج بعملة أخرى لا يُعاد كتابته ويبقى خارج المجموع."
    }),
    intent("abroad", ["abroad", "remittance", "second currency", "another currency", "amafaranga yo mu mahanga", "étranger", "nje", "remesa", "remessa", "الخارج", "حوالة"], {
      en: "Money from abroad is only for a gift or pay that arrives in another currency. In Settings, type that currency, for example USD if your book is in RWF. When you add a transaction, you can mark it as that other money. Those amounts stay out of the income, expenses, and what you kept. Changing the main currency does not rewrite them.",
      rw: "Amafaranga yo mu mahanga ni ay'impano cyangwa umushahara uje muri yindi faranga. Muri Igenamiterere, andika iyo faranga, urugero USD niba igitabo cyawe kiri muri RWF. Wongeraho igikorwa, ushobora kukimenya nk'ayo yandi mafaranga. Ayo mafaranga ntagira mu yinjira, ayasohoka, n'ayo wabikije. Guhindura ifaranga nyamukuru ntibiyahindura.",
      fr: "L'argent de l'étranger sert seulement à un cadeau ou un paiement qui arrive dans une autre monnaie. Dans Réglages, écrivez cette monnaie, par exemple USD si votre cahier est en RWF. En ajoutant une transaction, vous pouvez la marquer comme cet autre argent. Ces montants restent hors des revenus, des dépenses, et de ce que vous avez gardé. Changer la monnaie principale ne les réécrit pas.",
      sw: "Pesa kutoka nje ni kwa zawadi au malipo yanayofika kwa sarafu nyingine. Katika Mipangilio, andika sarafu hiyo, kwa mfano USD ikiwa daftari lako liko RWF. Ukiiongeza muamala, unaweza kuiweka kama pesa hiyo nyingine. Kiasi hicho hakibaki ndani ya kipato, matumizi, na ulichobaki nacho. Kubadilisha sarafu kuu hakukiandiki upya.",
      es: "El dinero del extranjero es solo para un regalo o un pago que llega en otra moneda. En Ajustes, escriba esa moneda, por ejemplo USD si su cuaderno está en RWF. Al agregar una transacción, puede marcarla como ese otro dinero. Esos montos quedan fuera de los ingresos, los gastos, y lo que guardó. Cambiar la moneda principal no los reescribe.",
      pt: "O dinheiro do estrangeiro é só para um presente ou um pagamento que chega noutra moeda. Em Definições, escreva essa moeda, por exemplo USD se o seu caderno está em RWF. Ao adicionar uma transação, pode marcá-la como esse outro dinheiro. Esses valores ficam fora dos rendimentos, das despesas, e do que guardou. Mudar a moeda principal não os reescreve.",
      ar: "المال من الخارج هو لهدية أو دفعة تصل بعملة أخرى. في الإعدادات، اكتب تلك العملة، مثلاً USD إذا كان دفترك بـ RWF. عند إضافة معاملة، يمكنك وسمها بتلك العملة الأخرى. هذه المبالغ تبقى خارج الدخل والمصروفات وما أبقيته. تغيير العملة الرئيسية لا يعيد كتابتها."
    }),
    intent("offline", ["offline", "no internet", "without internet", "no connection", "nta interineti", "sans internet", "hors ligne", "bila intaneti", "sin internet", "sem internet", "دون إنترنت", "بدون نت"], {
      en: "Yes. After this app has opened once on the phone, income, expenses, goals, reports, the menu, and this guide all work with no internet. The records stay on this phone. The status line says so. A brand-new currency pair, such as RWF to USD the first time, needs a connection once so the day's rate can be saved. After that, that change works offline too, and the guide tells you the day of the saved rate.",
      rw: "Yego. Iyi porogaramu imaze gufunguka rimwe kuri telefoni, ayinjira, ayasohoka, intego, raporo, urutonde, n'uyu muyobozi bikora nta interineti. Inyandiko ziguma kuri iyi telefoni. Umurongo w'imiterere ubivuga. Ifaranga nshya, nk'RWF ijya muri USD bwa mbere, isaba ihuriro rimwe kugira ngo igipimo cy'umunsi kibikwe. Nyuma y'ibyo, iryo hinduka rikora nta interineti, kandi umuyobozi akubwira umunsi w'igipimo cyabitswe.",
      fr: "Oui. Après une première ouverture sur le téléphone, les revenus, les dépenses, les objectifs, les rapports, le menu, et ce guide fonctionnent sans internet. Les notes restent sur ce téléphone. Une paire de monnaies nouvelle, comme RWF vers USD la première fois, a besoin d'une connexion une fois pour enregistrer le taux du jour. Ensuite, ce changement fonctionne aussi hors ligne, et le guide dit le jour du taux enregistré.",
      sw: "Ndiyo. Baada ya programu hii kufunguka mara moja kwenye simu, kipato, matumizi, malengo, ripoti, menyu, na mwongozo huu vinafanya kazi bila intaneti. Kumbukumbu zinabaki kwenye simu hii. Jozi mpya ya sarafu, kama RWF kwenda USD mara ya kwanza, inahitaji muunganisho mara moja ili bei ya siku ihifadhiwe. Baada ya hapo, badiliko hilo linafanya kazi bila intaneti, na mwongozo unasema siku ya bei iliyohifadhiwa.",
      es: "Sí. Después de abrir esta aplicación una vez en el teléfono, los ingresos, los gastos, las metas, los informes, el menú, y esta guía funcionan sin internet. Los registros se quedan en este teléfono. Un par de monedas nuevo, como RWF a USD la primera vez, necesita una conexión una vez para guardar el tipo del día. Después, ese cambio también funciona sin internet, y la guía dice el día del tipo guardado.",
      pt: "Sim. Depois de esta aplicação abrir uma vez no telemóvel, os rendimentos, as despesas, as metas, os relatórios, o menu, e este guia funcionam sem internet. Os registos ficam neste telemóvel. Um par de moedas novo, como RWF para USD da primeira vez, precisa de uma ligação uma vez para guardar a taxa do dia. Depois, essa mudança também funciona sem internet, e o guia diz o dia da taxa guardada.",
      ar: "نعم. بعد فتح هذا التطبيق مرة على الهاتف، الدخل والمصروفات والأهداف والتقارير والقائمة وهذا الدليل تعمل دون إنترنت. السجلات تبقى على هذا الهاتف. زوج عملات جديد، مثل RWF إلى USD أول مرة، يحتاج اتصالاً مرة واحدة ليحفظ سعر ذلك اليوم. بعد ذلك، هذا التغيير يعمل دون إنترنت أيضاً، والدليل يذكر يوم السعر المحفوظ."
    }),
    intent("lock", ["lock", "pin", "password", "shared phone", "privacy", "gufunga", "ijambo ry'ibanga", "verrou", "mot de passe", "téléphone partagé", "funga", "nywila", "simu", "bloqueo", "contraseña", "teléfono compartido", "trancado", "palavra-passe", "قفل", "رمز", "هاتف مشترك", "خصوصية"], {
      en: "A friend may know the phone password and still should not read this book. In Settings, under On a shared phone, set a lock used only by this app. It asks for that lock when the app opens. The lock stays on this phone. It is not inside an exported file, and it is not sent anywhere. This app does not scan a face. Hide amounts covers the numbers while someone is looking. Press the same button to show them again.",
      rw: "Inshuti ishobora kumenya ijambo ry'ibanga rya telefoni ikaba itagombye gusoma iki gitabo. Muri Igenamiterere, munsi ya Kuri telefoni musangiye, shyiraho ifunga ikoreshwa n'iyi porogaramu gusa. Iyibaza iyo porogaramu ifunguka. Ifunga iguma kuri iyi telefoni. Ntabwo iri muri dosiye yoherejwe, kandi ntiyoherezwa ahandi. Iyi porogaramu ntisuzuma isura. Hisha imibare ipfuka imibare mugihe umuntu areba. Kanda buto imwe wongere uyiyereke.",
      fr: "Un ami peut connaître le mot de passe du téléphone et ne doit pas lire ce cahier. Dans Réglages, sous Sur un téléphone partagé, posez un verrou utilisé seulement par cette application. Elle le demande à l'ouverture. Le verrou reste sur ce téléphone. Il n'est pas dans un fichier exporté, et il n'est envoyé nulle part. Cette application ne scanne pas un visage. Masquer les montants couvre les nombres pendant qu'une personne regarde. Le même bouton les montre à nouveau.",
      sw: "Rafiki anaweza kujua nywila ya simu na bado hapaswi kusoma daftari hili. Katika Mipangilio, chini ya Kwenye simu inayoshirikiwa, weka kufuli inayotumiwa na programu hii tu. Inauliza kufuli hiyo programu inapofunguka. Kufuli inabaki kwenye simu hii. Haiko ndani ya faili iliyohamishwa, wala haitumwi popote. Programu hii haichanganui uso. Ficha kiasi inafunika nambari mtu anapotazama. Bonyeza kitufe kile kile kuzionyesha tena.",
      es: "Un amigo puede saber la contraseña del teléfono y aun así no debe leer este cuaderno. En Ajustes, bajo En un teléfono compartido, ponga un bloqueo usado solo por esta aplicación. Lo pide al abrirse. El bloqueo se queda en este teléfono. No está dentro de un archivo exportado, y no se envía a ningún lugar. Esta aplicación no escanea una cara. Ocultar montos tapa los números mientras alguien mira. El mismo botón los muestra otra vez.",
      pt: "Um amigo pode saber a palavra-passe do telemóvel e mesmo assim não deve ler este caderno. Em Definições, sob Num telemóvel partilhado, ponha um trinco usado só por esta aplicação. Ela pede-o ao abrir. O trinco fica neste telemóvel. Não está dentro de um ficheiro exportado, e não é enviado para lado nenhum. Esta aplicação não lê um rosto. Ocultar valores tapa os números enquanto alguém olha. O mesmo botão mostra-os de novo.",
      ar: "قد يعرف صديق كلمة سر الهاتف ومع ذلك لا ينبغي أن يقرأ هذا الدفتر. في الإعدادات، تحت على هاتف مشترك، ضع قفلاً يستخدمه هذا التطبيق فقط. يطلبه عند الفتح. القفل يبقى على هذا الهاتف. ليس داخل ملف مُصدَّر، ولا يُرسل إلى أي مكان. هذا التطبيق لا يمسح وجهاً. إخفاء المبالغ يغطي الأرقام بينما ينظر أحد. الزر نفسه يعيدها."
    }),
    intent("hide", ["hide", "show amounts", "cover", "hisha", "masquer", "afficher", "ficha", "onyesha", "ocultar", "mostrar", "ocultar valores", "إخفاء", "أظهر"], {
      en: "Hide amounts is the button at the top. It covers the numbers while a colleague looks at the phone. Press it again, Show amounts, to bring the numbers back. The records are still there. Only the figures are covered.",
      rw: "Hisha umubare ni buto yo hejuru. Ipfuka imibare mugihe mugenzi areba telefoni. Yongera kuyikanda, Erekana umubare, kugira ngo imibare igaruke. Inyandiko ziracyari aho. Imibare ni yo ipfuye gusa.",
      fr: "Cacher les montants est le bouton en haut. Il couvre les nombres pendant qu'un collègue regarde le téléphone. Appuyez encore, Montrer les montants, pour ramener les nombres. Les notes sont toujours là. Seuls les chiffres sont couverts.",
      sw: "Ficha kiasi ni kitufe juu. Kinafunika nambari mwenzako anapotazama simu. Bonyeza tena, Onyesha kiasi, kurudisha nambari. Kumbukumbu bado ziko. Nambari tu ndizo zilizofunikwa.",
      es: "Ocultar cantidades es el botón de arriba. Tapa los números mientras un colega mira el teléfono. Púlselo otra vez, Mostrar cantidades, para traer los números. Los registros siguen ahí. Solo las cifras están tapadas.",
      pt: "Esconder valores é o botão de cima. Tapa os números enquanto um colega olha para o telemóvel. Prima outra vez, Mostrar valores, para trazer os números. Os registos continuam lá. Só os números estão tapados.",
      ar: "أخفِ المبالغ هو الزر في الأعلى. يغطي الأرقام بينما ينظر زميل إلى الهاتف. اضغطه مرة أخرى، أظهر المبالغ، لتعود الأرقام. السجلات ما زالت هناك. الأرقام وحدها مغطاة."
    }),
    intent("language", ["language", "kinyarwanda", "ikinyarwanda", "kenyarwanda", "french", "français", "kiswahili", "swahili", "spanish", "español", "portuguese", "português", "arabic", "text size", "ururimi", "ingano", "langue", "taille", "lugha", "ukubwa", "idioma", "tamaño", "língua", "tamanho", "لغة", "حجم"], {
      en: "Each time you open the app, after the lock if you set one, search for a language. Type a country or a language, such as Rwanda or Kinyarwanda. The country appears first, then the language. The menu, every page, and this guide follow that language, and this guide speaks it the way that language is spoken. Then search for a currency. Amounts are exchanged only when you pick a different currency, at that day's central-bank rate. You can change both again in Settings. Arabic runs from right to left. The sun mark stays at the physical top right.",
      rw: "Iyo ufungura porogaramu, nyuma y'ifunga niba wayishyizeho, shakisha ururimi. Andika igihugu cyangwa ururimi, nk'u Rwanda cyangwa Ikinyarwanda. Igihugu kigaragaram mbere, hanyuma ururimi. Urutonde, ipaji yose, n'uyu muyobozi bakurikiza urwo rurimi, kandi uyu muyobozi aruvuga uko abavuga urwo rurimi baruvuga. Hanyuma shakisha ifaranga. Imibare ihinduka gusa iyo uhisemo ifaranga itandukanye, ku gipimo cya banki nkuru cy'uwo munsi. Ushobora kubihindura muri Igenamiterere. Icyarabu kivuye iburyo ukajya ibumoso. Izuba riguma hejuru iburyo.",
      fr: "Chaque fois que vous ouvrez l'application, après le verrou si vous en avez mis un, cherchez une langue. Écrivez un pays ou une langue, par exemple Rwanda ou Kinyarwanda. Le pays apparaît d'abord, puis la langue. Le menu, chaque page, et ce guide suivent cette langue, et ce guide la parle comme elle se parle. Ensuite cherchez une monnaie. Les montants sont changés seulement quand vous choisissez une autre monnaie, au taux de la banque centrale de ce jour. Vous pouvez changer les deux dans Réglages. L'arabe va de droite à gauche. Le soleil reste en haut à droite.",
      sw: "Kila ukifungua programu, baada ya kufuli ikiwa uliiweka, tafuta lugha. Andika nchi au lugha, kama Rwanda au Kinyarwanda. Nchi inaonekana kwanza, kisha lugha. Menyu, kila ukurasa, na mwongozo huu vinafuata lugha hiyo, na mwongozo huu unaisema jinsi inavyosemwa. Kisha tafuta sarafu. Kiasi kinabadilishwa tu unapochagua sarafu nyingine, kwa bei ya benki kuu ya siku hiyo. Unaweza kubadilisha vyote katika Mipangilio. Kiarabu kinakwenda kulia kwenda kushoto. Jua linabaki juu kulia.",
      es: "Cada vez que abre la aplicación, después del bloqueo si puso uno, busque un idioma. Escriba un país o un idioma, como Ruanda o Kinyarwanda. El país aparece primero, luego el idioma. El menú, cada página y esta guía siguen ese idioma, y esta guía lo habla como se habla. Después busque una moneda. Las cantidades se cambian solo cuando elige otra moneda, al tipo del banco central de ese día. Puede cambiar los dos en Ajustes. El árabe va de derecha a izquierda. El sol se queda arriba a la derecha.",
      pt: "Cada vez que abre a aplicação, depois do trinco se pôs um, procure uma língua. Escreva um país ou uma língua, como Ruanda ou Kinyarwanda. O país aparece primeiro, depois a língua. O menu, cada página e este guia seguem essa língua, e este guia fala-a como ela se fala. Depois procure uma moeda. Os valores mudam só quando escolhe outra moeda, à taxa do banco central desse dia. Pode mudar os dois em Definições. O árabe corre da direita para a esquerda. O sol fica em cima à direita.",
      ar: "في كل مرة تفتح التطبيق، بعد القفل إذا وضعت واحداً، ابحث عن لغة. اكتب بلداً أو لغة، مثل رواندا أو Kinyarwanda. البلد يظهر أولاً، ثم اللغة. القائمة وكل صفحة وهذا الدليل يتبعون تلك اللغة، وهذا الدليل ينطقها كما ينطقها أهلها. ثم ابحث عن عملة. المبالغ تتغير فقط عندما تختار عملة أخرى، بسعر البنك المركزي لذلك اليوم. يمكنك تغيير الاثنين في الإعدادات. العربية تسير من اليمين إلى اليسار. الشمس تبقى في أعلى اليمين."
    }),
    intent("export", ["export", "import", "erase", "backup", "copy", "ohereza dosiye", "siba byose", "exporter", "importer", "effacer", "hamisha", "leta", "futa", "exportar", "importar", "borrar", "exportar", "apagar", "تصدير", "استيراد", "مسح"], {
      en: "In Settings, Export records saves a file you can keep before you change phones. Import records reads that same file back. Erase all records clears the book after you confirm. Start with my own money begins again. Put the example records back restores the sample life. The app lock is not inside the exported file.",
      rw: "Muri Igenamiterere, Ohereza inyandiko ibika dosiye ushobora kubika mbere yo guhindura telefoni. Kwinjiza inyandiko bisoma iyo dosiye. Siba inyandiko zose bisiba igitabo wamaze kwemera. Tangira ku mafaranga yanjye bisubiramo. Subiza inyandiko z'urugero bizana ubuzima bw'urugero. Ifunga ntabwo iri muri dosiye yoherejwe.",
      fr: "Dans Réglages, Exporter les notes enregistre un fichier à garder avant de changer de téléphone. Importer relit ce même fichier. Effacer toutes les notes vide le cahier après confirmation. Recommencer avec mon argent recommence. Remettre l'exemple ramène la vie d'exemple. Le verrou n'est pas dans le fichier exporté.",
      sw: "Katika Mipangilio, Hamisha kumbukumbu inahifadhi faili unaweza kuiweka kabla ya kubadilisha simu. Leta kumbukumbu inasoma faili hiyo hiyo. Futa kumbukumbu zote inafuta daftari baada ya kuthibitisha. Anza na pesa zangu inaanza tena. Rudisha mfano inarudisha maisha ya mfano. Kufuli haiko ndani ya faili iliyohamishwa.",
      es: "En Ajustes, Exportar registros guarda un archivo para llevar antes de cambiar de teléfono. Importar registros lee ese mismo archivo. Borrar todos los registros vacía el cuaderno después de confirmar. Empezar con mi dinero vuelve a empezar. Poner de nuevo el ejemplo trae la vida de ejemplo. El bloqueo no está dentro del archivo exportado.",
      pt: "Em Definições, Exportar registos guarda um ficheiro para levar antes de mudar de telemóvel. Importar registos lê esse mesmo ficheiro. Apagar todos os registos esvazia o caderno depois de confirmar. Começar com o meu dinheiro recomeça. Repor o exemplo traz a vida de exemplo. O trinco não está dentro do ficheiro exportado.",
      ar: "في الإعدادات، تصدير السجلات يحفظ ملفاً تحتفظ به قبل تغيير الهاتف. استيراد السجلات يقرأ ذلك الملف. مسح كل السجلات يفرّغ الدفتر بعد التأكيد. ابدأ بأموالي يبدأ من جديد. إعادة سجلات المثال تعيد حياة المثال. القفل ليس داخل الملف المُصدَّر."
    }),
    intent("example", ["example", "sample", "zanzibar", "urugero", "exemple", "mfano", "ejemplo", "exemplo", "مثال"], {
      en: "Look at the example is on the first screen. Put the example records back is in Settings. The example is a sample life, with income, expenses, and goals, including a trip. It is not your money. When you finish your own three questions, your answers replace it.",
      rw: "Reba urugero iri ku rupapuro rwa mbere. Subiza inyandiko z'urugero biri muri Igenamiterere. Urugero ni ubuzima bw'icyitegererezo, bufite ayinjira, ayasohoka, n'intego, harimo n'urugendo. Si amafaranga yawe. Nuhaza ibibazo byawe bitatu, ibisubizo byawe bisimbura urwo rugero.",
      fr: "Voir l'exemple est sur le premier écran. Remettre les notes d'exemple est dans Réglages. L'exemple est une vie d'échantillon, avec des revenus, des dépenses, et des objectifs, dont un voyage. Ce n'est pas votre argent. Quand vous terminez vos trois questions, vos réponses le remplacent.",
      sw: "Angalia mfano iko kwenye skrini ya kwanza. Rudisha kumbukumbu za mfano iko katika Mipangilio. Mfano ni maisha ya sampuli, yenye kipato, matumizi, na malengo, pamoja na safari. Si pesa yako. Ukimaliza maswali yako matatu, majibu yako yanachukua nafasi yake.",
      es: "Ver el ejemplo está en la primera pantalla. Poner de nuevo los registros de ejemplo está en Ajustes. El ejemplo es una vida de muestra, con ingresos, gastos, y metas, incluido un viaje. No es su dinero. Cuando termine sus tres preguntas, sus respuestas lo reemplazan.",
      pt: "Ver o exemplo está no primeiro ecrã. Repor os registos de exemplo está em Definições. O exemplo é uma vida de amostra, com rendimentos, despesas, e metas, incluindo uma viagem. Não é o seu dinheiro. Quando terminar as suas três perguntas, as suas respostas substituem-no.",
      ar: "انظر إلى المثال في الشاشة الأولى. إعادة سجلات المثال في الإعدادات. المثال حياة عيّنة، فيها دخل ومصروفات وأهداف، ومنها رحلة. ليس مالك. عندما تنهي أسئلتك الثلاثة، إجاباتك تحل مكانه."
    }),
    intent("exit", ["exit", "quit", "close the app", "gusohoka", "quitter", "toka", "salir", "sair", "خروج"], {
      en: "0, Exit, does not close the browser. It tells you the records are saved on this phone. Back to the menu returns to the numbered list. Previous, from Exit, goes to the savings progress report.",
      rw: "0, Gusohoka, ntabwo gufunga mushakisha. Kikubwira ko inyandiko zabitswe kuri iyi telefoni. Garuka ku rutonde bigaruka ku mibare. Ibanje, uva kuri Gusohoka, ijya kuri raporo y'iterambere ry'intego.",
      fr: "0, Quitter, ne ferme pas le navigateur. Il dit que les notes sont enregistrées sur ce téléphone. Retour au menu ramène à la liste numérotée. Précédent, depuis Quitter, va au rapport d'avancement de l'épargne.",
      sw: "0, Toka, haifungi kivinjari. Inakuambia kumbukumbu zimehifadhiwa kwenye simu hii. Rudi kwenye menyu inarudisha kwenye orodha yenye nambari. Iliyotangulia, kutoka Toka, inaenda kwenye ripoti ya maendeleo ya akiba.",
      es: "0, Salir, no cierra el navegador. Dice que los registros están guardados en este teléfono. Volver al menú regresa a la lista numerada. Anterior, desde Salir, va al informe de avance del ahorro.",
      pt: "0, Sair, não fecha o navegador. Diz que os registos estão guardados neste telemóvel. Voltar ao menu regressa à lista numerada. Anterior, a partir de Sair, vai ao relatório do progresso da poupança.",
      ar: "0، خروج، لا يغلق المتصفح. يقول إن السجلات محفوظة على هذا الهاتف. العودة إلى القائمة ترجع إلى اللائحة المرقّمة. السابق، من الخروج، يذهب إلى تقرير تقدّم الادخار."
    }),
    intent("why", ["literacy", "inclusion", "poverty", "why this app", "ubukene", "inclusion", "uburezi", "pauvreté", "inclusion", "umaskini", "pobreza", "inclusión", "pobreza", "inclusão", "فقر", "شمول"], {
      en: "The purpose is practice with your own money, so a hard week does not empty the house without warning. You see what came in, what went out, what you kept, and how close a goal is. That is a step toward financial inclusion: a person can keep a clear book without a bank account and without an internet connection. The records stay on this phone.",
      rw: "Intego ni kwitoza ku mafaranga yawe, kugira ngo icyumweru kigoranye kitaguta inyuma utabimenye. Ubona ibyinjiye, ibyasohotse, ibyo wabikije, n'intego igeze he. Iryo ni intambwe yo kwinjiza abantu mu by'imari: umuntu ashobora kubika igitabo gisobanutse nta konti ya banki kandi nta interineti. Inyandiko ziguma kuri iyi telefoni.",
      fr: "Le but est de s'exercer avec son propre argent, pour qu'une semaine difficile ne vide pas la maison sans prévenir. Vous voyez ce qui est entré, ce qui est sorti, ce que vous avez gardé, et où en est un objectif. C'est un pas vers l'inclusion financière : une personne peut tenir un cahier clair sans compte bancaire et sans internet. Les notes restent sur ce téléphone.",
      sw: "Lengo ni mazoezi ya pesa yako, ili wiki ngumu isitie nyumba bila onyo. Unaona kilichoingia, kilichotoka, ulichobaki nacho, na lengo lilipo. Huo ni hatua kuelekea kujumuishwa kifedha: mtu anaweza kuweka daftari wazi bila akaunti ya benki na bila intaneti. Kumbukumbu zinabaki kwenye simu hii.",
      es: "El propósito es practicar con su propio dinero, para que una semana difícil no vacíe la casa sin aviso. Usted ve lo que entró, lo que salió, lo que guardó, y qué tan cerca está una meta. Es un paso hacia la inclusión financiera: una persona puede llevar un cuaderno claro sin cuenta bancaria y sin internet. Los registros se quedan en este teléfono.",
      pt: "O propósito é praticar com o seu próprio dinheiro, para que uma semana difícil não esvazie a casa sem aviso. Vê o que entrou, o que saiu, o que guardou, e quão perto está uma meta. É um passo para a inclusão financeira: uma pessoa pode ter um caderno claro sem conta bancária e sem internet. Os registos ficam neste telemóvel.",
      ar: "الغرض هو التمرين على مالك، حتى لا يفرغ أسبوع صعب البيت دون إنذار. ترى ما دخل، وما خرج، وما أبقيته، ومدى قرب الهدف. هذه خطوة نحو الشمول المالي: يستطيع الشخص أن يحتفظ بدفتر واضح دون حساب بنكي ودون إنترنت. السجلات تبقى على هذا الهاتف."
    })
  ];

  var FALLBACK = {
    en: "I can guide you through this app. Ask about the menu, adding income or expenses, goals, reports, currency, a shared-phone lock, or using it with no internet.",
    rw: "Nshobora kukuyobora muri iyi porogaramu. Baza urutonde, kongeraho ayinjira cyangwa ayasohoka, intego, raporo, ifaranga, ifunga ya telefoni musangiye, cyangwa kuyikoresha nta interineti.",
    fr: "Je peux vous guider dans cette application. Demandez le menu, ajouter un revenu ou une dépense, les objectifs, les rapports, la monnaie, le verrou d'un téléphone partagé, ou l'usage sans internet.",
    sw: "Naweza kukuongoza katika programu hii. Uliza menyu, kuongeza kipato au matumizi, malengo, ripoti, sarafu, kufuli ya simu inayoshirikiwa, au kuitumia bila intaneti.",
    es: "Puedo guiarle en esta aplicación. Pregunte por el menú, agregar un ingreso o un gasto, las metas, los informes, la moneda, el bloqueo de un teléfono compartido, o usarla sin internet.",
    pt: "Posso guiá-lo nesta aplicação. Pergunte pelo menu, adicionar um rendimento ou uma despesa, as metas, os relatórios, a moeda, o trinco de um telemóvel partilhado, ou usá-la sem internet.",
    ar: "أستطيع إرشادك في هذا التطبيق. اسأل عن القائمة، أو إضافة دخل أو مصروف، أو الأهداف، أو التقارير، أو العملة، أو قفل هاتف مشترك، أو الاستخدام دون إنترنت."
  };

  var messages = [];
  var open = false;
  var hear = true;
  var listening = false;
  var recognition = null;
  var heardText = "";
  var voiceError = "";

  var SPEECH_LANG = {
    en: "en-US",
    rw: "rw-RW",
    fr: "fr-FR",
    sw: "sw-KE",
    es: "es-ES",
    pt: "pt-PT",
    ar: "ar"
  };

  function uiText() {
    return UI[lang()];
  }

  function silence() {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }

  function pickVoice(code) {
    if (!window.speechSynthesis) return null;
    var voices = window.speechSynthesis.getVoices() || [];
    var want = (SPEECH_LANG[code] || "en-US").toLowerCase();
    var base = want.split("-")[0];
    var local = voices.filter(function (voice) { return voice.localService; });
    var pool = local.length ? local : voices;
    function matches(voice, exact) {
      var name = (voice.lang || "").toLowerCase();
      return exact ? name === want : name.indexOf(base) === 0;
    }
    var list = pool.filter(function (voice) { return matches(voice, true); });
    if (!list.length) list = pool.filter(function (voice) { return matches(voice, false); });
    list.sort(function (a, b) { return String(a.name).localeCompare(String(b.name)); });
    var deeper = list.filter(function (voice) {
      return /male|david|daniel|fred|alex|ravi|gordon/i.test(voice.name) && !/female/i.test(voice.name);
    });
    return deeper[0] || list[0] || null;
  }

  function primeSpeech() {
    if (!window.speechSynthesis) return;
    var primer = new SpeechSynthesisUtterance(" ");
    primer.volume = 0;
    window.speechSynthesis.speak(primer);
  }

  function speak(text) {
    if (!hear || !text) return;
    if (window.BT.speech) window.BT.speech.say(text, lang());
  }

  function guideNote(kind) {
    var text = uiText()[kind] || uiText().miss;
    messages.push({ role: "guide", text: text });
    paint();
    speak(text);
  }

  function stopListen() {
    if (!recognition) return;
    try { recognition.stop(); } catch (err) { listening = false; }
  }

  function listenTag(fallback) {
    if (fallback) return fallback;
    return window.BT.speech ? window.BT.speech.tag(lang()) : (SPEECH_LANG[lang()] || "en-US");
  }

  function startListen(fallbackTag) {
    var Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Rec) {
      guideNote("unsupported");
      return;
    }
    if (listening) {
      stopListen();
      return;
    }
    silence();
    primeSpeech();
    heardText = "";
    voiceError = "";
    recognition = new Rec();
    recognition.lang = listenTag(fallbackTag);
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = function (event) {
      var parts = [];
      for (var i = 0; i < event.results.length; i++) parts.push(event.results[i][0].transcript);
      heardText = parts.join(" ").trim();
      var input = document.getElementById("guide-input");
      if (input) input.value = heardText;
    };
    recognition.onerror = function (event) {
      voiceError = event && event.error ? event.error : "miss";
    };
    recognition.onend = function () {
      var text = heardText;
      var err = voiceError;
      var used = recognition ? recognition.lang : "";
      heardText = "";
      voiceError = "";
      listening = false;
      recognition = null;
      var input = document.getElementById("guide-input");
      if (input && text) input.value = text;
      paint();
      if (!text && err === "language-not-supported" && used && used.indexOf("-") !== -1 && !fallbackTag) {
        startListen(used.split("-")[0]);
        return;
      }
      if (input) input.value = "";
      if (text) say(text, { spoken: true });
      else if (err === "not-allowed" || err === "service-not-allowed") guideNote("blocked");
      else if (err === "network") guideNote("network");
      else if (err) guideNote("miss");
    };
    listening = true;
    paint();
    try {
      recognition.start();
    } catch (err) {
      listening = false;
      recognition = null;
      paint();
      guideNote("miss");
    }
  }

  function lang() {
    var code = BT.i18n && BT.i18n.current ? BT.i18n.current() : "en";
    return UI[code] ? code : "en";
  }

  function norm(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[’']/g, "")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function pick(map) {
    return map[lang()] || map.en;
  }

  function answer(raw) {
    var q = norm(raw);
    if (!q) return pick(FALLBACK);
    var named = q.indexOf("serieux") !== -1;
    q = q.replace(/ask mr serieux/g, " ").replace(/mr serieux/g, " ").replace(/serieux/g, " ").replace(/\s+/g, " ").trim();
    if (!q) return pick(INTENTS[0].text);
    var winner = null;
    var bestScore = 0;
    var bestLong = 0;
    INTENTS.forEach(function (item) {
      var score = 0;
      var longest = 0;
      item.keys.forEach(function (key) {
        var needle = norm(key);
        if (needle && q.indexOf(needle) !== -1) {
          score += needle.length;
          if (needle.length > longest) longest = needle.length;
        }
      });
      if (score > bestScore || (score === bestScore && score > 0 && longest > bestLong)) {
        bestScore = score;
        bestLong = longest;
        winner = item;
      }
    });
    if (!winner || bestScore < 3) return named ? pick(INTENTS[0].text) : pick(FALLBACK);
    return pick(winner.text);
  }

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function paint() {
    var code = lang();
    var ui = UI[code];
    var button = document.getElementById("ask-guide");
    var label = button && button.querySelector("span");
    if (label) label.textContent = ui.title;
    var title = document.getElementById("guide-title");
    if (title) title.textContent = ui.title;
    var hint = document.getElementById("guide-hint");
    if (hint) hint.textContent = ui.hint;
    var input = document.getElementById("guide-input");
    if (input) input.placeholder = ui.placeholder;
    var send = document.getElementById("guide-send");
    if (send) send.textContent = ui.send;
    var closeBtn = document.getElementById("guide-close");
    if (closeBtn) closeBtn.textContent = ui.close;
    var mic = document.getElementById("guide-mic");
    if (mic) {
      mic.textContent = listening ? ui.listening : ui.mic;
      mic.classList.toggle("is-listening", listening);
      mic.setAttribute("aria-pressed", listening ? "true" : "false");
    }
    var hearBtn = document.getElementById("guide-hear");
    if (hearBtn) {
      hearBtn.textContent = hear ? ui.hearOn : ui.hearOff;
      hearBtn.setAttribute("aria-pressed", hear ? "true" : "false");
    }
    var log = document.getElementById("guide-log");
    if (log) {
      log.innerHTML = messages.map(function (item, index) {
        var who = item.role === "you" ? ui.you : ui.title;
        var extra = item.spoken ? " · " + esc(ui.spoken) : "";
        var replay = item.role === "guide"
          ? '<button type="button" class="guide-replay" data-guide-say="' + index + '">' + esc(ui.replay) + "</button>"
          : "";
        return '<article class="guide-msg guide-' + item.role + '"><small>' + esc(who) + extra + "</small><p>" + esc(item.text) + "</p>" + replay + "</article>";
      }).join("");
      log.scrollTop = log.scrollHeight;
    }
    var chips = document.getElementById("guide-chips");
    if (chips) {
      chips.innerHTML = (SUGGEST[code] || SUGGEST.en).map(function (text) {
        return '<button type="button" class="chip" data-guide-ask="' + esc(text) + '">' + esc(text) + "</button>";
      }).join("");
    }
    var panel = document.getElementById("guide");
    if (panel) panel.hidden = !open;
  }

  function say(text, opts) {
    opts = opts || {};
    var clean = String(text || "").trim();
    if (!clean) return;
    var reply = answer(clean);
    messages.push({ role: "you", text: clean, spoken: !!opts.spoken });
    messages.push({ role: "guide", text: reply });
    paint();
    speak(reply);
  }

  function toggle(force) {
    open = typeof force === "boolean" ? force : !open;
    if (!open) {
      silence();
      if (listening) stopListen();
    }
    var greet = false;
    if (open && !messages.length) {
      messages.push({ role: "guide", text: answer("hello") });
      greet = true;
    }
    paint();
    if (greet) speak(messages[messages.length - 1].text);
    if (open) {
      var input = document.getElementById("guide-input");
      if (input) input.focus();
    }
  }

  function bind() {
    var button = document.getElementById("ask-guide");
    if (button) button.addEventListener("click", function () { toggle(); });
    var closeBtn = document.getElementById("guide-close");
    if (closeBtn) closeBtn.addEventListener("click", function () { toggle(false); });
    var form = document.getElementById("guide-form");
    if (form) form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = document.getElementById("guide-input");
      if (!input) return;
      say(input.value);
      input.value = "";
    });
    var chips = document.getElementById("guide-chips");
    if (chips) chips.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-guide-ask]");
      if (!chip) return;
      say(chip.getAttribute("data-guide-ask"));
    });
    var mic = document.getElementById("guide-mic");
    if (mic) mic.addEventListener("click", startListen);
    var hearBtn = document.getElementById("guide-hear");
    if (hearBtn) hearBtn.addEventListener("click", function () {
      hear = !hear;
      if (!hear) silence();
      paint();
    });
    var log = document.getElementById("guide-log");
    if (log) log.addEventListener("click", function (event) {
      var replay = event.target.closest("[data-guide-say]");
      if (!replay) return;
      var item = messages[Number(replay.getAttribute("data-guide-say"))];
      if (!item) return;
      var was = hear;
      hear = true;
      speak(item.text);
      hear = was;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && open) toggle(false);
    });
    paint();
  }

  function addLanguage(code, pack) {
    if (!code || !pack || !pack.ui) return;
    UI[code] = pack.ui;
    SUGGEST[code] = pack.suggest || SUGGEST.en;
    FALLBACK[code] = pack.fallback || FALLBACK.en;
    (pack.lines || []).forEach(function (line) {
      var item = null;
      var i;
      for (i = 0; i < INTENTS.length; i++) {
        if (INTENTS[i].id === line.id) item = INTENTS[i];
      }
      if (!item) return;
      item.text[code] = line.text;
      if (line.keys && line.keys.length) item.keys = item.keys.concat(line.keys);
    });
  }

  BT.guide = {
    sync: paint,
    answer: answer,
    addLanguage: addLanguage
  };

  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
    else bind();
  }
})();
