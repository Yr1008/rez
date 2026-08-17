/* Rezonate — Privacy Policy language toggle (English ⇄ Brazilian Portuguese).

   Why self-hosted rather than the Google Translate widget: this is the page that
   tells visitors we do not load third-party trackers without consent. Embedding
   Google's translate script here would set cookies and phone home on the one page
   that promises otherwise — and it would need consent-gating, so a visitor who
   declined analytics could not read the policy in their language. Instead the
   pt-BR text ships with the page: no third party, no cookies, no network call,
   and it works with analytics_storage denied.

   Mechanics:
   - Every translatable node carries data-i18n="<key>"; PT holds key -> HTML.
   - The English source is captured from the DOM the first time each key is seen,
     so English is never hard-coded twice and a key missing from PT simply stays
     English (safe fallback if the policy is edited and the translation lags).
   - The DC runtime executes helmet scripts twice and React re-mounts the content
     after hydration, which would silently revert a one-shot swap — so sync() is
     idempotent (writes only when the text differs) and is re-run on mutation and
     on a short interval after load.
   - Choice persists in localStorage and can be linked directly: ?lang=pt
     (so sales can send a Brazilian client straight to the Portuguese version).  */
(function () {
  if (window.__rzI18nPrivacy) return; window.__rzI18nPrivacy = 1;

  var PT = /*__PT_STRINGS__*/{
  "H.entity": "Entidade <span style=\"color:#fff;font-weight:600\">Rezonate Pte Ltd</span>",
  "H.eyebrow": "Jurídico",
  "H.sub": "Como a Rezonate trata suas informações com cuidado: o que coletamos, como usamos e como protegemos.",
  "H.title": "Política de <span class=\"serif-i\" style=\"color:rgba(255,255,255,.55)\">Privacidade</span>",
  "H.updated": "Última atualização <span style=\"color:#fff;font-weight:600\">30 de julho de 2026</span>",
  "L0": "1 · Visão geral",
  "L1": "Bem-vindo ao Rezonate (o \"Aplicativo\") da Rezonate Pte Ltd (\"Rezonate\", \"nós\", \"nos\" e/ou \"nosso(a)\"). Este Site é operado pela Rezonate e foi criado para fornecer informações sobre nossa empresa e nosso serviço, que inclui serviços de busca, criação, comunicação, mensageria e arquivamento de informações em tempo real e sistemas, tecnologias e aplicativos móveis relacionados (juntamente com o Site, o(s) \"Serviço(s)\") aos nossos usuários e visitantes do Serviço (\"você\", \"seu\").",
  "L10": "3 · Como usamos seus dados",
  "L11": "A Rezonate usa os Dados Pessoais e as demais informações que você fornece de maneira compatível com esta Política de Privacidade. Se você fornecer Dados Pessoais para determinada finalidade, poderemos usá-los em conexão com essa finalidade; por exemplo, se você entrar em contato conosco por e-mail, usamos os Dados Pessoais que você fornece para responder à sua pergunta ou resolver seu problema. Se você fornecer Dados Pessoais para obter acesso aos Serviços, os usamos para fornecer esse acesso e para monitorar seu uso.",
  "L12": "A Rezonate e suas subsidiárias e afiliadas também podem usar seus Dados Pessoais e outras informações não identificáveis para nos ajudar a melhorar o conteúdo e a funcionalidade dos Serviços, para entender melhor nossos usuários e para enviar a você dicas sobre o uso do Rezonate ou novidades sobre novos recursos. Qualquer e-mail que enviarmos a você, exceto aqueles necessários para operar o serviço, incluirá um meio de recusar o recebimento de e-mails semelhantes no futuro, e você pode ajustar suas preferências de comunicação por e-mail.",
  "L13": "4 · Cookies &amp; analytics",
  "L14": "Usamos cookies e armazenamento semelhante no navegador apenas conforme descrito abaixo. Os serviços opcionais ficam desativados até que você faça uma escolha em nosso banner de cookies. Você pode recusá-los sem perder o acesso ao site, e pode alterar ou revogar sua escolha a qualquer momento por meio do link <button type=\"button\" class=\"rz-cookie-settings\" onclick=\"window.RZConsent&amp;&amp;window.RZConsent.openSettings()\" style=\"color:var(--amber);text-decoration:underline;text-underline-offset:3px\">Configurações de cookies</button> no rodapé.",
  "L15": "Armazenamento necessário",
  "L16": "Armazenamos um valor de origem própria (first-party) <code>rz_consent</code> por até seis meses para lembrar suas preferências e a versão deste aviso que você aceitou. Ele contém as categorias selecionadas e um registro de data e hora, não o seu nome, endereço de e-mail ou outros dados de contato. Prestadores de serviços de segurança e de entrega também podem usar tecnologias estritamente necessárias para disponibilizar e proteger o site.",
  "L17": "Analytics — opcional",
  "L18": "Com sua permissão, o Google Analytics nos ajuda a entender o uso agregado do site, incluindo páginas visitadas, localização aproximada, informações de dispositivo e navegador e interações com chamadas para ação. O Google Analytics pode gravar os cookies de origem própria (first-party) <code>_ga</code> e <code>_ga_&lt;container-id&gt;</code>, que têm prazo de expiração padrão de dois anos. Desativamos os sinais de publicidade do Google e a personalização de anúncios. O Google Analytics não é carregado antes de você ativar a categoria Analytics.",
  "L19": "Formulários HubSpot — opcional",
  "L2": "Esta Política de Privacidade estabelece a política da Rezonate com relação a informações, incluindo dados de identificação pessoal (\"Dados Pessoais\") e outras informações coletadas de visitantes do Site e de usuários dos Serviços. Desde já, queremos deixar claro que a Rezonate não tem como atividade a venda de suas informações. Consideramos a guarda de suas informações uma parte vital de nosso relacionamento com você. Há, no entanto, determinadas formas pelas quais usaremos seus Dados Pessoais, conforme detalhado nesta política.",
  "L20": "Com sua permissão, o HubSpot fornece nossos formulários de demonstração e de contato. Quando ativado ou quando você opta por ativar um formulário, o HubSpot pode tratar dados de página, dispositivo, endereço IP, envio de formulário e identificadores on-line e pode gravar cookies como <code>hubspotutk</code> e <code>__hstc</code> (até seis meses), <code>__hssc</code> (30 minutos) e <code>__hssrc</code> (a sessão do navegador). O HubSpot não é carregado antes de você ativar a categoria Formulários.",
  "L21": "Alteração da sua escolha",
  "L22": "Recusar ou revogar uma categoria opcional impede que aquele serviço seja carregado nas visualizações de página subsequentes e remove os cookies de origem própria (first-party) acessíveis desse serviço, quando tecnicamente possível. As configurações do seu navegador também podem excluir o armazenamento existente. Podemos solicitar o consentimento novamente se este aviso ou os serviços que utilizamos mudarem substancialmente.",
  "L23": "5 · Informações coletadas para nossos clientes",
  "L24": "A Rezonate coleta informações sob a direção de seus clientes e não tem relação direta com as pessoas cujos Dados Pessoais trata. Se você for cliente final de um de nossos clientes e não desejar mais receber contatos dele, entre em contato diretamente com esse cliente da Rezonate. A pessoa que buscar acessar, corrigir, alterar ou excluir dados inexatos deve encaminhar sua solicitação ao cliente da Rezonate (o controlador desses dados). Se o cliente da Rezonate solicitar que a Rezonate remova os dados, responderemos em até 30 dias. Manteremos os Dados Pessoais que tratamos em nome de nossos clientes pelo tempo necessário para prestar serviços a esse cliente e conforme necessário para cumprir nossas obrigações legais, resolver litígios e fazer cumprir nossos contratos.",
  "L25": "6 · Usuários corporativos",
  "L26": "Se a sua empresa tiver uma conta corporativa para os Serviços, nosso contrato com sua empresa poderá conter termos adicionais relativos ao nosso uso e divulgação de dados, incluindo Dados Pessoais. O administrador da sua empresa poderá ter determinados direitos de acessar suas informações em conexão com os Serviços e de definir as políticas da sua empresa quanto ao seu uso. Consulte o administrador da sua empresa caso tenha dúvidas a respeito de qualquer um dos pontos acima.",
  "L27": "7 · Crianças",
  "L28": "Por ser um Serviço direcionado a usuários corporativos adultos, a Rezonate não coleta conscientemente Dados Pessoais de crianças menores de 13 anos. Crianças não devem usar o Serviço nem enviar quaisquer Dados Pessoais por meio dele. Se você acreditar que uma criança menor de 13 anos forneceu Dados Pessoais à Rezonate por meio dos Serviços, entre em contato conosco e envidaremos esforços para excluir essas informações de nossos bancos de dados.",
  "L29": "8 · Outros serviços",
  "L3": "2 · Informações que coletamos",
  "L30": "Esta Política de Privacidade se aplica somente aos Serviços. Os Serviços podem conter links para, ou integrações com, outros sites e serviços não operados nem controlados pela Rezonate (os \"Terceiros\"). As políticas e os procedimentos aqui descritos não se aplicam aos Terceiros, e não endossamos esses Terceiros nem seus produtos ou serviços. Entre em contato diretamente com esses Terceiros para obter informações sobre suas políticas de privacidade.",
  "L31": "9 · Retenção de dados",
  "L32": "Manteremos seus Dados Pessoais enquanto sua conta estiver ativa ou conforme necessário para lhe prestar serviços. Manteremos e usaremos seus Dados Pessoais conforme necessário para cumprir nossas obrigações legais, resolver litígios e fazer cumprir nossos contratos.",
  "L33": "10 · Depoimentos",
  "L34": "Exibimos depoimentos pessoais de clientes satisfeitos em nosso site, além de outros endossos. Com seu consentimento, poderemos publicar seu depoimento juntamente com seu nome. Se você desejar atualizar ou excluir seu depoimento, poderá entrar em contato conosco pelo e-mail <a href=\"mailto:hello@getrezonate.com\" style=\"color:var(--amber);text-decoration:none;cursor:pointer\">hello<span aria-hidden=\"true\">@</span>getrezonate.com</a>.",
  "L35": "11 · Segurança",
  "L36": "A Rezonate adota medidas razoáveis para proteger os Dados Pessoais fornecidos por meio dos Serviços contra perda, uso indevido e acesso ou divulgação não autorizados. Quando você insere informações confidenciais, como credenciais de login, criptografamos a transmissão dessas informações utilizando a tecnologia secure socket layer (SSL). Seguimos padrões geralmente aceitos para proteger os Dados Pessoais que nos são enviados, tanto durante a transmissão quanto depois que os recebemos. No entanto, nenhuma transmissão eletrônica ou mecanismo de armazenamento digital jamais é totalmente seguro ou livre de erros, portanto você deve ter cuidado especial ao decidir quais informações você compartilha eletronicamente no âmbito do Serviço.",
  "L37": "12 · Dados Pessoais que você fornece",
  "L38": "Coletamos seus Dados Pessoais, como seu nome, endereço de e-mail e nome da empresa, quando você os fornece voluntariamente, por exemplo, quando entra em contato conosco com solicitações, se registra para obter acesso ao nosso Serviço, ou usa determinados Serviços. Também podemos coletar as informações do seu cartão de pagamento caso você decida migrar para um plano superior. Ao nos fornecer Dados Pessoais, você consente com nosso uso deles de acordo com esta Política de Privacidade, e reconhece que eles podem ser armazenados nos servidores da Rezonate e de outras partes autorizadas localizados em qualquer país. Quando você baixa e usa nossos Serviços, coletamos automaticamente informações sobre o tipo de dispositivo que você usa, a versão do sistema operacional e o identificador do dispositivo.",
  "L39": "13 · Alterações nesta política",
  "L4": "Quando você interage conosco por meio dos Serviços, podemos coletar de você Dados Pessoais e outras informações. Em determinadas circunstâncias, podemos compartilhar seus Dados Pessoais com determinados terceiros sem aviso adicional a você, conforme estabelecido abaixo:",
  "L40": "Os Serviços e nosso negócio podem mudar de tempos em tempos, e pode ser necessário que a Rezonate faça alterações nesta Política de Privacidade. Reservamo-nos o direito de atualizar ou modificar esta Política de Privacidade a qualquer momento, sem aviso prévio. No entanto, se fizermos uma alteração que tenha impacto relevante sobre seus direitos ou sobre a forma como coletamos ou usamos seus Dados Pessoais, envidaremos esforços para avisar você (por exemplo, por e-mail ou publicando um aviso no Site) antes de a alteração entrar em vigor. Seu uso continuado dos Serviços após quaisquer alterações indica sua concordância com a política revisada. Seu acesso aos Serviços e seu uso deles também estão sujeitos aos nossos <a href=\"Terms.dc.html\">Termos de Serviço</a>.",
  "L41": "14 · Contato com a Rezonate",
  "L42": "Sinta-se à vontade para entrar em contato conosco caso tenha qualquer dúvida sobre a Política de Privacidade da Rezonate ou sobre as práticas de informação dos Serviços. Você pode entrar em contato conosco pelo e-mail <a href=\"mailto:hello@getrezonate.com\" style=\"color:var(--amber);text-decoration:none;cursor:pointer\">hello<span aria-hidden=\"true\">@</span>getrezonate.com</a>, ou escrever para nós no endereço 1 North Bridge Road, #08-08, Singapore 179094.",
  "L5": "<b>Seu uso:</b> Exibiremos seus Dados Pessoais no Serviço (por exemplo, em uma página de perfil) de acordo com as preferências que você definir em sua conta. Considere cuidadosamente quais informações você divulga e o nível de privacidade que deseja; quando você compartilha informações com outras pessoas, essas informações podem ser ampla e rapidamente disseminadas.",
  "L6": "<b>Transferências empresariais:</b> À medida que desenvolvemos nossos negócios, podemos vender ou comprar negócios ou ativos. Em uma venda societária, fusão, reorganização, dissolução ou evento semelhante, os Dados Pessoais poderão fazer parte dos ativos transferidos. Você será notificado por e-mail e/ou por um aviso destacado em nosso site sobre qualquer alteração na propriedade ou nos usos de seus Dados Pessoais.",
  "L7": "<b>Empresas relacionadas:</b> Também podemos compartilhar seus Dados Pessoais com nossas empresas relacionadas para finalidades compatíveis com esta Política de Privacidade.",
  "L8": "<b>Consultores e terceiros similares:</b> Às vezes contratamos outras empresas para desempenhar funções relacionadas aos negócios, tais como envio de informações por correspondência, hospedagem de servidores, prestação de serviços de data center, manutenção de bancos de dados e processamento de pagamentos. Elas recebem apenas as informações necessárias para desempenhar sua função específica e estão autorizadas a usá-las somente na medida do necessário para nos prestar serviços.",
  "L9": "<b>Exigências legais:</b> Poderemos divulgar seus Dados Pessoais se formos obrigados a fazê-lo por lei ou na crença de boa-fé de que tal medida é necessária para (i) cumprir uma obrigação legal, (ii) proteger e defender os direitos ou a propriedade da Rezonate ou de terceiros, (iii) agir em circunstâncias urgentes para proteger a segurança pessoal dos usuários ou do público, ou (iv) proteger contra responsabilidade legal.",
  "TOC.label": "Nesta página",
  "TOC0": "1 · Visão geral",
  "TOC1": "2 · Informações que coletamos",
  "TOC10": "11 · Segurança",
  "TOC11": "12 · Dados que você fornece",
  "TOC12": "13 · Alterações nesta política",
  "TOC13": "14 · Contato",
  "TOC2": "3 · Como usamos seus dados",
  "TOC3": "4 · Cookies &amp; analytics",
  "TOC4": "5 · Informações coletadas para clientes",
  "TOC5": "6 · Usuários corporativos",
  "TOC6": "7 · Crianças",
  "TOC7": "8 · Outros serviços",
  "TOC8": "9 · Retenção de dados",
  "TOC9": "10 · Depoimentos"
};

  var STORE = 'rz_lang';
  var EN = {};                 /* key -> English HTML, captured from the DOM */
  var lang = 'en';

  function nodes() { return document.querySelectorAll('[data-i18n]'); }

  function readPref() {
    try {
      var q = (location.search.match(/[?&]lang=([a-z-]+)/i) || [])[1];
      if (q) return /^pt/i.test(q) ? 'pt' : 'en';
    } catch (_) {}
    try { var v = localStorage.getItem(STORE); if (v) return v === 'pt' ? 'pt' : 'en'; } catch (_) {}
    return 'en';
  }

  /* Convenience-translation notice. Required: a machine-assisted translation of a
     legal document must not read as the authoritative text. */
  var NOTE_ID = 'rz-i18n-note';
  var NOTE_HTML =
    '<strong style="font-weight:600;color:var(--ink)">Tradução de cortesia.</strong> ' +
    'Esta versão em português é uma tradução livre, fornecida exclusivamente para facilitar a leitura, ' +
    'e não constitui tradução juramentada. A versão oficial e juridicamente vinculante desta Política de ' +
    'Privacidade é a versão em inglês: ' +
    '<a href="?lang=en" data-rz-lang-set="en" style="color:var(--accent);text-decoration:underline">Ler em inglês</a>. ' +
    'Em caso de qualquer divergência, discrepância, omissão, erro de tradução ou dúvida de interpretação ' +
    'entre as duas versões, prevalecerá a versão em inglês. Esta tradução não cria, amplia nem limita ' +
    'quaisquer direitos ou obrigações. Versão em inglês vigente em: 30/07/2026.';

  function syncNote() {
    var have = document.getElementById(NOTE_ID);
    if (lang !== 'pt') { if (have && have.parentNode) have.parentNode.removeChild(have); return; }
    if (have) return;
    var first = document.querySelector('[data-i18n^="L"]');
    if (!first) return;
    var host = first.parentNode; if (!host) return;
    var d = document.createElement('div');
    d.id = NOTE_ID;
    d.setAttribute('role', 'note');
    d.style.cssText = 'margin:0 0 26px;padding:14px 16px;border-radius:14px;background:rgba(226,104,62,.07);' +
      'border:1px solid rgba(226,104,62,.28);color:var(--ink-2);font-size:14px;line-height:1.55';
    d.innerHTML = NOTE_HTML;
    host.insertBefore(d, first);
  }

  var HAS_PT = (function () { for (var k in PT) if (Object.prototype.hasOwnProperty.call(PT, k)) return true; return false; })();

  function syncButton() {
    /* No dictionary shipped -> never reveal the control. Guarantees the switch can
       never be a control that does nothing (e.g. if this file is deployed before the
       translations are injected). */
    if (!HAS_PT) return;
    var groups = document.querySelectorAll('[data-rz-lang-switch]');
    for (var g = 0; g < groups.length; g++) {
      var box = groups[g];
      box.removeAttribute('hidden');
      var segs = box.querySelectorAll('[data-rz-lang-set]');
      var active = null;
      for (var i = 0; i < segs.length; i++) {
        var on = segs[i].getAttribute('data-rz-lang-set') === lang;
        if (on) active = segs[i];
        if (segs[i].getAttribute('data-on') !== (on ? '1' : '0')) segs[i].setAttribute('data-on', on ? '1' : '0');
        /* aria-pressed makes this read as a toggle to assistive tech, and the
           per-segment lang attribute stops a screen reader saying "Português"
           with an English voice. */
        if (segs[i].getAttribute('aria-pressed') !== String(on)) segs[i].setAttribute('aria-pressed', String(on));
      }
      /* Slide the indicator onto the active segment. offsetLeft is relative to the
         track, which is position:relative — measured live so it stays correct after
         a font swap or resize changes the label widths. */
      var pill = box.querySelector('.rz-langsw-pill');
      if (pill && active) {
        var left = active.offsetLeft + 'px', width = active.offsetWidth + 'px';
        if (pill.style.left !== left) pill.style.left = left;
        if (pill.style.width !== width) pill.style.width = width;
        if (pill.style.opacity !== '1') pill.style.opacity = '1';
      }
    }
  }

  /* The consent banner (rz/consent.js) injects a "Cookie settings" link into the
     footer, and this policy tells the reader to use it by name. If the policy is in
     Portuguese and the control is in English, the instruction has no referent — and
     under LGPD art. 8 an instruction the reader cannot follow weakens the claim that
     consent was informed. Relabel it here rather than editing consent.js, so all
     translation logic stays in one file and the consent component is untouched. */
  function syncConsentLink() {
    var b = document.querySelector('[data-rz-cookie-settings-footer]');
    if (!b) return;
    var text = lang === 'pt' ? 'Configurações de cookies' : 'Cookie settings';
    if (b.textContent !== text) b.textContent = text;
  }

  /* Set while we are writing, so the MutationObserver ignores our OWN mutations.
     Without this the observer re-entered sync() on every write and fought React
     mid-hydration, leaving the page blank when it loaded straight into Portuguese
     (?lang=pt). Toggling after load was fine because hydration had finished. */
  var applying = false;
  var ready = false;      /* true once the DC stream has settled — see boot below */

  function sync() {
    if (!ready || applying) return;
    applying = true;
    try {
      var list = nodes();
      for (var i = 0; i < list.length; i++) {
        var el = list[i], k = el.getAttribute('data-i18n');
        if (EN[k] == null) EN[k] = el.innerHTML;      /* first sight = English source */
        var want = (lang === 'pt' && PT[k] != null) ? PT[k] : EN[k];
        if (el.innerHTML !== want) el.innerHTML = want;   /* idempotent: no churn */
      }
      try { document.documentElement.setAttribute('lang', lang === 'pt' ? 'pt-BR' : 'en'); } catch (_) {}
      syncNote();
      syncButton();
      syncConsentLink();
    } finally {
      /* Release on the next tick: the observer delivers our writes asynchronously,
         so clearing synchronously would still let them re-enter. */
      setTimeout(function () { applying = false; }, 0);
    }
  }

  function set(next, persist) {
    ready = true;         /* a click can only happen after the page rendered */
    lang = next === 'pt' ? 'pt' : 'en';
    if (persist !== false) { try { localStorage.setItem(STORE, lang); } catch (_) {} }
    sync();
  }

  /* Delegated so it survives re-mounts and covers the in-notice "Ler em inglês" link. */
  document.addEventListener('click', function (e) {
    if (!e.target || !e.target.closest) return;
    var setter = e.target.closest('[data-rz-lang-set]');
    if (setter) { e.preventDefault(); set(setter.getAttribute('data-rz-lang-set')); return; }
    var t = e.target.closest('[data-rz-lang-toggle]');
    if (!t) return;
    e.preventDefault();
    set(lang === 'pt' ? 'en' : 'pt');
  }, true);

  lang = readPref();

  /* Do NOT translate while the DC runtime is still streaming the document in.
     Writing innerHTML into nodes React has not finished mounting corrupts the
     stream and the page renders blank — which is exactly what happened when the
     page was opened directly in Portuguese (?lang=pt). Loading in English hid the
     bug, because then every computed value equals what is already there and no
     write ever happens. So: wait until the translatable node count has held steady
     across consecutive polls AND the document has finished loading, then translate. */
  var STABLE_POLLS = 3, seen = -1, steady = 0;
  var boot = setInterval(function () {
    var n = nodes().length;
    steady = (n > 0 && n === seen) ? steady + 1 : 0;
    seen = n;
    if (steady >= STABLE_POLLS && document.readyState === 'complete') {
      clearInterval(boot);
      ready = true;
      sync();
      /* Content can still re-mount once after hydration; keep it in sync for a
         short window. sync() only writes on change, so this is cheap. */
      var iv = setInterval(sync, 400);
      setTimeout(function () { clearInterval(iv); }, 10000);
      try {
        var mo = new MutationObserver(function () { sync(); });
        mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
        setTimeout(function () { try { mo.disconnect(); } catch (_) {} }, 12000);
      } catch (_) {}
    }
  }, 150);
  setTimeout(function () {                      /* failsafe: never stay untranslated */
    if (!ready) { clearInterval(boot); ready = true; sync(); }
  }, 15000);

  window.addEventListener('resize', syncButton, { passive: true });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { syncButton(); }).catch(function () {});
  }

  window.RZLang = { set: set, get: function () { return lang; } };
})();
