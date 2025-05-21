'use client';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef
} from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

export type RichTextEditorHandle = {
  getContent: () => string;
};

export interface RichTextEditorProps {
  /** HTML inicial para carregar no editor */
  initialContent?: string;
  /** dispara sempre que o usuário digitar algo */
  onChange?: (html: string) => void;
}

const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  RichTextEditorProps
>(({ initialContent = '', onChange }, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);

useEffect(() => {
  const container = containerRef.current;
  if (!container) return;

  // limpa instância antiga (se houver)
  container.innerHTML = '';

  // cria toolbar e editor
  const toolbar = document.createElement('div');
  toolbar.className = 'ql-toolbar ql-snow';
  // … construa aqui o innerHTML do toolbar …
  const editor = document.createElement('div');
  editor.style.height = '300px';
  container.append(toolbar, editor);

  // instancia o Quill
  const quill = new Quill(editor, {
    theme: 'snow',
    modules: { toolbar: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'image'],
          ['clean']
    ]
     },
    placeholder: 'Escreva alguma coisa…'
  });
  quillRef.current = quill;

  // carrega conteúdo inicial
  quill.clipboard.dangerouslyPasteHTML(initialContent);

  // dispara onChange a cada digitação
  quill.on('text-change', () => {
    onChange?.(quill.root.innerHTML);
  });

  return () => {
    // cleanup
    container.innerHTML = '';
    quillRef.current = null;
  };
}, [initialContent, onChange]);

  // expõe getContent() para o pai via ref
  useImperativeHandle(ref, () => ({
    getContent: () => quillRef.current?.root.innerHTML ?? ''
  }));

  return <div ref={containerRef} />;
});

RichTextEditor.displayName = 'RichTextEditor';
export default RichTextEditor;
