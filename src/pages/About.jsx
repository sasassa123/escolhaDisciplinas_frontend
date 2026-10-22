import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../components/common/Button';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { useMeta } from '../contexts/contexts';

const STEPS = [
  {
    title: 'Ache a disciplina',
    text: 'Busque pelo nome ou pelo código, ou filtre por período e por obrigatória/optativa. Cada disciplina tem uma página só dela.',
  },
  {
    title: 'Veja como ela é na prática',
    text: 'Ementa, pré-requisitos e professores, junto com as notas de dificuldade e de carga de trabalho dadas por quem já cursou.',
  },
  {
    title: 'Estude pelo que já caiu',
    text: 'Provas antigas, resumos e listas resolvidas, filtráveis por semestre e professor. Os mais úteis sobem com os votos.',
  },
  {
    title: 'Pergunte a um veterano',
    text: 'Publique sua dúvida na página da disciplina. Quem tem selo de veterano nela é avisado, e a resposta fica para as próximas turmas.',
  },
];

const RULES = [
  'Só entra quem tem e-mail institucional confirmado. Assim, quem publica é aluno de verdade.',
  'Não envie livros, apostilas pagas ou qualquer material protegido por direito autoral.',
  'Avalie a disciplina, não a pessoa. Críticas ao método são bem-vindas; ataques pessoais, não.',
  'Avaliações vêm só de quem marcou a disciplina como cursada.',
  'Viu algo errado? Use “Denunciar”. A moderação revisa, decide e registra quem decidiu e quando.',
];

export default function About() {
  useDocumentTitle('Como funciona');
  const { meta } = useMeta();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <main className="page page--reading about">
      <header className="page-header">
        <p className="kicker">Como funciona</p>
        <h1 className="page-title">Um acervo que passa de turma para turma</h1>
        <p className="lead">
          A ementa oficial diz o que a disciplina cobre, mas não quanto tempo ela exige por semana, qual bibliografia
          realmente se usa ou o que cai na prova. Essa informação existe, só que presa na cabeça dos veteranos e em
          grupos que somem a cada turma. O acervo guarda tudo isso na página de cada disciplina.
        </p>
      </header>

      <ol className="steps">
        {STEPS.map((step, index) => (
          <li key={step.title} className="step">
            <span className="step__number">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h2 className="step__title">{step.title}</h2>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <section id="regras" className="prose-block rules">
        <h2 className="block-title">Regras da comunidade</h2>
        <ul>
          {RULES.map((rule) => <li key={rule}>{rule}</li>)}
        </ul>
      </section>

      <section className="prose-block">
        <h2 className="block-title">Sobre o projeto</h2>
        <p>
          O acervo atende {meta ? <>o curso de <strong>{meta.course}</strong> do <strong>{meta.institution}</strong></> : 'um único curso'} e
          foi desenvolvido pela equipe <strong>Gangue do Patinete</strong>: Leonardo de Avila, Matheus Pelissari, Pedro Gulin e
          Felippe Matias. Não é um canal oficial da coordenação — as informações vêm da própria comunidade.
        </p>
        <p>
          Integração com o sistema acadêmico, chat em tempo real e aplicativo para celular estão no backlog de evolução.
        </p>
      </section>

      <div className="about__cta">
        <Button to="/disciplinas">Explorar disciplinas</Button>
        <Button to="/cadastro" variant="secondary">Criar conta</Button>
      </div>
    </main>
  );
}
