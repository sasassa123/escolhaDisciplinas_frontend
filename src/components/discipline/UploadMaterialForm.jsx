import { useRef, useState } from 'react';
import Button from '../common/Button';
import Field from '../common/Field';
import Icon from '../common/Icon';
import { useMeta, useToast } from '../../contexts/contexts';
import { getErrorMessage, uploadMaterial } from '../../services/api';
import { fileToBase64, formatFileSize } from '../../utils/format';

const OTHER = '__outro__';
const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.gif,application/pdf,image/png,image/jpeg,image/webp,image/gif';

function titleFromFileName(name) {
  const title = name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  return title.charAt(0).toUpperCase() + title.slice(1);
}

/**
 * Envio de material (RF04/US04): arquivo (PDF/imagem) ou link, classificado
 * obrigatoriamente por tipo, semestre e professor, com limite de tamanho.
 */
export default function UploadMaterialForm({ discipline, onCreated, onCancel }) {
  const { meta } = useMeta();
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('file');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [values, setValues] = useState({
    title: '', description: '', type: '', semester: '', professor: '', otherProfessor: '', link: '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSending, setIsSending] = useState(false);

  const maxBytes = (meta?.maxUploadMB || 5) * 1024 * 1024;

  function set(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function pickFile(selected) {
    if (!selected) return;
    if (!meta?.allowedMimeTypes.includes(selected.type)) {
      setErrors((current) => ({ ...current, file: 'Formato não aceito. Envie PDF ou imagem (PNG, JPG, WEBP, GIF).' }));
      return;
    }
    if (selected.size > maxBytes) {
      setErrors((current) => ({ ...current, file: `Esse arquivo tem ${formatFileSize(selected.size)}. O limite é ${meta.maxUploadMB} MB.` }));
      return;
    }
    setFile(selected);
    setErrors((current) => ({ ...current, file: undefined }));
    if (!values.title) set('title', titleFromFileName(selected.name));
  }

  function validate() {
    const next = {};
    if (values.title.trim().length < 3) next.title = 'Dê um título com pelo menos 3 caracteres';
    if (!values.type) next.type = 'Escolha o tipo';
    if (!values.semester) next.semester = 'Escolha o semestre';
    const professor = values.professor === OTHER ? values.otherProfessor.trim() : values.professor;
    if (!professor) next.professor = 'Informe o professor';
    if (mode === 'file' && !file) next.file = 'Selecione o arquivo';
    if (mode === 'link' && !/^https?:\/\/\S+\.\S+/.test(values.link.trim())) next.link = 'Cole um link completo, começando com https://';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsSending(true);
    try {
      const payload = {
        title: values.title.trim(),
        description: values.description.trim(),
        type: values.type,
        semester: values.semester,
        professor: values.professor === OTHER ? values.otherProfessor.trim() : values.professor,
      };
      if (mode === 'link') payload.link = values.link.trim();
      else payload.file = { name: file.name, type: file.type, data: await fileToBase64(file) };

      const created = await uploadMaterial(discipline.code, payload);
      toast.success('Material publicado! Ele já aparece na disciplina e no seu perfil.');
      onCreated(created);
    } catch (error) {
      setFormError(getErrorMessage(error, 'Não foi possível enviar o material.'));
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="form" onSubmit={submit} noValidate>
      <div className="segmented segmented--full" role="group" aria-label="O que você vai enviar">
        <button type="button" className={mode === 'file' ? 'is-active' : ''} aria-pressed={mode === 'file'} onClick={() => setMode('file')}>
          <Icon name="file" /> Arquivo
        </button>
        <button type="button" className={mode === 'link' ? 'is-active' : ''} aria-pressed={mode === 'link'} onClick={() => setMode('link')}>
          <Icon name="link" /> Link
        </button>
      </div>

      {mode === 'file' ? (
        <div className={`field ${errors.file ? 'field--error' : ''}`}>
          <div
            className={`dropzone ${isDragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); pickFile(event.dataTransfer.files[0]); }}
          >
            {file ? (
              <div className="dropzone__file">
                <Icon name={file.type.startsWith('image/') ? 'image' : 'file'} />
                <span><strong>{file.name}</strong><small>{formatFileSize(file.size)}</small></span>
                <button type="button" className="text-action" onClick={() => { setFile(null); fileInputRef.current.value = ''; }}>Trocar</button>
              </div>
            ) : (
              <>
                <Icon name="upload" />
                <p><strong>Arraste o arquivo aqui</strong> ou <button type="button" className="text-action" onClick={() => fileInputRef.current.click()}>escolha no computador</button></p>
                <small>PDF ou imagem, até {meta?.maxUploadMB || 5} MB</small>
              </>
            )}
            <input ref={fileInputRef} type="file" accept={ACCEPT} className="visually-hidden" tabIndex={-1} onChange={(event) => pickFile(event.target.files[0])} aria-label="Arquivo do material" />
          </div>
          {errors.file && <p className="field__error">{errors.file}</p>}
        </div>
      ) : (
        <Field label="Link" error={errors.link} hint="Google Drive, YouTube, GitHub, site da disciplina…">
          {(props) => <input {...props} type="url" placeholder="https://" value={values.link} onChange={(e) => set('link', e.target.value)} />}
        </Field>
      )}

      <Field label="Título" error={errors.title}>
        {(props) => <input {...props} maxLength={120} placeholder="Ex.: P1 2025.2 com gabarito" value={values.title} onChange={(e) => set('title', e.target.value)} />}
      </Field>

      <div className="form__row form__row--3">
        <Field label="Tipo" error={errors.type}>
          {(props) => (
            <select {...props} value={values.type} onChange={(e) => set('type', e.target.value)}>
              <option value="">Escolha…</option>
              {meta?.materialTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          )}
        </Field>
        <Field label="Semestre" error={errors.semester}>
          {(props) => (
            <select {...props} value={values.semester} onChange={(e) => set('semester', e.target.value)}>
              <option value="">Escolha…</option>
              {meta?.semesters.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </Field>
        <Field label="Professor" error={errors.professor}>
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

      <Field label="Descrição" optional hint="O que tem no material? Está completo? Tem gabarito?">
        {(props) => <textarea {...props} rows={3} maxLength={600} value={values.description} onChange={(e) => set('description', e.target.value)} />}
      </Field>

      <p className="form__note">
        <Icon name="shield" /> Não envie livros ou conteúdo protegido por direito autoral. Materiais denunciados passam pela moderação.
      </p>

      {formError && <p className="form__error" role="alert">{formError}</p>}

      <div className="form__actions">
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" isLoading={isSending}><Icon name="upload" /> {isSending ? 'Enviando…' : 'Publicar material'}</Button>
      </div>
    </form>
  );
}
