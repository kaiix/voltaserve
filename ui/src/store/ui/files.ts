// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { KeyedMutator } from 'swr'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { List, SortBy, SortOrder } from '@/client/api/file'
import {
  loadFileSortBy,
  loadFileSortOrder,
  loadFileViewType,
  loadIconScale,
  saveFileSortBy,
  saveFileSortOrder,
  saveFileViewType,
  saveIconScale,
} from '@/local-storage'
import { FileViewType } from '@/types/file'

export type FilesState = {
  selection: string[]
  hidden: string[]
  loading: string[]
  isMultiSelectActive: boolean
  isRangeSelectActive: boolean
  isMoveModalOpen: boolean
  isCopyModalOpen: boolean
  isCreateModalOpen: boolean
  isDeleteModalOpen: boolean
  isRenameModalOpen: boolean
  isShareModalOpen: boolean
  isInfoModalOpen: boolean
  isContextMenuOpen: boolean
  isSelectionMode: boolean
  iconScale: number
  sortBy: SortBy
  sortOrder: SortOrder
  viewType: FileViewType
  mutate?: KeyedMutator<List | undefined>
}

const initialState: FilesState = {
  selection: [],
  hidden: [],
  loading: [],
  isMultiSelectActive: false,
  isRangeSelectActive: false,
  isMoveModalOpen: false,
  isCopyModalOpen: false,
  isCreateModalOpen: false,
  isDeleteModalOpen: false,
  isRenameModalOpen: false,
  isShareModalOpen: false,
  isInfoModalOpen: false,
  isContextMenuOpen: false,
  iconScale: loadIconScale() || 1,
  sortBy: loadFileSortBy() || SortBy.DateCreated,
  sortOrder: loadFileSortOrder() || SortOrder.Desc,
  viewType: loadFileViewType() || FileViewType.Grid,
  isSelectionMode: false,
}

const slice = createSlice({
  name: 'files',
  initialState,
  reducers: {
    selectionUpdated: (state, action: PayloadAction<string[]>) => {
      state.selection = action.payload
    },
    selectionAdded: (state, action: PayloadAction<string>) => {
      if (!state.selection.includes(action.payload)) {
        state.selection.push(action.payload)
      }
    },
    selectionRemoved: (state, action: PayloadAction<string>) => {
      state.selection = state.selection.filter((e) => e !== action.payload)
    },
    hiddenUpdated: (state, action: PayloadAction<string[]>) => {
      state.hidden = action.payload
    },
    loadingAdded: (state, action: PayloadAction<string[]>) => {
      state.loading.push(...action.payload)
    },
    loadingRemoved: (state, action: PayloadAction<string[]>) => {
      state.loading = state.loading.filter((e) => !action.payload.includes(e))
    },
    moveModalDidOpen: (state) => {
      state.isMoveModalOpen = true
    },
    copyModalDidOpen: (state) => {
      state.isCopyModalOpen = true
    },
    createModalDidOpen: (state) => {
      state.isCreateModalOpen = true
    },
    deleteModalDidOpen: (state) => {
      state.isDeleteModalOpen = true
    },
    renameModalDidOpen: (state) => {
      state.isRenameModalOpen = true
    },
    sharingModalDidOpen: (state) => {
      state.isShareModalOpen = true
    },
    infoModalDidOpen: (state) => {
      state.isInfoModalOpen = true
    },
    contextMenuDidOpen: (state) => {
      state.isContextMenuOpen = true
    },
    moveModalDidClose: (state) => {
      state.isMoveModalOpen = false
    },
    copyModalDidClose: (state) => {
      state.isCopyModalOpen = false
    },
    createModalDidClose: (state) => {
      state.isCreateModalOpen = false
    },
    deleteModalDidClose: (state) => {
      state.isDeleteModalOpen = false
    },
    renameModalDidClose: (state) => {
      state.isRenameModalOpen = false
    },
    sharingModalDidClose: (state) => {
      state.isShareModalOpen = false
    },
    infoModalDidClose: (state) => {
      state.isInfoModalOpen = false
    },
    contextMenuDidClose: (state) => {
      state.isContextMenuOpen = false
    },
    multiSelectKeyUpdated: (state, action: PayloadAction<boolean>) => {
      state.isMultiSelectActive = action.payload
    },
    rangeSelectKeyUpdated: (state, action: PayloadAction<boolean>) => {
      state.isRangeSelectActive = action.payload
    },
    iconScaleUpdated: (state, action: PayloadAction<number>) => {
      state.iconScale = action.payload
      saveIconScale(state.iconScale)
    },
    sortByUpdated: (state, action: PayloadAction<SortBy>) => {
      state.sortBy = action.payload
      saveFileSortBy(state.sortBy)
    },
    sortOrderToggled: (state) => {
      state.sortOrder =
        state.sortOrder === SortOrder.Asc ? SortOrder.Desc : SortOrder.Asc
      saveFileSortOrder(state.sortOrder)
    },
    viewTypeToggled: (state) => {
      state.viewType =
        state.viewType === FileViewType.Grid
          ? FileViewType.List
          : FileViewType.Grid
      saveFileViewType(state.viewType)
    },
    selectionModeToggled: (state) => {
      state.isSelectionMode = !state.isSelectionMode
    },
    mutateUpdated: (
      state,
      action: PayloadAction<KeyedMutator<List | undefined>>,
    ) => {
      state.mutate = action.payload
    },
  },
})

export const {
  selectionUpdated,
  selectionAdded,
  selectionRemoved,
  hiddenUpdated,
  loadingAdded,
  loadingRemoved,
  moveModalDidOpen,
  copyModalDidOpen,
  createModalDidOpen,
  deleteModalDidOpen,
  renameModalDidOpen,
  sharingModalDidOpen,
  infoModalDidOpen,
  contextMenuDidOpen,
  moveModalDidClose,
  copyModalDidClose,
  createModalDidClose,
  deleteModalDidClose,
  renameModalDidClose,
  sharingModalDidClose,
  infoModalDidClose,
  contextMenuDidClose,
  multiSelectKeyUpdated,
  rangeSelectKeyUpdated,
  iconScaleUpdated,
  sortByUpdated,
  sortOrderToggled,
  viewTypeToggled,
  selectionModeToggled,
  mutateUpdated,
} = slice.actions

export default slice.reducer
