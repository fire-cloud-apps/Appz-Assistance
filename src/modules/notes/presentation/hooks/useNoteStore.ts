import { create } from 'zustand'

interface NoteUIState {
  selectedFolderId: string | null
  selectedNoteId: string | null
  searchQuery: string
  isCreateFolderModalOpen: boolean
  isCreateNoteModalOpen: boolean
  isEditFolderModalOpen: boolean
  isEditNoteModalOpen: boolean
  isDeleteFolderModalOpen: boolean
  isDeleteNoteModalOpen: boolean
  editingFolderId: string | null
  editingNoteId: string | null
  deleteFolderId: string | null
  deleteFolderName: string | null
  deleteNoteId: string | null
  deleteNoteTitle: string | null

  setSelectedFolder: (id: string | null) => void
  setSelectedNote: (id: string | null) => void
  setSearchQuery: (query: string) => void
  
  openCreateFolderModal: () => void
  closeCreateFolderModal: () => void
  openCreateNoteModal: () => void
  closeCreateNoteModal: () => void
  openEditFolderModal: (folderId: string) => void
  closeEditFolderModal: () => void
  openEditNoteModal: (noteId: string) => void
  closeEditNoteModal: () => void
  openDeleteFolderModal: (folderId: string, folderName: string) => void
  closeDeleteFolderModal: () => void
  openDeleteNoteModal: (noteId: string, noteTitle: string) => void
  closeDeleteNoteModal: () => void
  
  reset: () => void
}

export const useNoteStore = create<NoteUIState>((set) => ({
  selectedFolderId: null,
  selectedNoteId: null,
  searchQuery: '',
  isCreateFolderModalOpen: false,
  isCreateNoteModalOpen: false,
  isEditFolderModalOpen: false,
  isEditNoteModalOpen: false,
  isDeleteFolderModalOpen: false,
  isDeleteNoteModalOpen: false,
  editingFolderId: null,
  editingNoteId: null,
  deleteFolderId: null,
  deleteFolderName: null,
  deleteNoteId: null,
  deleteNoteTitle: null,

  setSelectedFolder: (id) => set({ selectedFolderId: id }),
  setSelectedNote: (id) => set({ selectedNoteId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  openCreateFolderModal: () => set({ isCreateFolderModalOpen: true }),
  closeCreateFolderModal: () => set({ isCreateFolderModalOpen: false }),
  
  openCreateNoteModal: () => set({ isCreateNoteModalOpen: true }),
  closeCreateNoteModal: () => set({ isCreateNoteModalOpen: false }),
  
  openEditFolderModal: (folderId) => set({ 
    isEditFolderModalOpen: true, 
    editingFolderId: folderId 
  }),
  closeEditFolderModal: () => set({ 
    isEditFolderModalOpen: false, 
    editingFolderId: null 
  }),
  
  openEditNoteModal: (noteId) => set({ 
    isEditNoteModalOpen: true, 
    editingNoteId: noteId 
  }),
  closeEditNoteModal: () => set({ 
    isEditNoteModalOpen: false, 
    editingNoteId: null 
  }),
  
  openDeleteFolderModal: (folderId, folderName) => set({ 
    isDeleteFolderModalOpen: true, 
    deleteFolderId: folderId,
    deleteFolderName: folderName
  }),
  closeDeleteFolderModal: () => set({ 
    isDeleteFolderModalOpen: false, 
    deleteFolderId: null,
    deleteFolderName: null
  }),
  
  openDeleteNoteModal: (noteId, noteTitle) => set({ 
    isDeleteNoteModalOpen: true, 
    deleteNoteId: noteId,
    deleteNoteTitle: noteTitle
  }),
  closeDeleteNoteModal: () => set({ 
    isDeleteNoteModalOpen: false, 
    deleteNoteId: null,
    deleteNoteTitle: null
  }),

  reset: () =>
    set({
      selectedFolderId: null,
      selectedNoteId: null,
      searchQuery: '',
      isCreateFolderModalOpen: false,
      isCreateNoteModalOpen: false,
      isEditFolderModalOpen: false,
      isEditNoteModalOpen: false,
      isDeleteFolderModalOpen: false,
      isDeleteNoteModalOpen: false,
      editingFolderId: null,
      editingNoteId: null,
      deleteFolderId: null,
      deleteFolderName: null,
      deleteNoteId: null,
      deleteNoteTitle: null,
    }),
}))
