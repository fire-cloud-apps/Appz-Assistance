import { create } from 'zustand'

interface TaskUIState {
  selectedTaskId: string | null
  expandedTaskIds: string[]
  isCreateModalOpen: boolean
  isEditModalOpen: boolean
  isSubtaskModalOpen: boolean
  isDeleteModalOpen: boolean
  deleteTaskId: string | null
  deleteTaskTitle: string | null

  setSelectedTaskId: (id: string | null) => void
  toggleExpandedTask: (id: string) => void
  expandTask: (id: string) => void
  collapseTask: (id: string) => void
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: () => void
  closeEditModal: () => void
  openSubtaskModal: () => void
  closeSubtaskModal: () => void
  openDeleteModal: (taskId: string, taskTitle: string) => void
  closeDeleteModal: () => void
  reset: () => void
}

export const useTaskStore = create<TaskUIState>((set) => ({
  selectedTaskId: null,
  expandedTaskIds: [],
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isSubtaskModalOpen: false,
  isDeleteModalOpen: false,
  deleteTaskId: null,
  deleteTaskTitle: null,

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

  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),

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

  reset: () =>
    set({
      selectedTaskId: null,
      expandedTaskIds: [],
      isCreateModalOpen: false,
      isEditModalOpen: false,
      isSubtaskModalOpen: false,
      isDeleteModalOpen: false,
      deleteTaskId: null,
      deleteTaskTitle: null,
    }),
}))
