import { create } from 'zustand'

interface TaskUIState {
  selectedTaskId: string | null
  expandedTaskIds: string[]
  isEditModalOpen: boolean
  isSubtaskModalOpen: boolean
  isDeleteModalOpen: boolean
  isArchiveModalOpen: boolean
  isCreateModalOpen: boolean
  deleteTaskId: string | null
  deleteTaskTitle: string | null
  archiveTaskId: string | null
  archiveTaskTitle: string | null

  setSelectedTaskId: (id: string | null) => void
  toggleExpandedTask: (id: string) => void
  expandTask: (id: string) => void
  collapseTask: (id: string) => void
  openEditModal: () => void
  closeEditModal: () => void
  openSubtaskModal: () => void
  closeSubtaskModal: () => void
  openDeleteModal: (taskId: string, taskTitle: string) => void
  closeDeleteModal: () => void
  openArchiveModal: (taskId: string, taskTitle: string) => void
  closeArchiveModal: () => void
  openCreateModal: () => void
  closeCreateModal: () => void
  reset: () => void
}

export const useTaskStore = create<TaskUIState>((set) => ({
  selectedTaskId: null,
  expandedTaskIds: [],
  isEditModalOpen: false,
  isSubtaskModalOpen: false,
  isDeleteModalOpen: false,
  isArchiveModalOpen: false,
  isCreateModalOpen: false,
  deleteTaskId: null,
  deleteTaskTitle: null,
  archiveTaskId: null,
  archiveTaskTitle: null,

  setSelectedTaskId: (id) => set({ selectedTaskId: id }),

  toggleExpandedTask: (id) =>
    set((state) => ({
      expandedTaskIds: state.expandedTaskIds.includes(id)
        ? state.expandedTaskIds.filter((taskId) => taskId !== id)
        : [...state.expandedTaskIds, id],
    })),

  expandTask: (id) =>
    set((state) => ({
      expandedTaskIds: state.expandedTaskIds.includes(id)
        ? state.expandedTaskIds
        : [...state.expandedTaskIds, id],
    })),

  collapseTask: (id) =>
    set((state) => ({
      expandedTaskIds: state.expandedTaskIds.filter((taskId) => taskId !== id),
    })),

  openEditModal: () => set({ isEditModalOpen: true }),
  closeEditModal: () => set({ isEditModalOpen: false }),

  openSubtaskModal: () => set({ isSubtaskModalOpen: true }),
  closeSubtaskModal: () => set({ isSubtaskModalOpen: false }),

  openDeleteModal: (taskId, taskTitle) => set({ 
    isDeleteModalOpen: true, 
    deleteTaskId: taskId, 
    deleteTaskTitle: taskTitle 
  }),
  closeDeleteModal: () => set({ 
    isDeleteModalOpen: false, 
    deleteTaskId: null, 
    deleteTaskTitle: null 
  }),

  openArchiveModal: (taskId, taskTitle) => set({
    isArchiveModalOpen: true,
    archiveTaskId: taskId,
    archiveTaskTitle: taskTitle,
  }),
  closeArchiveModal: () => set({
    isArchiveModalOpen: false,
    archiveTaskId: null,
    archiveTaskTitle: null,
  }),

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

  reset: () =>
    set({
      selectedTaskId: null,
      expandedTaskIds: [],
      isEditModalOpen: false,
      isSubtaskModalOpen: false,
      isDeleteModalOpen: false,
      isArchiveModalOpen: false,
      isCreateModalOpen: false,
      deleteTaskId: null,
      deleteTaskTitle: null,
      archiveTaskId: null,
      archiveTaskTitle: null,
    }),
}))
