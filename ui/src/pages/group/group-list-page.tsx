// Copyright 2023 Anass Bouassaba.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { useEffect } from 'react'
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom'
import { Heading, Link as ChakraLink, Avatar, Badge } from '@chakra-ui/react'
import {
  DataTable,
  PagePagination,
  RelativeDate,
  SectionError,
  SectionPlaceholder,
  SectionSpinner,
  Text,
  usePagePagination,
} from '@koupr/ui'
import cx from 'classnames'
import { Helmet } from 'react-helmet-async'
import GroupAPI, { SortOrder } from '@/client/api/group'
import { swrConfig } from '@/client/options'
import { CreateGroupButton } from '@/components/app-bar/app-bar-buttons'
import { groupPaginationStorage } from '@/infra/pagination'
import { decodeQuery } from '@/lib/helpers/query'
import { useAppDispatch } from '@/store/hook'
import { mutateUpdated } from '@/store/ui/groups'

const GroupListPage = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const query = decodeQuery(searchParams.get('q') as string)
  const { page, size, steps, setPage, setSize } = usePagePagination({
    navigateFn: navigate,
    searchFn: () => location.search,
    storage: groupPaginationStorage(),
  })
  const {
    data: list,
    error: listError,
    isLoading: isListLoading,
    mutate,
  } = GroupAPI.useList(
    { query, page, size, sortOrder: SortOrder.Desc },
    swrConfig(),
  )
  const isListError = !list && listError
  const isListEmpty = list && !listError && list.totalElements === 0
  const isListReady = list && !listError && list.totalElements > 0

  useEffect(() => {
    mutate().then()
  }, [query, page, size, mutate])

  useEffect(() => {
    if (mutate) {
      dispatch(mutateUpdated(mutate))
    }
  }, [mutate, dispatch])

  return (
    <>
      <Helmet>
        <title>Groups</title>
      </Helmet>
      <div className={cx('flex', 'flex-col', 'gap-3.5', 'pb-3.5')}>
        <Heading className={cx('text-heading')}>Groups</Heading>
        {isListLoading ? <SectionSpinner /> : null}
        {isListError ? <SectionError text="Failed to load groups." /> : null}
        {isListEmpty ? (
          <SectionPlaceholder
            text="There are no groups."
            content={<CreateGroupButton />}
          />
        ) : null}
        {isListReady ? (
          <DataTable
            items={list.data}
            columns={[
              {
                title: 'Name',
                renderCell: (g) => (
                  <div
                    className={cx(
                      'flex',
                      'flex-row',
                      'items-center',
                      'gap-1.5',
                    )}
                  >
                    <Avatar
                      name={g.name}
                      size="sm"
                      className={cx('w-[40px]', 'h-[40px]')}
                    />
                    <ChakraLink
                      as={Link}
                      to={`/group/${g.id}/member`}
                      className={cx('no-underline')}
                    >
                      <Text noOfLines={1}>{g.name}</Text>
                    </ChakraLink>
                  </div>
                ),
              },
              {
                title: 'Organization',
                renderCell: (g) => (
                  <ChakraLink
                    as={Link}
                    to={`/organization/${g.organization.id}/member`}
                    className={cx('no-underline')}
                  >
                    <Text noOfLines={1}>{g.organization.name}</Text>
                  </ChakraLink>
                ),
              },
              {
                title: 'Permission',
                renderCell: (g) => <Badge>{g.permission}</Badge>,
              },
              {
                title: 'Date',
                renderCell: (g) => (
                  <RelativeDate date={new Date(g.createTime)} />
                ),
              },
            ]}
            pagination={
              list.totalPages > 1 ? (
                <PagePagination
                  totalElements={list.totalElements}
                  totalPages={list.totalPages}
                  page={page}
                  size={size}
                  steps={steps}
                  setPage={setPage}
                  setSize={setSize}
                />
              ) : undefined
            }
          />
        ) : null}
      </div>
    </>
  )
}

export default GroupListPage
