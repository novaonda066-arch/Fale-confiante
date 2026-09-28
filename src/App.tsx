import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bot,
  Check,
  ChevronRight,
  CirclePlay,
  Flame,
  Gauge,
  Home,
  Library,
  Mic,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Square,
  Timer,
  Trophy,
  UserRound,
  Volume2,
  X,
} from "lucide-react";
import "./styles.css";

type Page = "inicio" | "aprender" | "treinar" | "treinador" | "biblioteca" | "progresso" | "perfil";

type Lesson = {
  day: number;
  week: number;
  title: string;
  objective: string;
  blocks: string[];
  exercise: string;
};

type Training = {
  id: string;
  day: number;
  duration: number;
  score: number;
  createdAt: string;
  demo: boolean;
};

type AppState = {
  name: string;
  currentDay: number;
  streak: number;
  completedLessons: number[];
  trainings: Training[];
  coachMessages: { role: "user" | "assistant"; content: string }[];
};

const lessons: Lesson[] = ([
  ["Respiração e presença", "Aprende a baixar a tensão antes de começar a falar.", ["Antes de falar, abranda. A respiração influencia a velocidade e a sensação de controlo.", "Inspira pelo nariz durante quatro segundos, mantém por quatro e expira durante seis.", "Ao expirar, relaxa os ombros e a mandíbula. O objectivo não é respirar fundo à força, mas criar um ritmo estável."], "Grava 20 segundos a apresentar-te depois de fazeres três ciclos de respiração."],
  ["Postura que transmite segurança", "Usa o corpo para apoiar a tua mensagem.", ["Mantém os pés estáveis e evita balançar o corpo sem necessidade.", "Abre o peito sem exagerar e deixa os ombros soltos.", "Uma postura estável ajuda a voz a sair com menos tensão e torna os gestos mais claros."], "Fala durante 30 segundos mantendo os pés firmes e a cabeça levantada."],
  ["Contacto visual", "Aprende a distribuir a atenção pelo público.", ["Não precisas de olhar fixamente para uma pessoa.", "Escolhe diferentes pontos da sala e permanece alguns segundos em cada um.", "O contacto visual deve acompanhar a ideia, não competir com ela."], "Explica um tema simples olhando para três pontos diferentes à tua frente."],
  ["Ritmo e velocidade", "Evita falar depressa quando estás nervoso.", ["Quando aceleramos, as palavras perdem espaço e o público tem menos tempo para acompanhar.", "Experimenta terminar cada frase e fazer uma pequena pausa antes da seguinte.", "Ritmo não é falar devagar; é variar a velocidade com intenção."], "Lê um pequeno texto e coloca uma pausa entre cada frase."],
  ["Pausas com intenção", "Transforma o silêncio numa ferramenta.", ["Uma pausa antes de uma ideia importante cria atenção.", "Uma pausa depois de uma frase permite que a mensagem seja compreendida.", "Não tenhas pressa de preencher todos os silêncios."], "Faz uma apresentação de 30 segundos usando pelo menos três pausas conscientes."],
  ["Clareza na fala", "Faz com que as palavras sejam fáceis de acompanhar.", ["A clareza começa com frases simples e uma pronúncia cuidada.", "Evita juntar várias ideias numa única frase.", "Articula as palavras sem exagerar o movimento da boca."], "Explica como preparar um café usando frases curtas e claras."],
  ["Volume e projeção", "Faz a voz chegar ao público sem gritar.", ["A voz deve ser suficientemente forte para o espaço.", "Projecta a voz para a pessoa mais distante, em vez de aumentar apenas a tensão na garganta.", "Experimenta falar apoiado na respiração e com o rosto relaxado."], "Diz a mesma frase em volume baixo, médio e adequado para uma sala."],
  ["Articulação", "Melhora a definição das palavras.", ["Antes de apresentar, aquece a boca e a língua.", "Fala um pouco mais devagar nas palavras difíceis.", "Clareza é mais importante do que velocidade."], "Repete um trava-línguas lentamente e depois em ritmo natural."],
  ["Organizar ideias", "Cria uma estrutura simples para não te perderes.", ["Uma apresentação pode começar com a ideia principal, seguir com dois ou três pontos e terminar com uma conclusão.", "Quando sabes para onde vais, precisas de memorizar menos frases.", "Pensa em palavras-chave em vez de decorar tudo."], "Fala sobre um tema usando: início, dois pontos e conclusão."],
  ["Aberturas fortes", "Começa de forma clara e interessante.", ["Os primeiros segundos ajudam o público a decidir se vai prestar atenção.", "Podes começar com uma pergunta, uma situação, uma afirmação ou uma história curta.", "Evita gastar demasiado tempo em introduções vagas."], "Cria três aberturas diferentes para o mesmo tema."],
  ["Fechos memoráveis", "Termina com uma ideia que fica.", ["Recapitula a mensagem principal.", "Podes terminar com uma acção, uma frase forte ou uma pergunta.", "Não enfraqueças o final com pedidos de desculpa ou frases inseguras."], "Faz uma conclusão de 20 segundos para um tema à tua escolha."],
  ["Gestos naturais", "Usa as mãos para reforçar o que dizes.", ["Os gestos devem acompanhar a ideia.", "Evita mexer nas mãos apenas por nervosismo.", "Gestos simples e abertos costumam ser mais fáceis de controlar."], "Apresenta três pontos e usa um gesto diferente para cada um."],
  ["Expressão facial", "Alinha o rosto com a tua mensagem.", ["O público percebe emoções através do rosto.", "Procura uma expressão natural e coerente com o assunto.", "Evita sorrir constantemente quando a mensagem pede seriedade."], "Conta uma história curta usando expressão facial compatível com cada momento."],
  ["Confiança sem fingimento", "Troca a ideia de parecer perfeito pela de estar presente.", ["Confiança não significa nunca sentir nervosismo.", "Significa conseguir continuar mesmo quando sentes alguma tensão.", "Foca-te em comunicar a ideia, não em controlar cada pequeno detalhe."], "Grava uma fala de um minuto sem repetir a gravação."],
  ["Improvisação", "Aprende a responder sem um texto preparado.", ["Improvisar fica mais fácil quando tens uma estrutura mental simples.", "Podes responder com: situação, ideia principal, exemplo e conclusão.", "Não precisas de uma resposta perfeita à primeira."], "Escolhe um objecto à tua frente e fala sobre ele durante 45 segundos."],
  ["Contar histórias", "Torna a mensagem mais humana.", ["Uma história simples pode ter contexto, acontecimento e resultado.", "Inclui detalhes suficientes para criar imagem, sem tornar a narrativa longa.", "Fala como quem conta algo a uma pessoa, não como quem recita um texto."], "Conta um pequeno acontecimento do teu dia com início, meio e fim."],
  ["Exemplos que explicam", "Usa exemplos para tornar ideias abstractas mais concretas.", ["Depois de uma ideia, pergunta: 'Como é que isto aparece na vida real?'.", "Um exemplo curto pode explicar melhor do que várias definições.", "Escolhe exemplos próximos da realidade do teu público."], "Explica um conceito simples e acrescenta dois exemplos."],
  ["Perguntas do público", "Responde com calma quando alguém te interrompe.", ["Ouve a pergunta completa antes de responder.", "Podes repetir ou resumir a pergunta para confirmar o que foi pedido.", "Se não souberes, assume isso e explica como procurarias a resposta."], "Responde em voz alta a três perguntas que imagines que o público faria."],
  ["Comunicação em reuniões", "Fala de forma objectiva em pouco tempo.", ["Começa pelo ponto principal.", "Apresenta apenas a informação que ajuda a decisão.", "Termina com o que precisas do grupo ou qual é o próximo passo."], "Explica um problema e propõe uma solução em 45 segundos."],
  ["Entrevistas", "Comunica experiência com estrutura.", ["Responde primeiro à pergunta.", "Depois dá um exemplo concreto.", "Fecha com o resultado ou aprendizagem."], "Responde a: 'Fala-me de uma situação em que tiveste de resolver um problema.'"],
  ["Apresentações escolares", "Apresenta conteúdo sem depender da leitura.", ["Usa palavras-chave para te guiares.", "Olha para as pessoas em vez de leres cada frase.", "Explica conceitos como se estivesses a ensinar alguém."], "Explica um conteúdo de estudo durante um minuto sem ler."],
  ["Apresentações profissionais", "Dá estrutura a mensagens de trabalho.", ["Define o problema, a proposta e o impacto.", "Corta informação que não ajuda a decisão.", "Usa números ou exemplos quando forem relevantes."], "Apresenta uma ideia profissional em três partes: problema, solução, benefício."],
  ["Persuasão ética", "Defende uma ideia sem pressionar.", ["Explica a necessidade antes da solução.", "Mostra razões e exemplos.", "Respeita o direito da outra pessoa discordar."], "Tenta convencer alguém de uma ideia simples usando duas razões e um exemplo."],
  ["Linguagem simples", "Troca palavras complicadas por frases compreensíveis.", ["Comunicação forte não precisa de palavras difíceis.", "Escolhe a expressão que o teu público entende mais depressa.", "Evita jargão quando não acrescenta precisão."], "Explica um assunto que conheces como se estivesses a falar com um adolescente."],
  ["Voz em situações de pressão", "Mantém o ritmo quando as emoções sobem.", ["Quando a pressão aumenta, volta à respiração e às pausas.", "Faz a primeira frase mais devagar.", "Concentra-te no próximo ponto, não no erro anterior."], "Simula uma apresentação difícil e começa deliberadamente mais devagar."],
  ["Corrigir erros ao vivo", "Recupera sem perder a presença.", ["Todos podem trocar uma palavra ou esquecer uma frase.", "Corrige de forma simples e continua.", "Evita pedir desculpa repetidamente pelo erro."], "Inclui de propósito um pequeno erro e pratica a recuperação natural."],
  ["Preparação antes de falar", "Cria uma rotina curta antes de qualquer apresentação.", ["Define a mensagem principal.", "Revê três palavras-chave.", "Faz dois ciclos de respiração e começa com a primeira frase já definida."], "Cria e grava a tua própria rotina de 60 segundos antes de falar."],
  ["Treino de discurso completo", "Liga as competências num único exercício.", ["Combina postura, contacto visual, ritmo, pausas e estrutura.", "Não procures perfeição numa única tentativa.", "Depois do treino, escolhe apenas um ponto para melhorar."], "Faz uma fala de dois minutos usando pelo menos cinco competências desta jornada."],
  ["Discurso final: fala com confiança", "Fecha os 30 dias com uma apresentação completa.", ["Escolhe um assunto que conheces.", "Organiza uma abertura, três ideias e um fecho.", "Fala com calma e aceita que pequenos erros fazem parte da comunicação real."], "Grava um discurso de três minutos e compara-o com o teu primeiro treino."],
].map((x, i) => ({
  day: i + 1,
  week: Math.ceil((i + 1) / 7),
  title: x[0],
  objective: x[1],
  blocks: x[2],
  exercise: x[3],
} as Lesson));

const defaultState: AppState = {
  name: "Humberto",
  currentDay: 1,
  streak: 0,
  completedLessons: [],
  trainings: [],
  coachMessages: [
    {
      role: "assistant",
      content: "Olá. Sou o teu treinador de comunicação. Diz-me em que situação queres falar com mais confiança e vamos trabalhar isso juntos.",
    },
  ],
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem("fale-confiante-state");
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

function formatDuration(seconds: number) {
  const min = Math.floor(seconds / 60).toString().padStart(2, "0");
  const sec = Math.floor(seconds % 60).toString().padStart(2, "0");
  return min + ":" + sec;
}

function speakText(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  let index = 0;
  const playNext = () => {
    if (index >= chunks.length) return;
    const u = new SpeechSynthesisUtterance(chunks[index++]);
    u.lang = "pt-PT";
    u.rate = 0.95;
    u.pitch = 0.95;
    u.onend = playNext;
    window.speechSynthesis.speak(u);
  };
  playNext();
}

function SpeechControl({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      window.speechSynthesis?.cancel();
    };
  }, []);

  function start() {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const chunks = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
    let i = 0;
    const next = () => {
      if (i >= chunks.length) {
        setPlaying(false);
        setPaused(false);
        return;
      }
      const u = new SpeechSynthesisUtterance(chunks[i++]);
      u.lang = "pt-PT";
      u.rate = 0.95;
      u.pitch = 0.95;
      u.onstart = () => {
        setPlaying(true);
        setPaused(false);
      };
      u.onend = next;
      u.onerror = () => {
        setPlaying(false);
        setPaused(false);
      };
      window.speechSynthesis.speak(u);
    };
    next();
  }

  function togglePause() {
    if (!("speechSynthesis" in window) || !playing) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPaused(false);
    } else {
      window.speechSynthesis.pause();
      setPaused(true);
    }
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setPlaying(false);
    setPaused(false);
  }

  return (
    <div className="speech-control">
      {!playing ? (
        <button className="ghost-button" onClick={start}><Volume2 size={16} /> Ouvir</button>
      ) : (
        <>
          <button className="ghost-button" onClick={togglePause}>{paused ? <Play size={16} /> : <Pause size={16} />} {paused ? "Continuar" : "Pausar"}</button>
          <button className="ghost-button" onClick={stop}><Square size={14} /> Parar</button>
        </>
      )}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof Flame; value: string; label: string }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={18} /></div>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState<Page>("inicio");
  const [state, setState] = useState<AppState>(loadState);
  const [selectedDay, setSelectedDay] = useState(state.currentDay);
  const [trainingOpen, setTrainingOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("fale-confiante-state", JSON.stringify(state));
  }, [state]);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const currentLesson = lessons.find((l) => l.day === state.currentDay) ?? lessons[0];
  const averageScore = state.trainings.length
    ? Math.round(state.trainings.reduce((sum, x) => sum + x.score, 0) / state.trainings.length)
    : 0;
  const progress = Math.round((state.completedLessons.length / 30) * 100);

  function completeLesson(day: number) {
    setState((s) => ({
      ...s,
      completedLessons: Array.from(new Set([...s.completedLessons, day])),
      currentDay: Math.min(30, Math.max(s.currentDay, day + 1)),
      streak: Math.max(s.streak, day),
    }));
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-mark">FC</div>
        <div>
          <div className="brand-name">Fale Confiante</div>
          <div className="brand-caption">Treino diário de comunicação</div>
        </div>
        <button className="icon-button" onClick={() => setPage("perfil")} aria-label="Perfil"><UserRound size={20} /></button>
      </header>

      <main className="page-content">
        {page === "inicio" && (
          <HomePage
            state={state}
            currentLesson={currentLesson}
            progress={progress}
            averageScore={averageScore}
            onLearn={() => { setSelectedDay(state.currentDay); setPage("aprender"); }}
            onTrain={() => { setSelectedDay(state.currentDay); setPage("treinar"); }}
            onCoach={() => setPage("treinador")}
            onLibrary={() => setPage("biblioteca")}
          />
        )}

        {page === "aprender" && (
          <LearnPage
            day={selectedDay}
            completed={state.completedLessons.includes(selectedDay)}
            onBack={() => setPage("inicio")}
            onSelectDay={setSelectedDay}
            onComplete={() => completeLesson(selectedDay)}
          />
        )}

        {page === "treinar" && (
          <TrainPage
            day={selectedDay}
            onBack={() => setPage("inicio")}
            onFinished={(training) => setState((s) => ({ ...s, trainings: [training, ...s.trainings] }))}
          />
        )}

        {page === "treinador" && (
          <CoachPage
            messages={state.coachMessages}
            onBack={() => setPage("inicio")}
            onMessage={(message) => setState((s) => ({ ...s, coachMessages: [...s.coachMessages, message] }))}
          />
        )}

        {page === "biblioteca" && <LibraryPage onBack={() => setPage("inicio")} onOpen={(day) => { setSelectedDay(day); setPage("aprender"); }} />}

        {page === "progresso" && <ProgressPage state={state} averageScore={averageScore} progress={progress} onBack={() => setPage("inicio")} />}

        {page === "perfil" && (
          <ProfilePage state={state} onBack={() => setPage("inicio")} onSave={(name) => setState((s) => ({ ...s, name }))} />
        )}
      </main>

      <nav className="bottom-nav">
        <NavItem icon={Home} label="Início" active={page === "inicio"} onClick={() => setPage("inicio")} />
        <NavItem icon={BookOpen} label="Aprender" active={page === "aprender"} onClick={() => { setSelectedDay(state.currentDay); setPage("aprender"); }} />
        <NavItem icon={Mic} label="Treinar" active={page === "treinar"} onClick={() => { setSelectedDay(state.currentDay); setPage("treinar"); }} />
        <NavItem icon={Bot} label="Treinador" active={page === "treinador"} onClick={() => setPage("treinador")} />
        <NavItem icon={Library} label="Biblioteca" active={page === "biblioteca"} onClick={() => setPage("biblioteca")} />
      </nav>

      {trainingOpen && <div />}
    </div>
  );
}

function NavItem({ icon: Icon, label, active, onClick }: { icon: typeof Home; label: string; active: boolean; onClick: () => void }) {
  return <button className={"nav-item" + (active ? " active" : "")} onClick={onClick}><Icon size={19} /><span>{label}</span></button>;
}

function HomePage({
  state, currentLesson, progress, averageScore, onLearn, onTrain, onCoach, onLibrary,
}: {
  state: AppState; currentLesson: Lesson; progress: number; averageScore: number;
  onLearn: () => void; onTrain: () => void; onCoach: () => void; onLibrary: () => void;
}) {
  return (
    <>
      <section className="hero-card">
        <div className="hero-copy">
          <div className="eyebrow">Programa de 30 dias</div>
          <h1>Olá, {state.name}.</h1>
          <p>Vamos treinar hoje e transformar prática em confiança.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={onLearn}>Aprender a lição <ChevronRight size={17} /></button>
            <button className="secondary-button" onClick={onTrain}>Começar treino</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-ring" />
          <div className="hero-person">
            <img src="https://id-preview--5c4c3402-ff2a-4265-9d7c-5ceb7d1581af.lovable.app/assets/hero-speaking-B36wYdp_.jpg" alt="Pessoa a falar com confiança" />
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <Stat icon={Flame} value={String(state.streak)} label="dias seguidos" />
        <Stat icon={Trophy} value={String(state.trainings.length)} label="treinos" />
        <Stat icon={Gauge} value={String(averageScore)} label="nota média" />
      </section>

      <section className="progress-panel">
        <div className="panel-title-row"><div><span className="muted">O teu percurso</span><h2>Dia {state.currentDay} de 30</h2></div><strong>{progress}%</strong></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: progress + "%" }} /></div>
        <p className="muted">{30 - state.completedLessons.length} lições por completar.</p>
      </section>

      <section className="today-card">
        <div className="section-kicker">LIÇÃO DE HOJE</div>
        <div className="day-badge">Dia {currentLesson.day}</div>
        <h2>{currentLesson.title}</h2>
        <p>{currentLesson.objective}</p>
        <button className="text-button" onClick={onLearn}>Abrir lição <ChevronRight size={16} /></button>
      </section>

      <section className="shortcut-grid">
        <button className="shortcut-card" onClick={onTrain}><div className="shortcut-icon"><Mic size={19} /></div><div><strong>Treinar</strong><span>Grava o exercício do dia.</span></div><ChevronRight size={18} /></button>
        <button className="shortcut-card" onClick={onCoach}><div className="shortcut-icon purple"><Bot size={19} /></div><div><strong>Treinador</strong><span>Conversa e recebe orientação.</span></div><ChevronRight size={18} /></button>
        <button className="shortcut-card" onClick={onLibrary}><div className="shortcut-icon gold"><Library size={19} /></div><div><strong>Biblioteca</strong><span>Vê todas as lições.</span></div><ChevronRight size={18} /></button>
      </section>
    </>
  );
}

function LearnPage({ day, completed, onBack, onSelectDay, onComplete }: { day: number; completed: boolean; onBack: () => void; onSelectDay: (day: number) => void; onComplete: () => void; }) {
  const lesson = lessons.find((l) => l.day === day) ?? lessons[0];
  return (
    <>
      <PageHeader title="Aprender" onBack={onBack} />
      <div className="picker-row">{lessons.slice(Math.max(0, day - 3), Math.min(30, day + 2)).map((l) => <button key={l.day} className={"day-chip" + (l.day === day ? " selected" : "")} onClick={() => onSelectDay(l.day)}>{l.day}</button>)}</div>
      <section className="lesson-header">
        <span>Semana {lesson.week} · Dia {lesson.day}</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.objective}</p>
        <SpeechControl text={[lesson.title, lesson.objective, ...lesson.blocks].join(". ")} />
      </section>
      <section className="lesson-content">
        {lesson.blocks.map((block, i) => <article className="content-card" key={i}><div className="number">{String(i + 1).padStart(2, "0")}</div><p>{block}</p></article>)}
      </section>
      <section className="exercise-card">
        <div className="section-kicker">EXERCÍCIO DO DIA</div>
        <h2>{lesson.exercise}</h2>
        <div className="exercise-tip"><Timer size={17} /> Tenta fazer isto em menos de 2 minutos.</div>
        <button className={"primary-button wide" + (completed ? " done" : "")} onClick={onComplete}>{completed ? <><Check size={17} /> Lição concluída</> : <>Marcar como concluída <Check size={17} /></>}</button>
      </section>
    </>
  );
}

function TrainPage({ day, onBack, onFinished }: { day: number; onBack: () => void; onFinished: (training: Training) => void; }) {
  const lesson = lessons.find((l) => l.day === day) ?? lessons[0];
  const [status, setStatus] = useState<"idle" | "recording" | "ready" | "result">("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState("");
  const [result, setResult] = useState<Training | null>(null);
  const [error, setError] = useState("");
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    mediaRef.current?.stream.getTracks().forEach((t) => t.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  async function startRecording() {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("O teu navegador não permite gravação de áudio.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        setStatus("ready");
      };
      mediaRef.current = recorder;
      recorder.start();
      setSeconds(0);
      setStatus("recording");
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError("Não foi possível aceder ao microfone. Permite o acesso e tenta novamente.");
    }
  }

  function stopRecording() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }

  function resetRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl("");
    setSeconds(0);
    setStatus("idle");
    setResult(null);
  }

  function submitTraining() {
    const duration = seconds;
    const demoScore = Math.min(92, Math.max(58, 58 + Math.round(duration / 3)));
    const training: Training = { id: crypto.randomUUID(), day, duration, score: demoScore, createdAt: new Date().toISOString(), demo: true };
    setResult(training);
    setStatus("result");
    onFinished(training);
  }

  return (
    <>
      <PageHeader title="Treinar" onBack={onBack} />
      <section className="training-card">
        <div className="section-kicker">EXERCÍCIO · DIA {day}</div>
        <h1>{lesson.title}</h1>
        <p>{lesson.exercise}</p>
        {status === "idle" && <button className="record-main" onClick={startRecording}><Mic size={28} /> <span>Começar gravação</span></button>}
        {status === "recording" && <div className="recording-state"><div className="pulse-dot" /><strong>{formatDuration(seconds)}</strong><span>A gravar...</span><button className="stop-button" onClick={stopRecording}><Square size={18} /> Parar</button></div>}
        {status === "ready" && <div className="ready-state"><audio controls src={audioUrl} className="audio-player" /><div className="button-row"><button className="secondary-button" onClick={resetRecording}><RotateCcw size={16} /> Gravar de novo</button><button className="primary-button" onClick={submitTraining}>Enviar para análise</button></div></div>}
        {status === "result" && result && (
          <div className="result-card">
            <div className="demo-label">MODO DE DEMONSTRAÇÃO</div>
            <div className="score-circle"><strong>{result.score}</strong><span>/100</span></div>
            <p className="result-title">Sessão registada</p>
            <p className="muted">Duração: {formatDuration(result.duration)}. A análise por IA será ligada nesta camada posteriormente.</p>
            <div className="metric-grid">
              {[
                ["Clareza", result.score - 2],
                ["Ritmo", result.score + 1],
                ["Confiança", result.score - 4],
                ["Pausas", result.score + 3],
              ].map(([label, score]) => <div className="metric-card" key={label as string}><span>{label}</span><strong>{Math.min(100, Number(score))}</strong></div>)}
            </div>
            <SpeechControl text={"A tua sessão foi registada. Continua a treinar com foco no teu exercício do dia."} />
            <button className="primary-button wide" onClick={onBack}>Voltar ao início</button>
          </div>
        )}
        {error && <div className="error-box">{error}</div>}
      </section>
    </>
  );
}

function CoachPage({ messages, onBack, onMessage }: { messages: AppState["coachMessages"]; onBack: () => void; onMessage: (message: AppState["coachMessages"][number]) => void; }) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  function send() {
    const text = input.trim();
    if (!text) return;
    onMessage({ role: "user", content: text });
    setInput("");
    setTyping(true);
    window.setTimeout(() => {
      const lower = text.toLowerCase();
      let answer = "Vamos simplificar isso. Diz a ideia principal numa frase, depois acrescenta um exemplo e termina com uma conclusão.";
      if (lower.includes("nervos") || lower.includes("medo") || lower.includes("timid")) {
        answer = "Quando sentires o nervosismo, não tentes eliminá-lo à força. Faz uma expiração mais longa, abranda a primeira frase e concentra-te na mensagem que queres transmitir.";
      } else if (lower.includes("entrevista")) {
        answer = "Numa entrevista, responde primeiro ao que foi perguntado. Depois dá um exemplo concreto e fecha com o resultado ou aprendizagem.";
      } else if (lower.includes("apresent") || lower.includes("public")) {
        answer = "Antes da apresentação, define uma mensagem principal, três palavras-chave e a primeira frase. Depois pratica em voz alta, não apenas mentalmente.";
      }
      onMessage({ role: "assistant", content: answer });
      setTyping(false);
    }, 500);
  }

  return (
    <>
      <PageHeader title="Treinador" onBack={onBack} />
      <div className="coach-banner"><div className="coach-avatar"><Bot size={22} /></div><div><strong>Treinador de comunicação</strong><span>Modo local · IA segura pode ser ligada depois</span></div></div>
      <section className="chat">
        {messages.map((m, i) => <div key={i} className={"message-row " + m.role}><div className="message-bubble"><p>{m.content}</p>{m.role === "assistant" && <SpeechControl text={m.content} />}</div></div>)}
        {typing && <div className="message-row assistant"><div className="message-bubble typing"><span /><span /><span /></div></div>}
      </section>
      <div className="chat-input"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreve a tua dúvida..." /><button className="primary-button" onClick={send}>Enviar</button></div>
    </>
  );
}

function LibraryPage({ onBack, onOpen }: { onBack: () => void; onOpen: (day: number) => void; }) {
  const weeks = Array.from({ length: 5 }, (_, i) => lessons.filter((l) => l.week === i + 1));
  return (
    <>
      <PageHeader title="Biblioteca" onBack={onBack} />
      <div className="library-intro"><p>As 30 lições do programa, organizadas por semana.</p></div>
      {weeks.filter((w) => w.length).map((week, index) => <section className="week-section" key={index}><div className="week-title"><span>Semana {index + 1}</span><strong>{week.length} lições</strong></div>{week.map((lesson) => <button key={lesson.day} className="lesson-list-item" onClick={() => onOpen(lesson.day)}><div className="day-mini">D{lesson.day}</div><div><strong>{lesson.title}</strong><span>{lesson.objective}</span></div><ChevronRight size={17} /></button>)}</section>)}
    </>
  );
}

function ProgressPage({ state, averageScore, progress, onBack }: { state: AppState; averageScore: number; progress: number; onBack: () => void; }) {
  return (
    <>
      <PageHeader title="Progresso" onBack={onBack} />
      <section className="progress-hero"><div><span className="muted">Programa</span><h1>{progress}% concluído</h1><p>Dia {state.currentDay} de 30</p></div><div className="big-ring"><strong>{averageScore}</strong><span>média</span></div></section>
      <section className="stats-grid two"><Stat icon={Flame} value={String(state.streak)} label="sequência" /><Stat icon={Trophy} value={String(state.trainings.length)} label="treinos" /></section>
      <section className="history-card"><div className="panel-title-row"><h2>Histórico</h2><span className="muted">{state.trainings.length} sessões</span></div>{state.trainings.length === 0 ? <div className="empty-state">Ainda não tens treinos registados. Faz o treino de hoje para começares.</div> : state.trainings.slice(0, 8).map((t) => <div className="history-row" key={t.id}><div><strong>Dia {t.day}</strong><span>{new Date(t.createdAt).toLocaleDateString("pt-PT")} · {formatDuration(t.duration)}</span></div><strong>{t.score}/100</strong></div>)}</section>
    </>
  );
}

function ProfilePage({ state, onBack, onSave }: { state: AppState; onBack: () => void; onSave: (name: string) => void; }) {
  const [name, setName] = useState(state.name);
  return (
    <>
      <PageHeader title="Perfil" onBack={onBack} />
      <section className="profile-card"><div className="profile-avatar"><UserRound size={28} /></div><h1>O teu perfil</h1><p className="muted">Personaliza a forma como o app te recebe.</p><label>Nome<input value={name} onChange={(e) => setName(e.target.value)} /></label><button className="primary-button wide" onClick={() => { onSave(name.trim() || "Utilizador"); onBack(); }}>Guardar alterações</button></section>
      <section className="settings-card"><div className="setting-row"><div><strong>Áudio das lições</strong><span>Usa a voz do navegador em pt-PT.</span></div><Volume2 size={19} /></div><div className="setting-row"><div><strong>Dados locais</strong><span>O progresso desta primeira versão fica guardado neste dispositivo.</span></div><Settings size={19} /></div></section>
    </>
  );
}

function PageHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return <div className="page-header"><button className="icon-button" onClick={onBack} aria-label="Voltar"><ArrowLeft size={20} /></button><h1>{title}</h1><div /></div>;
}

export default App;
