import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Box, Divider, HStack, IconButton, Stack, Text } from '@chakra-ui/react'
import {
  variables,
  IconEdit,
  IconExit,
  IconTrash,
  IconUserPlus,
  SectionSpinner,
} from '@koupr/ui'
import { Helmet } from 'react-helmet-async'
import OrganizationAPI from '@/client/api/organization'
import { geEditorPermission, geOwnerPermission } from '@/client/api/permission'
import { swrConfig } from '@/client/options'
import Delete from '@/components/organization/delete'
import EditName from '@/components/organization/edit-name'
import InviteMembers from '@/components/organization/invite-members'
import Leave from '@/components/organization/leave'

const Spacer = () => <Box flexGrow={1} />

const OrganizationSettingsPage = () => {
  const { id } = useParams()
  const { data: org, error } = OrganizationAPI.useGetById(id, swrConfig())
  const [isNameModalOpen, setIsNameModalOpen] = useState(false)
  const [isInviteMembersModalOpen, setIsInviteMembersModalOpen] =
    useState(false)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  if (error) {
    return null
  }

  if (!org) {
    return <SectionSpinner />
  }

  return (
    <>
      <Helmet>
        <title>{org.name}</title>
      </Helmet>
      <Stack spacing={variables.spacing} w="100%">
        <HStack spacing={variables.spacing}>
          <Text>Name</Text>
          <Spacer />
          <Text>{org.name}</Text>
          <IconButton
            icon={<IconEdit />}
            isDisabled={!geEditorPermission(org.permission)}
            aria-label=""
            onClick={() => {
              setIsNameModalOpen(true)
            }}
          />
        </HStack>
        <Divider />

        <HStack spacing={variables.spacing}>
          <Text>Invite members</Text>
          <Spacer />
          <IconButton
            icon={<IconUserPlus />}
            isDisabled={!geOwnerPermission(org.permission)}
            aria-label=""
            onClick={() => {
              setIsInviteMembersModalOpen(true)
            }}
          />
        </HStack>

        <HStack spacing={variables.spacing}>
          <Text>Leave</Text>
          <Spacer />
          <IconButton
            icon={<IconExit />}
            variant="solid"
            colorScheme="red"
            aria-label=""
            onClick={() => setIsLeaveModalOpen(true)}
          />
        </HStack>
        <Divider />
        <HStack spacing={variables.spacing}>
          <Text>Delete permanently</Text>
          <Spacer />
          <IconButton
            icon={<IconTrash />}
            variant="solid"
            colorScheme="red"
            isDisabled={!geEditorPermission(org.permission)}
            aria-label=""
            onClick={() => setIsDeleteModalOpen(true)}
          />
        </HStack>
        <EditName
          open={isNameModalOpen}
          organization={org}
          onClose={() => setIsNameModalOpen(false)}
        />
        <InviteMembers
          open={isInviteMembersModalOpen}
          id={org.id}
          onClose={() => setIsInviteMembersModalOpen(false)}
        />
        <Leave
          open={isLeaveModalOpen}
          id={org.id}
          onClose={() => setIsLeaveModalOpen(false)}
        />
        <Delete
          open={isDeleteModalOpen}
          organization={org}
          onClose={() => setIsDeleteModalOpen(false)}
        />
      </Stack>
    </>
  )
}

export default OrganizationSettingsPage
