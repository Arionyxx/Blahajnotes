import { useEffect, useMemo } from 'react';
import { useEditor as useTipTapEditor, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { useStore } from '../store/useStore';
import { debounce } from 'lodash';

const lowlight = createLowlight(common);

export const useEditor = () => {
  const { selectedNote, updateNoteContent } = useStore();

  const debouncedSave = useMemo(
    () =>
      debounce((content: string) => {
        const currentNote = useStore.getState().selectedNote;
        if (currentNote) {
           window.fileSystem.saveNote({
            ...currentNote,
            content,
            updatedAt: new Date().toISOString()
          });
        }
      }, 500),
    []
  );

  const editor = useTipTapEditor({
    extensions: [
      StarterKit.configure({
          codeBlock: false, // We use CodeBlockLowlight
      }),
      Link.configure({
          openOnClick: false,
      }),
      Image,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Extension.create({
        name: 'saveShortcut',
        addKeyboardShortcuts() {
          return {
            'Mod-s': () => {
              const { selectedNote } = useStore.getState();
              if (selectedNote) {
                 window.fileSystem.saveNote({
                      ...selectedNote,
                      content: this.editor.getHTML(),
                      updatedAt: new Date().toISOString()
                 });
              }
              return true;
            },
          }
        },
      }),
    ],
    content: selectedNote?.content || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      updateNoteContent(html); // Update store immediately
      debouncedSave(html); // Trigger debounced save
    },
  });

  // Update editor content if selectedNote changes externally (e.g. loading a different note)
  useEffect(() => {
    if (editor && selectedNote && editor.getHTML() !== selectedNote.content) {
        editor.commands.setContent(selectedNote.content);
    }
  }, [selectedNote, editor]);

  return editor;
};
