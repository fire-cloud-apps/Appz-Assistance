import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { folderRepository, noteRepository } from '../../data/repositories'
import { Folder } from '../../data/models/Folder'
import { Note } from '../../data/models/Note'

export const folderKeys = {
  all: ['folders'] as const,
  lists: () => [...folderKeys.all, 'list'] as const,
  root: () => [...folderKeys.all, 'root'] as const,
  sub: (parentId: string) => [...folderKeys.all, 'sub', parentId] as const,
  details: () => [...folderKeys.all, 'detail'] as const,
  detail: (id: string) => [...folderKeys.details(), id] as const,
}

export function useRootFolders() {
  return useQuery<Folder[]>({
    queryKey: folderKeys.root(),
    queryFn: () => folderRepository.getRootFolders(),
  })
}

export function useSubFolders(parentId: string) {
  return useQuery<Folder[]>({
    queryKey: folderKeys.sub(parentId),
    queryFn: () => folderRepository.getSubFolders(parentId),
    enabled: !!parentId,
  })
}

export function useFolderById(folderId: string) {
  return useQuery<Folder | undefined>({
    queryKey: folderKeys.detail(folderId),
    queryFn: () => folderRepository.getFolderById(folderId),
    enabled: !!folderId,
  })
}

export function useCreateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folder: Folder) => folderRepository.createFolder(folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folder: Folder) => folderRepository.updateFolder(folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => folderRepository.deleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function useRestoreFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => folderRepository.restoreFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export function usePermanentlyDeleteFolder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (folderId: string) => folderRepository.permanentlyDeleteFolder(folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: folderKeys.all })
    },
  })
}

export const noteKeys = {
  all: ['notes'] as const,
  lists: () => [...noteKeys.all, 'list'] as const,
  byFolder: (folderId: string) => [...noteKeys.all, 'folder', folderId] as const,
  details: () => [...noteKeys.all, 'detail'] as const,
  detail: (id: string) => [...noteKeys.details(), id] as const,
  favorites: () => [...noteKeys.all, 'favorites'] as const,
  pinned: () => [...noteKeys.all, 'pinned'] as const,
  recent: () => [...noteKeys.all, 'recent'] as const,
  search: (term: string) => [...noteKeys.all, 'search', term] as const,
  trash: () => [...noteKeys.all, 'trash'] as const,
}

export function useNotesByFolder(folderId: string) {
  return useQuery<Note[]>({
    queryKey: noteKeys.byFolder(folderId),
    queryFn: () => noteRepository.getNotesByFolder(folderId),
    enabled: !!folderId,
  })
}

export function useNoteById(noteId: string) {
  return useQuery<Note | undefined>({
    queryKey: noteKeys.detail(noteId),
    queryFn: () => noteRepository.getNoteById(noteId),
    enabled: !!noteId,
  })
}

export function useFavoriteNotes() {
  return useQuery<Note[]>({
    queryKey: noteKeys.favorites(),
    queryFn: () => noteRepository.getFavoriteNotes(),
  })
}

export function usePinnedNotes() {
  return useQuery<Note[]>({
    queryKey: noteKeys.pinned(),
    queryFn: () => noteRepository.getPinnedNotes(),
  })
}

export function useRecentNotes(limit: number = 10) {
  return useQuery<Note[]>({
    queryKey: [...noteKeys.recent(), limit],
    queryFn: () => noteRepository.getRecentNotes(limit),
  })
}

export function useSearchNotes(searchTerm: string) {
  return useQuery<Note[]>({
    queryKey: noteKeys.search(searchTerm),
    queryFn: () => noteRepository.searchNotes(searchTerm),
    enabled: searchTerm.trim().length > 0,
  })
}

export function useDeletedNotes() {
  return useQuery<Note[]>({
    queryKey: noteKeys.trash(),
    queryFn: () => noteRepository.getDeletedNotes(),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: Note) => noteRepository.createNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (note: Note) => noteRepository.updateNote(note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => noteRepository.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function useRestoreNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => noteRepository.restoreNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function usePermanentlyDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (noteId: string) => noteRepository.permanentlyDeleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: noteKeys.all })
    },
  })
}

export function useNoteCountByFolder(folderId: string) {
  return useQuery<number>({
    queryKey: [...noteKeys.all, 'count', folderId],
    queryFn: () => noteRepository.getNoteCountByFolder(folderId),
    enabled: !!folderId,
  })
}
