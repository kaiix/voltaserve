import { useCallback, useState } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import { useSWRConfig } from 'swr'
import cx from 'classnames'
import InvitationAPI, { Invitation } from '@/client/api/invitation'
import userToString from '@/helpers/user-to-string'

export type NewInvitationProps = {
  invitation: Invitation
}

const NotificationDrawerNewInvitationItem = ({
  invitation,
}: NewInvitationProps) => {
  const { mutate } = useSWRConfig()
  const toast = useToast()
  const [isAcceptLoading, setIsAcceptLoading] = useState(false)
  const [isDeclineLoading, setIsDeclineLoading] = useState(false)

  const handleAccept = useCallback(
    async (invitationId: string) => {
      try {
        setIsAcceptLoading(true)
        await InvitationAPI.accept(invitationId)
        mutate('/notifications')
        mutate('/invitations/get_incoming')
        mutate('/organizations')
        toast({
          title: 'Invitation accepted',
          status: 'success',
          isClosable: true,
        })
      } finally {
        setIsAcceptLoading(false)
      }
    },
    [mutate, toast],
  )

  const handleDecline = useCallback(
    async (invitationId: string) => {
      try {
        setIsDeclineLoading(true)
        await InvitationAPI.decline(invitationId)
        mutate('/notifications')
        mutate('/invitations/get_incoming')
        toast({
          title: 'Invitation declined',
          status: 'info',
          isClosable: true,
        })
      } finally {
        setIsDeclineLoading(false)
      }
    },
    [mutate, toast],
  )

  return (
    <div className={cx('flex', 'flex-col', 'gap-0.5')}>
      <div>
        You have been invited by{' '}
        <span className={cx('font-bold')}>
          {userToString(invitation.owner)}
        </span>{' '}
        to join the organization{' '}
        <span className={cx('font-bold')}>{invitation.organization.name}</span>
        .<br />
      </div>
      <div className={cx('flex', 'flex-row', 'gap-0.5', 'justify-end')}>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="blue"
          disabled={isAcceptLoading || isDeclineLoading}
          isLoading={isAcceptLoading}
          onClick={() => handleAccept(invitation.id)}
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          disabled={isDeclineLoading || isAcceptLoading}
          isLoading={isDeclineLoading}
          onClick={() => handleDecline(invitation.id)}
        >
          Decline
        </Button>
      </div>
    </div>
  )
}

export default NotificationDrawerNewInvitationItem
