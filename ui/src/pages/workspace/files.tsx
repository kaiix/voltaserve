import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Box,
  Center,
  HStack,
  Stack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react'
import {
  PagePagination,
  Spinner,
  usePagePagination,
  variables,
} from '@koupr/ui'
import { Helmet } from 'react-helmet-async'
import FileAPI from '@/client/api/file'
import WorkspaceAPI from '@/client/api/workspace'
import { swrConfig } from '@/client/options'
import Path from '@/components/common/path'
import Copy from '@/components/file/copy'
import Create from '@/components/file/create'
import Delete from '@/components/file/delete'
import List from '@/components/file/list'
import Move from '@/components/file/move'
import Rename from '@/components/file/rename'
import Sharing from '@/components/file/sharing'
import Toolbar from '@/components/file/toolbar'
import { decodeQuery } from '@/helpers/query'
import { filesPaginationStorage } from '@/infra/pagination'
import { listUpdated } from '@/store/entities/files'
import { useAppDispatch, useAppSelector } from '@/store/hook'
import { selectionUpdated } from '@/store/ui/files'

const PAGINATION_STEP = 21

const WorkspaceFilesPage = () => {
  const navigate = useNavigate()
  const { id, fileId } = useParams()
  const [searchParams] = useSearchParams()
  const query = decodeQuery(searchParams.get('q') as string)
  const dispatch = useAppDispatch()
  const sortBy = useAppSelector((state) => state.ui.files.sortBy)
  const sortOrder = useAppSelector((state) => state.ui.files.sortOrder)
  const iconScale = useAppSelector((state) => state.ui.files.iconScale)
  const borderColor = useColorModeValue('gray.300', 'gray.600')
  const { data: workspace } = WorkspaceAPI.useGetById(id, swrConfig())
  const { page, size, steps, handlePageChange, setSize } = usePagePagination({
    navigate,
    location,
    storage: filesPaginationStorage(),
    steps: [
      PAGINATION_STEP,
      PAGINATION_STEP * 2,
      PAGINATION_STEP * 4,
      PAGINATION_STEP * 5,
    ],
  })
  const {
    data: list,
    error,
    isLoading,
  } = FileAPI.useList(
    fileId!,
    {
      size,
      page,
      sortBy,
      sortOrder,
      query: query ? { text: query } : undefined,
    },
    swrConfig(),
  )
  const hasPagination = list && list.totalPages > 1

  useEffect(() => {
    if (list) {
      dispatch(listUpdated(list))
    }
  }, [list, dispatch])

  return (
    <>
      <Helmet>{workspace && <title>{workspace.name}</title>}</Helmet>
      <Stack
        spacing={variables.spacingLg}
        w="100%"
        overflow="hidden"
        flexGrow={1}
      >
        {workspace && fileId ? (
          <Path
            rootId={workspace.rootId}
            fileId={fileId}
            maxCharacters={30}
            onClick={(fileId) =>
              navigate(`/workspace/${workspace.id}/file/${fileId}`)
            }
          />
        ) : null}
        <Toolbar list={list} />
        <VStack
          flexGrow={1}
          overflowY="auto"
          overflowX="hidden"
          spacing={variables.spacing}
        >
          <Box
            w="100%"
            overflowY="auto"
            overflowX="hidden"
            borderTop="1px solid"
            borderTopColor={borderColor}
            borderBottom={hasPagination ? '1px solid' : undefined}
            borderBottomColor={hasPagination ? borderColor : undefined}
            pt={variables.spacing}
            flexGrow={1}
            onClick={() => dispatch(selectionUpdated([]))}
          >
            {isLoading ? (
              <Center h="100%">
                <Spinner />
              </Center>
            ) : null}
            {list && !error ? <List list={list} scale={iconScale} /> : null}
          </Box>
          {hasPagination ? (
            <HStack alignSelf="end" pb={variables.spacing}>
              <PagePagination
                totalPages={list.totalPages}
                page={page}
                size={size}
                steps={steps}
                handlePageChange={handlePageChange}
                setSize={setSize}
              />
            </HStack>
          ) : null}
        </VStack>
      </Stack>
      {list ? <Sharing list={list} /> : null}
      <Move />
      <Copy />
      <Create />
      <Delete />
      <Rename />
    </>
  )
}

export default WorkspaceFilesPage
