import { useState, MouseEvent } from 'react'
import { useParams } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import { variables } from '@koupr/ui'
import { useSWRConfig } from 'swr'
import {
  DragCancelEvent,
  DragEndEvent,
  DragStartEvent,
  useDndMonitor,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core'
import FileAPI, { File, FileType, List } from '@/client/api/file'
import useFileListSearchParams from '@/hooks/use-file-list-params'
import store from '@/store/configure-store'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { hiddenUpdated, selectionUpdated } from '@/store/ui/files'
import Item from './item'

type ItemDraggableDroppableProps = {
  file: File
  scale: number
  onContextMenu?: (event: MouseEvent) => void
}

const ItemDraggableDroppable = ({
  file,
  scale,
  onContextMenu,
}: ItemDraggableDroppableProps) => {
  const { mutate } = useSWRConfig()
  const dispatch = useAppDispatch()
  const { fileId } = useParams()
  const [isVisible, setVisible] = useState(true)
  const selection = useAppSelector((state) => state.ui.files.selection)
  const {
    attributes,
    listeners,
    setNodeRef: setDraggableNodeRef,
  } = useDraggable({
    id: file.id,
  })
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    id: file.id,
  })
  const [isLoading, setIsLoading] = useState(false)
  const fileListSearchParams = useFileListSearchParams()

  useDndMonitor({
    onDragStart: (event: DragStartEvent) => {
      if (selection.includes(file.id) || event.active.id === file.id) {
        setVisible(false)
      }
    },
    onDragEnd: async (event: DragEndEvent) => {
      if (selection.includes(file.id) || event.active.id === file.id) {
        setVisible(true)
      }
      if (
        file.type === FileType.Folder &&
        file.id !== event.active.id &&
        !selection.includes(file.id) &&
        isOver
      ) {
        const idsToMove = [
          ...new Set<string>([...selection, event.active.id as string]),
        ]
        const list = store.getState().entities.files.list
        if (list) {
          await mutate<List>(`/files/${fileId}/list?${fileListSearchParams}`, {
            ...list,
            data: list.data.filter((e) => !idsToMove.includes(e.id)),
          })
        }
        dispatch(hiddenUpdated(idsToMove))
        setIsLoading(true)
        await FileAPI.move(file.id, { ids: idsToMove })
        await mutate<List>(`/files/${fileId}/list?${fileListSearchParams}`)
        setIsLoading(false)
        dispatch(hiddenUpdated([]))
        dispatch(selectionUpdated([]))
      }
    },
    onDragCancel: (event: DragCancelEvent) => {
      if (selection.includes(file.id) || event.active.id === file.id) {
        setVisible(true)
      }
    },
  })

  return (
    <>
      {file.type === FileType.File ? (
        <Box
          ref={setDraggableNodeRef}
          border="2px solid"
          borderColor="transparent"
          visibility={isVisible ? 'visible' : 'hidden'}
          _hover={{ outline: 'none' }}
          _focus={{ outline: 'none' }}
          {...listeners}
          {...attributes}
        >
          <Item file={file} scale={scale} onContextMenu={onContextMenu} />
        </Box>
      ) : null}
      {file.type === FileType.Folder ? (
        <Box
          ref={setDraggableNodeRef}
          border="2px solid"
          borderColor={isOver ? 'green.300' : 'transparent'}
          borderRadius={variables.borderRadiusSm}
          visibility={isVisible ? 'visible' : 'hidden'}
          _hover={{ outline: 'none' }}
          _focus={{ outline: 'none' }}
          {...listeners}
          {...attributes}
        >
          <Box ref={setDroppableNodeRef}>
            <Item
              file={file}
              scale={scale}
              isPresentational={isOver}
              isLoading={isLoading}
              onContextMenu={onContextMenu}
            />
          </Box>
        </Box>
      ) : null}
    </>
  )
}

export default ItemDraggableDroppable
