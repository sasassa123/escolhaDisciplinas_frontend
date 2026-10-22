import { useState } from 'react';
import Button from '../common/Button';
import Field from '../common/Field';
import ScalePicker from '../common/ScalePicker';
import { useMeta, useToast } from '../../contexts/contexts';
import { getErrorMessage, saveReview } from '../../services/api';
import { DIFFICULTY_LABELS, WORKLOAD_LABELS } from '../../utils/format';

const OTHER = '__outro__';

/**
 * Avaliação da disciplina: nota de dificuldade, nota de carga e comentário (RF05).
 * Serve tanto para criar quanto para editar a avaliação do usuário.
 */
export default function ReviewForm({ discipline, existing, onSaved, onCancel }) {
  const { meta } = useMeta();
  const toast = useToast();
  const knownProfessor = !existing || discipline.professors.includes(existing.professor);
  const [values, setValues] = useState({
    difficulty: existing?.difficulty || 0,
    workload: existing?.workload || 0,
    semester: existing?.semester || '',
    professor: existing ? (knownProfessor ? existing.professor : OTHER) : '',
    otherProfessor: existing && !knownProfessor ? existing.professor : '',
    comment: existing?.comment || '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSending, setIsSending] = useState(false);

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function submit(event) {
    event.preventDefault();
    const professor = values.professor === OTHER ? values.otherProfessor.trim() : values.professor;
    const next = {};
    if (!values.difficulty) next.difficulty = 'Escolha uma nota de dificuldade';
    if (!values.workload) next.workload = 'Escolha uma nota de carga de trabalho';
    if (!values.semester) next.semester = 'Informe quando cursou';
    if (!professor) next.professor = 'Informe o professor';
    if (values.comment.trim().length < 20) next.comment = 'Escreva pelo menos 20 caracteres — conte como foi na prática';
    setErrors(next);
    if (Object.keys(next).length) return;

    setIsSending(true);
    setFormError('');
    try {
      const saved = await saveReview(discipline.code, {
        difficulty: values.difficulty,
        workload: values.workload,
        semester: values.semester,
        professor,
        comment: values.comment.trim(),
      });
      toast.success(existing ? 'Avaliação atualizada.' : 'Obrigado! Sua avaliação já entrou nas médias.');
      onSaved(saved);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível salvar a avaliação.'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="form review-form" onSubmit={submit} noValidate>
      <ScalePicker
        legend="Quão difícil foi?"
        hint="Pense no conteúdo e nas provas, não no professor."
        labels={DIFFICULTY_LABELS}
        value={values.difficulty}
        onChange={(v) => set('difficulty', v)}
        error={errors.difficulty}
      />
      <ScalePicker
        legend="Quanto trabalho deu?"
        hint="Listas, trabalhos e estudo fora da aula, por semana."
        labels={WORKLOAD_LABELS}
        value={values.workload}
        onChange={(v) => set('workload', v)}
        error={errors.workload}
      />

      <div className="form__row">
        <Field label="Quando você cursou?" error={errors.semester}>
          {(props) => (
            <select {...props} value={values.semester} onChange={(e) => set('semester', e.target.value)}>
              <option value="">Escolha…</option>
              {meta?.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <Field label="Com qual professor?" error={errors.professor}>
          {(props) => (
            <select {...props} value={values.professor} onChange={(e) => set('professor', e.target.value)}>
              <option value="">Escolha…</option>
              {discipline.professors.map((p) => <option key={p} value={p}>{p}</option>)}
              <option value={OTHER}>Outro professor…</option>
            </select>
          )}
        </Field>
      </div>
      {values.professor === OTHER && (
        <Field label="Nome do professor" error={errors.professor}>
          {(props) => <input {...props} maxLength={80} value={values.otherProfessor} onChange={(e) => set('otherProfessor', e.target.value)} />}
        </Field>
      )}

      <Field
        label="Como foi na prática?"
        error={errors.comment}
        hint={`O que cai na prova, quanto tempo exige, o que você faria diferente. ${values.comment.trim().length}/1500`}
      >
        {(props) => (
          <textarea
            {...props}
            rows={5}
            maxLength={1500}
            placeholder="Ex.: As listas semanais tomam umas 6h. A P2 é bem mais difícil que a P1, comece a estudar cedo…"
            value={values.comment}
            onChange={(e) => set('comment', e.target.value)}
          />
        )}
      </Field>

      {formError && <p className="form__error" role="alert">{formError}</p>}
      <div className="form__actions">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSending}>{existing ? 'Salvar alterações' : 'Publicar avaliação'}</Button>
      </div>
    </form>
  );
}
