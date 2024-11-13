// Copyright 2024 Mateusz Kaźmierczak.
//
// Use of this software is governed by the Business Source License
// included in the file licenses/BSL.txt.
//
// As of the Change Date specified in that file, in accordance with
// the Business Source License, use of this software will be governed
// by the GNU Affero General Public License v3.0 only, included in the file
// licenses/AGPL.txt.
import { useCallback, useState } from 'react'
import {
  useLocation,
  useNavigate,
  useSearchParams,
  Link,
} from 'react-router-dom'
import { Avatar, Heading, Link as ChakraLink } from '@chakra-ui/react'
import {
  DataTable,
  IconEdit,
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
import ConsoleAPI, { ConsoleOrganization } from '@/client/console/console'
import { swrConfig } from '@/client/options'
import ConsoleRenameModal from '@/components/console/console-rename-modal'
import { consoleOrganizationsPaginationStorage } from '@/infra/pagination'
import { decodeQuery } from '@/lib/helpers/query'

const ConsolePanelOrganizations = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const query = decodeQuery(searchParams.get('q') as string)
  const { page, size, steps, setPage, setSize } = usePagePagination({
    navigateFn: navigate,
    searchFn: () => location.search,
    storage: consoleOrganizationsPaginationStorage(),
  })
  const [isConfirmRenameOpen, setIsConfirmRenameOpen] = useState(false)
  const [currentName, setCurrentName] = useState<string>('')
  const [organizationId, setOrganizationId] = useState<string>()
  const {
    data: list,
    error: listError,
    isLoading: isListLoading,
    mutate,
  } = ConsoleAPI.useListOrSearchObject<ConsoleOrganization>(
    'organization',
    { page, size, query },
    swrConfig(),
  )
  const isListError = !list && listError
  const isListEmpty = list && !listError && list.totalElements === 0
  const isListReady = list && !listError && list.totalElements > 0

  const renameRequest = useCallback(
    async (name: string) => {
      if (organizationId) {
        await ConsoleAPI.renameObject(
          { id: organizationId, name },
          'organization',
        )
        await mutate()
      }
    },
    [organizationId],
  )

  return (
    <>
      <Helmet>
        <title>Organizations</title>
      </Helmet>
      <div className={cx('flex', 'flex-col', 'gap-3.5', 'pb-3.5')}>
        <Heading className={cx('text-heading')}>Organizations</Heading>
        {isListLoading ? <SectionSpinner /> : null}
        {isListError ? (
          <SectionError text="Failed to load organizations." />
        ) : null}
        {isListEmpty ? (
          <SectionPlaceholder text="There are no organizations." />
        ) : null}
        {isListReady ? (
          <DataTable
            items={list.data}
            columns={[
              {
                title: 'Name',
                renderCell: (organization) => (
                  <div
                    className={cx(
                      'flex',
                      'flex-row',
                      'gap-1.5',
                      'items-center',
                    )}
                  >
                    <Avatar
                      name={organization.name}
                      size="sm"
                      className={cx('w-[40px]', 'h-[40px]')}
                    />

                    <ChakraLink
                      as={Link}
                      to={`/console/organizations/${organization.id}`}
                      className={cx('no-underline')}
                    >
                      <Text noOfLines={1}>{organization.name}</Text>
                    </ChakraLink>
                  </div>
                ),
              },
              {
                title: 'Created',
                renderCell: (organization) => (
                  <RelativeDate date={new Date(organization.createTime)} />
                ),
              },
              {
                title: 'Updated',
                renderCell: (organization) => (
                  <RelativeDate date={new Date(organization.updateTime)} />
                ),
              },
            ]}
            actions={[
              {
                label: 'Edit Name',
                icon: <IconEdit />,
                onClick: async (organization) => {
                  setCurrentName(organization.name)
                  setOrganizationId(organization.id)
                  setIsConfirmRenameOpen(true)
                },
              },
            ]}
            pagination={
              list.totalPages > 1 ? (
                <PagePagination
                  totalElements={list.totalElements}
                  totalPages={Math.ceil(list.totalElements / size)}
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
      <ConsoleRenameModal
        currentName={currentName}
        isOpen={isConfirmRenameOpen}
        onClose={() => setIsConfirmRenameOpen(false)}
        onRequest={renameRequest}
      />
    </>
  )
}

export default ConsolePanelOrganizations
